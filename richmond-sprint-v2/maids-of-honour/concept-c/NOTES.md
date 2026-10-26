# The Original Maids of Honour · Concept C, "The tearoom"

**In two lines:** you sit down in the tearoom at 288 Kew Road. The set teas are a chrome three-tier stand in front of the red room's gilt mirror, and choosing a tea fills its blue-and-white plates. The building's story is told on three transferware plates hung on a rail: the Victorian Newens shop, the 1947 rubble, and the Mock Tudor rebuild.

Port 8533: `python3 -m http.server 8533 --directory richmond-sprint-v2/maids-of-honour/concept-c`

---

## The signature: the three-tier stand

- **Source detail:** three-tier stands, served in the red room in front of the gilt mirror, with blue-and-white plates and steel teapots on white cloths. Sources: identity.md §1 #13 (table setting: "sandwiches at the bottom, scones … in the middle, slices of cake on top") and #12 (red room and gilt mirror); photo-notes.md "Afternoon tea" (client photo P4); copy-deck.md §2 "China and table". The menu contents come from the set-tea menus, copy-deck.md §3 (S8: Food_Menu_2024-1, -4, -6).
- **How it works:**
  - The drawing is an original SVG: a chrome hoop stand (drawn as three layered strokes for the polish), three plates in perspective, each rimmed with our own transferware border, a gilt mirror with a shell crest, a round table in a white cloth, and a steel teapot and a blue-and-white cup.
  - Choosing a tea (native radio buttons, so arrow keys, Tab and screen readers work as standard) lifts the old food off, top plate first. The new tea is then set down bottom plate first, in a short "placed, not thrown" motion.
  - Each tea shows only what its menu lists:
    - **High Tea:** five sandwich quarters, two scones (plain and fruit) with jam and cream, and the patisserie cloche "or" the Maids of Honour tart.
    - **Savoury High Tea:** sandwiches and two cocktail sausage rolls, one scone, and the quiche "or" a pasty.
    - **The Special Set Tea:** sandwiches, a sausage roll, half a pie and half a quiche; scones; the four taster cakes (passionfruit cheesecake, carrot, chocolate, vanilla slice) and the truffles. One glass sits on the cloth.
    - **Prosecco and Champagne Set Teas:** a "How many of you?" control (1 to 4) sets the published price (£35, £70, £105, £115 for Prosecco; £45, £90, £135, £160 for Champagne) and the drink line. The cloth shows one or two flutes, or a bottle with three or four flutes, matching "a glass", "2 glasses" or "a full bottle". The Champagne tea adds soft fruits.
  - The text list beside the stand ("What's on each plate") is the real content: Top, Middle and Bottom plate plus Alongside, using the menu wording verbatim. Hovering a tier row lights that plate's rim in gilt. A polite live region announces "High Tea on the stand. £24.50 per person."
  - At the foot of the stand: the price, **Book a set tea** (the ResDiary set-tea widget 33177, which opens in a new tab), the sitting time (from 10:00, or from 11:00 for the fizz teas), and an honest hand-off line: "You choose the day and time on ResDiary … A discretionary 12.5% service charge is added to the bill."
- **No JS:** the stand is pre-rendered by the build with High Tea on it, labelled "On the stand: High Tea". All five teas are listed in full beneath it, with the Prosecco and Champagne price tables. The selector stays hidden, because it only works with JS.
- **Reduced motion:** the stand is already set, and choosing a tea swaps the plates instantly.
- **First view:** when the stand first scrolls into view, the kitchen "sets" it (bottom, middle, top) and a glint runs once along the chrome hoop.

## Only-here details used (and where)

