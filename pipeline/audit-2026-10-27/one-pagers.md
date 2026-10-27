# Audit: Evidence one-pagers (Matsuba, Maids, Tide)

**Verdict:** Needs work · **Readiness:** 4/10

These sheets aren't ready to send. On three rows they mark Google "Wrong" when Google is repeating the business's own website or saying something we can't disprove: the Maids lunch minimum (the lead claim and the email subject), the Maids founding history, and Tide's walk-in policy. The live Maids Set Tea and Our Story pages, checked 27 Oct, say exactly what Google says. On top of that, the score panel misdescribes the test, and two of the three scores are compromised. The design is also a generic, identical template with no call to action, cropped evidence and a broken print layout. Most fixes are small; together they're about a day's work.

| Lens | Raw findings | Impress owner | Craft | Usefulness | Accuracy |
|---|---|---|---|---|---|
| sheet | 41 | 4 | 5 | 6 | 4 |

## Strengths to keep

- The table format ('What Google said / What you publish / Verdict') is right for an owner: they grasp it in seconds, and the chips read clearly in light and dark mode.
- Matsuba's core evidence is strong and checkable: the no-show answer citing an unrelated Reddit thread, Tuna Tataki at £11.90 against 14.9, the menu panel 'acquired from' a 2024 PDF still on their server, and the wrong discount days. All are confirmed in the screenshots and copy deck.
- Each sheet opens with a verified positive (Matsuba 2nd for best Japanese, Maids 1st near Kew Gardens, Tide 1st by Richmond Bridge and 2nd for Sunday brunch). That sets a helpful rather than accusatory tone.
- The caveats are honest: 'small, simulated … not where you would rank … no one can guarantee a position', plus 'Not commissioned by …'.
- The copy is plain and the layout stacks cleanly on a phone: no horizontal scroll at 390px, readable body text, and dark mode that works.
- The Google-profile column is useful, and with tightening and an offer it gives the owner a strong reason to reply.
- Real phone screenshots make the evidence credible; they only need cropping.

## Verified findings (ranked)

### [BLOCKER · small] The Maids lead 'Wrong' (lunch minimum on afternoon tea) is contradicted by the tearoom's own Set Tea page

*Lens:* sheet · *Verifier:* confirmed

**Evidence.** The live theoriginalmaidsofhonour.co.uk/pages/set-tea-booking (fetched 27 Oct 2026, saved in verify/live/) says: 'for both bookings and walk-ins from 12:00 till 15:00 there is a minimum spend of £20 per person plus 12.5% service charge, to be shared by staff'. That is word for word the same as the Luncheon page. Google's answer (2ae0e6e0) even keeps '(for both bookings and walk-ins)' and cites 'The Original Maids … +1'. The sheet still says 'That minimum belongs to Luncheon', with Google's quote struck through and marked WRONG. The email subject, 'Why it happens' bullet 2 and the score sentence repeat the claim. The answer appears in two screenshots, not three. Every set tea is £24.50 or more per person, so the 'puts a family off' line is weak too.

**Fix.** Change the verdict to 'From your own page' (or 'Unclear') and remove the strikethrough. In 'What you publish', write: 'Your Set Tea page and Luncheon page both say this; the printed luncheon menu says £22. If it's meant only for lunch, the new site will say so under Luncheon only.' Rewrite 'Why it happens' bullet 2. Replace the email subject with a true one, e.g. 'Google is pricing your afternoon teas from the gift-voucher shop', and delete 'That's your luncheon rule'.

### [BLOCKER · small] The Maids founding row marks Google 'Wrong', but Google is repeating the business's own Our Story page

*Lens:* sheet · *Verifier:* confirmed

**Evidence.** The live /pages/our-story says: 'In 1850 Robert Newens continued the tradition … and in 1860 moved his shop to Kew where it can still be found to this day. The current family owners have maintained this tradition.' So Google's 1850 (Robert) and 1860 come from the owner's own page; only 1887 comes from the Council. The sheet strikes the timeline through, marks it WRONG and quotes only the History page (Alfred, 1850). That contradicts the sheet's own 'Why it happens' bullet ('Three founding dates … appear across your site'), and copy-deck.md:115 says not to choose between the dates. The email's 'instead of your Est. 1850' is wrong too, because Google gives 1850 as the founding year.

