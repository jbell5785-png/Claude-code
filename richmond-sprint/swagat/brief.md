# Swagat: creative brief

Sources: `research/dossier.md` and `research/copy-deck.md` (researched 25 October 2026). The copy deck is the only content a designer may use.

## The business
- **What it is:** Swagat Indian Cuisine, an independent Indian restaurant at 86 Hill Rise, Richmond TW10 6UB, a little way up Richmond Hill. It calls itself "Contemporary Indian Cuisine".
- **The menu:**
  - It spans regions with its own notes: Malabar Fish Curry ("Traditional Kerala speciality"), Murgh Chetinaad ("A south Indian speciality"), Dhansak ("Originating among the Parsi Zoroastrian Community") and Mutter Paneer ("A north Indian speciality").
  - Tandoor starters.
  - Handi Gosht, the "(In House Speciality)".
  - A strong vegetarian section: 15 vegetarian mains, each also sold as a side.
- "Swagat" is the Hindi word for "welcome". That is a dictionary meaning, usable as a design idea, but the restaurant doesn't say it named itself for that, so don't claim it.
- **Founding:** 2006 or 2007 (reported). Don't state a year.

## Audience (inference)
- Richmond Hill and town locals, for dinner and takeaway.
- Vegetarian and mixed groups.
- Couples.
- Visitors walking up the hill.
- Families ordering in.

## Confirmed details
- **Contact:** 020 8940 7557 · swagat.india@yahoo.co.uk · @swagatrichmond
- **Book and order:** the restaurant's own system, `https://www.foodbooking.com/ordering/?restaurant_uid=13e67dea-233a-48e3-acf6-ee76d245f40a`. Ordering is verified. Use the same link for "book online", marked to confirm that it opens reservations. Always offer phone booking.
  - Up to 8 guests online. "Table is kept for 15 minutes after reservation time."
  - Also listed on OpenTable: https://www.opentable.co.uk/r/swagat-indian-cuisine-richmond (secondary).
- **Delivery:** Deliveroo, Uber Eats and Just Eat are named on the site; their links are [TO CONFIRM]. Show the names only, without links.
- **Hours:** closed Mondays. Footer: Tue–Sun 17:30–22:30 [TO CONFIRM]; other sources disagree. No lunch service is known.
- **Allergens:** use the published statement verbatim and the key D, E, N, G, C, M, S, and **V = Vegan suitable (not vegetarian)**. Show the codes as published; don't add icons that imply more than the codes say.
- **Offer:** 10% off collection plus complimentary papadoms. The threshold (£25 or £30) is [TO CONFIRM], so show it with the marker and without a figure.

## Keep from the current site
- All three actions are on the first mobile screen.
- One tap to book or order.
- Allergen codes on every dish, and main/side pricing for vegetarian dishes.
- The deep-maroon wordmark colour.

## Opportunities (evidence in the dossier)
1. **Unfinished pages.**
   - About Us shows lorem ipsum and three "Name" placeholder team cards.
   - Blogs is empty.
   - "Order Takeaway" has no order button, and the delivery apps aren't linked.
2. **Menu page defects.**
   - Raw ordering-system JSON shows as text.
   - Content runs hard against the left edge.
   - The mobile menu icon is white on white (invisible).
   - The page is 21,935px tall on mobile.
   - Two versions of the menu disagree on prices and codes.
3. **Hard-to-find details.** Hours appear only in the footer, about 15,500px down the mobile homepage, and no phone or email link can be tapped.
4. **Weak copy and polish.**
   - Boilerplate copy ("premier destination", "rich tapestry of flavours").
   - Body text at 4.29:1 contrast; buttons 39px tall; inconsistent button styles.
   - Typos ("COSTUMER'S RATING", "Testimonial s").
5. **The real story is hidden.** The regional dishes and the vegetarian depth, which are the most distinctive things about Swagat, are buried.

## Visitor actions (priority order)
1. Order for collection, or book a table.
2. Browse the menu by course and by vegetarian/vegan, with clear allergen codes.
3. Check hours (evenings, closed Mondays).
4. Call or find it on Hill Rise.

## Brand material
- Deep-maroon #7D1114 Devanagari-inspired "swagat" wordmark (only a blurry 120×76 raster exists; use a working wordmark and note a vector is needed).
- Current fonts: Roboto Slab and Open Sans.
- Shots to commission:
  - the tandoor in use
  - Malabar fish curry
  - Handi Gosht
  - a vegetarian spread with mains as sides
  - breads coming out of the tandoor
  - the frontage on Hill Rise
  - the dining room set for evening

## Constraints
- **Copy:**
  - Every price carries the menu-level note "Prices from our current online menu, being re-checked", marked to confirm. Use version A (page text) for dine-in and list the conflicts in NOTES.md.
  - Chilli icons have no published key: show them as printed (0–2 icons) with no "hot" or "mild" labels.
  - Desserts and lassi exist only in version B. Include them, labelled as from the online ordering menu.
- **Cultural care:**
  - No map of India: border depictions are contentious and unnecessary.
  - No Taj Mahal, elephants or generic "exotic" ornament.
  - Patterns must be original geometry, not copied from specific traditional designs.
  - Any Devanagari must be correct: स्वागत means "welcome" and is fine as a decorative word.
- No staff names, no testimonials, no ratings, no awards, no river-view claims.

## Commercial purpose
Replace an unfinished template with a site that finishes the job: a menu that works on a phone, hours that are easy to find, one-tap ordering and booking, and a voice that tells people what is actually special here (the regional dishes and the vegetarian depth).

