# Matsuba v2, Concept B: "The stepped wall"

**In two lines:** Matsuba's own oak slat wall is the website's structure. The two-layer wall, its front layer stepping down one slat at a time, is the homepage hero and backdrop, the page's progress mark, the menu's course index and the 14 slats of the tasting menu. Its brass twin sconce is every hover, focus and "open now" light on the site.

Speculative proposal only. Not the official Matsuba website, and not commissioned or endorsed by Matsuba. Every page footer says so and links to https://matsuba.co.uk/.

Local preview: `python3 -m http.server 8512 --directory richmond-sprint-v2/matsuba/concept-b`


## Useful first pass (26 October 2026): 28/32 → 32/32

B already passed. This pass moves its essentials up and keeps the wall exactly as it was.

**What changed**
- **Today strip in the hero plate** (first screen, inside 390×660): the live status, "10 Red Lion St, TW9 1RW · Directions", Book a table and Menu, and "Skip to visit info". The plate’s kicker now reads "Japanese restaurant, Richmond". On phones the "family-run, 2004" line moves to the top of "The room" panel; desktop keeps it in the plate. Order moves out of the plate into the header, which now shows it on phones too.
- **Visit second:** "Hours, address, booking" follows the hero. It has the full-week table (days written out, flags kept), the address, map and phone, getting there ("to confirm" items), booking in plain words, and 20% off collection via Toast.
- **Priced taster third:** "From the menu" has three Special Rolls (Matsuba, Dynamite, Special K vg) and three starters (Tuna Tataki, Nasu Dengaku vg, Edamame v), all with £, plus the v/vg legend. The photo slot follows the dishes.
- **The order after that** is the room, the fourteen slats, takeaway and reservations. On phones the gaps after the hero and after Visit shrink to 36 px, and the hero is capped at 540 px so the sconce stays on screen 1.
- **Action bar:** Book · Menu · Call, plus `scroll-padding-bottom`. The footer adds the hours.
- **Menu page:** an allergen statement at the top (the 14 allergens are not listed per dish; the restaurant’s own line; the phone number), Back to top after each course, and "On this menu" as the course bar’s label.
- **Kept:** fonts, palette, the wall and sconce, the elevation, JSON-LD (its description is still visible), `llms.txt`, all "to confirm" markers.

| # | Item | Before | After | Evidence after |
|---|---|---|---|---|
| 1 | Essentials on screen 1 (G) | 2 | 2 | Status, address with Directions, Book a table and Menu at 354–543 px at 390×660 (bar top 596); the sconce and stepping slats still show above the plate |
| 2 | Time to essentials (G) | 2 | 2 | Strip is HTML; the inline status script runs after the plate is parsed, and the status line reserves three lines, so CLS is 0.012 |
| 3 | Signature is parallel (G) | 2 | 2 | "Skip to visit info" in the plate; Book and Menu in the plate and the bar |
| 4 | Signature budget | 2 | 2 | Unchanged: fixed backdrop, no pin, about 3 s load moment |
| 5 | Hidden content duplicated | 2 | 2 | Unchanged |
| 6 | Reduced motion and no-JS (G) | 2 | 2 | Unchanged static wall; the no-JS strip shows the week in one line |
| 7 | Hours table | 1 | 2 | Visit is second (630 px); full week at 795 px with "to confirm" flags |
| 8 | Priced menu taster | 1 | 2 | "From the menu": three Special Rolls and three starters with £ and v/vg marks plus a legend; first dish at 1,709 px |
| 9 | Find us | 1 | 2 | Address, Google Maps link and phone, station, parking and step-free access marked "to confirm" |
| 10 | Booking clarity | 2 | 2 | Unchanged terms, now also in plain words in Visit |
| 11 | HTML menu (G) | 2 | 2 | Unchanged |
| 12 | Menu navigation | 2 | 2 | Sticky course bar, now labelled "On this menu", plus Back to top after every course |
| 13 | Prices and dietary marks | 2 | 2 | Legend and allergen statement (now with the 14-allergen note and the phone) at the top |
| 14 | Action bar | 1 | 2 | Book · Menu · Call; Order visible in the phone header; `scroll-padding-bottom` set |
| 15 | Accessibility of the interaction | 2 | 2 | Unchanged |
| 16 | Literal labels | 2 | 2 | "Hours, address, booking", "From the menu" |
| | **Total** | **28/32** | **32/32** | |
**QA** (`pipeline/tools/qa.sh`, label `v2-matsuba-b-uf`, port 8942): no console errors, no failed requests, no bad links, no overflow at 390, 768 or 1440, axe clean on both pages. CLS: index 0.012 / 0.000 / 0.000, menu 0.001 / 0.044 / 0.000 (390 / 768 / 1440). Keyboard run (60 Tabs per page at 390×844): no focused element lands under the action bar.

