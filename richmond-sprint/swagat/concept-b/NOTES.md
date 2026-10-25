# Swagat, Concept B: "Swagat" (the welcome)

**The concept in two lines.** स्वागत means "welcome", so the first thing you meet is a welcome drawn on the doorstep: an original dot-grid pattern that draws itself once around the wordmark. Then an editorial long-form tells the menu's regional story in the menu's own words (Kerala, the south, the Parsi community, the north, the house speciality), followed by the vegetarian depth, the tandoor, takeaway, booking and Hill Rise.

Local preview: `python3 -m http.server 8322 --directory richmond-sprint/swagat/concept-b`, then open http://localhost:8322/.

## Files

- `index.html`: homepage (hero with the doorstep welcome; the dishes; vegetarian; tandoor; order; book; hours and visit; footer)
- `menu.html`: full menu with a sticky course index, a Vegetarian view toggle, a vegan-suitable (V) highlight, allergen key and badges
- `css/styles.css`: the whole design system (tokens, 10-column grid, components)
- `js/welcome.js`: the drawing moment (homepage only)
- `js/menu.js`: the menu views, live status and course-index tracking
- `img/doorstep-pattern-wide.svg`, `img/doorstep-pattern-square.svg`, `img/doorstep-divider.svg`: standalone exports of the patterns for print, social and signage. The pages don't load these; they use the inline versions.
- `tools/kolam.js`, `tools/build.js`, `tools/menu-data.js`: authoring tools (see below). The site needs no build step; the output is already in the HTML.

## How the welcome pattern is made

- **Original method, not a traced design.** `tools/kolam.js` lays out a grid of dots. A single line travels diagonally between them. At every gap between two neighbouring dots, the line either crosses straight through or turns at an invisible "mirror". The outer edge, and the clearing left for the wordmark, always turn it back. So every line closes into a loop that wraps around the dots without touching them, which is the defining trait of threshold drawings.
- **Geometry.** Each line is drawn as straight tangents plus quarter arcs of radius √2/2 around a dot or a cell corner. That keeps the curves even and continuous, with no kinks.
- **Seeded and symmetric.** Mirror placement comes from a seeded PRNG (mulberry32). Each choice is reflected left-right and top-bottom, so the result is symmetric and exactly repeatable. Weights: 45% cross, 40% wall, 15% pass.
- **Seeds chosen by eye** from candidates where every loop is its own mirror image:
  - Desktop/tablet: 19×9 dots with an 11×5 clearing, seed 2845.
  - Mobile (<640px): 9×9 dots with a 7×3 clearing, seed 81.
  - Dividers: 11×3 dots, seed 619, one continuous loop.
- **Why two loops in the hero.** With a clearing in the middle and two-way symmetry, the loops always come in pairs. I checked about 3,000 seeds for each configuration and found none that made a single loop.
- **The drawing.** Each loop starts on the vertical axis, at the turn nearest the outer edge. `welcome.js` draws it with two pens: the path is drawn forward from the start while a clone draws it backward, using the dash offset. The two pens trace mirror images and meet at the bottom centre. First the dots settle from the centre outwards (about 0.6s), then the line draws for 1.7s (about 2.0s in total), then it rests. Plain JS with `requestAnimationFrame`; no GSAP.
- **Chalk.** One SVG filter (`#chalk`) adds a slight displacement wobble and a fine grain mask, so the line reads as chalk but stays precise.
- **No JS, reduced motion and failure.**
  - The pattern is pre-rendered inline in the HTML, so without JS it is simply there, fully drawn.
  - Reduced motion: drawn instantly, no animation.
  - A head script hides the strokes only when JS runs and motion is allowed (`.welcome-pending`). A CSS failsafe reveals them after 3s even if `welcome.js` never runs.
- **Dividers.** The same generator makes the small section dividers. They are one `<symbol>` reused with `<use>`; colours come through CSS custom properties: maroon line on light grounds, chalk on dark.
- **Regenerate:** `node tools/build.js`. It rewrites the content between `<!-- build:NAME -->` markers in both pages: the sprite (chalk filter, divider symbol, icons), the hero art and the menu markup. It also refreshes `img/`.

## Implementation notes

