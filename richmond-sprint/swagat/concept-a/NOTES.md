# Swagat · Concept A "Thali"

**The concept in two lines.** A whole meal on one round steel plate: the site is built from concentric plate compositions, and the menu page lets you put a thali together from Swagat's real menu, dish by dish, with a running estimate. It brings forward what is distinctive here: the regional dishes, the tandoor, and fifteen vegetarian mains that also come as sides.

Speculative proposal, not commissioned. Serve locally with `python3 -m http.server 8321 --directory swagat/concept-a`.

## Files

| Path | What it is |
|---|---|
| `index.html` | Homepage: hero, regional dishes, vegetarian depth, tandoor, order and book, hours, find us |
| `menu.html` | Full menu (version A, plus version B desserts and lassi) and the Build-a-thali panel |
| `css/swagat.css` | All styles; mobile first; tokens on `:root` |
| `js/thali-core.js` | Pure functions for the thali (no DOM). Browser global `ThaliCore`, or `require()` in Node |
| `js/thali.js` | Menu-page wiring: buttons, plate, summary, mobile sheet |
| `js/site.js` | Highlights today's row in the hours list (Europe/London) |
| `img/rings.svg` | Concentric hairline rings used in margins and image slots |
| `img/favicon.svg` | Favicon as a file (the pages use the same SVG inline as a data URI) |
| `tests/thali-core.test.js` | Node tests: `node --test tests/thali-core.test.js` |

## Design system

