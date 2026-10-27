# Audit: Maids of Honour B · A royal secret

**Verdict:** Needs work · **Readiness:** 5/10

Not ready to send yet. The idea is strong and clearly theirs, but on a phone the hero's "Turn the key" button can't be tapped because the tart image sits on top of it. The hero tart reads as a vol-au-vent rather than a Maids of Honour, the iron box plays its reveal mostly off-screen, and the copy still reads like a draft (skip links, doubled labels, the owner's 1850 date chipped against the one-pager's promise, no "afternoon tea" anywhere, puddings listed before mains). Most of it is an afternoon of copy and CSS fixes, plus a few hours each on the tart, the box choreography and the desktop menu columns.

| Lens | Raw findings | Impress owner | Craft | Usefulness | Accuracy |
|---|---|---|---|---|---|
| content | 41 | 5.5 | 7 | 6.5 | 6.5 |
| design | 30 | 4 | 4 | 7 | 7 |
| function | 32 | 5 | 5.5 | 5.5 | 6 |

## Strengths to keep

- The concept clearly belongs to this business and passes the swap test: the locked-iron-box legend, their own black-and-gold ribbon as the page grid, a working timer built on their own '150° Gas Mark 3, 5 to 8 mins' instruction, the 1907 Hill Street postcard and the line of keepers.
- The casket's ironwork (straps, scrolls, lock plate, key) and the ribbon lettered in the designer's own blackletter are distinctive, well-made pieces worth keeping.
- The structure puts useful things first. The first phone screen shows a live London-time status, the address with a map link, and Book and Menus. Hours are split by service, each with a Book link to its own ResDiary widget. The luncheon minimum sits under Luncheon only, which directly fixes the error Google made three times.
- Every 2024 menu is HTML text with prices, which is the heart of the AI-visibility pitch. Menu prices match the copy deck, and shop prices match the live shop.
- The content is honest: the legend is always labelled as legend, the filling is never stated, and the preview and honesty notices are clear.
- It is technically clean: no console errors, no horizontal overflow from 320 to 1280 on either page, correct time logic on ordinary days, and deliberately designed reduced-motion and no-JS states.

## Verified findings (ranked)

### [BLOCKER · small] On phones and tablets the hero's 'Turn the key on the iron box' button can't be tapped because the tart image covers it

*Lens:* function · *Verifier:* confirmed

**Evidence.** elementFromPoint on the button returns the hero IMG at 360x740, 390x844, 414x896 and 768x1024. A touchscreen tap at 360–768 leaves scrollY at 0, so nothing happens. At 768 'Skip to visit info' and a corner of 'Book a table' are also covered. At 1024 and up the button works. Cause: .hero__stage img is absolutely positioned on small screens, overhangs its stage and paints over the static button. Merges function F01. Script: verify/hit.js.

**Fix.** Add .hero__stage img, .hero__stage::before, .pricetag__thread { pointer-events:none } and give .hero__ticket position:relative; z-index:3 at every width. Re-run the hit-test from 320 to 1024.

### [MAJOR · medium] The hero tart doesn't read as their tart: a ringed vol-au-vent wall around a sunken yellow pool with dark blotches

*Lens:* design · *Verifier:* partly

**Evidence.** Large renders (verify/shots/asset-tart.svg.png, asset-tart-salver.svg.png) show each tart as a separate pastry ring around a recessed filling with brown and black blotches. It reads as a vol-au-vent, quiche or pastel de nata. Their tart.jpg shows a puffed rim rolling into a domed, blistered top. tart.svg has two straight dark stroke artefacts across the filling. At 2560 wide the squiggle lamination looks like corrugated card (index-2560-small.png). Correction: the '1:3.5 proportion' claim comes from the box photo; on their silver stand the tarts are fairly tall, so the sunken pool and the blotches are the problem, not the height. Downgraded from blocker to major. Merges design B1 and function F10.

**Fix.** Redraw the top as domed pastry rolling over from the rim, with caramel blistering concentrated at the crown, not an exposed pool with blotches. Delete the stray strokes. Reuse the redrawn tart in tart.svg (box layer and timer).

### [MAJOR · medium] The iron box plays its reveal mostly out of view, and its end state contradicts its words

*Lens:* function · *Verifier:* confirmed