**Scoring note.** Item 9 is scored under the audit's convention that unpublished station, parking and step-free facts may appear as "to confirm". Nothing in the copy deck states them, so they are flagged rather than written. Screens are 390×844 in motion mode unless stated. Screenshots and measurements: `/tmp/claude-0/-home-user-Claude-code/e50707d5-9ec5-571e-9915-9e7145ebe50f/scratchpad/ufm/` (`shots/`, `audit/`).

---

## The swap test

**Does it pass? Yes.** Put another Japanese restaurant's name on this site and it stops making sense. The hero, the backdrop, the progress mark, the menu's index and the tasting menu are all drawn from one bespoke piece of joinery that exists only in the long room at 10 Red Lion Street. That piece is two layers of square oak slats on a grey wall, with the front layer's tops stepping down in a straight diagonal and brass twin sconces mounted across them. The interaction language is drawn from one specific light fitting. Nothing in the system is a cuisine cliché: no noren, no rising sun, no brush strokes, no kanji, no cherry blossom, no pine. Take the wall away and there is no site left, which is the test.

The one honest caveat: slat walls exist elsewhere. What makes this one only-here is the combination this site reproduces: two layers, the back layer running to the ceiling, the front layer stepping one slat at a time in a straight line, small round fixings, and twin-bulb brass sconces on the wood. A generic "timber slat" texture would fail the test; this is drawn to the measured rhythm of Matsuba's wall.

## Only-here details used (each with its source and where it appears)

| # | Detail | Source (all viewed 25 Oct 2026) | Where it appears, as design |
|---|---|---|---|
| 1 | **The two-layer stepped slat wall** (signature). Square-section oak on a grey wall; the back layer runs to the ceiling at double pitch; the front layer is interleaved between the back slats, stops short, and its tops step down one slat at a time in a straight diagonal; small round fixings. | identity.md §1. Site photos `2021/06/matsuba-table-e1624960727855.jpg`, `2021/06/matsuba-banner2.jpg`, `2021/07/matsuba-footer.jpg`; client photos 2, 4, 5. | The homepage hero and fixed backdrop (CSS, `.wall`); the load sequence; scroll progress (the step descends one slat at a time); the header progress frieze; the menu page background (back layer only, `img/backwall.svg`); the desktop menu wall index (9 front slats = 9 courses); the 14-slat tasting wall; the phone tasting list (horizontal slats stepping in); the home "Fourteen" mini-wall; the elevation drawing; the kicker step-mark glyph; the favicon. |
| 2 | **The brass twin sconce.** A round brushed-brass backplate, a horizontal rod, a short cylinder at each end, two bare bulbs throwing two warm glows onto the slats. | identity.md §4. `matsuba-table…jpg`, `matsuba-banner2.jpg`, `matsuba-footer.jpg`. | An original SVG drawing (`#sconce` in the sprite) mounted on the hero wall, switching on after the wall is built. The state language everywhere: text links light a brass disc, rod and two end glows (`.lamp`); buttons light two bulbs at their ends (`.btn`); the active course slat lights its two ends; a hovered or selected index or tasting slat gets a disc mounted on it, throwing two glows either side. The tiny "open now" indicator in the header, hero and Visit block (`.mini-sconce`, lit only during published hours, London time). |
| 3 | **The perforated metal canopy and booth screens.** Dark perforated mesh in a black box frame over the bar; black-framed perforated screens between booths. | identity.md §6 and §7. `2021/06/image11-scaled-e1624621506551.jpeg`, `matsuba-footer.jpg`, `matsuba-table…jpg`, client photo 5. | The booking panel is the canopy: staggered perforation on charcoal, a heavy black frame with a lit lower edge (`.book__canopy`). The booth screens appear in the elevation drawing. |
| 4 | **White marble-look tables with black pebble chopstick rests and plain wooden chopsticks.** | identity.md §7. `matsuba-table…jpg`, `matsuba-footer.jpg`, client photos 3 to 5. | Every content panel is a white marble-look table top hung on the wall. Each menu course opens with a top-down table setting drawn in SVG (`#rest`: black pebble rest, plain chopsticks) as its section mark, rotated a step further per course. The same setting sits on the Special Rolls panel, the tasting card and the photo slots. |
| 5 | **The wide-tracked MATSUBA wordmark** of the awnings and logo files. | identity.md §3; brief brand constants. | A working wordmark in Urbanist 500 at 0.45em tracking in the header and footer. It is not the logo file and not a redraw of it. |
| 6 | **The tasting menu's 14 listed dishes.** | copy-deck.md (Tasting tab); identity.md §12. | "Fourteen dishes. Fourteen slats." Each dish is one front slat, in published order. Slat eight, the Lion King nigiri, carries the sconce on the homepage. |
| 7 | **Reversed, tracked label bars** from the takeaway PDF ("S U S H I  M O R I"). | identity.md §8, `2026/06/MATSUBA-TA10-kids.pdf`. | The menu's sub-heads are charcoal bars with tracked caps. This is a deliberately small nod; Concept C owns the print-menu system (gold rules, serif caps, burgundy). |

