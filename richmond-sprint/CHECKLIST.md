# Richmond sprint: checklist

Started 2026-10-25 05:50 UTC. Status key: [ ] todo, [~] in progress, [x] done, [-] dropped (reason given).

## Setup
- [x] Workspace `richmond-sprint/`, separate from the Caffè Mamma project (which is not modified)
- [x] Shared tech spec for builders (`_shared/tech-spec.md`)

## Phase 1: discovery
- [x] Long-list independent Richmond restaurants and cafés (non-Italian, distinct identities): `_shared/discovery-log.md`
- [x] Check each candidate's website (live render, mobile and desktop)
- [x] Selected: Chez Lindsay, Matsuba, Swagat. Excluded Swiss Bread (weak evidence), Robin Cafe (runner-up, too few facts)
- [x] Research dossier and copy deck per business (`<business>/research/`)

## Phase 2–3: briefs and directions
- [x] Brief and three design theses for business 1
- [x] Brief and three design theses for business 2
- [x] Brief and three design theses for business 3

## Phase 4: build (one builder agent per concept)
- [~] Chez Lindsay: concepts A, B, C (builders running)
- [~] Matsuba: concepts A, B, C (builders running)
- [~] Swagat: concepts A, B, C (builders running; first launch failed on a transient check error, retried once successfully)

## Phase 5: QA (by me, rendered in Chromium)
- [ ] Harness run per concept (console, links, axe, overflow, layout shift, no-JS, reduced motion)
- [ ] Visual review per concept, fixes, re-test
- [ ] Fact check against each dossier

## Phase 6–7: packages and index
- [ ] Per business: comparison, verified-vs-placeholder record, QA results, recommendation, outreach email draft
- [ ] Portfolio index `richmond-sprint/index.html`
- [ ] Final report

## Not done by design
- Nothing published, emailed, submitted or purchased (brief forbids it).