- **Type.**
  - Tiro Devanagari Hindi (Latin and Devanagari display) and Hind (text and UI), from Google Fonts with `display=swap` and preconnects.
  - Metric-adjusted fallback faces: Tiro is matched to Times/Liberation Serif, Hind to Arial/Liberation Sans. The values were computed from the font files with fontTools.
  - स्वागत was checked codepoint by codepoint (स ् व ा ग त) and renders with correct conjuncts and no tofu in the screenshots.
- **Grid.**
  - A 10-column grid from 900px. The text column spans columns 1–6 (headings 1–7); marginal notes sit in columns 8–10.
  - Alternate regional entries indent one column for rhythm.
  - Below 900px everything is one column, and margin notes become inline asides with a rose rule.
- **Primary actions.**
  - Below 900px, a fixed bottom bar (Order, Book, Menu, Call; Visit replaces Menu on the menu page) keeps the actions in the first frame at 390px and at any scroll position.
  - From 900px, a sticky header carries Book and Order buttons plus the phone number.
- **Booking and ordering hand-off.**
  - Plain links open the verified foodbooking.com URL in a new tab, with honest text: "Nothing is ordered or booked on this page."
  - No `window.open` and no fake confirmation.
  - Booking through the same link is marked to confirm.
- **Menu views.**
  - "Vegetarian" (`aria-pressed`) keeps only what the menu itself heads Vegetarian: Starters / Vegetarian and Main Course / Vegetarian (23 dishes). Rice, breads, raita, desserts and lassi carry no veg/non-veg heading, so this view hides them, and the page says so.
  - "Highlight vegan suitable (V)" is a separate toggle. It tints the 8 V-coded dishes and labels each one "Vegan suitable (V)".
  - Both views fade over 400ms (instant with reduced motion). A `role="status"` line announces the result.
  - `menu.html?view=vegetarian` opens straight into the vegetarian view; the homepage links there.
- **Allergen codes** are small square letter badges, each with the full allergen name in hidden text and a `title`. The key and the verbatim statement are at the top of the menu page.
- **Chilli icons** use one small original SVG, repeated 0–2 times as printed on version A. The only wording is "chilli icons as printed"; there is no hot/mild label. Desserts and lassi come from version B, which prints no chilli icons, so they have none.
- **Accessibility.**
  - Skip link, landmarks and a logical heading order.
  - `:focus-visible` rings: maroon on light grounds, marigold on dark.
  - Tap targets are 44px or more; none were under 44px at 390px.
  - Contrast was checked for every text pair: body text 14.5:1, muted text 6.2–7.5:1, marigold on night 7.8:1. Rose is used only for the chilli icons and rules (4.2:1).
  - The Devanagari in the H1 is `aria-hidden`; the hero note carries it as readable `lang="hi"` text.
- **QA run (Playwright Chromium, 390/768/1440, both pages):**
  - 0 console errors or warnings, 0 failed requests, no horizontal overflow.
  - CLS ≤ 0.001.
  - No-JS and reduced-motion runs also checked.
  - Every anchor resolves, and external links go only to the verified destinations.

## Content and honesty

- **Sources.** All facts and menu text come from `research/copy-deck.md` and the brief.
- **Spellings.** Dish names and descriptions keep the restaurant's own spellings ("Chetinaad", "Chilly cheese Naan", "Toped", "withfresh"). Fixing those is a job for the owner; the list is below.
- **To-confirm markers.** Each one uses the shared `<span class="tbc">` plus an HTML comment. They cover:
  - all prices (one menu-level note: "Prices from our current online menu, being re-checked")
  - the evening hours (closed Mondays is confirmed)
  - the collection offer (shown without a threshold figure)
  - delivery platforms (named, no links)
  - online booking via the ordering link
  - the dessert and lassi sections (version B only)
  - Yellow Dal Tadka's description
- **Not used anywhere:**
  - staff names, testimonials, ratings, awards, a founding year or river views
  - a map of India, the Taj Mahal, elephants, flags or "exotic" ornament
- **"Swagat" means "welcome".** The site states this only as a dictionary meaning. It never claims the restaurant chose its name for that reason.
- **Wordmark.** "Swagat" set in Tiro Devanagari Hindi, with स्वागत as a secondary mark. This is a working wordmark, not the restaurant's logo, and the footer says so.

