# Audit: All 12 concepts · sameness and originality

**Verdict:** Needs work · **Readiness:** 5/10

The 12 sites work technically. Across 48 captures there were no console errors and no broken links, and no-JS and reduced-motion runs are complete. The heroes are mostly bespoke. They are not ready to send: within Maids, Tide and Matsuba the three concepts share word-for-word Today, Visit and taster blocks (Matsuba A and B even share their H1), Matsuba A and C clip text at 360 px, the Caffè Mamma fonts are generic, and voice-rule breaches and Mamma's 17-22 chips per page remain.

| Lens | Raw findings | Impress owner | Craft | Usefulness | Accuracy |
|---|---|---|---|---|---|
| cross | 27 | 4 | 6 | 7 | 6 |

## Strengths to keep

- Functionally clean: across 48 captures (24 pages at 390 and 1280) there were no console errors and no failed requests; every internal link and anchor resolves on all 24 pages; there is no overflow at 390 or 1280; no-JS and reduced-motion runs show all essentials with no hidden text.
- The Useful-first essentials really are on the first phone screen on all 12: today's status, address with directions, Book and Menu, and phone.
- The heroes come from real details: Mamma C's washing-line navigation and Mamma A's 'Il foglio del giorno'; Matsuba B's stepped slat wall and Matsuba C's 3-second sear that rests; Maids B's tart, iron box and oven timer, and Maids C's three-tier stand; Tide B's copperplate bridge with arch navigation (the least template-like concept), Tide A's arch, and Tide C's hire-board.
- The menus are typeset in HTML with real prices; the Tide sample menus carry honest banners, and every site has an honesty footer.
- Sourcing is careful: TO CONFIRM where sources conflict (the Maids founding date), the restaurants' own allergen statements quoted verbatim, and real booking platforms linked (ResDiary, Favourite Table, OpenTable, Toast).

## Verified findings (ranked)

### [BLOCKER · medium] Matsuba A and B open with the same eyebrow, H1, status line, buttons, skip link and paragraph; the Visit block and 'Book your table today!' closer are shared by all three

*Lens:* cross · *Verifier:* confirmed

**Evidence.** At 390 and 1280, A and B both read 'JAPANESE RESTAURANT · RICHMOND / Pull up a chair. Take a taste. Come join us. / Open now · Today 12pm–3pm TO CONFIRM, 5pm–10pm / 10 Red Lion St… Directions / BOOK A TABLE · MENU / SKIP TO VISIT INFO'. The Visit H2 'Hours, address, booking' appears in A and B, and the Visit paragraphs are identical in A, B and C. The email links all three as 'three website ideas'. Sheets: /tmp/claude-0/-home-user-Claude-code/e50707d5-9ec5-571e-9915-9e7145ebe50f/scratchpad/audit/cross-site/verify/sheets/matsuba-first-390.png and /tmp/claude-0/-home-user-Claude-code/e50707d5-9ec5-571e-9915-9e7145ebe50f/scratchpad/audit/cross-site/verify/sheets/matsuba-first-1280.png

**Fix.** Keep the 'Pull up a chair' H1 for B only, and write A's H1 from its awnings or long-room idea, with the status lit inside the drawn window. In B, set the status and address on a brass plate on the slat wall rather than the white card. Give A and B their own Visit form (C's '• FIND US •' print grammar is the model), and write a distinct booking closer for each.

### [BLOCKER · small] Matsuba A and C clip text at 360px; A clips its header and bar at 320; Maids A and Tide B overflow by 5px at 320

*Lens:* cross · *Verifier:* confirmed

**Evidence.** scrollWidth/clientWidth at 360 is 376/360 for A and 364/360 for C. In A the Tue–Fri TO CONFIRM chip is cut and the booking text runs to the edge. In C the chip is clipped and the booking text loses 'when', 'per' and '24'. At 320, A is 375 wide ('OF' for ORDER, Call cell cut), B is 355 and C is 363. Correction: the NOTES only claim no overflow at 390/768/1440; QA never tested 360 or 320. Sheet: /tmp/claude-0/-home-user-Claude-code/e50707d5-9ec5-571e-9915-9e7145ebe50f/scratchpad/audit/cross-site/verify/sheets/matsuba-narrow.png

