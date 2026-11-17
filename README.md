# OOGIID website

## People-free, unbranded industrial imagery

The November 16, 2026 image audit covers all 25 industrial assets used by current pages and historical previews. Twenty-two photographs containing people, branding, signage, or uncertain details are replaced with original AI-generated, people-free industrial scenes using the built-in OpenAI image generation tool. Three clean stock close-ups remain: CNC cutting, metal production, and finished metal components. OOGIID’s intentional header/footer logos are retained.

All image paths and dimensions are preserved. Alt text and focal points describe the new scenes. The [image manifest](assets/industrial/photo-manifest.json) records all 25 assets, their current provenance, exact generation prompts where applicable, dimensions, placement, review date, and SHA-256 hashes. The [image notes](assets/industrial/README.md) document the audit and retained stock sources. Generated assets do not inherit the replaced photographs’ attribution or stock license.

The homepage retains 15 distinct images and the capabilities page seven additional originals. The earlier image previews use the same refreshed assets plus three dedicated replacements. No application functions or public interfaces change. `industrial.test.js` checks that every industrial JPEG and every HTML image reference has a matching audit record and accurate alt text, dimensions, and file hash; visual review is required to assess image content. Existing method-level unit tests remain in `script.test.js`.

Validation: `npm test`, `npm run check`, and `git diff --check` passed. Full-resolution source inspection and final JPEG crop review covered all 25 assets. Browser layout verification remains unavailable because headless Chrome exited with status 134 before loading the page. No deployment was performed.


## Contact Us and WhatsApp

The current homepage (`index.html`) and matching `industrial-home-updated.html` preview include a Contact Us section with email, phone and office details from page 1 of the supplied Oogiid company profile. Header and footer links on these pages and `industrial-capabilities-updated.html` reach that section.

Email: **oogiid.ex@gmail.com**. Phone numbers: **+91 9600112025** and **+91 9282209694**. Registered office: No.2/380, Vignesh Nagar, Ashok Leyland 2nd plant Opp, Thorapalli Agraharam, Hosur–635109. Branch office: No.3, Sakthi Nagar, Keelkattalai, Chennai–600117.

All three current pages include a fixed bottom-right WhatsApp shortcut to `https://wa.me/919600112025`, using the user-selected first phone number. It uses a native link, works without JavaScript, opens in a new tab, and includes a keyboard focus indicator, accessible name and mobile safe-area spacing. Email and phone links open the visitor’s configured applications. There is no contact form or API submission. Historical design variants are unchanged.

`contact.test.js` covers the contact details, link destinations, new-tab protection, accessible icon, fixed sizing/positioning, safe-area styling and mobile menu contact behavior. No application functions were added or modified; all existing functions and callbacks retain their focused unit cases in `script.test.js`, with 100% reported function, line and branch coverage. All 74 tests and `npm run check` passed; `git diff --check` passed. Browser layout, scrolling, keyboard and overlap checks remain unverified: the installed headless Chrome exited before starting in this environment. Opening a live WhatsApp conversation and deployment were not performed.

## Updated positioning previews

Open [industrial-home-updated.html](industrial-home-updated.html) and [industrial-capabilities-updated.html](industrial-capabilities-updated.html) for the separate content-update previews. The primary `index.html` now matches the updated homepage; earlier standalone design pages are retained. The previews link to each other and distinguish OOGIID’s engineering capability, validated manufacturing partner network and execution coordination. The homepage includes the supplied About, Vision, Mission and Philosophy copy in full.

Both files embed their CSS and the existing tested JavaScript. Open them directly with the adjacent assets present, or run `python3 -m http.server 5173` from this directory and visit `http://localhost:5173/industrial-home-updated.html`. They retain the existing signup/login destinations and localhost routing. The standalone previews remain available alongside the primary homepage. Publication is managed separately.

`updated.test.js` checks the complete company story, role positioning, technical offerings, cross-page links, asset retention and standalone behavior. No application functions were added or modified: `initNavigation`, its account/menu/link/scroll callbacks and private `setMenu`, `initObservers` and its observer callbacks, and `initializeWebsite` retain their unit cases in `script.test.js`. Preview tests also check embedded-script equality and execute navigation on disk, localhost and hosted URLs. Run `npm test` and `npm run check`.

Validation for the updated previews: all 66 Node tests and `npm run check` passed. Headless Chrome checks covered both pages at 1440, 768 and 390 pixels with no horizontal overflow, missing images or JavaScript exceptions; mobile menu open/close passed. Screenshots were reviewed for company-story readability and responsive spacing. Existing application functions retain 100% reported line, branch and function coverage. Live account services were not exercised.

## Industrial design previews

Open [industrial-home.html](industrial-home.html) and [industrial-capabilities.html](industrial-capabilities.html) for the light industrial design. The primary `index.html` homepage is synchronized with `industrial-home-updated.html`; the older design variants remain available. Both previews embed their CSS and the existing tested `script.js` behavior and work directly from disk with the adjacent logo, fonts and `assets/industrial/` directory.

