# Prospect pipeline: from a street to a sent pitch

This turns what we did by hand for Caffè Mamma and Richmond (rounds 1 and 2) into a repeatable process. One run takes a **target area**, for example "independent restaurants and cafés in Richmond", and produces, for each chosen business:
- three personalised website concepts;
- an AI-visibility check;
- a one-page evidence sheet;
- an email drafted in your Gmail.

**You approve at three gates. Nothing is sent without you.**

## Stages

| # | Stage | What it produces | Automated? | Lessons from this session |
|---|---|---|---|---|
| 1 | **Shortlist** | 5–10 candidates with a score: weak website, strong "only-here" character, reachable owner, local | Yes | Prefer places with a physical signature (the washing line, the awning, the bridge arch). Skip chains. Skip sites that only look broken because of bot blocking (Swiss Bread). |
| ⛳ | **Gate 1: you pick 3** | — | **You** | You know the street. Add your own photos and notes here. |
| 2 | **Research** | `identity.md`, `copy-deck.md`, `dossier.md`, `photo-notes.md` | Yes | Check **every** official domain over http and https (we missed Tide Tables' `.co.uk`). Label each fact VERIFIED, REPORTED or LEGEND. Never bypass bot checks. |
| 3 | **Brief** | `brief.md`: three directions, each built on a different only-here detail | Yes | Apply the swap test before building. Ban fonts already used. |
| 4 | **Build** | `concept-a/b/c` | Yes (3 builders in parallel) | Builders self-review with screenshots. Expect long silent writes, which are normal. |
| 5 | **QA** | `tools/qa.sh`: console, links, overflow, layout shift, axe, no-JS, reduced motion | Yes, with automatic fix-ups | Common faults: web-font swap shifting the layout (needs Linux and Android fallbacks), JS that only activates after first paint, header overflow at 390px. |
| 6 | **Structured data** | JSON-LD, `llms.txt` and meta descriptions matching the visible page | Yes | Never encode "to confirm" facts. No Menu block without a real menu. |
| 7 | **AI check** | Today's evidence pack, then a blind test of today against the new site, scored | Yes | Real Google AI screenshots need a human phone (Gate 2). |
| ⛳ | **Gate 2: real Google check** | You run 7 searches on your phone and drop in the screenshots | **You** | Automated Google searching breaks Google's terms, and your phone gives the local, real answer. |
| 8 | **One-pager** | `tools/build_onepagers.py`: the evidence sheet | Yes | Lead with the good news, then claims against facts, then the fixes. |
| 9 | **Publish** | Bannered, noindexed private previews | Yes | Previews stay labelled as concepts and hidden from search engines. |
| 10 | **Email draft** | A Gmail **draft** to the business's published address | Yes (draft only) | One specific finding, links, opt-out line. No prices. |
| ⛳ | **Gate 3: you send** | You read, edit, share the links, and press Send | **You** | |
| 11 | **Follow-up** | A watch for replies; one follow-up draft after 7 days; a log of who opted out | Yes (draft only) | Never chase twice. Honour opt-outs permanently. |

## Why drafts, not automatic sending
- **The law.**
  - UK PECR lets you send unsolicited marketing email to *companies*, as long as you identify yourself and offer an opt-out.
  - Many cafés are **sole traders or partnerships**, who count as *individuals*. They need prior consent, and the pipeline can't reliably tell which is which.
  - A human check per email keeps you on the right side of this. GDPR also applies to any named person.
- **Your Gmail's reputation.** Bulk cold sends from a personal Gmail get flagged as spam quickly, which can damage the account you use for everything else.
- **Quality.** Every pitch so far needed a human touch, such as the Caffè Mamma connection, or an untrue line like "a regular under the bridge" to remove.

If you later want real volume, use a separate domain and mailbox for outreach, plus a proper sending tool. Even then, keep the per-email approval.

## Running it
- **Where:** a Claude Code session on this repo. Run one area at a time, with three businesses per run.
- **Cost and time:** about 2–3 hours per run of 3 businesses × 3 concepts. That's 9 builders plus research, QA and AI-check agents. Builders save their files as they go, so a run can resume if it's ever interrupted.
- **Folder layout per run:** `runs/<area>-<date>/<business>/{research,brief.md,concept-a|b|c,ai-check,one-pager.html,email.md}`
- **Tools:** in `pipeline/tools/`. Set `WORK=<scratch dir>`. QA needs `npm install` in `tools/` (axe-core) and Playwright with Chromium.
- **Stage briefs** (the prompts each agent gets) live in `pipeline/stages/`. They're written from this session's prompts, so a new run doesn't depend on memory.

## Needs from you
1. **Connect Gmail** at https://claude.ai/customize/connectors, then start a new session (connectors load at session start). Drafts only.
2. **Your sender identity:** name, studio name (if any), phone and website. This fills the [brackets] in every email.
3. **The first target area**, for example "Kew Road and Kew Village", "Twickenham riverside" or "St Margarets".
