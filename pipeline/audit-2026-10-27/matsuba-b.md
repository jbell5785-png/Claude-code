# Audit: Matsuba B · The stepped wall (lead)

**Verdict:** Needs work · **Readiness:** 5.5/10

Not ready to send. The idea is right and the desktop first screen (stepped oak wall, lit brass sconce) is the best screen in the sprint, and the facts check out. But an owner would see unfinished work: the kids menu runs off its panel at 1200–1360px, the homepage taster is crushed beside an empty 'Photograph to come' frame, the step that names the concept is hidden on phones and the wall makes scrolling janky there, the £100 tasting menu shows one dish at a time on desktop, and 5–9 'to confirm' chips sit alongside an assertive 'Open now' built on hours the restaurant's own sources disagree on. About a day of fixes plus one phone call; no redesign needed.

| Lens | Raw findings | Impress owner | Craft | Usefulness | Accuracy |
|---|---|---|---|---|---|
| content | 35 | 5 | 6 | 6 | 7 |
| design | 25 | 5 | 6 | 7 | 8 |
| function | 36 | 6 | 6.5 | 6 | 5 |

## Strengths to keep

- Passes the swap test: Matsuba's two-layer stepped oak wall and brass twin sconce drive the hero, progress mark, menu index, tasting menu and hover language.
- Desktop first screen at 1280 and 1920 is genuinely handsome: textured, per-slat-varied oak, a clean stepped diagonal, and a finely drawn sconce that warms on load. It is the strongest single screen of the three Matsuba concepts.
- Desktop menu wall index (nine stepped, labelled slats), the stepped plank course bar, and the tasting slats' lift-and-light hover are distinctive and on-concept.
- Content is accurate and useful: dishes and prices verbatim; correct phone, address, Favourite Table and Toast links; the £10 no-show terms in plain words near the top; Visit second, then a priced taster; a 141-item Menu JSON-LD.
- Honest and mechanically solid: no fake booking flows, new-tab hand-offs, a keyboard-accessible tablist, reduced-motion and no-JS versions, no console errors, and every anchor lands.
- The phone tasting menu (14 stepping slats listing every dish) is the right model, and desktop should match it.

## Verified findings (ranked)

### [BLOCKER · small] Kids menu spills off its panel onto the slat wall at common laptop widths

*Lens:* content+design+function (B-C01, B1, m13) · *Verifier:* confirmed

**Evidence.** In-panel overflow sweep (verify/layout.js): 90px at 1200, 83 at 1220, 77 at 1240, 71 at 1260, 65 at 1280, 28 at 1300, 21 at 1320, 14 at 1340, 8 at 1360, 13 at 760, 8 at 780. At 1280, 'Tofu Teriyaki or Pumpkin Katsu' and 'Creamy and smooth vanilla ice cream' are printed over the oak slats (verify/out/kids-1280-viewport.png). From 760 to 1180 the drinks and desserts sit in 4 columns as narrow as 80px, giving 'Innocent / Kids / Juicy / Water'.

**Fix.** Give .kids columns repeat(auto-fit, minmax(min(100%,18rem),1fr)) and set min-width:0 on .group. Keep the Kids Drink and Kids Dessert dishes in a single column. Add an in-panel overflow assertion (child right edge > .panel right edge) to QA, sweeping 700–1600px in 20px steps.

### [MAJOR · small] Homepage taster is crushed at 1180–1536px beside a large empty 'Photograph to come' frame

*Lens:* content+design+function (B-C05, B-C35, B3, M1, M8, M9) · *Verifier:* confirmed

**Evidence.** Dish-name columns are 84–178px wide at 1180–1536. At 1280, 'Special / K Roll / (Beef or / Veg vg)' takes 4 lines (verify/out/idx-1280-rolls.png). The placeholder is 300x375 on desktop with empty marble below it, and 310x388 on a 390 phone, nearly half the screen. There is no food image anywhere on the site. Downgraded from blocker: cramped and unfinished-looking, not unreadable.

**Fix.** Remove the photo slot from the pitch build and put the shot list in the email, or replace it with a finished top-down SVG of the Matsuba Roll drawn to the sconce's standard. Lay the six dishes in two even columns across the full panel, and drop to one column below about 260px per column.

### [MAJOR · small] Disputed hours drive a live 'Open now', with 5–9 'to confirm' chips on the homepage, including in the hero's key line

*Lens:* content+design+function (B-C02 partly, B-C03, B-C14, M7, B1 partly, M11, M1) · *Verifier:* partly

