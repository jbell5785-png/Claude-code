# Richmond sprint: checklist

Started 25 October 2026, 05:50 UTC; finished about 07:05 UTC. Status key: [x] done, [-] dropped (with the reason).

## Setup
- [x] Workspace `richmond-sprint/`, kept separate from the Caffè Mamma project, which was not modified
- [x] Shared build spec for builders: `_shared/tech-spec.md`

## Phase 1: discovery
- [x] Long list of independent Richmond restaurants and cafés, avoiding Italian and favouring distinct identities: `_shared/discovery-log.md`
- [x] Each candidate's website checked: live render at 1440 and 390px
- [x] Selected Chez Lindsay, Matsuba and Swagat
  - [-] Swiss Bread: evidence too weak (its images were blocked for the headless browser, not proven broken)
  - [-] The Robin Cafe: runner-up, but too few verifiable facts
- [x] Research dossier and copy deck for each business, with sources and dates: `<business>/research/`

## Phases 2–3: briefs and directions
- [x] Chez Lindsay brief and three design theses
- [x] Matsuba brief and three design theses
- [x] Swagat brief and three design theses

## Phase 4: build (one builder agent per concept)
- [x] Chez Lindsay: concepts A, B, C
- [x] Matsuba: concepts A, B, C
- [x] Swagat: concepts A, B, C. The first launch failed on a transient check error and was retried once.

## Phase 5: QA (by me, rendered in Chromium)
- [x] QA harness run on all nine concepts. All nine show 0 console errors, 0 failed requests, 0 broken links, 0 overflow and 0 axe A/AA violations, and layout shift is at most 0.086.
  - The harness covers console, links, axe, overflow, layout shift, no-JS and reduced motion.
- [x] Visual review of every concept at 390, 768 and 1440px. Fixes:
  - Matsuba C: compartment title wrapping
  - Chez Lindsay B: hero height on tablets
- [x] Fact lint on every concept: banned claims, banned fonts and placeholder text; "to confirm" markers counted
- [-] Second full review pass per concept: not run. Each builder ran its own screenshot passes first, and my single pass found only the two issues above.

## Phases 6–7: packages and index
- [x] Per business `README.md`: comparison, verified-vs-placeholder record, QA results, recommendation and self-assessment
- [x] Per business `outreach-email.md` (drafts only; nothing sent)
- [x] Portfolio index `richmond-sprint/index.html`. Checked: 0 errors, 42 of 42 links resolve, 0 axe violations
- [x] Final report: `REPORT.md`

## Not done by design
- Nothing published, emailed, submitted or purchased, as the brief forbids.

## Not tested
- Safari, Firefox and real phones
- Real screen readers
- External destinations: OpenTable, Favourite Table, Toast and foodbooking.com
