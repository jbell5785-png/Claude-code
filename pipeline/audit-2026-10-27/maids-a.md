# Audit: Maids of Honour A · Teas (lead)

**Verdict:** Needs work · **Readiness:** 5.5/10

Not ready to send yet, but no redesign is needed. The content is accurate, and the drawing and live side-wall sign are genuinely this building's. What has to be fixed first: text ghosts through the sticky header, and every gold heading has broken outlines. The sign invents a 'morning coffee finished at 12 noon' rule and looks switched off outside 9am–6pm. The copy quotes the owner back to themselves and stamps TO CONFIRM on their own 'Serving you since 1850'. Fixing all this is about one focused day of small and medium edits.

| Lens | Raw findings | Impress owner | Craft | Usefulness | Accuracy |
|---|---|---|---|---|---|
| content | 34 | 5.5 | 7 | 6.5 | 6 |
| design | 32 | 5 | 5 | 7 | 7 |
| function | 22 | 6 | 6 | 7 | 6 |

## Strengths to keep

- The content is accurate. Menu prices and dishes match the business's own 2024 menus and Google's 26 Oct readings. Phone, email, address and all four ResDiary links (one per service) are correct. The legend is always labelled as legend, and no history is invented.
- The drawing of 288 Kew Road is one a regular would recognise: TEAS gable, Newens canopy with cresting and ivy, a lantern that lights while the shop is open, topiary, white iron chairs and the side sign. It is the best first impression in the pitch.
- The live side-wall sign is genuinely 'only here' and genuinely useful. It is built on their real painted board. Its logic is pure and Node-tested (11 of 11 pass), and handles GMT and British Summer Time correctly. Each line leads to its menu and its own booking widget, and the reduced-motion and no-JavaScript versions are complete.
- It puts the useful things first. On a 390x844 phone, status, hours, the address with a map link, Book and Menus are all on the first screen. Visit comes second, with hours and booking for each service, and a priced taster sits within two scrolls.
- There is a full HTML menu with jump links, the allergen statement and the service charge. Its structured data lists 135 items whose prices match the visible page.
- The fonts and colours are chosen for this client, not generic: Grenze Gotisch echoes the blackletter fascia, Alegreya the printed menus, and the green and gold come from the fascia. Concept A's fonts are not generic.
- The engineering is clean: no console errors or failed requests, a sensible keyboard path, an honest booking hand-off and a fast first paint.

## Verified findings (ranked)

### [MAJOR · small] Page text shows through the translucent sticky header and the menu tab row

*Lens:* design+function (merges A-F05) · *Verifier:* confirmed

**Evidence.** .hd is 94% cream (style.css line 234) and .mindex is 96% (line 803). Reproduced at 390 on the menu: 'Royal £12', '…ed salmon', 'Florentine £10' and the set-tea price table are readable behind the wordmark and tabs (verify/shots/menu-390-scroll.png, menu-setteas-390.png). On the index, 'Pause the glint' and the clock text show behind the cresting (sign-390-live.png). color-mix() has no solid fallback.

**Fix.** Give .hd, .hd::after and .mindex the solid background var(--cream), with an optional 1px shadow for depth. Always declare a solid fallback before any color-mix().

### [MAJOR · small] Every gold (gilt) heading shows box and notch artefacts inside the letters

*Lens:* design · *Verifier:* confirmed

**Evidence.** style.css applies -webkit-text-stroke 0.6px (line 150) and 0.4px (line 190) to the variable font Grenze Gotisch, so the stroke traces its overlapping contours. At 3x there is a rectangle in the 'T' of 'The Menus', boxes on the 'e' crossbars and notches in the 'M' (verify/shots/zoom-menu-h1.png). The footer 'Serving you since 1850' shows the same marks (zoom-footer.png). Downgraded from blocker: it is faint at 1x but visible on phones.

**Fix.** Remove both text strokes. Make the dark edge with text-shadow or filter: drop-shadow, or self-host a static Grenze instance with overlaps removed. Re-check at 3x.