- **Type:** Rozha One (display, the wordmark, headings) and Mukta 400–700 (text and UI), from Google Fonts with `display=swap` and preconnects. Fallback faces are metric-matched by measurement in Chromium: Mukta → Arial/Liberation Sans at `size-adjust: 94%`; Rozha One → Times/Liberation Serif at `113.3%`, with ascent and descent overrides from the fonts' own hhea tables.
- **Colour:** maroon #7D1114, haldi #E2A11B (only on maroon or kadai, or as decoration), steel #C9CED3, ivory #FBF6EE, kadai #1C1412, muted text #5C4B45 (7.7:1 on ivory). Haldi on maroon is 4.76:1, so it is used for text there.
- **Wordmark:** "swagat" set lowercase in Rozha One, maroon, with "Indian Cuisine" in Mukta below. It is a working wordmark, not a redraw of the restaurant's logo. **Replace it with the restaurant's vector logo if one exists** (only a 120×76 raster is known).
- **Geometry:** every plate, katori, ring and pattern is original geometry (concentric circles, lathe lines, ellipses), generated in SVG. There is no map of India, no Taj Mahal, no elephants and no traditional pattern. No Devanagari is used (that is Concept B's territory).
- **Openers:** four concentric plate compositions open sections. The heading sits in the well and the rim bowls carry short labels (regions, tandoor dishes, days of the week). The rim labels are decorative duplicates (`aria-hidden`), and the real content always follows as a list. Below 460px of plate width, the bowls keep only short labels (region, day) or none (dish names), and the list below carries the detail.
- **Motion:** bowls fill with a 250ms scale and fade; the mobile sheet rises in 250ms; nothing loops. Under `prefers-reduced-motion: reduce`, fills are instant and the sheet doesn't animate. No GSAP.

## Build a thali: how it works

- **No JavaScript:** the menu is complete static HTML, with every dish, price, code, chilli mark and note. No buttons and no panel appear (they carry the `hidden` attribute and are revealed only under the `.js` class).
- **Data:** each dish `<li>` carries its record as JSON in `data-dish` (id, printed name, codes as printed, source A or B, illustration tint, and portions with their printed price strings and katori). The page is the single source of truth. The tests read the same attributes from `menu.html`.
- **Controls:** a 46px round toggle button (`aria-pressed`) sits beside each price. Vegetarian mains have two, **Main** and **Side**, each at its own published price; Tandoori Chicken has **Half** and **Full**. Space for the buttons is reserved in CSS from first paint, so they cause no layout shift. Pressing a dish's other portion moves it (for example, main to side) instead of duplicating it.
- **The plate (katoris and caps):** Starters 2 · Mains 2 · Sides 3 · Rice 1 · Bread 2 · Raita & salad 1 · Dessert 1 · Lassi 1 (13 places). Biryanis count as mains. When a multi-place katori is full, the dish is refused with a message ("Both main places are taken. Remove one to add Butter Chicken."), and the plate is unchanged. A one-place katori (rice, raita, dessert, lassi) swaps its dish instead, and says so.
- **Summary:** "Estimated total from published prices" plus the to-confirm marker; lines grouped by katori, each with a visible **Remove**; then the codes:
  - the allergen codes on the chosen dishes, in key order;
  - "Marked V (vegan suitable)", listed separately, because V is not an allergen;
  - the dishes with **no code printed**, with the note that this doesn't mean free from allergens;
  - the published allergen statement verbatim, and the takeaway statement;
  - a note when dessert or lassi (version B data) is on the plate.
- **Hand-off:** "Order for collection" is a plain link to the verified foodbooking.com ordering URL (`target="_blank" rel="noopener"`), so the page never navigates away and there is no `window.open` call that could fail silently. A box above the button says: "Nothing has been ordered. Your choices aren't sent to the ordering page: it opens in a new tab and you add the dishes there, where prices and offers may differ." "Copy the list" puts a plain-text list on the clipboard, and reports honestly if it can't.
- **Announcements:** one polite, atomic live region outside the panel, so it still speaks when the mobile sheet is closed. For example: "Added Saag as a side. 3 dishes. Estimated total from published prices £26.25, to confirm." After a Remove, focus moves to the next Remove button, or to the count line.
- **Mobile (below 1000px):** the panel collapses into the action bar's "Your thali · 3 dishes · £26.25" cell (`aria-expanded`/`aria-controls`). It opens as a bottom sheet with Close and Escape, and focus returns to the toggle on close. A short toast confirms each tap while the sheet is closed. **Desktop:** the panel is a sticky right-hand column.
- **Persistence:** the plate is remembered in `localStorage` for this browser only (wrapped in try/catch, and sanitised on load against the current menu).

### Test results (Node 22, `node --test tests/thali-core.test.js`, 25 Oct 2026)

```
ok 1 - catalogue builds without errors
ok 2 - parsePrice reads every printed format into integer pence
ok 3 - formatPence
ok 4 - a simple thali totals exactly (no float drift)
ok 5 - awkward decimals still add exactly: 14.25 + 6.99 + 6.75 = 27.99
ok 6 - vegetarian mains use the main price as a main and the side price as a side
ok 7 - pressing the same portion again removes it
ok 8 - switching a vegetarian dish from main to side changes price and katori, never duplicates
ok 9 - cap: a third main is refused and the plate is unchanged
ok 10 - cap: veg main counts against mains; switching to side when sides are full is refused
ok 11 - one-place katoris swap their dish instead of refusing
ok 12 - half and full tandoori chicken are separate published prices
ok 13 - unknown dish or portion is rejected without changing anything
ok 14 - remove() takes a dish off by id and does not mutate
ok 15 - codes: allergen union in key order, V reported separately, uncoded dishes listed
ok 16 - sources: dessert and lassi are flagged as version B
ok 17 - sanitise drops unknown ids, duplicates and overflow from saved data
ok 18 - describe() and asText()
ok 19 - wrapLabel keeps names inside a katori
ok 20 - menu.html: every dish record parses, with a readable price and a known katori
ok 21 - menu.html: all 15 vegetarian mains offer main and side, main dearer than side
ok 22 - menu.html: published prices spot-checked against the copy deck
ok 23 - menu.html: a full plate of real dishes totals correctly
# tests 23 · pass 23 · fail 0
```

Test 23 fills all 13 places with real dishes and expects £89.09, codes D and G, and V on Jeera Rice and Tandoori Roti. A 14th dish is refused. Money is integer pence throughout.

The browser was also checked in Playwright:
- 12 real dishes total £81.24, matching a hand sum;
- the cap and portion-switch refusals give the right messages;
- Space on a focused button toggles it;
- the plate survives a reload;
- the mobile sheet opens and closes, including with Escape;
- without JS: 71 dishes, no buttons, no panel;
- under reduced motion the fill is instant.

## Menu content decisions

- **Version A (page text) for every dish:** 67 dishes, with names, notes, codes, chilli counts, prices and descriptions as printed, including the restaurant's own spellings ("Toped", "withfresh", "tandoor.Perfect", "Chilly cheese Naan", "Peshwari"). They are left for the restaurant's copy edit.
- **Desserts and lassi (version B):** shown under their own course headings, each labelled "From our online ordering menu, which prints no chilli marks" with a to-confirm marker. Prices are converted from "4.5 GBP" to "£4.50".
- **Codes:** shown as printed after the name, for example "(G, D)", with screen-reader text that spells them out ("Codes: Gluten, Dairy"). The key (D E N G C M S, and V) and the verbatim statement are at the top of the menu, with: "V means vegan suitable, not vegetarian. Vegetarian dishes are the ones under the Vegetarian headings." All eight V-marked dishes are listed there for vegan browsing.
- **Chilli marks:** 0–2 original SVG chillies, exactly as counted in the copy deck. There is no hot or mild wording; the only text is "Chilli marks are shown as printed too" and screen-reader text such as "2 chilli marks".
- **Notes as printed:** "(Served In 500 Ml)" on the non-vegetarian mains heading, "(650ml)" and "(650 ml)" on biryanis, "(500 ml)" on rice, "(In House Speciality)" on Handi Gosht, "(per person)" on the platters, and "(half/Full)" on Tandoori Chicken.
- **Price note:** one menu-level line, "Prices from our current online menu, being re-checked", with the marker, at the top and foot of the menu and beside each priced section on the homepage.
- **Display normalisation only:** "£ 14.25" is shown as "£14.25", and "£9.50 /£6.50" as "Main £9.50 · Side £6.50". The printed strings are kept in `data-dish` and parsed by the tested `parsePrice`.
- **Checked mechanically:** a script compared all 71 dishes against the copy-deck tables (name, codes, chilli count, price and description) and found 0 differences.

### Conflicts between version A and version B (all [TO CONFIRM])

- Tandoori Lamb Chops: £11.99 (A) vs 11.5 GBP (B)
- Paneer Tikka Shashlik: £8.99, no code (A) vs 8.75 GBP (D) (B)
- Papadoms & Chutney: £3.00 (A) vs 3.75 GBP (B)
- Butter Chicken: £14.25 (A) vs 14.5 GBP (B); B adds (D, M) and "(Speciality)"
- Lamb Rogan Josh: £17.50 (A) vs 17.25 GBP (B)
- Egg Fried Rice: £7.25 (S) (A) vs 5.5 GBP (E, S) (B). Note that A omits E on an egg dish.
- Chicken Korma: no code in A (the description says almond) vs (N, D) in B
- Lemon Rice: (S) in A vs (V, M) in B
- Yellow Dal Tadka: A's description repeats Masala Bhindi's; B's is "Yellow split lentil cooked with chopped fresh spinach…"
- Only in A: Veg Platter (per person), Lamb Jalfreezie, Cucumber Raita. Only in B: Kadai Gosht, Mint paratha, Mixed Veg Raita, Gulab Jamun, Gajar ka halwa, Mango Lassi, Sweet Lassi.
- Many codes appear only in B. In A, **none of the 16 non-vegetarian mains and none of the 15 vegetarian mains carry an allergen code** (only Mix Veg Jalfreezie has V), although B codes many of them (for example Samosa G, Saag D, Malabar Fish Curry M, Murgh Chetinaad M). This is the most important item for the restaurant to resolve. Until then the thali lists those dishes as "no code printed" and tells people to ask.
- B flags Lamb Dhansak and Chicken Dhansak "(Popular dish)" and Butter Chicken "(Speciality)". These are not shown, since A is the dine-in source.

## Every [TO CONFIRM] on the pages

Each marker is a `<span class="tbc">` with an HTML comment beside it giving the reason.

- **Prices:** A vs B conflicts, on both pages and in the thali total.
- **Evening hours:** footer 17:30–22:30; Harden's and the ordering-system data disagree.
- **Booking link:** that the foodbooking.com link opens table reservations, not only ordering. It appears in the hero and the Book card.
- **Collection offer threshold:** £30 on the menu page vs £25 on the takeaway page. No figure is shown.
- **Delivery:** the platform listings and links, and whether all three are active. Names only, unlinked.
- **Yellow Dal Tadka:** the description is taken from version B (see deviations).
- **Desserts and lassi:** these exist only in the ordering menu.

## Deviations from the brief, and why

1. **Yellow Dal Tadka description comes from version B, labelled.** A prints Masala Bhindi's okra description against a lentil dish. Printing it verbatim would misdescribe the dish to diners, including anyone checking ingredients, so the page shows B's text with "Description from our online ordering menu" and a marker. The price stays as version A.
2. **The menu has no "Build a thali" set.** The site says so ("We don't list a set thali") under the hero illustration, and the thali is presented as a way to plan a meal from the menu, not as a dish.
3. **One booking link for two jobs.** "Book" uses the verified ordering URL, as the brief asks, always marked to confirm and always next to the phone number. OpenTable appears once, as a small secondary text link in the Book card (it is a verified listing in the copy deck).
4. **Instagram is shown as plain text (@swagatrichmond), not linked.** The tech spec's list of permitted external links doesn't include social profiles. The handle and the Facebook URL are in the JSON-LD `sameAs`.
5. **Tandoori Chicken portions are labelled Half and Full.** This is inferred from the printed "(half/Full)" with "£9.99/£19.99".
6. **"A little way up Richmond Hill"** comes from the brief's own description of the location (sourced in the dossier to Travel Gourmet). It makes no view or distance claim.

## Accessibility and QA (Playwright Chromium, 25 Oct 2026)

- **Console and requests:** 0 console errors or warnings and 0 failed requests on both pages at 320, 390, 768 and 1440.
- **Layout:** no horizontal overflow at any width; CLS 0.0011 (desktop menu) and 0.0000 (mobile).
- **axe-core 4.9.1** (WCAG 2.0/2.1/2.2 A and AA, plus best practice): **0 violations** on both pages at 390 and 1440, with the thali filled, and with the mobile sheet open.
- **Navigation:** a skip link, landmarks (header, nav ×2, main, aside, footer), logical headings, and visible `:focus-visible` rings (maroon on light, haldi on dark).
- **Tap targets:** all controls are at least 44px (add buttons 46px, buttons 48px, bar cells 64px tall).
- **Primary actions:** Order, Book, Menu and Call are in the fixed action bar below 1000px, and in the sticky header at 1000px and up. The 390px first frame shows Order, Book, See the menu, the phone number and the hours line.
- **Links:** every internal anchor resolves. The external links are only the ordering URL, OpenTable, the Google Maps search for the verified pin, tel:, mailto:, swagatcuisine.uk and Google Fonts.
- **Metadata:** `lang="en-GB"`, title, description, theme-color, Open Graph title and description, an inline SVG favicon, and JSON-LD `Restaurant` with confirmed facts only. The JSON-LD has no hours (to confirm), rating, price range or founding date.

## Known limitations

- **No shared code with the other concepts.** The pages were authored with a small generator kept outside the repo. The shipped HTML is the source to edit: change a dish by editing its row text **and** its `data-dish` JSON together, then run the tests.
- **Page weight:** each page is about 100KB of HTML, mostly inline SVG lathe lines on the plates. They gzip well, but sprite `<use>` references could halve that.
- **Hero illustration:** the plate is static and decorative. Its dish names are about 9px at 390px wide (the figure caption and `aria-label` carry them).
- **No sorting or filtering:** the thali doesn't sort by price or filter by code. Browsing by vegetarian and vegan is by anchors (Vegetarian mains, Vegetarian starters, and the V list in the key), not by a filter. Filtering is Concepts B and C's territory.
- **Ordering hand-off:** the selection can't be transferred to foodbooking.com (it has no public cart API). The page says so, and offers "Copy the list".
- **Allergen summary:** it reflects version A's sparse codes. It can only be as complete as the restaurant's own coding.
- **Hours highlight:** "today" is highlighted from the visitor's clock in Europe/London time. It never claims the restaurant is open now.
- **Fonts:** load from Google Fonts. Offline, the metric-matched fallbacks are used.

## Assets to replace

- The working wordmark, with the restaurant's vector logo (if one exists) or a commissioned redraw.
- Seven photograph slots (below). Each is a fixed-ratio placeholder captioned "Photograph to commission".
- The favicon (`img/favicon.svg`, plus the inline data-URI copy in both pages' `<head>`), once the logo is settled.

## Photography shot list (to commission)

| Slot | Shot | Ratio | Where |
|---|---|---|---|
| 1 | Malabar Fish Curry, from directly above, in its bowl | 1:1 (circle) | Home, regions |
| 2 | Handi Gosht, from directly above | 1:1 (circle) | Home, "The house's own" |
| 3 | A vegetarian spread: four or five side portions on one table, with rice and bread, from above | 3:2 | Home, vegetarian |
| 4 | The tandoor in use: the open mouth of the oven, skewers going in | 4:5 | Home, tandoor |
| 5 | Breads coming out of the tandoor | 4:5 | Home, tandoor |
| 6 | The dining room set for the evening | 3:2 | Home, Book card |
| 7 | The frontage on Hill Rise, at dusk with the fascia lit | 4:3 | Home, Find us |

Overhead shots are framed as circles to sit in the plate language; shoot them square, centred, with margin for a round crop.
