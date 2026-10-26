# "Useful first" audit: 12 Richmond concepts

Audited 26 October 2026, scored against the rubric in `information-hierarchy.md` §(c), with the standard in §(b). This is an audit only: no concept file was changed.

## Method

- **Servers:** each concept folder was served with `python3 -m http.server` on ports 8921–8932. All servers were stopped afterwards.
- **Browser:** Playwright with Chromium, mobile emulation, Europe/London time. The run took place on Monday 26 Oct at about 18:10, so Maids of Honour was closed and Matsuba's Monday was "to confirm".
- **Viewports:** 390×844 and 390×660 (the Safari safe area).
- **Modes:** motion, `reducedMotion: 'reduce'`, and `javaScriptEnabled: false`.
- **Captures:** screenshots at DOMContentLoaded, after 500 ms, at rest, and then at every screen-height step down the page.
- **What counts as "seen":** an essential counts only if it is **visible text**: in the viewport, with opacity of at least 0.35, not under the bottom bar, and not covered by artwork. Every detector result was checked against the screenshots. Where the detector was wrong (Caffè Mamma B and Tide A put hero text inside a pinned layer), I scored from the screenshot.
- **Signatures:** pin length was measured from the sticky or `pin-spacer` geometry.
- **Keyboard and menu pages:** a keyboard run of 45 Tab presses per page at 390 and 1280. From screen 1, I clicked Book and Menu without touching the signature. Menu pages were checked with JS on and off.
- **Screenshots and raw data:** `/tmp/claude-0/-home-user-Claude-code/e50707d5-9ec5-571e-9915-9e7145ebe50f/scratchpad/useful-audit/`. That folder holds `<concept>-<mode>-<height>-sNN.png`, the `sheet-*.png` contact sheets, and the `*.json` files.

### Scoring conventions

- **Screen numbers:** "screen n" means the nth 844-px screen on the home page at 390 wide, in motion mode. Reduced-motion and no-JS screens are given where they differ.
- **"Within 2 scrolls"** means by about 1,700 px, which is screens 1–3.
- **Item 1 (essentials on the first screen):** scored on the worse of 390×660 and 390×844, as the rubric's test requires.
  - A Book or Menu control in the bottom bar *is* that action, so it counts.
  - Status or address shown only as a link ("Find us") counts as "only reachable via the bar", which scores 1.
- **Item 12 (menu navigation):** a sticky, labelled course row counts as meeting "jump links and back-to-top", because it is always one tap away.
- **Item 14 (action bar):** none of the 12 concepts sets `scroll-padding-bottom`, since `html` computes `auto` everywhere. No concept can score 2.
- **Tide Tables:** it has no published menu, prices or booking system. Items **8** (priced taster), **10** (booking clarity) and **13** (prices and dietary marks) are scored as **n/a: not applicable**, so the maximum is **26**.
  - Pass is set at 80% (21/26) and revise at 62.5% (17/26), mirroring 26 and 20 out of 32.

---

## 1. Summary

Screen columns show where each item first appears **as visible text** on the home page at 390×844, in motion mode.

| Concept | Score | Gate failures | Result | Hours: today / full week | Address: short / full + map | Priced menu taster | Booking: button / details |
|---|---|---|---|---|---|---|---|
| Caffè Mamma A "La carta" | **27/32** | none | **Pass** | 1 / 11 | 1 / 11 | 5 | 1 / 8 |
| Caffè Mamma B "Sera" | 24/32 | none | Revise | none / 12 | 1 / 12 | 5 | 1 (bar) / 11 |
| Caffè Mamma C "Bucato" (current lead) | 25/32 | none | Revise | 2 (week line) / 2 | 2 / 12 for map | 4–5 | 1 (shirt + dock) / 10 |
| Matsuba A "Under the awning" | 23/32 | none | Revise | none / **9** (6 with RM or no JS) | 1 / 9 | 7 (bare prices) | 1 (bar) / 6 |
| Matsuba B "The stepped wall" | **28/32** | none | **Pass** | 1 ("Open now") / **8–9** | 1 / 8 | 3–4 (bare prices) | 1 (bar) / 7 |
| Matsuba C "Aburi" (current lead) | 25/32 | **Item 1 = 0** | **Fail** | none / **7–8** | 1 at 844, none at 660 / 7 | 1 (one dish), 2 (Aburi Nigiri) | 1 / 6 |
| Maids A "Teas" (current lead) | **28/32** | none | **Pass** | 1 / 1 as one line; table at **12** | 1 / 12–13 | 4–6 | 1 / 10 |
| Maids B "A royal secret" | 25/32 | none | Revise | 1 (hours only, no status) / **12** | 1 / 11 | 1 (the tart alone); 3 or more at **8** | 1 / 9–11 |
| Maids C "The tearoom" | **27/32** | none | **Pass** | 1 (bottom edge; none at 660) / 10 | 1 / 9 | **2–3** (set teas) | 1 / 3 (set tea), 10 |
| Tide A "Under the keystone" (current lead) | **21/26** | none | **Pass** (narrowly) | 1 / 1 | 1 as "beneath Richmond Bridge" / 7 | n/a | n/a (Call is in the bar on screen 1) |
| Tide B "Five arches" | 19/26 | none | Revise | 1 / 1 | 1 / 8 | n/a | n/a (Call is in the header) |
| Tide C "Ride the tide" | 20/26 | none | Revise | 1 / 1 | 1 / 11 | n/a | n/a (Call is in the bar) |

