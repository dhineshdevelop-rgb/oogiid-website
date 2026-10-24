# Website typography, button styling, and registration implementation plan

Current website flow: the marketing site now routes visitors to application signup/login. Its enquiry form and submission JavaScript have been removed. The following records the earlier implementation; backend endpoints remain outside this website change.

Historical status: implemented locally; production configuration/deployment and live email verification remain outstanding. See `../oogiid-api/WEBSITE_REGISTRATION_TEST_CHECKLIST.md` for method coverage and verification limits.

Implemented: self-hosted Inter, navy button palette and accessible states, live form/API contract, duplicate-email handling, origin/referrer policy, rate limiting, account/enquiry persistence, encrypted delivery queue, Gmail SMTP and Resend email adapters, bounded retries, administrative delivery status/recovery, migration V15, unit tests and documentation.

Production marketing URL: `https://dhineshdevelop-rgb.github.io/oogiid-website/`; configured origin: `https://dhineshdevelop-rgb.github.io`. The public API origin matches the existing UI: `https://oogiid-api-production.up.railway.app`.

Implementation choices: Gmail SMTP is supported using Spring Boot Mail; Resend remains available as the backward-compatible provider, the requested login URL is fixed server-side, and the rate limit is bounded per instance with a shared gateway limit documented for multi-instance/proxy deployments. Registration stays disabled by default until sender/API-key/encryption settings are supplied.

## Goal

Update the marketing website typography and button colors for a polished, professional appearance, and connect its enquiry form to the backend. A successful submission must create a new user with a backend-generated random password and email their login details. Existing users must receive a clear message without creating another account or changing their password.

Login URL: **https://oogiid-ui.vercel.app/login**

## Baseline before implementation and dependencies

- `index.html` contains `#contact-form` with name, optional company, email, optional phone, project type, and required message.
- `script.js` prevents submission and displays a preview-only message; it has no API integration.
- `styles.css` contains multiple font declarations, including later Segoe UI/Aptos overrides. Consolidate these when changing typography.
- Backend `UserService.create` normalizes email, hashes passwords with BCrypt, and creates role-specific profiles. It requires company name; manufacturing partners additionally require location, which the website does not currently collect.
- The initial users migration already enforces unique, lowercase email. Preserve this constraint and handle concurrent duplicate submissions.
- `SecurityConfig` requires authentication outside its existing public routes. Add an explicit public rule only for the new submission route; preserve administrative user creation permissions.
- Read `../Agent.md`, the backend implementation plan, actual entities/contracts, and relevant project instructions before implementation.

## 1. Professional typography

- Use a consistent, locally hosted Inter font family for headings, navigation, body text, and form controls, with `system-ui`, `Segoe UI`, Arial, and sans-serif fallbacks.
- Include the font license and only the required weights; use `font-display: swap`.
- Consolidate conflicting font-family overrides in `styles.css` and apply the same typography to `index.html` and `capabilities.html`.
- Retain readable text sizes, clear heading hierarchy, and responsive layouts. Check both pages on desktop and mobile, including fallback-font rendering.

## 1a. Professional button colors

- Replace the current bright button colors with a restrained navy palette that complements the website branding. Apply it consistently to navigation calls to action, hero buttons, enquiry choices, form submission, and buttons on `capabilities.html`.
- Define shared CSS tokens rather than adding separate color overrides for each section:

  | Button style | Default | Hover / pressed | Text |
  | --- | --- | --- | --- |
  | Primary | Navy `#17324D` | `#10263B` / `#0B1D2E` | White `#FFFFFF` |
  | Secondary on light backgrounds | White with navy border | Pale slate `#EEF2F6` / `#E2E8F0` | Navy `#17324D` |
  | Secondary on dark backgrounds | Transparent with slate `#CBD5E1` border | Navy `#17324D` / `#10263B` | White `#FFFFFF` |
  | Disabled / submitting | Slate `#E2E8F0` | No hover or pressed effect | Slate `#475569` |

- Give selected enquiry choices a clear navy fill and white text. Expose selection through the appropriate accessible state as well as color.
- Use a visible `:focus-visible` ring with an offset and sufficient contrast on both light and dark sections. Preserve keyboard focus indicators during all interactive states.
- Keep shadows subtle and ensure button text meets at least 4.5:1 contrast. Check borders, focus indicators, and interactive states against their surrounding backgrounds.
- Verify default, hover, pressed, focus, selected, disabled, and submitting states on desktop and mobile across both pages. Include meaningful unit tests for any changed state-handling functions; check static CSS colors and contrast through visual/accessibility verification.