## Menu conflicts (page-text version A vs online ordering version B)

Version A is used throughout, except where noted.

| Item | A (used) | B | Treatment |
|---|---|---|---|
| Tandoori Lamb Chops | £11.99 | 11.5 GBP | A shown |
| Paneer Tikka Shashlik | £8.99, no code | 8.75 GBP, (D) | A shown (no D badge) |
| Papadoms & Chutney | £3.00 | 3.75 GBP | A shown |
| Butter Chicken | £14.25 | 14.5 GBP | A shown |
| Lamb Rogan Josh | £17.50 | 17.25 GBP | A shown |
| Egg Fried Rice | £7.25 (S) | 5.5 GBP (E, S) | A shown |
| Chicken Korma | no code (description says almond) | (N, D) | A shown. **Flag to owner: the description names almond but A has no N code** |
| Lemon Rice | (S) | (V, M) | A shown, so it is not highlighted as V |
| Yellow Dal Tadka | description duplicates Masala Bhindi's | "Yellow split lentil cooked with chopped fresh spinach…" | **B's description used**, with an on-page note and a to-confirm marker |
| Only in A | Veg Platter, Lamb Jalfreezie, Cucumber Raita | — | shown |
| Only in B | — | Kadai Gosht, Mint paratha, Mixed Veg Raita | not shown (version A dishes only, per brief) |
| Only in B | — | Dessert (Gulab Jamun, Gajar ka halwa), Lassi (Mango, Sweet) | shown, labelled "From the online ordering menu", to confirm |
| Codes only in B | e.g. Samosa (G), Saag (D), Aloo Gobi (V), many mains | — | not shown; A's codes are used as printed |

**Other items to raise with the owner:**
- the collection offer threshold (£30 on the menu page vs £25 on the takeaway page)
- hours across five sources
- typos in descriptions: "Toped", "withfresh", "Diced of spring lamb", "Peas Pulao: Fresh Mushroom or peas"
- the allergen key has no codes for fish, sesame, celery, molluscs, peanuts, lupin or sulphites, although fish dishes are listed

## Known limitations

- **Pattern loops.** The hero patterns are two loops each, not one continuous line (see above). The dividers are single loops.
- **Pattern swap on resize.** The desktop and mobile patterns are separate inline SVGs swapped at 640px. Resizing across that breakpoint after load shows the other pattern already drawn; the drawing plays only once, for the pattern visible at load.
- **Chalk filter cost.** The filter is re-rasterised on every animation frame for about 2 seconds. Smooth on desktop Chromium; low-end phones may drop frames during the draw.
- **Vegetarian view scope.** The view hides rice, breads, raita, desserts and lassi, because the menu doesn't head them Vegetarian. That is deliberately conservative; the restaurant could confirm which of those are vegetarian.
- **Booking link.** The foodbooking.com ordering URL is verified for ordering. That it opens reservations is still to confirm. The live site opens its booking form as an overlay on the same system.
- **Instagram.** Shown as a plain handle, because the spec allows external links only to the verified destinations.
- **No dark mode.** The design is already a night/chalk two-ground system.
- **Browser coverage.** Tested in Chromium only (Playwright). Container-query units size the wordmark, with a `clamp()` fallback for browsers without them.

## Assets to replace

- The logo: a vector of the real maroon "swagat" wordmark is needed. Only a 120×76 raster exists. The Tiro working wordmark stands in.
- All seven image slots (see the shot list).
- Confirmed hours, the offer threshold, delivery platform links, and current prices and codes.

## Photography shot list (to commission)

1. The tandoor in use: skewers going in, the oven's mouth glowing (portrait 4:5)
2. Malabar fish curry: close and from above, coconut sauce and curry leaves in focus (landscape 3:2)
3. Handi Gosht in its serving pot, side-lit (portrait 4:5)
4. A vegetarian spread: four or five vegetarian mains in side portions with rice and bread, from above (wide 16:9)
5. Breads coming out of the tandoor: naan lifted from the wall, blistered (portrait 4:5)
6. The frontage on Hill Rise at dusk, fascia lit (landscape 3:2)
7. The dining room set for evening service (landscape 3:2)