The signature comes directly from detail 1. Details 2, 3 and 4 each appear as design (motion and state language, texture and frame, section marks and panel material), not just as copy.

## How the signature works

- **Static first.** The wall is plain HTML: 40 back slats and 40 front slats (`<i>` elements in `.wall`) with per-slat tone and grain offsets baked in. It renders completely without JavaScript.
- **Proportions.** One module `--u` (18–34px, fluid) is one slat plus its gap. Back slats sit on even modules, front slats on odd ones, so the wall doubles in density below the step, as the real one does. The slat face is 0.72u. One step is 0.55u per front slat, about 15°, measured from the photos (matsuba-table about 14°; client photo 4 about 16°).
- **Wood.** Each slat is a layered background: a per-slat oak tone mixed from #B26B45 and #CF9466 with a golden warm-up; one lit edge and one shadowed edge; a light fall-off; an SVG `feTurbulence` grain tile (`img/grain.svg`, stitched, with an offset per slat so no two match); and fixings as a repeating radial gradient. Front slats cast a soft shadow onto the back layer. The sconce's pool is blended into the wood with `soft-light` and `screen`.
- **Load moment** (motion allowed only): the back layer is there, the front layer rises into place one slat at a time (46ms stagger), then the sconce, which starts as bare glass, switches on. It warms with one small hesitation, then the light pools across the slats. CSS only, about 3s.
- **Scroll.** `js/site.js` maps page progress to a whole number of steps and sets `--d` to that many step heights. The front layer therefore steps down the wall one slat at a time, with a 16ms-per-slat ripple, never sliding. No pinning and no scroll-jacking. The header frieze builds the same wall at a tiny scale: there, the stepped edge travels along the strip as you read.
- **Reduced motion:** a static stepped wall, already lit, that doesn't move on scroll. State changes are instant. The frieze still marks progress.

## Implementation notes