| # | Only-here detail | Where it appears in the design | Source |
|---|---|---|---|
| 1 | **Three-tier stands, blue-and-white plates, steel teapots** | The signature; the teapot and cup in the hero; the cup in the stand scene | identity #13, #10; photo-notes P3, P4; copy deck §2 "China and table" |
| 2 | **The red room with the gilt mirror** | The colour logic of the whole set-tea section (burgundy wall, gilt rails and mirror frame behind the stand); the wine, Champagne and Maids Finest menus are set "in the red room" on menu.html | identity #12; photo-notes P4 |
| 3 | **Blue-and-white transferware** | Our own floral rim, used on every plate, the "Still here" plates and the menu-page plate; a straight version of the same border frames sections; the favicon; the selected-tea radio is a tiny plate | identity #10; photo-notes P3, P4. The pattern is original and not Spode: a five-petal flower and a C-scroll alternating on a cobalt band, with an inward lace scallop |
| 4 | **Windsor wheel-back chairs, round oak pedestal table, lace doily** | Hero illustration ("Pull up a Windsor chair."); the round oak table seen from above holds the address in Visit; the oak footer | identity #11; photo-notes P2 |
| 5 | **Chintz curtains and pelmets** | Our own cabbage-rose chintz on the hero curtains and scalloped pelmet (blue piping ties it to the china); a chintz pelmet over the footer. Used nowhere else | identity #11; photo-notes P2 |
| 6 | **Black wrought-iron ring chandeliers with cream shades** | Hero chandelier (the lamps "come on" as the page opens); reflected in the gilt mirror behind the stand, where it brightens for the fizz teas | identity #11; photo-notes P2 |
| 7 | **The 1890s A.N. NEWENS Confectioner / REFRESHMENT ROOMS shop** | Plate 1 of "Still here": the fascia ("Cook and / A.N. NEWENS / Confectioner"), "REFRESHMENT ROOMS", lettered windows (only the non-brand words), staff in white aprons in a row, and the pony. Drawn from the photo's composition, not traced; no coat of arms, so no warrant is implied | identity #5; S1, S3, S17 |
| 8 | **WWII bombing and the 1947 surveyor's quote** | Plate 2: a blank, faintly cracked plate with the pattern gone and a dotted ghost of the lost shopfront, with the quote set in Old Standard italic | identity #6; copy deck §2 (S3, REPORTED; attributed "as the business quotes it") |
| 9 | **The Mock Tudor rebuild** | Plate 3: TEAS gable and fascia, painted pebbledash (stipple texture), tiled canopy lettered Newens, lantern, iron rail and greenery, small-paned windows and curved bay, topiary cones, white iron chairs | identity #1, #6, #7; S3 quotes on the page |
| 10 | **The vintage van** | Parked at the left of plate 3 | identity #9; S1 frontage |
| 11 | **The Newens Bakers tricycle** | The "Still delivering" drawing in the bakery section: the box lettered NEWENS / BAKERS., stacked tin loaves and a hanging basket. It rolls in once and its wheels spin | identity #9; S1 bread-cart slide |
| 12 | **Plates displayed on a high rail** (old interiors) | The layout logic of "Still here": three plates rest on one continuous oak plate rail | identity #10 (undated interiors, S3) |
| 13 | **The Maids of Honour tart on a blue-and-white plate** | Small plate on the hero table; the menu page opens with the tart on a plate | identity #4 (S15 product photo on blue-and-white) |
| 14 | **Menu quirks**: "Five Quarters", 'Kew' Pasty, Maids Ploughman's, the Carry On Smoothies, tea bags in the early 1960s, coffee supplier since 1936, Ellis of Richmond 1822 | Kept verbatim on menu.html; the Carry On Smoothies get their own framed card (names not explained, as instructed) | identity #18; copy deck §3 |

The signature (1, 2 and 3 together) is built on verified details (P3, P4, S1, S15). More than three further details (4 to 13) appear as illustration, colour logic, layout logic and motion, not just as copy.

## The swap test

Put another tearoom's name on this and it stops making sense:
- The stand stands in front of *this* room's red wall and gilt mirror.
- The plates hold *this* menu: five quarters, the Special Set Tea's half pie and half quiche, the "or Maids of Honour Tart", and the Prosecco and Champagne prices for one to four guests.
- The three plates on the rail show *this* building: the A.N. Newens fascia and Refreshment Rooms, the 1947 rubble quote, the TEAS gable and Newens canopy, the van.
- The tricycle reads NEWENS BAKERS.

What a generic tearoom could share is the broad genre (stands, blue-and-white, chintz). That is the risk, and each of those is pinned to an observed detail of 288 Kew Road (the specific room photos, menus and archive) rather than used as decoration.

