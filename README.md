# OOGIID website

## Image-enhanced previews

Open [index-images.html](index-images.html) or [capabilities-images.html](capabilities-images.html) for separate copies with six industrial photographs in each page's existing capability cards. They link to each other and preserve the original text, design, illustrations, and embedded JavaScript. Existing HTML pages are unchanged. Open directly from disk with this directory's assets present, or serve locally using the command below and visit `/index-images.html`.

Images are stored locally in `assets/industrial/`; [photography sources and license](assets/industrial/README.md) are documented there. The photographs represent capability areas, not OOGIID-owned facilities. `images.test.js` checks content/design parity after removing the image additions, local assets, accessibility attributes, preview links, and standalone behavior. No new application functions were introduced; `script.test.js` retains the method-level unit tests for the unchanged behavior.

Responsive marketing website using HTML, CSS, and JavaScript modules. Inter is self-hosted under its included font license; buttons use a shared navy palette.

Production website: https://dhineshdevelop-rgb.github.io/oogiid-website/

## Local development and checks

```sh
npm ci
npm test
npm run check
python3 -m http.server 5173
```

Open `http://localhost:5173`. The root URL serves the modern design through `index.html`. The homepage and capabilities page also work directly from disk with their embedded scripts. `npm test` runs isolated Node tests with jsdom and coverage; it does not contact the API or send email.

## Account navigation

The website introduces OOGIID's services and capabilities. Sign up and Log in are the account actions in the navigation, homepage hero, and footer. Business, manufacturing partner, and capabilities calls to action lead to signup. There is no project enquiry form, drawing upload action, or website account-creation API request.

Production links open `https://oogiid-ui.onrender.com/signup` and `https://oogiid-ui.onrender.com/login`. Signup uses the application's existing Google onboarding flow.

When served on `localhost`, `127.0.0.1`, or `[::1]`, JavaScript updates every account link to `http://localhost:4200/signup` or `http://localhost:4200/login`. Start the Angular application on port 4200 for local navigation. Other hosts retain production URLs, including GitHub Pages and its repository path. The website does not require an API origin or email-provider configuration.

The earlier [registration implementation plan](WEBSITE_REGISTRATION_IMPLEMENTATION_PLAN.md) documents the retired website enquiry flow. Backend enquiry endpoints are outside this website change.

## Method coverage

`script.test.js` covers all remaining application functions: `initNavigation` (account URL routing, menu open/close and link callbacks, scroll threshold, year, absent optional elements), `initObservers` (fallback, reveal callback and unobserve, delays, active-section callback), and `initializeWebsite` (both pages and browser startup). Flow regression tests verify signup/login entry points and removal of enquiry controls and contact links.

## Primary modern design

The redesign uses an ivory, cobalt, apricot and lavender editorial style with a centered serif hero, wide component illustration, asymmetric capability cards and pill-shaped actions. The modern design is the primary website: `index.html` serves the homepage at the root URL, and `capabilities.html` serves the matching capabilities page. Navigation and footer links use these primary filenames. Both pages retain the existing content, app logo, account routing, mobile menu, scroll navigation, and reveal behavior. `modern.html` and `modern-capabilities.html` remain available as standalone design references.

Each HTML file embeds its CSS and the existing JavaScript so it can also be opened directly from disk. Keep the files alongside `app_logo-black-text.png`, `app_logo-white-text.png`, and `fonts/` for branding and the self-hosted font. The primary HTTP preview is available at `http://localhost:5173/` using the server command above. Account links use the local Angular app on localhost and the production app when opened from disk or another host.

Validation: `modern.test.js` verifies that both primary pages use the modern design and canonical navigation links, then checks the standalone reference pages, content and link parity, section targets, brand assets, local/production account destinations, menu state and labels, scroll thresholds, reveal fallback, and disk startup. It asserts that the embedded script exactly matches `script.js` with module exports removed. Method-to-test checklist: `initNavigation` and its menu/link/scroll callbacks, `initObservers` and its reveal/section callbacks, and `initializeWebsite` retain the isolated unit cases in `script.test.js`; standalone initialization and navigation additionally run in `modern.test.js`. No new application functions were introduced. Browser rendering and live account services are not covered by these Node tests.

## Transparent horizontal logos

- `app_logo-white-text.png`: green symbol with white “Oogiid Ex” and “From Engineering to Execution.” text; use on dark backgrounds.
- `app_logo-black-text.png`: the matching logo with black name and tagline; use on light backgrounds.

Both PNGs are 2000 × 650 with transparent backgrounds. The standalone green symbol remains in `app_logo-symbol.png`. All four website pages use the black-text lockup in a light top toolbar and the white-text lockup in the dark footer. Responsive logo containers preserve image proportions.