To preview over HTTP, run `python3 -m http.server 5173` from this directory, then visit `http://localhost:5173/industrial-home.html` or `http://localhost:5173/industrial-capabilities.html`. The photography refresh is available locally; publication is a separate step.

The homepage has 15 distinct photographs and the capabilities page has seven additional photographs, with no shared original between the two logical pages. The current people-free image audit supersedes the earlier stock-photo assignments. Alternate filenames or crops do not count as unique originals. `assets/industrial/photo-manifest.json` records source IDs, attribution, dimensions, placement, focal points and file checksums. `industrial.test.js` verifies all 22 assignments, unique sources and hashes, actual JPEG dimensions, image loading attributes, alt text and exact primary-homepage/preview parity.

The design uses a photographic factory hero, five benefits, six linked capability cards, a six-step journey, customer/partner panels and six detailed capability sections. All previous technical offerings are retained under the new categories. Requirement and partner buttons lead to existing signup; login and localhost routing retain the current behavior. No enquiry form, live tracking or API was added. Images are representative industrial imagery, not OOGIID facilities; current provenance is in [the photography notes](assets/industrial/README.md).

Validation: `industrial.test.js` checks standalone script equality and syntax, account routing on localhost/hosted/disk URLs, menu state, anchor closing, scroll thresholds, deterministic year, observer fallback, local image assets, heading/ID/link integrity, six matching capability destinations, six workflow steps, and retention of every existing technical offering. Method-to-test checklist: no new application functions were introduced; `initNavigation`, its account/menu/link/scroll callbacks and private `setMenu`, `initObservers` and its observer callbacks, and `initializeWebsite` retain their focused unit coverage in `script.test.js`. The industrial tests additionally execute the embedded behavior on both new pages. Run `npm test` and `npm run check`.

Chrome verification covered both previews at 1440, 1024, 768 and 390 pixels: local images loaded, no horizontal overflow or JavaScript errors, and mobile menu open/close passed. Both previews also expose navigation and content with JavaScript disabled at 390 pixels. Screenshots were reviewed for image crops and text placement. Existing application behavior has 100% reported statement, branch and function coverage; live signup/login services were not exercised.

## Image-enhanced homepage

Open [index-images.html](index-images.html) or [capabilities-images.html](capabilities-images.html) for separate copies with six industrial photographs in each page's existing capability cards. They link to each other and preserve the original text, design, illustrations, and embedded JavaScript. These earlier variants share the refreshed people-free assets; the default `index.html` now uses the industrial design described above. Open directly from disk with this directory's assets present, or serve locally using the command below and visit `/index-images.html`.

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

Open `http://localhost:5173`. The root URL serves the updated positioning homepage through `index.html`. The homepage and capabilities page also work directly from disk with their embedded scripts. `npm test` runs isolated Node tests with jsdom and coverage; it does not contact the API or send email.

## Account navigation

The website introduces OOGIID's services and capabilities. Sign up and Log in are the account actions in the navigation, homepage hero, and footer. Business, manufacturing partner, and capabilities calls to action lead to signup. There is no project enquiry form, drawing upload action, or website account-creation API request.

Production links open `https://oogiid-ui.onrender.com/signup` and `https://oogiid-ui.onrender.com/login`. Signup uses the application's existing Google onboarding flow.

When served on `localhost`, `127.0.0.1`, or `[::1]`, JavaScript updates every account link to `http://localhost:4200/signup` or `http://localhost:4200/login`. Start the Angular application on port 4200 for local navigation. Other hosts retain production URLs, including GitHub Pages and its repository path. The website does not require an API origin or email-provider configuration.

The earlier [registration implementation plan](WEBSITE_REGISTRATION_IMPLEMENTATION_PLAN.md) documents the retired website enquiry flow. Backend enquiry endpoints are outside this website change.

## Method coverage

`script.test.js` covers all remaining application functions: `initNavigation` (account URL routing, menu open/close and link callbacks, scroll threshold, year, absent optional elements), `initObservers` (fallback, reveal callback and unobserve, delays, active-section callback), and `initializeWebsite` (both pages and browser startup). Flow regression tests verify signup/login entry points and removal of enquiry controls; contact links are covered separately in `contact.test.js`.

## Earlier modern design

The redesign uses an ivory, cobalt, apricot and lavender editorial style with a centered serif hero, wide component illustration, asymmetric capability cards and pill-shaped actions. The standalone `modern.html` and `modern-capabilities.html` preserve this earlier design; `capabilities.html` is its legacy capabilities copy. The current homepage uses the industrial design. Both pages retain the existing content, app logo, account routing, mobile menu, scroll navigation, and reveal behavior. `modern.html` and `modern-capabilities.html` remain available as standalone design references.

