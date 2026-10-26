# The Original Maids of Honour v2, Concept A: "Teas" (the signwriting)

**The concept in two lines.** The website is signwritten like the building at 288 Kew Road: bottle-green boards, gold-leaf blackletter, and a "TEAS" gable on every heading. Its backbone is the painted side-wall sign. On the site that sign keeps London time: the line being served now is gilded, and each line opens its menu and books its own sitting.

Port 8531. Serve with `python3 -m http.server 8531 --directory concept-a`. This is a speculative proposal: it was not commissioned and is not endorsed by the business, and the footer of every page says so.

---

## 1. Only-here details used, with sources and where they appear

Source codes: `research/dossier.md` §6 (S1 to S25). P1 to P4 are the client-supplied Google Maps photos (third-party, viewed 25 Oct 2026, reference only).

| # | Only-here detail | Source | Where it appears, as design |
|---|---|---|---|
| 1 | **The side-wall painted sign**: "Newens / The Original Maids of Honour / HOME MADE BREAD, CAKES & PASTRIES / MORNING COFFEE / LUNCHEONS / TEAS", with the phone number painted beneath | P1; the right of the logo drawing [S1]; identity.md §1.8 (VERIFIED) | **The signature** (`#sign` on the home page). It is a large SVG board with this design's own lettering. Its five lines are live links, each with its own booking plate, and the phone line under TEAS is a `tel:` link, as on the real board. A miniature copy is painted on the return wall in the frontage drawing and lights in step with the big one. |
| 2 | **The green fascia with gold blackletter and the raised "TEAS" gable** | [S1] frontage photo; P1; [S19]; the logo drawing (VERIFIED) | The hero drawing. Every H1 and H2 is a green fascia board with a gold inset line and a gable tab above it (`.board`, `.board__gable`), and the gable carries a short label ("Now", "From 9am", "12 – 3pm", "288"). The "Book a table" button is a small board with a gable on top. The favicon is a gable outline. |
| 3 | **The clay-tile canopy with "Newens" in gold, the hanging lantern, the iron cresting** | [S1] photo; [S19] RTT close-up; P1; identity.md §1.7 (VERIFIED) | In the hero drawing. A full-width canopy band (tiles, cresting, ivy, gold "Newens", lantern) opens "The very same shop front". The cresting pattern is the edge of the sticky header, the top edge of the footer and the underline of every menu sub-heading. **The lantern glows while the shop is open** by the London clock and goes dark when it closes. |
| 4 | **Topiary cones in white panelled planters, and white wrought-iron chairs and tables** | P1; [S1] photo (VERIFIED) | In the hero drawing: two cones flanking the brick shopfront, and two café sets with scroll-back chairs and scalloped cloths. In "Find us", the address plate stands between two topiary cones like the shop door. |
| 5 | **Small-paned casements with bull's-eye roundels, brick piers, and the pebbledash render** | [S1] photo; the [S19] close-up shows the roundels; the "painted pebbledash, red clay roof tiles… casement windows" line [S3] | Drawn in the hero: a 6×4 pane shopfront, bull's-eye panes in the door and windows, a brick stall riser. The stippled pebbledash pattern is reused as the texture of the side-wall section. |
| 6 | **The Mock Tudor rebuild: "this very same shop front"** | [S3], [S21] (VERIFIED and REPORTED as labelled in the copy deck) | The story section, headed "The very same shop front", ties the drawing above to the history. |
| 7 | **The menu quirks**: Five Quarters of Tea Sandwiches, the 'Kew' Pasty, Maids Ploughman's, the Carry On Smoothies, coffee "fondly sourced from our supplier since 1936", "tea bags" in the early 1960s, Ellis of Richmond | [S6]–[S10] | Typeset on menu.html. The smoothie names are set as small display headings. The 1936 and 1960s lines are quoted where they belong. |
| 8 | **The legend of the locked iron box**, always introduced as legend | [S1], [S3], the High Tea menu [S8] (LEGEND) | A "Legend" tagged panel on the home page, and a boxed "Printed on the High Tea menu · Legend" note on menu.html. The filling is never stated. |

