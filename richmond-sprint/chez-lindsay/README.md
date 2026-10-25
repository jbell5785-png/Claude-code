# Chez Lindsay: prospect package

A Breton restaurant and wine bar at 11 Hill Rise, Richmond TW10 6UQ, by Richmond Bridge. It has been on Hill Rise since 1988, and the lease changed hands in July 2024. Researched 25 October 2026.

**What's in this folder**
- Research: `research/dossier.md` (with sources) and `research/copy-deck.md` (the only content the concepts use)
- Creative brief and the three directions: `brief.md`
- Outreach draft, not sent: `outreach-email.md`
- Concepts:
  - `concept-a/`, "Ce midi, ce soir"
  - `concept-b/`, "Marée"
  - `concept-c/`, "Le Billig"
- To open a concept, serve the folder: `python3 -m http.server 8000 --directory concept-a`, then visit http://localhost:8000.

## Why Chez Lindsay
- **Not built for phones:** every page of chez-lindsay.co.uk (© 2014) lacks a viewport tag and uses a fixed 1000px layout. At 390px the page overflows by 610px and the logo is cut off.
- **Hard to use on a phone:** there are no tap-to-call links, and the menu buttons are about 21px tall.
- **Menus are PDF-only:** all six, and four links still open 2024 versions.
- **Hours are hard to piece together:** they're not on the homepage, while "Toujours Ouvert!" and "open all day, every day" contradict the Tuesday closure.
- **The audience:** the new owners took over a 37-year neighbourhood favourite whose site no longer works for people finding it on a phone. Full evidence is in the dossier.

## The three directions

| | A "Ce midi, ce soir" | B "Marée" | C "Le Billig" |
|---|---|---|---|
| Idea | The site always knows what's being served now | The Brittany coast on the tidal Thames | The griddle's circle and the galette's square fold |
| Type | Gilda Display + Jost | Bodoni Moda + Karla | Archivo (wide and condensed) + Literata |
| Colour | Their own olive and linen, with Bordeaux | Atlantic navy, foam, sea-glass, a little red | Cast-iron black, buckwheat, egg-yolk yellow |
| Layout | Brasserie board with side rails | Off-axis chart composition with cartouches | Alternating circle and square compositions, poster scale |
| Signature | A service clock in London time, with day and time preview (44 tests) | A compass filtering the menus by Mer, Terre, Potager and Sucré | The hero galette folds into a square; the yolk is the Book button |
| Menu | Six accessible tabs, with the current service pre-selected | One page, with the compass and a "ship's manifest" wine list | Galettes first, each opening an "anatomy" of its fillings |
| Best for | Clarity, and regulars who need hours | Evenings, seafood and wine | Lunch, families and galettes |

## Recommendation: Concept A, "Ce midi, ce soir"
It fixes the thing customers actually struggle with: the lunch and evening split, Tuesday closing, and the weekly rituals (steak night, Sunday brunch, happy hour). It does this as a calm evolution of the olive-and-linen identity the new owners inherited, which makes it the easiest proposal for them to say yes to.
- **Worth borrowing from B:** the wine and cider "manifest" table.
- **Worth borrowing from C:** the galette anatomy, as a later addition.

## Verified facts and placeholders

**Verified, from the official site and its menus:**
- the address, phone and email
- since 1988
- hours: Monday and Wednesday to Saturday 12 noon–10pm, Sunday 12 noon–9pm, closed Tuesday
- the lunch and evening menu split
- steak night, Sunday brunch and happy hour
- the private room for 12 to 40
- all six menus with prices (Sept 2026, Jan 2026 and Feb 2026 PDFs)
- the allergen line and the 12.5% service charge

**Marked "to confirm" on the pages:**
- The OpenTable link. It's built from their published widget ID, 93306.
- Whether the £31.5 brunch is per person or per two.
- What "Add 3" means on the vegan galettes.
- Bank-holiday, Christmas and last-orders times.
- The spelling corrections. All three concepts correct the eight [sic] spellings in the PDFs and list each one in NOTES.md.
- Whether the social accounts are active.

**Deliberately not used:**
- press quotes (Time Out 2013 and others)
- the founder's name and the TripAdvisor testimonial
- "gluten-free" wording
- the unexplained per-dish figures on the set lunch (only the 2-course and 3-course prices are shown)

**Placeholders:**
- every photograph, in composed and captioned slots
- the hand-drawn script logo; a vector file is needed

## QA results
- Run in Playwright Chromium at 390, 768 and 1440px (top, middle and bottom), plus no-JS and reduced-motion first frames.
- Accessibility scanned with axe-core 4.10 (WCAG 2 A/AA) at 390 and 1440px.
- Links and anchors checked.
- Fact lint.
- A visual review of every screenshot.

| Concept | Console errors | Failed requests | Broken links/anchors | Widths with overflow | axe A/AA violations | Worst layout shift | 'To confirm' markers |
|---|---|---|---|---|---|---|---|
| A | 0 | 0 | 0 | 0 | 0 | 0.004 | 6 |
| B | 0 | 0 | 0 | 0 | 0 | 0.020 | 9 |
| C | 0 | 0 | 0 | 0 | 0 | 0.002 | 6 |

**Fixes made in review:** at tablet width, B's hero frame stretched to the full screen height, leaving an empty block under the hours. It's now capped.

**Not tested:**
- Safari or Firefox
- a real phone
- a real screen reader
- the OpenTable page itself

## Self-assessment

**A, "Ce midi, ce soir"**
- *Strong:* the most useful idea in this set, and it's correct to the minute (44 tests, three time zones). Calm, legible typography, and it respects the existing brand.
- *Falls short:*
  - The clock dial is small on desktop, and on phones it becomes a strip that's less charming than the dial.
  - The page is quiet to the point of plain in places until real photography arrives.
  - It has no bank-holiday exceptions yet.

**B, "Marée"**
- *Strong:* the most sophisticated look. The chart texture is subtle and original, the compass is a genuinely playful way to read a long menu, and the wine and cider list is the best-typeset table in the portfolio.
- *Falls short:*
  - Navy maritime styling is a familiar seafood-restaurant trope, rescued only by the chart detail.
  - The compass lines are desktop-only.
  - "Ce soir, à marée haute" ("tonight, at high tide") is mood, not fact, and some owners may find it a stretch for a crêperie.

**C, "Le Billig"**
- *Strong:*
  - The boldest and most distinctive. The galette fold is a signature nobody else has, and the yolk-as-Book-button is memorable.
  - Poster typography with a strong rhythm.
  - The galette anatomy on the menu is a nice touch.
- *Falls short:*
  - The procedural lace texture makes the folded galette read more like a textured tile than food. It needs a real photograph or a hand-illustrated surface to be appetising.
  - The big black discs on cream feel heavy in places.
