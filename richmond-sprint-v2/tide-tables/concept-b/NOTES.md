# Tide Tables v2 · Concept B · "Five arches"

**The concept in two lines.** The site is an engraver's elevation of Richmond Bridge (1777, Grade I), the bridge the café sits beneath. Its five arches rise to the tallest at the centre, and they are the navigation: the centre arch is home, the other four lead to the menu sample, Hollyhock and the walk, the garden, and Find us.

Port 8522: `python3 -m http.server 8522 --directory richmond-sprint-v2/tide-tables/concept-b`

---

## 1. The swap test

Replace "Tide Tables" with any other vegetarian riverside café and this concept stops working:

- **The navigation is a drawing of one specific structure.** It is the only Thames bridge in Greater London with this listing description: five segmental arches rising to a widest and tallest centre, two land-bound semicircular arches, semicircular cutwaters, Grade I, 1777, Paine and Couse. Another café is not under this bridge, so its site cannot be organised by these arches.
- **The second moment, "Of the bridge overhead",** is a keyed reading of the listing text. Each quoted phrase lights its part of the drawing. Nowhere else can claim it.
- **The garden is drawn as three planes beside the bridge's stone abutment and land arch.** That is a view of this garden.
- **The layout grid is the bridge.** The desktop columns use the plate's own span ratios (abutment · 150 · 44 · 190 · 44 · 230 · 44 · 190 · 44 · 150 · abutment), so text literally hangs under arches. Each section is marked with a small five-arch locator showing which arch it belongs to.
- **The menu card's vignette is the menu arch of the same plate,** inked.
- **The type is Caslon, the type of the 1770s,** the decade of the bridge.

Cuisine clichés: none. There are no coffee cups, leaves or chalkboard pastiche.

---

## 2. Only-here details used, where, and their sources

Source IDs refer to `research/dossier.md` § 8. Photo references were studied, never traced or embedded.