**Fix.** Set the hours grid to grid-template-columns: auto minmax(0,1fr), remove nowrap from the time span and make the chip inline-block so it wraps. Add overflow-wrap: anywhere to the booking paragraphs. Give the bar cells flex: 1 1 0 and min-width: 0. Fix Maids A .front__story and the Tide B masthead and arch-nav at 320. Add 360 and 320 to the qa.sh viewports and assert scrollWidth equals clientWidth.

### [MAJOR · large] Maids A, B and C share the same Today card text, Visit block, six-dish taster, footnote and skip-link pair, and all three desktop heroes use the same text-left/illustration-right split

*Lens:* cross · *Verifier:* confirmed

**Evidence.** Visit text is near-identical (four service rows, each with a Book button, two bullets, then 'Finding us'). The taster has the same six dishes in the same order with the same '2024 menus… V: vegetarian…' footnote. 'Skip past the sign/iron box/stand · Skip to visit info' appears in all three. The skins differ (green/gold, velvet, blue-and-white). Sheets: /tmp/claude-0/-home-user-Claude-code/e50707d5-9ec5-571e-9915-9e7145ebe50f/scratchpad/audit/cross-site/verify/sheets/maids-s2.png and /tmp/claude-0/-home-user-Claude-code/e50707d5-9ec5-571e-9915-9e7145ebe50f/scratchpad/audit/cross-site/verify/sheets/maids-first-1280.png

**Fix.** Keep the facts and redraw the forms. A: a painted fascia board with one line per service and gilt Book plaques. B: hours on the oval label or ribbon, with a single-object taster (tart £3.50/£2.25, box of 6, one set tea). C: a printed tea card in the transfer-print rim, with services as 'sittings', and drop C's separate taster because the stand already is one. Change the desktop hero grid in B and C.

### [MAJOR · large] Tide A, B and C share a word-for-word Today card with the same three buttons, the same Visit block and H2, and the same bar labels; A and C share the identical dark bar

*Lens:* cross · *Verifier:* confirmed

**Evidence.** All three first screens: 'TODAY, TUESDAY / Open from 7:30am · food and drink from 8am · until dusk / Under Richmond Bridge, on the riverside / Call · Find us · Menu sample'. A diff of A vs C Visit text shows only casing and one extra 'By boat' line. The A and C bars are both rgb(20,19,18) at 64px. Sheets: /tmp/claude-0/-home-user-Claude-code/e50707d5-9ec5-571e-9915-9e7145ebe50f/scratchpad/audit/cross-site/verify/sheets/tide-first-390.png and /tmp/claude-0/-home-user-Claude-code/e50707d5-9ec5-571e-9915-9e7145ebe50f/scratchpad/audit/cross-site/verify/sheets/bars.png

**Fix.** A: chalk the hours and directions on the vault's boards. B: set Visit as an engraved 'Particulars' plate under the elevation. C: set Visit in its own hire-board grammar ('HIGH WATER · LEAVE BEFORE H.W.'). Re-colour the Tide C bar (river blue, board type).

### [MAJOR · medium] All six Caffè Mamma fonts are generic, fashionable picks (Bricolage Grotesque, Instrument Sans, Hanken Grotesk especially); the lint claim and the proposed replacements are wrong

*Lens:* cross · *Verifier:* partly

**Evidence.** Loaded fonts: A Young Serif + Instrument Sans; B Italiana + Hanken Grotesk; C Bricolage Grotesque (127px/800 hero) + Atkinson Hyperlegible. The qa.sh regex is the round-2 no-reuse list from tech-spec-v2.md, not an AI-default list, and Mamma A NOTES line 45 documents why it trips. The auditor's replacements (Gilda Display, Big Shoulders Display, Public Sans) are banned by tech-spec-v2.md line 29.

