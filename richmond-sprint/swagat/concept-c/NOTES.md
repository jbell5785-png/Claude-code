# Swagat · Concept C · "Tandoor"

**The concept in two lines.** A bold, poster-like site built on the heat of the clay oven: charcoal ground, heavy clay-coloured bands like the layered wall of a tandoor, and condensed headlines cropped by the band edges. The signature is a three-state Veg / Non-veg switch that re-composes the menu using only the menu's own Vegetarian and Non-Vegetarian headings.

Local preview: `python3 -m http.server 8323 --directory richmond-sprint/swagat/concept-c`, then open http://localhost:8323/.

## Files

- `index.html`: homepage
- `menu.html`: full menu
- `css/tandoor.css`: the only stylesheet
- `js/tandoor.js`: the switch and fold logic, plus today's row in the hours list. No libraries and no GSAP.
- `img/ember-ring.svg`: the hero artwork as a standalone file (the pages inline it)
- `img/favicon.svg`: a file copy of the inline data-URI favicon

## Identity

- **Type.** Big Shoulders Display (600–900) for display, buttons and prices. Public Sans for text. Both load from Google Fonts with `display=swap` and preconnects.
- **Fallback faces.** They are metric-adjusted from Chromium measurements. Big Shoulders 900 caps run about 0.5em per character; Arial needs `size-adjust: 64%` to match width, and Arial Narrow 79%. Public Sans runs about 104% of Arial. Measured CLS on load is under 0.005.
- **Colour.** All pairs below were checked against WCAG AA:

  | Colour | Use | Contrast |
  |---|---|---|
  | Koyla #161210 | Ground | — |
  | Smoke #ECE6DD | Text | 15:1 |
  | Angara #E0632B | Large type and shapes only | 5.3:1 with charcoal text on it |
  | Small ember text #F08A55 | Highlighted phrases and labels | 7.5:1 |
  | Matti #9C4A2B | Clay bands | 4.9:1 with smoke text |
  | Maroon #7D1114 | The restaurant's own colour: the wordmark tile, the Handi Gosht band and the closing band of the menu | 8.6:1 with smoke text |
  | Veg green #1E7A3A, non-veg brown #7A4A2A | The square-and-dot symbols, and the page accent when the switch is set | 5.4:1 / 7.4:1 with white text |

- **Wordmark.** "SWAGAT" is set in Big Shoulders 800, tracked at 0.34em, on a maroon tile. It is a *working wordmark* in this concept's own type, not a redraw of the restaurant's Devanagari-style logo. The restaurant's only logo file is a blurry 120×76 raster, so a vector logo is needed (see "Assets to replace").
- **Hero.** An original SVG ember ring, the tandoor's mouth seen from above. A layered clay collar surrounds a glowing ring and a coal-lit pit, cropped by the top-right corner.
  - On load it plays a once-only CSS heat shimmer: the glow flares, the coals settle, and three faint wavy heat rings expand and come to rest. The whole sequence takes about 3 seconds and never loops.
  - Under `prefers-reduced-motion: reduce` no animation runs, and the resting frame is the designed static state.
- **Bands.**
  - Each section is a coloured "course" (a band head) above a darker body.
  - Display headlines are pulled down by a negative margin so the band edge slices their feet, by about 13% of the type size. The words stay legible, and the real heading text is always complete in the DOM.
  - The band heads use `display: flow-root`, so the cropping margin cannot collapse into the next band.