**Evidence.** Desktop 1280x800 with the key centred: the open lid's top is cut off by the sticky header. The first layer starts at y=687 of 800 and five more sit below the fold. The lid closes and 'The recipe stays in the box.' settles off-screen. Arriving via #box, the key's bottom (845) is below the fold. Mobile 390x844: the first layer starts at y=608 (action bar at 788), the rest at 1207–2299. End state: the lid is drawn shut but the hint says 'Turn the key to put it all back', and pressing it collapses everything. With reduced motion the ticket still says 'Turn the key to see what's inside.' although the box is open. Landscape 844x390: the casket is 726px tall, so its top sits at -265 with the key centred. Merges design B2, function F02, F03, F25 and F27. Frames: verify/shots/box-d-*.png, cs-box-m.png, rm-box-1280.png.

**Fix.** Size the casket by viewport height as well as width. Keep the first revealed layer in view with the box: on desktop, lay the layers beside it in the empty ticket column; on mobile, smooth-scroll to layer 1 once the lid is up. Put 'The recipe stays in the box.' directly under the casket. Make the end hint 'Turn the key to start again', or rest the lid open. Hide 'Turn the key to see what's inside' when .motion is absent.

### [MAJOR · small] Scaffolding and designer copy is still visible on the page

*Lens:* content · *Verifier:* confirmed

**Evidence.** 'Skip to visit info' sits inside the hero card and jumps to the section directly below. A visible strip 'Skip past the iron box · Skip to visit info' has a second link that jumps back up the page, and at desktop the strip breaks the vertical ribbon. 'THE LEGEND IS A LEGEND. THE TART IS REAL.' shows at desktop. 'Click, tap, or press Enter or Space' shows on phones. The headings repeat one two-beat formula: 'One tart, one secret.' / 'Visit us.' / 'The menus, priced.' / 'Also at 288.' / 'Finest when warmed.'. Merges content M4 and M5, design B17 (skip part), B18 and B26, function F29.

**Fix.** Make both skip links visually hidden until focused, and keep the ribbon continuous. Cut the 'legend is a legend' line. Reduce the hint to 'Turn the key'. Vary two or three headings, e.g. 'Menus & prices'.

### [MAJOR · small] Section labels are doubled and cryptic, and 'Upstairs / Also at 288' heads the National Archives café

*Lens:* content · *Verifier:* confirmed

**Evidence.** The ribbon 'Upstairs' leads to the kicker 'SHOP & TEA ROOM ON 288 KEW ROAD' ('ROAD' orphaned at 390) and the H2 'Also at 288.'. Under them sit the strapline, the email, the guest rooms and 'At The National Archives', which is neither at 288 nor upstairs. Doubled labels: 'Our story' then a second 'Our story' oval; 'By post' then 'For tarts by post'; 'Priced' then 'The menus, priced.'; 'Visit' then 'Visit us.'; menu 'Please check availability' twice. #warm is 'Tarts by post' in the nav and 'Warming instructions' in the footer. Merges content B1, M6 and p3, design B19, function F31 (labels).

**Fix.** Give each section one label. Rename the last section 'More from us' (or 'Guest rooms & our café at The National Archives'), keep 'Upstairs' only on the guest-rooms subhead, and move the strapline and email to Visit and the footer. Use one name per anchor.

### [MAJOR · small] The owner's founding line is chipped and told three ways, and several chips contradict the pitch one-pager

*Lens:* content · *Verifier:* partly

**Evidence.** The hero says 'Since the 1800s on the Kew Road'; the keepers say 'Est. 1850 [to confirm]'; both footers say 'Serving you since 1850' [to confirm]. The one-pager sent with the site promises 'One history line, Est. 1850 (our own date)' and marks the Thursday rule and the tart prices 'Correct'. Yet chips sit on the Thursday rule, both tart prices, 'Shop prices may have changed' and the postcard caption (really a scan-permission question). 'Step-free access and the walk from Kew Gardens [to confirm]' carries no information. There are 11 chips on index (10 visible before the box opens) and 4 on the menu page, three in the four-row hours table. Correction: the chips are intentional and the copy deck does list tart prices and the Thursday rule as TO CONFIRM. The harm is where they sit, not that they exist. Merges content M1 and M2, design B10 and B23, function F30.

**Fix.** Use 'Est. 1850' (hero oval) and 'Serving you since 1850' (footer) as their own claim, with no chip. Drop the chips on the Thursday rule, the tart and shop prices and the postcard. Remove the empty step-free line. Keep chips only on bank holidays, the £22/£20 luncheon minimum and the 2024 menu prices. Put the rest in the covering email.