**Fix.** Change the verdict to 'Mixed' and remove the strikethrough. In 'What you publish', write: 'History page: Alfred, 1850, Kew Road. Our Story page: Robert, 1850, moved to Kew 1860. Council: Kew Road from 1887. Google joined your two pages with the Council's date.' Rewrite the email line as 'your own history pages tell two different stories, and Google stitches them together'.

### [BLOCKER · small] Tide 'Can I book? WRONG' is unsupported, and the research leans the other way

*Lens:* sheet · *Verifier:* partly

**Evidence.** The sheet strikes through 'Operates strictly on a walk-in basis' and sets it against party bookings by phone, which are not table bookings. The dossier (dossier.md:100) says 'Walk-in-only status: UNKNOWN [TO CONFIRM]', and that is also copy-deck TO CONFIRM item 8. real-google-notes calls Google's claim 'unverified'. Our own evidence pack quotes Country & Town House saying 'Walk-ins only. Find out more via tidetablescafe.co.uk' (evidence-today.md:295). One correction to the auditor: the citation reads 'DAISY | GREEN +1' and a Tide Tables card is among the sources (6ea13d67, ab3e3268), so 'the only source is a competitor' overstates it. The email repeats the walk-in claim as an error.

**Fix.** Change the verdict to 'Unconfirmed: is this right?' and remove the strikethrough. In 'What you publish', write: 'Nothing about table bookings; parties by phone on 07922 474327.' In the email, turn it into a question or drop it.

### [MAJOR · small] The Maids 10/20 → 18/20 score rests on the same incorrect lunch-minimum ruling

*Lens:* sheet · *Verifier:* confirmed

**Evidence.** In score-maids-rerun.md, set P (today) got −2 on Q4 and −2 on Q10 for applying 'the Luncheon minimum … to set tea'. The Set Tea page actually says that (see B1). Scored fairly, P comes to about 17. The first rubric already gave it 16 (score-maids.md), and the README says to be straight about scorer variance. The panel sentence 'applied the lunch minimum to afternoon tea' repeats B1.

**Fix.** Drop the Maids number. Use the result that holds up instead: 'With today's web the AI couldn't find your set-tea prices and fell back on Deliveroo; with the new site it quoted High Tea £24.50, the £3.50 tart and the Prosecco/Champagne prices.' Alternatively, re-score and show both rubrics.

### [MAJOR · small] Tide's 'You don't publish a menu, so a stranger's site is writing it' overstates the case and is undercut by its own screenshot

*Lens:* sheet · *Verifier:* partly

**Evidence.** Embedded image 2 lists vegetable lasagne, bean chilli with brown rice, jacket potatoes, a salad bar and Popina tarts. Those are five of the café's six published dishes (copy-deck §6), and the answer cites 'Tide Tables Cafe +3'. Google's menu panel (4730ee91) says 'Acquired from Business website' with 'Full menu: tidetablescafe.co.uk/'. Only items like Cornish pasties and macaroni cheese trace to the hey-restaurants scraper, and those may even be right. The 'Guessed' verdict and 'largely from a third-party site' are defensible. 'A stranger's site is writing it', 'invent' and the email's 'repeats it as fact' are not. Downgraded from blocker.

**Fix.** In 'What you publish', write: 'Six dishes on your .com homepage; no full menu or prices.' For Google, write: 'Mixes your dishes with a copycat site's list (Cornish pasties, macaroni cheese…).' Change the verdict to 'Mixed: are these right?'. Swap evidence image 2 for a crop of 4730ee91 or 321f0079 that shows the hey-restaurants result, and drop 'invent'.

### [MAJOR · small] The Tide 16/20 → 20/20 score was measured against hours the sheet itself now contradicts

*Lens:* sheet · *Verifier:* confirmed

**Evidence.** The today pack had tidetablescafe.co.uk as HTTP 503 (evidence-today.md:312). score-tide.md marks today down on Q2 and Q10 for using 7:30-type times and rewards the new site's 'daylight hours, call'. Yet the café's own .co.uk Contact page gives Mon–Fri 7:30am, Sat–Sun 7am till dusk, and the sheet's hours row now quotes that. Q3 even praises both answer sets for calling the .co.uk 'stale'. The panel's 'used your own wording' means 'daylight hours', while the table leads with 7:30am.