**Distinct from A and B:**
- A is signwriting, green and gold, with a live service sign. B is the iron box, the tart and the packaging.
- C uses neither the blackletter fascia as a device nor the reheating timer, and mentions the legend only once, in one labelled line.
- Fonts: Old Standard TT and Nunito Sans, as briefed. Palette: transfer blue, china white, red room, gilt and oak, as briefed.

## Layout logic: "plates on a rail"

- Each section hangs from a double-ruled rail: a blue rule with a pale echo 4px below it, the same double line as the masthead and the frames.
- Under the rail, the section's object (stand, plate, round table, tricycle) sits off-centre against a text column of about 40–62ch.
- Round things are set on a rectilinear grid: plates and the oak table against the window glazing and the rails.
- The red room (set teas, and the wines on the menu page) is the one dark, warm room in a china-white house, as in the real tearoom.

## Type
- **Old Standard TT** (display): a 19th-century Modern face. It echoes the Victorian shop's lettering ("REFRESHMENT ROOMS") and the classical serif capitals of the printed menus. The menu section heads are tracked capitals, as on the printed menus. Italic is used for the warm lines.
- **Nunito Sans** (text): variable, with the optical-size axis on (`font-optical-sizing: auto`).
- Old-style figures are requested for prices (`font-variant-numeric: oldstyle-nums`); this applies where the face supports it.
- Fluid `clamp()` scale. Metric-adjusted local fallbacks ("OST Fallback" from Georgia, "Nunito Fallback" from Arial) limit the swap shift.
- **Wordmark:** "Newens · The Original / Maids of Honour", set in the concept's own type. A working wordmark, not the logo; the logo isn't redrawn.

## Motion language: "set down like china"
- One easing throughout, cubic-bezier(.2,.7,.2,1). Things are lifted and set down with a 2px settle.
- **Hero:** the chandelier lamps flicker on, then the words settle.
- **Signature:** plates filled bottom to top, and a single chrome glint.
- **Plates:** the rim turns 28° into place and the picture "prints" in.
- **Tricycle:** rolls in once with spinning spokes.
- **Hover:** a button gains a china-rim ring, a plate turns 3°, the chandelier sways slightly.
- **Page to page:** a CSS View Transitions crossfade, where supported.
- No GSAP and no scroll-jacking. Nothing loops.
- With `prefers-reduced-motion: reduce`, the `motion` class is never added, so every element is in its final, designed state; durations are also zeroed as a backstop.

## Implementation notes
- Plain HTML, CSS and JS: `css/style.css`, `js/main.js` (reveals and the menu-section marker), `js/stand.js` (set-tea data, layout and behaviour). No framework, no build step at runtime.
- The illustrations are inline SVG, written as code by the studio in a generator script kept outside the repo, then baked into static HTML.
  - Shared defs live in a hidden sprite: the rim, the food symbols, the hatch patterns and the chintz pattern.
  - The no-JS stand state and the five tea panels are generated from the same `stand.js` data, so the text and the drawing cannot drift apart.
  - To edit, change the HTML directly. The tea data lives in `js/stand.js`.
- `img/band.svg` (the straight transferware border), `img/chintz.svg` (the chintz tile) and `img/favicon.svg` are original. The favicon is also inlined as a data URI.
- Accessibility:
  - Skip link, landmarks and one h1 per page.
  - The set-tea selector uses native radios inside fieldsets with legends.
  - `:focus-visible` is a 3px double outline, the china rim again. It is gilt on red and china on oak.
  - Tap targets are at least 44px, including the mobile dock (Book, Menus or Set teas, Call, Find us), which is fixed at the bottom below 960px.
- Checked with Playwright at 320, 390, 768, 1440 and 2560: no console errors, no failed requests, no horizontal overflow. Tested with JS off, reduced motion and the keyboard (arrow keys change the tea and the party size, and the live region announces each change).

## Honesty and "to confirm" markers
- Every external link comes from the copy deck or the dossier:
  - ResDiary 32717, 33175, 33176 and 33177
  - direct-book (guest rooms)
  - the official site
  - the shop collections (S14, S15)
  - the National Archives page
  - Instagram
  - tel: and mailto:
  - a Google Maps search