### [MAJOR · small] The first screen never says what the place is, and 'afternoon tea' appears nowhere on the site

*Lens:* content · *Verifier:* confirmed

**Evidence.** The 390px first screen has no 'tearoom', 'bakery' or 'tea'; the descriptor only appears near the bottom of index. 'Afternoon tea' count is 0 on index, menu.html (apart from the takeaway 'Afternoon Cream Tea (For Four)'), llms.txt, meta and JSON-LD. The one-pager's headline is 'Google puts you first for afternoon tea near Kew Gardens'. 'One tart, one secret.' is both the H1 and the og:description.

**Fix.** Add a literal line under the H1, e.g. 'Tearoom & bakery opposite Kew Gardens · breakfast, luncheon and afternoon tea'. Rename 'Set teas' to 'Afternoon & set teas' in the hours row and on the menu. Add the phrase to the meta and og descriptions, llms.txt and the JSON-LD description.

### [MAJOR · medium] The desktop menu looks broken: 'Back / to / top' stacks into three lines, prices wrap in 275px columns, and a 460px column sits empty

*Lens:* design · *Verifier:* confirmed

**Evidence.** At 1280, 1440 and 1920 all 10 'Back to top' links are 32x79px and render as three stacked words in the ribbon gutter. Cause: calc padding inside the global p max-width. At 1280, 14 prices wrap: '£3.25 per / scoop', '£3.50 per / person', 'Chicken or Steak £8 · Salmon £9.50', '£12 / £18 / £60'. 'Your choice from Today's Patisserie counter' runs to 5 lines while the ticket column beside it is empty. Screenshots: verify/shots/menu-d-totop.png, menu-d-luncheon.png. Merges design B3 and B13 (part), function F09 and F22, content m15.

**Fix.** Give .totop max-width:none and white-space:nowrap, and align it to the content column. Below about 1400px, let menu groups span the ticket and content columns, or use one wider column. Put multi-price lines under the dish name instead of in the price slot.

### [MAJOR · small] Luncheon lists the puddings (Afters) before the mains

*Lens:* content · *Verifier:* confirmed

**Evidence.** Measured order at 390: First Courses y=13138, Afters 13628, Second Courses 14014, Baker's Hot & Cold 14733. Desktop shows First | Afters, then Second | Baker's. Their printed menu runs First, Second, Afters. Merges content M7, design B4, function F08.

**Fix.** Reorder the DOM to First, Second, Baker's Hot & Cold, Afters. Balance the desktop columns with grid placement only.

### [MINOR · medium] Desktop index: narrow columns and dead zones in Our story and the shop section

*Lens:* design · *Verifier:* partly

**Evidence.** At 1280 the keepers list is a narrow column of about 240px with roughly 870px of blank space under the postcard. In the shop section, the 294px text column wraps 'Box of 12 (Discounted)' and 'Box of 8, Postal Courier Service Edition' over 2–3 lines, and there is empty space under the gift box (verify/shots/cs-id-03.png, cs-id-04.png). Correction: the empty ticket column under 'Visit us.' and 'The menus, priced.' reads as a deliberate editorial margin. Merges design B9 (index part).

**Fix.** Stack the postcard above the keepers, or give the keepers about 60ch. Make the shop one column below about 1400px with a larger gift box.

### [MINOR · small] Oven timer: the heading doesn't follow the state, and the '150°' label is hidden under the knob

*Lens:* content · *Verifier:* confirmed

**Evidence.** The heading reads 'Your tart is in the oven' when idle, while running and at 0:00. The done line, 'Warm. Devour when cooling…', never says to take the tart out. The '150°' text sits at x=691–713 under the knob (x 671–805), leaving a stray oxblood '1' (verify/shots/oven-done-crop.png). There is an unlabelled dot at about 7 o'clock, a default white checkbox on the dark card, and old-style figures on the minute chips. Merges content M11, design B14 and B21, function F24.

**Fix.** Make the heading follow the state: 'Warm a tart', then 'In the oven', then 'Ready: take it out'. Move '150°' outside the knob's radius. Style the checkbox, and use lining numerals on the chips.

### [MINOR · small] Timer robustness: focus is lost on Start, the timer freezes after back/forward cache, and there is no wake lock

*Lens:* function · *Verifier:* partly

