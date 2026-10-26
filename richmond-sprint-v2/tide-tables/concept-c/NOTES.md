# Tide Tables Café: Concept C, "Ride the tide" (the river at the door)

**In two lines:** The page is drawn as one tide at the Richmond riverside steps, by the café's door. As you scroll, a drawn waterline rises over the steps and lifts the moored skiffs. Then it falls, and the half-tide weir holds it, the way the river here really behaves.

Port 8523 · `python3 -m http.server 8523 --directory tide-tables/concept-c`

---

## The signature: "The waterline"

- **Source detail:** the tidal Thames at Richmond and the half-tide weir. Its gates are raised for about two hours either side of high water, and the rest of the time it holds the reach at or above half-tide (identity #3; `[S18]` Wikipedia, Richmond Lock; `[S19]` PLA wording in search excerpts). The setting is the Richmond riverside steps with wooden skiffs moored for hire (identity #10; café gallery `[S2]`; client photo 2 `[S24-2]`).
- **How it works:**
  - **Hero.** The hero is an original SVG of the riverside steps seen from the water: stone flights with a tide mark, the towpath railing, lamp posts, the hire A-board, the terrace wall and planes, and five clinker skiffs on mooring ropes.
    - The hero scene stays sticky while two text beats scroll over it (no scroll-jacking). Since the Useful-first pass this is 0.6 of a screen on phones, with a shorter hire-board beat; it was 1.0.
    - Three translucent water layers move together with a CSS variable `--tide`. The submerged steps show faintly through them, and the skiffs rise and bob.
    - `js/tide.js` redraws the mooring ropes each frame so they slacken as the boats lift.
  - **Tide model** (`js/tide.js`).
    - Sections carry `data-phase` anchors (0.5 = high water). Scroll position is interpolated between the anchors to a phase, then turned into a level the Richmond way: `max(natural tide, held floor)`.
    - So the water never drops below a "held at half-tide or above" floor, except in the dashed comparison line. The page is a diagram of this river, not a generic tide.
  - **The same line runs across the whole site:**
    - every land/river edge (`.shore` bands, four on the homepage and one on the menu);
    - the waterline through the H1, where letters below the line turn river-coloured;
    - the wave edge on the mobile action bar;
    - the live readout in the tidal section ("This page's drawn tide: Gates up: falling");
    - the dot on the illustrative tide diagram.

    All of these read the one `--tide` value.
  - **The weir in one sentence of verified fact:** "Downstream, Richmond's half-tide weir, opened in 1894, raises its gates for about two hours either side of high water, and the rest of the time holds the river here at or above half-tide." `[S18][S19]`
  - **Real times:** a "Real tide times: Port of London Authority" button links to `https://pla.co.uk/tidal-information`.
    - The PLA site blocks automated loading (Cloudflare 403). The URL was confirmed only from a site-restricted search result, so check it in a browser before launch.
    - The search result also noted that PLA predictions are for personal use, and that reuse needs the PLA's agreement. That is another reason no real times are shown.
  - **No tide times anywhere.**
    - The chip says "Drawn tide, illustrative".
    - The diagram is captioned "Illustrative shape only: not today's tide, and no times".
    - The copy says "Despite the name, there are no tide times on this site."
- **Reduced motion:** a static mid-tide line everywhere (`--tide: .5`). There is no drift, bob or reveal. The chip reads "Mid-tide (still)" and the diagram dot sits at mid-tide.
- **No JS:** the same static mid-tide composition. All content is visible, and the whole map route and every step are listed.

## Only-here details used, and where

| # | Detail | Source | Where it appears (as design) |
|---|---|---|---|
| 1 | Tidal Thames at Richmond; half-tide weir (1894), gates up about 2 h either side of H.W., river held at/above half-tide | identity #3; `[S18][S19]` | The whole signature: the scroll tide model with its held floor, the hero, the shores, the H1 waterline, the diagram, the readout and the chip states ("Gates down: held at half-tide or above", "Gates up: rising / high water / falling") |
| 2 | The Richmond riverside steps, with wooden skiffs moored for hire | identity #10; `[S2]` gallery; `[S24-2]` client photo 2 | Hero illustration: steps with a tide-mark stain and grass in the joints, the railing, clinker skiffs (two under blue covers) on ropes to rings. The menu page's food list steps down like the flight ("Down the steps"), and the drinks sit below the waterline |
| 3 | The boat-hire board next door: "HIGH WATER · Ride the tide · LEAVE before H.W." | identity #10; `[S24-2]` | A drawn A-board in the hero scene. The quote is set as a chalk board in Unbounded with an SVG chalk filter, and captioned on the page and in the footer as the separate boat-hire business's board, **not the café's sign** |
| 4 | The gravel garden under three plane trees, beside the bridge's stone arches, with black wire-mesh chairs | identity #7; café's own words `[S1]`; `[S24-4]` client photo 4 | `img/garden.svg`: three trunks with flaking, plated plane bark (as an SVG pattern), plane-leaf canopy, the bridge's pale arches and balustrade, gravel stipple with drifting dapple, black wire-shell chairs and dark tables. The bark pattern (`img/bark.svg`) also forms the garden section's datum line |
| 5 | The walk to Hollyhock: towpath upstream to Grotto Gate, the tunnel and steps up into Terrace Gardens; the café's "ask for a free local map" | identity #12; copy deck §8; `[S7][S15][S1]` | An interactive step-through sketch map on a folded-paper sheet (5 steps, Previous/Next, keyboard arrows, the route drawing in). Stamped "NOT TO SCALE". Uses the café's own line "Looking for Hollyhock? Stop in and ask for a free local map!" |
| 6 | Café in a converted arch beneath Richmond Bridge, on the Thames Path | identity #1, #11; `[S1][S10]` | The hero lede, map step 1 (an arch glyph under the bridge), and the Find us heading "Under the bridge, on the towpath" |
| 7 | Hollyhock postcode conflict (TW10 6UX site vs TW10 6RH council) | copy deck §8; `[S1][S14]` | Hollyhock card: the postcode carries a "to confirm" marker plus a visible note naming both |
| 8 | Counter board headings "Coffee", "Tea", "Organic Wines & Beers" | copy deck §6; `[S24-1]` | Menu drink sections (with "All our wines are vegan" marked "to confirm") |
| 9 | The café's voice and ethos | copy deck §5; `[S1]` | Big-type quote "The sort of place you can hang out all day for the price of a cup of coffee." The sunny-days warning is set as a black signal strip |

Colour comes from the place: river #6F8798, deep river #2F4250, gravel #E9E3DA, plane green #6D704A, skiff varnish #A89275 and chalk black #141312, with chalk white on black as the hire-board accent.

## The swap test

Swap "Tide Tables" for any other vegetarian café and the concept breaks:
- **The signature is a model of one river, not "water".** The level is held at half-tide by a specific weir, its gates come up around high water, and the page explains this in one verified sentence and links to the authority for this stretch of the Thames.
- **The hero is these steps.** It shows these skiffs and this hire board's wording, quoted and credited.
- **The second moment is a walk that exists only from this door,** to this café's own sister café, through Grotto Gate, built on the café's own "free local map" habit.
- **The garden is these three planes beside Richmond Bridge's stone arches,** with these chairs.
- **Even the menu layout is the steps going into the river.**

No cuisine clichés are used. The name "Tide Tables" is never claimed to mean anything (its origin is unknown).

## Implementation notes

- **Stack:** plain HTML, CSS and JS, with no frameworks or GSAP. Motion is CSS keyframes plus one rAF loop (`js/tide.js`) that runs only while the tide is moving.
- **Fonts:** Unbounded (display, 300/500/700/800) and Onest (text) from Google Fonts with `display=swap`. Metric-adjusted fallback faces (`Unbounded Fallback`, `Onest Fallback`) are approximate.
- **Wordmark:** "Tide Tables" set in Unbounded is a working wordmark. The café's logo is not redrawn.
- **Layout logic, "the datum":** every section hangs from one rule. The heading stands on the line, and the text hangs below it, offset right on desktop (columns 6–12), like a waterline. Land sections are gravel and river sections are deep water. The shore between them moves with the tide.
- **Artwork:** all illustration is original SVG, generated deterministically by a script kept outside the repo (scratchpad `build-tide-c/gen/gen.py` and `build.py`). The hero, map and diagram are inlined in `index.html` so CSS variables can drive them, and the garden is `img/garden.svg`. Reference photos were studied for proportion and colour only. Nothing was traced or embedded.
- **Hero art sizing:** on phones the scene is scaled up (`width: max(100%, 118svh)`) and sits above the action bar. On landscape desktop it is offset down so the wall sits about 60% of the way down, leaving sky for the name (left) and the practical column (top right).
- **Actions:**
  - Find us, Call and Menu sample sit in the first frame at every width: the Today strip, the fixed bottom bar on phones, and the sticky header from 768px.
  - On the menu page the bar offers Find us, Call and Menu sample (current).
  - There is no booking. Parties are by phone.
- **Accessibility:**
  - Skip link, landmarks and a logical heading order.
  - Visible `:focus-visible` on light and dark grounds.
  - All tap targets are 44px or more.
  - The map stepper uses real buttons with `aria-current="step"`, `aria-expanded` and a polite live region.
  - Decorative tide readouts are `aria-hidden`, and the SVGs have title/desc.
  - axe-core 4.10 (wcag2a, wcag2aa, best-practice) reports 0 violations on both pages at 390 and 1440.
- **Checked:** zero console errors, no failed requests, and no horizontal scroll at 320, 390, 768, 1440 and 2560.
- **Page transitions:** `@view-transition { navigation: auto }` only when motion is allowed. It degrades to normal navigation.

## Content and honesty

- **Hours:** only the café's own published hours (`.co.uk` Contact page) plus "For more specific information, please call +44 (0)20 8948 8285." No VisitRichmond times are used.
- **Hours update (26 Oct 2026):** The hero hours line and the "Hours" block in Find us now show the café's published hours, "Mon–Fri from 7:30am (food and drink from 8am) · Sat–Sun from 7am (from 7:30am) · until dusk", with "please call +44 (0)20 8948 8285" kept for specifics. Source: the café's second official site, Contact page http://www.tidetablescafe.co.uk/contact/ (fetched with curl over http; see `research/dossier.md` S27). The Find us hours lose their quotation marks, because the display line is a summary of the café's wording, not a verbatim quote. The JSON-LD `description`, `<meta name="description">` and `llms.txt` carry the same text. No `openingHoursSpecification`: "dusk" is not a time, and no offline validator was available to confirm an `opens`-only entry is accepted. Only hey@tidetablescafe.com is shown, so contact@tidetablescafe.co.uk is not in the JSON-LD. Hollyhock stays "daylight hours". No VisitRichmond times.
- **Menu:**
  - The menu page is a clearly labelled sample. A sticky "Sample layout: not the current menu" strip runs above everything, and the brief's exact banner sits at the top.
  - It uses only the published taster items, with no prices, and carries the café's approved disclaimer.
  - "Juices & smoothies" is our section label for two published items; the page says which headings come from the board.
- **"To confirm" markers:** the 2017 walk route, the Hollyhock postcode, The Jam Jar, current boat services, and "All our wines are vegan".
- **Left out:** dated details (blankets, free refills, the hanging skiff). The keystone face and the bridge facts are left to concepts A and B.
- **Not claimed:** that the café's garden floods; anything about the keystone; the origin of the name.
- **Footer:** carries the honesty line, the link to tidetablescafe.com, and the credit for the hire-board quote.

## Known limitations

- **PLA link:** the URL (`pla.co.uk/tidal-information`) is from a search result, because the PLA site blocks automated checks. Verify it by hand.
- **Not live:** the tide is illustrative by design. Showing real Richmond predictions would need PLA agreement (client question 20).
- **The "held" floor:** in the diagram and model it is drawn slightly above half-tide ("at or above half-tide") as a reading aid, not to scale.
- **Hero detail:** the hero is illustrative and simplified. The terrace behind the steps is generalised (wall, hedge, planes), with no buildings or people.
- **Map:** the map is a sketch from the 2017 route description. Its geometry, house count and the Hollyhock building are not surveyed.
- **Very wide screens:** at 2560px the skiffs sit close to the bottom edge at the lowest drawn tide.
- **Fallback metrics:** the font fallback metrics are estimates, not measured.
- **Weight:** `index.html` is about 190 KB because the hero SVG is inline. The garden SVG is about 218 KB and lazy-loaded.

## Assets to replace

- **Logo:** keep the Unbounded wordmark, or supply the café's cream serif logo as a vector file for a labelled logo slot.
- **Photo slot:** the riverside steps at high water (see the shot list).
- **Hollyhock:** a confirmed postcode, walking time and distance; then remove the "to confirm" markers.

## Photography shot list

1. The riverside steps from the towpath at high water, skiffs afloat and the tide mark showing, early on a summer morning. This is the slot in the "own words" section.
2. The same steps with the gates down, river held, from the same position, as a pair to 1.
3. The garden under the three planes at mid-morning: gravel, black mesh chairs, the bridge's stone arches behind. Wide, at eye level.
4. Plane bark close-up: the flaking cream and olive plates (for texture reference or a detail crop).
5. The walk: Grotto Gate from the towpath, the tunnel, and the steps up into Terrace Gardens, for the map steps.
6. Hollyhock Café from the Terrace Gardens path, with the river view behind.
7. Counter details: the drinks board headings, Popina tarts and the jacket potatoes, for a future real menu, never staged.

## Structured data and llms.txt

**Encoded** (facts from `research/copy-deck.md` only):
- `index.html`: one JSON-LD block (it replaces the earlier one). Type `CafeOrCoffeeShop`, `name`, `description` ("A café in a converted arch beneath Richmond Bridge, right on the Thames Path. Mon–Fri from 7:30am (food and drink from 8am) · Sat–Sun from 7am (from 7:30am) · until dusk. For more specific information, please call +44 (0)20 8948 8285."). This includes the café's published hours, which are visible on this page. Also `servesCuisine` "Vegetarian" ("The food is all vegetarian"), `address` (2 The Arches, Richmond, Surrey, TW9 1TH, GB), `telephone`, `email` and `url` https://tidetablescafe.com/.
- `menu.html`: a minimal `CafeOrCoffeeShop` identity block (name, url, telephone, all visible there) so the two pages agree. **No `Menu` JSON-LD**: Tide Tables publishes no menu or prices, and this page is a labelled sample layout. The earlier blocks on both pages said `Restaurant`.
- `llms.txt`: name, the one-line description in the café's words, address, phone, email (with "only monitored periodically"), the published hours ("Mon–Fri from 7:30am (food and drink from 8am) · Sat–Sun from 7am (from 7:30am) · until dusk", from the café's `.co.uk` Contact page, then "For more specific information, please call…"), "no online booking, please phone", and a link to the menu page described as a sample layout with no current menu or prices. A preview note matches the page banner.
- `<meta name="description">`: index 163 characters, menu 162 characters, both in the café's voice.