- Files: `index.html`, `menu.html`, `css/site.css` (one stylesheet, tokens at the top), `js/site.js` (frieze, wall stepping, open-now), `js/menu.js` (course bar, desktop bar reveal, tasting wall), `img/grain.svg`, `img/grain-h.svg`, `img/backwall.svg`, `img/marble.svg` (all original procedural SVG textures; no photos).
- The HTML is static. The wall markup, the elevation drawing and the menu were generated once by a studio script outside this folder. The menu was parsed from the copy deck's code blocks so the text is verbatim, and the Kids and Lunch & Early Evening cards were transcribed by hand from the deck. Edit the HTML directly from now on.
- No GSAP: CSS and about 250 lines of plain JS do the job. Page-to-page: CSS cross-document view transitions where supported (fade and rise; off under reduced motion).
- Fonts: Urbanist (wordmark, labels, UI) and Spectral (headlines, text, dish names), from Google Fonts with `display=swap` and preconnects. The metric-matched fallbacks were computed with fontTools from the served files: Urbanist against Liberation Sans/Arial (size-adjust 99.7%) and Spectral against Liberation Serif/Times (109.2%). Spectral's Google build has no old-style figures or small caps, so prices use its `tnum` tabular figures.
- Layout logic, "hung on the slat module": every panel is snapped to whole modules with CSS `round()`, so panel edges land in the gaps between slats. On the homepage the panels hang at different points along the wall, deliberately asymmetric, leaving the wall visible between them. On the menu each course hangs half a slat (tablet) or one slat (desktop) further along than the one before, so the menu itself steps down the wall.
- The hero headline steps in line by line ("Pull up a chair." / "Take a taste." / "Come join us."), echoing the diagonal.
- Phone: a fixed charcoal action bar (Book, Menu, Call) is always present, and the header shows Menu and Order. From 760px the header carries Book a table; Visit is added from 960px. On the menu, the course bar is sticky on phones and tablets. On desktop it slides in under the header once the wall index has scrolled away.
- Tasting menu: without JS, and on phones, it's a plain ordered list of 14 horizontal slats, each stepping in one module further. On screens of 960px and up, JS builds a 14-tab stepped wall (`role=tablist`, roving tabindex, arrow keys, Home and End, hover preview for mice). It sits beside a white card that shows the dish. Each dish's content becomes the tabpanel.
- "Open now": computed from the published hours in Europe/London time. Monday and the lunch end time always carry a visible "to confirm" marker. The hero status is now set by an inline script before first paint. Without JS it reads "Mon [to confirm]–Fri 12–3pm [to confirm], 5–10pm · Sat 12–10pm · Sun closed". The header and Visit status still come from `js/site.js`.
- Contrast (WCAG): charcoal on marble 14.3:1; charcoal on light oak (course slats, index labels) 6.2:1; charcoal on wall grey 4.7:1; deep oak #7A4429 kickers on marble 6.9:1; ink-2 on marble 7.0:1; vg/v green #2F6F2A on marble 5.4:1; "to confirm" #8A5A0E on marble 5.2:1; marble on charcoal 14.3:1; glow on charcoal 10.3:1.
- axe-core 4.10 (WCAG 2.0, 2.1 and 2.2 A/AA plus best practice): zero violations on both pages at 390, 768 and 1440. No console errors, no failed requests, no horizontal scroll at 390, 768 or 1440 (checked in Playwright).
- Metadata: title, description, theme-color, inline SVG favicon (four stepping slats and a glow), Open Graph, `lang="en-GB"`, and Restaurant JSON-LD (name, address, phone, email, cuisine, founding year 2004, booking and menu URLs, Instagram). Hours are left out of the JSON-LD because Monday is unconfirmed.

## Content and honesty

- All copy is from `research/copy-deck.md` and `research/identity.md`. Their own lines used: "Pull up a chair. Take a taste. Come join us."; "We look forward to welcoming you to MATSUBA"; "Book your table today!"; "Special Rolls: large 8 piece rolls exclusively created by MATSUBA"; "our signature appetizer, Tuna Tataki"; the takeaway deal; and the takeaway PDF straplines on the menu sub-sections.
- The menu is the live published menu, verbatim, so it is not labelled as a sample. Two cards are flagged on the page: the Lunch & Early Evening card ("Still running? to confirm") and the 2024 vegan/GF PDFs.
- "To confirm" markers (visible span plus `<!-- [TO CONFIRM] -->` comment): Monday opening; lunch end time (3pm, 2:45pm or 2:30pm); whether Lunch & Early Evening still runs; the vegan and GF PDFs. The "open now" text adds the same markers at the relevant times.
- Booking and ordering are plain links that open Favourite Table or Toast in a new tab, with an honest note that nothing is booked until the guest confirms there. There is no fake confirmation and no `window.open`.
- Not used, by design: the street history (Concept A tells it), the sear or flame treatment (Concept C), any noren, parasols, kanji, pine imagery, the family's heritage, staff names, ratings or reviews. The Lion King nigiri is mentioned playfully ("Slat eight is the Lion King nigiri") with no claim about the street.
- **Spelling proposals (not applied; menu kept verbatim, owner sign-off needed):** "Uangi Steak" → Unagi Steak; "Eby Fry" → Ebi Fry; "(all samon)" → salmon; "South Amerian" → South American; "Chrispy" → Crispy; "chilli papper" → chilli pepper; "Yuzu Te" → Yuzu Tea; "Aperol Com Fanta" → Aperol con Fanta (to check); "Vanila" → Vanilla; "torched-seared" / "Torch-seared" → pick one; and "Salmon Combo_B" repeats its own name inside its description.