**Evidence.** Fixed-clock tests (verify/clock.js). Mon 13:00: header 'Open now TO CONFIRM', hero 'Open now · Today (Monday TO CONFIRM) 12pm–3pm TO CONFIRM, 5pm–10pm', 9 chips (3 on the first screen). Tue–Fri: 6–7 chips. Sat 15:30: 'Open now · Today 12pm–10pm' with no caveat. Christmas Day 13:00: 'Open now'. Menu page: 5 chips. Footer: 'Monday TO CONFIRM to Friday 12pm–3pm TO CONFIRM'. The evidence conflicts: Instagram (29 Aug) and the official page say Mon–Fri, while Toast's ordering hours (auditor's capture; Cloudflare blocked my re-check), the set-menu card and Harden's/OpenTable say Monday is closed. Toast and the third-party listings also dispute Saturday afternoon, which carries no flag. B-C02 is wrong that Monday is settled. Function B1 is overstated as a blocker, because Toast shows ordering windows and the site shows the restaurant's own published hours with flags.

**Fix.** Before sending, ring the restaurant once to settle Monday, lunch last orders and Saturday afternoon, then show plain hours with no chips. Until then, keep one flagged row in the Visit table plus a footnote, remove chips from the header, hero and footer, and show 'Usually open now · call to check' for disputed windows. Add a closures list (Christmas, bank holidays). Put the open questions in the cover email.

### [MAJOR · medium] On a phone the stepped edge, the concept's namesake, never reads cleanly

*Lens:* design+function (B2, M4, m14) · *Verifier:* partly

**Evidence.** Below 760px the step starts at --top0:19lvh (160px at 844 tall), exactly where the hero plate's top edge sits (about 159px). The source build's first screen shows one front-slat top, at the right edge (verify/out/idx-390-first.png). At the end of the page only the back layer shows, with no step, at both 390 and 1280. In the live preview the 71px banner pushes the plate down, so 7 step tops show, but the sconce (fixed at 15lvh) then sits behind the header with only its disc peeking out (verify/out/pub-390x844.png). Desktop 1280 and 1920 show the step well, so this is downgraded from blocker.

**Fix.** Below 760px, raise --top0 so the step crosses a 120–160px band between the sconce and the plate, and give the plate a matching top margin. Offset --sy and --top0 by the preview banner's height. Cap the step's travel so the last screen still shows a diagonal.

### [MAJOR · medium] Desktop tasting menu shows one dish at a time behind 14 unlabelled slats

*Lens:* content+design+function (B-C09, M6, M6, m4, p1) · *Verifier:* confirmed

**Evidence.** At 1280, #tasting shows 'Fourteen dishes. Point at or tap a slat to see each one.' and a mostly empty card, 'Dish 1 of 14 / Dobin Mushi' (verify/out/menu-1280-tasting.png). The card is right of the wall and slats select on pointerenter, so moving the mouse to the card changes the dish. The homepage link 'See all fourteen dishes' lands here. The phone version lists all 14 and is fine.

**Fix.** Always render the ordered list of 14 dishes beside the wall, with the slat and its line highlighting each other on hover or focus. Remove the hint sentence and the pointerenter selection. Keep the lift-and-light effect.

### [MAJOR · medium] The fixed wall makes scrolling janky on phones

*Lens:* function (M3) · *Verifier:* confirmed

**Evidence.** verify/perf.js at 390x660 (mobile emulation), 40 wheel ticks. Unthrottled, the homepage's p95 frame is 50ms (7 frames over 50ms) against 17ms with .wall hidden. At 4x CPU: 38 long tasks totalling 3.6s, p95 150ms, against 0 long tasks with the wall hidden; the menu page has 0. Cause: 40 textured slats restyled with staggered 0.5s translate transitions and per-slat will-change. Caveat: headless software raster.

**Fix.** Translate the whole .wall__front by --d with one transform and drop the per-slat ripple while scrolling. Consider pre-rendering the slats to one SVG layer. Test on a real mid-range Android before the phone demo.

### [MINOR · small] Special Rolls strapline contradicts the dual prices under it

*Lens:* content (B-C06, m9 part, M10 part) · *Verifier:* confirmed

**Evidence.** 'Large 8 piece rolls, exclusively created by MATSUBA.' sits directly above 'Matsuba Roll £12.9 / 22.9'. The TA10 PDF says 'large 4 or 8 piece rolls', and Toast lists the Matsuba Roll at 4pcs £12.90 and 8pcs £22.95. The homepage and menu wordings also differ.

**Fix.** Use the TA10 wording on both pages and label the portions '4 pcs 12.9 · 8 pcs 22.9'. Confirm the price-to-portion mapping in the email.

### [MINOR · small] The Lunch & Early Evening lead and the narrow heading column break into nonsense lines

