# Concept A, "La Carta": notes

The site is a two-ink menu card: red and black on white card stock, with a margin column of running notes. Plain HTML, CSS and JS: `index.html`, `menu.html`, `css/carta.css`, `js/carta.js`. All illustration is inline SVG drawn for this concept. There are no image files, so `img/` is empty.

## Photography to commission

| Shot | Where it goes | Frame |
|---|---|---|
| The shirts on the line, shot from below in lunch light, with the deep-blue ceiling behind | Homepage gallery, tall left plate | 4:5 portrait |
| The Kew Road frontage at dusk: fairy lights on, cream sign lit, terrace tables laid | Homepage gallery, wide plate | 3:2 landscape |
| A table, overhead: white cloth, yellow napkin, the yellow rose | Homepage gallery, square plate | 1:1 |
| Zabaglione being whisked to order: hands and pan, close and warm | Homepage gallery, offset plate | 4:5 portrait |

The placeholder gallery ("Pictures to come") came off the homepage in the 27 October pass (see Pitch notes). When the photographs exist, add the gallery back after "From the menu" or the story, with `<img loading="lazy" width height>` at the ratios above so nothing shifts.

## Logo
The red script is set as a working wordmark in Young Serif. The labelled **logo slot** that sat beside the hero drawing is now off the page (see Pitch notes). The original wordmark (red script, green stroke, spaced RISTORANTE) needs to be supplied as vector art (SVG or PDF) and placed there, and it can also replace the header wordmark.

## Implementation
- **Without JS**, the page is complete: the date line reads "Aperti tutti i giorni", booking falls back to plain OpenTable and phone links, and the Mark the menu block is hidden (`html:not(.js) .marker`).
- **Running strip and action bar.** Under 1024px the running strip (date, today's hours, Call) sits under the header and scrolls away with the page. A fixed bottom bar carries three literal actions: Book · Menu · Find us on the homepage, Book · Call · Find us on the menu. `html { scroll-padding-bottom }` is set to the bar height plus 16px (8px on desktop, where the bar is hidden and the sticky header carries Call and Book). The footer pads for the bar.
- **Fonts.** Each fallback (Georgia; Times New Roman/Liberation Serif/Tinos; DejaVu Serif; Noto Serif; Arial/Liberation Sans/Arimo/Helvetica; DejaVu Sans; Noto Sans) has its own `@font-face` with size-adjust and ascent/descent overrides computed from the Google Fonts files. Instrument Sans fallbacks get a second face at `font-stretch: 87.5%` for the labels, buttons and nav. CLS is now 0.001–0.032 (was 0.12–0.17 on the menu).
- **Motion** uses GSAP 3.12.5 and ScrollTrigger from cdnjs and only runs when `html.motion` is set, which needs JS plus no reduced-motion preference. A 2-second failsafe in `<head>` removes the class if GSAP never arrives. On phones, text doesn't fade in on scroll; only rules and strokes draw.
- **Mark the menu** is in `js/carta.js` (`setupMarker`). Each item carries `data-tags` (`v`, `fish`, `kids`, `lunch`). Each ellipse is generated from a hash of the dish name, so every dish gets its own loop, and it is redrawn on resize. On screens under 1024px the controls move into a bar that sticks to the top of the viewport on the menu page. It only highlights dishes already listed as text, so nothing is held inside it.
- **Booking** opens the plain OpenTable URL. Once the system is confirmed, party, date and time could be passed as query parameters.
- `menu.html` is static HTML. It was generated once from the copy deck so that the dish markup stays consistent.

## Spelling corrections from the old site
Bruchetta → Bruschetta · Mortadela → Mortadella · Bisteca → Bistecca · "al griglia" → "alla griglia".

## Still to confirm (all marked in-page with "to confirm" and `<!-- [TO CONFIRM] -->`)
Opening year (1983), hours and kitchen/last-order times, any service charge, step-free access, the Xpress Lunch price (£11.95 or £18.95) and full list, children's menu price, party menu price and full list, Christmas menu details, prices with no source (zuppa, pane all'aglio, tagliatelle positanese, quattro formaggi, seafood pizza), the seafood pizza's Italian name, the Insalate section and lasagne price (third-party only), the wine and drinks list, dietary markers, the booking system, the online offer (10% or 20%), the Kew Gardens walking time, parking, Deliveroo and Uber Eats, and how the owners want the Portuguese family told.

## Useful-first pass (27 October 2026)
Applied the audit fixes for this concept (`pipeline/research/useful-first-audit.md`, "Caffè Mamma A") and the cross-cutting list.

