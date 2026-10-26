# Tide Tables, concept A: "Under the keystone"

**In two lines:** you enter the website the way you enter the café, under the carved bearded face at the keystone of a brick arch beneath Richmond Bridge. Scrolling walks you down the whitewashed vault, past the ferns, festoons, oilcloth tables and chalkboards, to the far door, the garden and the Thames. Every page after that lives inside the vault.

A speculative design proposal. It is not the official site and is not endorsed by Tide Tables Café (this is stated in every footer).

Run it with `python3 -m http.server 8521 --directory richmond-sprint-v2/tide-tables/concept-a`, then open http://localhost:8521/.

---

## The signature: "Through the arch" (index.html)

- **Built from:**
  - the brick arch with its carved stone face as keystone, over a glazed arched screen (identity.md detail 4; café Gallery photo `thumbs_img_3037-1` [S2]; client photo 3 [S24-3]);
  - the long whitewashed barrel vault with a glazed door at the far end (identity.md detail 5; client photo 1 [S24-1]).
- **How it works:**
  - `js/vault.js` is a small perspective renderer. It draws one SVG from real 3D points in metres: the vault section is about 5.2 m wide and 3 m to the crown, and the drawing is not to scale.
  - Planar things are vector groups scaled about the vanishing point, so every frame is crisp at any depth. These are the arch front, the far wall with its brick door arch, and the garden view.
  - Everything else is projected point by point: the barrel rings, tiled floor, coursing, worn-brick patches, tables, chairs, counter, chalkboard, pendants, ferns and festoons.
- **What you see as you scroll:**
  1. The arch front is the hero. It is drawn in sooty purple-brown brick laid in stretcher bond, with pale mortar and two rings of radiating voussoirs.
  2. Under the keystone face are the steel-framed glazed screen and double doors with D handles, the hanging CAFÉ sign, and festoon bulbs following the curve of the arch.
  3. You approach, and the face's eyes drop to look down at you. The glass doors swing open and you pass under the keystone.
  4. Inside, the ferns stir in their baskets while you walk (CSS, ±2.4°; paused whenever the scroll stops, so nothing loops on its own). The festoon bulbs along the two strings light ahead of you down the curve.
  5. At the end, the far door opens onto gravel, a plane tree, a stone bridge arch and the river.
- **How it scrolls:**
  - The section is 180svh tall on phones and 250svh on desktop, with a sticky 100svh stage (pinned 0.8 of a screen on phones, 1.5 on desktop; it was 330svh, 2.3 screens, before the Useful-first pass). The page scrolls natively; the script only reads the scroll position, with light easing.
  - There is no scroll-jacking, and the stage never blocks a tap.
  - The camera follows a monotone cubic path through keyframes, so there is no overshoot and no jerk between phases.
  - Rendering pauses when the section is off-screen.
- **Captions:** four short descriptive lines fade in at stages, near the top of the stage, and they are real text in the DOM.
- **Primary actions:** Find us, Call and Menu sample are reachable throughout. They sit in the Today strip on the first screen, in a fixed bottom bar on phones and in the header on desktop. There is no Book button anywhere.
- **Reduced motion:**
  - No sticky stage, no scrubbing, no sway.
  - The hero renders the arch front once, then a composed still of the vault (`img/vault-still.svg`, every bulb lit) sits beside the four captions as a list.
- **No JS:** a `<picture>` fallback of the arch front (`img/arch-front-tall.svg` and `img/arch-front-wide.svg`, chosen by aspect ratio), followed by the same still and captions.
- **Where the fallbacks come from:** all three fallback SVGs were rendered from `js/vault.js` itself, so they match the live drawing. The method is in the next section.

## Only-here details used, and their sources