### [MAJOR · small] The signature sign invents 'Morning coffee · Finished at 12 noon · back tomorrow'

*Lens:* content · *Verifier:* confirmed

**Evidence.** Shown at ?at=wed-12:30 and wed-15:30 (verify/scripts/times.js output; screenshot pub-i390-1530-s03.png). The source is lineNote() 'done' plus LINES coffee to: LUNCH_FROM in sign-logic.js. No end time for morning coffee is published; NOTES admits '09:00–12:00 is our reading'. The site's own Drinks board has an 'All day' gable (menu.html line 2278). Downgraded from blocker because it is a small logic fix.

**Fix.** Keep the 12:00 hand-off only for which line is gilded. Never show 'Finished' or 'back tomorrow' for coffee; after 12 noon use something like 'Coffee & pastries all day'. Delete the 'Morning coffee 9am to 12 noon · to confirm' fine print.

### [MAJOR · medium] Outside 9am–6pm (15 of every 24 hours) the signature looks switched off, and its caption is false

*Lens:* design+content (merges A-C11) · *Verifier:* confirmed

**Evidence.** At the real time of 04:58 GMT, every line is grey and nothing is gilded. The lede still says 'The gilded line is being served now. Tap a line for its menu, or a plate to book.' 'Pause the glint' is still shown, and the status reads 'Closed just now. The doors open today at 9am.' (src-i1280-live-s02.png, sign-390-live.png). An owner opening the email in the evening won't see the idea working.

**Fix.** Write the lede from the sign's state (closed: 'Closed now · we open at 9am with morning coffee'), and hide the glint button when nothing is lit. Add a 'waiting' state: the next day's first line in dim gold, with the lantern lit. In the pitch, send a ?at=wed-15:00 link or add a 'See it at teatime' link.

### [MAJOR · small] The 'another time' control rewrites the hero's today card and the lantern, and a scroll swipe can trigger it by accident

*Lens:* function+design (merges A-F02, A-C23, A-D26) · *Verifier:* confirmed

**Evidence.** Clock faked to Wed 10:30, then the control set to Thu 19:00. The hero card now says 'Closed just now. The doors open tomorrow (Friday)…' under a strip still reading 'Open now · until 6pm', and the lantern goes dark (override-top-1280.png). render() feeds the override to todayNow, the lantern and the mini-sign. CDP touch at 390x660: a 250px swipe starting on the 334px-wide slider scrolled the page and also moved the time 10:30→13:30. A purely vertical swipe moved it to 11:15. This is Chromium/Android behaviour; iOS likely needs a thumb drag. The control is an unstyled native select plus range.

**Fix.** Drive the hero card, lantern, mini-sign and menu index from live time only. Put the control behind a 'Try another time' button, or replace the range with ±15-minute step buttons. Show 'Showing Thu 19:00, not now' while overriding. Style the control as part of the board.

### [MAJOR · small] The signature board is undersized on phones, tablets and laptops

*Lens:* design+function (merges A-F06, size part of A-C22) · *Verifier:* confirmed

**Evidence.** Measured sign width: 224px at 320, 256px at 390 and also at 768 (tablet), 302px at 1280x800, 282px at 1366x768. In-sign notes render at 7.7–10.4px. BOOK plates are 43x34px at 390, below the 44px NOTES claims. At 1280 the 'Painted on the side wall' heading board outweighs the sign.

**Fix.** On phones and tablets run the sign at full content width (about 340–420px). On desktop, size it from the column width, not 100vh. Set a 13px floor for notes or move them out of the SVG, make plates at least 44px, and shrink the section heading.

### [MAJOR · small] The owner's own 'Serving you since 1850' is stamped TO CONFIRM, contradicting the one-pager

*Lens:* content · *Verifier:* confirmed

**Evidence.** Both page footers put a TO CONFIRM chip under the gilt sign-off, and the Alfred/1850 line has another (pub-i390-1530-s09.png). The one-pager promises 'One history line, “Est. 1850 (our own date)”' plus structured data, yet the JSON-LD and llms.txt have no history line. The brief allows this line as their own claim.