- **Breads band.** The one light band ("flour" #ECE6DD), so the breads stand out as a counterpoint.
- **Cultural care.**
  - No map of India.
  - No Taj Mahal, elephants, flags or rising-sun shapes; the ring is never set on a horizon.
  - No flame clip-art and no "exotic" ornament.
  - No Devanagari. It is left to Concept B, to keep the concepts distinct.
  - All the geometry (rings, strata, crop marks) is original.

## The Veg / Non-veg switch

- **Markup.** A `<fieldset>` with a legend and three native `<input type="radio">`, styled as a segmented control: All · Vegetarian · Non-vegetarian. Native radios give correct radio-group semantics, arrow-key movement and a single tab stop for free.
- **Feel.**
  - The labels are 62–68px tall.
  - A heavy "fired tile" thumb slides under the chosen option on a 240ms overshoot curve (the snap).
  - The track gives a 2px "thunk", and a label presses in to 96% when tapped.
  - Under reduced motion the thumb moves instantly and nothing animates.
- **Folding.**
  - Sections that don't match collapse with a 220ms `grid-template-rows: 1fr → 0fr` transition and fade.
  - Each folding section becomes `inert` immediately, then gets the `hidden` attribute when the fold ends. It stays in the DOM but leaves the accessibility tree and the tab order.
  - Unfolding reverses the steps.
- **Status line.**
  - A `role="status"` line announces the result, for example: "Showing the menu's Vegetarian sections: 23 dishes. Non-Vegetarian sections are folded away. Biryanis and rice, breads, raita and salad, dessert and lassi are not marked on the menu, so they stay in view."
  - Its space is reserved, so nothing shifts.
- **Accent shift.** The page accent changes through `html[data-diet]`. That recolours:
  - the thumb
  - the switch bar's bottom edge
  - the top strip of each marked section
  - the homepage preview's band head
  - the menu page's MENU band

  The accent is ember for All, veg-green for Vegetarian and non-veg brown for Non-vegetarian.
- **Where it lives.**
  - On `menu.html` it sits in a sticky bar (below the header on desktop). If you switch while scrolled into the menu, the page first jumps to the top of the menu sections.
  - On the homepage preview it filters the full Starters lists, and the "See the full menu" link carries the choice (`menu.html?diet=veg`).
- **Deep links.**
  - `menu.html?diet=veg` (or `nonveg`) restores a state, and the URL is updated with `replaceState`.
  - Any link or hash into a folded section first resets the switch to All, so the target exists. This covers the course index, `#starters-non-veg` and similar.
  - Every section has a stable id: `starters-non-veg`, `starters-veg`, `mains-non-veg`, `mains-veg`, `biryanis-rice`, `breads`, `raita-salad`, `dessert`, `lassi`. The homepage sections are `tandoor`, `breads`, `handi-gosht`, `menu-preview`, `vegetarian`, `regions`, `takeaway`, `book`, `hours` and `find-us`.
- **Without JS.** The whole menu renders, nothing is hidden, and the switch is replaced by a one-line key. The inline head script swaps `no-js` for `js` before first paint, so there is no shift.

### Classification rules (documented as asked)

1. A dish gets the **green** square-and-dot only if it is listed under one of the menu's own **Vegetarian** headings: *Starters / Vegetarian* or *Main Course / Vegetarian*.
2. A dish gets the **brown** square-and-dot only if it is listed under one of the menu's **Non-Vegetarian** headings: *Starters / Non-Vegetarian* or *Main Course / Non-Vegetarian (Served In 500 Ml)*.
3. Everything else is **unmarked**: Biryanis & Rice, Breads, Raita & Salad, and Dessert and Lassi (from the ordering menu).
   - This holds even where the dish name looks obvious, such as Chicken Biryani, Kheema Naan, Egg Fried Rice or Vegetable Biryani. We never guess.
   - Unmarked sections stay in view under every filter, with a note that the menu does not sort them.
4. **V** is shown as printed, as a boxed "V · Vegan suitable" tag. It is never treated as the vegetarian mark, and the key says so twice.
5. The extra "Tandoor" tag (ember ring glyph) appears only where the dish's **printed name or description contains the word "tandoor"**, for example "grilled in the tandoor", "baked in tandoor", "Tandoori Naan" or "Tandoori morsels".

Counts: 23 vegetarian dishes (8 starters and 15 mains), 24 non-vegetarian (8 and 16), and 24 unmarked, for 71 in total.

## Content decisions

- **Dishes.** Every dish is Version A (the page text), with A's prices, chilli counts and descriptions, except for one replaced description (see below). Desserts and lassi are added from Version B and labelled on the page: "From the online ordering menu. The restaurant menu has no desserts / drinks section", marked to confirm.
  - B's GBP figures are written as £ prices (4.5 GBP becomes £4.50).
  - B-only items in other sections (Kadai Gosht, Mint paratha, Mixed Veg Raita) are **not** shown.
- **Spellings.** The restaurant's spellings and capitalisation are kept as printed ("Chetinaad", "Jalfreezie", "Toped", "Chilly cheese Naan", "Peshwari"). Only missing or doubled spaces are fixed ("tandoor.Perfect", "withfresh", "coconut,& almond", "£ 3.00").
- **Price note.** There is one menu-level price note, marked to confirm: "Prices from our current online menu, being re-checked". It sits at the top of the menu page and under every homepage block that shows prices.
- **Allergen codes.** A's codes are shown as printed, with the verbatim allergen statement and key on the menu page. Where B prints a *different* code set for the same dish, it is shown alongside in a distinct "Ordering menu: D · M" style, explained in the key and marked to confirm.
  - **This is a deliberate safety call.** A omits codes that B prints for many dishes, including N, D for Chicken Korma (whose description names almond), E for Egg Fried Rice and D for the paneer dishes. Showing only A would understate allergens.
  - The key also says: "Where no code is shown, none is printed. Please ask about allergies."
- **Yellow Dal Tadka.** A's description duplicates Masala Bhindi's ("Fresh Okra tempered…"), so B's description is shown. It is labelled "Description from the online ordering menu…" and marked to confirm.
- **Chilli icons.** They are shown as printed (0–2) as an original SVG pod, with the screen-reader text "1 chilli icon, as printed". There are no hot or mild labels anywhere.
- **Portions.** "(Served In 500 Ml)" heads the non-vegetarian mains. The 650 ml and 500 ml notes stay in the biryani and rice names as printed.
- **Handi Gosht** gets its own maroon band with "(In House Speciality)" as printed.
- **Regional dishes.** Four strata quote the menu's own notes word for word: Kerala (Malabar Fish Curry), South India (Murgh Chetinaad), Parsi (Chicken and Lamb Dhansak) and North India (Mutter Paneer). There is no map.
- **Book and order.**
  - Every Book and Order button is a plain link to the verified foodbooking.com URL. It opens in a new tab, with "(opens in a new tab)" in its accessible name, and works without JS. One tap, nothing intercepted, no fake confirmations, and the page never navigates away by itself.
  - An honest line beside the hero and booking buttons says both open Swagat's own system at foodbooking.com. It notes that booking there is to confirm, and that phone booking (020 8940 7557) always works.
  - "Up to 8 guests online" and "Table is kept for 15 minutes after reservation time. We appreciate you being on time." are quoted from the copy deck.
- **Offer.** "10% off collection orders, plus complimentary papadoms, over a minimum spend" is marked to confirm, with no figure (£30 and £25 conflict).
- **Delivery.** Deliveroo, Uber Eats and Just Eat are named without links, marked to confirm.
- **Hours.**
  - The site footer's hours are shown: Tuesday to Thursday and Friday to Sunday, 17:30 to 22:30, marked to confirm. Mondays are shown as closed. They appear in the hero strip, the hours band and the footer.
  - JS marks today's row ("Today, Sunday", London time). Its space is reserved.
  - There is no open-now claim and no lunch claim.
- **Find us.**
  - 86 Hill Rise, Richmond, London TW10 6UB, "a little way up Richmond Hill" (brief).
  - A Google Maps *search* link. There is no embed and no map image.
- **Instagram.** @swagatrichmond is shown as plain text. The spec's list of allowed external destinations does not include social links, so there is no link.
- **Never used.** No staff names, founding year, ratings, testimonials, awards or river view.
- **JSON-LD.** A Restaurant entry with confirmed facts only: name, official URL, phone, email, address, geo, cuisine, `acceptsReservations` and the Instagram profile. Hours and prices are left out because they are unconfirmed.

## Conflicts between the two published menus (all to confirm)

| Item | Restaurant menu (A, used) | Ordering menu (B) |
|---|---|---|
| Tandoori Lamb Chops | £11.99 | 11.5 GBP |
| Paneer Tikka Shashlik | £8.99, no code | 8.75 GBP, (D) |
| Papadoms & Chutney | £3.00 | 3.75 GBP |
| Butter Chicken | £14.25 | 14.5 GBP |
| Lamb Rogan Josh | £17.50 | 17.25 GBP |
| Egg Fried Rice | £7.25, (S) | 5.5 GBP, (E, S) |
| Chicken Korma | no code (description names almond) | (N, D) |
| Lemon Rice | (S) | (V, M) |
| Yellow Dal Tadka description | repeats Masala Bhindi's text (error) | "Yellow split lentil…" (used here) |
| Codes only in B | — | Samosa G; King Prawn Bhuna C; Sea Bass, Malabar, Chetinaad M; Butter Chicken D,M; Methiwala M,D; Saagwala D; Tandoori Chicken M,D; Paneer Tikka Masala D,M; Mutter Paneer, Saag, Saag Paneer, Saag Aloo, Dal Makhani D; Aloo Gobi, Gobi Masala, Kadai Mushroom, Baigan Bharta, Chana Masala, Masala Bhindi, Yellow Dal Tadka V; Bombay Aloo V,M |
| Only in A (shown) | Veg Platter, Lamb Jalfreezie, Cucumber Raita | — |
| Only in B | — | Kadai Gosht, Mint paratha, Mixed Veg Raita (not shown); Dessert and Lassi (shown, labelled) |

Other open questions:
- Opening hours: the footer, Harden's, OpenTable and the ordering system all disagree, and lunch service is unknown.
- The collection-offer threshold (£25 or £30).
- Whether the foodbooking.com link opens reservations.
- The delivery platform links.

## Known limitations

- **No backend.** Booking and ordering hand off to foodbooking.com. Whether that URL opens the reservation form, rather than only ordering, is unverified.
- **Homepage preview.** It filters the two Starters sections only, and shows names, prices and codes without descriptions. The full switch lives on the menu page.
- **The switch's legend** "Show dishes" is visually hidden inside the menu's sticky bar, to keep the bar compact. On mobile the sticky bar's status line is also visually hidden, though it is still announced. The unmarked-section notes carry the same information visually.
- **Font fallback.** The fallback for Big Shoulders is width-matched only. Before the web font arrives, a narrow fallback is unavailable on most systems, so cropped headlines may sit slightly differently for a moment.
- **Allergens.** Codes reflect two inconsistent published sources and are not verified allergen data. The page tells diners to ask.
- **Print.** The print styles are basic: the dock, switch, slots and hero ring are hidden.
- **Instagram and OpenTable** are not linked, per the spec's allowed-destination list.

## Assets to replace

- **Wordmark:** the working "SWAGAT" type mark, to be replaced by a vector of the restaurant's Devanagari-style logo in maroon #7D1114, once one is supplied ([TO CONFIRM] whether a vector exists).
- **Image slots:** seven composed placeholders, each named on the page as "Photograph to commission" (list below).
- **Price note, hours, offer and delivery markers:** remove them as each item is confirmed.

## Photography shot list (placeholders on the page)

| Slot | Shot | Ratio | Where |
|---|---|---|---|
| 1 | The tandoor in use: skewers going into the clay oven, lit by the coals beneath | 4:5 portrait | Homepage, "Grilled in the tandoor" |
| 2 | Breads coming out of the tandoor: naan lifted from the oven, blistered and steaming, tight crop | 3:2 | Homepage, Breads |
| 3 | Handi Gosht, served in its handi, from above on a dark ground, steam catching the light | 1:1 | Homepage, Handi Gosht |
| 4 | A vegetarian spread: several mains served as sides across one table, hands reaching in | 16:9 | Homepage, vegetarian mains |
| 5 | Malabar fish curry, close and low, coconut sauce and curry leaves in focus | 4:5 portrait | Homepage, regional notes |
| 6 | The dining room set for evening, from the door, tables laid, low warm light | 3:2 | Homepage, Book a table |
| 7 | The frontage on Hill Rise at dusk, the fascia lit, the street rising past it | 4:3 | Homepage, Find us |

Direction for all: low, warm, real light from the oven or the room. A dark ground to sit on the charcoal bands. No marble, no props implying ceremony, no staged "exotic" styling.

## QA run (Playwright Chromium, 25 Oct 2026)

- **Errors and layout.** Both pages load at 320, 390, 768, 1024, 1440 and 2560 with zero console errors and zero failed requests. There is no horizontal scroll at any width.
- **axe-core 4.10** (WCAG 2 A/AA and best practice): 0 violations on both pages.
- **Structure.** No missing anchors and no duplicate ids. One h1 per page, with no skipped heading levels. CLS is under 0.005.
- **Without JS.** All 71 dishes render, nothing is hidden, and the switch is replaced by its text key.
- **Reduced motion.** No animations run. With motion allowed, the 5 hero animations each run once.
- **Switch.** Tested with clicks, arrow keys, `?diet=` parameters and deep links into folded sections. Folded sections were confirmed `hidden` and `inert`.
- **Screenshots** are saved outside the repo, in the session scratchpad (`sprint/swagat-c/`).
