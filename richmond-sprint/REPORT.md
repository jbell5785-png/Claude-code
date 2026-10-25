# Richmond sprint: final report

Run on 25 October 2026, 05:50 to about 07:05 UTC. All work is in `richmond-sprint/` on branch `ccr-fd625fd5-brxqwe`. The Caffè Mamma project was not modified.

## 1. Businesses selected, and why

| Business | What it is | The evidence |
|---|---|---|
| **Chez Lindsay**, 11 Hill Rise | Breton restaurant and wine bar, since 1988; changed hands in 2024 | The 2014 site has no mobile layout (it overflows by 610px at 390px), all six menus are PDFs, and the hours contradict the Tuesday closure |
| **Matsuba**, 10 Red Lion Street | Family-run Japanese restaurant, since 2004 | A generic template with repeated filler copy; the first phone screen has no hours, menu or ordering; its printed burgundy-and-gold brand is unused online |
| **Swagat**, 86 Hill Rise | Indian restaurant | Unfinished pages (lorem ipsum, raw code showing on the menu page, an invisible mobile menu icon); hours sit about 15,500px down the phone homepage |

Excluded:
- **Swiss Bread:** the evidence was too weak.
- **The Robin Cafe:** too few verifiable facts.
- **Kiss the Hippo:** its site is already good.
- **Stein's and Don Fernando's:** unreliable information.

See `_shared/discovery-log.md`.

## 2. Completed concepts
All nine are complete, each with `index.html`, `menu.html`, `css/`, `js/`, `img/` and `NOTES.md`.

| Business | A | B | C |
|---|---|---|---|
| Chez Lindsay | `chez-lindsay/concept-a/`: Ce midi, ce soir (service clock) | `concept-b/`: Marée (compass filter) | `concept-c/`: Le Billig (galette fold) |
| Matsuba | `matsuba/concept-a/`: Noren (fabric curtain) | `concept-b/`: Counter (tasting-menu rail) | `concept-c/`: Bento (open-the-box menu) |
| Swagat | `swagat/concept-a/`: Thali (meal builder) | `concept-b/`: the welcome (drawn pattern) | `concept-c/`: Tandoor (veg / non-veg switch) |

To view them, run `python3 -m http.server 8000 --directory richmond-sprint` and open http://localhost:8000. The portfolio index links to everything.

## 3. Recommendations
- **Chez Lindsay: A, "Ce midi, ce soir".** It solves the real confusion about lunch versus evening and the Tuesday closure, and it evolves the brand the new owners bought.
- **Matsuba: A, "Noren".** It brings their own print colours online and makes "small and family-run" the point. C's live "Today" panel is worth borrowing.
- **Swagat: B, "the welcome".** An identity drawn from the restaurant's own name. A's thali builder would make a good second phase.

## 4. Quality checks
- **Automated checks:** every concept was rendered in Playwright Chromium at 390, 768 and 1440px, plus no-JS and reduced-motion first frames. All nine show:
  - 0 console errors
  - 0 failed requests
  - 0 broken links or anchors
  - 0 horizontal overflow
  - 0 axe-core WCAG 2 A/AA violations
  - Layout shift of at most 0.086 (Swagat C at 768px); every other concept is at or below 0.02.
- **Visual review and fixes:** I reviewed every concept's screenshots myself and fixed two issues:
  - Matsuba C's compartment titles wrapped badly.
  - Chez Lindsay B's hero left an empty block on tablets.
- **Fact lint:** no banned claims ("best sushi", "award-winning", boilerplate), no placeholder text, and no banned fonts.
- **Builders' own tests:**
  - Chez Lindsay A: the service clock, 44 of 44 tests, including a sweep of all 10,080 minutes of the week.
  - Matsuba C: the hours function, 12 of 12.
  - Swagat A: the thali logic, 23 of 23, plus a 71-dish text match against the copy deck.
- **Portfolio index:** 0 errors, 42 of 42 links resolve, 0 axe violations.
- **Not verified:**
  - Safari, Firefox and real phones
  - real screen readers
  - the external booking and ordering pages (OpenTable, Favourite Table, Toast and foodbooking.com)

## 5. Unresolved items, unverified facts and placeholders
- **All photography and all three logos** are placeholders. Composed, captioned slots name each shot to commission.
- **"To confirm" items, listed in each package README:**
  - **Chez Lindsay:**
    - the OpenTable link (built from the widget ID)
    - whether the brunch price is per person or per two
    - bank-holiday hours
    - eight spelling corrections
  - **Matsuba:**
    - Monday opening
    - the lunch end time
    - whether the set menu still runs
    - the meaning of the dual prices
  - **Swagat:**
    - hours
    - every price (its two published menus disagree)
    - the collection-offer threshold
    - whether the booking link opens reservations
    - delivery links
- **Swagat's allergen codes need the owner's attention.** Most mains carry no codes, and Chicken Korma mentions almond without an N code.
- **Possible security issue on Matsuba's current site:** an obfuscated script calls an unrelated domain. It was not confirmed as malicious. It's noted privately in `matsuba/outreach-email.md` for you to decide on, and it isn't used as a sales point.

## 6. Outreach drafts (not sent)
- `chez-lindsay/outreach-email.md`
- `matsuba/outreach-email.md`
- `swagat/outreach-email.md`

## 7. Resources and limitations
- **Agents:** 12 subagents in total, 3 for research and 9 for building. A transient safety-check error blocked the first launch of the three Swagat builders, and a single retry succeeded.
- **Research access:**
  - Several third-party sites refused automated requests (OpenTable 503; Tripadvisor, Square Meal and Instagram 403 or 429). They were not forced.
  - Official sites were loaded in a standard headless browser.
- **Review passes:** one review-and-fix pass per concept by me, on top of each builder's own screenshot passes. That is lighter than two full passes, and it's recorded in the checklist.

## 8. Where things are
- Portfolio index: `richmond-sprint/index.html`
- Checklist: `richmond-sprint/CHECKLIST.md`
- Shared spec and discovery log: `richmond-sprint/_shared/`