**I verified the earlier scan rather than assuming it.**

| Concept | Hours table appears at screen | Notes |
|---|---|---|
| Matsuba A | **9** | 6 with reduced motion or no JS |
| Matsuba B | 8–9 | It does show "Open now, until 10pm" in the hero |
| Matsuba C | 7–8 | |
| Maids B | 12 | Its hero gives "Open every day, 9am–6pm" |
| Maids A | 12 | It is the exception: "Open every day, 9am to 6pm" and a live "Closed just now… open tomorrow at 9am" plate sit on screen 1 |
| Caffè Mamma A | 11 | |
| Caffè Mamma B | 12 | |

**The signatures' footprint on mobile (390×844, motion):**

| Concept | Signature | Pinned | Occupies | Notes |
|---|---|---|---|---|
| Caffè Mamma A | Mark the menu (filter) | 0 | about 1 screen, at screen 5 | Parallel |
| Caffè Mamma B | Lights come on | **1.1** (GSAP pin) | 2.1 | The page colours are scrubbed across the whole page. The booking line dissolves in over 1.3 s, and mid-dissolve "Kew Road" overprints "Table for tonight?" (screen 2) |
| Caffè Mamma C | Washing-line nav | 0 | 0.75 | A wind gust repeats every 5–9 s with no pause |
| Matsuba A | Step inside (the walk) | **4.2** | 5.2 | Screens 2–4 are illustration only, with no readable text |
| Matsuba B | Stepped oak wall | 0 (fixed backdrop) | the whole page, behind | About 3 s at load |
| Matsuba C | Sear | 0 | the hero | The candle flame loops |
| Maids A | Live side-wall sign | 0 on mobile | **5.3** (screens 2–7) | Native scroll, but it pushes Book and Visit to screens 9–12 |
| Maids B | Iron box, Hill Street, oven timer | 0 | **7** (screens 2–8) | Booking starts on screen 9 |
| Maids C | Three-tier stand | 0 | 2.5 | The stand *is* a priced taster |
| Tide A | Through the arch | **2.3** | 3.3 | The ferns sway on a loop |
| Tide B | Bridge plate | 0 | the hero | The river shimmer loops |
| Tide C | Waterline | 1.0 | 2 | The water drifts and bobs on a loop |

**Direct access, tried without touching the signature:** every concept's Book (or Call) and Menu work from screen 1 through the bar, the header or a hero button.
- Every Menu control landed on `menu.html`.
- The in-page Book anchors jump straight past the signature: Matsuba A to screen 5.1, Caffè Mamma B to 9.5, Maids A to 8.8, Maids B to 7.9 and Caffè Mamma C to 8.5. The signature is never a hard gate.
- The cost is the screens a visitor must scroll *if they don't know* to use the bar.

---

## 2. Per concept

Item key:
1. (G) Essentials on screen 1
2. (G) Time to essentials
3. (G) Signature is parallel
4. Signature budget
5. Hidden content duplicated
6. (G) Reduced motion and no-JS
7. Hours table
8. Priced taster
9. Find us
10. Booking clarity
11. (G) HTML menu
12. Menu navigation
13. Prices and dietary marks
14. Action bar
15. Accessibility of the interaction
16. Literal labels

### Caffè Mamma A, "La carta": 27/32, Pass

| # | Score | Evidence |
|---|---|---|
| 1 | 2 | At both 844 and 660: a sticky strip with "Today 12 noon – 11pm (to confirm)", Book and phone; "110 Kew Road, Richmond"; "We're open today"; Book a table and See the menu. |
| 2 | 2 | The strip, Book and Menu are there at first paint. The hero copy fades in within 500 ms (it is blank at DCL and complete at 500 ms). |
| 3 | 2 | Header Menu and strip BOOK; the filter is optional. |
| 4 | 2 | No pin; only pen strokes draw. |
| 5 | 2 | The filter only highlights dishes that are already listed as text. |
| 6 | 2 | No JS gives "Aperti tutti i giorni", plain OpenTable and phone links. Reduced motion is static and complete. |
| 7 | 1 | Only today on screen 1. "Open 7 days, 12 noon – 11pm" comes at screen 11, and last orders are not shown. |
| 8 | 1 | Taster with prices at screen 5. The prices have no £ ("Prices in pounds" sits on screen 6). |
| 9 | 1 | Address, Google Maps, station and parking (to confirm). No step-free note. |
| 10 | 2 | OpenTable step, phone, "nine or more call", and the online-offer terms. |
| 11 | 2 | HTML; 9 h2 and 58 h3. |
| 12 | 1 | The course index at the top is not sticky, and there is no back-to-top. |
| 13 | 2 | Every price, V legend at the top, the 14-allergens line, and unknown prices flagged. |
| 14 | 1 | The persistent bar is a *top* strip (BOOK plus an icon-only phone). No thumb-zone bar, no scroll-padding. |
| 15 | 2 | The filter uses real buttons with visible focus. |
| 16 | 2 | Menu, Story, Find us, Book a table. |