## 2. Website submission contract

Implemented endpoint: `POST /api/public/website-enquiries`.

- Accept a validated DTO containing `name`, `company`, `email`, `phone`, `type`, and `message`, plus `location` when required for partner registration. Set explicit size limits and an allowlist of project types.
- Require company for account creation to match the current backend contract. Show and require location for Manufacturing Partner Registration. Align browser and backend validation.
- Normalize email using trim and lowercase with `Locale.ROOT` before checking or persisting it.
- Map Manufacturing Partner Registration to `MANUFACTURING_PARTNER`; map the other current enquiry types to `BUSINESS_PARTNER`. This is the proposed default; preserve the existing supplier approval workflow and never accept an arbitrary role from the browser.
- Persist the enquiry and its relationship to the user so project type and message are retained. Add new versioned Flyway migrations and matching entities if necessary.
- Keep the response minimal: status, stable message/error code, and user-facing message. Never return passwords, password hashes, mail-provider details, or authentication tokens.

## 3. Backend account creation and duplicate protection

- Add a dedicated controller and transactional service; reuse existing account/profile creation rules without exposing administrative endpoints.
- Before creating an account, check the normalized email across all users, including disabled accounts and every role. Do not overwrite, reactivate, resend credentials, or reset an existing user's password.
- Return HTTP `409` with code `EMAIL_ALREADY_EXISTS` for an existing email. Translate the users email uniqueness violation into the same response if concurrent requests race; do not translate unrelated database failures as duplicates.
- Generate passwords only in the backend using a cryptographically secure random generator, with at least 128 bits of entropy and lengths compatible with the existing 12-character minimum and BCrypt 72-byte limit.
- Store the password only as a BCrypt hash in the user record. Never include plaintext credentials in logs, tracing, exception text, API responses, or browser storage.
- Add rate limits for this public account/email endpoint and duplicate-submit protection. Do not rely on origin headers as authentication or bot protection.

## 4. Website origin and referrer enforcement

- Configure the exact production marketing website origin separately from the UI login URL. The production website origin is `https://dhineshdevelop-rgb.github.io`; omit the repository path from origin configuration.
- Add an endpoint-specific server check: require an exact allowed `Origin`; if absent, optionally accept the parsed origin of `Referer`. Reject missing headers, malformed URLs, `Origin: null`, and untrusted origins with HTTP `403`.
- If `Origin` is present but invalid or untrusted, reject it even when `Referer` appears trusted. Compare parsed scheme, hostname, and effective port; avoid substring/suffix checks and wildcard preview domains.
- Configure CORS for the exact website origin and required POST/preflight headers. Handle OPTIONS correctly and retain existing UI access.
- Browsers supply these headers; frontend JavaScript must not attempt to set `Origin` or `Referer` manually. Non-browser clients can forge them, so the checks enforce browser-origin policy rather than prove caller identity.
- Keep local development origins explicitly configured and separate from production.

## 5. Backend email delivery and failure recovery

- Add a backend mail adapter using the project's chosen provider or SMTP. Configure sender address, credentials, TLS, timeouts, and the fixed login URL through server environment variables; document placeholders only.
- Create the account, profile, enquiry, and a durable mail delivery job in one database transaction. Dispatch mail only after commit; account creation and external delivery are not atomic.
- Because retries require the generated password, keep it only in an encrypted, short-lived delivery payload with a server-managed key outside the database. Delete the payload after successful dispatch or expiry; retain only non-secret status and provider references.
- Use bounded retries and database job locking. Resend uses provider-side idempotency; Gmail SMTP uses a stable correlation Message-ID and may duplicate delivery after ambiguous acceptance. Distinguish pending, sent/provider-accepted, and failed states. SMTP/provider acceptance does not prove inbox delivery.
- A retry for a pending delivery must reuse the original account and credentials. An ordinary duplicate registration must not enqueue or send credentials again. Provide an authorized operational retry path for exhausted failures and document key rotation, expiry, and cleanup.
- Use both escaped HTML and plain-text email templates. Subject: `Welcome to OOGIID — Your login details`.

Required email content:

