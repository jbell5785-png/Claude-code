# Audit: Matsuba A · Under the awning

**Verdict:** Needs work · **Readiness:** 4.5/10

Not ready to send. The drawings are clearly Matsuba's and all 120 dine-in prices match the copy deck, but the live preview opens with the disclaimer banner covering the header. The awning roll the email promises never visibly plays on a phone, and on desktop it squashes and then cuts to an almost empty screen. The desktop middle is a plain, misaligned section stack, and a run of small content faults adds up. The blocker takes 15 minutes; the signature and layout need a few hours to a day.

| Lens | Raw findings | Impress owner | Craft | Usefulness | Accuracy |
|---|---|---|---|---|---|
| content | 33 | 5 | 6 | 6.5 | 7 |
| design | 29 | 4 | 4 | 7 | 6 |
| function | 28 | 5.5 | 6 | 6.5 | 7 |

## Strengths to keep

- The frontage drawing passes the swap test: an original SVG of the slate corner with both tracked MATSUBA awnings, orchids, the lit menu case, the plinth and the railings. The owner will recognise his building at first glance.
- The long-room drawing (brick wall, swing-arm lamps, fairy-light swags, perforated bar canopy with upturned glasses, stepped two-layer slat wall) is specific to Matsuba, and the lamps switching on one by one is a good, quiet touch.
- The content is accurate. I re-checked all 120 priced dine-in items against the copy deck: every name, price and description matches, in order. Address, phone, email, booking terms (card, £10 per person, 24 hours, 12 online) and FHRS 5 are correct, with no invented claims.
- It is useful first on phones: the status, address with Directions, and Book a table / Menu are real HTML on the first screen in the source build, with an opaque Book · Menu · Call bar throughout and a no-JS hours fallback.
- The HTML menu page is clean: one scrolling page with tracked serif heads and gold rules, right-aligned prices, a v/vg legend, service and VAT lines, and Back to top.
- The no-show terms are in plain text on the page, which is the honest answer to the pitch's main AI error.
- No console errors, and reduced-motion and no-JS states exist.

## Verified findings (ranked)

### [BLOCKER · small] Preview banner covers the fixed header on both pages of the live link

*Lens:* content+design+function (A-C01, A-D01, B2) · *Verifier:* confirmed

**Evidence.** I read the live artifact (KPqWWb5wVit5WqmiFcXcST, v1793044421-e235); apart from the host skeleton it is identical to the publish build, and I served a copy on 9148. At 390x844 the banner spans 0-70.6px over the 56px fixed .top, and elementFromPoint at the wordmark returns the banner: MATSUBA and Order are hidden and an empty slate band shows below. At 1280x800 the banner spans 0-35.5px over the 72px header, slicing MATSUBA, ORDER, BOOK, MENU and CALL in half. At 390x660 the hero Book a table/Menu buttons (576-622px) sit under the action bar (596px). The source build is fine. Shots: verify/shots/live-index-390x844-top.png, live-index-1280x800-top.png, live-index-390x660-top.png, live-menu-*-top.png

**Fix.** Where the banner is injected, also add :root{--banner-h:71px} (36px at 900px and up), .top{top:var(--banner-h)}, and add var(--banner-h) to the padding-top of .hero and the menu shopfront. Drop the offset with an IntersectionObserver once the banner scrolls away, or put the banner inside the header as a one-line first row. Re-shoot at 390x660 and 1280.

### [MAJOR · medium] The namesake signature doesn't play: the awning roll is invisible on phones and a vertical squash on desktop

*Lens:* design+function (A-D02, M1, A-D10, p2) · *Verifier:* confirmed

**Evidence.** Phone, 390x844: progress = scrollY / (0.55 x 725). At y=40 the awning is 2.6% rolled; at y=80 it is under the 56px header (top 4px, bottom 68px); at y=120 it is gone (sheet-awn-390.png). The email pitches A as 'the awning rolling up as you walk into the long room'. Desktop, 1280: scale(1,s) flattens the MATSUBA lettering into a thin band, and a hard terracotta rectangle appears in the first window pane once the fabric lifts (crop-awn-1280-y300.png vs crop-awn-1280-y150.png).

