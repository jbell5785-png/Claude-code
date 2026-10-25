# Shared build spec for every Richmond sprint concept

## Folder and files
- Each concept lives in its own folder, `richmond-sprint/<business>/concept-<x>/`, and is self-contained. Nothing is shared between folders.
- Required:
  - `index.html` (homepage)
  - `menu.html` (full menu)
  - `css/`, `js/`, `img/`
  - `NOTES.md`: the concept in two lines, implementation notes, known limitations, the assets to replace, and the photography shot list.
- Relative links only. Every page footer carries a small honest line: "A speculative design proposal by an independent studio. Not the official <Business> website, and not commissioned or endorsed by <Business>." It also links to the business's real website.
- Don't link to sibling concepts. The portfolio index does that.

## Stack
- Plain HTML, CSS and JS. No frameworks, no build step.
- Motion is optional. If used, load GSAP 3.12.5 (and ScrollTrigger 3.12.5) from cdnjs only, with `defer`:
  - https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js
  - https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js
  Feature-detect `window.gsap`; the page must work fully without it. Prefer CSS and plain JS where they do the job.
- Fonts: Google Fonts only, the two families named in your brief, `display=swap`, preconnects, and metric-adjusted fallback faces.
- No analytics, no tracking, no third-party embeds (no map iframes, booking widgets or social embeds).

## Must-haves
- Mobile-first, 320px to 2560px, fluid type with `clamp()`, no horizontal scroll at any width.
- The primary actions (book or order, menu, call or find us) are reachable from the first frame at 390px and from any scroll position.
- **Complete static first frame without JS.** Never hide content with CSS unless JS has added a class and motion is allowed.
- `prefers-reduced-motion: reduce`: no scroll-scrubbed or looping motion. The signature moment still works or reads as a designed static state.
- Accessibility:
  - WCAG AA contrast everywhere
  - visible `:focus-visible`, a skip link and landmarks
  - logical headings
  - keyboard-operable custom controls with correct ARIA
  - tap targets of at least 44px
- No layout shift: fixed aspect ratios on every image slot and illustration, and reserved space for anything JS inserts. Zero console errors.
- No broken links or anchors. External links only to verified destinations from the copy deck (tel:, mailto:, the official site, the verified booking or ordering URLs, a Google Maps search link).
- Metadata:
  - `<title>`, meta description, `theme-color`
  - an inline SVG favicon
  - Open Graph title and description
  - `lang="en-GB"`
  - JSON-LD (Restaurant) with confirmed facts only

## Content and honesty
- Use only `richmond-sprint/<business>/research/copy-deck.md` and the brief. Never invent dishes, descriptions, prices, hours, awards, reviews, testimonials, staff names or history. No customer quotes. No ratings.
- If the copy deck says the menu is incomplete or unverified, any demonstration content must be visibly labelled as such on the page ("Sample layout: not the current menu") and in NOTES.md.
- Uncertain facts carry a small, consistent "to confirm" marker on the page, `<span class="tbc" title="To be confirmed with the restaurant">to confirm</span>`, plus an HTML comment `<!-- [TO CONFIRM] ... -->` beside it.
- Booking and ordering: no backend exists. Hand off to the verified destination (booking URL, ordering URL, phone or email) with an honest in-page summary. Never show a fake confirmation. If `window.open` returns null, show a visible link instead of claiming the page opened. Never navigate the page away automatically.
- Copy: British English, warm, specific, short sentences. No filler ("elevate", "culinary journey", "nestled", "tantalising", "rich tapestry", "premier destination", "hidden gem", "authentic experience").

## Imagery
- No photos at all: no stock, hotlinks, AI images, or copies of the business's own photos. Use CSS, inline SVG, gradients and type.
- Image slots are composed, fixed-ratio placeholders with a visible caption naming the exact photograph to commission. They must look intentional.
- The logo appears only as a labelled logo slot, or as a working wordmark set in the concept's own type and noted in NOTES.md. Don't redraw the business's logo.

## Prohibitions
- **The Caffè Mamma project:** never reuse its fonts (Young Serif, Instrument Sans, Italiana, Hanken Grotesk, Bricolage Grotesque, Atkinson Hyperlegible), its palettes, or its signature ideas (a pen-circle menu filter, a scroll-scrubbed day-to-night lighting scene, washing-line physics, hanging tags on lines).
- Also banned: Playfair Display and Inter.
- No numbered section labels ("01 / Story"), no monospace type, no pill-shaped buttons or chips, and no centred headline over a gradient blob.
- No identical card grids for menu sections. No glassmorphism, no carousels or testimonial sliders, no star ratings, no emoji icons, no "Welcome to" heroes.
- No national-flag clichés: tricolour stripes, Union Jacks, rising-sun motifs, Taj Mahal silhouettes, Eiffel Towers.

## Local check while building
- Serve the folder with `python3 -m http.server <port> --directory <concept folder>` in the background, and stop it afterwards. Use the port given in your brief.
- Use Playwright (`require('playwright')`; `chromium.launch()` with no options) to load both pages, collect console errors and failed requests, and screenshot at 390, 768 and 1440 (top, middle, bottom, plus the signature moment and the menu interaction).
- Judge the screenshots as an art director would, fix what's weak, and re-check: one or two focused passes, weighted to 390px.
- Save screenshots to `/tmp/claude-0/-home-user-Claude-code/e50707d5-9ec5-571e-9915-9e7145ebe50f/scratchpad/sprint/<business>-<x>/`, never into the repo.

## Git
Do not commit or push. Leave the files in place.