*Lens:* content+design (B-C07, M8) · *Verifier:* confirmed

**Evidence.** At 1280: 'Tuesday - Friday · 12 / - 2.30pm & 5 / - 6.30pm · 2 / courses £20.95 / 3 / courses £24.95'; 'Tasting menu £100 / per person / (minimum 2 / persons)'; 'Lunch / & Early / Evening' (verify/out/menu-1280-early-evening.png).

**Fix.** Split into 'Tuesday to Friday · 12–2:30pm and 5–6:30pm' and '2 courses £20.95 · 3 courses £24.95', with no-wrap groups. Widen the heading column to at least 260px from 1200px, or put headings above the dishes below 1500px.

### [MINOR · small] Typesetting widows (a lone ')' and diet chips) and a footer line that starts with a comma

*Lens:* content+design+function (B-C12, m2, m5, m6) · *Verifier:* confirmed

**Evidence.** 'Nigiri (Salmon or Inari vg' / ')' and 'Special K Roll vg & Udon' / 'vg' at 1280. At 390 the footer wraps to ', 5pm–10pm · Saturday…' (verify/out/footer-hours-390.png).

**Fix.** Wrap the last word, the abbr and the ')' in one nowrap span. Write the footer as 'Mon–Fri 12–3pm & 5–10pm · Sat 12–10pm · Sun closed' with nowrap day groups.

### [MINOR · small] Price, time and dash formats are mixed

*Lens:* content+design+function (B-C16, B-C23, m3, M10 partly) · *Verifier:* partly

**Evidence.** '£12.9/22.9' on the homepage, '12.9' with no £ on the menu, '£15.95' and '£4.9' on the kids menu. Edamame is '£6.9' on the homepage and '6.9/6.9' on the menu. '2.30pm' appears next to '2:45pm', and 'Tuesday - Friday' uses a hyphen. M10's claim that prices are 'probably 5p wrong' is not supported: Toast mixes .90 and .95, and the site matches the published dine-in menu.

**Fix.** Pick one style (£12.90 everywhere, or print style with 'Prices in £' stated once). Collapse 6.9/6.9 to 6.9. Use en dashes and colon times.

### [MINOR · small] Open-now wording differs between header, hero and Visit, goes stale, and reads 'Closed Sundays' without JS

*Lens:* content+design+function (B-C13, B-C15, m4, m1, m2, m3, m15) · *Verifier:* confirmed

**Evidence.** Sat 22:30: the hero says 'Opens Monday TO CONFIRM or Tuesday at 12pm', while Visit says 'Opens Monday at 12pm (Monday TO CONFIRM)'. Sun 12:00: the hero says 'Closed today', while Visit says 'Opens tomorrow'. The inline hero script runs once; site.js repaints only [data-status] every 60s and rewrites aria-live regions even when nothing changed. With no JS, the header shows 'Closed Sundays' beside the sconce icon.

**Fix.** Use one status function with a short and a long form. Render it at first paint and repaint only when the text changes. Drop aria-live from the header. Hide the header status without JS.

### [MINOR · small] Menu page opens with admin text and stale 2024 PDF links, with no dishes on the phone's first screen

*Lens:* content+design+function (B-C08, B-C17, m6, m11, p6) · *Verifier:* confirmed

**Evidence.** First screen at 390x844: date, key, a 13.6px allergy paragraph opening 'this menu does not list the 14 major allergens', the service line, three PDF links, and '…date from 2024 and differ from this menu: TO CONFIRM'. The course bar sits at y≈708 (verify/out/menu-390-first.png). The one-pager promises 'Old PDFs retired or redirected at launch'.

**Fix.** Keep the date, the key and one 16px allergy line ('please tell us before you order, or call…'). Move the PDFs and service line to 'Menu notes' after the courses. Drop the 2024 vegan and gluten-free links from the pitch build, or label them with file sizes.

### [MINOR · small] The owner's menu typos are reproduced word for word, and the JSON-LD carries them

*Lens:* content+function (B-C04, m17) · *Verifier:* partly

**Evidence.** 'Uangi Steak', 'Eby Fry', 'Salmon Combo_B … Salmon Combo_B … (all samon)', 'South Amerian', 'Chrispy', 'chilli papper', 'Vanila', 'Yuzu Te'. The brief mandates the verbatim menu, so this isn't a builder error, but on a pitch it reads as careless, and Toast already spells 'Unagi Steak'.

**Fix.** Correct the unambiguous typos in the pitch build, mention it in one line of the email, and regenerate the JSON-LD. Leave 'Aperol Com Fanta' as a question.