**Evidence.** Tab to Start and press Enter, and document.activeElement becomes BODY because the button is hidden (WCAG 2.4.3). In a simulated pagehide/pageshow (persisted), the display froze at 5:59 for 10 fake minutes, because pagehide clears the interval and nothing restarts it. There is no navigator.wakeLock, so a sleeping phone won't chime on time. Correction: the auditor's audio-suspension risk only applies if Start is pressed within about 2.9 s of ticking Chime; otherwise Start resumes audio inside the tap. Merges function F04, F05 and F06.

**Fix.** Focus Pause after Start and 'Warm another' when done. Add a pageshow handler that restarts a running timer and recreates the audio lazily. Request a wake lock on Start and add a line: 'Keep this screen on while your tart warms'.

### [MINOR · small] Footers have no address, phone or hours, and menu.html never states opening hours

*Lens:* content · *Verifier:* confirmed

**Evidence.** The footer holds only the sign-off, a few links and the disclaimer. The menu text contains no '9am'. The footer starts at x=82 against the content edge at x=102 (1280). Merges content M9, function F17, design B22.

**Fix.** Add '288 Kew Road, Richmond TW9 3DU (map) · 020 8940 2752 · every day 9am–6pm, last walk-ins 5.30pm · Book' to both footers, aligned to the frame.

### [MINOR · small] 'Maids of Honour by post' implies single tarts and boxes of 6 and 12 can be posted

*Lens:* content · *Verifier:* confirmed

**Evidence.** Under 'Maids of Honour by post' the list shows Tart £2.25, Box of 6 £12.50, Box of 12 £25.50 and Box of 8 Postal Courier Service Edition £17.00. Only the box of 8 is identified as postal in the research. Merges content M8 and function F28.

**Fix.** List 'By post: box of 8, £17.00' first, then 'For collection or local delivery: single £2.25 · box of 6 £12.50 · box of 12 £25.50', or confirm with the owner.

### [MINOR · medium] No header navigation below 1080px, including tablets and iPad landscape

*Lens:* function · *Verifier:* confirmed

**Evidence.** .nav is display:none at 390, 768, 1024 and 1079, with no menu button in the header. 'Our story' and 'Tarts by post' can only be reached by scrolling, and 'Our story' isn't in the footer. Merges design B12 and function F07.

**Fix.** Add a compact Menu button (details or dialog) or a slim row of text links from about 600px. Add 'Our story' and 'Tarts by post' to both footers.

### [MINOR · small] Private dining and parties, wedding cakes, gift vouchers and the covered courtyard are all missing

*Lens:* content · *Verifier:* confirmed

**Evidence.** 0 mentions of any of them on either page, although all are in copy deck S5. The one-pager notes that Google reads set-tea prices from their gift-voucher shop. Content M10.

**Fix.** Add a short 'Celebrations & gifts' block to the last section, and mention the courtyard under Visit.

### [MINOR · small] The vegetarian mark appears on one dish only

*Lens:* content · *Verifier:* confirmed

**Evidence.** 'V' appears only on 'Vegetarian English' (17 diet marks in all, mostly GF, DF and VG). The legend explains it as 'Vegetarian, as named on the menu'. Content M12.

**Fix.** Mark every vegetarian dish after confirming with the owner, or drop V and say 'Many dishes are vegetarian; please ask'.

### [MINOR · small] The today strip says 'Open now · until 6pm' on 25 Dec, 26 Dec and 1 Jan, and overflows its card at 320px in the evening

*Lens:* function · *Verifier:* confirmed

**Evidence.** On a faked Europe/London clock, 25 Dec 12:00, 26 Dec 10:00 and 1 Jan 10:00 all return 'Open now · until 6pm'. At 320 wide and 22:45, 'Closed · opens 9am tomorrow' ends at x=307, past the card edge at 304. Merges function F14 and F16, content m11.

**Fix.** Add a list of holiday dates that shows 'Holiday hours may differ: please call 020 8940 2752'. Let the status wrap, or shorten the strings.

### [MINOR · small] 'Book a guest room' opens direct-book.com's own 404 page

*Lens:* function · *Verifier:* confirmed

**Evidence.** In Chromium the direct-book URL renders '404 Oh no! The page you are looking for does not exist.' https://www.maidshotel.co.uk/bookhere loads the Maids Guest Rooms booking page. Function F13.

**Fix.** Link to maidshotel.co.uk/bookhere, and mention the broken link to the owner as a useful find.

### [MINOR · medium] The 205KB filtered hero SVG animates forever and drives a slow LCP

*Lens:* function · *Verifier:* partly