**Fix.** Retype using families that are unused in the set and not banned. A: Sorts Mill Goudy or Libre Bodoni for display, with Schibsted Grotesk for figures. B: Bellefair or Linden Hill (display sizes only) with Commissioner. C: Anybody or Sofia Sans Extra Condensed for display, with Red Hat Text. Recompute the metric-adjusted fallbacks and update the brief.md type table.

### [MAJOR · medium] Tide A's Today card stays pinned over the whole arch walk and covers its payoff

*Lens:* cross · *Verifier:* confirmed

**Evidence.** At 1280 (scroll 600–1500) the dark card sits fixed at the left over the tables, with a second caption box on the right. At 390 (scroll 600–900) it covers the far door and garden view. Sheets: /tmp/claude-0/-home-user-Claude-code/e50707d5-9ec5-571e-9915-9e7145ebe50f/scratchpad/audit/cross-site/verify/sheets/tideA-walk-d.png and /tmp/claude-0/-home-user-Claude-code/e50707d5-9ec5-571e-9915-9e7145ebe50f/scratchpad/audit/cross-site/verify/sheets/tideA-walk-m.png

**Fix.** Take the Today info out of the pinned layer and draw it as a chalk A-board in the hero that scrolls away before the pin. The bottom bar already carries Call, Find us and Menu.

### [MAJOR · small] Voice-rule breaches remain after the clean-up: 'not published' rows, rubric headings, interaction instructions, and Tide C's 'DRAWN TIDE, ILLUSTRATIVE' and 'NOT TO SCALE' captions

*Lens:* cross · *Verifier:* confirmed

**Evidence.** Tide A and C show 'Parking: not published. TO CONFIRM' and 'Step-free access: not published.'; Tide B shows 'Not published.' three times. The headings 'The menus, priced.' (Maids B), 'From the menus, priced.' (Maids C) and 'Hours, address, booking' (Matsuba A, B). Maids A has 'The gilded line is being served now. Tap a line for its menu, or a plate to book.' plus a 'Read the sign at another time' slider. New: Tide C's first text is 'DRAWN TIDE, ILLUSTRATIVE / Gates down: held at half-tide or above', and its map says 'NOT TO SCALE' and 'Not to scale. Route TO CONFIRM'. §(d) of information-hierarchy.md bans exactly these.