- Booking is a hand-off in a new tab with an in-page summary. No fake confirmation.
- `to confirm` markers (each with an HTML comment) on:
  - the Thursday breakfast rule (index and menu)
  - the luncheon minimum, £22 on the menu against £20 on the page (menu)
  - 2024 prices possibly out of date (menu)
  - which plate the Savoury High Tea's quiche or pasty sits on (stand panel)
- **Dates:**
  - No founding date is used as fact. "Serving you since 1850" appears only in the footer, as the tearoom's own sign-off.
  - The shop photo is "which it dates to the 1890s".
  - The 1947 quote is attributed "as the business quotes it".
- **Legend:** one labelled line ("Legend has it…"). The filling is never mentioned.
- **Names:** only historic family names the business publishes (Alfred Nashbar, Robert, John and Peter Newens). No current staff.
- **"Opposite Kew Gardens"** comes from the brief. The walking time and gate are not claimed.
- **Menu spelling** is kept as printed and marked with a dotted underline and the tooltip "Spelt as printed on the 2024 menu". Suggested fixes for the client: Capuchino → Cappuccino, FILTER COFFE → FILTER COFFEE, "BY-THE-SLICE' CAKES", "bed salad leaves" → "bed of salad leaves", "r ounded", the doubled "with added flavours", Prosseco → Prosecco. I added one missing closing bracket to the Special Set Tea scones line.
- **Ellis Wines:** the sentence is cut after "founded in Richmond in 1822", as the copy deck instructs.

## Known limitations
- **Plate placement is our reading.** Sandwiches go below, scones in the middle and sweet on top, following the photos. The menus don't say where the Savoury High Tea's quiche or pasty goes, so it is marked to confirm.
- **Fizz teas show one guest's share.** The stand doesn't multiply the food by party size; only the price, drink line and glasses change.
- **Illustration finish:** the illustrations are crisp flat vector "storybook" work, not true copper-plate engraving.
  - The Victorian figures and the pony are schematic.
  - The Windsor chairs in the hero read a little heavy and dark at desktop size.
  - The rim is generated, so its repeat is more regular than hand transfer printing.
- **Fascia lettering:** on the Mock Tudor plate it is set in Old Standard italic rather than blackletter. This is deliberate, to stay off Concept A's territory, but it isn't literal.
- **Browser support:**
  - The selected-tea card styling uses `:has()`. Without it the radios still work but the selected card isn't filled.
  - The 1947 quote sizes with container query units (`cqi`).
  - View transitions only run in Chromium-based browsers.
- **Weight:** the inline sprite (about 30KB of SVG defs) is repeated on the menu page, where only the plate and tart need it.
- **No real map, photos or logo:** see below.

## Assets to replace
- The working wordmark → the business's own logo (a vector version is to be confirmed).
- Colours sampled from photos (fascia, red room, gilt) → match on site.
- If the client grants rights to the archive (1890s shop, tricycle), real photographs could sit beside the drawn plates as a "see the original" layer.

## Photography shot list (to commission)
1. A three-tier stand in front of the red room's gilt mirror, shot straight on at table height, once for each set tea (for a photographic version of the signature).
2. A cream tea on the blue-and-white, from overhead on the oak, with steel teapot, strainer and sugar.
3. The tearoom in morning light: the Windsor chairs, round oak tables, chintz pelmets and an iron chandelier lit.
4. A close-up of the plate rims and cups (for a pattern reference; confirm the pattern name with the client).
5. The red room as a whole, with the mirror and the framed print.
6. The frontage at dusk with the canopy lantern lit, and the vintage van.
7. The bakery at work: pastry rolled by hand, and a tray of tarts coming out of the oven.
8. The tart, warm, on a blue-and-white plate.

## Structured data and llms.txt