**Fix.** Remove the Tide score. Alternatively, re-run it (medium effort) with the .co.uk pages in the today pack and the updated copy deck in the new-site pack. If you keep it, keep only the Grotto Gate and dogs points.

### [MAJOR · small] The email drafts overstate or contradict their own evidence sheets

*Lens:* sheet · *Verifier:* confirmed

**Evidence.** (1) The Tide subject, 'Google can't find your opening hours', is contradicted by the Tide sheet's first image, where Google gives Mon–Fri 7:30am … until dusk from the café's Contact page. (2) The Matsuba email says 'far more often', but the score moved 17 → 20, with three questions going from 1 to 2 and useful answers 10/10 in both sets. (3) The Tide email attributes both 'strictly walk-in' and 'very dog friendly' to a 2018 Tripadvisor answer; the walk-in claim came from Daisy Green +1. (4) The Maids email puts the founding history under 'because your menus are photos'. Its subject and the Est. 1850 line are covered by B1 and B2. Sub-point (5), 'Richmond' vs 'Richmond London', is trivial and refuted.

**Fix.** Tide subject: 'Google is guessing your menu, dog policy and hours'. Matsuba: 'with the new site, the AI got your no-show charge and everyday collection discount right'. Correct or drop the walk-in attribution. Move the Maids history point out of the photo-menu sentence.

### [MAJOR · small] The Matsuba Special row calls a normal dine-in vs takeaway price difference 'your own pages disagree'

*Lens:* sheet · *Verifier:* confirmed

**Evidence.** The '33.9 on the bento card' is the 2026 TA10 takeaway PDF (copy-deck.md:485), which runs £1 above dine-in across the board (Sashimi 28.9/29.9, V Special 29.9/30.9). Google's AI answer of £32.90 matches the current dine-in menu. Only the menu panel's £31.90, from the 2024 TA8 PDF, is stale. The owner will read the row as a misreading of their own menu.

**Fix.** For Google, write: '£31.90 in Google's menu panel, acquired from your 2024 TA8 takeaway PDF'. For 'What you publish', write: '£32.90 dine-in, £33.90 takeaway (2026)'. Drop '£32.90 in the AI answer' or mark it right.

### [MAJOR · small] The score panel describes a search test that didn't happen

*Lens:* sheet · *Verifier:* partly

**Evidence.** The panel says 'I asked AI search tools … once with today's web and once with the new website in place'. Per README steps 1–4, AI models were given text packs, the new site was simulated by swapping one section of the pack, and another model did the scoring. No search tool was used and no site was in place. The 'small, simulated' line partly offsets this but contradicts the main sentence. 'Read today's web: … Read the new site: …' also reads like an instruction.

**Fix.** Use: 'I gave an AI assistant two versions of what the web says about you, today's and today's with the new site's text in place of your current site, asked the same ten customer questions, and checked every answer against your published facts. With today's web it missed …; with the new site it got … right.' Keep the caveat beside the numbers.

### [MAJOR · medium] Evidence images hide their proof on desktop, are cut or unreadable on phones, and show Joseph's personal phone (merges M4 and m13)

*Lens:* sheet · *Verifier:* partly

