# Matsuba: prospect package

A small, family-run Japanese restaurant at 10 Red Lion Street, Richmond TW9 1RW, first opened in 2004. Researched 25 October 2026.

**What's in this folder**
- Research: `research/dossier.md` (with sources) and `research/copy-deck.md` (the only content the concepts use)
- Creative brief and the three directions: `brief.md`
- Outreach draft, not sent: `outreach-email.md`. It includes a separate, optional security courtesy note for you to decide on.
- Concepts:
  - `concept-a/`, "Noren"
  - `concept-b/`, "Counter"
  - `concept-c/`, "Bento"
- To open a concept, serve the folder: `python3 -m http.server 8000 --directory concept-a`, then visit http://localhost:8000. Opening `index.html` directly also works.

## Why Matsuba
- **Generic copy:** the current site is a template. "delivered to the customer with service to the highest" appears six times, and "BEST SUSHI IN LONDON" on every inner page, while nothing says who runs it or what's particular about it.
- **The first screen on a phone** has no hours, address, menu or ordering link.
- **Out-of-date links:** the homepage takeaway button opens a 2024 PDF instead of the live Toast ordering page.
- **A brand in print only:** its printed menus use a burgundy-and-gold palette the website never uses. That's a ready-made brand waiting to go online.
- Full evidence is in the dossier.

## The three directions

| | A "Noren" | B "Counter" | C "Bento" |
|---|---|---|---|
| Idea | Stepping through the curtain into a tiny, warm family room | The evening at the bar, built around the £100 tasting menu | The daytime and takeaway Matsuba, organised like a bento box |
| Type | Shippori Mincho + Zen Kaku Gothic New | Gowun Batang + Work Sans | Zen Maru Gothic + Lexend |
| Colour | Their print burgundy, gold and brown on washi | Cedar-dark, bulb amber, paper | Rice white, nori, pine green, salmon |
| Layout | Quiet asymmetric grid with vertical section titles | Dark bands ruled by timber "slats" | One big box of unequal compartments |
| Signature | A five-panel fabric curtain that parts on load and lifts on hover | A swipeable rail of the 14 tasting courses | "Open the box": menu compartments that expand to fill the box, plus a live "Today" state |
| Best for | Brand and first impression | Special-occasion bookings | Takeaway, lunch and quick decisions on a phone |

## Recommendation: Concept A, "Noren"
It does the job the current site doesn't. It brings Matsuba's own print colours online, makes "small, warm and family-run" the selling point, and still puts Book and Order (20% off collection) on the first screen of a phone.
- **Easiest to approve:** it's the concept the owners will most easily recognise as theirs.
- **Worth borrowing:** C's live "Today" compartment, which tells you if it's open, lunch or between services, would sit well in A's hero.
- **When to pick B or C instead:** B if they want to grow tasting-menu bookings; C if takeaway is most of the business.

## Verified facts and placeholders

**Verified, from the official site or public records:**
- name, address, phone and email
- "family-run", "First opened in 2004"
- the Favourite Table booking link and its terms
- the Toast ordering link and the 20% collection offer
- the full dine-in menu with prices
- the tasting menu at £100
- the allergen and service-charge wording

**Marked "to confirm" on the pages:**
- Whether Monday is open (several sources say closed).
- The lunch end time (3pm, 2:45pm or 2:30pm all appear).
- Whether the Lunch & Early Evening set menu still runs.
- What the dual prices mean.
- Spelling corrections. The concepts keep spellings as published ("Uangi", "Eby"), and each NOTES.md lists proposed fixes.

**Deliberately not used:**
- the family's heritage and any names
- Harden's seating figure
- reviews, ratings and "best sushi" claims
- the 2024 vegan and gluten-free PDFs (stale)

**Placeholders:**
- every photograph, in composed and captioned slots with the shot to commission
- the logo, shown as a wordmark in each concept's type

## QA results
- Run in Playwright Chromium at 390, 768 and 1440px (top, middle and bottom), plus no-JS and reduced-motion first frames.
- Accessibility scanned with axe-core 4.10 (WCAG 2 A/AA) at 390 and 1440px.
- Links and anchors checked across both pages.
- Fact lint for banned claims and fonts.
- A visual review of every screenshot.

| Concept | Console errors | Failed requests | Broken links/anchors | Widths with overflow | axe A/AA violations | Worst layout shift | 'To confirm' markers |
|---|---|---|---|---|---|---|---|
| A | 0 | 0 | 0 | 0 | 0 | 0.013 | 10 |
| B | 0 | 0 | 0 | 0 | 0 | 0.019 | 6 |
| C | 0 | 0 | 0 | 0 | 0 | 0.014 | 16 |

**Fixes made in review:** C's compartment titles broke "Sides & dessert" into three ragged lines. The ampersands are now kept with the word before them and the lines are balanced.

**Not tested:** Safari or Firefox, a real phone, a real screen reader, and the external Toast and Favourite Table pages.

## Self-assessment

**A, "Noren"**
- *Strong:* the curtain feels like fabric, not a slideshow, and the print palette gives Matsuba an identity it doesn't have online. It's calm and readable, with the vertical menu index.
- *Falls short:*
  - The room photograph slot carries the hero until real photography exists.
  - The vertical labels are a nice touch on desktop but disappear on phones.
  - A top studio would commission a real noren and photograph it.

**B, "Counter"**
- *Strong:* the most atmospheric, and the tasting-menu rail is a genuinely useful way to read 14 courses on a phone. Contrast holds up on the dark ground.
- *Falls short:*
  - The bulb motif sits close to territory used in the earlier Caffè Mamma concept B; it is distinct here (one warm-up on load, no scroll-driven lighting) but not wholly fresh.
  - The desktop hero has a lot of empty dark space.

**C, "Bento"**
- *Strong:* the most practical. "Order for collection, 20% off" leads, the live Today state works, and the box is fun without getting in the way. Food illustrations are simple and graphic.
- *Falls short:*
  - It's busy, and the flat salmon and green can feel like a chain brand.
  - The bento metaphor is a little literal.
  - The menu's "open a compartment" step adds a tap for people who just want to scroll; the plain anchors help.