## Distinct from A and C

- A ("Under the awning") is the frontage, the brick wall, swing-arm lamps and a corridor layout, set in Josefin Sans and Source Serif 4 on slate.
- C ("Aburi") is the print menu and the flame, set in Marcellus and Albert Sans in burgundy and gold.
- B uses the room's other wall: oak, grey, brass and marble, set in Urbanist and Spectral. Its motion language is a stepping wall and switching lights, with no reveal-on-scroll and no gradient text.

## Known limitations

- The wall is fixed-position, so very long phone scrolls show the wall only in the gaps between panels. The header frieze carries progress there.
- On Safari before 17, CSS `round()` is ignored and panels fall back to unsnapped percentages (still tidy). Older browsers without `color-mix()` lose the per-slat tone variation and show flat oak. `translate` as an individual property needs a 2022+ browser; older ones show the static wall.
- The fixed wall layer paints 80 textured elements. It's smooth in Chromium at 1440; low-end Android has not been tested.
- The tasting card's hover preview selects the slat under the mouse, which some users may find eager. Click and keyboard work the same way.
- The elevation drawing's labels are hidden below 760px and its caption carries the same words. At 390px the drawing is small.
- Dual prices (for example "12.9/22.9") are shown as published, without explaining which portion is which (copy-deck TO CONFIRM item 5).

## Assets to replace

- Wordmark: confirm the owner is happy with a set wordmark in Urbanist, or supply the logo as SVG.
- Photo slot on the homepage (Special Rolls panel): see the shot list.
- Opening hours, once Monday and the lunch end time are confirmed.

## Photography shot list

1. **Overhead, daylight:** the Matsuba Roll on a white marble-look table, a black pebble rest and plain chopsticks beside it. 4:5. (Homepage slot.)
2. The far slat wall from the door at dusk, both sconce bulbs lit, tables set. 3:2.
3. Booth bay, straight-on elevation like the drawing: sconce centred, front-layer step crossing the frame. 16:9 or 21:9 for a wide hero option.
4. Macro: one sconce on the slats, the brass disc and both bulbs, fixings visible. 1:1.
5. The perforated canopy over the bar from below, upturned glasses and sake shelf. 3:2.
6. Top-down: each course's table setting (white top, pebble rest, chopsticks) with one dish, consistent framing across all nine courses. 1:1.

Screenshots from the self-review are in the studio scratchpad (`v2/build-matsuba-b/shots/`), not in the repo.

## Structured data and llms.txt

**Encoded** (facts from `research/copy-deck.md` only):
- `index.html`: one JSON-LD block (it replaces the earlier block, which also pointed `menu` at the live site's `/matsuba-menu/`). Type `Restaurant`, `servesCuisine` "Japanese", `name`, `description` ("A family-run Japanese restaurant in the heart of Richmond. First opened in 2004.", sentences shown on this page), `foundingDate` 2004 ("First opened in 2004"), `address` (10 Red Lion Street, Richmond, TW9 1RW, GB), `telephone`, `email`, `url` https://matsuba.co.uk/, `sameAs` Instagram (@matsuba.london), `acceptsReservations` = the Favourite Table URL, `potentialAction` ReserveAction (Favourite Table) and OrderAction (Toast, collection), `hasMenu` https://matsuba.co.uk/menu.html.
- `menu.html`: one `Menu` block (it replaces the earlier `Restaurant` block): 8 sections, 141 items, 141 GBP offers, generated from this page's own DOM. Names, descriptions and spellings are as printed ("Uangi Steak", "Eby Fry"). A dual price such as "12.9/22.9" is two offers with no variant label, because which price goes with which variant is [TO CONFIRM]; "6.9/6.9" is one offer. `suitableForDiet` is set only where a vg/v mark covers the whole dish (not "Katsu Curry (… Pumpkin vg)"). Each kids bento is one priced item. The tasting menu's "£100 per person (minimum 2 persons)" is the section description; its 14 dishes carry no individual price.
- `llms.txt`: name, one-line description, address, phone, email, Instagram, hours as published with Monday and the lunch end time marked "to confirm", booking (Favourite Table, up to 12 guests online) and collection ordering (Toast, 20% off collection), links to the menu and the takeaway PDF, a preview note matching the page banner.
- `<meta name="description">`: index 154 characters, menu 155 characters. The menu one no longer advertises the Lunch & Early Evening set.

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