**Evidence.** Idle main-thread time is about 3.6 s per 5 s with the hero visible, against 16 ms with it hidden. Throttled-phone LCP is 3.67 s, and the LCP element is tart-salver.svg. Correction: headless software raster inflates the CPU figure, and the 'steam ignores reduced motion' result comes from Playwright emulation, which may not reach an SVG-as-image; the SVG has its own prefers-reduced-motion rule. Merges function F11 and F12.

**Fix.** Ship a static optimised tart image (WebP or AVIF under 60KB) and put the steam in a small separate layer that stops after a few cycles or off-screen and is gated on the page's .motion class.

### [MINOR · small] Metadata and the AI layer have drifted, which matters because the pitch is about AI-readable text

*Lens:* content · *Verifier:* confirmed

**Evidence.** Menu JSON-LD still has 'FILTER COFFE', 'Prosseco', 'bed salad leaves' and the 'By-the-Slice’ Cakes' section; the House Salad offer is named with its whole description; and the Menu description lacks the caveat NOTES.md claims. The menu meta says 'transcribed from the 2024 menus'. There is no og:image, twitter:card or apple-touch-icon, so the shared link unfurls with no image. The preview title 'Maids of Honour · A royal secret' drops 'The Original'. llms.txt never says the minimum applies to Luncheon only, and has no set-tea prices. The lead line's text layer reads 'Our Famous £3.50' because the tart's name is only an SVG aria-label. Merges content m3, m4, m16, m18, m19 and p4, and function F32 (og part).

**Fix.** Re-run extract.js and build.js, then validate. Write a plain meta description. Add a 1200x630 og:image and an apple-touch-icon. Title the preview 'The Original Maids of Honour · A Royal Secret'. Add the luncheon-only line and the set-tea prices to llms.txt. Add a visually hidden text span with the tart's name.

### [MINOR · medium] The copy needs an editing pass: menu typos, verbatim errors, mixed time formats, ambiguous lines

*Lens:* content · *Verifier:* confirmed

**Evidence.** Menu: '(with Clotted Cream (or Butter) and Jam', 'The Champagne' cut off, 'China Green \ Darjeeling', 'Rooibush', 'Cardamon', 'ROSE WINE' over 'Rosé', 'Macon', 'Gordons', 'Fullers', Whiskey against Whisky, Chamomile against Camomile, and 'Royal £12' and 'Florentine £10' without 'Eggs'. Home quotes '48hours notice' and 'Tuesday, Wednesday Thursday'. Time formats: '9am–6pm' beside '17:30', and '12:00–15:00' over '12pm – 3pm'. 'None on Thursdays' is ambiguous about toast. 'Alcohol is served to customers over 18' drops 'with a meal', although the full licence line is on the same page. A dangling '…Online orders and vegan options' link ends a paragraph. 'Not the official The Original Maids of Honour website'. The chip tooltip reads 'To be confirmed with the restaurant' (x11). Merges content m1, m2, m5, m6, p1, p2 and parts of m7, m8, m9 and m21.

**Fix.** Apply one editing rule throughout: tidy as a live menu would, paraphrase their typos rather than quote them, and use one time style (9am–6pm, 12–3pm, 5.30pm). Write 'Not the official website of The Original Maids of Honour', and change the tooltip to '…with the tearoom'.

### [MINOR · small] With JS off, the header is transparent over body text and the timer looks live

*Lens:* function · *Verifier:* confirmed

**Evidence.** With JS off, .site-head is sticky with background rgba(27,27,30,0), so the wordmark overlaps body text (verify/shots/nojs-6400.png). 'Turn the key to see what's inside' refers to a hidden key, and the disabled Start button looks fully active. Merges content m14 and function F26.

**Fix.** Make the header background opaque by default and apply the transparent style only under .js. Hide the 'Turn the key' line and the timer controls unless .js is set.

### [POLISH · small] Menu-page anchor offsets, the 'Find us' target and the chip row

*Lens:* function · *Verifier:* confirmed

**Evidence.** At 390x660 the #before heading lands at top 100, under the sticky index (bottom 112). Course jumps land at y=311 of 660 because two scroll offsets stack. 'Find us' goes to index.html#visit, which leaves the map button at 700 in a 660px viewport. The chip row has no scroll cue, and 'Book a set tea' sits under the Patisserie List. Merges function F15, F18, F20 and F21, and parts of design B13 and content m17.

**Fix.** Add #before { scroll-margin-top: 48px } and use a single scroll offset. Point 'Find us' at #find. Add an edge fade to the chip row. Move 'Book a set tea' to the set-teas section.