Each HTML file embeds its CSS and the existing JavaScript so it can also be opened directly from disk. Keep the files alongside `app_logo-black-text.png`, `app_logo-white-text.png`, and `fonts/` for branding and the self-hosted font. The primary HTTP preview is available at `http://localhost:5173/` using the server command above. Account links use the local Angular app on localhost and the production app when opened from disk or another host.

Validation: `modern.test.js` verifies the earlier standalone variants and legacy capabilities source parity, then checks the standalone reference pages, content and link parity, section targets, brand assets, local/production account destinations, menu state and labels, scroll thresholds, reveal fallback, and disk startup. It asserts that the embedded script exactly matches `script.js` with module exports removed. Method-to-test checklist: `initNavigation` and its menu/link/scroll callbacks, `initObservers` and its reveal/section callbacks, and `initializeWebsite` retain the isolated unit cases in `script.test.js`; standalone initialization and navigation additionally run in `modern.test.js`. No new application functions were introduced. Browser rendering and live account services are not covered by these Node tests.

## Transparent horizontal logos

- `app_logo-black-text.png`: 1090 × 415, green symbol with black “Oogiid Ex” and “From Engineering to Execution.” lettering, for light backgrounds.
- `app_logo-white-text.png`: 1006 × 333, the matching white-letter version, for dark backgrounds.

The logo PNG files themselves have been losslessly trimmed to their nontransparent bounds. The black-letter source rectangle was `(135, 117, 1090, 415)` and the white-letter rectangle was `(142, 158, 1006, 333)`, from the original 2000 × 650 canvases. Every retained RGBA pixel is unchanged, including transparent pixels within the artwork; the original gamma metadata is preserved. There is no fully transparent border on any edge. The symbol, wordmark, tagline, colors and internal arrangement are unchanged. The standalone symbol asset remains untouched.

The combined images remain as source artwork. Website headers and footers now render two tightly trimmed assets side by side so only the green symbol can be resized:

| Variant | Symbol asset | Wordmark and tagline asset |
| --- | --- | --- |
| Black lettering | `app_logo-black-symbol.png` — 420 × 415 | `app_logo-black-wordmark.png` — 642 × 222 |
| White lettering | `app_logo-white-symbol.png` — 336 × 333 | `app_logo-white-wordmark.png` — 642 × 222 |

All four assets are lossless pixel extractions from the combined PNGs. Their crop rectangles, source file hashes and decoded RGBA hashes are recorded in `assets/branding/logo-parts.json`. No bitmap resampling or regeneration was used. Each extracted asset has visible artwork touching all four edges; transparency between and within glyphs is retained.

The green symbol displays at 90% of its previous width and height, while the wordmark and tagline retain their exact previous displayed dimensions. Flex layout vertically centers the two parts and preserves the previous gap (28 source pixels, scaled at each breakpoint). Symbol, wordmark and gap sizes are explicit pixel values in CSS custom properties, synchronized between `styles.css` and every page's first embedded stylesheet. The full logo's natural width decreases by the removed symbol width; outer page margins, header heights and navigation positions are preserved. There are no CSS crop offsets or clipping workarounds.

Responsive sizes use the previous combined-logo display width as their scale reference: industrial pages use 215px above 1200px, 180px at 1200px and below, and 175px at 650px and below; legacy headers use 232px above 760px and 185px at 760px and below; white-letter footers use 260px. At each size, wordmark width is `referenceWidth × 642 ÷ sourceWidth`, gap is `referenceWidth × 28 ÷ sourceWidth`, and symbol width is `referenceWidth × sourceSymbolWidth ÷ sourceWidth × 0.9`. Heights follow each asset's original proportions.

Home-link destinations and accessible names are unchanged. The symbol has an empty alt attribute and `aria-hidden="true"`, while the wordmark retains `alt="OOGIID"` and the link retains `aria-label="OOGIID home"`. Footer image loading behavior is preserved for both parts.

`logo.test.js` verifies source and extracted PNG dimensions, decoded RGBA pixel hashes, visible edges, retained transparency, consistent accessible markup, normal image positioning, ten-percent symbol reduction, unchanged text dimensions and unchanged gap at all six responsive sizes. `script.test.js`, `modern.test.js` and `industrial.test.js` verify the split branding alongside existing page behavior. Production methods are unchanged: their unit cases in `script.test.js` cover navigation initialization and callbacks, menu/link/scroll/account behavior, observers and website initialization. No application methods were introduced.

Validation passed: all 83 tests with no skipped tests, `npm run check`, and `git diff --check`. `script.js` retains 100% reported line, branch and function coverage. Local Chrome checks passed for all 10 pages at 1440, 1201, 1200, 768, 761, 760, 651, 650, 390 and 320 pixels (100 page/viewport checks). Header and footer measurements confirm the symbol is 10% smaller in both dimensions, text and gap sizes are unchanged, parts are vertically centered, outer horizontal alignment and header heights are preserved, and navigation remains unobstructed with working mobile menus. Desktop, tablet, phone and dark-footer screenshots were reviewed. Chrome required execution outside the filesystem sandbox. Changes are local; deployment was not performed.