**Evidence.** At 1280 px each image renders 307×420 from a 420×928 source, so only the top ~62% shows. I drew the crop line on each (verify/emb/*-strip.png). Three of the nine images lose their proof, not all of them: Matsuba #3 (the 2024/09/MATSUBA-TA8-brown.pdf line is below the crop), Maids #1 (the '£20 minimum' line is cut) and Maids #3 (the price list is cut). The Tide images are fine. At 390 px the third image is display:none and the other two render 153 px wide, so phone text is about 5–6 CSS px. Every image keeps the Android status bar (Snapchat, WhatsApp, Reddit icons, 19–23% battery, 144Hz), and Tide #3 shows the 'J' avatar.

**Fix.** Pre-crop each image to the band that holds the claim, removing the status bar and browser chrome, and box the key line. On phones, stack all three images full width and keep the third. Link each to the full screenshot.

### [MAJOR · medium] Generic report template, identical for all three businesses, with no Joseph Bell identity

*Lens:* sheet · *Verifier:* partly

**Evidence.** The CSS is byte-identical across the three files (same md5): IBM Plex Sans/Mono with Newsreader, a grey page, a white card, an uppercase eyebrow and the same headline formula. Looking at the screenshots myself, it is clean and readable in light and dark, but it reads as a stock audit report. It is the owner's first look at Joseph's design work, and nothing ties it to the business or the lead concept. The user explicitly asked for no generic fonts or layouts. I'm redirecting the auditor's fix: a full per-business re-skin isn't needed for an evidence document.

**Fix.** Give the sheets a recognisable Joseph Bell house style: a small wordmark and a less default type pairing. Add one business-specific accent (a colour from the lead concept) and a thumbnail of the lead concept that links to it. Keep the table structure.

### [MAJOR · small] No links and no call to action; contact details are untappable grey small print

*Lens:* sheet · *Verifier:* confirmed

**Evidence.** There are zero <a> elements on all three sheets. The phone and email sit in a 12.5px muted footer. There are no concept links and no next step. The 'Your Google profile' list is a free DIY list, while EMAILS.md treats the profile work as a paid add-on.

**Fix.** Add a closing block with links to the three concepts, tel: and mailto: links at body size, and the line 'I can make the Google profile changes as part of the build.'

### [MAJOR · small] The raw files break if self-hosted as EMAILS.md plans: no doctype, charset, viewport or lang

*Lens:* sheet · *Verifier:* confirmed

**Evidence.** Served raw at 390 px: compatMode=BackCompat, innerWidth=980 (the desktop layout zoomed out), characterSet=windows-1252, and text shows as mojibake ('Â£20', 'Googleâ€™s', 'â†’'). Screenshot: verify/shots/*-raw390.png. The files start at <title>. The published artifact is wrapped and renders fine today.

**Fix.** Add <!doctype html><html lang="en-GB"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">. Remove the claude:viewport-fit-sides meta and the layout comment.

### [MAJOR · medium] The 'one page' prints as 3 A4 pages, with orphaned headings and overlapping text on Tide

*Lens:* sheet · *Verifier:* confirmed

**Evidence.** Every sheet prints to 3 pages. On page 1, 'Why it happens' and 'What the new website fixes' are orphaned at the bottom. Page 2 ends on 'The evidence' with nothing under it, and the images fall onto page 3. On Tide page 2, the 'Your Google profile' heading is printed over the last 'Why it happens' bullet (verify/shots/tidep2-top.png). The email says the evidence is 'on one page'.

**Fix.** Add @media print rules: break-inside:avoid on sections, li, figures and .cols children; break-after:avoid on h2; smaller type; images about 45mm wide. Aim for 1–2 clean pages.

### [MINOR · small] The footer cites 'published menus' on every sheet, including Tide, which says the café publishes no menu

*Lens:* sheet · *Verifier:* confirmed

**Evidence.** The template footer line, 'Facts are taken from your own website and published menus', is unchanged on all three sheets. Downgraded from major.

**Fix.** Write one footer line per business. For Tide: 'Facts are taken from tidetablescafe.com and tidetablescafe.co.uk.'

### [MINOR · small] All three sheet links are still private claude.ai artifacts

*Lens:* sheet · *Verifier:* confirmed

**Evidence.** An Artifact read of NpJ36rukApJacwE6Z3sHnM reports 'owned by you, private'. EMAILS.md already lists sharing as a pre-send step, but owners can't open the links today, and the claude.ai address shows the tool used.

**Fix.** Self-host after M14, or share each link and test it in a private window on a phone before sending.

### [MINOR · small] The aburi row and its fix bullets imply the site will get Matsuba recommended for 'aburi sushi Richmond'

*Lens:* sheet · *Verifier:* partly

**Evidence.** The menu is already HTML text, and the blind test scored both sets 2/2 on aburi dishes (score-matsuba Q6). Being named for that search is a ranking outcome. The small-print caveat softens the implication. 'Speciality' is our framing; Matsuba's stated signature is the Tuna Tataki.

**Fix.** Present it as an observation: 'Google currently names only Sticks'n'Sushi; the new site makes aburi a headline dish, though no one can guarantee being recommended.'

### [MINOR · small] The Maids 'fixes' wording could read as correcting a heritage business

*Lens:* sheet · *Verifier:* partly

**Evidence.** 'Est. 1850 (our own date)' sounds like doubt, and the ownership remark is sensitive in a cold pitch. Labelling the Henry VIII story as legend is fine, because the business's own homepage says 'Legend has it'.

**Fix.** Use 'One clear history line that matches your Google profile' and 'the Henry VIII story told as the tradition it is'. Raise ownership in person, not on the sheet.

### [MINOR · small] The strikethrough makes the key quotes hard to read and also strikes Joseph's own notes and the label

*Lens:* sheet · *Verifier:* confirmed

**Evidence.** The struck 13px monospace quote is the least legible text on the page. The line also crosses '(source: Reddit)' and 'given three times…', and at 390px it strikes the 'GOOGLE'S AI SAID' label (seen in the Maids m390 render).

**Fix.** Drop the line-through. Use a red left rule or chip instead, and put the source in a separate span.

### [MINOR · small] Some Maids Google-profile advice is already done or unsupported

*Lens:* sheet · *Verifier:* confirmed

**Evidence.** The profile already shows 'Tea room' (e41df021, da3a88b7). Nothing in the evidence shows that reviews go unanswered.

**Fix.** Use 'Add Bakery as a second category'. Drop the reviews bullet, or base it on evidence.

### [MINOR · small] 'Given three times' is shown only twice in the screenshots

*Lens:* sheet · *Verifier:* confirmed

**Evidence.** Only 2ae0e6e0 and e41df021 attach the £20 minimum to tea; the notes' third instance is our own blind-test AI. This becomes moot once B1 is fixed.

**Fix.** Say 'twice', or remove the phrase as part of the B1 rewrite.

### [MINOR · small] The Matsuba discount row claims the discount applies to Toast online orders, which isn't evidenced

*Lens:* sheet · *Verifier:* confirmed

**Evidence.** TA10 says only '20% OFF COLLECTION ONLY EVERYDAY Kids Menu not included'. Google's 'phone or in person' isn't shown to be wrong.

**Fix.** Keep the days as the error and drop 'ordered online through Toast'.

### [MINOR · small] The Hollyhock walk is marked Right with 'What you publish: Correct', but the café doesn't publish it

*Lens:* sheet · *Verifier:* confirmed

**Evidence.** The route comes from the thamespath blog (copy deck §8 [S7]) and is TO CONFIRM item 13. The row also merges two questions.

**Fix.** Split the row. Mark the walk 'Plausible (2017 blog): still the route?'

### [MINOR · small] Tide's Google-profile list includes a website decision that is still to confirm

*Lens:* sheet · *Verifier:* partly

**Evidence.** 'Retire or redirect the second website' is not a profile task, and which site is primary is TO CONFIRM item 22. The dogs attribute bullet is acceptable as written.

**Fix.** Move it to 'What the new website fixes' and phrase it as a question about which site they want to keep.

### [MINOR · small] The verdict column is clipped between about 641 and 700 px

*Lens:* sheet · *Verifier:* confirmed

**Evidence.** Matsuba's .tablewrap measures scrollWidth/clientWidth 641/573 at 660px and 641/610 at 700px. The chips read 'WRO' and 'OUT' with no scroll cue (verify/shots/matsuba-w660-table.png).

**Fix.** Raise the stacked-card breakpoint to about 760px, or drop the min-widths on td.said and td.truth.

### [MINOR · small] Unexplained 'structured data' jargon on Tide and Maids

*Lens:* sheet · *Verifier:* confirmed

**Evidence.** Tide says 'Structured data that matches the page' and Maids says 'Structured data and booking links for each service'. Only Matsuba's version has a gloss.

**Fix.** Use 'Behind-the-scenes labels that tell Google your hours, menu and prices'.

### [POLISH · small] Ad bullets are filed under 'Why it happens' although ads don't cause the AI errors

*Lens:* sheet · *Verifier:* partly

**Evidence.** Matsuba's sponsored Deliveroo ad (adcc65ed) promotes Matsuba's own Deliveroo listing; the sheet's wording is accurate. This is a filing issue only.

**Fix.** Move ads to a line reading 'Also seen: paid results above your name (not fixed by a website)'.

### [POLISH · small] 'Correct today' asserts set-tea prices whose currency is still to confirm

*Lens:* sheet · *Verifier:* partly

**Evidence.** The copy deck asks whether the 2024 menu prices are current. 'Correct today' also sits awkwardly beside the 'Mixed' chip.

**Fix.** Use 'Matches your 2024 menu, but read from the gift-voucher shop'.

### [POLISH · small] The no-show paraphrase could be exact and could sharpen the Reddit point

*Lens:* sheet · *Verifier:* partly

**Evidence.** The paraphrase is fair in substance. The published wording is 'we reserve the right to charge £10 per person'. The Reddit source is an unrelated thread (e17397ff).

**Fix.** Quote the wording exactly and add 'citing an unrelated Reddit thread'.

### [POLISH · small] The table columns mix verbatim quotes, paraphrase and bare 'Correct'

*Lens:* sheet · *Verifier:* confirmed

**Evidence.** Several 'What you publish' cells just say 'Correct', and paraphrase is set in the same monospace style as verbatim quotes.

**Fix.** Put the real value in each cell and keep monospace for verbatim quotes only.

### [POLISH · small] 'Old 2024 takeaway PDFs' is plural, but only TA8 is evidenced

*Lens:* sheet · *Verifier:* partly

**Evidence.** Only TA8-brown is evidenced. The 2024 vegan and GF PDFs are also stale (copy deck item 3), so replacing them is right, but the wording should say so.

**Fix.** Say 'the old 2024 TA8 takeaway PDF', and say the vegan and GF menus become text pages.

### [POLISH · small] A quoted phrase has its spelling altered

*Lens:* sheet · *Verifier:* confirmed

**Evidence.** Google wrote 'Classy, independent neighborhood favorite' (fc3a2456); the sheet quotes 'neighbourhood favourite'.

**Fix.** Quote verbatim, or drop the quotation marks.

### [POLISH · small] Price formats are mixed

*Lens:* sheet · *Verifier:* confirmed

**Evidence.** '£11.90' sits next to '14.9', and '32.9/33.9' next to '£31.90'.

**Fix.** Use £14.90, £32.90 and so on throughout.

### [POLISH · small] Mobile chip order and caption alignment

*Lens:* sheet · *Verifier:* confirmed

**Evidence.** At 390px the verdict chip comes last in each card, and the two figure captions misalign (seen in the Matsuba m390 render).

**Fix.** Put the chip beside the question on mobile and top-align the captions.

### [POLISH · small] Alt text duplicates the captions

*Lens:* sheet · *Verifier:* confirmed

**Evidence.** Each alt equals its figcaption, so the image content is never described.

**Fix.** Use alt text that carries the content, e.g. 'Google AI answer listing Tuna Tataki at £11.90'.

### [POLISH · small] Gmail address on a web designer's pitch

*Lens:* sheet · *Verifier:* partly

**Evidence.** jbell5785@gmail.com. This is acceptable until josephbell.co.uk is live.

**Fix.** Switch to a domain address once the domain is live.

## Refuted by the verifier

- **Tide 'second for Sunday brunch' is only from the map pack**: In the AI Mode answer to 'riverside café in Richmond for Sunday brunch' (5d53746a), Tide Tables Cafe (4.3, 1.3K) is the second place card, after Peggy Jean. The sheet says 'Google shows … second', which is accurate, and '1,300' is a fair rendering of 1.3K.
- **The Matsuba Monday row leaves out the Tue–Fri card**: The row is already 'Mixed' with 'please confirm', and it correctly says Google's 'Yes' comes from the owner's own channels. Mentioning the Lunch & Early Evening card would be an optional improvement, not a defect.
- **'A competitor's ad' is inferred, not shown**: An unidentified advertiser selling a 'Proper Full English Fry-Up' above a vegetarian café's own menu search is competing for that search. The label is reasonable and doesn't harm the pitch.
- **Matsuba email says 'Richmond', the sheet says 'Richmond London'**: Trivial difference with no effect on accuracy. The rest of M10 is confirmed.
- **Mobile images and personal phone chrome**: Not refuted: both are real and merged into M3.
