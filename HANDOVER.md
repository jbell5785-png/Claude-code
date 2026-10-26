# Handover: Richmond restaurant website pitches and the prospect pipeline

**For:** the next Claude Code session. Gmail and Google Drive are connected to the user's account (and were already live in the session that wrote this).
**Written:** 26 October 2026, at the end of the session that did all the work below.
**Read this file first, then `pipeline/PIPELINE.md`.**

## 0. First steps in the new session
1. **Check out the branch.** Everything is on **`ccr-fd625fd5-brxqwe`** in `jbell5785-png/Claude-code`. Run `git fetch origin ccr-fd625fd5-brxqwe && git checkout ccr-fd625fd5-brxqwe`. If the new session gives you a different branch, merge this one in first.
2. **Confirm Gmail is connected** by listing its tools. Use it to **create drafts only. Never send.** The user approves and sends each email (see §6).
3. **Ask the user for anything still missing** (§8): sender details and the first target area.
4. **Expect a different temporary scratch folder.** The old session's scratchpad is gone. Everything needed was copied into the repo, apart from the client's Google Maps photos (§7).

## 1. Who the user is and how they work
- They train insurance staff at large insurance and reinsurance companies. **This project is a side venture:** pitching unsolicited, personalised website redesigns to independent restaurants and cafés in **Richmond, south-west London**, where they live.
- They used to work at **Caffè Mamma** (110 Kew Road), which was the first project.
- **How they review:** on their phone, as a real customer would. They want only a quick check for anything glaring before seeing work, and they're happy for agents to screenshot and check their own work.
- **Their standard:** "personalised, Awwwards-winning level", **not** generic templates. A concept fails if you could swap in another restaurant's name and it would still work (the "swap test").
- **Communication:** short, direct updates. Swearing is fine. They like being told the status of agents.
- **Usage:** they hit the weekly limit once this session, but only because 97% had already gone on another task. A full run fits in a normal week.

## 2. What exists (all in the repo)
| Path | What |
|---|---|
| `README.md`, `research.md`, `brief.md`, `concept-a/b/c/` | **Caffè Mamma**: three concepts. Recommended: C "Bucato", the washing line of shirts as navigation. **Don't modify this project.** |
| `richmond-sprint/` | **Round 1** (Chez Lindsay, Matsuba, Swagat). Well built but judged generic by the user. Kept for reference only. |
| `richmond-sprint-v2/<biz>/` | **Round 2**, the current work: Matsuba, The Original Maids of Honour and Tide Tables Café. Each has `research/` (identity, copy-deck, dossier, photo-notes), `brief.md` and `concept-a/b/c/`, each with its own NOTES.md, structured data and `llms.txt`. |
| `richmond-sprint-v2/_shared/tech-spec-v2.md` | The round 2 build spec: swap test, craft bar, content rules and banned fonts. It builds on `richmond-sprint/_shared/tech-spec.md`. |
| `richmond-sprint-v2/_ai-visibility/` | The AI visibility test. `README.md` holds results and caveats. Per business: today's evidence, the evidence with the new site, findings, real Google notes, `screenshots/` (the user's phone captures) and `one-pager.html`. `blind-test/` holds answers, scores and the label key. |
| `richmond-sprint-v2/_pricing/` | `PRICING-GUIDE.md` (market prices and suggested packages) plus `research/` with sources. |
| `richmond-sprint-v2/_outreach/EMAILS.md` | **Four email drafts**: Caffè Mamma, Matsuba, Maids of Honour and Tide Tables. Not sent. |
| `pipeline/PIPELINE.md` | The plan for automating all of this: 11 stages and 3 human gates. |
| `pipeline/tools/` | QA and publishing tools (see §7). |

## 3. Published previews (claude.ai artifacts)
**They transfer automatically.** Artifacts belong to the user's account, not the session. In the new session, `Artifact` with `action: "list"` shows them all, and `action: "read"` with a URL opens one.
- Every preview is **private**. The user must use **Share** on each before an owner can open it.
- Every preview carries a yellow "Speculative design concept… not the official website" banner and `noindex`. Keep both.

