# Industrial imagery audit — November 16, 2026

All 25 industrial JPEGs used by the website and its historical design previews were visually audited. Twenty-two assets were replaced with original people-free scenes generated using the built-in OpenAI `image_gen` tool. Three clean stock close-ups were retained. OOGIID’s intentional website logos remain unchanged.

## Content requirements and findings

Industrial images must contain no people (including background figures, faces, hands, or portraits), company names, logos, watermarks, or readable text. Empty machinery, components, workstations and logistics scenes preserve the subject of each placement without depicting another company’s employees.

Confirmed issues in the replaced assets included Hyundai branding on the homepage hero robots, AOC/HP branding in the CAD photo, PRUSA branding on the printer, company signage and branded uniforms in the partner photo, multiple logos in the machine-integration photo, and a Gatorade logo in the logistics photo. Many other photos contained real people or hands. Employment status was not inferred from a person’s appearance; replacing every human subject avoids relying on that uncertainty. The capabilities hero contained factory signage.

Small text-like marks introduced in some generated outputs were removed with additional built-in image edits. Generated scenes are illustrative and do not document actual OOGIID facilities, employees, products, or partners. The industrial pages disclose that the representative imagery includes AI-generated scenes.

## Current asset provenance and prompts

The [photo manifest](photo-manifest.json) records all 25 JPEGs, exact generation prompts and subsequent edit prompts, current source IDs, placement, descriptions, dimensions, focal points, visual-review date and SHA-256 hashes. Generated images carry `origin: generated` and `generator: OpenAI image_gen`; they do not inherit the replaced stock photos’ source URLs, photographer credit, or Pexels License. No external image service is required at runtime.

The homepage retains 15 distinct originals; the capabilities page uses seven additional originals. Three assets are exclusive to the older image previews. Shared filenames are replaced in place so every referencing page receives the refreshed imagery. Hero images remain 1800 × 1000; other images remain 1200 × 750. JPEG conversion uses quality 75.

| Asset | Current origin | Placement |
| --- | --- | --- |
| `automated-factory.jpg` | Generated | `home.hero` |
| `cnc-metal-cutting.jpg` | Retained stock | `home.capability-1` |
| `cad-workstation.jpg` | Generated | `home.capability-2` |
| `prototyping.jpg` | Generated | `home.capability-3` |
| `robotic-cell.jpg` | Generated | `home.capability-4` |
| `quality-inspection.jpg` | Generated | `home.capability-5` |
| `supply-chain.jpg` | Generated | `home.capability-6` |
| `engineering-design.jpg` | Generated | `home.step-1` |
| `engineering-review.jpg` | Generated | `home.step-2` |
| `supplier-assessment.jpg` | Generated | `home.step-3` |
| `costing-proposal.jpg` | Generated | `home.step-4` |
| `metal-production.jpg` | Retained stock | `home.step-5` |
| `delivery-packing.jpg` | Generated | `home.step-6` |
| `customer-engineer.jpg` | Generated | `home.customers` |
| `robotic-factory.jpg` | Generated | `home.partners` |
| `capabilities-factory.jpg` | Generated | `capabilities.hero` |
| `finished-metal-components.jpg` | Retained stock | `capabilities.capability-1` |
| `product-engineering.jpg` | Generated | `capabilities.capability-2` |
| `prototype-testing.jpg` | Generated | `capabilities.capability-3` |
| `machine-integration.jpg` | Generated | `capabilities.capability-4` |
| `dimensional-inspection.jpg` | Generated | `capabilities.capability-5` |
| `logistics-coordination.jpg` | Generated | `capabilities.capability-6` |
| `precision-machining.jpg` | Generated | `legacy.precision-machining` |
| `fabrication.jpg` | Generated | `legacy.fabrication` |
| `assembly.jpg` | Generated | `legacy.assembly` |

## Retained stock attribution

Only the three images below remain from the previous stock collection. Their existing source and license records are preserved; the current audit checks image content and does not claim a fresh online license verification. The [Pexels License](https://www.pexels.com/license/) and source details were recorded during the November 11, 2026 photography update.

| File | Photographer | Original source |
| --- | --- | --- |
| `cnc-metal-cutting.jpg` | Daniel Smyth | [Photo 10406128](https://www.pexels.com/photo/close-up-photo-of-metal-tool-10406128/) |
| `metal-production.jpg` | Daniel Smyth | [Photo 8865189](https://www.pexels.com/photo/heavy-machinery-in-a-machine-shop-8865189/) |
| `finished-metal-components.jpg` | Connor Lucock | [Photo 28752153](https://www.pexels.com/photo/close-up-of-precision-machined-metal-parts-28752153/) |

## Review and verification

Each selected source image was inspected at full resolution for people, names, logos, signage, screens, packaging and background details. Final JPEG crops were reviewed separately at a narrow desktop-card ratio (0.7:1) and a mobile landscape ratio (1.6:1), covering all 25 assets. This is asset-level crop inspection, not a browser layout test.

`industrial.test.js` verifies that every industrial JPEG and every HTML industrial-image reference is represented in the manifest, with matching descriptions, dimensions, provenance and SHA-256 hashes. The primary 22 placements additionally verify intrinsic JPEG dimensions, focal positions, uniqueness and loading attributes. Metadata assertions bind the manually reviewed assets to their recorded bytes; they cannot automatically prove the absence of people or branding.

No application functions were added or changed. Existing method-level cases in `script.test.js` cover navigation initialization, menu/link/scroll/account callbacks, observer behavior and initialization. No integration test substitutes for those unit cases.

Browser layout verification remains unavailable: the installed headless Chrome process exited with status 134 before loading the page. Changes are local only; deployment was not performed.

`npm test`, `npm run check`, and `git diff --check` passed after the image and metadata updates. A separate comparison confirmed HTML changes are limited to image attributes and the imagery disclosure, and that all original manifest dimensions are preserved.