**Weakest three and fixes**
- **Hours (7):** put an "Orari" line under the hero CTAs: "Open 7 days, 12 noon–11pm · kitchen and last orders to confirm". Move the Find us block (address, map, station, parking) up from screen 11 to directly after the "Oggi" panel on screen 2.
- **Taster (8):** move the Mark the menu card (with its five priced dishes, and £ added to the prices) up to screen 2. It is already the signature, so the signature becomes the taster rather than sitting below the story.
- **Action bar (14):** add a bottom bar on phones: "Book · Menu · Find us", 56 px. Keep the top strip for date and today's hours. Set `scroll-padding-bottom: 72px`.

### Caffè Mamma B, "Sera": 24/32, Revise

| # | Score | Evidence |
|---|---|---|
| 1 | 1 | No hours or status on screen 1, at either height. Address kicker, See the menu, and the bar's Call, Find us and Book a table are present. |
| 2 | 1 | "Table for tonight?" and its Book button dissolve in over 1.3 s, only after the pin. Mid-dissolve, the old and new hero copy overprint each other (`mamma-b-motion-844-s02.png`). |
| 3 | 2 | The bar's Book a table jumps to #book (9.5 screens down); the header has Menu. |
| 4 | 1 | GSAP pins the hero for 1.1 screens, and page colours are scrubbed throughout. That is within 2× the budget. |
| 5 | 2 | The booking panel and night scene are duplicated by #book and the bar. |
| 6 | 2 | No JS and reduced motion both show the designed night frame with "Table for tonight?". |
| 7 | 1 | "Every day, 12 noon to 11pm" first appears at screen 12. |
| 8 | 1 | One course with £ prices at screen 5. |
| 9 | 1 | Address, map, station and parking. No access note. |
| 10 | 2 | OpenTable, phone, "9 or more → call". |
| 11 | 2 | HTML with h2 per course. |
| 12 | 2 | Sticky course rail plus "Back to the top of the menu". |
| 13 | 2 | £ on every priced item, V legend, allergen line. |
| 14 | 1 | Call, Find us, Book a table: literal and opaque, but no scroll-padding. |
| 15 | 1 | The bulb flicker loops (9 s, infinite) with no pause. The notes admit a sub-AA contrast transient during the golden-to-dusk dissolve. |
| 16 | 2 | Menu, Lunch, Parties, Find us. |

**Weakest three and fixes**
- **Status (1, 7):** add a static status strip under the hero text, outside the pinned layer: "Open today 12 noon–11pm (to confirm) · 110 Kew Road · Book · Menu". Put an "Orari" table second on the page, before the story.
- **Time to booking (2):** render "Table for tonight?" and Book a table in the hero at first paint, in every mode. Let the lights come on *around* it instead of revealing it. Cross-fade the hero copy without overlap, or swap it instantly.
- **Pin (4):** shorten the pin from 1.1 to at most 0.8 screen on mobile and stop scrubbing body-text colour. Run the evening palette as a one-off 300 ms transition per section.

### Caffè Mamma C, "Bucato" (current lead): 25/32, Revise

| # | Score | Evidence |
|---|---|---|
| 1 | 1 | No status or hours on screen 1. The address appears only as history prose ("on Kew Road since 2006") at 844, and at 660 only the DOVE shirt links to it. Book and Menu are present as shirts and in the dock. |
| 2 | 2 | Everything present at first paint. |
| 3 | 2 | The dock's PRENOTA and MENU are outside the line. |
| 4 | 1 | No pin, but a wind gust repeats every 5–9 s indefinitely (`washing-line.js`, `setTimeout(gust…)`). That breaks "≤3 s auto, then rest". |
| 5 | 2 | The shirt labels duplicate the nav links. |
| 6 | 2 | The static garments hang at slope angles. Without JS the booking form is hidden, but the plain links remain. |
| 7 | 2 | "Open 7 days, 12 noon – 11pm (to confirm)", the full address and the station are on screen 2. |
| 8 | 1 | Priced dishes at screens 4–5. |
| 9 | 1 | Address, map (screen 12), station, parking. No access note. |
| 10 | 2 | OpenTable, phone, "nine or more", offer terms. |
| 11 | 2 | HTML with h2 per course. |
| 12 | 2 | Sticky pegged course row. |
| 13 | 2 | £ prices, KEY, ALLERGIES at the top. |
| 14 | 1 | PRENOTA, MENU, CHIAMA in Italian first. No scroll-padding. Seven focused links ended up under the dock in the keyboard run. |
| 15 | 1 | The garments are real links with visible focus, but there is no pause for the recurring gusts. The marquee does have a Pause button. |
| 16 | 1 | Italian labels lead and English is the small line (PRENOTA "book a table", DOVE "find us"). |