### [MINOR · small] The email's two headline points (aburi, no-show fee) barely show here

*Lens:* content (B-C10, B-C11) · *Verifier:* confirmed

**Evidence.** index.html mentions aburi once (the Lion King line), and llms.txt mentions it 0 times. llms.txt also leaves out the £10 no-show charge, the email's first point; the homepage does state it. The one-pager promises 'every aburi dish named and marked'.

**Fix.** Add an aburi line to the taster ('2 piece portions of flame seared nigiri', with 2–3 prices). Add the booking terms and one aburi sentence to llms.txt.

### [MINOR · medium] Room drawing's booths read as speaker cabinets

*Lens:* design (M2) · *Verifier:* partly

**Evidence.** The slats, step and sconce in the drawing are good. The booths are dark slabs with black mesh boxes on top, the table is a 14px bar, the glasses are faint outlines, and the flat outlined slats clash with the textured wall (verify/out/elev-1600.png). 'Clip-art grade' is overstated.

**Fix.** Redraw the booths (leather back with seams, a framed perforated screen), give the glasses highlights, and drop the black outlines to match the wall's grain. Or crop the drawing to the wall, sconce and table.

### [MINOR · small] Hours table runs off the Visit panel on narrow phones

*Lens:* function (M2, m7) · *Verifier:* partly

**Evidence.** With mobile emulation, the layout widens to 355px at 320 and 344, and the table runs 53px and 29px past the panel (verify/out/hours-320.png). At 360 it runs only 13px over, with the trailing comma clipped at the panel edge. From 375 up it is fine. At 320 the hero headline breaks into 5 lines and the Menu button falls under the action bar.

**Fix.** Below 400px, stack th above td and let the chip wrap. Step the h1 size down below 360px.

### [MINOR · small] Desktop course bar clips its first item at 960–1100px

*Lens:* function (M7) · *Verifier:* confirmed

**Evidence.** With justify-content:center on an overflowing bar, 'Appetizers' sits at -97…31px at 960, -65…63 at 1024 and -27…101 at 1100, and can't be scrolled to.

**Fix.** Use justify-content: safe center, or margin-inline:auto on the first and last items.

### [MINOR · small] Phone first screen repeats Menu three times and Book twice, plus a 'Skip to visit info' link

*Lens:* design+content (m5, B-C18) · *Verifier:* confirmed

**Evidence.** Header MENU, plate BOOK A TABLE and MENU, and action bar BOOK, MENU and CALL all show at once. 'SKIP TO VISIT INFO' sits under the buttons (verify/out/idx-390-first.png).

**Fix.** Drop the plate's Menu button. Rename the skip link 'Hours & address ↓', or remove it.

### [MINOR · small] Vestigial booking inner box, dead zones, and a page that ends without the step

*Lens:* design (M9, M5 partly) · *Verifier:* partly

**Evidence.** The Reservations canopy holds a nested dark box with only two actions in it and empty space to their right (verify/out/book-1600.png). The Visit and Rolls panels have empty areas at 1280. At 75–100% of the scroll the front layer has gone (verify/out/idx-1280-end.png).

**Fix.** Put the actions inline and remove the inner box. Size the panels to their content. Cap the step's travel so the diagonal is still on screen at the end.

### [POLISH · small] Pitch hygiene: tab title, old artifact, research comments, anonymous footer

*Lens:* content+function (B-C33, m16, B-C32, B-C30 partly) · *Verifier:* confirmed

**Evidence.** The live preview's title is 'Matsuba · The stepped wall'. The round-1 'Matsuba Concept B' (2vGmNvPNptprWQU5RDkdMd) is still in the gallery. The live source keeps '[TO CONFIRM] Monday: … listings show Monday closed' and similar comments. The footer says 'an independent studio' with no name or contact.

**Fix.** Use a diner-facing title. Unpublish or rename the round-1 artifact. Strip comments and tooltips in the publish build. Footer: 'Design proposal by Joseph Bell, Richmond · 07931 373488'.

### [POLISH · small] Metadata: stale menu og:description, no og:image or og:url, diet marks in JSON-LD names

*Lens:* content+function (B-C29, B-C31, m18) · *Verifier:* confirmed

**Evidence.** The menu's og:description still advertises the Lunch & Early Evening set. There are 0 og:image and og:url tags. 23 MenuItem names end in ' vg' or ' v'.

**Fix.** Align the og:description with the meta description. Add a 1200x630 og:image and og:url. Strip the diet suffixes from item names and keep suitableForDiet.

### [POLISH · small] Fixed sconce half-hidden under panel edges mid-scroll on desktop

*Lens:* design+function (m1, p2) · *Verifier:* confirmed