**Fix.** On phones, play the roll once on load (at most 1.2s, essentials already visible) or over the first ~35px of scroll, and also on tapping 'come in'. Everywhere, clip the fabric from its front edge into a growing shaded roll tube instead of scaling it, so the letters never squash. Clip or redraw the interior shape behind the first pane.

### [MAJOR · medium] Desktop walk: opens on an almost empty screen, about 4 screens long, crude zoomed frames, hard seam, jank

*Lens:* design+function (A-D03, A-D04, A-D16, M5, A-D26, m8, room part of A-D11) · *Verifier:* confirmed

**Evidence.** .walk is 3,231px tall at 1280x800 and 4,304px at 1920x1080, about 4 screens; the project's own Useful-first standard (item 17) caps desktop pins at 1.5. 'Through the door' is a 192x496 grey slot on flat slate (walk1280-01.png). At the Booths stop a featureless beige box (the bar) fills about 40% of the frame and the booths are cut off (walk1280-07.png). There is a hard seam into the booking slat wall (sheet-walk1280.png, frame 12). At 4x CPU the walk averaged 30.8ms per frame, p95 66.7ms, with 28 of 275 frames over 50ms.

**Fix.** Cut the pin to 1.5 screens or less. Start from the hero's drawn door, or draw a real glazed door, instead of the slot. Reframe CAM.booths to about cx 520, cy 600, z 1.9 so the bar is out of shot, and add detail to anything the camera gets close to. End on the slat wall and cross-fade into .book__wall. Move a pre-rendered layer with CSS transform instead of rewriting the viewBox each frame.

### [MAJOR · small] Homepage is wider than 360px and 320px phones; the action bar falls off screen and the hours are clipped

*Lens:* function (B1) · *Verifier:* partly

**Evidence.** With isMobile the layout viewport widens to 375px at a 320px device and 376px at 360px, held open by .hours th nowrap, .nw and the chip. At 320x568 the bar sits at 602-666px against 568px visible and the hours text is clipped on the right (narrow-320-visit.png). At 360x740 the bar labels are cut off (narrow-360-top.png). 375, 390 and 412 are clean, and menu.html is fine at every width. 'Blocker' was overstated, but 360px is a common Samsung width.

**Fix.** Below about 420px, remove nowrap from .hours th and .nw, put the chip on its own line, and set .visit__grid{grid-template-columns:minmax(0,1fr)}. Assert innerWidth equals the device width at 320 and 360.

### [MAJOR · small] Prices read as typos ('£14.9'), three price styles across the pages, and unexplained dual prices

*Lens:* content+design+function (A-C02, A-D06, M6, A-C16) · *Verifier:* confirmed

**Evidence.** The homepage teaser shows £14.9, £12.9/22.9, £9.9, £6.9 and £36.9 (sec390-case.png). The menu shows bare 29.9 for the dine-in menu but £4.9/£2.9 for Kids and £6.95 for the set menu. '£12.9/22.9' sits under 'large 8 piece rolls', while the takeaway PDF says '4 or 8 piece'. The menu shows '6.9/6.9' where the homepage silently shows £6.9.

**Fix.** Use one convention everywhere, JSON-LD included: £14.90 and £12.90 / £22.90 (mention the change in the email), or bare 14.9 plus 'Prices in pounds' with no £ anywhere, Kids included. Label the rolls '4 pcs 12.9 · 8 pcs 22.9', and show the Edamame as a single 6.9.

### [MAJOR · small] Too many 'TO CONFIRM' boxes, placed mid-sentence, plus 'Open now' on Mondays and 'Still running?' as a menu heading

*Lens:* content+design+function (A-C04, A-D13, m2, m3, A-C15, A-C10, A-C14, A-D07, M4, m9, A-C17) · *Verifier:* partly

