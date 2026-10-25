# Swagat: prospect package

An independent Indian restaurant at 86 Hill Rise, Richmond TW10 6UB, a little way up Richmond Hill. Researched 25 October 2026.

**What's in this folder**
- Research: `research/dossier.md` (with sources) and `research/copy-deck.md` (the only content the concepts use)
- Creative brief and the three directions: `brief.md`
- Outreach draft, not sent: `outreach-email.md`
- Concepts:
  - `concept-a/`, "Thali"
  - `concept-b/`, "Swagat" (the welcome)
  - `concept-c/`, "Tandoor"
- To open a concept, serve the folder: `python3 -m http.server 8000 --directory concept-a`, then visit http://localhost:8000.

## Why Swagat
The current site (swagatcuisine.uk) is unfinished in places a customer will notice:
- About Us shows lorem ipsum and three "Name" placeholder team cards, and Blogs is empty.
- The Menu page shows raw ordering-system code as text, its mobile menu icon is white on white, and it runs to 21,935px on a phone.
- Hours appear only in the footer, about 15,500px down the mobile homepage.

Meanwhile its most distinctive asset, a menu that spans Kerala, Chettinad, Parsi and north Indian cooking with 15 vegetarian mains that can all be ordered as sides, is buried. Evidence is in the dossier.

## The three directions

| | A "Thali" | B "Swagat" (the welcome) | C "Tandoor" |
|---|---|---|---|
| Idea | Put a whole meal together, plate by plate | स्वागत, welcome: a drawn welcome on the doorstep, then the regional story | The heat of the clay oven, bold and contemporary |
| Type | Rozha One + Mukta | Tiro Devanagari Hindi + Hind | Big Shoulders Display + Public Sans |
| Colour | Their maroon, turmeric, steel, ivory | Night indigo, chalk, marigold | Charcoal, ember, clay, with veg-green and non-veg-brown marks |
| Layout | Concentric plate compositions | Editorial long-form with marginal notes | Heavy horizontal bands, cropped condensed headlines |
| Signature | "Build a thali": pick dishes (vegetarian mains as main or side), see the plate fill, an estimated total and the allergen codes, then order for collection | An original seeded dot-grid pattern that draws itself around स्वागत, reused as dividers | A three-way All / Vegetarian / Non-vegetarian switch that re-composes the menu |
| Best for | Planning a takeaway or a shared table | Brand, story and first impressions | Fast menu scanning; vegetarian diners |

## Recommendation: Concept B, "Swagat" (the welcome)
It gives the restaurant something it doesn't have: an identity with meaning, taken from its own name. It tells the regional story using only the menu's own words and stays elegant on a phone, with a vegetarian view and the V (vegan-suitable) highlight explained properly.
- **Worth adding later:** A's thali builder is the strongest single feature across the three concepts. It would make a good second-phase addition to B's menu page.
- **When to pick A or C instead:** A if the owners think in takeaway orders; C if they want a louder, younger look.

## Verified facts and placeholders

**Verified, from the official site:**
- name, address, phone and email
- closed Mondays
- the restaurant's own booking and ordering system (foodbooking.com)
- the full menu text, including codes, chilli icons and notes
- the allergen statement and key (V means vegan suitable, not vegetarian)

**Marked "to confirm" on the pages:**
- Opening hours (the footer says 17:30–22:30 Tue–Sun; other sources disagree).
- Every price: the site publishes two menus that disagree on at least seven prices.
- Whether the foodbooking.com link opens table reservations.
- The collection-offer threshold (£25 or £30), so no figure is shown.
- Delivery-platform links, so the platforms are named only.
- The Yellow Dal Tadka description, because version A copies another dish's text; B's is used and labelled.

**Deliberately not used:**
- staff and founder names
- testimonials and ratings
- the founding year (2006 or 2007)
- any river view
- a map of India

**Placeholders:**
- every photograph, in composed and captioned slots
- the logo; only a blurry raster exists, so a vector is needed

**Flag for the owners:** version A of the menu prints no allergen codes on most mains, and Chicken Korma's description mentions almond without an N code. NOTES.md in each concept records this. It matters more than any design choice.

## QA results
- Run in Playwright Chromium at 390, 768 and 1440px (top, middle and bottom), plus no-JS and reduced-motion first frames.
- Accessibility scanned with axe-core 4.10 (WCAG 2 A/AA) at 390 and 1440px.
- Links and anchors checked.
- Fact lint.
- A visual review of every screenshot.
- The concept builders also checked menu text against the copy deck (A: 71 of 71 dishes identical) and ran Node tests (A: 23 of 23 thali-logic tests).

| Concept | Console errors | Failed requests | Broken links/anchors | Widths with overflow | axe A/AA violations | Worst layout shift | 'To confirm' markers |
|---|---|---|---|---|---|---|---|
| A | 0 | 0 | 0 | 0 | 0 | 0.002 | 17 |
| B | 0 | 0 | 0 | 0 | 0 | 0.001 | 11 |
| C | 0 | 0 | 0 | 0 | 0 | 0.086 | 19 |

C's layout shift at 768px (0.086) is within the 0.1 "good" threshold, but it is the highest in the portfolio. It comes from the condensed display font loading in, and a closer fallback-font match would reduce it.

**Not tested:** Safari or Firefox, a real phone, a real screen reader, and the foodbooking.com pages.

## Self-assessment

**A, "Thali"**
- *Strong:* the most useful interaction in the whole portfolio. It's honest about what it is ("nothing has been ordered"), accessible, and tested. The steel plate illustration is warm and specific.
- *Falls short:*
  - The homepage hero plate's labels are tiny on phones.
  - The page weight is high (about 100KB of inline SVG).
  - The concentric motif can feel decorative on long pages.

**B, "Swagat"**
- *Strong:*
  - The most distinctive identity, with real meaning.
  - The generated pattern is genuinely original and well executed.
  - The Devanagari renders correctly, and the editorial voice tells the regional story without inventing anything.
- *Falls short:*
  - On phones the pattern takes most of the first screen, so the actions live in the bottom bar.
  - The chalk filter may stutter on low-end phones during the two-second draw.
  - A top studio would commission a lettering artist for the wordmark.

**C, "Tandoor"**
- *Strong:* the boldest and fastest to scan. The veg/non-veg switch is clear and classifies strictly from the menu's own headings. It's confident poster typography.
- *Falls short:*
  - The cropped headlines (the "MENU" band) push legibility; some owners will find it too aggressive.
  - Ember orange is reserved for large text, which limits the palette in body copy.
  - Its layout shift is the highest in the set (still acceptable).