**Evidence.** Cut by the tasting panel's right edge and under the booking canopy at 1280 (verify/out/idx-1280-tasting.png, idx-1280-end.png).

**Fix.** Fade the sconce when a panel covers it, or align --sy with the panel gaps.

### [POLISH · small] Voice details

*Lens:* content (B-C19, B-C21, B-C24, B-C25, B-C26 part) · *Verifier:* confirmed

**Evidence.** The restaurant quotes itself ('“Our signature appetizer”: …'). The tasting block repeats 'Tasting menu' and shouts 'A PRE-ORDER IS REQUIRED'. 'Nearest station, parking and step-free access: TO CONFIRM' tells a diner nothing. On phones the family-run line comes before the Room heading. The verified FHRS 5 rating is unused.

**Fix.** Drop the quote marks. Write '£100 per person, for two or more · pre-order: call 020 8605 3513'. Remove the getting-there line, or state only what's verifiable. Move 'Family-run since 2004' to the hero kicker. Add an FHRS 5 badge.

### [POLISH · small] Edge states: zoom, print, anchors, load length, URL-bar jump, stale course bar

*Lens:* function+design (m8, m9, m10, m12, p3, p4, p5, m7) · *Verifier:* confirmed

**Evidence.** At 640x400 the sticky course bar and action bar take 146 of 400px. Print gives 14 pages with 'Skip to content' on each. scroll-padding and scroll-margin stack. The load animation runs about 3.9s (CSS). The step count depends on innerHeight, so the wall jumps when the URL bar resizes. The phone course bar keeps 'Tasting' current after returning to the top. A focused course link at 320 is clipped. The menu page's action-bar 'Menu' links to itself.

**Fix.** Un-stick the bars below 500px tall. Hide .skip in print. Use one anchor offset. Shorten the stagger and bloom. Compute steps from lvh. Clear the course bar's current item at the top. Call scrollIntoView on focus. Swap Menu for Find us on menu.html.

### [POLISH · small] Kicker step-mark glyph reads as a signal or bar-chart icon

*Lens:* design (M3 partly) · *Verifier:* partly

**Evidence.** Four descending 3px bars repeat before every kicker. The desktop menu wall index reads fine against the wall itself.

**Fix.** Drop the glyph, or draw it as a two-layer pair (tall back slats with stepped fronts).

## Refuted by the verifier

- **20% discount tied to Toast is unsourced**: Toast's own store banner reads '20% Off All Takeaway' (function/dl/toast.txt, line 2), and the brief's brand constants tie the deal to Toast ordering.
- **'Order' label is ambiguous**: It is the restaurant's own nav label, it goes straight to collection ordering, and its accessible name says 'for collection'.
- **Lion King singled out; lit slat is a leftover**: The brief explicitly allows a playful Lion King mention. It is the homepage's only aburi dish, and the lit slat is subtle and harmless.
- **Name, case and language inconsistencies; Sushi Mori and Nihonshu Sake glosses**: These are the restaurant's verbatim tab and dish names, with negligible effect on the pitch.
- **Wordmark doesn't match the logo; fonts not from their print**: The brief mandates Urbanist and Spectral, and says to set the wordmark in the concept's own geometric face without redrawing the logo. Both fonts load correctly and neither is on a banned list. Paired with the bespoke wall, the type doesn't read as generic.
- **Preview renders in quirks mode with mojibake**: The live artifact's host wrapper supplies the doctype, UTF-8 charset and viewport. Rebuilt locally, it renders in CSS1Compat mode with correct characters and a 390 layout. The problem only appears when the stripped file is served on its own.
- **Preview banner styling and size**: It is the intentional honesty banner. It appears once, is 71px tall and scrolls away. Its knock-on effect on the sconce is covered in V4.
- **Plank course bar and rotated index labels look heavy or misaligned**: A subjective call. On viewing, the stepped planks read as deliberate and are among the most on-concept details.
- **Frieze, rest-state button dots, plate edge**: A subjective call, and harmless at normal viewing size.
- **Phone menu has none of the slat-wall signature**: The motif is present on phones: the course bar's planks step, and the 14 tasting slats step in and list every dish (better than desktop). The wall index is a desktop enhancement. The real phone gap, the hidden step on the homepage, is kept in V4.
- **Live 'Open now' contradicted by Toast**: Downgraded and merged into V3. Toast shows online-ordering windows, not necessarily dining hours, and the site shows the restaurant's own published hours with flags.
- **Monday can already be settled from the repo**: The evidence conflicts: Instagram and the official pages say open, while Toast's hours, the set-menu card, Harden's and OpenTable say closed. Merged into V3.