**Encoded** (facts from `research/copy-deck.md` only):
- `index.html`: one JSON-LD block (it replaces the earlier `Restaurant` block). Type `["CafeOrCoffeeShop","Bakery"]`, `name`, `description` ("A Historic Traditional English Tearoom Shop and Bakery.", shown on this page), `address` (288 Kew Road, Richmond, Surrey, TW9 3DU, GB), `telephone`, `email`, `url` https://theoriginalmaidsofhonour.co.uk/, `openingHoursSpecification` Monday–Sunday 09:00–18:00 (VERIFIED), `acceptsReservations` true, `potentialAction` ReserveAction with the four ResDiary entry points shown on the page (Book a table, Breakfast, Luncheon, Set tea), `hasMenu` https://theoriginalmaidsofhonour.co.uk/menu.html.
- `menu.html`: one `Menu` block (it replaces the earlier `Restaurant` block): 7 sections, 143 items, 173 GBP offers, generated from this page's own DOM. The Menu `description` carries the page's own caveat ("Prices are from the 2024 menus and may have changed."), because the copy deck marks the 2024 prices [TO CONFIRM]. Printed labels become offer names: Hot/Cold, bottle/glass columns, "for 2, two glasses…" on the Champagne and Prosecco teas, and "Chicken or Steak £8". "From £2.50" uses a minimum price. Set teas are one item each, with their contents as the description. "Extra Portions" is its own item, not a price of the Roast.
- `llms.txt`: name, one-line description, address, phone, email, hours (9am–6pm every day; the shop/tearoom split and holiday hours marked "to be confirmed"), luncheon and set-tea times, the walk-in policy, the four ResDiary links, a link to the menus (prices "may have changed") and the service charge, plus a preview note matching the page banner.
- `<meta name="description">`: index 148 characters, menu 159 characters.

**Deliberately left out, and why:**
- `foundingDate` and any "Est. 1850" or "since 1850" claim: 1850, 1860, 1868 and 1887 are disputed.
- The Henry VIII and Anne Boleyn legend, and anything from the history labelled LEGEND or REPORTED-only.
- Tart prices (£3.50 in the tearoom; £2.25 and box prices in the shop): copy deck [TO CONFIRM] item 6. The tart is listed by name and description only.
- The Luncheon minimum charge (£20 or £22, disputed). The Thursday no-cooked-breakfast rule ([TO CONFIRM]).
- Upgrade and add-on prices ("extra £2", "£15 Extra", "Weekday Special: £15 each", plant milks "£0.50 extra"). They stay in descriptions as printed and are not offers.
- Unpriced lists such as the loose teas: they are priced per pot elsewhere, so they are not separate offers.
- `sameAs`: the copy deck lists no social profile URLs. `servesCuisine`: the copy deck states no cuisine. `geo`: no coordinates in the research. The guest rooms and the National Archives café are separate businesses.
- A single "main" booking URL: which ResDiary link is the main one is [TO CONFIRM], so `acceptsReservations` is `true` and all four links are listed.
- The page links an Instagram profile, but that URL is in `dossier.md`, not the copy deck. It is not in `sameAs`.
- The shop tart prices (£2.25, boxes of 6, 8 and 12) are omitted with the tearoom tart price (copy deck [TO CONFIRM] item 6). The items are listed without offers.
- "Second Courses" appears as two sections, one before and one after the Baker's Luncheons box, to keep page order.