**Fix.** Remove the footer chip on both pages and present the date as theirs. Keep at most one quiet marker on the disputed year in the story. Add 'Est. 1850 (the business's own date)' to the JSON-LD and llms.txt.

### [MAJOR · medium] 'Our story' is a collage of the owner's own copy in quotation marks, told backwards, with their typos

*Lens:* content+design (merges A-D14, A-C25) · *Verifier:* confirmed

**Evidence.** Each page has 16 opening curly quotes. The story opens with wartime bomb damage, then 'John Newens’ son Peter…' before John is introduced. It reproduces 'set work to get the business back on its feet' and 'Tuesday, Wednesday Thursday'. Rules are quoted too. Peter is missing from 'The Newens line'. It reads like a research dossier, against voice rule (d)1 (pub-i390-1530-s05 to s08).

**Fix.** Rewrite it in 'we/our' from copy-deck facts and in time order: Hill Street, Robert, Alfred on Kew Road, John & Kathleen, the war damage, Peter's rebuild, today. Keep two or three signature quotes ('pile of rubble', 'still a secret'). Drop quote marks from rules, fix typos silently, and list the edits in NOTES.

### [MAJOR · medium] Revenue lines the owner promotes today are missing: gift vouchers, celebration and wedding cakes, takeaway teas

*Lens:* content · *Verifier:* partly

**Evidence.** Neither page mentions gift vouchers, wedding or special-occasion cakes (copy deck §1 facilities), or High Tea at Home £28 and the Afternoon Cream Tea for four £38 (§3). 'Order online' goes to their homepage. Social links appear only in the dossier, not the copy deck (the only allowed content), so leaving them out was by rule; that part is not a fault.

**Fix.** Add a compact 'Take Maids home' block: tarts by post, takeaway teas with prices, celebration and wedding cakes, gift vouchers and collection. Point 'Order online' at the shop. Raise social links with the owner.

### [MINOR · small] Designer labels and arbitrary gables remain

*Lens:* content+design (merges A-D21, gable part of A-D10) · *Verifier:* confirmed

**Evidence.** Labels: 'Painted on the side wall' (nav says 'Served today'); '…or a plate to book'; 'Pause the glint' / 'Play the glint'; 'Read the sign at another time' with 'Today, live' and 'live'; 'Skip past the sign'; 'Second Courses, continued'. Gables: '288', 'Prices', 'Now', 'Kew Road', and 'Teas' over 'The Menus'. All are visible in screenshots.

**Fix.** Use literal labels: 'What's on now', 'Tap a line for its menu, or Book to reserve that sitting', 'Pause animation', 'Check another day and time'. Make gables meaningful or drop them.

### [MINOR · small] Twelve TO CONFIRM chips, four in the hours-and-booking block, make the most useful section look unfinished

*Lens:* content+design+function (merges A-D05, A-F19) · *Verifier:* partly

**Evidence.** 9 chips on the index and 3 on the menu. Three of the four Visit rows end in a chip, and some lines become fragments (pub-i390-1530-s01/02). The chips are spec-mandated, but their volume and placement hurt. Correction: the copy deck itself lists the Thursday rule as a question (§4 item 5), but Google confirmed it on 26 Oct, so that chip can go.

**Fix.** Remove the footer 1850 chip, the morning-coffee chip, the duplicate bank-holiday chip and the Thursday chip. Rewrite fragments as sentences ('Bank holiday hours: please call'). Keep chips only for the £22/£20 luncheon minimum, holiday hours and step-free access.

### [MINOR · small] The hero today strip is a separate, untested copy of the hours and goes stale

*Lens:* function · *Verifier:* confirmed

**Evidence.** Faked clock 08:58→09:01: the strip stayed 'Closed · opens 9am today' while the card switched to 'Morning coffee…' and the lantern lit. The inline hero script runs once, and main.js never updates the strip.

**Fix.** Move the strip text into sign-logic.js, add Node tests, and update it in render() and on pageshow/visibilitychange.