| # | Detail | Where it appears (as design) | Source |
|---|---|---|---|
| 1 | **Brick arch with a carved, bearded stone face at the keystone** | Hero illustration. The face's eyes look down as you approach. A large portrait "Over the door" glances towards your pointer. Also the header mark, the favicon and the footer sign-off. Drawn from scratch as an interpretation. Never named: the page says only that who carved it, and when, isn't known (marked to confirm). | identity.md #4; S2 `thumbs_img_3037-1`; S24-3 |
| 2 | **Whitewashed barrel vault with old brick showing through** | The whole walk. `img/whitewash.svg` texture (turbulence-masked brick under limewash). Whitewashed sections have a barrel-vault top edge (Stay all day, the menu page), so the site "lives inside the vault". | identity.md #5; S24-1; S2 |
| 3 | **Ferns and trailing plants in woven hanging baskets** | Six procedurally drawn basket ferns and trailing plants in the vault, swaying. A fern sprig as the bullet for the ethos list. | S24-1; photo-notes |
| 4 | **Festoon lights following the curve** | The string just inside the glazed arch on the hero. Strings down the vault that light ahead of you. The header festoon, whose bulbs light as you read down the page (reading progress, on both pages). The bulb above each action in the bottom bar. | S24-3 (bulbs following the arch); S24-1 (strings of lights) |
| 5 | **Red enamel pendant shades over the counter** | Four pendants in the scene. On the menu page, a red enamel lamp hangs over every board and lights up over the board you're reading. | S24-1; identity.md colour table |
| 6 | **Grey polka-dot oilcloth** | Tables in the scene (dots projected in perspective). The oilcloth table in the "No two chairs alike" illustration. An oilcloth border on the parties panel. `img/oilcloth.svg` (my own pattern). | S24-1 |
| 7 | **Mismatched wooden chairs** | Four distinct chair designs (spindle-back oak, rush-seat ladder-back, bentwood, faded painted farmhouse) alternate down the vault and line up in their own illustration. They wobble on hover. | S24-1; S24-3 |
| 8 | **Chalkboards, one headed "Organic Wines & Beers"** | A long board above the counter in the scene. The "On the board" teaser. The whole menu page: my own chalk lettering (Gloock with an SVG chalk-grain filter, a sign-painter drop line and a drawn chalk swash) on a board ground with ghosts of old writing (`img/chalkboard.svg`). Board headings use only the legible names. | S24-1; dossier §4; identity.md "Signage" |
| 9 | **The long grey-panelled counter** | Right side of the vault. It also gives the **layout logic**: the café's voice sits on the "tables side" (left, whitewash and oilcloth), and practical things and the menu sit on the "counter side" (right, chalk black, bleeding off the right edge on phones). The menu page ends on the counter edge. | S24-1 |
| 10 | **The far door at the end of the tunnel** | The end of the walk: an exposed-brick arch and a glazed door that opens onto the garden. The garden photo slot is framed by the same brick arch. | identity.md #5; S24-1 |
| 11 | **Hanging "CAFÉ" sign** | Inside the glass on the hero, in dark serif capitals on cream. | S2; S24-3 |
| 12 | **Cakes under glass domes, globe wall lights** | Two domes on the counter and four globe lights on the left wall of the vault. | S2 (2018 Gallery) |
| 13 | **Gravel garden, plane trees, the bridge's stone arches, the river** | The view through the far door (mottled plane bark, canopy, a Portland-stone arch, the Thames). Also the garden section, in the café's own words. | identity.md #7; S24-4; S1 |
| 14 | **Converted arch beneath Richmond Bridge** | The hero line. One precise bridge fact (1777, Paine and Couse, Grade I, the oldest *surviving* Thames bridge in Greater London) under "Over the door". | S1; S9; S10; copy deck §7 |
| 15 | **"Ask for a free local map"; the Grotto Gate walk to Hollyhock** | "Looking for Hollyhock?" (route marked to confirm, with no distance or time). | S1; S7; copy deck §8 |

**Deliberately left out:**
- the skiff (its current status is unknown);
- blankets and free refills (2017 sources);
- the "FOOD" sign (its location is unknown);
- the HIGH WATER board (another business; it belongs to concept C);
- any tide data.

## The swap test