| Business | A | B | C | AI check sheet |
|---|---|---|---|---|
| Caffè Mamma | La Carta: https://claude.ai/artifact/VemRPwVwYPiq1Gf9o7Tqtt | Sera: https://claude.ai/artifact/4dxyaUUBrt5oHcQF5gTh5K | **Bucato** (recommended): https://claude.ai/artifact/32mhWYVm4GGgDWvjutUUwH | not done yet |
| Matsuba | Under the awning: https://claude.ai/artifact/KPqWWb5wVit5WqmiFcXcST | The stepped wall: https://claude.ai/artifact/WriQBfJ8oc4o6ac8da975J | **Aburi** (lead): https://claude.ai/artifact/JKEmoymB3xyJmLqSpZD9Mi | https://claude.ai/artifact/NpJ36rukApJacwE6Z3sHnM |
| Maids of Honour | **Teas** (lead): https://claude.ai/artifact/2y29jngKqaq942mibZQQ6D | A royal secret: https://claude.ai/artifact/BdxckS6mdEbsMf1feUNcaY | The tearoom: https://claude.ai/artifact/JPSgFAFx2Kw5iAhpitja8G | https://claude.ai/artifact/TyWf8Sku8RRCpG1nN77Fn4 |
| Tide Tables | **Under the keystone** (lead): https://claude.ai/artifact/8GewK7Ugbe3ZZQR33h7TJo | Five arches: https://claude.ai/artifact/2H99kDkL9YRA6f8Gd6QWNL | Ride the tide: https://claude.ai/artifact/7YgxyLyU9ztJUooKxTYehH | https://claude.ai/artifact/NEchc9pf5uGXjr6d9p2LCq |

Round 1 previews also exist (Chez Lindsay, Swagat, old Matsuba) but are superseded. Ignore the user's unrelated artifacts (IFRS, A-level, Kraken, AI Video Pipeline).

**Republishing:** use `pipeline/tools/v2pub.sh <biz-dir> <letter> <slug> "<Business>" "<Title>"`, then Artifact publish with the **existing URL** as `url`. Read it first: a publish to an artifact this session hasn't read is refused. The preview build removes the page's own document wrapper, adds the banner, and maps `menu.html`, `css/`, `js/`, `img/` and `llms.txt` as files.