### [MINOR · small] From 17:30 the hero says 'Open until 6pm · no walk-ins' while the counter is selling

*Lens:* content (merges A-F13) · *Verifier:* confirmed

**Evidence.** At ?at=wed-17:45 it sits above 'Cakes & pastries · On the counter until 6pm'. 'Walk-in' is defensible as table seating but reads as 'don't come in'. Downgraded from major.

**Fix.** 'Shop open until 6pm · last tables were seated at 5.30pm'.

### [MINOR · small] The preview banner wraps to four lines and, at 390x660, pushes the hero's Book under the action bar

*Lens:* design+function (merges A-F07, A-C34) · *Verifier:* partly

**Evidence.** Measured 88 CSS px at 390 (the design auditor's '172px, a fifth of the screen' was device pixels) and 106px at 320. At 390x660 the strip's 'Book a table' (561–609) sits under the bar (594); at 390x844 it clears. 'the official The Original Maids of Honour' doubles the article. The 'independent studio' wording is spec-mandated.

**Fix.** One line on phones ('Design proposal, not the official Maids of Honour site'), with the grammar fixed in both the banner and the footer.

### [MINOR · small] The hero's left column breaks apart between 1000 and 1280px

*Lens:* design+function (merges A-F10, A-F20) · *Verifier:* confirmed

**Evidence.** At 1280, '17:30' sits alone on a line and '· Map' detaches to the far right of the wrapped address (src-i1280-1530-first.png). At 1024, the eyebrow wraps into the 'Today' gable and a large empty area sits under the drawing (hero-1024.png).

**Fix.** Make the address link inline, not inline-flex. Add margin under the eyebrow. Use the stacked layout, or a wider left column, between 1000 and 1200.

### [MINOR · small] At 1920px and wider the drawing ends in a hard vertical cut through a tree, and section left edges disagree

*Lens:* function+design (merges A-D19, edge part of A-D08) · *Verifier:* confirmed

**Evidence.** The art spans x 641–1800 with a straight cut through the right tree (hero-1920.png). Left edges at 1920: hero card 160, sections 260, story board 300, skip band 40.

**Fix.** Fade the right edge as the left is faded, or let the trees bleed off the page. Put every section on one container token.

### [MINOR · small] BOOK plates beside HOME MADE BREAD and CAKES & PASTRIES; the bread line links to Bakery breakfasts

*Lens:* content+design+function (merges A-D07, A-F18) · *Verifier:* partly

**Evidence.** Both counter plates open the general ResDiary table booking (32717), and bread links to menu.html#bakery (croissants and Danish). MORNING COFFEE linking to the breakfast menu is defensible. The diamonds the design auditor called inconsistent are the 'also now' state marker.

**Fix.** Make those two plates 'Order' (the shop's bread or patisserie categories) or remove them. Keep BOOK for the three sittings.

### [MINOR · small] In Grenze Gotisch, names read 'Ilewens' and 'Ilashbar', and the gable reads 'Ilew Road'

*Lens:* content · *Verifier:* partly

**Evidence.** Seen at 390 in 'The Newens line' and the 'Kew Road' gable (pub-i390-1530-s05/s06). This is authentic blackletter, but it hurts legibility of surnames. The sign-size part of this finding is merged into A-D06.

**Fix.** Set people's names and small gable labels in Alegreya bold or small caps, and keep Grenze at 24px or larger.

### [MINOR · small] 'From our 2024 menus. Prices may have changed.' voices the researcher's caveat as the tearoom

*Lens:* content (merges A-F15) · *Verifier:* partly

**Evidence.** It sits under the menu H1 (src-m390-first.png), on the taster and in the meta descriptions. Some marker is required by the honesty rules, but the 2024 menus are the ones on the owner's site, and Google matched the set-tea prices on 26 Oct. NOTES claims the menu JSON-LD carries the caveat; it doesn't.

**Fix.** Replace the sentence with one small chip by the menu H1. Drop it from the taster and the meta descriptions, and put the 2024 caveat in the pitch email. Correct NOTES.

### [MINOR · small] Menu page: two competing active tab states, a clipped 'EON now' tab, and a 'Teas' gable over 'The Menus'

*Lens:* design · *Verifier:* partly

**Evidence.** The filled 'LUNCHEON now' tab and an underline on the current section show at once, and the filled one is clipped while scrolling (menu-390-scroll.png, menu-setteas-390.png). Set teas start about 6,500px down at 390, which is acceptable: the menu follows the day and the sticky row jumps there in one tap. The allergen box near the top is required by standard item 26.

**Fix.** Show 'now' as a small dot, not a filled tab. Shorten the allergen box to the legend plus a link. Make the gable meaningful.

### [MINOR · small] Times are written in mixed formats

*Lens:* content+design (merges A-D22) · *Verifier:* confirmed

**Evidence.** 'last walk-ins seated 17:30' (hero) against '5.30pm' (sign); '10:00' (menu) against '10am'; 'Monday – Sunday, 12:00 – 15:00. Minimum Charge £22 Per Person, 12pm – 3pm.'

**Fix.** One style everywhere ('9am–6pm', '5.30pm', '12 noon–3pm'), including the sign-logic.js strings.

### [MINOR · small] Skip links point backwards, and the first phone screen repeats Book three times

*Lens:* content+design+function (merges A-D13, A-F21) · *Verifier:* confirmed

**Evidence.** 'Skip to visit info' sits after the taster and jumps back up to Visit; the hero has another just above Visit. The first phone screen has header, card and bar 'Book' buttons (pub-i390-1530-first.png).

**Fix.** Replace the second skip link with 'Skip to our story' and drop the hero skip link. Hide the header Book on phones.

### [MINOR · small] 'Tarts by post' and 'Order online' go to the wrong shop pages

*Lens:* content+function (merges A-F14, A-D28) · *Verifier:* confirmed

**Evidence.** 'Tarts by post' goes to /collections/maids-of-honour-tart (the single tart). The postal box is /collections/posting-maids-of-honour (curl: 200, 'Box of 8x Maids of Honour Tarts'). 'Order online' goes to the homepage.

**Fix.** Relink both, and say '£17 for 8, posted Mon–Thu'.

### [MINOR · small] The largest hero text is the old strapline, set larger than the name

*Lens:* design+content (merges A-C31) · *Verifier:* partly

**Evidence.** 'A Historic Traditional English Tearoom Shop and Bakery.' is about 40px italic at 1280. The name is real text in the header wordmark, so standard item 1 is met.

**Fix.** Punctuate it and make it smaller ('A historic English tearoom, shop and bakery'), or lead with 'Home of the Maids of Honour tart, opposite Kew Gardens'.

### [MINOR · medium] Drawing details and the cresting ornament are cruder than the building

*Lens:* design (merges A-D09) · *Verifier:* partly

**Evidence.** The 'generic clip-art' charge is rejected: the drawing is recognisably 288 Kew Road and is the strongest asset. Detail problems compared with outside.jpg: the canopy reads as bright red brick coursing, not dark clay tile, and the roundels are grey target discs. The repeated header and footer cresting is a row of 'Φ' pins.

**Fix.** Retexture the canopy as dark overlapping tiles and redraw the roundels as greenish crown glass. Draw a pierced cresting tile from rtt.jpg for the header and footer only, and give menu sub-headings a quieter rule.

### [MINOR · small] Matching H2 boards are three different sizes on phones

*Lens:* design · *Verifier:* confirmed

**Evidence.** Computed at 390: 'Visit us' 24.3px; 'From the menus' and 'Painted on the side wall' 31px; 'Our story' 38px.

**Fix.** Use one H2 board size.

### [MINOR · small] At 320px the page scrolls sideways by 5px

*Lens:* design · *Verifier:* confirmed

**Evidence.** scrollWidth is 325 at 320. Wrapping the admin@ email link in .rooms brings it back to 320.

**Fix.** Add overflow-wrap:anywhere on the email link (or use 'Email us'), and minmax(0,1fr) on .front__cols.

### [MINOR · small] The 'Allergens' jump hides its heading under the sticky chip row

*Lens:* function · *Verifier:* confirmed

**Evidence.** After the click, the H2 top lands at 95–96px while the chip row ends at 125, at both 390 and 1280. Set teas land clear, at 204.

**Fix.** Give .before the same scroll-margin-top as .msec.

### [MINOR · small] With enlarged text the fixed 64px header clips the wordmark and the Book button

*Lens:* function · *Verifier:* confirmed

**Evidence.** At a 150% root font, .hd__in has scrollHeight 85 in a 63px box; the wordmark and 'Book a / table' are cut by the cresting (text150-390.png).

**Fix.** Use min-height and a rem-based --hd-h. Show just 'Book' below 360px.

### [MINOR · small] On a landscape phone, sticky chrome covers about half the screen and the home status is off the first screen

*Lens:* function · *Verifier:* confirmed

**Evidence.** At 844x390, the menu's header plus chip row (0–125) and bar (324–390) take 191 of 390px. On the index the status starts at y=602, below the bar.

**Fix.** Under @media (max-height:500px), drop the sticky crest and chip row, slim the bar, and shorten the hero crop.

### [MINOR · small] Everything says 'Open now' on Christmas Day and bank holidays

*Lens:* function · *Verifier:* confirmed

**Evidence.** Faked clock at 25 Dec 2026 11:00: the strip says 'Open now · until 6pm' and the sign says 'Now serving: Morning coffee…'. NOTES lists this as a known limitation.

**Fix.** On UK bank holidays and 24–26 Dec and 1 Jan, show 'Bank holiday: hours to be confirmed, please call' until the owner supplies a closures list.

### [MINOR · small] The taster leaves out the weekday £15 roast and 'not Thursdays'

*Lens:* content · *Verifier:* confirmed

**Evidence.** Roast shows £18 with no 'Weekday Special: £15' (copy deck line 222); the Full English line omits the Thursday rule.

**Fix.** Roast: '£18 · weekdays £15'. Full English: 'last orders 11am · not Thursdays'.

### [MINOR · small] 'Royal' and 'Florentine' appear as stand-alone dishes

*Lens:* content · *Verifier:* confirmed

**Evidence.** menu.html line 1997 and the JSON-LD names. The copy deck has them as Benedict variants.

**Fix.** Call them 'Eggs Royale' and 'Eggs Florentine', or nest them under Eggs Benedict, and update the JSON-LD.

### [MINOR · small] The status sentences read as machine-assembled

*Lens:* content · *Verifier:* confirmed

**Evidence.** 'Now serving: Teas. Set tea sittings · last walk-ins seated by 5.30pm. Also: home made bread and cakes & pastries.' and 'Closed just now' at 04:58.

**Fix.** Write full sentences per state, and use 'Closed now'.

### [MINOR · small] The getting-there line reads as a research gap

*Lens:* content · *Verifier:* confirmed

**Evidence.** 'On-street parking. Step-free access and the walk from Kew Gardens TO CONFIRM', directly under 'Opposite Kew Gardens'.

**Fix.** 'Opposite Kew Gardens. On-street parking. Step-free access: please call ahead.'

### [MINOR · small] The link preview and metadata are weak

*Lens:* content · *Verifier:* confirmed

**Evidence.** Neither page has og:image or og:url. The published title is 'Maids of Honour · Teas', the concept codename.

**Fix.** Add a 1200x630 frontage render as og:image, add og:url, and restore the descriptive title.

### [MINOR · small] llms.txt leaves out the facts people ask AI most

*Lens:* content · *Verifier:* confirmed

**Evidence.** llms.txt has no breakfast or Thursday rule, no tart or tart prices, and no history line.

**Fix.** Add a breakfast line, the tart, 'Est. 1850 (the business's own date)', and postal and delivery days.

### [MINOR · small] The tablet header has no navigation at 768–999px

*Lens:* design · *Verifier:* confirmed

**Evidence.** .hd__nav is display:none at 768. The action bar does show Book, Menus and Call.

**Fix.** Show a compact nav (Menus · Hours · Our story) from about 700px.

### [MINOR · small] Dietary marks are sparse, and the taster's allergen note isn't a link

*Lens:* content · *Verifier:* partly

**Evidence.** Only 'Vegetarian English' carries V. Adding V or nut marks the business doesn't print would invent allergen facts, so the fix is a question for the owner. The taster's allergen note has no link.

**Fix.** Add V and nut marking to the owner's question list, and link the taster note to menu.html#before.

### [POLISH · small] Booking lines claim phone booking and read ambiguously

*Lens:* content · *Verifier:* partly

**Evidence.** 'Book online, or call 020 8940 2752': no source says tables are booked by phone. 'Vegan? Please call: bookings need 24 hours’ notice.' can read as applying to every booking.

**Fix.** 'Book online; questions: 020 8940 2752.' and 'Vegan? Call us at least 24 hours ahead.'

### [POLISH · small] Menu typos, made-up headings, separators, repeated facts and inconsistent formatting

*Lens:* content (merges A-C17, A-C21, A-D31, A-C26, A-C27, A-C32, A-C33) · *Verifier:* partly

**Evidence.** Some typos kept, others fixed: Cardamon, Rooibush, Fullers, Gordons, Macon, Whiskey/Whisky, Chamomile/Camomile. The Darjeeling note ends at 'The ‘Champagne’'. 'Second Courses, continued' is made up. '·' separators read as 'all included' and dangle at the ends of wrapped lines (menu-setteas-390.png). Hours appear about six times. The guest-room phone is unlabelled. The layered SVG puts 'TEAS' three times into innerText. Parts not upheld: the tooltip wording and HTML comments are spec-mandated.

**Fix.** Apply one house style and list the edits in NOTES; finish the Darjeeling line. Drop 'continued'. Use 'or' and 'Choose:' for choices, with nowrap separators. Label the phone numbers. Mark duplicate SVG text layers aria-hidden.

### [POLISH · small] Housekeeping and finish

*Lens:* function (merges A-F22, A-D23, A-D24, A-D25, A-D29, A-D30) · *Verifier:* partly

**Evidence.** The glint keeps animating while the sign is off-screen (310 gradient mutations in 12s at the top of the page). img/frontage.svg and img/side-sign.svg are published but unused, and the topiary SVG is inlined twice. The action-bar icons don't match, the footer fills only the left half at desktop, there are orphans, and motion is subtle.

**Fix.** Gate the glint with IntersectionObserver. Drop unused assets. Unify the icon style, give the desktop footer a right column, and add text-wrap: balance to headings.

## Refuted by the verifier

- **The famous tart never appears as a picture**: Intentional concept separation. Concept B is the tart concept, and NOTES says A shows the tart only as a line so the three concepts stay distinct. Optional at most.
- **The header wordmark isn't the tearoom's own logo lettering**: Intentional and disclosed. The brief forbids copying or tracing their images, and NOTES §6 says to swap in their vector logo once supplied.
- **The layout is a standard template section stack in heritage colours**: Overstated. The frontage drawing, live side-wall sign, canopy band and fascia board system are specific to this building, and the fonts and palette come from the real fascia. The real part (identical boards with arbitrary gables) is kept under A-C07 and A-D08.
- **Gap to Awwwards/FWA hospitality level**: Not a discrete finding. It restates D01–D17, which were each verified on their own.
- **Dragging the slider floods screen readers with 44 announcements**: Not reproduced. The live summary only changes at service boundaries: a full 08:00→19:00 sweep in 15-minute steps made 7 updates, not 44.
- **The Ellis Wines quote is cut short but presented as complete**: Intentional. Copy deck §2 says not to use the rest of that sentence. An ellipsis would be marginally neater, but it is not an error.
- **Tooltip says 'restaurant'; TO CONFIRM HTML comments left in; work credited to an anonymous 'independent studio'**: All three are mandated verbatim by the round-1 tech spec that v2 inherits. Joseph Bell is already named in the one-pager and pitch email. The other parts of these findings are kept above.