**Deliberately not used**, to stay distinct from B and C: no iron box or reheating timer (B), and no three-tier stand, transferware, red room, rubble-to-rebuild sequence or vintage van (C). The tart appears only as a line of the patisserie list.

### The swap test
Swap in another tearoom's name and the concept collapses. The navigation spine is a specific painted board with five specific lines in a specific order, plus that board's phone number. The headings are this building's fascia and TEAS gable. The section dividers are this canopy, with "Newens" lettered on it, and this cresting. The open or closed signal is this lantern. The hero is a drawing of 288 Kew Road that a regular would recognise. Another tearoom has no TEAS gable, no Newens canopy and no side-wall sign listing "HOME MADE BREAD, CAKES & PASTRIES / MORNING COFFEE / LUNCHEONS / TEAS". Generic tearoom clichés (doilies, bunting, Union Jacks) are absent.

---

## 2. The signature: the live side-wall sign

**Files:** `js/sign-logic.js` holds the pure logic (UMD, so it also runs in Node). `js/main.js` renders it. The SVG lives inline in `index.html` (`#side-sign`), and a standalone copy is in `img/side-sign.svg`.

**What each line does**

| Painted line | Menu link (lettering) | Booking plate (ResDiary) |
|---|---|---|
| HOME MADE BREAD | `menu.html#bakery` (Bakery Breakfasts) | General, ThreeMonth/32717 |
| CAKES & PASTRIES | `menu.html#patisserie` | General, ThreeMonth/32717 |
| MORNING COFFEE | `menu.html#breakfast` | Breakfast, Standard/33175 |
| LUNCHEONS | `menu.html#luncheon` | Luncheon, Standard/33176 |
| TEAS | `menu.html#set-teas` | Set tea, Standard/33177 |

ResDiary has four widgets for five lines, so the two counter lines share the general table booking. The online shop and tarts-by-post links sit in the matching panels beside the sign.

**The time windows.** All clock reading uses `Intl.DateTimeFormat` with `timeZone: 'Europe/London'`, whatever the visitor's own time zone. Every window comes from the copy deck:
- Open 09:00–18:00 daily [S1, S2].
- Cooked and toasted last orders 11:00; no cooked breakfast on Thursdays [S6].
- Luncheon 12:00–15:00 [S7].
- Set teas from 10:00; Prosecco and Champagne teas from 11:00; last walk-ins seated by 17:30 [S8].

**One interpretation, marked "to confirm" on the page.** MORNING COFFEE runs from opening until luncheon starts (09:00–12:00). The business publishes the 11:00 cooked cut-off but no end to "morning coffee".

**States.** One line is *lit*, in gold leaf on a green tablet with a sun-glint sweep: the meal of the moment, as follows.
- 09:00–12:00: MORNING COFFEE
- 12:00–15:00: LUNCHEONS
- 15:00–17:30: TEAS
- 17:30–18:00: CAKES & PASTRIES

Other lines being served carry a small green lozenge ("also now"). Finished lines fade slightly, and every line shows a painted italic note ("Serving until 3pm", "Finished at 12 noon · back tomorrow"). When the shop is closed, nothing is lit and the lantern in the drawing goes dark.

**Around the sign**
- A status plate states the London time and a plain-English summary in an `aria-live="polite"` region. Only the summary is live, so the ticking clock is not announced.
- The home page's "On the side wall today" plate in the hero, the panel badges and the menu index ("Breakfast · now") all read the same logic.
- A small control, "Read the sign at another time", has a day select, a 15-minute range input and a "Now" button. It lets a visitor see what is served at 2pm on Thursday.
- `?at=thu-14:30` (or `?at=14:30`) sets the clock for demonstrations.

**No JS:** a complete static sign showing each line's published times, and the status plate reading "Times as published", followed by the full hours.
**Reduced motion:** the correct line is lit as a still state, with no glint and no hero sweep. The current service is in text.