- **Swap in any other vegetarian riverside café** and nothing works. The hero is this arch, with this carved face, in this sooty brick.
- **The signature only makes sense here:** it is a walk through this vault from that face to that far door.
- **The navigation furniture comes from the room:** festoon bulbs, red enamel lamps, and the tables-left / counter-right plan.
- **The menu is drawn as their counter boards**, using their own published taster items and their board's headings.
- **No cuisine clichés are used** (no generic coffee-cup hero, no leaf motifs standing in for "vegetarian").
- **It fails only as copy:** take away the drawings and the copy is still theirs, so it would remain recognisably Tide Tables. I judge the concept a clear **pass**.

## Distinct from B and C

- **B** is the bridge as a Caslon copperplate elevation, with five-arch navigation and Portland-stone paper.
- **C** is the river as the clock, with Unbounded and Onest, a scroll waterline, the weir, the hire board, a map, plane-bark pattern and mesh chairs.
- **A is the room**, with:
  - Gloock and Mulish;
  - whitewash, sooty brick, chalk black, fern, bulb and oilcloth grey;
  - a first-person perspective walk;
  - bulbs that light up as you move.
- **Where A touches the others:** the bridge appears in one sentence and one stone arch glimpsed through the door, and the river is only the destination view.
- **No reused fonts, palettes or signatures** from Caffè Mamma or round 1.

## Type and colour

- **Gloock (display):** a high-contrast, slightly Victorian serif. It echoes the dark serif capitals of the hanging CAFÉ sign and the classical serif of the café's wordmark.
- **The wordmark:** "Tide Tables", a rule, then the strapline "RICHMOND RIVERSIDE CAFÉ" in widely spaced capitals. It follows the structure of their logo but is set in this concept's type. It is a working wordmark, not a redrawing of their logo.
- **Mulish (text):** plain and warm.
- **Type scale:** fluid, from `--step--1` to `--step-4`, with `clamp()`. The measure is about 64ch.
- **Palette:** the brief's palette, with derived ink and deep-fern tones for AA text.
- **Contrast:** checked numerically. Every text pair is at least 4.9:1, and plain fern (4.24:1) is used only in decorative icons.

## Implementation notes