**Weakest three and fixes**
- **Essentials on screen 1 (1):** move the screen-2 "Call · Open 7 days, 12 noon–11pm · 110 Kew Road, Richmond TW9 2PQ · 5 min from Richmond Station" panel up to sit *between* the washing line and the headline. On a 660-high phone, cut the line from two rows of shirts to one. MENU, PRENOTA and DOVE stay pegged.
- **Labels (16, 14):** flip each shirt and dock label so English leads and the Italian is the voice: "Book · prenota", "Menu", "Find us · dove". Set `scroll-padding-bottom` to the dock height.
- **Motion budget (4, 15):** make the gust play once on load (≤3 s) and then only on scroll or pointer. Or add a small "Still the washing" pause toggle beside the line.

### Matsuba A, "Under the awning": 23/32, Revise

| # | Score | Evidence |
|---|---|---|
| 1 | 1 | No status or hours on screen 1. "10 Red Lion Street · Richmond" (no postcode or map link), Book a table, and Menu in the bar only. |
| 2 | 2 | Text at first paint. |
| 3 | 2 | The bar's BOOK jumps to #book at 5.1 screens, past the walk. MENU goes to menu.html. |
| 4 | **0** | The sticky room stage is pinned for **4.2 screens** (section is 5.2). Screens 2–4 carry no readable text (`matsuba-a-motion-844-s02..s04.png`). |
| 5 | 2 | The four room cards are DOM text; reduced motion lists them. |
| 6 | 2 | Reduced motion and no JS show a composed lit room and the cards as a list. That brings hours up to screen 6. |
| 7 | 1 | Full table with the Monday and lunch flags, but at screen 9. |
| 8 | 1 | "The lit menu case": 3 dishes at screen 7, prices without £. |
| 9 | 1 | Address, map, step-free "to confirm". No transport or parking. |
| 10 | 2 | Favourite Table, phone, 12-guest limit, £10 no-show terms quoted. |
| 11 | 2 | HTML; with no JS all 9 courses show as headings. |
| 12 | 1 | ARIA tabs: with JS only one course is visible at a time (21 of 121 prices), so the menu can't be scrolled or scanned in one pass. |
| 13 | 1 | Prices without £; v/vg legend and allergy line only at the end of the page (94% down). |
| 14 | 1 | BOOK, ORDER, MENU, CALL: 4 items, no scroll-padding. Two "Open in Google Maps" focuses landed under the bar. |
| 15 | 2 | "Come in" is a button with moved focus; scrolling is native. |
| 16 | 2 | Book, Order, Menu, Call. |

**Weakest three and fixes**
- **Budget (4):** cut the walk's pin from 4.2 screens to 1 on mobile. Show the room once, with the four cards laid over it as a single swipe or a plain list, which is the reduced-motion layout. Keep the full camera walk for desktop at 1.5 screens or less, and put a "Skip to booking and hours" link before it.
- **Hours and status (1, 7):** add a status strip under "Pull up a chair": "Open today 12–3, 5–10 (Monday to confirm) · 10 Red Lion St, TW9 1RW · Directions". Move Visit (hours table, map) to directly after the hero, ahead of the walk.
- **Taster and menu (8, 12, 13):** lift "The lit menu case" (Tuna Tataki and two others, with £) to the screen after the hero. On menu.html, drop the tabs for one scrolling page with a sticky course row, and put the v/vg legend and allergy line at the top.

### Matsuba B, "The stepped wall": 28/32, Pass

| # | Score | Evidence |
|---|---|---|
| 1 | 2 | At 844 and 660: "Open now, until 10pm (Monday to confirm)", "10 Red Lion Street, Richmond", the bar's Book and Menu. Without JS it reads "Lunch and dinner Tuesday to Saturday, Monday to confirm. Closed Sunday". |
| 2 | 2 | Text present at DCL; the wall builds behind it in about 3 s. |
| 3 | 2 | The bar's Book goes straight to Favourite Table; the header has MENU. |
| 4 | 2 | No pin. A fixed backdrop steps with native scroll; about 3 s load moment. |
| 5 | 2 | No information inside the wall. |
| 6 | 2 | Static, already-lit wall; frieze still marks progress. |
| 7 | 1 | Full table with flags at screens 8–9. |
| 8 | 1 | Priced rolls at screens 3–4, but without £. |
| 9 | 1 | Address, map, step-free "to confirm". No transport or parking. |
| 10 | 2 | Method, phone, 12-guest limit, card and cancellation terms. |
| 11 | 2 | HTML with h2 and h3. |
| 12 | 2 | Sticky course bar labelled with every course. |
| 13 | 2 | v/vg legend, allergy line and service charge at the top. |
| 14 | 1 | Book, Order, Menu, Call: 4 items, no scroll-padding. "Or call" ended up under the bar on focus. |
| 15 | 2 | Nothing to operate on mobile; the tasting tabs are full ARIA on desktop. |
| 16 | 2 | Menu, Visit, Order, Book a table. |

**Weakest three and fixes**
- **Hours table (7):** move the Visit panel (hours table, address, map) up to the second panel, ahead of "The room". The hero's live status already points to it.
- **Taster (8):** add £ to the homepage rolls ("£24.9" as published, or "24.9" under a "Prices in £" caption). Hang that panel first after Visit so it lands within 2 scrolls.
- **Find us and bar (9, 14):** add a "Getting here" line: Richmond station and walk time to confirm, parking to confirm. Trim the phone bar to Book · Menu · Call, with Order moving to the header. Set `scroll-padding-bottom`.