```text
Hello [Name],

Welcome to OOGIID. Your account has been created.

Username: [normalized email address]
Password: [backend-generated random password]
Login: https://oogiid-ui.vercel.app/login

Keep your login details confidential.

Regards,
The OOGIID Team
```

Do not describe this as a temporary password or promise mandatory password change unless that lifecycle is also implemented and tested.

## 6. Website integration and professional messages

- Replace the preview handler with a JSON request to the configured backend URL. Keep credentials and mail-provider integrations out of website code.
- Change the submit label to `Submit enquiry`; show `Submitting…` and disable repeat submission while the request is in progress.
- Use the existing status region with accessible live announcements. Render messages as text and preserve entered values after validation, conflict, network, or server failures.
- Clear the form only after confirmed server acceptance. Provide a visible login link for existing users.
- Remove preview-only submission copy once the endpoint is available; keep unrelated drawing-upload limitations accurate.

| Result | HTTP | Website message |
| --- | --- | --- |
| Account and enquiry committed; delivery queued | 202 | Thank you. Your account has been created and your enquiry received. Your login details will be emailed to you shortly. |
| Existing email, including a concurrent duplicate | 409 | An account with this email address already exists. Please sign in using your existing credentials. |
| Invalid fields | 400 | Please review the highlighted fields and try again. |
| Untrusted website origin | 403 | We could not accept this submission. Please submit the form from the official OOGIID website. |
| Rate limited | 429 | Too many attempts. Please wait a few minutes before trying again. |
| Network error or uncertain response | — | We could not confirm your submission. If your account was created, your login email may still arrive. Please wait before trying again. |
| Server failure before commit | 5xx | We could not process your submission. Please try again later. |

Do not show “email sent” for a queued or failed delivery. Returning `202` requires a committed durable delivery job. Surface later delivery failures to operators without exposing credentials.

## 7. Tests and verification

Follow the mandatory method-level unit-test rules in `../Agent.md`. Every hand-written function/method in changed modules needs meaningful success and applicable edge/failure tests, including existing helpers and callbacks in those modules. Maintain a method-to-test checklist; report missing coverage as unfinished work.

- Backend isolated JUnit/Mockito tests: controller responses; field validation; normalization; role mapping; existing/disabled emails; duplicate-constraint translation; password generator boundaries with controlled randomness; hash-only persistence; transaction/job creation failures; origin/referrer parsing and precedence; configuration factories; template escaping and required login details; provider failures, retries, expiry, payload cleanup, and log redaction. Mock network, repositories, clock, and randomness.
- Website unit tests: establish a lightweight DOM-capable runner compatible with plain JavaScript, then cover every function in changed modules, including form serialization, conditional location validation, loading state, repeated clicks, all response states, network failures, reset behavior, and safe text rendering. Test existing navigation and observer helpers if their module changes.
- Supplement with MVC/security tests for public-route scope, CORS/preflight, rejected origins, and unchanged administrative authorization. Use disposable PostgreSQL for migrations, entity validation, concurrent email uniqueness, and durable job behavior.
- Verify generated credentials authenticate through the existing login flow. Verify that duplicate attempts preserve the original hash and do not send mail. Check a mail sandbox for HTML/plain-text content; do not send test credentials to real users.
- Run `./mvnw verify` in `oogiid-api`, the website's configured unit checks, and responsive/accessibility checks on both website pages. Run Angular checks only if UI code changes. Report skipped or blocked checks accurately.

## 8. Documentation and rollout

- Update website/backend READMEs, backend API documentation, and environment examples with endpoint contract, website API URL, exact origin allowlist, mail settings, encryption-key handling, and delivery recovery steps.
- The marketing origin and public backend URL are configured as recorded above. Supply the approved sender identity and provider/encryption secrets before rollout. Do not infer the marketing origin from `https://oogiid-ui.vercel.app/login`.
- Apply migrations and deploy backend configuration before enabling live form submission. Verify allowed-origin submission, duplicate behavior, delivery status, actual email receipt with a controlled account, and login at the specified URL.
- Completion requires consistent typography and professional button colors on both pages, accessible button states, working backend submission, reliable duplicate handling, backend-only credential generation/email delivery, accurate status messages, and passing required method-level tests. Implementation is present; PostgreSQL-specific verification and production rollout remain outstanding as recorded in the test checklist.