### Node tests: `node --test tests/sign-logic.test.js`
Run on 25 Oct 2026 under `TZ=UTC`, `TZ=Pacific/Auckland` and `TZ=America/Los_Angeles`. Each run: **11 tests, 11 pass, 0 fail.**

```
ok 1 - London clock: GMT and BST, including the day the clocks go back (25 Oct 2026)
ok 2 - Opening edges: 08:59 closed, 09:00 open, 17:59 open, 18:00 closed
ok 3 - Headline line through a Wednesday (28 Oct 2026, GMT)
ok 4 - Breakfast: cooked and toasted last orders at 11am
ok 5 - Thursday: no cooked breakfasts, pastries as usual
ok 6 - Teas: set teas from 10:00, Prosecco and Champagne from 11:00, walk-ins by 17:30
ok 7 - Luncheons: 12:00 to 15:00 only
ok 8 - Counter lines are on whenever the shop is open
ok 9 - Closed summaries name the right day
ok 10 - Sweep: every minute of a GMT week and a BST week keeps the invariants
ok 11 - The machine time zone does not matter
# tests 11  # pass 11  # fail 0
```

What the tests cover:
- **The DST edges.** The repeated 01:00 hour on 25 Oct 2026, the BST start on 29 Mar 2026, and 08:00 UTC on a BST Saturday reading as 09:00 in Kew.
- **Every boundary minute**, either side of each window.
- **Thursday**, including the warning the evening before.
- **A sweep of all 20,160 minutes** of one GMT week and one BST week. Exactly one line is lit while the shop is open and none while it is closed, and no line is ever served outside its published window.

Schedule produced by the logic (Wednesday, then where Thursday differs):

| London time | Lit | Also served | Note on the lit line |
|---|---|---|---|
| 08:59 | none | – | "Closed just now. The doors open today at 9am." |
| 09:00 | MORNING COFFEE | bread, cakes | Cooked & toasted last orders 11am (Thu: "no cooked breakfast · pastries as usual") |
| 10:00 | MORNING COFFEE | bread, cakes, TEAS | TEAS note: "Set teas now · Prosecco & Champagne teas from 11am" |
| 11:00 | MORNING COFFEE | bread, cakes, TEAS | Cooked breakfast finished at 11am · pastries & coffee |
| 12:00 | LUNCHEONS | bread, cakes, TEAS | Serving until 3pm |
| 15:00 | TEAS | bread, cakes | Set tea sittings · last walk-ins seated by 5.30pm |
| 17:30 | CAKES & PASTRIES | bread | On the counter until 6pm |
| 18:00 | none | – | "…open tomorrow (Thursday) at 9am. No cooked breakfasts on Thursdays…" |

---

## 3. Implementation notes

- **Stack:** plain HTML, CSS and JS with no framework, no build step and no GSAP (CSS and rAF were enough). Relative links only, and no third-party embeds.
- **Fonts:** Google Fonts only.
  - **Grenze Gotisch** (400–800) is used for display only: boards, headings, the wordmark, smoothie names and the lettering in the drawing and sign.
  - **Alegreya** (roman and italic) is used for all text and menus. Its default old-style figures are used in running text; prices use `lining-nums tabular-nums`. Alegreya on Google Fonts has no `smcp`, so caps labels are tracked capitals.
  - **Fallbacks without layout shift.** There is one fallback family per real local serif: Georgia, Times New Roman/Liberation/Tinos, Noto Serif (Android), DejaVu Serif and FreeSerif. Each has separate roman, italic and bold faces, with `size-adjust` matched to Alegreya and Grenze by glyph advances over the site's own text, plus ascent and descent overrides. Georgia's values are estimated (it could not be measured here); the others were measured from the font files.
  - All measures use `em`, not `ch`, because `ch` changes width when the font swaps. Each was converted from Alegreya's real "0" advance (0.533em roman, 0.510em italic), so layout widths are unchanged.
  - CLS (PerformanceObserver over 2.5s, at 390, 768 and 1440): index 0.003 / 0.004 / 0.029 and menu 0.001 / 0.001 / 0.001. Before the fix: index up to 0.021 / 0.111 / 0.183 and menu up to 0.154 / 0.008 / 0.005.