### Matsuba C, "Aburi" (current lead): 25/32, **Fail (gate item 1)**

| # | Score | Evidence |
|---|---|---|
| 1 | **0** | At 390×660 the first screen has no status, no hours and no address (`matsuba-c-motion-660-rest.png`), and the bar has no Find us. At 844 the address appears only as a small footer line under the hero, and there is still no status. |
| 2 | 2 | Text at DCL; the sear runs over legible text. |
| 3 | 2 | Book a table and See the menu are hero buttons, plus the bar. |
| 4 | 2 | No pin; the sear runs once. |
| 5 | 2 | Seared dishes are plain text with a static mark. |
| 6 | 2 | Names show already seared; complete. |
| 7 | 1 | Hours table at screens 7–8. |
| 8 | 2 | Tuna Tataki with price on screen 1; the Aburi Nigiri list with £ prices on screen 2. |
| 9 | 1 | Address and map. No transport, parking or access note. |
| 10 | 2 | Method, phone and terms; "Nothing is booked on this page". |
| 11 | 2 | HTML with h2 and h3. |
| 12 | 2 | Sticky course row with the Aburi filter. |
| 13 | 1 | The v/vg legend and allergy line are only at the very end of a 25-screen menu. |
| 14 | 1 | BOOK, ORDER, MENU, CALL: 4 items, no Find us, no scroll-padding. |
| 15 | 1 | "Sear it again" is a button, but re-sear is hover-only. The candle flame loops (`animation: candle … infinite`) with no pause. |
| 16 | 2 | Book a table, See the menu, Menu, Order. |

**Weakest three and fixes**
- **Gate (1):** under "14.9", replace the "First opened in 2004" footer line with a status line: "Open today 12–3, 5–10 (Monday to confirm) · 10 Red Lion St · Directions". On a 660-high screen, put it above the two buttons. This alone would lift the concept to a pass-level 26–27.
- **Hours (7):** move "Find us" (the hours table and window drawing) from screen 7 up to directly after the hero. Keep Aburi Nigiri as the third block: it is the best taster in the Matsuba set.
- **Menu legend and bar (13, 14):** put "v suitable for vegetarians · vg suitable for vegans · allergies: please tell staff · 12.5% discretionary service" in the menu header. On the homepage bar, swap ORDER for FIND US, with Order moving to the header, and set `scroll-padding-bottom`.

### Maids of Honour A, "Teas" (current lead): 28/32, Pass

| # | Score | Evidence |
|---|---|---|
| 1 | 1 | At 844 it is complete: "Open every day, 9am to 6pm", the live plate ("Closed just now… open tomorrow at 9am"), 288 Kew Road, and Book, Menus, Call, Find us. At 660 the hours line is cut at "9am to" by the bar and the status plate is below the fold. |
| 2 | 2 | All present at DCL. |
| 3 | 2 | Header Book a table jumps to #book (8.8 screens); the bar has Menus. |
| 4 | 2 | No pin on mobile; one gilt sweep. But it **occupies 5.3 screens** (screens 2–7). |
| 5 | 2 | Service windows are repeated as text in Visit. |
| 6 | 2 | No JS gives a static sign with "Times as published"; reduced motion shows the correct line lit. |
| 7 | 2 | Full week on screen 1. Service times and last walk-ins are on the sign at screen 3. The full table repeats at screen 12. |
| 8 | 1 | Priced items from screen 4 (shop) to 6 (luncheon). |
| 9 | 2 | Address, map, station, on-street parking, step-free "not published, to confirm". |
| 10 | 2 | ResDiary per sitting, phone, walk-ins first-come, last walk-in 17:30. |
| 11 | 2 | HTML with h2 and h3. |
| 12 | 2 | Sticky course row. |
| 13 | 1 | Prices throughout, but the allergen statement is halfway down (inside Patisserie) and there's no dietary note at the top. |
| 14 | 1 | Book, Menus, Call, Find us: 4 items, no scroll-padding. 8 focused links landed under the bar. |
| 15 | 2 | Sign lines and BOOK plates are real links with visible rings; time-travel uses a native range and select. |
| 16 | 2 | Menus, Served today, Find us, Book a table. |

**Weakest three and fixes**
- **Taster and footprint (8, 4):** reduce the sign section from 5.3 screens to about 2 on mobile. Show the five lines with their times and BOOK plates as one board. Move each line's menu panel behind its menu link, since the menu page has them. Then lift a "From the luncheon and set-tea menus" taster with 4 priced items to screen 3.
- **660 first screen (1):** shorten the hero drawing on short screens with `max-height: 38svh`, so the hours line and the "On the side wall today" plate both clear the bar at 390×660.
- **Menu allergens and bar (13, 14):** add a "Before you order" box at the top of menu.html: allergens verbatim, gluten caveat, vegan needs 24 h notice, 12.5% service. Set `scroll-padding-bottom` to the bar height.