**Evidence.** Visible chips: 6 on the homepage (7 without JS) and 5 on the menu. The lunch end time is flagged 5 times and Monday 3-4 times, in dashed amber, the same colour as the CTA. The Monday chip touches the time (chip right 183.05px = td text left 183.05px; sec390-visit.png). The footer wraps to a line starting with a chip and a comma (menu390-end.png). The set menu opens with 'Still running? TO CONFIRM' (menu390-early.png). With the clock at Mon 13:00 the strip reads 'Open now · Today (Monday TO CONFIRM)…' (today-mon-1300.png), and Christmas Day reads 'Open now'. The research already holds Matsuba's own Instagram post 'MONDAYS ARE NOW FOR MATSUBA' (29 Aug 2026). Times are written five ways. The markers are required by the brief, but their volume and placement genuinely hurt the pitch.

**Fix.** Use one quiet marker per block: a muted dagger and footnote ('† Monday hours and lunch end time to be confirmed') at the end of a line, never mid-sentence. Show 'Lunch menu until 2:45pm' without a chip. Never print 'Open now' on a Monday until Monday is confirmed. Replace 'Still running?' with 'Ask when you book' or hide the set menu. Use one time format, and move the remaining questions to the cover email.

### [MAJOR · medium] The desktop middle is a generic, misaligned section stack; the concept's corridor layout was never built

*Lens:* design (A-D08, A-D15) · *Verifier:* partly

**Evidence.** The brief and NOTES promise 'the page is the room… slats down the left margin and brick down the right… every section divider is a fairy-light swag'. The build has 0 .swag elements, and .corridor wraps only #book. On desktop, Visit is a plain 2x2 grid on flat slate. 'From the menu' starts on a different left edge (x=160 vs 304 at 1280; 480 vs 624 at 1920), and the 480px case sits left of centre with large dead areas (desk1920-visit.png, desk1280-case.png). The section order itself is mandated by Useful-first, but the composition is exactly the 'generic layout' the client is worried about.

**Fix.** Build the corridor from Visit onwards: a full-height slat wall down the left and brick down the right, a lamp glow per section, and swag dividers. Put every post-hero section on one grid with one left edge, and centre the case or pair it with the tasting note. Update NOTES to match.

### [MAJOR · medium] Menu page on desktop: the 'windows' are two 11,890px flat brown slabs, and the course row orphans 'Lunch & Early Evening'

*Lens:* design+function+content (A-D05, M7, A-C28, desktop part of A-D18, A-D25 seams) · *Verifier:* confirmed

**Evidence.** .pier::before/::after compute to 11,890.6px tall (140px wide at 1280, 460px at 1920): flat brown panels with no glazing, sill or orchids beside every screen of the menu (menu-1920-mid.png, menu-1280-top.png). At 1280 and 1920 the course row wraps to two rows with LUNCH & EARLY EVENING alone on the second, and the meta line widows 'pounds.'. On phones, faint board seams run behind 'Hungry yet?' (menu390-end.png).

**Fix.** Make the windows one sticky storefront-height element and actually draw them (frames, glazing bars, orchids on the sill, warm interior), or drop them. Rename the tab 'Set menu' so the row fits on one line. Add text-wrap:balance to .case__meta, and stop the board texture behind the closing block.

### [MAJOR · small] The menu's course row highlights the previous course after every jump

*Lens:* function (M2) · *Verifier:* confirmed

**Evidence.** Clicking each tab at 390, 1280 and 1920 always marks the course before it: Mains marks Appetizers, Sushi marks Mains, and so on to Lunch & Early Evening, which marks Tasting (menu390-early.png shows TASTING lit over the set-menu heading). The html scroll-padding-top stacks with .course scroll-margin-top, which leaves the previous course's tail inside the observer band (rootMargin -140px).

**Fix.** Use a single scroll offset. In menu.js, set aria-current on the clicked tab immediately on click or hashchange, and ignore the observer for about 600ms.

### [MAJOR · small] The homepage never says sushi, sashimi or aburi

*Lens:* content (A-C06, part of A-C33) · *Verifier:* confirmed

**Evidence.** Homepage innerText at 390, with and without JS: 'sushi' 0, 'sashimi' 0, 'aburi' 0, and none of the five teaser dishes is sushi. The email's AI pitch leads with 'For aburi sushi Richmond it recommends only Sticks'n'Sushi', and the copy deck's 'what it is' line names 'sushi, sashimi and fine Japanese dishes'. C leads on aburi, but A is sent alongside it.