- **Gilding:** `.gilt` builds the leaf from four layers:
  - a vertical leaf gradient (lit top edge, burnished middle) clipped to the text;
  - a 0.6px dark text stroke;
  - two drop-shadows;
  - a sheen layer that sweeps once as each heading enters view.
  In SVG the same recipe is a `userSpaceOnUse` gradient whose `gradientTransform` JS moves. On the hero it follows the pointer across the fascia, the TEAS gable and "Newens". On the sign it glints about every 9 seconds across the lit line. The darkest gradient stop (#CC9B40) is still 4.9:1 on the green.
- **Illustration:** `index.html` inlines the frontage SVG.
  - It was composed in a scratchpad generator (seeded randomness for tile variation, pebbledash, ivy and topiary leaves) and pasted in as static markup.
  - Standalone copies are in `img/frontage.svg` and `img/side-sign.svg`. They `@import` the fonts and fall back to Georgia offline.
  - Nothing was traced. Proportions and details were studied from P1, the [S1] frontage photo, the [S19] close-up and the logo drawing.
- **Responsive crop:** at under 700px the hero shows the central bay (fascia to pavement) through a fixed-ratio CSS crop, with no JS and no layout shift. From 1000px it is a 31/69 asymmetric split, with the drawing bleeding right and fading in at its left edge.
- **Layout logic, "the elevation and the side wall":**
  1. The front elevation (hero).
  2. Round the corner to the side sign. On desktop it is pinned on the right, like the board on the wall, while its five lines are explained on the left in the sign's order.
  3. Under the canopy band to the story.
  4. Through the door to Book and Find us.
- **Booking:** booking is a hand-off only, through plain links to the verified ResDiary widgets in new tabs (no `window.open`, no fake confirmation). The page says: "Nothing is booked on this page."
- **Accessibility:**
  - There is a skip link, plus landmarks.
  - Headings run in order: one H1 per page; on the home page it is visually hidden, because the drawn fascia is the visual title.
  - `:focus-visible` uses clay on cream and pale gold on green. Inside the SVG sign, focus draws a clay stroke around the line or plate.
  - Every interactive target outside running text measures at least 44px tall at 390px (checked with Playwright). Inline text links use padding.
  - The sign's SVG links have descriptive `aria-label`s, which gain "(serving now)" when lit.
- **Page transitions:** cross-document View Transitions (`@view-transition`), switched off under reduced motion.
- **Metadata:** title, description, `theme-color`, inline SVG favicon (a gable), Open Graph, `lang="en-GB"`, and Restaurant JSON-LD with confirmed facts only (no founding date).

### Contrast (WCAG 2.x)

| Pair | Ratio |
|---|---|
| Gold leaf #D9A845 on green #24392F | 5.66:1 |
| Darkest gilt stop #CC9B40 on green | 4.90:1 |
| Pale gold #F7E2A2 on green | 9.61:1 |
| Booking plate text #E7C46E on green | 7.36:1 |
| Ink #1C1A17 on cream #F1EAD9 | 14.48:1 |
| Ink-soft #463E34 on cream | 8.76:1 |
| Clay #7A3B26 on cream (links, labels) | 7.06:1 |
| Green #24392F on cream (headings) | 10.29:1 |
| Cream on green (the lit line's note) | 10.76:1 |
| Sign note #3B342B on board #F3ECDC | 10.42:1 |
| A faded (finished) sign line, about #5E5A52 on the board | 5.83:1 |
| Footer text #D9D1BD on #182820 | 10.13:1 |

Gold on clay tile (3.9:1) appears only in the illustration and in the decorative canopy band (`aria-hidden`), never as information.

### Checks run (Playwright, Chromium)
- Both pages at 390, 768 and 1440: **0 console errors or warnings, 0 failed requests, 0 horizontal overflow, no broken in-page anchors, no duplicate ids.**
- Also checked: no-JS, reduced motion, keyboard focus moving from line to plate in the sign, and frames of the glint mid-animation.
- Screenshots are in the scratchpad (`…/scratchpad/v2/build-maids-a/shots/`), not in the repo.

### Copy edits: menus set from the copy deck with these spelling fixes (to confirm with the client)
- "Capuchino" became "Cappuccino".
- "FILTER COFFE" became "Filter Coffee".
- "brisk and r ounded" became "brisk and rounded".
- "with added flavours with added flavours" now appears once.
- "on a bed salad leaves" became "on a bed of salad leaves".
- "BY-THE-SLICE'" became "By-the-Slice".
- "Vauban Frère's" became "Vauban Frères".
- Prices, items and wording are otherwise as printed. The Ellis Wines quote stops at "1822", as the copy deck instructs.
- Short headings and connecting sentences are the studio's own (for example "Painted on the side wall", "Second Courses, continued", "Nothing is booked on this page"). They state no new facts.

---

## 4. To confirm (shown on the page with the standard `tbc` marker and an HTML comment)
1. The founding date at Kew Road (1850, 1860, 1868 or 1887). "Serving you since 1850" is used only as the business's own sign-off and labelled so.
2. The Luncheon minimum: £22 on the menu, £20 on the booking page.
3. Whether the 2024 menus and prices are current.
4. The morning coffee end time (09:00–12:00 is our reading).
5. Bank holiday and Christmas hours (not published, so the sign follows the normal daily hours).
6. Step-free access at 288 Kew Road.
7. Copy edits: the typo corrections listed above.

## 5. Known limitations
- **No holiday calendar.** The sign assumes every day is a normal day. A real build would read a closures list kept by the tearoom.
- **The lit line** is a design decision (one "meal of the moment"). The other lines being served are marked, but a visitor who wants patisserie at 10:30 sees MORNING COFFEE gilded, not CAKES & PASTRIES.
- **The sign's lettering is SVG text** using web fonts. Before the fonts load (or offline), it renders in the metric-matched Georgia fallback, and `textLength` keeps every line inside the board.
- **The sticky sign on desktop** sizes itself to the viewport height. Below about 760px of height the board gets small (around 300px wide), though still legible.
- **The two shared booking plates.** The counter lines use the general ResDiary widget, because the business has no bakery booking.
- **The hero illustration is large** (about 118 KB of inline SVG). It is served inline so the gilding can react to the pointer, and it compresses well, but it is the heaviest part of the page.
- **Testing scope.** Tested in Chromium only. Safari and Firefox should handle SVG `<a>`, `paint-order` and `background-clip:text`, but this was not checked on devices.

## 6. Assets to replace and the photography shot list
- **Logo:** the header uses a working wordmark set in Grenze Gotisch ("The Original / Maids of Honour"). It is not a redraw of the business's logo. Replace it with the client's vector logo if one exists (TO CONFIRM).
- **Fonts and colours:** the fascia green and gold should be matched on site (the brief's values come from photo samples).
- **Image slots** (fixed-ratio placeholders with captions on the page):
  1. *Cakes & pastries panel (4:3):* the first tray of Maids of Honour on the counter at 9am, puff edges flaking, tops blistered gold, shot from counter height.
  2. *The shop front section (16:9):* the fascia and the TEAS gable from across Kew Road in low October sun, gold leaf lit, the canopy and its lantern in shade below.
- **More shots to commission:**
  3. The side-wall sign, square-on, mid-morning, for an "about the sign" page.
  4. A close-up of "Newens" on the canopy tiles with the lantern lit at dusk.
  5. The cresting and ivy against the sky.
  6. A white iron chair and topiary planter at the door, early morning, before service.

## Structured data and llms.txt

**Encoded** (facts from `research/copy-deck.md` only):
- `index.html`: one JSON-LD block (it replaces the earlier `Restaurant` block). Type `["CafeOrCoffeeShop","Bakery"]`, `name`, `description` ("A Historic Traditional English Tearoom Shop and Bakery.", shown on this page), `address` (288 Kew Road, Richmond, Surrey, TW9 3DU, GB), `telephone`, `email`, `url` https://theoriginalmaidsofhonour.co.uk/, `openingHoursSpecification` Monday–Sunday 09:00–18:00 (VERIFIED), `acceptsReservations` true, `potentialAction` ReserveAction with the four ResDiary entry points shown on the page (Book a table, Breakfast, Luncheon, Set tea), `hasMenu` https://theoriginalmaidsofhonour.co.uk/menu.html.
- `menu.html`: one `Menu` block (it replaces the earlier `Restaurant` block): 5 sections, 135 items, 172 GBP offers, generated from this page's own DOM. The Menu `description` carries the page's own caveat ("From the tearoom’s 2024 menus. Prices may have changed."), because the copy deck marks the 2024 prices [TO CONFIRM]. Printed labels become offer names: Hot/Cold, bottle/glass columns, "for 2, two glasses…" on the Champagne and Prosecco teas, and "Chicken or Steak £8". "From £2.50" uses a minimum price. Set teas are one item each, with their contents as the description. "Extra Portions" is its own item, not a price of the Roast.
- `llms.txt`: name, one-line description, address, phone, email, hours (9am–6pm every day; the shop/tearoom split and holiday hours marked "to be confirmed"), luncheon and set-tea times, the walk-in policy, the four ResDiary links, a link to the menus (prices "may have changed") and the service charge, plus a preview note matching the page banner.
- `<meta name="description">`: index 161 characters, menu 149 characters.

**Deliberately left out, and why:**
- `foundingDate` and any "Est. 1850" or "since 1850" claim: 1850, 1860, 1868 and 1887 are disputed.
- The Henry VIII and Anne Boleyn legend, and anything from the history labelled LEGEND or REPORTED-only.
- Tart prices (£3.50 in the tearoom; £2.25 and box prices in the shop): copy deck [TO CONFIRM] item 6. The tart is listed by name and description only.
- The Luncheon minimum charge (£20 or £22, disputed). The Thursday no-cooked-breakfast rule ([TO CONFIRM]).
- Upgrade and add-on prices ("extra £2", "£15 Extra", "Weekday Special: £15 each", plant milks "£0.50 extra"). They stay in descriptions as printed and are not offers.
- Unpriced lists such as the loose teas: they are priced per pot elsewhere, so they are not separate offers.
- `sameAs`: the copy deck lists no social profile URLs. `servesCuisine`: the copy deck states no cuisine. `geo`: no coordinates in the research. The guest rooms and the National Archives café are separate businesses.
- A single "main" booking URL: which ResDiary link is the main one is [TO CONFIRM], so `acceptsReservations` is `true` and all four links are listed.
- This page prints "Second Courses, continued" and the Baker's Hot & Cold Luncheons as one block. Pie, Pasty and Quiche are encoded as their own items with Hot/Cold offers. The truffle's "with Rum £5" line is encoded as an option of "Chocolate Sponge Truffle without Rum".

**Notes:**
- **Official-domain assumption.** `url`, `@id` and `hasMenu` assume this concept is deployed at https://theoriginalmaidsofhonour.co.uk/ with the menu at `/menu.html` (the file name this concept uses). If the live site keeps a different menu path, change `hasMenu` and the Menu `url`/`@id`, or add a redirect. `llms.txt` links to the menu relatively (`menu.html`), so it works on the preview and on the domain.
- **Matches the visible page.** Every price, phone number, hour, address part, description sentence and booking/order link in the JSON-LD was checked against this page's `document.body.innerText` (plus each menu tab's panel), and each menu price is paired with its own printed line. `llms.txt` phones, emails, times and links were checked against the index and menu pages. No console errors. Nothing visible changed: only the JSON-LD block and `<meta name="description">` in `<head>` were edited.
- **Preview mechanisms untouched.** The "speculative design proposal" banner is unchanged. Note: neither page has a `<meta name="robots" content="noindex">` tag (there was none before this pass, and none was added); if previews rely on `noindex`, it must come from the host (an `X-Robots-Tag` header).
- **Regenerating.** Scripts: `/tmp/claude-0/-home-user-Claude-code/e50707d5-9ec5-571e-9915-9e7145ebe50f/scratchpad/v2/aivis/jsonld/` (`extract.js` reads items and prices from each menu page's DOM, `build.js` writes JSON-LD, meta and `llms.txt` from `facts.js` (copy deck only), `validate.js` checks against the rendered pages, `servers.sh` serves ports 8701–8709). Re-run them if a menu or a fact changes.

---

## "Useful first" pass (26 October 2026)

The client felt the site put its signature ahead of being useful. The signature now sits alongside the essentials instead of in front of them; nothing of it was removed. Standard: `pipeline/research/information-hierarchy.md` §(b); rubric §(c); before scores from `pipeline/research/useful-first-audit.md`. Facts from `research/copy-deck.md` only.

### Score: 28/32 before → 32/32 after (rubric §(c), 390×844 and 390×660)

| Item | Before | After |
|---|---|---|
| 1 (G) Essentials on screen 1 | 1 | 2 |
| 2 (G) Time to essentials | 2 | 2 |
| 3 (G) Signature parallel | 2 | 2 |
| 4 Signature budget | 2 | 2 |
| 5 Hidden content duplicated | 2 | 2 |
| 6 (G) Reduced motion / no JS | 2 | 2 |
| 7 Hours table | 2 | 2 |
| 8 Priced taster | 1 | 2 |
| 9 Find us | 2 | 2 |
| 10 Booking clarity | 2 | 2 |
| 11 (G) HTML menu | 2 | 2 |
| 12 Menu navigation | 2 | 2 |
| 13 Prices and dietary marks | 1 | 2 |
| 14 Action bar | 1 | 2 |
| 15 Interaction accessibility | 2 | 2 |
| 16 Literal labels | 2 | 2 |
| **Total** | **28** | **32** |

### What changed
- **Today strip** in the hero, under the eyebrow: status from the published hours on the London clock ("Open now · until 6pm", "Closed · opens 9am tomorrow"; "Open every day" with JS off), "9am–6pm daily · last walk-ins seated 17:30", the address linked to Google Maps ("288 Kew Road, opposite Kew Gardens · Map"), Book a table and Menus, and a "Skip to visit info" link. Plain HTML; the status script runs at the end of the hero so the swap never changes line count (no CLS). On phones the frontage drawing shows a wider, shorter window on the whole building (1160×690 crop) so the strip clears the bar inside 390×660.
- **Visit second** ("Visit us", gable 288): every service with its own BOOK plate (shop and tearoom 9–6 and walk-ins 17:30 → any table; breakfast, last orders 11am, none on Thursdays → 33175; luncheon 12–3 with the £22/£20 minimum and its marker → 33176; set teas 10:00, fizz 11:00 → 33177), a two-line booking policy (ResDiary per sitting, phone, walk-ins, 12.5% service, preferred tables, vegan 24 h notice), the doorway address plate with the map link and phone, and getting there (opposite Kew Gardens, on-street parking; walk from the Gardens and step-free access not published, to confirm). Bank holidays carry a marker. The old Book and Find us sections are merged into it; `#book` and `#visit` still work.
- **Taster third** ("From the menus", gable Prices): the tart £3.50 (with its allergens), High Tea £24.50, Savoury High Tea £26.50, Full English £13, Vegetarian English £13 (V), Roast of the Day £18, the 2024-prices marker and "See the full menus". Section top at 1,611 px, first price at 1,710 px at 390 wide (was screen 4–6).
- **The sign, kept whole:** board, gilded live line, BOOK plates, status plate and time-travel clock. On phones the board is 256 px wide and the block from heading to clock is 843 px (one screen); the five line panels are slimmed to name, times and links, because their menus and prices now sit in the taster and on the menu page. Visible "Skip past the sign / Skip to visit info" links sit before it. The 9-second glint now has a visible "Pause the glint" button. The bakery quotes, tart photo slot, post and delivery lines, parties, guest rooms and the Archives café moved into the story section ("Our story: the very same shop front").
- **Action bar:** Book · Menus · Call (Find us dropped; it is in the strip and nav). Menu page bar: Book · Call · Find us. `scroll-padding-bottom` set below 1000 px.
- **Nav:** Menus · Hours & find us · Served today · Our story.
- **Menu page:** sticky row relabelled "On this menu" with an Allergens link; a "Before you order" box under it with the dietary legend (V, VG, GF/DF from the tearoom's own lists), the allergen statement verbatim, the tart's allergens, how to ask about the 14 allergens, vegan notice and service; marks on Vegetarian English, the Gluten & Dairy-Free list, the brownie and the apple lattice slice; "Back to top" at the end of every course.
- **Desktop:** the hero art now sits at the top of its row so the progressively parsed drawing never moves (CLS 0.101 → 0.005 at 1440).

### QA
- `qa.sh` (port 8944, label `v2-maids-a-uf`): 0 console errors, 0 failed requests, 0 bad links, 0 horizontal overflow, axe clean on both pages. CLS index 0.003 / 0.000 / 0.005, menu 0.001 / 0.001 / 0.000 (390 / 768 / 1440).
- First screen checked by screenshot at 390×660 and 390×844 (motion, reduced motion and JS off): status, address with map link, Book and Menus all visible above the action bar.

### Caveats
- The first priced line is at 1,710 px: "about 1,700". The taster heading starts at 1,611.
- No station or bus is in the copy deck, so getting there gives Kew Gardens, parking and the to-confirm walk instead.
- Fonts, palette, drawings, JSON-LD and `llms.txt` are unchanged (no visible fact changed).


## Pitch notes (not for the site)
Moved here in the editorial pass of 27 October 2026. These lines explained the design to the owner, so they came off the page. Use them in the pitch.

- **The hero drawing.** "288 Kew Road, drawn for this proposal: the fascia and its TEAS gable, the Newens canopy, the lantern and the iron cresting." The drawing now runs without a caption; the eyebrow below it already says "Shop & Tea Room on 288 Kew Road".
- **The side-wall sign.** "The board on the side of the shop keeps time: the line served now is gilded … Same times in Visit us." The page now gives only what a visitor needs to use it: "The gilded line is being served now. Tap a line for its menu, or a plate to book." The no-JS note "With JavaScript on, the line being served now is gilded" is gone, and the default clock label reads "Opening times", not "Times as published".
- **Morning coffee window.** On the page this was "Morning coffee is shown from opening until luncheon begins at 12 noon. That end time is our reading, not a published one." It now reads "Morning coffee 9am to 12 noon", with a to-confirm marker. The 12 noon end is still our inference from the 12:00 luncheon start.
- **Source discrepancies.** These were written on the page in a researcher's voice and are now only behind the to-confirm markers: the luncheon minimum (the menu says £22, the booking page £20), the founding date (1850, 1860, 1868 or 1887), "not published" walking time and step-free access, and "The tearoom's own sign-off" under "Serving you since 1850".
- **"Nothing is booked here."** This was on the booking policy line and only made sense on a proposal.
- **Our story.** The Mock Tudor description ("painted pebbledash, red clay roof tiles, heavy timbering and casement windows") was cut as decor detail. The "Peter Newens" list item was cut because it repeated the paragraph above it.
- **Photography to commission.** Two placeholder frames were on the page and are now cut. (1) The first tray of Maids of Honour on the counter at 9am, puff edges flaking, tops blistered gold, shot from counter height. (2) The fascia and TEAS gable from across Kew Road in low October sun, gold leaf lit, the canopy and its lantern in shade below. The shot list in §6 still applies.
- **Menu page.** "set out as the tearoom prints them" and "Printed on the High Tea menu" are cut. The Patisserie List's full allergen statement (a copy of the one at the top of the menus) is now a one-line pointer. The closing "Allergens" block, a second pointer plus the table-preference line, is cut.
- **"Their" shop.** Links that said "Order from their shop" and "on their site" now say "Order online" and so on.
