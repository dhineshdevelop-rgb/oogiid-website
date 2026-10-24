# OOGIID website

Responsive marketing website using HTML, CSS, and JavaScript modules. Inter is self-hosted under its included font license; buttons use a shared navy palette.

Production website: https://dhineshdevelop-rgb.github.io/oogiid-website/

## Local development and checks

```sh
npm ci
npm test
npm run check
python3 -m http.server 5173
```

Open `http://localhost:5173`. Serve over HTTP instead of opening `index.html` directly because the website uses JavaScript modules. `npm test` runs isolated Node tests with jsdom and coverage; it does not contact the API or send email.

## Account navigation

The website introduces OOGIID's services and capabilities. Sign up and Log in are the account actions in the navigation, homepage hero, and footer. Business, manufacturing partner, and capabilities calls to action lead to signup. There is no project enquiry form, drawing upload action, or website account-creation API request.

Production links open `https://oogiid-ui.vercel.app/signup` and `https://oogiid-ui.vercel.app/login`. Signup uses the application's existing Google onboarding flow.

When served on `localhost`, `127.0.0.1`, or `[::1]`, JavaScript updates every account link to `http://localhost:4200/signup` or `http://localhost:4200/login`. Start the Angular application on port 4200 for local navigation. Other hosts retain production URLs, including GitHub Pages and its repository path. The website does not require an API origin or email-provider configuration.

The earlier [registration implementation plan](WEBSITE_REGISTRATION_IMPLEMENTATION_PLAN.md) documents the retired website enquiry flow. Backend enquiry endpoints are outside this website change.

## Method coverage

`script.test.js` covers all remaining application functions: `initNavigation` (account URL routing, menu open/close and link callbacks, scroll threshold, year, absent optional elements), `initObservers` (fallback, reveal callback and unobserve, delays, active-section callback), and `initializeWebsite` (both pages and browser startup). Flow regression tests verify signup/login entry points and removal of enquiry controls and contact links.

## Separate modern design

The redesign uses an ivory, cobalt, apricot and lavender editorial style with a centered serif hero, wide component illustration, asymmetric capability cards and pill-shaped actions. Open `modern.html` for the redesigned homepage and `modern-capabilities.html` for its matching capabilities page. Both files keep the existing content, app logo, account routing, mobile menu, scroll navigation, and reveal behavior. Links between these pages stay within the redesign. The separate redesign retains its own styling; both original and redesigned pages share the updated toolbar and footer logo treatment.

Each HTML file embeds its CSS and the existing JavaScript so it can also be opened directly from disk. Keep the files alongside `app_logo-black-text.png`, `app_logo-white-text.png`, and `fonts/` for branding and the self-hosted font. HTTP preview is available at `http://localhost:5173/modern.html` using the server command above. Account links use the local Angular app on localhost and the production app when opened from disk or another host.

Validation: `modern.test.js` checks both standalone pages, content and link parity, section targets, brand assets, local/production account destinations, menu state and labels, scroll thresholds, reveal fallback, and disk startup. It asserts that the embedded script exactly matches `script.js` with module exports removed. Method-to-test checklist: `initNavigation` and its menu/link/scroll callbacks, `initObservers` and its reveal/section callbacks, and `initializeWebsite` retain the isolated unit cases in `script.test.js`; standalone initialization and navigation additionally run in `modern.test.js`. No new application functions were introduced. Browser rendering and live account services are not covered by these Node tests.

## Transparent horizontal logos

- `app_logo-white-text.png`: green symbol with white “Oogiid Ex” and “From Engineering to Execution.” text; use on dark backgrounds.
- `app_logo-black-text.png`: the matching logo with black name and tagline; use on light backgrounds.

Both PNGs are 2000 × 650 with transparent backgrounds. The standalone green symbol remains in `app_logo-symbol.png`. All four website pages use the black-text lockup in a light top toolbar and the white-text lockup in the dark footer. Responsive logo containers preserve image proportions.