- **Stack:** plain HTML, CSS and JS, with no frameworks, no build step and no GSAP (it wasn't needed). Google Fonts are the only external request.
- **`js/vault.js`:** the renderer (build, layout, render). It exposes `window.TideVault`.
- **`js/site.js`:**
  - the header festoon (reading progress), the solid header on scroll, and the walk controller;
  - the face's glance, and reveals (motion only, never on content that is already on screen);
  - the menu lamps (IntersectionObserver), with `aria-current` on the board picker;
  - the chalk "writing" reveal (motion only).
- **`html.js` and `html.motion`** are set in the head before first paint. Nothing is hidden unless both classes allow it.
- **The face** is one `<symbol id="keystone-face">` inlined in both pages. Its eyes move through inherited CSS custom properties (`--look`, `--lid`), which reach inside `<use>`.
- **Page transitions:** `@view-transition` with an arch-shaped reveal. Browsers without it simply navigate.
- **Regenerating the fallbacks:** if `vault.js` changes, re-render `img/arch-front-*.svg` and `img/vault-still.svg`:
  1. Load index.html in a browser.
  2. Run `window.__tide.vault()`, then `.layout(w, h)` and `.render(p)`. Use 600×800 and 1440×900 at p = 0 for the arch fronts, and 1200×800 at p = 0.44 with `.lit = 40` for the still.
  3. Serialise the SVG with the `#keystone-face` symbol appended to its `<defs>`.
- **Checked:**
  - 390, 768, 1440 and 2560 wide; reduced motion; JS off;
  - zero console errors and zero failed requests;
  - no horizontal overflow;
  - every interactive target is at least 44px (inline text links excepted);
  - logical h1–h3 outline on both pages, no broken anchors;
  - visible `:focus-visible` (bulb yellow), skip link and landmarks.

## Honesty markers on the page

- **Hours:** the café's own published hours (`.co.uk` Contact page) are used throughout. VisitRichmond's times are no longer shown.
- **Menu banner:** "Sample layout: not the current menu" plus the brief's exact sentence. The café's own disclaimer closes the menu page. There are no prices anywhere.
- **"To confirm" markers** (`span.tbc` plus an HTML comment beside each):
  - "All our wines are vegan"
  - boat services
  - booking policy
  - the Jam Jar
  - the Hollyhock route
  - the Hollyhock postcode
  - what the face is
- **The face** is never called "Father Thames" or anything else.

- **Hours update (26 Oct 2026):** The hero line, the "Opening hours" block and both footers (index and menu) now show the café's published hours, "Mon–Fri from 7:30am (food and drink from 8am) · Sat–Sun from 7am (from 7:30am) · until dusk", with "please call +44 (0)20 8948 8285" kept for specifics. Source: the café's second official site, Contact page http://www.tidetablescafe.co.uk/contact/ (fetched with curl over http; see `research/dossier.md` S27). The "Times reported elsewhere" VisitRichmond box and its "to confirm" marker were removed; Hollyhock's line "It is also open during daylight hours" became "It is open during daylight hours". The JSON-LD `description`, `<meta name="description">` and `llms.txt` carry the same text. No `openingHoursSpecification`: "dusk" is not a time, and no offline validator was available to confirm an `opens`-only entry is accepted. Only hey@tidetablescafe.com is shown, so contact@tidetablescafe.co.uk is not in the JSON-LD. Hollyhock stays "daylight hours". No VisitRichmond times.

## Known limitations

- **The scene is an interpretation, not a survey.** The vault's length, the number of tables and the placement of pendants, ferns and boards are invented for composition.
- **What lies beyond the far door is unverified.** The garden and river view there follows the creative direction. The café's 2018 photo shows the garden seen through the main glazed arch, so the real far door may not open straight onto the garden. **Confirm with the client.**
- **Garden furniture in the view:** a wooden chair, a dark green plastic chair and a table. These are generic, not counted.
- **Fallback SVG weight:** about 360 KB each. They are lazy-loaded and fetched only without JS (arch fronts) or with reduced motion (still).
- **The SVG chalk filter on HTML text** is solid in Chromium and Firefox. Safari support for `filter: url()` on HTML is weaker; text stays fully legible but may lose the grain.
- **Older browsers:** `@view-transition` and `svh` degrade to normal navigation and `vh`.
- **Low-end phones:** per-frame SVG updates (about 300 attributes) were smooth in desktop Chromium. On very low-end phones the vault may step slightly while scrubbing. It never blocks scrolling.
- **The hanging CAFÉ sign in the fallback images** uses Georgia, because SVG images can't load web fonts.

## Assets to replace

- Two photographs to commission (shots 1 and 2 below). Their placeholder slots were removed from the page in the editorial pass.
- The wordmark is a stand-in set in Gloock. Swap in the café's own logo only if they want it.
- The keystone face drawing should be reviewed with the client once they know what the face is.

## Photography shot list

1. The garden from the far door on a weekday morning: plane trees in leaf, the bridge's stone arches behind, no faces. (This is slot 1.)
2. The vault at opening time, looking towards the far door: festoons on, ferns in their baskets, before the first customers. (This is slot 2.)
3. The keystone face in raking morning light: a close detail for the client to approve.
4. The counter chalkboards, straight on, for a future real menu.
5. An oilcloth table with a coffee and a Popina tart, from above.
6. The arch front at dusk with the festoons lit, from the towpath.

## Structured data and llms.txt

**Encoded** (facts from `research/copy-deck.md` only):
- `index.html`: one JSON-LD block (it replaces the earlier one). Type `CafeOrCoffeeShop`, `name`, `description` ("The café is in a converted arch beneath Richmond Bridge. Mon–Fri from 7:30am (food and drink from 8am) · Sat–Sun from 7am (from 7:30am) · until dusk. For more specific information, please call +44 (0)20 8948 8285."). This includes the café's published hours, which are visible on this page. Also `servesCuisine` "Vegetarian" ("The food is all vegetarian"), `address` (2 The Arches, Richmond, Surrey, TW9 1TH, GB), `telephone`, `email` and `url` https://tidetablescafe.com/.
- `menu.html`: a minimal `CafeOrCoffeeShop` identity block (name, url, telephone, all visible there) so the two pages agree. **No `Menu` JSON-LD**: Tide Tables publishes no menu or prices, and this page is a labelled sample layout. Its earlier `CafeOrCoffeeShop` block on `menu.html` included the address, which is also shown there. It now matches the other two concepts (name, url and phone).
- `llms.txt`: name, the one-line description in the café's words, address, phone, email (with "only monitored periodically"), the published hours ("Mon–Fri from 7:30am (food and drink from 8am) · Sat–Sun from 7am (from 7:30am) · until dusk", from the café's `.co.uk` Contact page, then "For more specific information, please call…"), "no online booking, please phone", and a link to the menu page described as a sample layout with no current menu or prices. A preview note matches the page banner.
- `<meta name="description">`: index 160 characters, menu 146 characters, both in the café's voice.

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