### Maids of Honour B, "A royal secret": 25/32, Revise

| # | Score | Evidence |
|---|---|---|
| 1 | 1 | At 844: "Open every day, 9am–6pm · 020 8940 2752", "288 Kew Road" in prose, Book a table, bar Menus. No today status. At 660 the hours line falls below the fold. |
| 2 | 2 | Present at DCL. |
| 3 | 2 | Hero Book a table jumps to #book (7.9 screens); bar Menus. |
| 4 | 2 | No pin; the box sequence is user-started and skippable. But the iron box, Hill Street and oven timer **occupy screens 2–8** before booking. |
| 5 | 1 | Price and allergens are duplicated (hero and menu). The bakery's description and most of the legend exist only inside the box. |
| 6 | 2 | No JS shows the box drawn open with every layer listed; reduced motion is open and static. |
| 7 | 1 | Full table and last walk-ins only at screen 12. |
| 8 | 1 | One price (£3.50) on screen 1; three or more first at screen 8, and those are shop boxes, not the tearoom menu. |
| 9 | 1 | Address, map, station. No parking or access note. |
| 10 | 2 | ResDiary per sitting, walk-in rules, service charge. |
| 11 | 2 | HTML with h2 and h3. |
| 12 | 2 | Sticky labelled course row including Allergens. |
| 13 | 2 | £ everywhere, allergens near the top and in the jump row. |
| 14 | 1 | Book a table, Menus, Call; no Find us, no scroll-padding. |
| 15 | 2 | The key is a native button with hint text; the timer uses native radios and a polite live region. |
| 16 | 1 | Nav reads "The iron box · Before Kew · Warm it · Menus · Visit": three of five labels don't predict a diner's task. |

