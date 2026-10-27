# Audit: Caffè Mamma C · Bucato (lead)

**Verdict:** Needs work · **Readiness:** 5/10

Not ready to send. The washing-line idea and the first phone screen are strong. But 37 yellow 'to confirm' tags, 'Price' tags with no number, an empty Christmas card, set-menu text printed over its own frame, broken footer emails, slashed zeros in the phone number and a booking form that throws away its inputs make it look like a draft. The owner's red script logo is gone, and the type and lower-page layout use stock template moves, which is the generic look the user wants to avoid. Content and bug fixes take about a day; logo, type and illustration need a further 1–2 days.

| Lens | Raw findings | Impress owner | Craft | Usefulness | Accuracy |
|---|---|---|---|---|---|
| content | 38 | 5 | 6 | 6 | 5 |
| design | 31 | 5 | 4 | 7 | 7 |
| function | 27 | 6 | 6.5 | 7 | 6 |

## Strengths to keep

- The idea passes the swap test: the line of shirts is the one thing only Caffè Mamma has, and 'Still the restaurant with the washing.' couldn't belong to any other restaurant.
- The first phone screen (390x660) is genuinely useful: the shirts work as navigation, then today's status, the address with Directions and '5 minutes' walk from Richmond Station', all above the dock.
- The sections come in a sensible order: hours and Find us second (full week's table, today highlighted), then a priced taster, booking, lunch and takeaway, parties for 58, and the story as pegged dates.
- The washing line is well engineered: every shirt is a real link with visible focus, there's no scroll-jacking, and it settles after load. No console errors and no horizontal overflow at 320, 390, 1280 or 2560.
- The voice is clean, with no designer talk or filler. Phone, emails, address and map links match the research everywhere, menu prices match the copy deck, and the old site's misspellings are corrected.
- Most booking copy is honest ('nothing is booked until you confirm there'), with no fake confirmations; only the button label and summary overpromise (V7).
- The menu is a loud, fast-scanning list with hanging price tags, distinctive and on-concept once the placeholders and card padding are fixed.

## Verified findings (ranked)

### [BLOCKER · medium] 37 'to confirm' tags plus empty placeholders make both pages read as unfinished

*Lens:* content (merges C-CON-01, C-CON-02, C-CON-03, C-D14, C-F06, C-SEN-03, C-MENU-04, C-LUNCH-01, part of C-D30/C-CON-09) · *Verifier:* confirmed

**Evidence.** Measured 17 visible .tbc on index and 20 on menu (390 and 1280); 3 in the first phone screen on home, 4 on menu. The first two dishes on menu.html (Zuppa del giorno, Pane all'aglio) show a price tag reading only 'Price'; so do Tagliatelle positanese, Quattro formaggi and the seafood pizza. Xpress Lunch shows 'Price [to confirm]' on both pages, and 'See the lunch menu' leads to a card with no price and no mains. The Christmas card holds only 'Available in season. Details [to confirm]' (verify/shots/menu390-xmas.png). Stub lines: Last orders, Walking time, Step-free details, Service charge, Full list x2, Full wine list. Hours are flagged 5 times. The copy deck (scratchpad/copy-deck.md) asked for ONE menu-level price note and ONE dietary note, and the brief promised 'one discreet, consistent marker'.

**Fix.** Delete every stub line that carries no fact. Flag each fact once (hours in the table only, 1983 once). Replace 'Price' tags with 'Ask us' or drop those dishes. Use the deck's single line 'Prices from our current menu, being re-checked'. Remove the empty Christmas card or replace it with 'Christmas parties upstairs for up to 58: bookings@caffemamma.co.uk'. Relabel 'See the lunch menu' as 'Lunch details'. Drop the Deliveroo/Uber Eats line. Restyle the marker as a small neutral annotation and add one footer line: 'Draft: N details to confirm with you'. Aim for 10 or fewer markers across both pages.

### [BLOCKER · small] Set-menu 'tea towel' text is printed over the card's own frame on phones and tablets

*Lens:* layout (merges C-LAY-01, C-D01, C-F01) · *Verifier:* confirmed

**Evidence.** menu.css .towel padding-inline is clamp(26px,3vw,44px), measured at 26px at 320, 390 and 768 (38.4px at 1280). The inset box-shadow frame is 28px deep. In verify/shots/towel-390.png and towel-party-390.png, 'Xpress', 'Two courses', 'Price', 'Starters', 'pomodoro,', 'Enquiries:' and 'takes up to 58' sit on the black or red rule. All four cards are affected, including the party menu.

**Fix.** .towel { padding: 46px max(44px, 3vw) 44px; } or draw the frame on an inset ::before so it never shares space with the text. Re-check at 320, 390 and 768.

### [MAJOR · medium] The owner's red script logo is missing; a Bricolage wordmark stands in as if it were theirs

*Lens:* brand (merges C-BRAND-01, C-D03, C-D25) · *Verifier:* confirmed

**Evidence.** The header and footer set 'Caffè Mamma' in Bricolage 800, with 'RISTORANTE' at 9px (0.5625rem) and a giant footer wordmark. The real mark is a red brush script with a green stroke (research-assets/current-site-mobile-header.jpg and the fascia). Both brief.md and the copy deck promised 'a clearly marked logo slot'. The label was removed in the voice pass, so the owner sees their brand replaced without explanation.

**Fix.** Trace the script and green stroke from the fascia or current-site screenshot as an SVG stand-in and use it in the header and footer. Say in the email it will be swapped for their vector master. Drop the giant Bricolage footer wordmark.

### [MAJOR · medium] Type is a fashionable stock pairing, and every display line uses the same light-300/heavy-800 condensed trick

*Lens:* type/originality (C-D02, part of C-D05) · *Verifier:* partly

**Evidence.** The auditor's evidence is wrong. Bricolage and Atkinson appear in qa.sh and tech-spec-v2 only because THIS concept uses them (a cross-portfolio no-reuse rule), not on a template watch-list, and brief.md has no 'overused' list. The judgement still holds after looking at the screens. Six homepage display lines use the same light/heavy mix ('Still the restaurant with the washing.', 'A table under the shirts.', 'Xpress Lunch. Two courses.', 'Pizza to take away? Call us.', 'Up the curved staircase, a room for up to 58.', 'First it was the restaurant with the washing. It still is.'). It reads as 2024–26 template type, and nothing comes from the restaurant's own lettering (script, door decal, kit names). The user explicitly asked for no generic fonts.

**Fix.** Give the shirt words and section tags lettering drawn from the idea (kit or shirt-back lettering), use the traced script for the wordmark, pick a text face with a plain zero, and keep the light/heavy contrast for the hero only.

### [MAJOR · large] Below the hero the layout relies on stock template moves: marquee, giant footer wordmark, giant '58', full-bleed colour flips

*Lens:* layout originality (merges C-D05, C-D06, C-D18 partly; C-D12, C-POL-02, C-F27, C-D23 confirmed) · *Verifier:* partly

**Evidence.** The pegged headings on a line are on-brief. The generic parts: a running marquee whose Pause button covers the phone number at 1280 and 'chiamaci' at 390 (slices index-d1280-full-05, index-m390-full-06); a giant footer wordmark; a giant '58' whose 5 and 8 fuse into one shape at 390 and 1280; and full-bleed field changes on nearly every section (blue, white, red, blue, yellow, green, white, red). README itself says the flat blocks feel like a template without the logo and photos.

**Fix.** Cut the marquee (the number is already big above it). Replace the giant wordmark with the traced script at normal size. Set '58' with normal tracking or hang it as a tag, and say 58 once in the copy. Calm the field changes (ceiling blue and white as the base, red and yellow as accents). On the menu, use one ground with coloured course tags instead of nine full-bleed blocks.

### [MAJOR · medium] No real image of the room, shirts, frontage or food; the signature shirts are one reused icon polygon

*Lens:* imagery (merges C-PHOTO-01, C-D17, C-D04 partly) · *Verifier:* partly

**Evidence.** No photos was a deliberate brief choice, and the research photos belong to a Google Maps user (W Huang), so they can't be used. But four of six garments reuse one 12-point T-shirt path with a different fill, so the line reads as a row of icons. The real room is a dense run of football shirts under a cobalt ceiling (research-assets/interior-dining-room.jpg). Nothing shows the ceiling, the yellow rose, the terrace or a plate.

**Fix.** Joseph photographs the frontage and terrace from the street himself and asks permission for one interior shot; or draw one interior moment (the line under the blue ceiling over a white cloth and yellow rose). Give the shirts kit detail (collar, placket, stripes) and vary and overlap the items.

### [MAJOR · small] The booking form discards party, date and time, suggests times already gone, and contradicts the 'ring for tonight' copy

*Lens:* function/booking (merges C-BKG-02, C-F02, C-F10; C-BKG-01 partly) · *Verifier:* confirmed

**Evidence.** With 4 people, 20 Nov and 8pm chosen, window.open received exactly 'https://www.opentable.co.uk/r/caffe-mamma-ristorante-london' (no parameters), yet the button says 'Check availability'. With the clock frozen at 27 Oct 23:15 London, the summary read 'Table for 2, Tuesday 27 October, 7.30pm: we'll take you to OpenTable'. The default is always today, while the same section says 'Nine or more, or tonight? Ring us for… same-day tables'. On C-BKG-01: 'phone for groups and same-day' comes from brief.md and the copy deck (generic best practice in research §3), not this concept. It is still not the restaurant's stated policy, and the 1–8 cap is the concept's own.

**Fix.** Rename the button 'Continue to OpenTable'. Pass covers, date and time if OpenTable's URL accepts them (test on a phone), otherwise drop the three fields. Default to the next sensible slot and hide past times. Delete the 'or a table tonight' lines and say 'Large groups: call us' without a number.

### [MAJOR · small] No one-tap Call once you scroll the homepage on a phone; the shirts repeat the dock

*Lens:* function/mobile (merges C-F04, C-F15, part of C-D31) · *Verifier:* confirmed

**Evidence.** The homepage dock is Book, Menu and Find us (index.html line 515). The header (the only Call) is position: relative below 900px. The brief says 'Call: tel:02089488330, one tap from every screen', and takeaway is phone-only. The menu page's dock does have Call. At 390 the three shirts (Menu, Book, Find us) repeat the dock's three destinations on one screen.

**Fix.** Make the homepage dock Book, Call and Menu, or hang Lunch, Pizza and Parties on the phone line.

### [MAJOR · small] Slashed zeros on the address and phone number everywhere ('11Ø Kew Road', 'Ø2Ø 8948 833Ø')

*Lens:* type (merges C-TYPE-01, C-D13) · *Verifier:* confirmed

**Evidence.** The computed text font is Atkinson Hyperlegible (loaded). It shows in the first phone screen (verify/shots/index-m390-first.png), the header Call at 1280, every Call button, '4.3Øpm' and '7.3Øpm'. README already lists this as a weakness and it is unfixed.

**Fix.** Set digits in a face with a plain zero, via a unicode-range @font-face for 0–9 or a .num span, or let the type change in V4 fix it.

### [MINOR · small] The footer splits the restaurant's email addresses mid-word on phones

*Lens:* layout (C-LAY-02, C-D11, C-F13) · *Verifier:* confirmed

**Evidence.** At 390 it reads 'contact@caffemamma. / co.uk' and 'bookings@caffemamm / a.co.uk' (slices/index-m390-full-09.png). The cause is overflow-wrap:anywhere in a 2-of-4 column.

**Fix.** Let 'Call or write' span the full row below 768px, and break only after '@' with <wbr>.

### [MINOR · small] Dock pegs poke 11px above the bar and cut through content, starting on the first screen

*Lens:* layout (C-D10, C-F20) · *Verifier:* confirmed

**Evidence.** At 390x844 the pegs cut 'OPENI|G HOURS' and its chip (index-m390-first.png), and they cross dish text on the menu.

**Fix.** Keep the pegs inside the bar (top: 2px), or give the dock a solid top band for them to clip onto.

### [MINOR · small] 'An Italian kitchen with a Portuguese family behind it' on an unsolicited homepage

*Lens:* sensitivity (C-SEN-01) · *Verifier:* partly

**Evidence.** The copy deck sanctioned one line, and it is flagged. But it is the owner's background stated by a former employee, and 'family' goes beyond the one owner named in research.md ('How the owners want this told [TO CONFIRM]').

**Fix.** Take it off the page and raise it with the owner in person. Keep 'Family-run since 1983'.

### [MINOR · small] 'In Richmond since 1983' contradicts the Barnes 2004–2006 timeline on the same page

*Lens:* accuracy (C-ACC-02) · *Verifier:* partly

**Evidence.** The hero lede says 'In Richmond since 1983'. The story dates show '2004 Rocks Lane, Barnes' and '2006 110 Kew Road'. The owner might make the same loose claim, but it is inaccurate as written.

**Fix.** 'Since 1983. On Kew Road since 2006.' and drop the duplicate 1983 chip.

### [MINOR · small] Some menu facts aren't in research.md; they come from a copy deck that isn't in the repo

*Lens:* accuracy/traceability (C-ACC-01, C-F07, C-D29) · *Verifier:* partly

**Evidence.** scratchpad/copy-deck.md ('source of truth for all three concepts') lists the lunch starters, the party dishes, £23.95 [TO CONFIRM], the Quattro stagioni ingredients and £14.95 for each of six pizzas, so this concept did not invent them. But the deck is outside the repo with no per-item source, and research.md shows only '£13.95–£14.95' for the pizza group.

**Fix.** Commit the deck next to research.md with a source for each set-menu line, and check the pizza and set-menu details on Just Eat or OpenTable on a phone.

### [MINOR · medium] Many dishes have no description, the style is inconsistent, and the drinks list is a 4-line stub

*Lens:* menu usefulness (C-MENU-01, C-MENU-02) · *Verifier:* partly

**Evidence.** 23 of 53 items have no description by design (the deck forbids writing one without a source). Fragments like 'Clams.' and 'Seafood.' sit next to full sentences, and the homepage says 'With clams.' where the menu says 'Clams.'. Drinks: Peroni/Kaliber, Bellini, soft drinks and red wine only; no white wine, prosecco or coffee (menu390-bere.png).

**Fix.** Joseph fills descriptions and drinks from his memory or Just Eat (sourced, not invented) in one style. If the drinks can't be sourced, fold them into a short block.

### [MINOR · small] The live 'Open now' status has no exceptions and is computed once per load

*Lens:* logic (C-SEN-02, C-F03) · *Verifier:* partly

**Evidence.** With the clock frozen at 25 Dec 13:00 London it reads 'Open now, until 11pm'. The auditors overstated the rest: OpenTable's 22:00 is probably last bookings (research.md says so), and whether the restaurant opens on 25 Dec is unknown.

**Fix.** Until the hours are confirmed, show 'Usually open every day, 12 noon – 11pm', or add an exceptions list. Keep a single hours marker in the table.

### [MINOR · small] A landscape phone or 200% zoom shows only the shirts on the first screen

*Lens:* layout (C-F05) · *Verifier:* confirmed

**Evidence.** At 844x390 the Today panel top is at 617px and the h1 at 736px, both below the screen (verify/shots/land-844x390.png).

**Fix.** Use the one-row hero on short viewports (@media (max-height: 560px)), or cap the line height so the Today panel lands on the first screen.

### [MINOR · small] The menu's first screen shows no food, and the sticky index shows 3 of 9 courses with no scroll cue

*Lens:* menu page (C-D15, C-D16, C-D28, C-F11) · *Verifier:* confirmed

**Evidence.** The first .dish top is at about 1,120px at 390x844 (the auditor said 1,190). The index shows Starters, Salads and Pasta with nothing peeking and no fade (menu-m390-first.png). The sticky index plus dock take a large share of a landscape screen.

**Fix.** Shorten the intro to one line with the status inline, collapse the four notes into one strip, add an edge fade with a half-visible fourth tag, and shrink the index when stuck.

### [MINOR · small] Small glitches: Pizze takeaway line hangs out of its header, 320px clips, slivers behind the dock, orphaned dot

*Lens:* layout polish (C-LAY-03, C-D22, C-F14, C-F21, C-F22) · *Verifier:* confirmed

**Evidence.** The Pizze link bottom is 11px below its yellow header and '8330' crosses the first rule (menu390-pizze.png). The footer wordmark is 322px wide in a 320px viewport. At 390x660 the Lunch, Takeaway and Parties tags show as 11px slivers above the dock (index-390x660.png). Without JS at 320 the status dot sits alone on line 1 (index-320-nojs.png).

**Fix.** Pad the Pizze head or move the takeaway line into the body; use min(19.4vw,28rem) for the wordmark; move the tags up or clearly below the fold; keep the dot and text together with nowrap.

### [MINOR · small] The punched hole on every button reads as a radio button or bullet

*Lens:* components (C-D09, C-F19) · *Verifier:* confirmed

**Evidence.** '○ Call', '○ Antipasti', '○ Book on OpenTable', '• Book a table' at 390 and 1280; the header Call shows the hole and a phone icon side by side.

**Fix.** Keep the hole and string for price and section tags only; use plain chamfered buttons elsewhere.

### [MINOR · small] Unidiomatic Italian glosses and mixed-language labels

*Lens:* copy/Italian (C-LANG-01, C-D19, C-NAV-01, C-POL-01) · *Verifier:* partly

**Evidence.** 'Bere' as the drinks heading, 'orari e dove', 'le feste'. The homepage jump list is Italian (plus 'Set menus' and 'Drinks') while the menu index is English. The shirt glosses switch between Italian and English ('food & drink', 'takeaway'). Reading 'dove' as the bird is a stretch in context.

**Fix.** Use 'Da bere' or 'Bevande', 'Orari e indirizzo' or 'Dove siamo', and 'Feste private'. Use English jump labels on home to match the menu page, and keep Italian second lines consistent or drop them from the dock.

### [MINOR · small] Repetition and a small embellishment

*Lens:* copy (C-REP-01, C-D24, C-STORY-01) · *Verifier:* confirmed

**Evidence.** '58' appears three times in the parties block. The hero h1 and the story lead are the same joke. 'Richmond had a name for us straight away' adds a detail no source gives.

**Fix.** Give the story its own line (Hill Street, 1983), say 58 once, and write 'Richmond called us the restaurant with the washing.'

### [MINOR · small] The terrace, children's menu, a Christmas-party line and allergy links are missing

*Lens:* completeness (C-COMP-01, C-CON-09, C-DIET-01) · *Verifier:* partly

**Evidence.** No page mentions the terrace, though it is in the copy deck and the frontage photo. The homepage never mentions the children's menu. The menu-page address is not a map link. The homepage allergy line doesn't link to the menu's allergen note. Late October, and Christmas appears only as the empty card. A Just Eat link can't be added because no URL was sourced, and the deck forbade vegan and gluten-free markers, so those are not faults.

**Fix.** Add 'Tables out front on the terrace' to Find us, a children's menu line on home, a Christmas-parties line in the parties block, a maps link on the menu address, and a link to menu.html#allergies.

### [MINOR · small] The live preview's tab title shows the internal codename 'Caffè Mamma Bucato'

*Lens:* preview build (C-META-01, title part of C-D27/C-F17) · *Verifier:* confirmed

**Evidence.** Confirmed by reading the live artifact (claude.ai/artifact/32mhWYVm4GGgDWvjutUUwH): <title>Caffè Mamma Bucato</title>. The charset/mojibake part is refuted: the live wrapper has meta charset=utf8.

**Fix.** Have the build keep the source title 'Caffè Mamma Ristorante · 110 Kew Road, Richmond'.

### [MINOR · small] Unverifiable here: the OpenTable slug, tel: and mailto: inside the claude.ai viewer, and iOS Safari

*Lens:* pre-send checks (C-BKG-03, C-F09, C-F16) · *Verifier:* partly

**Evidence.** curl to the OpenTable URL returns 403; the slug comes from the copy deck. README says call and email links may do nothing in the claude.ai viewer. The hero uses container units and atan2() (Safari 16+). Only Chromium was available.

**Fix.** Before sending, open the live link on a real iPhone and an Android phone and tap Call, email, Directions and both OpenTable buttons. If tel: is dead in the viewer, say so in the email.

### [MINOR · small] The email and the site disagree

*Lens:* pitch consistency (new) · *Verifier:* confirmed

**Evidence.** richmond-sprint-v2/_outreach/EMAILS.md says you 'tug a shirt to get to MENU, PRENOTA or DOVE', but the shirts now lead with MENU, BOOK and FIND US. The banner credits 'an independent studio' while the email is personal from Joseph, a former staff member.

**Fix.** Update the email line to match the shirts, and consider 'Design concept by Joseph Bell' in the banner.

### [POLISH · medium] Print, idle animation, runtime reduced motion, no-JS lead, metadata, dot colours, copy tidies

*Lens:* tech/copy polish (C-F08, C-F12, C-F18, C-NOJS-01, C-POL-03, C-F25, C-D26, C-F23, C-LANG-02, C-LANG-03, C-POL-04) · *Verifier:* confirmed

**Evidence.** No print CSS; menu.html prints as 10 A4 pages. 193 rAF calls in 3s at idle (ScrollTrigger). Turning on reduced motion while the page is open still lets the shirts swing to 27° on a mouse sweep. Without JS the booking lead still says 'Pick a day, a time…'. No og:image and thin JSON-LD. The closed dot is red on home and white on the menu. Straight against curly apostrophes, '5 minutes'' against 'five-minute', the garbled 'Frullati' line, 'Hungry yet? Book a table.', the 'Pages' footer heading.

**Fix.** Add a basic @media print; replace ScrollTrigger with a one-shot IntersectionObserver; honour reduced-motion changes in the pointer handlers; move the lead inside the form; add og:image and JSON-LD before production; unify dot colours; tidy the copy.

### [POLISH · small] Desktop taster prices sit far from dish names; the Today strip looks like an alert bar; taster strings hang from nothing

*Lens:* desktop polish (C-D08, C-D07, C-D21) · *Verifier:* partly

**Evidence.** At 1280 the taster price tags sit about 500–600px from the dish names (slices/index-d1280-full-01/02). The white strip with a yellow left border reads as a notice bar. The taster price-tag strings end in mid-air.

**Fix.** Cap taster rows at about 760px or use a 2–3 column grid; restyle Today as a hung tag or a typeset line; tie the strings to the row rule.

## Refuted by the verifier

- **Cold disclaimers and no sign of Joseph**: The preview banner and noindex are mandated (HANDOVER §3: keep both). At 390 the banner is 3 lines (about 71px), which is acceptable. Joseph's name and former-staff hook are already in the outreach email, which is where they belong. The 'independent studio' wording is handled in V26.
- **Fonts on the pipeline's watch-list and the brief's overused list**: Misread. qa.sh and tech-spec-v2 list Bricolage and Atkinson only to stop other businesses reusing Caffè Mamma's fonts, and brief.md has no overused list. The design judgement is kept as V4 (partly).
- **Party price, lunch and party dishes, pizza prices invented; £23.95 conflated with red wine**: All are in the shared copy deck (scratchpad/copy-deck.md), the stated source of truth for all three concepts, so this concept didn't invent them. The red-wine conflation idea is unsupported. Only a traceability gap remains (V14).
- **Invented 'ring for groups and same-day' rule**: 'Phone for groups and same-day' is in brief.md (primary action 1) and the copy deck. The real problem, its contradiction with the form, is kept in V7.
- **Preview renders 'CaffÃ¨'**: The live artifact wrapper declares meta charset=utf8. The mojibake appears only when the bare build file is served locally.
- **Pegs sit on top of course-heading letters**: This is the intended 'pegged word' look and reads as laundry pegged to the line, not a collision bug.
- **Too many competing tap targets on the first screen**: Subjective; the first screen at 390x660 reads clearly. The real duplication (shirts repeating the dock) is covered in V8.
- **Source comments expose research notes**: They are invisible on the page and follow the documented [TO CONFIRM] grep convention. Harmless for the pitch.
- **One font file is 43% of page weight**: 308KB total with FCP and LCP under 300ms. Performance is fine and not a pitch issue.
- **At 2560px the line spans beyond the content width**: Reproduced (garment x≈105 against brand x≈252), but irrelevant for an owner viewing on a phone or laptop.
- **'an ice-cream' is wrong**: 'Ice-cream' is accepted British usage. The rest of that finding is kept in V27.
