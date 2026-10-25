# Matsuba, Concept C: "Bento"

**The concept in two lines.** The bright, daytime and takeaway Matsuba, organised like a bento box: one lacquered box of unequal, flat-colour compartments, each holding one thing you need (order, book, today's hours, lunch, rolls, find us). On the menu page the lid lifts once and each compartment opens to fill the box.

Local preview: `python3 -m http.server 8313 --directory richmond-sprint/matsuba/concept-c`

## Files

- `index.html`: homepage (bento hero, lunch bento, signatures and special rolls, takeaway, tasting menu, hours and find us)
- `menu.html`: the full menu and the "Open the box" interaction
- `css/styles.css`: all styles (tokens, compartments, both pages, print)
- `js/hours.js`: the pure opening-hours function (browser global `MatsubaHours` and Node `module.exports`)
- `js/site.js`: renders the homepage "Today" compartment and highlights today's row in the hours lists
- `js/menu.js`: the "Open the box" enhancement
- `tests/hours.test.js`: Node test for the hours function (`node tests/hours.test.js`). Not loaded by the pages.
- `img/favicon.svg`: source of the favicon, which is also inlined in both pages as a data URI. There are no photos, by design.

## Type, colour, wordmark

- **Type:** Zen Maru Gothic 500/700/900 for display, and Lexend (variable 300–700) for text and UI. Both come from Google Fonts with `display=swap` and preconnects. Each has a metric-adjusted local fallback face (`Lexend Fallback` on Arial, `Zen Maru Fallback` on Arial Rounded / Arial). The override values are estimates tuned by eye, not measured from the font files.
- **Colour:** shari #FBFAF6, nori #141714, matsu #1F4D3A, salmon #EE7F62 and wasabi #A9BC3E, plus two derived tints, kome #F2EDE0 (cream) and momo #F7CDBD (pale salmon).
  - Salmon carries only nori text (6.7:1); text on salmon never uses the softer grey.
  - Wasabi is used only on dark grounds: 8.6:1 on nori and 4.56:1 on matsu, which is the tightest pair on the site. It's used for labels, roll prices and the quote on matsu.
  - Secondary text is #3E4540 (9.4:1 on shari).
  - Compartment colours were assigned with a small brute-force check so that no two touching compartments share a colour in any of the three responsive layouts.
- **Wordmark:** a working wordmark, "MATSUBA" in Lexend 500 with 0.34em tracking. This is not the restaurant's logo file and does not redraw it. No kanji, and no pine-needle motif (that belongs to Concept A).
- **Illustration:** original flat SVG food shapes: maki cross-sections, nigiri, an edamame pod, a bowl, mochi, a top-down bento, a tray and a clock. There are no faces. The maki fillings are deliberately irregular, and no red disc sits centred on white anywhere, so nothing reads as a flag.

## How the box works

### Homepage bento

- `.bento` is one CSS grid with named areas. The nori background shows through the `gap`, which forms the thick dividers; compartments have a 5px radius and no shadows. The layout re-packs at each width:
  - **Below 360px:** a single column.
  - **360–639px:** Order full width, then Book (so the first 390px frame shows Order, the 20% offer and the start of Book), then Today, Lunch, and Rolls beside Find us.
  - **640–1023px:** 6 columns.
  - **1024px and up:** 12 columns, with Order as the large left compartment.
- **Today:** it shows the published week (with to-confirm markers) without JS. With JS, `site.js` calls `MatsubaHours.getStatus(new Date())`, writes the state headline, detail, London time and any to-confirm notes into reserved space (min-height, so there's no layout shift), and highlights today's row. It re-checks every minute and when the tab becomes visible.

### Menu page: "Open the box"

- **Without JS:** a plain long menu. Nine `<section id>` blocks hold all 159 dishes, and an index of `#anchor` links sits in the header panel. Every section and sub-heading (for example `#special-rolls`, `#nigiri`, `#bento-box`) is a normal anchor.
- **With JS:**
  - An inline head script adds `.js`. The CSS then lays the sections out as compartments, using grid areas with the same responsive re-pack, and hides each section's dish panel.
  - `menu.js` moves each `h2`'s text into a real `<button aria-expanded="false" aria-controls="…-panel">`. A stretched `::after` makes the whole compartment the hit area.
  - Each panel becomes `role="region"`, `tabindex="-1"` and `aria-labelledby` its heading.
- **Expanding a compartment:**
  - Selecting one marks it `.is-open`. The others are removed from the grid and the open one spans the whole box. It gets a 260ms scale spring (`cubic-bezier(.34,1.5,.64,1)`) and a 240ms rise on the dish panel.
  - `aria-expanded` becomes `true`, the URL hash is updated with `replaceState`, and the document title gains the section name.
  - The box scrolls into view and focus moves to the panel.
- **Returning to the box:** a sticky "Back to the box" bar sits at the top of the open compartment, with another "Back to the box" and a "Next: <section>" button at the bottom, and Escape also works. Returning collapses the compartment, restores `aria-expanded="false"`, clears the hash and puts focus back on that compartment's button.
- **Deep links:** `menu.html#rolls-maki` or `#special-rolls` opens the right compartment on arrival and scrolls to the sub-heading. On arrival it doesn't take focus. A later `hashchange` opens a compartment and does move focus.
- **The lid:**
  - It's a nori panel with the wordmark and a salmon paper band. It covers the compartments only when the head script has added `.lid-on`, which needs motion allowed, no hash in the URL, and the lid not yet seen this session.
  - It lifts once with a CSS keyframe (650ms delay, 620ms lift and tilt), so it still lifts even if `menu.js` fails.
  - A click on the lid, or focus entering the grid, makes it lift at once. `sessionStorage` (in a try/catch) stops it replaying in the same session.
  - With `prefers-reduced-motion: reduce` there's no lid and no expand animation. The box and the expand/return interaction still work, statically.
- **Failure safety:** if `menu.js` fails to load (`onerror`) or throws during setup, `.js` and `.lid-on` are removed and the page falls back to the plain long menu.

## Hours function: results

`js/hours.js` exports a pure `statusAt(day, minutes)` and a wrapper, `getStatus(date)`. The wrapper converts any instant to Europe/London wall-clock time with `Intl.DateTimeFormat` (`timeZone: 'Europe/London'`).

- **States:** `lunch` (Mon–Fri 12–3pm), `open` (Mon–Fri 5–10pm and Sat 12–10pm), `between` (Mon–Fri 3–5pm) and `closed`. Close times are exclusive.
- **To-confirm flags:** `tbc[]` carries `monday` whenever the day, or the next opening, is a Monday, and `lunch-end` whenever the state depends on the lunch end time. The page shows each flag as a visible "to confirm" marker.

`node tests/hours.test.js` (12/12 pass, run 25 Oct 2026). The cases include both sides of the clock change on 25 October 2026:

| Case | Instant (UTC) | London | State | Headline: detail | To confirm |
|---|---|---|---|---|---|
| Wed, before opening (BST) | 2026-07-15T10:30Z | 11:30 | closed | Not open yet: Opens today at 12pm | none |
| Wed, lunch (BST) | 2026-07-15T11:30Z | 12:30 | lunch | Open for lunch: Until 3pm, then dinner from 5pm | lunch-end |
| Wed, between services | 2026-07-15T14:15Z | 15:15 | between | Between services: Dinner from 5pm today | lunch-end |
| Wed, 5pm opening edge | 2026-07-15T16:00Z | 17:00 | open | Open for dinner: Until 10pm | none |
| Wed, 10pm closing edge | 2026-07-15T21:00Z | 22:00 | closed | Closed for the day: Opens tomorrow at 12pm | none |
| Sat, afternoon | 2026-07-18T13:00Z | 14:00 | open | Open all day: Until 10pm | none |
| Sat night, next is Monday | 2026-07-18T21:30Z | 22:30 | closed | Closed for the day: Opens Monday at 12pm | monday |
| Fri 23:30Z is already Saturday in BST | 2026-10-23T23:30Z | 00:30 | closed | Not open yet: Opens today at 12pm | none |
| Sunday after the clocks change | 2026-10-25T12:00Z | 12:00 | closed | Closed today: Opens tomorrow at 12pm | monday |
| Mon, a minute before opening (GMT) | 2026-10-26T11:59Z | 11:59 | closed | Not open yet: Opens today at 12pm | monday |
| Mon, lunch (GMT) | 2026-10-26T12:30Z | 12:30 | lunch | Open for lunch: Until 3pm, then dinner from 5pm | monday, lunch-end |
| Fri, last lunch minute (GMT) | 2026-12-18T14:59Z | 14:59 | lunch | Open for lunch: Until 3pm, then dinner from 5pm | lunch-end |

The browser render was also checked with Playwright's fixed clock: Monday 12:30 shows "Open for lunch" with both to-confirm markers and highlights the Monday row.

## Content and honesty decisions

- **Sources:** all facts and menu text come from `research/copy-deck.md`. The menu is verbatim, including published spellings and dual prices. Prices are shown without "£" where the restaurant omits it, and with "£" on the kids' and Lunch & Early Evening cards, where it prints one. A note on the page says so.
- **Kids' menu:** transcribed from an image by the researcher. The print's capitals are set in title case here (wording unchanged).
- **To-confirm markers:** every uncertain fact uses `<span class="tbc" title="To be confirmed with the restaurant">to confirm</span>` plus an `<!-- [TO CONFIRM] … -->` comment. That covers:
  - Monday opening
  - the lunch end time (3pm / 2:45pm / 2:30pm)
  - whether Lunch & Early Evening is still running
  - what dual prices mean
  - whether the 2024 vegan and GF menus are current
  - how to place the tasting-menu pre-order.
- **Spellings kept as published** (each has a `[TO CONFIRM]` HTML comment beside it; none corrected): "Eby Fry", "Uangi Steak", "(all samon)", "South Amerian", "Chrispy", "chilli papper", "Yuzu Te", "Aperol Com Fanta", "Vanila". "Torched-seared" is also kept on Tuna Tataki.
- **Takeaway offer:** "20% off collection, every day. Kids' menu not included." It links to Toast. Delivery isn't mentioned anywhere, because it's unknown.
- **Booking terms:** stated plainly from the Favourite Table copy: online up to 12, larger parties by phone, a card secures the booking with nothing taken at booking, and £10 per person may be charged for cancellations under 24 hours or no-shows.
- **Lines used verbatim:** "Pull up a chair. Take a taste. Come join us.", "We look forward to welcoming you to MATSUBA!", the Tuna Tataki signature line, and "large 8 piece rolls exclusively created by MATSUBA".
- **Hand-offs:** no backend exists, and every action is a plain link to its verified destination: Toast, Favourite Table, `tel:`, `mailto:`, Instagram, the takeaway PDF, a Google Maps search, and matsuba.co.uk. Nothing auto-navigates, and there's no fake confirmation.
- **Deliberately left out:**
  - "best sushi" claims, reviews, ratings and names
  - the Korean heritage
  - covers (30, Harden's only)
  - the expired kids' free-drink offer
  - the FSA hygiene rating (a confirmed public record, but omitted to keep to the spec's "no ratings")
  - opening hours in the JSON-LD (Monday and the lunch end are unconfirmed)
  - the security issue (studio-only).

## Deviations from the brief, and why

- **"Today's hours" compartment:** it also prints the weekly hours, so the compartment is complete without JS. The live state is layered on top.
- **Lunch end time:** the hero and the lunch tier show "Available between 12pm – 2:45pm" (the Lunch Menu tab's wording), while the hours lists use the footer's "12–3pm". Both carry the marker, and a line explains that three times are published.
- **Homepage bento on mobile:** it packs Order and Book full-width first rather than side by side. At 390px a half-width Book or Today compartment grew to more than 550px tall, and putting both primary actions in the first frame mattered more. Rolls and Find us stay side by side so it still reads as a box.
- **Menu page footer panel:** it holds the price, dual-price and 2024 vegan/GF notes, so the header panel stays short at 390px. The allergy and service lines stay in the header, and they are repeated verbatim at the end of the Lunch & Early Evening card.
- **Compartment buttons:** they sit inside the `h2` (the accordion pattern), so heading navigation still works in box mode. An open compartment's visible controls are the "Back to the box" buttons. The heading button stays in place with `aria-expanded="true"` and also returns to the box.
- **Opening a compartment:** this uses `history.replaceState` rather than `pushState`, so the browser back button leaves the page instead of closing a compartment. That keeps history predictable; Escape and "Back to the box" handle returning.

## Known limitations

- **Fonts:** the fallback metric overrides are estimates. Some reflow is possible on very slow connections.
- **Today compartment:** it reflects published hours only. It can't know about holidays or closures, and the Monday and lunch-end uncertainty is flagged, not resolved.
- **Hours test coverage:** the Node test covers the function and the clock change. The browser render was spot-checked with a fixed clock, not exhaustively.
- **Lid timing:** the lid uses fixed timings. If the page is opened in a background tab, the lid may have finished lifting before it's seen. A 2.4s safety timeout clears it either way.
- **Dual prices:** shown exactly as printed, for example "Katsu Curry … 18.9/17.9" for three variants. The mapping is unknown.
- **Takeaway prices:** they differ from dine-in on some dishes. The site links to the June 2026 takeaway PDF rather than restating those prices, and Toast's live menu wasn't verified (the researcher was blocked by a bot check).
- **Testing scope:** tested in Playwright Chromium only (390, 768, 1440, plus 320, 1024 and 2560 overflow checks; no-JS; reduced motion; keyboard). Not tested in Safari/WebKit or with a physical screen reader.

## Assets to replace

- The working wordmark, with the restaurant's own logo if it approves (its current PNG is white-on-transparent and only works on dark).
- The seven photo slots below.
- Optionally, the flat SVG food shapes, if the restaurant prefers photography in those places.

## Photography shot list (slots on the homepage)

1. **A bento box from above:** lid off, every compartment in frame, bright daylight. (Lunch tier; tall slot on desktop.)
2. **Tuna Tataki with shredded mooli,** with the carpaccio range beside it. Close, three-quarter angle. (Signatures.)
3. **A Special Roll, cut:** eight pieces in a line, filling to camera. (Signatures.)
4. **The stonepot bibimbap,** just served, from above. (Signatures.)
5. **Takeaway packed for collection,** bagged and waiting on the counter. (Takeaway band.)
6. **The frontage on Red Lion Street,** by day, straight on. (Visit.)
7. **The room:** dark wood slats, Edison bulbs, sake bottles on the shelf. (Visit; wide 21:9 on desktop.)

All seven are commissioned photography; the restaurant's existing photos need its permission to reuse. Each slot has a fixed aspect ratio and a visible caption naming the shot.
