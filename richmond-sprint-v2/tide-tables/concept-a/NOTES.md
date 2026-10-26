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
  4. Inside, the ferns sway in their baskets (CSS, about 6 s, ±2.4°). The festoon bulbs along the two strings light ahead of you down the curve.
  5. At the end, the far door opens onto gravel, a plane tree, a stone bridge arch and the river.
- **How it scrolls:**
  - The section is 330svh tall with a sticky 100svh stage. The page scrolls natively; the script only reads the scroll position, with light easing.
  - There is no scroll-jacking, and the stage never blocks a tap.
  - The camera follows a monotone cubic path through keyframes, so there is no overshoot and no jerk between phases.
  - Rendering pauses when the section is off-screen.
- **Captions:** four short descriptive lines fade in at stages, and they are real text in the DOM.
- **Primary actions:** Find us, Call and Menu sample are reachable throughout. They sit in a fixed bottom bar on phones and in the header on desktop. There is no Book button anywhere.
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

- **Hours:** the café's own wording is used throughout. VisitRichmond's times appear only inside "Times reported elsewhere" on the home page, marked as reported and to confirm.
- **Menu banner:** "Sample layout: not the current menu" plus the brief's exact sentence. The café's own disclaimer closes the menu page. There are no prices anywhere.
- **"To confirm" markers** (`span.tbc` plus an HTML comment beside each):
  - "All our wines are vegan"
  - boat services
  - booking policy
  - the Jam Jar
  - the Hollyhock route
  - the Hollyhock postcode
  - VisitRichmond's times
  - what the face is
- **The face** is never called "Father Thames" or anything else.

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

- The two photo slots (the arch-topped placeholders) need commissioned photographs.
- The wordmark is a stand-in set in Gloock. Swap in the café's own logo only if they want it.
- The keystone face drawing should be reviewed with the client once they know what the face is.

## Photography shot list

1. The garden from the far door on a weekday morning: plane trees in leaf, the bridge's stone arches behind, no faces. (This is slot 1.)
2. The vault at opening time, looking towards the far door: festoons on, ferns in their baskets, before the first customers. (This is slot 2.)
3. The keystone face in raking morning light: a close detail for the client to approve.
4. The counter chalkboards, straight on, for a future real menu.
5. An oilcloth table with a coffee and a Popina tart, from above.
6. The arch front at dusk with the festoons lit, from the towpath.