## 4. Key findings to use in pitches
- **Matsuba** (real Google, user's phone):
  - It says there's **no no-show fee**, citing Reddit. The real terms are a card plus £10 per head.
  - It quotes **2024 prices** "acquired from" an old takeaway PDF.
  - It gives the wrong discount days.
  - It's **invisible for "aburi sushi Richmond"**.
  - It ranks **2nd** for "best Japanese restaurant in Richmond".
  - Its Instagram (29 Aug 2026) says "MONDAYS ARE NOW FOR MATSUBA", so Monday opening is likely but still to be confirmed.
- **Maids of Honour:**
  - It ranks **1st** for "afternoon tea near Kew Gardens".
  - Google attaches the **£20 lunch minimum to afternoon tea three times**.
  - Its menus are photos, so Google prices the teas from the gift-voucher shop.
  - Google builds a false founding timeline (Robert, 1860, 1887); the business says Est. 1850.
- **Tide Tables:**
  - It runs **two official sites** (tidetablescafe.com and tidetablescafe.co.uk; the .co.uk works over http only).
  - **No hours are set on its Google profile.**
  - It publishes no menu, so a scraper site writes one.
  - Google says it's "strictly walk-in" and "very dog friendly" from a 2018 Tripadvisor answer.
  - A competitor's ad appears on its name.
  - It ranks 1st for "café by Richmond Bridge".
- **Blind test** (AI answering 10 diner questions, with today's web against the new site in place):

  | Business | Today | New site |
  |---|---|---|
  | Matsuba | 17/20 | 20/20 |
  | Tide Tables | 16/20 | 20/20 |
  | Maids (fair rerun) | 10/20 | 18/20 |

  It's small and simulated, so **never claim rankings**.

## 5. Pricing (from the market research; the user decides)
- **Website:** £2,500–£4,000 bespoke; £1,750–£2,250 founding-client rate in exchange for a case study.
- **"Get found" setup:** £450–£750 one-off.
- **Care:** £40–£50 a month.
- **Care + Google profile management + monthly AI check:** £150–£250 a month.

**Rules for the Google profile add-on:**
- The owner stays the profile **owner**; we're added as **manager**.
- No fake or incentivised reviews (illegal in the UK since April 2025).
- No review gating, and no keyword-stuffing the business name.

## 6. Outreach rules (non-negotiable)
- **Gmail drafts only.** The user reads, edits, shares the artifact links, and sends. Never send automatically.
- **Why:**
  - UK PECR: cold email to companies is fine with sender identity and an opt-out, but sole traders and partnerships count as individuals and need consent. We can't tell which a café is.
  - Bulk cold mail from a personal Gmail risks it being flagged as spam.
  - Every draft has needed a personal touch.
- **Every email:**
  - identifies the sender and ends with the opt-out line;
  - contains no prices;
  - leads with one specific, checkable finding;
  - links the one-pager and the three concepts.
- **One follow-up at most**, after about 7 days, also as a draft. **Keep a log of opt-outs and honour it permanently.**

**Addresses** (all published by the businesses):
- **Caffè Mamma:** contact@caffemamma.co.uk
- **Matsuba:** info@matsuba.co.uk
- **Maids of Honour:** admin@theoriginalmaidsofhonour.co.uk
- **Tide Tables:** contact@tidetablescafe.co.uk or hey@tidetablescafe.com (pick one)

**Before drafting:**
- **Caffè Mamma:** has a [role/memory] placeholder for the user's personal connection, and offers an AI check rather than claiming findings, because **no Google check has been run for it yet**. Ask the user to run the searches on their phone, then add one line.
- **Every draft:** fill the [brackets] with the user's sender details.

**Private flags.** Mention these gently and separately, never as part of the pitch:
- Matsuba's current site loaded an obfuscated script calling `get.whitelllshop.icu` (round 1 finding; re-check first).
- Tide Tables' Press page has the nonsense word "Omisga" inserted.

## 7. Tools (`pipeline/tools/`)
**Setup:** set `WORK=<a scratch dir>` and run `npm install` in `pipeline/tools` (axe-core). Playwright and Chromium are preinstalled in cloud sessions, so `require('playwright')` works.

| Tool | What it does |
|---|---|
| `qa.sh <concept-dir> <port> <label>` | Serves the concept and runs `review.js` at 390/768/1440: console errors, failed requests, links, overflow, layout shift, axe, plus no-JS and reduced-motion screenshots. Also runs `cls.js` (layout-shift sources), a lint for banned words and fonts, and counts "to confirm" markers. Target: everything empty and CLS < 0.1. |
| `v2pub.sh`, `banner_build.py`, `publish_build.py` | Build the bannered preview copy for publishing. |
| `build_onepagers.py` | Builds the AI check sheets. Its data is inline. Its paths point at the old scratchpad and need updating: thumbnails can be regenerated from `_ai-visibility/<biz>/screenshots/`. |
| `extract.js <port> <page>` | Visible text plus JSON-LD of a page, used to build "with new site" evidence packs. |
| `sheet.py`, `thumbs.py`, `qa_table.py`, `shot1.js` | Contact sheets, thumbnails, QA summary table and a single-page screenshot. |

**Common QA faults:**
- Web-font swap moves the layout, because Georgia-only fallbacks don't exist on Linux or Android. Add Liberation, Noto and DejaVu fallbacks, and turn `ch` widths into `em`.
- JS adds a layout class after first paint. Add it in an inline script before paint.
- Header overflow at 390px.
- `aria-label` on a plain `<span>` is prohibited by axe. Use visually hidden text.

**Not transferred:**
- The client's Google Maps photos of the premises (in the old scratchpad, used as drawing references).
- Third-party reference images.

The concepts are already built, so they're only needed for new work. Ask the user to re-send photos for any new business.

## 8. What's next (in order)
1. **Get from the user:**
   - sender name, studio name (if any), phone and website;
   - the first target area for a new pipeline run;
   - whether to create the four Gmail drafts now.
2. **Create the four drafts in Gmail** from `_outreach/EMAILS.md`, with the brackets filled. Remind the user to **Share** each artifact link before sending. **Caffè Mamma:** ask them to run its Google searches first.
3. **Write the stage briefs** in `pipeline/stages/` (still empty): one prompt file per stage, distilled from `tech-spec.md`, `tech-spec-v2.md`, the v2 `brief.md` files and the AI-test method in `_ai-visibility/README.md`.
4. **Fix `build_onepagers.py`** so it's data-driven, with one JSON file per business, and its paths point inside the repo.
5. **Run the pipeline on the first area:**
   - Shortlist about 8 businesses, then **Gate 1** (the user picks 3 and adds photos).
   - Research, brief, build, QA, structured data and the AI test.
   - **Gate 2** (the user runs the phone searches).
   - One-pager, publish, Gmail drafts.
   - **Gate 3** (the user sends).

**Open questions for owners (keep them marked "to confirm" on the sites):**
- **Matsuba:** Monday opening; lunch end time (3pm, 2:45pm or 2:30pm); whether the Lunch & Early Evening set still runs.
- **Maids of Honour:** £20 or £22 luncheon minimum; whether the 2024 menu prices are current; how they describe the family's role.
- **Tide Tables:** dogs; booking policy; which website to keep; the real menu.

## 9. Standing rules from the user's original brief
- **Never fabricate** hours, menu items, prices, awards, reviews, testimonials, staff names or history. Unknowns get a visible "to confirm" marker.
- **No scraping** that breaks a site's terms, no bot-check bypassing, and no automated Google searches.
- **No fake photos** of the real premises, food or staff. Original SVG illustration only.
- **No commitments on the user's behalf.** Don't publish real websites, buy domains, sign up for paid services or contact owners.
- **Previews stay labelled and noindexed.**
- **Git:** commit and push to the branch (a stop hook asks for this). No model names in repo content.