**Fix.** Use the descriptor 'Japanese restaurant · sushi, sashimi and aburi · Richmond'. Swap one teaser dish for an aburi nigiri with the 'flame seared' strapline. Set servesCuisine to [Japanese, Sushi].

### [MAJOR · small] Researcher and designer voice left in diner-facing copy, against the client's voice rule (d)

*Lens:* content+design (A-C11, A-C12, A-C18, A-C20, A-D21, A-C19, A-C30, A-D25 copy) · *Verifier:* confirmed

**Evidence.** Visible text includes 'Fourteen dishes, in the order the menu lists them.', 'Allergies: this menu does not list the 14 major allergens dish by dish.', 'A Lion King nigiri, served on Red Lion Street.' (NOTES says this was cut, but it survives on the menu), 'white marble-look tables' (the owner's own site says 'marble top') and 'Down the other'. The restaurant quotes itself ('“Our signature appetizer”'), and the voice switches between 'Matsuba may charge £10' and 'our booking service'. Also: 'Hungry yet?', audit-style tooltips on the chips, walk captions that read as a fixtures inventory, and a menu footer without the Instagram link.

**Fix.** Cut the tasting strapline and the Lion King aside. Rewrite the allergy line: 'Tell us about any allergy when you book or order; we'll talk you through every dish: 020 8605 3513'. Use 'marble-topped' and 'Down the other side'. Drop the self-quotes and use 'we' throughout. Use 'Book your table today!' for the closing heading, plain tooltips, and identical footers.

### [MAJOR · small] The booking form asks 'How many of you?' and then discards the answer

*Lens:* content+design+function (A-C13, A-D19, M3) · *Verifier:* confirmed

**Evidence.** select#party has no name, and site.js opens booking.favouritetable.com/?SiteCode=2122 without it (NOTES admits this). The status line says 'Choose a date and time there for 4 guests', and Favourite Table asks for party size again. The button wraps to 'CONTINUE TO FAVOURITE / TABLE' at 390 (sec390-book.png). This is the main conversion path, and the owner will likely try it.

**Fix.** Use one button, 'Book a table (opens Favourite Table)', with '13 or more? Call 020 8605 3513' beneath. Only pass party size if Favourite Table documents a parameter for it.

### [MINOR · small] 'Swipe or tap a stop.' shows on desktop, without JS and with reduced motion, where no stops exist

*Lens:* content+design+function (A-C09, A-D20, m1) · *Verifier:* confirmed

**Evidence.** At 1280 .walk__swipe displays inline and the walk has 0 buttons; walk.js builds the stops only on phones with motion. Downgraded from major.

**Fix.** Inject the sentence from buildStops() only, and say nothing on desktop.

### [MINOR · small] The menu links the 2024 vegan and gluten-free PDFs, contradicting 'Old PDFs retired'

*Lens:* content+function (A-C07, M8) · *Verifier:* partly

**Evidence.** The links go to /2024/10/…vegan4.pdf and …GF3.pdf, with one chip. They are the restaurant's only published vegan and GF menus and are already flagged, so this is not false, but the copy deck says they hold old prices and dishes, and the one-pager promises to retire old PDFs.

**Fix.** Remove both links and write 'Vegan: look for vg. Gluten-free or other needs: call 020 8605 3513'. Or label them '2024 version, may be out of date'.

### [MINOR · small] llms.txt leaves out the £10 no-show terms and never says sushi or aburi

*Lens:* content (A-C08) · *Verifier:* confirmed

**Evidence.** I read llms.txt: there is no card-to-secure, no £10 or 24-hour line, and no sushi or aburi, and it still says 'as published'. The visible page states the terms correctly, so this is downgraded from major. Still, it is the AI-facing file for the pitch's headline fix.

**Fix.** Add the booking terms verbatim and a 'What we serve' line: sushi, sashimi, eight aburi nigiri, and the tasting menu at £100 per person (minimum 2, pre-order). Drop 'as published'.

### [MINOR · small] The owner's typos are reproduced, and 'Yuzu Te' is showcased on the homepage

*Lens:* content (A-C03) · *Verifier:* partly

**Evidence.** Visible text includes Uangi Steak, Eby Fry, 'Salmon Combo_B Salmon Combo_B … (all samon)', South Amerian, Chrispy, papper, Com Fanta and Vanila. The brief mandates the menu verbatim, so this is deliberate, but in a stranger's showcase it reads as careless.

**Fix.** Tidy the spellings in the pitch build and say so in the email ('spellings tidied; easy to revert'). At minimum, keep typos out of the homepage teaser and aside.

### [MINOR · small] 'Nearest station … TO CONFIRM' from a designer who says he is local; 'on the corner' names no street

*Lens:* content (A-C05) · *Verifier:* confirmed

**Evidence.** Visit reads 'In the heart of Richmond, on the corner. Nearest station, parking and step-free access: TO CONFIRM'. Richmond station is public knowledge.

**Fix.** Write 'Richmond station (District line, Overground, rail), about N minutes' walk', with N measured by Joseph. Keep step-free access as the only owner question, asked in the email.

### [MINOR · small] Landscape phone: the first screen is all drawing

*Lens:* function (M9) · *Verifier:* confirmed

**Evidence.** At 844x390 the hero art is 476px tall in a 390px viewport, and the h1 sits at 576px, so no status or CTA is on screen (landscape-index.png).

**Fix.** Under (orientation:landscape) and (max-height:500px), cap .hero__art at about 45vh.

### [MINOR · small] Many tracked-caps labels below 12px, plus widows

*Lens:* design+function (A-D27, m4, p3) · *Verifier:* confirmed

**Evidence.** Computed sizes: today-strip chip 9.28px, stop buttons 9.92px, .mc-kicker 10.56px, action-bar labels 10.88px, skip link and Directions 11.2px. Widows: 'pounds.' and '5pm–10pm'.

**Fix.** Set a 12px floor (13px for tappable labels), use text-wrap:pretty, and keep time ranges together with non-breaking characters.

### [MINOR · small] The type is competent but not distinctive, and the wordmark is lighter than the real awning lettering

*Lens:* design (A-D09) · *Verifier:* partly

**Evidence.** Only Josefin Sans 400/600 and Source Serif 4 load; both were mandated by the brief. Josefin is a fair free stand-in for the awning's Futura-like capitals, so it is not 'generic' in the Inter or Montserrat sense. Source Serif 4 is a stock editorial serif, and the header wordmark is Josefin 400 at 15.2px, visibly lighter than the awning lettering.

**Fix.** Set the wordmark in Josefin 600 at a larger size. Ideally license Futura PT (Adobe Fonts) for the wordmark and labels.

### [MINOR · small] Kids menu title-casing errors and a floating bento price

*Lens:* content+design (A-C21) · *Verifier:* confirmed

**Evidence.** Visible text includes 'Chicken Teriyaki Or Chicken Katsu', 'Tofu Teriyaki Or Pumpkin Katsu' and 'Innocent Kids Juicy Water'. '£15.95' sits alone under 'Miso Soup', so it reads as the soup's price.

**Fix.** Use lower-case 'or' and 'innocent', and put the bento price on the bento heading row in the price column.

### [MINOR · small] Small homepage and footer gaps: no phone number on desktop, no pre-order route, h1 break, overused amber, half-empty walk cards

*Lens:* content+design (A-C27, A-C22, A-D12, A-D17) · *Verifier:* partly

**Evidence.** On desktop the header 'CALL' shows no number. The tasting menu says 'A PRE-ORDER IS REQUIRED' with no route, and the homepage line leaves out the complimentary Prosecco. The phone h1 breaks as 'Take / a taste.', and about seven first-screen elements use amber. Phone walk cards are about 40% empty, and the 'Just inside the / door' eyebrow wraps. The phone first screen itself is a sound Useful-first trade-off.

**Fix.** Show '020 8605 3513' in the header at 900px and up. Add 'To pre-order, call 020 8605 3513 when you book'. Set the h1 as three lines, keep amber for the CTA and status word, and size the cards to their content.

### [MINOR · small] NOTES.md pitches features that no longer exist, and dead code remains

*Lens:* design+function (A-D28, m5, p5) · *Verifier:* confirmed

**Evidence.** NOTES claims swag dividers, corridor margins and a 'Come in' control that rolls the awning. The build has 0 .swag elements, the corridor wraps only #book, and 'come in' is a plain anchor. site.js still observes '.swag, .street', and site.css has 14 .street and 5 .slot rules. Joseph will present from NOTES.

**Fix.** Rewrite the pitch notes against what ships (or build V07), and delete the dead selectors and the observer.

### [MINOR · medium] A and B (and partly C) share one essentials skeleton and identical paragraphs

*Lens:* design (A-D14) · *Verifier:* partly

**Evidence.** All three share the booking paragraph, the collection sentence and 'Nearest station, parking and step-free access'. A and B also share 'Skip to visit info', 'Hours, address, booking' and 'Address and getting there'. C differs more, and identical factual wording is acceptable, but sent together the three risk looking like one template.

**Fix.** Give A its own way of carrying the essentials (for example, hours on the door-decal ring, booking at the far wall) and its own label language.

### [POLISH · small] Edge-case polish: rotation changes the stop, no-JS header, chair icon, dietary tokens in JSON-LD names

*Lens:* function+design (p1, A-D29, A-D24, A-C26, m11) · *Verifier:* confirmed

**Evidence.** Rotating 390x844 to 844x390 moved aria-current from stop 2 to stop 3. Without JS the header stays a transparent gradient, so content scrolls under it. The Book chair icon reads as a letter R. 141 MenuItem names carry ' vg' or ' v' (e.g. 'Edamame (Steamed) vg').

**Fix.** Remember the stop index across a resize. Make the header solid by default and let JS make it transparent. Redraw the icons as one set. Strip the dietary tokens from MenuItem.name and keep suitableForDiet.

## Refuted by the verifier

- **Link preview shows the concept name and no og:image**: The pitch is sent as a claude.ai artifact link, whose unfurl the host controls, and the host wrapper even places these meta tags inside body. This matters only at a real launch and does not harm the pitch.
- **20% discount tied to Toast without a source**: The pitch's own one-pager states '20% off collection only, everyday… ordered online through Toast', and the copy deck pairs the deal with Toast ordering. The clunky wording is folded into V11.
- **Delivery not addressed**: The copy deck says delivery is 'not mentioned anywhere' and lists it as to confirm, so staying silent is correct.
- **'Skip to visit info' skips nothing**: The Useful-first standard requires the skip link. It is harmless.
- **Research notes in HTML comments**: The build spec asks for [TO CONFIRM] comments. They are invisible to the owner, so they cause no harm to the pitch.
- **Charset mojibake in the preview**: The live host wrapper serves <meta charset=utf8> (verified by reading the live artifact), so 'Â·' never appears.
- **Restaurant JSON-LD omits image, priceRange and geo**: geo is deliberately excluded (see NOTES), and the rest is optional with no visible effect. The sushi servesCuisine point is folded into V10.
- **Illustrations are stock-style flat vectors**: After looking at the screenshots, the frontage is the concept's strongest asset and recognisably this building: slate corner, twin awnings, orchids, menu case. The room's crude bar and booth geometry is real and is folded into V03.
- **The menu case metaphor vanishes on phones**: At 390 the menu reads cleanly, with the case edge, plate and course row present (menu-390-top.png). The desktop tab wrap is kept in V08.
- **Corner awning lettering steps instead of foreshortening**: At normal viewing size it reads as perspective on the splayed face. No harm to the pitch.
- **Standalone frontage.svg renders in Arial**: The font stack is 'Josefin Sans, Futura, Century Gothic, sans-serif', so it renders in Futura or Century Gothic on Mac and Windows. Arial shows only on a Linux test box, and the file is a standalone asset not used in the pitch.
- **Menu links to index.html may not resolve on the host**: The live artifact's file list includes index.html. I could not reproduce a failure, so this defaults to refuted.
- **External links checked**: This is a note, not a defect.