| # | Only-here detail | Where it appears (as design, not just copy) | Source |
|---|---|---|---|
| 1 | **The café is in the converted arches beneath Richmond Bridge** | The whole concept. Hero eyebrow; the note under the hero says the centre arch is *home* and the café itself is in the arches on the Richmond bank, so it never claims to be a river arch. Find us copy. | S1, S4, S10 (identity #1) |
| 2 | **Five arches rising to the widest and tallest centre arch** (listing: "Five moulded segmental arches, rising gradually to the centre, which has the widest and tallest arch") | **Signature.** The drawn arches are the primary navigation on desktop. The condensed bridge bar does the same job on phones. The section locators, the favicon and the span-ratio grid all come from it. A dashed construction line through the crowns appears when the fact is keyed. | S9, S10 (identity #2) |
| 3 | **Richmond Bridge: Grade I, 1777, James Paine and Kenton Couse, Portland stone, "now the oldest bridge over the Thames within the boundaries of Greater London", widened 1937** | "Of the bridge overhead": the keyed facts passage, the big hanging-figure **1777**, the plate caption ("Paine & Couse, architects"), and the H2 "The oldest surviving Thames bridge in Greater London" (the copy deck's approved precise wording). | S9, S10 (identity #1; copy deck §7) |
| 4 | **Two land-bound semi-circular arches; moulded semi-circular cutwaters** | Drawn in the plate. Both are keyed in the facts passage and highlight on the drawing. | S9 (identity #2) |
| 5 | **Balustraded parapet and Portland-stone coursing** | Drawn: individual balusters, dies over each pier, a moulded cornice, ashlar coursing on the spandrels, and rusticated abutments. The parapet and the stone are both keyed in the facts. | Parapet: client photo 4 (S24-4; identity #7). Stone: S9 |
| 6 | **Three plane trees in the garden, right beside the bridge's stone** ("We have a large garden with three majestic plane trees") | Three planes drawn on the Richmond bank, with mottled, flaking bark plates and the trunk in front of the abutment as in photo 4. The garden vignette is a crop of the same plate. The garden H2 uses the café's own phrase. There is a gravel stipple band under the garden section. | S1, S4, S24-4 (identity #7). "Three" is the café's own claim. |
| 7 | **The river at the door, with reflections** | Water engraved as broken ruling. Each arch has its reflected "eye", and inking an arch inks its reflection too. The live element is a slow shimmer of highlights across the reflections. | S1, S18 (identity #3) |
| 8 | **Hollyhock and the walk through Grotto Gate; "ask for a free local map!"** | Second arch. The walk is set as a typographic itinerary, not a map, to stay distinct from Concept C. Marked *to confirm* (2017 route). | S1, S7, S15 (identity #12) |
| 9 | **The cream logo colour #FFEBC0** | Used only on dark: the "copper plate" Find us section and the favicon. The wordmark is set new in Libre Caslon Display; the logo is not redrawn. | S1 logo.png (identity §2) |

### Bridge facts: what is used and what is deliberately not

- **Used, all VERIFIED:**
  - Grade I; dated 1777; James Paine and Kenton Couse; Portland stone.
  - The five segmental arches rising to the widest and tallest centre arch.
  - The two land-bound semicircular arches; the moulded semicircular cutwaters.
  - "Now the oldest bridge over the Thames within the boundaries of Greater London".
  - Widened 1937 (S9, S10).
  - Bicentenary celebrated 7 May 1977 (S10).
- **Not used: "toll-free since 1859".** identity.md #15 labels it **REPORTED** (Wikipedia, citing Cookson 2006), not verified. The creative director's condition was "if verified", so it is left out.
- **Also left out, because they are REPORTED only:**
  - the construction dates (1774–77);
  - the span dimensions;
  - the numbering and resetting of the stones in 1937–40.
- **The drawing's proportions are not to measure.** They are in the spirit of the listing: the centre span is the widest and tallest, and the deck rises gently to the centre. They were studied from photo 4 but are not surveyed. The plate says "Drawn anew; not to measure".
- **Avoided on purpose:**
  - No claim that the café's arch is one of the five river arches. The page says the centre arch takes you home, and that the café is in the converted arches on the Richmond bank.
  - The keystone face is not mentioned (that is Concept A's detail, and its identity is unknown).
  - No lamps, inscriptions or toll houses are drawn, because none could be verified.

---

## 3. How the signature works

- **The plate** is one inline SVG, about 270 KB.
  - It is generated procedurally, with a seeded random number generator, by `img/plate-generator.mjs`. That file is the drawing's source, kept for maintenance. `img/richmond-bridge-elevation.svg` is a standalone render.
  - The engraving devices are hand-tuned: ruled sky with cloud breaks; ring mouldings with radial voussoir joints; cylinder-shaded cutwaters with half-dome caps; balusters drawn from a vase profile; and shadow hatching under the cornice.
  - The broken water ruling is denser in the bridge's reflection.
  - The plane trees are foliage masses with broken leaf-edge outlines, short touches and shadow hatching, plus jigsaw bark plates.
- **Inking in.** Each arch carries an `ink` layer of dash-animated hatch lines. These are horizontal interleaves plus clipped diagonal cross-hatching in the opening, and dense broken strokes in its reflection.
  - Hover or focus on an arch's link draws them in, top to bottom, like a burin: `stroke-dashoffset` runs from 1 to 0, with `pathLength=1` and a per-line delay.
  - Pure CSS `:has()` drives it, with a JS class fallback.
  - The current page's arch rests inked: the centre arch on home, the menu arch on the menu page. When you explore another arch, the current one steps back to half strength.
- **Phones: the bridge bar.** A fixed bottom bar with a condensed five-arch bridge.
  - It keeps the same span ratios, with flatter heights and heavier lines for small sizes.
  - The link widths match each span plus half-piers, from 62 to 86 px at 390.
  - The current arch is inked solid, and tapping inks the others.
- **Intro (once per session; skipped for reduced motion and without JS).**
  - The plate is "engraved" first: parapet, cornice, arch rings from the centre outward, piers.
  - It is then "inked": the tone layers open from the centre with a clip-path and opacity.
  - Finally the centre arch inks in.
  - About 3 s in total. Text and actions are never hidden beyond a 0.25 s fade.
- **The live river.** Paper-coloured "glints" shimmer in place across the reflections, back and forth over 6.5 s.
  - The river flows across the bridge's line, not along it, so in an elevation nothing should drift sideways.
  - The animation pauses off-screen and is off for reduced motion.
- **Second moment: keyed facts.** The listing quotes are toggle controls (`role="button"`, `aria-pressed`, keyboard Enter/Space). Hover, focus or press washes the matching part of a second view of the plate (`<use href="#plate-art">`) in river grey-blue: arches with a construction line through the crowns, cutwaters, land arches, stone, parapet. The highlight passes through `<use>` via CSS custom properties.

---

## 4. Implementation notes

- **Stack:** plain HTML, CSS and JS with no build step needed to serve. There is no GSAP: CSS transitions and about 4 KB of JS do the job. Google Fonts: Libre Caslon Display, Libre Caslon Text (400, 400 italic, 700) and Libre Franklin 600 (tiny UI labels only), with metric-adjusted local fallbacks.
- **Typography:**
  - **Small caps.** Google's Libre Caslon ships only `liga`, `frac` and `tnum` (checked with fontTools): **no `smcp` and no `onum`**. Small caps are therefore set as capitals at 0.78 em, with tracking and a 0.012 em text-stroke to restore weight.
  - **Old-style figures** are hand-set: every date is wrapped digit by digit. 0, 1 and 2 are scaled to x-height; 3, 4, 5, 7 and 9 drop below the baseline; 6 and 8 stand full. Screen readers get the number from `aria-label`.
  - **Other features:** proper ligatures (ffi, fl) are on, quotes and apostrophes are typographic, and leading is about 1.6.
  - **Measure:** about 64ch.
- **Layout logic, "under the arches":** an 11-track grid using the bridge's span ratios. The main text spans arches 2–4; marginalia sit under arch 5 or the abutment; image slots sit under arches 1–2. Find us is the copper plate itself: ink ground, cream lettering, a plate-mark rule.
- **Accessibility:**
  - There is a skip link and landmarks, and one H1 per page with a logical H2/H3 order.
  - Focus is visible everywhere (cream on dark), and all tap targets are at least 44 px.
  - AA contrast holds throughout: ink on stone is 9.1:1, secondary ink #4A5562 is 5.1:1, and cream on ink is 11.5:1. River grey-blue is never used for text on stone.
  - The two navs swap by breakpoint with `display:none`, so assistive technology meets one at a time.
- **No JS:** the complete static plate shows, with the current arch inked; every link, hover, focus and the facts highlights still work through CSS `:has()`.
- **Reduced motion:** no intro, no shimmer, and arches ink instantly.
- **No layout shift:** the plate, vignettes and image slots all have fixed aspect ratios.
- **Checked with Playwright** at 390, 768 and 1440: no console errors, no failed requests, no horizontal overflow, no broken anchors.
- **External links** go only to `tel:`, `mailto:`, tidetablescafe.com and a Google Maps search link. JSON-LD holds confirmed facts only; hours appear only in its `description` text.
- **Honesty markers:** `<span class="tbc">to confirm</span>` plus an HTML comment on:
  - The Jam Jar;
  - the Grotto Gate route;
  - the Hollyhock postcode;
  - boat services;
  - booking policy;
  - "All our wines are vegan".
- **Menu page:** carries the brief's banner verbatim; is titled "Bill of Fare · a sample layout · without prices · not the current menu"; uses only the published taster items; uses the approved disclaimer; and labels which section headings are from the café's chalkboard and which were added for layout.

- **Hours update (26 Oct 2026):** Both "Opening hours" notes on the home page and the one on the menu page now show the café's published hours, "Mon–Fri from 7:30am (food and drink from 8am) · Sat–Sun from 7am (from 7:30am) · until dusk", with "please call +44 (0)20 8948 8285" kept for specifics. Source: the café's second official site, Contact page http://www.tidetablescafe.co.uk/contact/ (fetched with curl over http; see `research/dossier.md` S27). The JSON-LD `description`, `<meta name="description">` and `llms.txt` carry the same text. No `openingHoursSpecification`: "dusk" is not a time, and no offline validator was available to confirm an `opens`-only entry is accepted. Only hey@tidetablescafe.com is shown, so contact@tidetablescafe.co.uk is not in the JSON-LD. Hollyhock stays "daylight hours". No VisitRichmond times.

## 5. Known limitations

- **Page weight.** The plate is inlined on both pages so that CSS `:has()` can ink it. Each page is about 290 KB uncompressed, and gzip brings this down a lot. A production build would split the plate into its own file, with a small inline nav overlay.
- **Hand-tuned typography.** The small caps and old-style figures are careful, but they are not true cuts. A licensed Caslon with `smcp`/`onum` (for example Adobe Caslon or Big Caslon) would be the production choice.
- **Desktop arch links** are rectangles over each span (arch plus reflection plus label), not arch-shaped hit areas.
- **Tree detail.** At very large crops, as in the garden vignette on a phone, the procedural foliage is good but not as subtle as a real engraver's hand. A commissioned illustrator pass on the three planes would lift it.
- **The live river is deliberately quiet,** and some visitors will not notice it.
- **The intro replays once per browser session** (sessionStorage). If storage is blocked, it plays on each load.
- **Page-to-page** uses a cross-document View Transition (a 0.35 s fade) where the browser supports it; elsewhere navigation is plain.
- **The drawing is not to measure.** The bridge's real spans and the 1937 widening are not represented.

## 6. Assets to replace

- The wordmark is set in Libre Caslon Display as a working wordmark. Replace it with the café's real logo artwork if supplied; the cream #FFEBC0 is already the logo's colour.
- The image slots are composed placeholders (see the shot list).
- The plate could be redrawn or refined by a commissioned engraver or illustrator, keeping the same structure so the navigation still works.

## 7. Photography shot list

1. **The glazed arch from the towpath at opening time,** looking into the long whitewashed vault (portrait 4:5). Café section.
2. **The gravel garden under the planes, late morning,** with the bridge's pale stone arches and parapet behind (3:2). Garden section.
3. **The five arches from the garden side at low sun,** reflections showing (wide). This could be an alternative hero for social.
4. **A plane trunk close up: the flaking, mottled bark** against the Portland stone (detail).
5. **Hollyhock's veranda in Terrace Gardens** (once the route and postcode are confirmed).
6. **Counter and chalkboards,** for a future real menu page.

## 8. To confirm with the client

Whether "serving from" means food and drink; which of the two official sites and emails is primary; a current menu and prices; booking policy; The Jam Jar dates; whether all wines are vegan; the Hollyhock postcode (TW10 6UX vs TW10 6RH) and route; current boat services; and permission to use the café's own copy as quoted.

## Structured data and llms.txt

**Encoded** (facts from `research/copy-deck.md` only):
- `index.html`: one JSON-LD block (it replaces the earlier one). Type `CafeOrCoffeeShop`, `name`, `description` ("The café is in a converted arch beneath Richmond Bridge. Mon–Fri from 7:30am (food and drink from 8am) · Sat–Sun from 7am (from 7:30am) · until dusk. For more specific information, please call +44 (0)20 8948 8285."). This includes the café's published hours, which are visible on this page. Also `servesCuisine` "Vegetarian" ("The food is all vegetarian"), `address` (2 The Arches, Richmond, Surrey, TW9 1TH, GB), `telephone`, `email` and `url` https://tidetablescafe.com/.
- `menu.html`: a minimal `CafeOrCoffeeShop` identity block (name, url, telephone, all visible there) so the two pages agree. **No `Menu` JSON-LD**: Tide Tables publishes no menu or prices, and this page is a labelled sample layout. The earlier `index.html` block said `Restaurant`; `menu.html` had none.
- `llms.txt`: name, the one-line description in the café's words, address, phone, email (with "only monitored periodically"), the published hours ("Mon–Fri from 7:30am (food and drink from 8am) · Sat–Sun from 7am (from 7:30am) · until dusk", from the café's `.co.uk` Contact page, then "For more specific information, please call…"), "no online booking, please phone", and a link to the menu page described as a sample layout with no current menu or prices. A preview note matches the page banner.
- `<meta name="description">`: index 156 characters, menu 157 characters, both in the café's voice. "Three plane trees" was removed from the index meta, because the number of trees is [TO CONFIRM] (item 18).

**Deliberately left out, and why:**
- `openingHoursSpecification`: the café publishes opening times but closes "till dusk", which is not a clock time; hours stay in `description` (see the hours update below).
- `hasMenu` and any `Menu`/`MenuItem`/prices: no published menu exists.
- `acceptsReservations` and `potentialAction`: there is no online booking, and the booking or walk-in policy is [TO CONFIRM].
- The private-parties number (whether it is current is [TO CONFIRM]), The Jam Jar, boat services, blankets, refills and the plane-tree count ([TO CONFIRM]), and Hollyhock Café (a separate business with a disputed postcode).
- `sameAs`: the café has no known social accounts. `geo`: no coordinates in the research.

**Notes:**
- **Official-domain assumption.** `url`, `@id` and `hasMenu` assume this concept is deployed at https://tidetablescafe.com/ with the menu at `/menu.html` (the file name this concept uses). If the live site keeps a different menu path, change `hasMenu` and the Menu `url`/`@id`, or add a redirect. `llms.txt` links to the menu relatively (`menu.html`), so it works on the preview and on the domain.
- **Matches the visible page.** Every price, phone number, hour, address part, description sentence and booking/order link in the JSON-LD was checked against this page's `document.body.innerText` (plus each menu tab's panel), and each menu price is paired with its own printed line. `llms.txt` phones, emails, times and links were checked against the index and menu pages. No console errors. Nothing visible changed: only the JSON-LD block and `<meta name="description">` in `<head>` were edited.
- **Preview mechanisms untouched.** The "speculative design proposal" banner is unchanged. Note: neither page has a `<meta name="robots" content="noindex">` tag (there was none before this pass, and none was added); if previews rely on `noindex`, it must come from the host (an `X-Robots-Tag` header).
- **Regenerating.** Scripts: `/tmp/claude-0/-home-user-Claude-code/e50707d5-9ec5-571e-9915-9e7145ebe50f/scratchpad/v2/aivis/jsonld/` (`extract.js` reads items and prices from each menu page's DOM, `build.js` writes JSON-LD, meta and `llms.txt` from `facts.js` (copy deck only), `validate.js` checks against the rendered pages, `servers.sh` serves ports 8701–8709). Re-run them if a menu or a fact changes.