- **First screen (390×660):** strip with today's date and hours plus Call; name; "Italian · Richmond"; a one-line voice sentence; an "Oggi" block with "Open today, 12 noon – 11pm" (to confirm) and "110 Kew Road, Richmond TW9 2PQ · Directions" (Google Maps); Book a table and See the menu; and the bottom bar (Book · Menu · Find us). None of the essentials are in a `.js-set` fade, so they are there at first paint. The wordmark and padding are a little tighter on phones to fit them.
- **Week hours early:** under the buttons, "Open 7 days, 12 noon – 11pm. Last orders (to confirm)" links to the hours table.
- **New order:** hero → From the menu (priced taster + Mark the menu) → Opening hours and how to find us → Book → Parties → Our story. At 390×844 the first £ price sits at about 1,510px and the Visit block starts at about 2,420px (it was on screen 11).
- **Taster:** £ on every price; under it are the "being re-checked" marker, a "V: vegetarian (to confirm)" line, the allergen line and a link to `menu.html#allergens`. Its signature is still parallel: a viewer can ignore the buttons and read the dishes as text.
- **Visit block:** hours (Monday to Sunday, last orders to confirm, Xpress Lunch), full address and Maps, station, Kew Gardens, parking, step-free access (to confirm; the function room is upstairs), booking method and the 9+ rule, phone, takeaway and email.
- **Menu page:** £ on every price, including the "from" and range prices; "On this menu" course row (`#courses`); a "Dietary key and allergies" block at the top (`#allergens`) with prices, a service-charge marker, the V key and the 14-allergens line; and a "Back to the courses" link at the end of each course.
- **Footer** on both pages gives the address, phone, hours summary and booking link, plus the honesty line.
- **Lengths at 390×844:** home 12.5 → 9.7 screens; menu 10.2 → 10.8 screens (the back-to-top links and bar clearance add length; nothing was removed from the menu itself).
- **Lint note:** `qa.sh`'s lint lists "Young Serif" and "Instrument Sans" because they are on the sprint's watch list. They are this direction's brief-specified pairing, so they stay.

## Pitch notes (not for the site)
Moved here in the editorial pass of 27 October 2026. These lines explained the design or the research to the owner, so they came off the page. Use them in the pitch.

- **Logo slot.** "Logo slot. Original wordmark goes here: the red script with the green stroke, supplied as vector art." This was a dashed box beside the hero drawing. The request stands (see Logo above).
- **The hero drawing.** The caption "The line across our dining room, drawn in red pen." is cut, and the drawing now runs without a caption. Its alt text no longer says "a red-pen drawing".
- **Pictures to come.** "Four photographs to commission, each one framed here at the size and shape it should be shot." The four captioned placeholder plates (the line from below, Kew Road at dusk, a table laid, zabaglione to order) are cut. The shot list above still applies.
- **The route sketch.** This was an annotated pen map: Richmond Station, "5 min walk", No. 110, "Kew Gardens up the road", "Kew Road" along the spine, captioned "A sketch, not to scale." It was cut as an annotated diagram. Its facts are in the Visit block as text.
- **Mark the menu, explained.** "Tell us what you're after and we'll ring it in red pen, the way a waiter marks a menu for you." and "Pick one and we'll ring it in red pen." both now read "What are you after?" The no-JS line "On the full menu you can mark vegetarian dishes, fish, dishes for the kids and the lunch deal" was also wrong (the buttons need JS), so it is cut and the block is hidden without JS.
- **The "Oggi" panel** (Xpress Lunch / Pizza to take away / A room for up to 58) duplicated the lunch slip, the takeaway row and the Parties section, so it is cut. Its one extra line was "A good reason to stop on the way to Kew Gardens."
- **Researcher asides on the menu.** "Taken from a third-party listing of our menu, so this section is being checked" (Insalate) is now only the to-confirm marker on the heading. "Spellings follow standard Italian" is cut (the list of corrections is above). "Stapled to the card:" is cut from the set-menus note.
- **"Online booking goes through OpenTable for now … Nothing is booked until OpenTable confirms it"** now reads "Online bookings are made and confirmed through OpenTable" (to confirm). The JS hand-off message still tells the diner the booking is finished on OpenTable.
- **Story, trimmed.** Decor cut from the last row: "under a deep-blue ceiling … white cloths, yellow napkins, a yellow rose on every table, and a curved staircase up to the function room." It is good pitch colour for the room.
- **Footer.** "Concept A of three" and the Concept B and Concept C links are cut: they were designer navigation, and they pointed outside the folder. The honesty line now matches the sprint wording and links to caffemamma.co.uk.