**Weakest three and fixes**
- **Order of the page (7, 8):** put "Visit" (status, hours table, walk-ins, address, map) second, directly under the hero. Follow it with a "From the tearoom" taster (High Tea £24.50, Roast £18, Ploughman's £17, tart £3.50). Keep the iron box third and move Hill Street and the oven timer after Book.
- **First screen (1):** add a status plate in the hero, as Concept A has it ("Open today until 6pm · last walk-ins 5:30"), and keep it above the tart on 660-high screens.
- **Labels (16):** use literal nav: "Book · Menus · Visit · Our story". "The iron box" and "Warm it" can be headings inside Our story.

### Maids of Honour C, "The tearoom": 27/32, Pass

| # | Score | Evidence |
|---|---|---|
| 1 | 1 | "288 Kew Road · opposite Kew Gardens", Book a set tea, dock Book and Menus. "Every day 9am–6pm" sits on the bottom edge under the dock at 844 and is absent at 660. No status. |
| 2 | 2 | Present at DCL; the lamps flicker on behind the text. |
| 3 | 2 | The dock's Book goes straight to ResDiary; header Menus. |
| 4 | 2 | No pin; the stand is set once with one glint. |
| 5 | 2 | "What's on each plate" is the real text; with no JS all five teas are listed. |
| 6 | 2 | Pre-rendered High Tea stand plus the full lists. |
| 7 | 1 | Full table with walk-ins at screen 10. |
| 8 | 2 | Set teas with £ prices at screens 2–3: the signature *is* the taster. |
| 9 | 1 | Address, map, station. No parking or access note. |
| 10 | 2 | ResDiary per sitting, walk-ins, service charge at the stand. |
| 11 | 2 | HTML with h2 and h3. |
| 12 | 2 | Sticky labelled course row. |
| 13 | 2 | "Before you order" box at the top: service and allergies. |
| 14 | 1 | Book, Menus, Call, Find us: 4 items, no scroll-padding. |
| 15 | 2 | Native radios with legends; arrow keys; live region; visible focus. |
| 16 | 1 | Nav: "Set teas · Still here · Bakery · Visit". "Still here" doesn't predict the history section. |

**Weakest three and fixes**
- **First screen (1):** move the "Every day 9am–6pm · Set teas from 10:00" line from under the CTAs into the kicker. Add today's status: "288 Kew Road · Open today 9am–6pm, last walk-ins 5:30". On 660-high screens, crop the window drawing to 35svh.
- **Hours table (7):** put a compact Visit block (hours table, walk-ins, address, map, station, parking) directly after the stand, ahead of the three history plates.
- **Labels and bar (16, 14):** rename "Still here" to "Our history". Set `scroll-padding-bottom` to the dock height.

### Tide Tables A, "Under the keystone" (current lead): 21/26, Pass (narrowly)

| # | Score | Evidence |
|---|---|---|
| 1 | 2 | At 844 and 660: the hours line "Mon–Fri from 7:30am … until dusk · Call for specifics", "In a converted arch beneath Richmond Bridge", and bar Find us, Call, Menu sample. |
| 2 | 2 | Present at DCL. |
| 3 | 2 | The bar's Find us, Call and Menu sample skip the walk. |
| 4 | **0** | The sticky stage is pinned for **2.3 screens** (section is 3.3). Screens 2–3 are drawing plus one-line captions. |
| 5 | 2 | Captions are DOM text; reduced motion lists them. |
| 6 | 2 | No JS gives a `<picture>` of the arch plus the vault still; reduced motion gives a still and captions. |
| 7 | 2 | Full week on screen 1. |
| 8 | n/a | No published menu or prices. |
| 9 | 1 | Full address, map, getting here and step-free note at screen 7. No parking note. |
| 10 | n/a | No booking system (parties by phone are covered). |
| 11 | 2 | HTML sample with h2 and the sample banner. |
| 12 | 2 | Sticky board picker (Food, Coffee, Tea…). |
| 13 | n/a | No menu to mark. |
| 14 | 1 | Find us, Call, Menu sample: literal and opaque, but no scroll-padding. |
| 15 | 1 | Scroll-driven, so the keyboard is fine. But the ferns sway on an infinite 6 s loop and the "Come in" arrow nudges forever, with no pause. |
| 16 | 2 | FIND US, CALL, MENU SAMPLE. |

**Weakest three and fixes**
- **Budget (4):** cut the walk's pin from 2.3 screens to 1 on mobile, so the camera reaches the far door in one screen. Keep the full 3.3-screen walk for desktop only, at 1.5 screens or less.
- **Find us (9):** move the Find us block (2 The Arches, TW9 1TH, map, how to get there, step-free) up from screen 7 to directly after the walk. Add "Parking: none at the café; town-centre car parks (to confirm)".
- **Loops (15):** stop the fern sway after one cycle and the "Come in" nudge after three, or add a pause control to the stage.

### Tide Tables B, "Five arches": 19/26, Revise

| # | Score | Evidence |
|---|---|---|
| 1 | 1 | At 844 it is complete: an "Opening hours" panel, "In a converted arch beneath Richmond Bridge", Find us, Call, See the menu sample. At 660 the hours are cut before "until dusk", and the bridge bar has no Call (Call is in the header). |
| 2 | 2 | Text present at DCL while the plate engraves (about 3 s, text never hidden). |
| 3 | 2 | Header Find us and Call, the bar's Menu arch. |
| 4 | 1 | Intro of 3 s or less, but the river glint shimmer loops (6.5 s, infinite) in the hero. |
| 5 | 2 | Keyed facts are quoted as text. |
| 6 | 2 | Complete static plate; CSS `:has()` still inks arches. |
| 7 | 2 | Full week on screen 1. |
| 8 | n/a | Not applicable. |
| 9 | 1 | Address, map, transport and step-free note at screen 8. No parking. |
| 10 | n/a | Not applicable. |
| 11 | 2 | HTML sample with headings and the banner. |
| 12 | 1 | Headings only; no jump links. |
| 13 | n/a | Not applicable. |
| 14 | 1 | The bar is five arches (Menu, Hollyhock, Café, Garden, Find us): too many, no Call, no scroll-padding. |
| 15 | 1 | Arch links and keyed facts work by keyboard, but there is no pause for the shimmer. |
| 16 | 1 | "Café" means Home and "Hollyhock" means the sister café, so a stranger can't predict them. |

**Weakest three and fixes**
- **Bar and labels (14, 16):** on phones, keep the bridge as the bar's *drawing* but reduce its tap targets to three literal arches, "Call · Menu · Find us", 56 px. Move Hollyhock and Garden into the page.
- **Find us (9):** put a Visit block second: address, map, transport, step-free, "Parking: none at the café (to confirm)". The bridge-facts section moves after it.
- **660 hours and motion (1, 4):** set the hours panel above the plate on short screens, or crop the plate to 30svh. Stop the shimmer after one pass, or add a pause.

### Tide Tables C, "Ride the tide": 20/26, Revise

| # | Score | Evidence |
|---|---|---|
| 1 | 2 | At 844 and 660: hours, "beneath Richmond Bridge", phone, and bar Find us, Call, Menu sample. At 660 the hours text overlaps the lamp post and foliage (`tide-c-motion-660-rest.png`). |
| 2 | 2 | Present at DCL. |
| 3 | 2 | Bar actions. |
| 4 | 1 | The hero scene is pinned for 1.0 screen (within budget), but the water drift (22–34 s) and skiff bob loop forever. |
| 5 | 2 | The tide is decorative and labelled "illustrative". |
| 6 | 2 | Static mid-tide composition. |
| 7 | 2 | Full week on screen 1. |
| 8 | n/a | Not applicable. |
| 9 | 1 | Full address and map only at screen 11. No parking. |
| 10 | n/a | Not applicable. |
| 11 | 2 | HTML sample. |
| 12 | 1 | Headings only; no jump links. |
| 13 | n/a | Not applicable. |
| 14 | 1 | Find us, Call, Menu sample; no scroll-padding. |
| 15 | 1 | Map stepper buttons are fine, but there is no pause for the looping water. |
| 16 | 1 | Nav: "The river · Garden · The walk · Menu sample · Find us". "The walk" (to Hollyhock) and "The river" are unclear. |

**Weakest three and fixes**
- **Find us (9):** move "Under the bridge, on the towpath" (address, map, transport) from screen 11 to second on the page, ahead of the tidal explainer and the Hollyhock walk.
- **Loops (4, 15):** let the water settle after one drift, or add a "Still water" pause chip next to "Drawn tide, illustrative". Give the hero text a solid panel behind it at 660 so the drawing never crosses it.
- **Labels and menu (16, 12):** rename the nav to "Find us · Menu sample · Garden · Walk to Hollyhock · About the river". Add a jump row to the menu sample (Food · Coffee · Tea · Wine).

---

## 3. Cross-cutting fixes (apply to every concept)

1. **A "Today" strip on screen 1, in HTML, outside any pinned or animated layer.**
   - Pattern: `[Open today 12–3, 5–10 | Closed today · opens Tue 12:00] · [short address] · Directions`. Computed in Europe/London time, with a static no-JS fallback that states the week in one line.
   - Place it directly under the headline, above the CTAs, so it survives a 390×660 viewport.
   - Six concepts currently miss it: Caffè Mamma B and C, Matsuba A and C, Maids B and C.
2. **A standard "Visit" block, placed second on the page,** straight after the hero and before any story or signature section.
   - Contents, in this order: hours table (every day, closed days, last orders or last walk-ins, "to confirm" flags); full address with a postcode and an "Open in Maps" link; nearest station and walk time; parking; step-free access ("not published, to confirm" is fine); booking policy in one line; phone.
   - Today it sits at screens 7–13 on 10 of the 12 concepts.
   - No concept has all five Find us parts except Maids A. Most lack parking and access notes, which can simply say "to confirm".
3. **A menu-taster block within the first 1,700 px:** 3–6 real dishes, a £ on every price, dietary marks, "See the full menu".
   - Where the signature is food (Matsuba C's Aburi Nigiri, Maids C's stand), the signature *is* the taster.
   - Matsuba publishes prices without £: show "£24.9", or caption the block "Prices in £".
4. **Signature budget on mobile: pinned at most 1 screen, no text-free screens, plays once.**
   - Cut Matsuba A's 4.2-screen walk and Tide A's 2.3-screen walk to 1 screen.
   - Unpinned signatures still need a cap on their footprint: Maids A's sign takes 5.3 screens and Maids B's box, history and timer take 7. Hold them to about 2 screens on phones.
5. **No endless loops without a pause:** gusts, shimmer, water drift, fern sway, candle and bulb flicker. Play once (≤3 s), then rest, or add one visible "Pause motion" toggle.
6. **A skip link past the signature:** "Skip to opening hours, menu and booking" as the first in-page link before any signature section, plus `id`s on Visit, Menu taster and Book.
7. **The action bar:** 3 literal items, Book · Menu · Find us (or Call · Menu · Find us for walk-in-only Tide Tables).
   - Opaque, 56–64 px plus the safe area.
   - **`html { scroll-padding-bottom: <bar height + 8px> }` on every page.** None set it, and Caffè Mamma C and Maids A had 7–8 focused links land under the bar.
   - Move Order and Hollyhock-type links into the header or the page.
8. **The menu page header:** "On this menu" sticky course row, the dietary legend, an allergen statement (how to ask, plus the business's verbatim line), the service charge and a "menu as at…" line, *all at the top*, plus a back-to-top link at the end of each course.
   - Matsuba A and C and Maids A put the legend or allergens mid-page or at the end.
   - Matsuba A's tabs hide 100 of 121 prices: use one scrolling page.
9. **Literal labels lead, voice follows:** "Book · prenota", "Our history (Still here)", "Find us · dove". No top-level nav item named only for the signature, such as "The iron box", "Warm it", "The walk" or "Café" for Home.

---

## 4. Recommended lead per business

| Business | Current lead | Recommended lead | Changes? | Why |
|---|---|---|---|---|
| Caffè Mamma | C "Bucato" (25, revise) | **A "La carta"** (27, pass) | **Yes** | A is the only Caffè Mamma concept that passes. Its signature is a printed day-sheet with today's hours and Book on the first screen, plus a menu filter that is itself useful. C has the strongest character, but its first screen is the signature as navigation with no hours or address. With fixes 1 and 2 above (move its screen-2 panel up, English labels first), C would reach about 28 and could be reinstated. |
| Matsuba | C "Aburi" (fails gate 1) | **B "The stepped wall"** (28, pass) | **Yes** | B already carries "Open now, until 10pm" and the address in the hero, and its wall never pins. C has the best food-led character and the best taster, but at 390×660 it shows a dish, a price and two buttons, with no status or address. One status line under "14.9" would take C to about 27. If the client prefers C's character, adopt C only with that fix. A should not lead until its 4.2-screen walk is cut to 1. |
| Maids of Honour | A "Teas" (28, pass) | **A "Teas"** | No | Best first screen in the set, with a live status plate. Hold its sign to about 2 screens on mobile and add a taster. C (27) is a close second and the better taster. B should not lead: seven screens of story come before booking. |
| Tide Tables | A "Under the keystone" (21/26, pass) | **A**, provided the walk's pin is cut to 1 screen | No | A is the only Tide Tables pass, and it does so narrowly: it scores 0 on the signature budget. B and C have equally good first screens but weaker bars, labels and Find us placement. If the pin isn't cut, C (20/26, 1-screen pin) is the safer lead. |