## Useful-first pass (26 Oct 2026)

The client felt the signature came before being useful. The walk stays as the hero, but now it sits beside the essentials instead of in front of them. The standard is `pipeline/research/information-hierarchy.md` §(b); the audit is `pipeline/research/useful-first-audit.md`. Facts come only from `research/copy-deck.md`.

**What changed**
- **Today strip on the first screen.** A plain-HTML panel laid over the floor of the arch (standard §C15: "backdrop with the essentials laid over it as static text"). It holds:
  - "Today, Monday · Open from 7:30am · food and drink from 8am · until dusk";
  - "Under Richmond Bridge, on the riverside", linked to Google Maps;
  - Call 020 8948 8285 · Find us · Menu sample;
  - "Skip to visit info".
  - An inline script before first paint picks today's line in London time, including the published Christmas Day and Boxing Day hours. Without JS, the strip shows the whole week in one line.
  - The strip never fades or moves during the walk; only the wordmark fades. At 390×660 it ends at 585 px, above the bar at 596 px.
- **Visit block second,** straight after the walk (it replaces the old Find us section, which was on screen 7). It holds:
  - a "What's served" line, linking to the menu sample: vegetarian, vegan and gluten-free options, organic and Fairtrade, licensed with organic wine, beer and cider;
  - the full hours by day, plus Christmas Day and Boxing Day, and "For specifics, call 020 8948 8285";
  - the address with "beneath Richmond Bridge", a map link, and how to find it from the bridge and from the towpath;
  - parking and step-free access, both "not published, to confirm";
  - outdoor seating in the garden, "we get very crowded on sunny days", parties on 07922 474327;
  - booking (no online booking) and dogs, both "to confirm"; and the email.
- **The walk on phones** is pinned 0.8 of a screen, down from 2.3. On desktop it is 1.5. There is no scroll-jacking. Captions moved to the top of the stage.
- **Loops:** the ferns stir only while you scroll through the vault. The skip arrow nudges twice (4.8 s) and then rests. Nothing animates on its own after 6 s (checked with `document.getAnimations()`).
- **Action bar:** unchanged labels (Find us · Call · Menu sample). `scroll-padding-bottom` is now set to the bar height plus 8 px, and `scroll-padding-top` to 66 px.
- **Menu page:** the sample banner is kept. No dietary marks are used, so no legend is needed.
- **Kept:** fonts, palette, illustrations, the fallback SVGs, JSON-LD and `llms.txt`. No visible fact that they encode changed.

**Measured** (390 wide, motion; Playwright):

| | 390×660 | 390×844 |
|---|---|---|
| Today strip | 405–585 px (bar at 596) | 589–769 px (bar at 780) |
| Visit block starts | 1,188 px | 1,519 px |
| "What's served" line | 1,347 px | 1,678 px |

