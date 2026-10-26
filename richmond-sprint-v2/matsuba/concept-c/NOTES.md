# Matsuba v2, Concept C: "Aburi"

**In two lines:** Matsuba's printed menus come online for the first time, so the website *is* their menu card: burgundy, gold, brown and taupe, tracked serif heads between gold rules, "• SUB-HEAD •" bullets and a thin gold border. A small blue-cored torch then sears, letter by letter, the dishes the menu itself calls aburi or seared, starting with their signature Tuna Tataki.

Port: `python3 -m http.server 8513 --directory richmond-sprint-v2/matsuba/concept-c`

---

## Only-here details used (with sources)

| # | Detail | Source | Where it appears, as design |
|---|---|---|---|
| 1 | **The flame language of the menu**: "Torched-seared" Tuna Tataki (their "signature appetizer"), "Torch-seared" Salmon Aburi Carpaccio, the eight-fish ABURI NIGIRI section, "2 piece portions of flame seared nigiri", "Salmon aburi nigiri with cheddar" (Lion King nigiri), "4 pieces aburi nigiri" (Salmon Combo_B) | matsuba.co.uk/matsuba-menu/ (copy deck, dine-in menu); takeaway PDF MATSUBA-TA10-kids.pdf straplines (copy deck v2 addendum); homepage line "Taste our signature appetizer, Tuna Tataki…" ; identity.md §9 | **The signature.** The hero sears "Tuna Tataki"; the homepage Aburi Nigiri section sears all eight in reading order; the menu page sears every listed seared dish and has the "Aburi" filter. |
| 2 | **The print-menu system**: centred card, thin gold border (#D1A75B / #E9D3AC), tracked serif capitals flanked by thin gold rules, taupe title / gold hours line / burgundy price line, "• RICE SET •" bullets, bold serif dish names with light italic sans descriptions, green vg/v marks | MATSUBA-special2026.jpg (Lunch & Early Evening card); identity.md §8 and the colour table in §2 | **The layout logic of both pages.** A fixed thin gold border round the viewport (the page is the card); every section head is the card's gold-ruled tracked head; dishes are set exactly in the card's grammar, centred, with orphans centred as in print; the menu page ends with the Lunch & Early Evening card rebuilt as live type. |
| 3 | **The takeaway menu's reversed-out label bars and cover**: white tracked caps on a brown box ("MATSUBA", "TAKEAWAY DEAL 20% OFF", "COLLECTION ONLY EVERYDAY") | MATSUBA-TA10-kids.pdf page 1 (ta10-2.png), identity.md §8 | The takeaway-deal panel on the homepage is set as that cover; the menu's "Aburi" filter is a label bar that fills brown when pressed. |
| 4 | **The candle in its small copper holder** (frosted glass votive in a copper cup) | Client photo 3 (uploader shown as "Matsuba"), photo-notes.md "Furniture"; identity.md §7 | Original SVG drawing in the evening section; the candle lights as the section scrolls in, then breathes gently. Reduced motion: lit and still. |
| 5 | **White marble-look tables with black pebble chopstick rests** and plain wooden chopsticks; napkin on a small white dish | Site photo matsuba-table-e1624960727855.jpg; footer photo; client photos 3–5; identity.md §7 | The hero is set "on the table": faint marble veining behind Tuna Tataki and a drawn pair of chopsticks on a black pebble rest. The evening drawing is a whole table setting. |
| 6 | **Orchids in the window**, white and purple phalaenopsis in white pots along the sills, plus the **lit menu case** on the pier between windows, on the **slate-painted frontage and painted-brick plinth** | Client photo 1 (uploader "Matsuba"), photo-notes.md "Frontage"; identity.md §2 | Original SVG still life beside "Find us": four orchids (three magenta, one yellow-green, as seen), the slate frame, and the lit case showing a tiny gold-bordered print card. The case light comes on as it scrolls in. |
| 7 | **"Special Rolls: large 8 piece rolls exclusively created by MATSUBA"** | Our Story page; takeaway PDF (identity.md §10) | Their only originality claim gets its own section, set as a print list beside the takeaway cover. |
| 8 | **Their own words**: "Pull up a chair. Take a taste. Come join us.", "Book your table today!", "We look forward to welcoming you to MATSUBA!" | Our Story / homepage / reservations (copy deck) | Evening headline, booking panel, footer, menu title. |

Wordmark: "MATSUBA" set in Albert Sans 500 at 0.45em tracking, between thin gold rules like a card head. It is a working wordmark in this concept's own type, not a redraw of the logo file.

---

## The signature: "Sear"

**Seared dishes, listed from the copy deck only** (13 entries on the menu page, 12 distinct dishes):

| Course on menu page | Dish | The menu's own words |
|---|---|---|
| Appetizers | Salmon Aburi Carpaccio | "Torch-seared salmon pieces with yuzu miso dressing" |
| Appetizers | Tuna Tataki | "Torched-seared tuna slices with mooli and ponzu sauce" |
| Sushi & Sashimi · Sushi Mori | Salmon Combo_B | "…4 pieces aburi nigiri…" (the set includes aburi nigiri) |
| Sushi & Sashimi · Aburi Nigiri | Toro, Shake, Hotate, Suzuki, Maguro, Hamachi, Saba, Unagi | section "ABURI NIGIRI"; strapline "2 piece portions of flame seared nigiri" |
| Tasting menu | Salmon Aburi Carpaccio | "Torch-seared salmon pieces with yuzu miso dressing" |
| Tasting menu | Lion King nigiri | "Salmon aburi nigiri with cheddar" |

Not seared, deliberately: anything "grilled" (Grilled Scallops, Yakitori, teriyaki, Black Cod Saikyo-yaki), and "Lion King Aburi" from the 2024 GF PDF (not on the live menu, [TO CONFIRM]). Detection in the build is the regex `aburi|seared` over name, description and sub-head, which reproduces exactly this list.

**How it works**
- Each seared name is a span with two copies of its text drawn by CSS: a char rim underneath (`-webkit-text-stroke`) and a caramelised face on top (`background-clip: text`, a toasted-gold to ember to brown gradient with faint torch mottling).
- A registered custom property `--p` (the torch's position) drives everything: a hard gradient stop shows raw burgundy (raw tuna) ahead of the torch and caramel behind it; a thin ember band rides just behind; and the SVG flame (brass nozzle, blue core to amber tip, heat bloom) is positioned at `left: var(--p)`. One `transition` on `--p` keeps flame and colour in exact sync.
- **Legibility at every frame:** every colour the letters pass through is at least 4.5:1 on marble: raw burgundy #640934 (11.5:1), ember #9C4A10 (5.5:1), toasted gold #8A6421 (4.8:1), toast #7A3F12 (7.4:1), brown #3F2B1C (11.9:1). The heat bloom is kept at 20% alpha with `multiply` so the background under the hot edge stays light enough.
- **One torch:** a scheduler starts each sear as the previous one is ~60% done, so the eight nigiri sear in reading order like one hand moving along the counter. The hero sears "Tuna" then "Tataki" once the web fonts are ready. "Sear it again" replays it; hover replays any seared name.
- **Reduced motion, no JS, or a browser without `@property`:** the names are simply shown in their finished, seared state. No flame, no flicker.
- **Menu filter:** the "Aburi" label bar is a real `<button aria-pressed>`; pressing it hides everything the torch doesn't touch (dishes, sub-sections, courses and their nav labels), announces "Showing the 13 seared dishes, each with its torch mark." in a `role="status"` live region (also visible on tablet and desktop), and runs the torch over the seared names now on screen. The badge count is computed from the DOM. `menu.html?aburi` opens with it pressed (linked from the homepage).
- Every seared dish carries a static torch mark (ember outer, blue core) with the hidden text ", seared".

---

## The swap test

Replace "Matsuba" with any other Japanese restaurant and the concept collapses:
- The hero is *their* signature dish, in *their* menu's own spelling ("Torched-seared"), at *their* price (14.9), and the website promotes it because their homepage does.
- The sear runs only over the dishes *their* menu calls aburi or seared: eight named fish, a carpaccio, a combo and a "Lion King nigiri with cheddar". Another restaurant's list would be different or empty.
- The visual system is copied from *their* printed card: their burgundy, gold, taupe and brown (exact hex values from the files), their gold-ruled tracked heads, their bullets, their green vg marks, their takeaway label bars.
- The drawings are of *their* room and frontage: the copper-holder candle, the white marble table with black pebble rests, the orchids on their slate sill beside their lit menu case.

The honest weak point: "aburi" itself is a technique many Japanese restaurants use, so the sear *as an effect* is not unique. What makes it only-here is what it's applied to (their exact list and wording) and the print system it lives in. A rival with an aburi section could borrow the animation, but not the page.

---

## Distinct from A and B

- **A ("Under the awning")** draws the whole frontage and walks down the long room (brick, lamps, fairy lights). C uses none of the brick, lamps, fairy lights, awning or room walk; its window drawing is a close crop of one sill and the menu case, not the corner frontage.
- **B ("The stepped wall")** builds everything from oak slats and brass sconces, and uses top-down pebble-rest section marks. C has no slats or sconces; the table appears as one perspective, candlelit evening scene and a hero still life.
- Type: Marcellus + Albert Sans (A: Josefin Sans + Source Serif 4; B: Urbanist + Spectral). Palette: print burgundy, gold, brown and taupe on marble. Motion language: one torch, left-to-right heat; every hover underline and button edge sweeps in the same ember gradient.

---

## Implementation notes

- Plain HTML/CSS/JS, no libraries (GSAP not needed). `js/aburi.js` is ~8 KB; IntersectionObserver for reveals, sears, the candle and course tracking.
- Fonts: Marcellus (one weight; the print's "bold serif" is given by a 0.024em text-stroke in the same colour) and Albert Sans (300 italic for descriptions, as the print uses light italic sans). Metric-adjusted fallbacks on Georgia and Arial (the overrides are estimates, not measured).
- `menu.html` was generated from `research/copy-deck.md` by a small script kept outside the repo, so the dish text, spellings and prices are the deck's, character for character. Kids and the Lunch & Early Evening card were set by hand from the deck. It is plain static HTML and can be edited by hand.
- Layout: centred card axis; the drawings step off it (table bleeds to the left edge, window to the right) on desktop.
- Gold #D1A75B is used only for rules, borders and on dark backgrounds; on light, gold text uses #7E5B1C (5.5:1). vg/v green is #2A7326 on light (5.3:1) and the print's own #42B23C on dark.
- Booking: plain links to Favourite Table and the phone number, with the published terms summarised on the page and "Nothing is booked on this page." No `window.open`, no fake confirmation. Ordering: link to Toast.
- Page-to-page: CSS `@view-transition` cross-fade where supported; ignored elsewhere.
- Self-review screenshots: `/tmp/claude-0/-home-user-Claude-code/e50707d5-9ec5-571e-9915-9e7145ebe50f/scratchpad/v2/build-matsuba-c/` (390/768/1440, mid-sear, at rest, filter, reduced motion, no JS). Zero console errors and failed requests on both pages at all three widths; no horizontal overflow; no duplicate ids or broken anchors.

## [TO CONFIRM] markers on the page
- Monday opening, and the lunch end time (homepage hours, menu title).
- Lunch Menu "Available between 12pm – 2:45pm" (lunch end time).
- Whether the Lunch & Early Evening set is still offered.
- The vegan and GF PDFs (2024, prices differ from the live menu).

## Spelling proposals (not applied; owner sign-off needed)
As published → suggested: "Uangi Steak" → Unagi Steak; "Eby Fry" → Ebi Fry; "(all samon)" → (all salmon); "South Amerian" → South American; "Chrispy" → Crispy; "chilli papper" → chilli pepper; "Yuzu Te" → Yuzu Tea; "Aperol Com Fanta" → (unclear; ask); "Vanila" → Vanilla; "Torched-seared" (menu) vs "torched-seared" (homepage) vs "Torch-seared" (Salmon Aburi Carpaccio) could be unified as "Torch-seared". The hero deliberately keeps "Torched-seared" as printed.

## Known limitations
- Hover re-sear needs a fine pointer; keyboard users get the sear by scrolling and by pressing "Aburi" (seared names are not made focusable, to avoid 13 extra tab stops).
- In browsers without `@property` (older Safari), names show already seared and the sear does not animate.
- If a seared name wraps onto two lines (long names on very narrow screens), both lines sear together left to right.
- The decorative text copies used for the sear rely on `content: attr() / ""` to stay silent for screen readers; very old browsers may read the name twice.
- The Albert Sans/Marcellus fallback metrics are estimated.
- The course bar scrolls horizontally on phones and tablets (with an edge fade) rather than wrapping.
- The illustrations are drawn from study of the reference photos, not measured; the orchid colours and the candle holder's proportions are approximations.

## Assets to replace
- Wordmark: the owner's logo file could replace the typeset wordmark (white on brown, as on the takeaway cover).
- Photograph slot on the homepage ("Shot list, no. 1").
- Optional: the owner's own scan of the Lunch & Early Evening card for reference when updating prices.
- `img/flame.svg` and `img/favicon.svg` are source copies of the inline flame and favicon.

## Photography shot list
1. Tuna Tataki on the white marble table, overhead, the moment the torch lifts: mooli and ponzu beside it, a black pebble chopstick rest in frame (homepage slot).
2. The torch in use over a tray of aburi nigiri, side-lit, blue flame visible (menu page header, if wanted).
3. Lion King nigiri, close, cheddar just blistered.
4. The candle in its copper holder on a laid table at dusk, shallow focus.
5. The window from Red Lion Street at blue hour: orchids on the sill and the lit menu case.
6. A printed Lunch & Early Evening card on the marble table, for the menu page.

## Structured data and llms.txt

**Encoded** (facts from `research/copy-deck.md` only):
- `index.html`: one JSON-LD block (it replaces the earlier block, which also pointed `menu` at the live site's `/matsuba-menu/`). Type `Restaurant`, `servesCuisine` "Japanese", `name`, `description` ("We are a family-run Japanese restaurant well established in the heart of Richmond, South West London. Pull up a chair. Take a taste. Come join us.", sentences shown on this page), `foundingDate` 2004 ("First opened in 2004"), `address` (10 Red Lion Street, Richmond, TW9 1RW, GB), `telephone`, `email`, `url` https://matsuba.co.uk/, `sameAs` Instagram (@matsuba.london), `acceptsReservations` = the Favourite Table URL, `potentialAction` ReserveAction (Favourite Table) and OrderAction (Toast, collection), `hasMenu` https://matsuba.co.uk/menu.html.
- `menu.html`: one `Menu` block (it replaces the earlier `Restaurant` block): 8 sections, 141 items, 141 GBP offers, generated from this page's own DOM. Names, descriptions and spellings are as printed ("Uangi Steak", "Eby Fry"). A dual price such as "12.9/22.9" is two offers with no variant label, because which price goes with which variant is [TO CONFIRM]; "6.9/6.9" is one offer. `suitableForDiet` is set only where a vg/v mark covers the whole dish (not "Katsu Curry (… Pumpkin vg)"). Each kids bento is one priced item. The tasting menu's "£100 per person (minimum 2 persons)" is the section description; its 14 dishes carry no individual price.
- `llms.txt`: name, one-line description, address, phone, email, Instagram, hours as published with Monday and the lunch end time marked "to confirm", booking (Favourite Table, up to 12 guests online) and collection ordering (Toast, 20% off collection), links to the menu and the takeaway PDF, a preview note matching the page banner.
- `<meta name="description">`: index 161 characters, menu 155 characters. The menu one no longer advertises the Lunch & Early Evening set.

**Deliberately left out, and why:**
- `openingHoursSpecification`: Monday opening and the lunch end time (3pm, 2:45pm or 2:30pm) are disputed. A partial schedule would tell search engines the restaurant is closed at times it may be open, so hours appear only in `llms.txt`, flagged.
- The Lunch & Early Evening set menu (whether it still runs is [TO CONFIRM]); the lunch-menu time "12pm – 2:45pm"; the 2024 vegan and gluten-free PDFs ([TO CONFIRM]); the expired kids promotion; delivery (never mentioned).
- `geo`: `research/identity.md` has an FSA geocode, but no coordinates are shown on the page.
- The Food Hygiene Rating, the name's meaning, heritage, people and any review or "best" claims.

**Notes:**
- **Official-domain assumption.** `url`, `@id` and `hasMenu` assume this concept is deployed at https://matsuba.co.uk/ with the menu at `/menu.html` (the file name this concept uses). If the live site keeps a different menu path, change `hasMenu` and the Menu `url`/`@id`, or add a redirect. `llms.txt` links to the menu relatively (`menu.html`), so it works on the preview and on the domain.
- **Matches the visible page.** Every price, phone number, hour, address part, description sentence and booking/order link in the JSON-LD was checked against this page's `document.body.innerText` (plus each menu tab's panel), and each menu price is paired with its own printed line. `llms.txt` phones, emails, times and links were checked against the index and menu pages. No console errors. Nothing visible changed: only the JSON-LD block and `<meta name="description">` in `<head>` were edited.
- **Preview mechanisms untouched.** The "speculative design proposal" banner is unchanged. Note: neither page has a `<meta name="robots" content="noindex">` tag (there was none before this pass, and none was added); if previews rely on `noindex`, it must come from the host (an `X-Robots-Tag` header).
- **Regenerating.** Scripts: `/tmp/claude-0/-home-user-Claude-code/e50707d5-9ec5-571e-9915-9e7145ebe50f/scratchpad/v2/aivis/jsonld/` (`extract.js` reads items and prices from each menu page's DOM, `build.js` writes JSON-LD, meta and `llms.txt` from `facts.js` (copy deck only), `validate.js` checks against the rendered pages, `servers.sh` serves ports 8701–8709). Re-run them if a menu or a fact changes.
