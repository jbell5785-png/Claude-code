# AI visibility test: Richmond v2 prospects

Run on 26 October 2026. The question: what do AI search assistants (ChatGPT search, Google AI Overview, and similar) tell diners about each business today, and what would they tell them if the business adopted our redesigned site?

## What we did
1. **"Today" evidence.** For each business, a researcher captured what the public web shows:
   - six searches (the business's name, its niche such as "afternoon tea near Kew Gardens", its hours and its menu);
   - the current official site;
   - the main third-party listings.

   Files: `<business>/evidence-today.md`, `<business>/baseline-raw.md` (audit record), `<business>/findings.md`.
2. **"With new site" evidence.** The same pack, with the official-site section replaced by the text, structured data and `llms.txt` of our Concept A as it would be deployed on their domain. Search results and third-party pages are unchanged. File: `<business>/evidence-with-new-site.md`.
3. **Blind answers.** Separate fresh AI models each got one pack, and nothing else, and answered 10 real diner questions per business (`<business>/questions.md`). Packs were labelled X/Y at random. The key is `blind-test/label-key.txt`.
4. **Blind scoring.** A separate fact-checker model scored both answer sets against our verified copy decks, without knowing which pack was which. Scale per question:
   - +2 correct;
   - +1 partly correct;
   - 0 didn't know;
   - −2 false or invented.
5. **Real-world check.** The client ran the same searches on Google on a phone in Richmond and captured screenshots. Notes are in `matsuba/real-google-notes.md`.

## Results (blind-scored, out of 20)
| Business | AI with today's web | AI with our new site | What changed |
|---|---|---|---|
| Matsuba | 17 | **20** | Booking terms (card, £10 per person no-show) and the everyday 20% collection discount are now found. Today the AI said there was "no deposit, cancellation or no-show policy" and "no standing takeaway discount". |
| Tide Tables | 16 | **20** | The AI uses the café's own hours wording and phone number instead of a third-party "7:30–18:00", gives the Grotto Gate walk to Hollyhock, and says "not confirmed" on dogs instead of "probably". |
| Maids of Honour (rerun, fair pack) | 10 | **18** | Set-tea prices and contents become readable: High Tea £24.50, the tart £3.50, the Prosecco and Champagne price ladders. Today every tearoom menu is a photo, so the AI fell back on Deliveroo prices and applied the luncheon minimum spend to afternoon tea. |

No answer set made up a fact outright, apart from the Maids "today" set: the rerun scorer counted its luncheon-minimum mistake twice as false.

## Caveats (be straight with owners about these)
- **Small and simulated.** It's one pack per condition, 10 questions and one model run each. It shows the direction of the effect, not a guaranteed size, and it says nothing about *ranking*.
- **Scorer variance.** The same Maids "today" answers scored 16 under the first rubric and 10 under the rerun rubric. The rerun added "applying a rule to the wrong service counts as false". Compare scores only within a row.
- **First Maids run was unfair to the new site.** It removed the online-shop pages, which would stay live. On that unfair pack it was 16 vs 17. Both runs are kept (`score-maids.md`, `score-maids-rerun.md`).
- **"To confirm" markers leak.** Our previews visibly flag unconfirmed facts, and the AI sometimes repeated "the official site marks this to confirm". Once owners confirm the facts, the markers go.
- **Search results not refreshed.** Search snippets in the "with new site" pack still come from today's web. In reality they would update over time, so the real effect could be larger.

## Real Google, today (Matsuba, from the client's phone)
- **No-show policy wrong:** Google says Matsuba "does not enforce a strict no-show or cancellation fee", citing Reddit. The real policy is a card plus £10 per person.
- **Stale prices:** Tuna Tataki £11.90 (actual 14.9); Matsuba Special £31.90 or £32.90 (the site itself shows 32.9 and 33.9). Google's menu panel says it was "acquired from" a **2024** takeaway PDF still on their server.
- **Wrong discount days:** "Tuesday–Thursday and Friday lunch" against "20% off collection every day".
- **Aburi invisible:** for "aburi sushi Richmond", only Sticks'n'Sushi is named (plus a restaurant in Richmond, Canada).
- **Ad on their own name:** a sponsored Deliveroo result sits above Matsuba's own site for "Matsuba Richmond menu".
- **The good news:** Matsuba ranks second for "best Japanese restaurant in Richmond London". AI sees them; it just has the details wrong.
- **Monday opening:** Google says Matsuba is open Mondays, citing their Instagram of 29 Aug 2026 ("MONDAYS ARE NOW FOR MATSUBA"). This needs confirming with the owner, then updating the site's hours.

## What the redesign changes (and what it doesn't)
- **Changes:**
  - one current menu as real text;
  - booking terms and hours in plain words;
  - structured data (Restaurant/Café, Menu with prices, booking and order actions) that matches the visible page;
  - `llms.txt`;
  - old PDFs retired or redirected (to do at launch).
- **Doesn't change on its own:**
  - Google Business Profile;
  - third-party listings (Harden's, OpenTable, Deliveroo);
  - reviews;
  - ads bid on the business's name.

  Those are a separate setup service.
- **Never promise** a ranking position in ChatGPT or Google. The honest claim: "AI will describe you accurately and can find your speciality."