**Fix.** Use 'Parking: ask us when you call' or drop the rows. Rename the headings ('From the menus', 'Find us'). Cut the Maids A instruction sentence and hide the slider behind a presenter URL parameter. Replace the Tide C caption with a diner line ('Today's tide times: PLA ↗') and drop 'not to scale'.

### [MAJOR · small] Too many 'to confirm' chips on Caffè Mamma (17–22 per page, 3–5 on the first phone screen); some chips render at 8.8–9.9px

*Lens:* cross · *Verifier:* partly

**Evidence.** Measured .tbc counts per page: Mamma A 22/21, B 20/21, C 17/20, with 4 on Mamma A's first screen (header hours, 'since 1983', 'Open today', 'Last orders'). The v2 concepts have 1–11 per page and 0–2 on screen 1, which is acceptable. The dashed 1px chip is shared by 7 concepts; minimum sizes are Tide B menu 8.8px, Maids C/Tide B 9.9px and Matsuba A 9.28px. Correction: flagging 1850 for Maids is justified (sources give 1850/1860/1868/1887); flagging Mamma's 1983 is weaker, because the restaurant's own About page states it.

**Fix.** On Mamma, use one quiet mark per concept (a red-pen asterisk on A, a hangtag on C) and one '* to check with you' footnote per page. Remove chips from hero lines and from the restaurant's own claims (1983). Set an 11px minimum chip size everywhere.

### [MINOR · small] Hero 'Skip to visit info' links skip less than one screen, and all three Maids concepts repeat one that jumps about 1,400px backwards

*Lens:* cross · *Verifier:* confirmed

**Evidence.** At 390, link-to-target distances are Matsuba B 527→630, Matsuba A 561→725 and Maids A 521→721. The second Maids links sit at y≈2160–2245 and jump to Visit at about 720–800.

**Fix.** Delete skip links whose target is less than a screen away, and the backward Maids links. Keep the one before Tide A's pinned walk, worded 'Skip the walk: hours and map'.

### [MINOR · small] The Maids C H1 'Pull up a Windsor chair.' echoes Matsuba's own tagline

*Lens:* cross · *Verifier:* confirmed

**Evidence.** Matsuba copy-deck.md:29 has 'Pull up a chair. Take a taste. Come join us.' (used as the H1 in Matsuba A and B, and an H2 in C). The Maids copy deck has no such line. It is a common idiom, so this is minor.

**Fix.** Write a Maids C headline from its own world, e.g. 'Three tiers, warm tarts, oak tables.'

### [MINOR · small] Eight of 12 menu pages show no dish on the first phone screen because the legend and allergen block comes first

*Lens:* cross · *Verifier:* partly

**Evidence.** At 390, Matsuba A shows Edamame and Maids B the £3.50 tart; Matsuba C and Tide A reach a dish at the fold, so the auditor's '10 of 12' is overstated. The legend at the top is mandated (standard item 26). The repeated allergen paragraphs quote each restaurant's own statement, which is correct. Sheets: /tmp/claude-0/-home-user-Claude-code/e50707d5-9ec5-571e-9915-9e7145ebe50f/scratchpad/audit/cross-site/verify/sheets/menus-390-1.png and /tmp/claude-0/-home-user-Claude-code/e50707d5-9ec5-571e-9915-9e7145ebe50f/scratchpad/audit/cross-site/verify/sheets/menus-390-2.png

**Fix.** Use a one-line key at the top ('V vegetarian · VG vegan · Allergies ↓') and put the full statement in a <details> element or after the courses, so the first dish shows on screen 1.

### [MINOR · small] The bottom action bar is the same three-cell component on all 12 sites; the sameness that matters is Tide A and C sharing an identical dark bar

*Lens:* cross · *Verifier:* partly

**Evidence.** All 12 bars have three cells, and six use icon-over-label. The bar itself is mandated (standard §E). Mamma A's bar is already red-pen boxed words with no icons, so the auditor's Mamma A fix is moot. Sheet: /tmp/claude-0/-home-user-Claude-code/e50707d5-9ec5-571e-9915-9e7145ebe50f/scratchpad/audit/cross-site/verify/sheets/bars.png

**Fix.** Restyle the Tide C bar (river blue, hire-board type, no icons), and give the Maids A/C and Matsuba A/C bars their concept's material (fascia, transfer-print band, awning valance, print-menu strip).

### [MINOR · medium] Shared section order and menu skeleton; mostly prescribed by the Useful-first standard, so only the Maids desktop hero grid is worth changing

*Lens:* cross · *Verifier:* partly

**Evidence.** Hero → Visit → taster → signature → story → closer recurs, but standard §A–B prescribes it, and 'On this menu' and literal 'Opening hours' headings are mandated verbatim (items 25 and 34). The real harm is the identical forms (X02–X04).

**Fix.** Don't reorder for its own sake. Vary the desktop hero grid within Maids, and let one concept per business lead with its signature on desktop.

### [MINOR · medium] Dark-and-gold palette overlaps within Tide (A and C bars) and Matsuba (A and B charcoal headers and bars with brass or amber)

*Lens:* cross · *Verifier:* partly

**Evidence.** Each business having one dark-and-gold option is acceptable. Matsuba B's main view reads as oak and marble rather than dark and gold. The meaningful overlap is the shared #141312 bar in Tide A and C.

**Fix.** Make the Tide C bar river blue, and lead Matsuba B with the wall grey and marble, keeping charcoal for text only.

### [MINOR · large] The four frontage heroes (Mamma B, Matsuba A, Maids A, Tide A) share one flat-vector recipe

*Lens:* cross · *Verifier:* partly

**Evidence.** Flat fills, soft gradients, glowing windows and evenly tiled brick in all four. Each owner sees only one of them, so the harm is mainly to the portfolio.

**Fix.** Only if time allows: vary the medium (a screenprint for Mamma B, an ink line with one spot colour for Matsuba A), using Tide B's engraving as the benchmark.

### [MINOR · small] Maids lead: B makes a stronger first impression than A; A's desktop hero column wraps badly

*Lens:* cross · *Verifier:* partly

**Evidence.** At 1280, A wraps 'seated / 17:30' and 'opposite Kew / Gardens' with '· Map' orphaned. A's sign is a roughly 300px panel that needs a time slider. B's tart, iron box and oven timer read strongest. Sheet: /tmp/claude-0/-home-user-Claude-code/e50707d5-9ec5-571e-9915-9e7145ebe50f/scratchpad/audit/cross-site/verify/sheets/maids-sig.png

**Fix.** Lead the Maids email with B and present A second. Fix A's hero-column wraps either way.

### [MINOR · small] Lead tells for Mamma, Matsuba and Tide (mostly merged into X01, X04 and X06); Mamma C's Today panel is a plain rectangle, and the email notes contradict the handover on the Matsuba lead

*Lens:* cross · *Verifier:* partly

**Evidence.** Mamma C's Today panel is a white box under the line, not pegged to it. _outreach/EMAILS.md says the Matsuba lead is C; HANDOVER.md says B.

**Fix.** Peg the Mamma C Today info to the rope as a hangtag, and make the Matsuba lead consistent in the email notes.

### [MINOR · medium] Several text and label faces are generic: Nunito Sans (Maids C), Mulish (Tide A), Unbounded (Tide C), and look-alike Matsuba label faces

*Lens:* cross · *Verifier:* partly

**Evidence.** Computed fonts confirm the inventory. The auditor's Literata suggestion for Maids C is banned (round 1).

**Fix.** Maids C: Cardo for text. Tide A: Petrona. Tide C: Alfa Slab One for the board lettering. Matsuba B: Barlow Semi Condensed for labels. Matsuba C: Marcellus caps for labels.

### [MINOR · small] Matsuba price formats are inconsistent ('£ 14.9' in the C hero; menus mix bare '14.9', '£4.9' and '£4.95')

*Lens:* cross · *Verifier:* confirmed

**Evidence.** Each menu has about 122 bare one-decimal prices plus £-prefixed one- and two-decimal prices. The tasters show '£12.9/22.9'. This breaks standard item 24.

**Fix.** Keep the bare prices on the menus under a 'Prices in £' line, and use '£14.90' in new display copy.

### [MINOR · small] The Matsuba footers read 'Monday TO CONFIRM to Friday 12pm–3pm TO CONFIRM, 5pm–10pm' in all three

*Lens:* cross · *Verifier:* confirmed

**Evidence.** Confirmed in the footer text of all three concepts.

**Fix.** 'Mon–Fri 12–3pm and 5–10pm · Sat 12–10pm · Sun closed*', with one footnote.

### [MINOR · small] The Tide B and Tide C footers have no address, phone or hours

*Lens:* cross · *Verifier:* confirmed

**Evidence.** The footer text is only the name and the honesty line. Tide B's menu footer adds Call and Find us but no address. This breaks standard item 35.

**Fix.** Add '2 The Arches, Richmond TW9 1TH · 020 8948 8285 · from 7:30, until dusk', typeset as the plate legend (B) and on the hire board (C).

### [MINOR · small] The Mamma C dock's pegs overprint page text on the first phone screen

*Lens:* cross · *Verifier:* confirmed

**Evidence.** The pegs cut 'OPENING HOURS' and 'to confirm' at 390. Sheet: /tmp/claude-0/-home-user-Claude-code/e50707d5-9ec5-571e-9915-9e7145ebe50f/scratchpad/audit/cross-site/verify/sheets/mamma-first-390.png

**Fix.** Hang the pegs from a rope within the dock's own top band.

### [MINOR · small] Tide B's menu page shows no menu above the fold

*Lens:* cross · *Verifier:* confirmed

**Evidence.** At 1280 and 390 the first screen is the sample banner, masthead, full bridge plate and arch nav. Sheet: /tmp/claude-0/-home-user-Claude-code/e50707d5-9ec5-571e-9915-9e7145ebe50f/scratchpad/audit/cross-site/verify/sheets/menus-1280.png

**Fix.** Shrink the plate to a small vignette above 'Bill of Fare' on the menu page.

### [MINOR · small] New: large empty 'PHOTOGRAPH TO COME' frames mid-homepage on Matsuba B and C read as unfinished

*Lens:* verifier · *Verifier:* confirmed

**Evidence.** Matsuba B: 'Photograph to come · The Matsuba Roll'. Matsuba C: 'Photograph to come · Tuna Tataki'. They are intentional slots per the NOTES, but they are large and empty. Sheet: /tmp/claude-0/-home-user-Claude-code/e50707d5-9ec5-571e-9915-9e7145ebe50f/scratchpad/audit/cross-site/verify/sheets/matsuba-full-cols.png

**Fix.** Fill each frame with a drawn plate in the concept's style, or shrink it to a small captioned slot.

### [POLISH · small] Tracked-caps eyebrow over the headline on about six first screens, not 11

*Lens:* cross · *Verifier:* partly

**Evidence.** Real instances: Mamma B, Matsuba A, B and C, Maids C, and Tide C over its sans wordmark. In Mamma A and Tide A and B the line is a subtitle under the wordmark. The descriptor itself is mandated (A1).

**Fix.** Where it is cheap, set the descriptor on the concept's own object (awning, ribbon, hire board).

### [POLISH · small] The Maids honesty line doubles the article ('the official The Original Maids of Honour website')

*Lens:* cross · *Verifier:* confirmed

**Evidence.** Confirmed in all three Maids footers.

**Fix.** 'This is not the official website of The Original Maids of Honour, and it is not commissioned or endorsed by them.'

### [POLISH · small] Stock lines repeat: 'Hungry yet?' (Mamma C and Matsuba A menus) and a near-identical Mamma A and C hero descriptor

*Lens:* cross · *Verifier:* partly

**Evidence.** Mamma A: 'Pasta, pizza and a line of shirts strung across the dining room. In Richmond since 1983.' Mamma C uses the same with 'sports shirts'. 'How many of you?' is a form legend and is fine.

**Fix.** Rewrite one Mamma descriptor, and write each closer in its concept's voice.

## Refuted by the verifier

- **The live status pattern is the same SaaS-style UI on 9 sites**: The status line is required by the standard (A2: today's status as real text) and is short and literal. Matsuba B already uses its lit sconce as the status mark, and Mamma A already sets it on 'Il foglio del giorno'. The small dots on Mamma B and C don't harm the pitch.
- **'QA passed cannot have included the lint step', and the proposed replacement fonts**: The qa.sh lint is the round-2 no-reuse list from tech-spec-v2.md, not an AI-default list, and Mamma A NOTES line 45 explains why it trips. The suggested Gilda Display, Big Shoulders Display and Public Sans are banned by the same spec. The generic-font concern itself is kept as X01, partly confirmed.
- **QA's reported 'no horizontal overflow from 320' is contradicted**: The Matsuba NOTES only claim no overflow at 390, 768 and 1440; 320 and 360 were never tested. The clipping bug itself is confirmed.
- **Verifier's own suspicion: the Matsuba C blowtorch covers the eyebrow and skip link**: Timed captures at 0.3, 1.5, 3.5 and 7 s show a transient 3-second sear that then rests clear of the text. It is intentional and not a defect.