---

## Three directions

### A: "Thali" (a whole meal on one plate)
- **Idea:** the round steel thali: many small bowls (katoris) around rice and bread. The site helps you put together a meal, and makes the vegetarian section, where mains double as sides, a pleasure to explore.
- **Type:**
  - Rozha One for display (high-contrast, Devanagari-influenced Latin).
  - Mukta for text and UI (humanist, Devanagari-ready).
  - Wordmark: "swagat" in Rozha One lowercase.
- **Colour:**
  - Maroon #7D1114 (their colour)
  - Haldi #E2A11B (turmeric; accents on dark, or large text only)
  - Steel #C9CED3 (the thali)
  - Ivory #FBF6EE ground
  - Kadai #1C1412 text
- **Layout:** concentric. Section openers are circular compositions: a big plate shape with the heading in the centre and related items around the rim. Content flows in a calm single column, with wide margins of steel-grey hairline circles. Mobile: plates scale to about 90vw and the rim items drop below as a list.
- **Signature, "Build a thali":**
  - On the menu page, choose dishes (a curry, a vegetarian side, rice, bread, raita).
  - A thali plate SVG fills its katoris with the dish names, and a running "Estimated total from published prices · to confirm" updates.
  - Vegetarian mains can be added as a main or a side, using the published main/side prices.
  - Allergen codes of the chosen dishes are summarised, with the published allergen statement.
  - "Order this for collection" hands off to the ordering link. Nothing is ordered on this page, and the page says so.
  - Keyboard and screen-reader friendly (checkbox-like buttons with a live summary). No JS: a normal menu.
- **Motion:** bowls fill with a gentle 250ms scale and fade. No looping.
- **Port:** 8321.

### B: "Swagat" (the welcome)
- **Idea:** स्वागत, welcome. An elegant bilingual typographic site where the first thing you meet is a welcome drawn on the doorstep, then the regional story of the menu, told dish by dish.
- **Type:**
  - Tiro Devanagari Hindi, for its Latin and Devanagari display.
  - Hind for text and UI.
  - Wordmark: "Swagat" in Tiro, with स्वागत as a secondary mark.
- **Colour:**
  - Raat (night indigo) #1B1E3A ground for the hero and footer
  - Chalk #F6F2EA
  - Genda (marigold) #F2A33A
  - Gulabi (rose) #C8456B, used sparingly
  - Maroon #7D1114, for links on light
- **Layout:** an editorial long-form. Wide margins and a 10-column grid with a strong left text column and right-hand marginal notes for regional origins (Kerala, south India, Parsi community, north India), taken only from the menu's own descriptions. No map.
- **Signature, "The doorstep welcome":**
  - On load, an original geometric dot-grid pattern (generated in SVG from a seeded grid; symmetric loops around dots, inspired by threshold drawings but not copying any traditional design) draws itself once around the स्वागत wordmark at the top of the page.
  - About two seconds, then it rests. Reduced motion: drawn instantly.
  - The pattern reappears small as section dividers.
- **Menu page:**
  - A refined long menu with a sticky course index.
  - A "Vegetarian" view toggle that shows only the vegetarian sections and dishes, plus a separate "Vegan suitable (V)" highlight, explaining that V means vegan-suitable.
  - Codes are shown as small letter badges with the key at the top.
- **Motion:** the one drawing moment, plus calm 400ms fades. Nothing else.
- **Port:** 8322.

### C: "Tandoor" (the clay oven)
- **Idea:** the heat at the heart of the kitchen. A bold, contemporary, poster-like site for the tandoor starters, grills and breads, with a clear-cut vegetarian/non-vegetarian switch borrowed from the green and brown food-marking symbols used on Indian menus and packaging.
- **Type:**
  - Big Shoulders Display for display (tall, condensed, heavy, poster energy).
  - Public Sans for text and UI.
  - Wordmark: "SWAGAT" in Big Shoulders, wide-tracked.
- **Colour:**
  - Koyla (charcoal) #161210 ground
  - Angara (ember) #E0632B (large type and shapes; check text pairs)
  - Matti (clay) #9C4A2B (large shapes only)
  - Smoke #ECE6DD text on dark
  - Veg green #1E7A3A, plus a brown non-veg mark #7A4A2A, used only as the square-with-dot symbols
- **Layout:** heavy horizontal bands like the layers of a tandoor's clay wall, with full-bleed condensed headlines cropped by the band edges. Strong left alignment and extreme scale contrast.
- **Signature, "Veg / Non-veg switch":**
  - A large, physical-feeling toggle (a real `<button role="switch">`) on the menu page and the homepage preview.
  - Three states: All · Vegetarian · Non-vegetarian. The menu re-composes: non-matching sections fold away with a quick vertical collapse, and the page accent shifts to the veg-green or non-veg-brown symbol.
  - The square-dot symbols mark every dish. Classify only from the menu's own Vegetarian / Non-Vegetarian section headings; never guess.
  - The "V = vegan suitable" code is shown as printed.
  - The hero shows a glowing ember-ring SVG of the tandoor mouth with a subtle, once-only heat shimmer (CSS), static under reduced motion.
- **Menu page:** the tandoor starters and breads lead. Biryanis come with their "650 ml" note, and mains with "(Served In 500 Ml)".
- **Motion:** quick, decisive 150–250ms; the switch has a satisfying snap.
- **Port:** 8323.