**Notes:**
- **Official-domain assumption.** `url`, `@id` and `hasMenu` assume this concept is deployed at https://theoriginalmaidsofhonour.co.uk/ with the menu at `/menu.html` (the file name this concept uses). If the live site keeps a different menu path, change `hasMenu` and the Menu `url`/`@id`, or add a redirect. `llms.txt` links to the menu relatively (`menu.html`), so it works on the preview and on the domain.
- **Matches the visible page.** Every price, phone number, hour, address part, description sentence and booking/order link in the JSON-LD was checked against this page's `document.body.innerText` (plus each menu tab's panel), and each menu price is paired with its own printed line. `llms.txt` phones, emails, times and links were checked against the index and menu pages. No console errors. Nothing visible changed: only the JSON-LD block and `<meta name="description">` in `<head>` were edited.
- **Preview mechanisms untouched.** The "speculative design proposal" banner is unchanged. Note: neither page has a `<meta name="robots" content="noindex">` tag (there was none before this pass, and none was added); if previews rely on `noindex`, it must come from the host (an `X-Robots-Tag` header).
- **Regenerating.** Scripts: `/tmp/claude-0/-home-user-Claude-code/e50707d5-9ec5-571e-9915-9e7145ebe50f/scratchpad/v2/aivis/jsonld/` (`extract.js` reads items and prices from each menu page's DOM, `build.js` writes JSON-LD, meta and `llms.txt` from `facts.js` (copy deck only), `validate.js` checks against the rendered pages, `servers.sh` serves ports 8701–8709). Re-run them if a menu or a fact changes.

---

## "Useful first" pass (26 October 2026)

The client felt the site put its signature ahead of being useful. The signature now sits alongside the essentials instead of in front of them; nothing of it was removed. Standard: `pipeline/research/information-hierarchy.md` §(b); rubric §(c); before scores from `pipeline/research/useful-first-audit.md`. Facts from `research/copy-deck.md` only.

### Score: 27/32 before → 32/32 after (rubric §(c), 390×844 and 390×660)

| Item | Before | After |
|---|---|---|
| 1 (G) Essentials on screen 1 | 1 | 2 |
| 2 (G) Time to essentials | 2 | 2 |
| 3 (G) Signature parallel | 2 | 2 |
| 4 Signature budget | 2 | 2 |
| 5 Hidden content duplicated | 2 | 2 |
| 6 (G) Reduced motion / no JS | 2 | 2 |
| 7 Hours table | 1 | 2 |
| 8 Priced taster | 2 | 2 |
| 9 Find us | 1 | 2 |
| 10 Booking clarity | 2 | 2 |
| 11 (G) HTML menu | 2 | 2 |
| 12 Menu navigation | 2 | 2 |
| 13 Prices and dietary marks | 2 | 2 |
| 14 Action bar | 1 | 2 |
| 15 Interaction accessibility | 2 | 2 |
| 16 Literal labels | 1 | 2 |
| **Total** | **27** | **32** |

### What changed
- **Today strip** under the headline, as a china card with the transfer-blue rim: status from the published hours (London clock; "Open every day" with JS off), "9am–6pm daily · last walk-ins seated 17:30", the address linked to Google Maps, Book a table and Menus, "Skip to visit info". It is excluded from the hero's settle-in animation, so it is visible at first paint. The window drawing is cropped shorter on phones; the eyebrow is now the business's own "Shop & Tea Room on 288 Kew Road".
- **Visit second** ("Visit us."): a framed card with every service, each with its own Book button (any table, breakfast with the Thursday marker, luncheon with the £22/£20 marker, set teas), bank-holiday marker and a two-line policy; then "Finding us": the oak table (now a small lettered 288 / Kew Road roundel on phones) beside the address, Google Maps and phone, and getting there (opposite Kew Gardens, on-street parking; walk and step-free access to confirm).
- **Taster third** ("From the menus, priced."): the tart £3.50 with its allergens, High Tea £24.50, Savoury High Tea £26.50, Full English £13, Vegetarian English £13 (V), Roast of the Day £18, the 2024 marker and "See all the menus". Section top 1,663 px, first price 1,733 px.
- **The stand, kept whole**, fourth, behind "Skip past the stand / Skip to visit info". On phones the chooser is a two-column grid and the drawing 250 px wide: heading, chooser, stand, price and Book a set tea fit in 816 px. "What's on each plate" stays as the plain text below; the service-charge hand-off line is in Visit on phones.
- **Labels:** nav Visit & hours · Menus · Set teas · Our history · Bakery; "Still here" keeps its heading with the eyebrow "Our history · the building". Rooms, guest rooms and the Archives café moved to the end of the bakery section.
- **Dock:** Book · Menus · Call (menu page: Book · Call · Find us). `scroll-padding-bottom` set below 960 px.
- **Menu page:** "Before you order" moved under the sticky "On this menu" row and given the dietary legend, the tart's allergens and how to ask about the 14 allergens (service, allergies and vegan lines kept verbatim); dietary marks as on A and B; "Back to top" after every course.

### QA
- `qa.sh` (port 8946, label `v2-maids-c-uf`): 0 console errors, 0 failed requests, 0 bad links, 0 horizontal overflow, axe clean on both pages. CLS index 0.000 / 0.000 / 0.006, menu 0.009 / 0.001 / 0.001.
- First screen checked by screenshot at 390×660 and 390×844 (motion, reduced motion and JS off): status, address with map link, Book and Menus all visible above the action bar.

### Caveats
- The first priced line is at 1,733 px; the stand (itself priced) follows at 2,236.
- JSON-LD and `llms.txt` unchanged.