**Deliberately left out, and why:**
- `openingHoursSpecification`: the café publishes opening times but closes "till dusk", which is not a clock time; hours stay in `description` (see the hours update above).
- `hasMenu` and any `Menu`/`MenuItem`/prices: no published menu exists.
- `acceptsReservations` and `potentialAction`: there is no online booking, and the booking or walk-in policy is [TO CONFIRM].
- The private-parties number (whether it is current is [TO CONFIRM]), The Jam Jar, boat services, blankets, refills and the plane-tree count ([TO CONFIRM]), and Hollyhock Café (a separate business with a disputed postcode).
- `sameAs`: the café has no known social accounts. `geo`: no coordinates in the research.

**Notes:**
- **Official-domain assumption.** `url`, `@id` and `hasMenu` assume this concept is deployed at https://tidetablescafe.com/ with the menu at `/menu.html` (the file name this concept uses). If the live site keeps a different menu path, change `hasMenu` and the Menu `url`/`@id`, or add a redirect. `llms.txt` links to the menu relatively (`menu.html`), so it works on the preview and on the domain.
- **Matches the visible page.** Every price, phone number, hour, address part, description sentence and booking/order link in the JSON-LD was checked against this page's `document.body.innerText` (plus each menu tab's panel), and each menu price is paired with its own printed line. `llms.txt` phones, emails, times and links were checked against the index and menu pages. No console errors. Nothing visible changed: only the JSON-LD block and `<meta name="description">` in `<head>` were edited.
- **Preview mechanisms untouched.** The "speculative design proposal" banner is unchanged. Note: neither page has a `<meta name="robots" content="noindex">` tag (there was none before this pass, and none was added); if previews rely on `noindex`, it must come from the host (an `X-Robots-Tag` header).
- **Regenerating.** Scripts: `/tmp/claude-0/-home-user-Claude-code/e50707d5-9ec5-571e-9915-9e7145ebe50f/scratchpad/v2/aivis/jsonld/` (`extract.js` reads items and prices from each menu page's DOM, `build.js` writes JSON-LD, meta and `llms.txt` from `facts.js` (copy deck only), `validate.js` checks against the rendered pages, `servers.sh` serves ports 8701–8709). Re-run them if a menu or a fact changes.

## Useful-first pass (26 Oct 2026)

The client felt the signature came before being useful. The waterline is still the page, but the essentials now sit beside it. The standard is `pipeline/research/information-hierarchy.md` §(b); the audit is `pipeline/research/useful-first-audit.md`. Facts come only from `research/copy-deck.md`.

**What changed**
- **Today strip on a solid paper panel,** directly under the name, so the drawing never crosses it (at 660 it used to overlap the lamp post). It holds:
  - "Today, Monday · Open from 7:30am · food and drink from 8am · until dusk", from an inline script before first paint in London time, including the Christmas Day and Boxing Day hours. Without JS it shows the whole week.
  - "Under Richmond Bridge, on the riverside", linked to Google Maps;
  - Call (with 020 8948 8285) · Find us · Menu sample;
  - "Skip to visit info".
  - The longer lede shows from 768 px up.
- **Visit block second,** straight after the hero (Find us was at screen 11). It is a land section on gravel. It holds:
  - the "What's served" line, linking to the menu sample;
  - the full hours by day, plus Christmas Day and Boxing Day, and "For specifics, call 020 8948 8285";
  - the address with "beneath Richmond Bridge", a map link, and how to find it from the bridge and from the towpath;
  - parking and step-free access, both "not published, to confirm";
  - outdoor seating in the garden, "very crowded on sunny days" (as the black signal strip), and parties on 07922 474327;
  - booking and dogs, both "to confirm"; the email; and boats, "to confirm".
  - It carries no `data-phase`, so the tide still runs smoothly from the hire board (high water) into the tidal section.
- **The hero on phones** is pinned 0.6 of a screen (was 1.0): the hire-board beat is shorter on phones.
- **"Pause the water":** a visible button in the hero, stacked above the tide chip.
  - It stills every drift and bob, and the choice is remembered in `localStorage`, wrapped in try/catch.
  - It is hidden when nothing moves (reduced motion, no JS).
  - The text layer above the scene now lets taps through, so the button is reachable.
  - The shores and the bar's little tide drift only while you scroll. The hero water is the only loop that runs on its own, and it has the pause.
- **Revealed content is also plain text:**
  - The tidal section now says in words what the scroll does: the water rises to high water, falls, and is held at half-tide or above.
  - Every walk step's description stays visible; the stepper only highlights the current one.
  - A one-line route sits above the map, marked "to confirm".
- **Labels:**
  - Nav: Hours & find us · Menu sample · Garden · Walk to Hollyhock · About the river.
  - The menu-page bar is now Find us · Call · Menu sample.
  - `scroll-padding-bottom` is set to the bar height plus 8 px.
- **Menu page:**
  - The sample strip and banner are kept.
  - An "On this menu" jump row is added (Food · Coffee · Tea · Juices & smoothies · Wines & beers), with back-to-top links.
  - The banner reserves the extra line Unbounded adds over its fallback on phones, which took CLS from 0.086 to 0.013.
  - No dietary marks are used, so no legend is needed.
- **Kept:** fonts, palette, illustrations, the tide model, JSON-LD and `llms.txt`. No visible fact that they encode changed.

**Measured** (390 wide, motion; Playwright):

| | 390×660 | 390×844 |
|---|---|---|
| Today strip | 191–394 px | 202–405 px |
| Visit starts | 1,127 px | 1,362 px |
| "What's served" | 1,371 px | 1,606 px |

- No focused element was hidden under the bar in a 60-Tab run, on either page.
- QA (`qa.sh … 8949 v2-tide-c-uf`): no console errors, no failed requests, no bad links, no overflow, and axe clean. CLS: index 0.002 / 0.006 / 0.011 and menu 0.013 / 0.064 / 0 (390 / 768 / 1440). The 768 menu figure comes from the Unbounded fallback metrics that were already there, and it stays under 0.1.

**Rubric re-score** (items 8, 10 and 13 n/a; maximum 26)

| # | Item | Before | After | Why |
|---|---|---|---|---|
| 1 (G) | Essentials on screen 1 | 2 | 2 | On a solid panel at 660 and 844 |
| 2 (G) | Time to essentials | 2 | 2 | Plain HTML at first paint |
| 3 (G) | Parallel, not a gate | 2 | 2 | Strip, bar and skip link |
| 4 | Signature budget | 1 | 2 | Pinned 0.6 screen; the water has a visible pause; shores move only with scroll |
| 5 | Hidden content duplicated | 2 | 2 | The tide is described in words; all walk steps are visible |
| 6 (G) | Reduced motion and no JS | 2 | 2 | Static mid-tide plus the strip |
| 7 | Hours table | 2 | 2 | Today on screen 1; the full table by day, with seasonal hours, on screen 2 |
| 9 | Find us | 1 | 2 | Screen 2 (was 11): address, map, transport, from the bridge and the towpath; parking and step-free flagged "to confirm" |
| 11 (G) | HTML menu | 2 | 2 | Unchanged |
| 12 | Menu navigation | 1 | 2 | "On this menu" jump row and back-to-top |
| 14 | Action bar | 1 | 2 | Three literal items; `scroll-padding-bottom` set |
| 15 | Accessibility of the interaction | 1 | 2 | Pause control; keyboard stepper |
| 16 | Literal labels | 1 | 2 | "The walk" and "The river" are now "Walk to Hollyhock" and "About the river" |
| | **Total** | **20/26** | **26/26** | |

**Still worth knowing**
- The hero water still drifts by default (with the pause). If the client prefers, it could settle after one pass instead.
- Parking and step-free access score only because the standard accepts "to confirm" placeholders. Both need answers from the client.

## Pitch notes (not for the site)

Editorial pass, 26 Oct 2026. The client asked that every word on the page reads as the café talking to customers, not as the designer explaining the design. These lines and elements were cut from the pages; the rationale stays here for the pitch.

- **The tide engine explanation** is down to two sentences and the PLA link: "The Thames at Richmond is tidal. Downstream, Richmond's half-tide weir raises its gates for about two hours either side of high water." Cut: "opened in 1894" (not in the copy deck); "and the rest of the time holds the river here at or above half-tide"; "Despite the name, there are no tide times on this site. The tide you scroll through is drawn, not measured: as you scroll, the water rises…"; the "This page's drawn tide" readout; and the annotated tide-shape diagram (H.W., gates up, held, half-tide, the dashed natural tide) with its caption "Illustrative shape only… The dot follows this page's drawn tide as you scroll." The hero's short "Drawn tide, illustrative" chip and "Pause the water" stay. The button now reads "Tide times: Port of London Authority". `tide.js` tolerates the missing diagram marker.
- **Hire-board caption:** "Quoted from the boat-hire board next door, a separate business. It isn't the café's own sign, but it's how the river here keeps time." is now "From the boat-hire board next door." The footer credit ("…is quoted from the boat-hire board… Weir facts follow the Port of London Authority's published wording. All illustrations are original drawings made for this proposal.") was cut on both pages.
- **"In the café's own words"** framing and the quotation marks around the café's own sentences were removed throughout: on its own site the café doesn't quote itself. The section's eyebrow is now "Stay all day".
- **Garden caption:** "Drawn for this proposal from photographs of the garden: gravel underfoot, black mesh chairs, the bridge's stone arches, and bark that flakes in plates."
- **Photo placeholder:** "Photograph to commission: the riverside steps from the towpath at high water…". See the shot list.
- **Hollyhock walk:** "This is only our sketch of the walk, drawn from the café's directions. Ask for the real map when you stop in."; "The route in one line…" (it duplicated the five steps); the map caption "No distances or walking times until the route is measured. Route from a 2017 Thames Path guide." (now "Not to scale. Route to confirm"); the postcode note "The café's site gives TW10 6UX. Richmond Council lists Terrace Gardens as TW10 6RH." (the "to confirm" marker and HTML comment stay); and the repeat of "Open during daylight hours" in step 5.
- **Food teaser:** "We've made a sample layout from the dishes mentioned on their site, without prices." is now "Our menu sample has no prices."
- **Duplicates removed:** "You'll find people out there all year round" (Good to know; kept in the garden) and "Watch out… crowded on sunny days" (café section; kept in Good to know).
- **Menu page:** "Food on the steps, drinks in the river." (explained the layout); "Coffee, Tea and Organic Wines & Beers are headings from the café's counter board."; "Every item above is one the café mentions on its own site. The café publishes no prices, so none are shown." The H1 "Down the steps" is now "Food and drink".
- **Hero illustration description (screen readers):** "As you scroll, the drawn water rises over the steps and the skiffs lift…" was removed.
- **Kept:** the sample-menu banner and strip, every "to confirm" marker, the waterline, the walk stepper and map, and the footer's existing honesty line (nothing new added).
- **Page length at 390×844:** index 13.5 → 11.4 screens; menu 4.0 → 3.6.