### [POLISH · medium] Illustration and type details: floating lid, clipped salver, loose string, '£3·5o', postcard micro-text, plain ellipse labels

*Lens:* design · *Verifier:* partly

**Evidence.** The lid's velvet underside is narrower than the opening and floats above the back rim (verify/shots/rm-box-1280.png). The salver's foot is cut flat by the viewBox. The price-tag string ends in mid-air. The price layer reads '£3·5o' in IM Fell old-style figures (rm-price-390.png). The postcard's window text is about 5px and its caption rotates with the card. The revealed layers are plain cream cards. The ovals are plain ellipses, while their real label is a scalloped cartouche (box-a.jpg). At 2560 the art overruns while the text stays small. Correction: 'four or five clashing styles' and 'fails the swap test' are overstated. Merges design B5, B6, B8 (label part), B11, B15, B20, B24, B25, B27, B28 and B29.

**Fix.** Hinge the lid at full width. Extend the salver's viewBox. Tie the string to the stand or remove it. Use lining numerals for prices. Keep the postcard caption level and outside the card. Draw the scalloped label shape for the ovals. Cap the art width at very large widths.

## Refuted by the verifier

- **Stock 'historic' Google fonts instead of their lettering**: IM Fell English and Crimson Pro are the fonts the brief chose for this concept, and IM Fell is a period face, not a generic one. The brief gives display blackletter (Grenze Gotisch) to concept A, so a large blackletter here would blur the two concepts. B's own drawn textura already carries the ribbon, the wordmark's 'Newens' and the menu's tart line. Using it larger in one place is optional.
- **Partly fails the swap test**: It doesn't fail. The concept rests on the iron-box legend, their black-and-gold ribbon, their own reheating instruction, the 1907 Hill Street postcard and the line of keepers, none of which transfers to another bakery. The scalloped-label idea is kept as polish under V25.
- **The yellow preview banner clashes**: It is an intentional honesty element. At 390 it is about 88px, and the essentials on the first screen stay visible.
- **The today strip is a stock UI card**: The styling point is subjective: the card is legible, works and fits the box-label idea. Its time-format and skip-link parts are kept under V22 and V4.
- **The grey second half of the lede reads as disabled**: It is a deliberate two-tone emphasis and reads clearly in the screenshots.
- **'150°' has no unit**: The site quotes the bakery's own instruction verbatim. Adding °C, fan or other temperatures would add unverified facts. Raise it in the email instead.
- **GF badges are a regulated claim**: The badges reproduce the business's own 'Gluten & Dairy-Free' list, and the business itself names a 'Gluten Free' brownie. The legend states the source, and the allergen caveat sits directly above.
- **No transport line**: The research has no station or bus, and the walk is copy-deck TO CONFIRM item 13. 'Opposite Kew Gardens' is on the page.
- **Tea grades, health claims and smoothie names are cryptic**: This is verbatim menu copy, and the copy deck forbids explaining the smoothie names without confirmation.
- **The anonymous 'Today' keeper**: This is the right call, because ownership is disputed (TO CONFIRM item 2). It belongs in the email, not on the page.
- **No social links**: The copy deck, which is the only allowed source, lists no social URLs. They are optional once the owner confirms which accounts are active.
- **Menu order and repetition**: Leading with the Patisserie List is deliberate and tied to their printed list, which leads with the tart. '£3.50 five times' is overstated: it appears three times in the visible home text before the box opens. The 'Book a set tea' point is kept under V24.
- **Add 'last set-tea booking 5pm (from S8)'**: No 5pm or 'till 17:00' appears anywhere in the research. The set-tea naming mismatch comes from the business's own two sources and is folded into V22.
- **'Shop & Tea Room on 288 Kew Road' and 'Gratuity |' are grammar slips**: The first is the business's own homepage line, marked VERIFIED, and the pipe is printed on their menu. The dangling-link part is kept under V22.
- **'Book a table' lands on a table of identical Book buttons**: Each Book button sits on a labelled row (Every day, Breakfast, Luncheon, Set teas), and the separate widgets reflect the business's own ResDiary setup.
- **Replace the chips with † markers or a ?review=1 toggle**: The chips are intentional. The real problem, chips sitting on the owner's own claims and on facts the one-pager calls correct, is kept under V6.
- **The preview banner is four lines tall on small phones**: It is an intentional honesty element and does not hide the essentials. The og:image and title parts are kept under V21.