- No focused element was hidden under the bar in a 60-Tab run, on either page.
- QA (`qa.sh … 8947 v2-tide-a-uf`): no console errors, no failed requests, no bad links, no overflow, and axe clean. CLS: index 0.003 / 0.009 / 0.005 and menu 0 / 0.003 / 0 (390 / 768 / 1440).

**Rubric re-score** (items 8, 10 and 13 n/a; maximum 26)

| # | Item | Before | After | Why |
|---|---|---|---|---|
| 1 (G) | Essentials on screen 1 | 2 | 2 | Today, address link, Call with the number, Find us and Menu sample, at 660 and 844 |
| 2 (G) | Time to essentials | 2 | 2 | Plain HTML at first paint, never faded |
| 3 (G) | Parallel, not a gate | 2 | 2 | Strip, bar and skip link all reach Visit and the menu without the walk |
| 4 | Signature budget | 0 | 2 | Pinned 0.8 screen on phones (was 2.3); no automatic loop |
| 5 | Hidden content duplicated | 2 | 2 | Captions are DOM text, listed with reduced motion and without JS |
| 6 (G) | Reduced motion and no JS | 2 | 2 | Designed still plus the strip, which shows the week without JS |
| 7 | Hours table | 2 | 2 | Today on screen 1; the full table by day, with seasonal hours, on screen 2 |
| 9 | Find us | 1 | 2 | Screen 2: address, map, transport, from the bridge and the towpath; parking and step-free flagged "to confirm" |
| 11 (G) | HTML menu | 2 | 2 | Unchanged |
| 12 | Menu navigation | 2 | 2 | Unchanged sticky board picker |
| 14 | Action bar | 1 | 2 | Three literal items, opaque, `scroll-padding-bottom` set |
| 15 | Accessibility of the interaction | 1 | 2 | No endless fern or arrow loops; native scroll; skip link |
| 16 | Literal labels | 2 | 2 | Unchanged |
| | **Total** | **21/26** | **26/26** | |

**Still worth knowing**
- While the walk is pinned, the strip sits over the vault floor. This is deliberate (the essentials stay visible during the signature), but the near floor is hidden for that screen.
- Parking and step-free access score only because the standard accepts "to confirm" placeholders. Both need answers from the client (client question 10).

## Pitch notes (not for the site)

Editorial pass, 26 Oct 2026. The client asked that every word on the page reads as the café talking to customers, not as the designer explaining the design. These lines and elements were cut from the pages; the rationale stays here for the pitch.

- **Reduced-motion still caption:** "Inside the arch: drawn from scratch, not to scale." The vault drawing is an interpretation (see Known limitations); that is a pitch point, not a customer one.
- **Hero illustration label (screen readers):** "As you scroll, the view passes under the face and down the whitewashed vault to the far door…" explained the interaction. The label now describes the picture only.
- **Two photo placeholders** ("Photograph to commission: the garden from the far door on a weekday morning… No faces." and "…the vault at opening time, looking towards the far door…"). The briefs are in the Photography shot list (shots 1 and 2); the slots return when the photographs exist.
- **The keystone face:** "Who carved it, and when, isn't known yet. (to confirm)". What the face is stays a question for the client (copy deck, client question 3) and an HTML comment beside the text. "Tide Tables sits in a converted arch beneath Richmond Bridge" was cut from the same block because the Visit block already says it.
- **Duplicates removed:** "You'll find people out there all year round" (Good to know, kept as the garden heading); "Watch out though, we get very crowded on sunny days" (garden, kept in Good to know); "Nights and dates to be confirmed" after the Jam Jar's "to confirm" marker.
- **Menu page:** "Inside the vault, the long counter has its chalkboards. Here is how those boards might read online." The footer link "Through the arch" (the signature's name) is now "Home".
- **Quotation marks** around Hollyhock's description were dropped: on the café's own site, the café doesn't quote itself.
- **Kept:** the sample-menu banner, every "to confirm" marker, the walk captions, the Hollyhock route, and the footer's existing honesty line (nothing new added).
- **Page length at 390×844:** index 10.1 → 9.1 screens; menu 4.5 → 4.4.
