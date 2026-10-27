# Audit: Maids of Honour C · The tearoom

**Verdict:** Needs work · **Readiness:** 5/10

Concept C has accurate facts, full HTML menus and a genuinely specific red-room stand and plate rail, but it is not ready to send. The signature stand can be left empty, the famous tart is drawn like a pancake stack, the desktop hero has visible drawing errors, and the copy reads like a researcher quoting the owner. Expect two to three focused days of fixes.

| Lens | Raw findings | Impress owner | Craft | Usefulness | Accuracy |
|---|---|---|---|---|---|
| content | 31 | 5 | 6 | 7 | 6.5 |
| design | 28 | 4 | 4 | 7 | 6 |
| function | 29 | 6 | 6.5 | 7 | 7 |

## Strengths to keep

- The facts are accurate. Hours, service windows, set-tea contents and prices, tart prices and allergens, phones and email all trace to the copy deck. The legend is labelled, disputed dates are avoided, and booking is an honest ResDiary hand-off (widget 33177 renders the Maids calendar).
- Every menu is readable HTML with prices, plus a valid Menu JSON-LD with 7 sections. This is the core of the AI-visibility pitch, since Google currently guesses prices from the voucher shop.
- The red-room set-tea section is genuinely only-here. The chrome stand sits in front of the gilt mirror, the transferware rims are the studio's own, and the fizz teas price correctly for 1 to 4 guests. The Special Set Tea state looks lovely.
- 'Still here' is a real, nameable layout idea: three blue-and-white plates on an oak rail telling the building's story, with sourced copy.
- It is useful first. At 390x844 the first screen carries a live London-time status, the hours, the address and Book, and the Visit card gives each service its own Book button.
- It is solidly built. There are no console errors or failed requests and no horizontal overflow from 320 to 1920. Both Google fonts load, native radios drive the chooser, there is a no-JS fallback, and reduced motion is respected.

## Verified findings (ranked)

### [MAJOR · small] Signature stand goes empty if a party size is picked within about 0.4 s of choosing a fizz tea (C-F01)

*Lens:* function · *Verifier:* confirmed

**Evidence.** I reproduced it with Prosecco then '2' at gaps of 100, 250 and 400 ms. Each time 0 of 12 food items were visible while the label read 'On the stand: Prosecco Set Tea £70' (verify/shots/race-100.png). At a 600 ms gap it worked. The cause is in stand.js change(): the guests change replaces state.busy, so the tea change's liftOff().then() returns before paint(). The old items stay at fill:forwards opacity 0, and later guest changes only redraw the table. I lowered it from blocker because a deliberate user usually takes longer than 400 ms, but the failure is total and it sticks.

**Fix.** In change(), when a tea change is still pending and a guests change arrives, run a full paint() instead of a table-only one. Cancel running animations (el.getAnimations().forEach(a=>a.cancel())) before repainting.

### [MAJOR · medium] The famous tart is drawn as a pancake stack or pie, on the menu hero, the hero table and the stand (C-D02)

*Lens:* design · *Verifier:* confirmed

**Evidence.** The drawing has straight tan bands and a flat orange top with blobs (verify/shots/menu390x660.png, d-_teas__st_scene.png). The business's tart.jpg shows a pale, domed, flaky puff case with a custard-yellow top blistered with caramel. It is the first image on menu.html. I lowered it from blocker.

**Fix.** Redraw the f-tart symbol and the menu-hero tart from tart.jpg: an irregular laminated rim, a pale filling with 3–5 caramel blisters, and no horizontal bands.

### [MAJOR · medium] The desktop hero has visible drawing errors, and the first screen could be any tearoom (C-D01, C-D10, C-20)

*Lens:* design · *Verifier:* confirmed

**Evidence.** In d-hero.png and d-hero-pedestal.png: the chair splats are dark keyhole blobs with a wheel and two oval holes, so they read as faces. There is a misaligned inner arc in each hoop, a white wedge where the pedestal meets the legs, and doubled chandelier shades. The window shows green hills. On phones and tablets the chairs are cropped to dark half-wheels and the table and tart are cut off (i390-00.png, t768.png). The drawing errors are confirmed; the 'clip-art' charge is only partly fair. I lowered it from blocker.

**Fix.** Redraw the splats as pierced wheel-backs in a lighter oak and drop the inner arcs. Join the pedestal to its legs. Use a single ring of shades with candle cups. Show Kew Road or the Gardens' railings in the window. Crop the phone hero to the table and tart. Add 'home of the Maids of Honour tart' to the hero line.

### [MAJOR · medium] The business quotes itself in quotation marks throughout its own site, and some read as scare quotes (C-02, plus C-09, C-15 and the strapline part of C-28)

*Lens:* content · *Verifier:* confirmed

**Evidence.** There are 19 opening quotation marks on index and 25 on menu at 1280. Examples: tarts and “certain produce”; Fully licensed, and “available for parties & private functions”; the hero strapline sits in quotes; made “every day, seven days a week”. The quoting also brings the owner's own slips into headline positions ('set work to get the business back', '1960’s'). Plate 1 quotes a caption for a photo the page doesn't show. tech-spec-v2 asks for copy in the business's own voice.

**Fix.** Paraphrase in the first person ('We bake everything here, every day'; 'We post tarts and other bakes, nothing with fresh cream, Monday to Thursday'). Keep quotation marks only for the 1947 surveyor and the legend. Rewrite the plate 1 caption as a plain description.

### [MAJOR · small] On phones, and in the DOM and JSON-LD, the luncheon menu lists Afters before Second Courses (C-01)

*Lens:* content · *Verifier:* confirmed

**Evidence.** At 390 the DOM order is First Courses y11826, Afters y12247, Second Courses y12544. The JSON-LD luncheon subsections run First, Afters, Second, Baker's, Second. Both the printed Food_Menu_2024.jpg and the copy deck put AFTERS last. At 1280 it only looks right because of the two columns. I lowered it from blocker.

**Fix.** Move the Afters block after the Smoked-Salmon Open Sandwich in the source, lay out the desktop columns with CSS grid, and regenerate the JSON-LD.

### [MAJOR · small] All 8 menu 'Back to top' links sit flush against the screen edge, and the wine one is near-invisible (C-24, C-D03, part of C-D21)

*Lens:* design · *Verifier:* confirmed

**Evidence.** Measured left is 0 at both 390 and 1280. The cause is .totop { margin: 1.4rem 0 0 } on style.css line 705, which overrides .wrap's margin-inline:auto. In #m-wine the link is rgb(31,63,143) on burgundy, about 1.4:1 contrast (verify/shots/btt-wine-390.png). There is also about 200px of dead space after each link.

**Fix.** Use .totop { margin-top: 1.4rem } and .msec--red .totop a { color: var(--gilt-l) }, and trim the trailing section padding.

### [MAJOR · small] 'Afternoon tea' never appears, though it is the search the business already wins (C-05)

*Lens:* content · *Verifier:* confirmed

**Evidence.** A case-insensitive search finds 0 hits on both pages, in both meta descriptions and in llms.txt. real-google-notes.md shows Maids listed first for 'afternoon tea near Kew Gardens', and the pitch argues for protecting that. The meta description ends '…and the tart.'

**Fix.** Use an eyebrow 'Afternoon tea · the set teas'. Make the meta, og and JSON-LD description 'Afternoon tea, luncheon and breakfast opposite Kew Gardens, home of the Maids of Honour tart', and mirror it in llms.txt.

### [MAJOR · small] The shop, gift vouchers and celebration cakes are buried or missing (C-06, shop-link part of C-F22)

*Lens:* content · *Verifier:* confirmed

**Evidence.** There is no Shop item in the nav or the dock. 'voucher', 'wedding' and 'celebration' each appear 0 times, although the copy deck lists Gift Vouchers and Wedding & Special Occasion cakes. 'Visit the shop' links to /collections/maids-of-honour-tart. The owner's current site is a Shopify shop, and Google prices their teas from the voucher page.

**Fix.** Add Shop to the header and the dock. Add a line and a link each for gift vouchers, celebration and wedding cakes, and teas at home. Point 'Visit the shop' at the shop home. Rename the nav item 'Bakery & shop'.

### [MAJOR · large] The layout is still mostly a conventional section stack (C-D08, with C-D04 folded in)

*Lens:* design · *Verifier:* partly

**Evidence.** The page runs: split hero; info card with roundel; two-column price list; dark three-column band; plates; text and image split; three cards; footer. tech-spec-v2 says nothing should look like a template section stack, and the user asked about generic layouts. The red room and the plate rail are real ideas. The illustration has two languages (full-colour room, mono cobalt china) with a logic to them, not three clashing styles.

**Fix.** Make the red room a full-bleed, scale-contrast moment with a larger stand and the chooser as place cards on the cloth. Replace the closing three cards with something drawn from the building, such as a cross-section or the side-wall sign lines.

### [MINOR · small] Too many 'to confirm' chips cluster on the most-read card, and some are needless (C-03, C-D12, C-F20)

*Lens:* content · *Verifier:* partly

**Evidence.** On index at 390, 5 chips fall between y950 and y2010, and 3 of the 4 rows in the hours card carry one. Most of them are legitimate copy-deck §4 items. 'Step-free access and the walk from Kew Gardens TO CONFIRM' tells a diner nothing, and the footer chip on the business's own sign-off isn't needed.

**Fix.** Delete the step-free line (keep it in the pitch notes) and the footer chip. Write full sentences ('Bank holiday hours: please call'). Optionally use one quiet superscript marker with a single 'Details to confirm with you' note.

### [MINOR · small] The footer 'to confirm' chip on 'Serving you since 1850' is invisible (1:1) but still announced (C-08, C-F08)

*Lens:* content · *Verifier:* confirmed

**Evidence.** The chip is rgb(107,74,46) on the footer's rgb(107,74,46), a 1:1 ratio, with a title tooltip. Screen readers read 'to confirm'.

**Fix.** Delete it; the brief allows the line as the business's own claim. Don't make it visible, as C-F08 suggests.

### [MINOR · small] The stand doesn't fit short laptop viewports or short phones (C-F05, C-F07)

*Lens:* function · *Verifier:* partly

**Evidence.** The scene is 821px tall with sticky top:90. At 1366x768 with the chooser in view, the top two plates sit under the masthead (vp-l1366-teas.png); 1280x720 behaves the same. At 1280x800 and 1536x864 only the small print is cut. At 390x844 everything fits; at 390x660 the price and Book are under the dock; at 320x568 the bottom plate is too. The fizz party row pushes the stand down.

**Fix.** Cap the SVG at max-height: calc(100svh - var(--head-h) - 240px), make it sticky only at min-height 860px, and reserve the party row's height.

### [MINOR · small] Copy slips on the signature stand (C-07, C-D23)

*Lens:* content · *Verifier:* partly

**Evidence.** 'Small ’Taster’' uses a closing quote to open (index.html:381). The fizz wine is printed twice. 'Book a High Tea from 10:00, any day.' is followed by 'Can be booked from 10:00.' Other slips: 'The Prosecco teas', 'Book The Special Set Tea', and nested parentheses on the Special scones. 'Vauban Frère’s' is verbatim from the owner's printed menu, so it isn't the designer's typo.

**Fix.** Fix the quote in the stand.js data, show the wine once, keep one booking-time line, write 'the Prosecco tea', and write 'Two scones, plain or fruit, with clotted cream (or butter) and jam'. Use one Vauban spelling.

### [MINOR · medium] The stand drawing looks thinly laid and the fizz props collide (C-D07, C-F21)

*Lens:* design · *Verifier:* partly

**Evidence.** On High Tea and the fizz teas the food covers about a third of each plate. The left upright drops straight while the right hooks out. For Champagne for 4 the bottle and flutes crowd the stand's foot (champ4.png). At 390 the items are tiny. The Special Set Tea looks well laid (special.png).

**Fix.** Scale the food about 1.4–1.6x with overlap, mirror the stand's feet, and space the flutes across the cloth.

### [MINOR · small] Phones get no navigation, and the docks differ between pages (C-D22, C-F09, C-F18, C-31)

*Lens:* function · *Verifier:* confirmed

**Evidence.** .nav is display:none below 960 with no toggle. The first phone screen shows 'Menus' three times. The index dock is Book·Menus·Call; the menu dock is Book·Call·Find us.

**Fix.** Add a compact menu button, and use the same dock on both pages.

### [MINOR · small] Neither footer has the address or hours, and the menu page shows no hours at all (C-21, C-D17, C-F10)

*Lens:* content · *Verifier:* confirmed

**Evidence.** From the text dumps: the index footer has Visit & hours, menus, book, official site and Instagram; the menu footer adds a phone number. Neither has an address or hours.

**Fix.** Add '288 Kew Road, Richmond TW9 3DU · 020 8940 2752 · Open every day 9am–6pm' and a Book link to both footers.

### [MINOR · small] The menu page is slow to reach food: an empty desktop half-hero, a policy wall, and jump chips under the dock (C-23, C-D16, C-F12)

*Lens:* design · *Verifier:* confirmed

**Evidence.** At 1280 the hero's right half is blank (m1280-00.png). About 180 words of policy come before the first dish. The page is 25,024px tall at 390. At 390x660, .mnav (582–631) sits under the dock (597).

**Fix.** Shrink the tart plate and use the right column for the jump links or the High Tea card. Cut 'Before you order' to the legend plus a link to the full notes. Add an edge fade to the chip row.

### [MINOR · small] Designer's voice and visible skip links (C-19, C-D15, C-F24)

*Lens:* content · *Verifier:* confirmed

**Evidence.** 'Skip past the stand / Skip to visit info' are visible mid-page at every width. Other lines: 'Choose your tea and see the stand', 'See any tea laid out on the stand', 'From the menus, priced.'. The og says 'watch the three-tier stand fill'. The menu og is third person ('as printed on the tearoom’s 2024 menus').

**Fix.** Hide the skip links until focused. Rewrite the og descriptions as diner value. Use 'Set teas from £24.50' and 'A taste of the menus'.

### [MINOR · small] Two identical 'Book a table' buttons on the first screen do different things (C-F06)

*Lens:* function · *Verifier:* confirmed

**Evidence.** The masthead button opens ResDiary 32717; the Today card's goes to #book (index.html, tstrip__acts).

**Fix.** Point it at ResDiary 32717, or relabel it 'Booking times'.

### [MINOR · small] The live 'Today' status ignores dates, never refreshes, and the ?at= override is live (C-26, C-F02, C-F16, C-F27)

*Lens:* function · *Verifier:* confirmed

**Evidence.** The inline script checks only minutes since midnight, so Christmas Day shows 'Open now'. It has no interval, and the ?at=HH:MM regex is still active. This is minor for the pitch: the next bank holiday is 25 December.

**Fix.** Add a closed-dates list and a 'Bank holiday: please call' state. Re-run the check every 60s. Remove the override or limit it to localhost.

### [MINOR · small] On short phones the preview's first screen loses the Today card's actions; a landscape phone shows only art (C-F04, C-F19, C-F03, layout parts of C-25 and C-D13)

*Lens:* function · *Verifier:* partly

**Evidence.** The wrapped preview banner is 88px tall at 390 and 106px at 320. At 390x660, Book (583–631) sits under the dock (597), and at 320x568 the status is half-covered (prev-390x660.png). At 390x844 it all fits. At 844x390 the first screen is only curtains (vp-land-first.png).

**Fix.** Crop the phone hero art to about 120px below 420px wide, and use the two-column hero in landscape at heights under 500px.

### [MINOR · small] The vegan 24-hour line reads as a general booking rule (C-04, C-F22)

*Lens:* content · *Verifier:* partly

**Evidence.** 'Vegan? Please call: bookings need 24 hours’ notice.' sits in the booking-policy list. The 'Vegan?' lead limits the confusion for people, but it is exactly the rule-bleed the AI notes warn about.

**Fix.** 'Vegan? Call us 24 hours ahead and we’ll talk you through the options.'

### [MINOR · small] The Thursday rule is stretched to toast, and the taster's Full English omits it (C-10, C-F22)

*Lens:* content · *Verifier:* confirmed

**Evidence.** 'Cooked and toasted last orders 11am. None on Thursdays' makes 'none' cover toast. The source (S6) only rules out cooked breakfasts. The taster says 'Full English: breakfast, cooked until 11am'.

**Fix.** 'No cooked breakfasts on Thursdays; pastries as usual.' and 'Full English (until 11am; not Thursdays)'.

### [MINOR · small] The menu JSON-LD is stale, and NOTES misdescribes it (C-11)

*Lens:* content · *Verifier:* confirmed

**Evidence.** The JSON is valid but contains 'FILTER COFFE', 'By-the-Slice’', 'bed salad', 'Prosseco' and 'Frère'. The sections run in the wrong order (Afters before Second), and the description has no 2024 caveat, although NOTES claims it does.

**Fix.** Re-run extract.js and build.js after the copy fixes, and add the 2024 caveat to the description.

### [MINOR · small] Time and price formats are mixed (C-16, C-F23)

*Lens:* content · *Verifier:* confirmed

**Evidence.** '9am–6pm … 17:30', '12:00–15:00', '£5' next to '£5.00', and '50p' next to '£0.50'.

**Fix.** Choose one time style and one price style.

### [MINOR · small] The drinks menu opens with the tea-bags line (C-14)

*Lens:* content · *Verifier:* confirmed

**Evidence.** The copy deck places it under TEA BY THE BAG; the site puts it at the top of #m-drinks.

**Fix.** Move it back to Tea by the bag, and open the drinks section with the coffee-since-1936 line.

### [MINOR · small] The hero is off the page grid at 1440px and wider, and the chandelier chain runs into the masthead (C-D11)

*Lens:* design · *Verifier:* confirmed

**Evidence.** H1 left against wordmark left: 48 vs 72 at 1440, and 240 vs 312 at 1920 (a1920.png).

**Fix.** Give .hero the .wrap width, and start the chain below the masthead rule.

### [MINOR · small] The set-teas heading and the chooser cards wrap badly (C-D18)

*Lens:* design · *Verifier:* confirmed

**Evidence.** The heading runs to 4 lines at 1280. The cards break as 'Prosecco Set / Tea' and 'Champagne Set / Tea'. At 390 the Champagne card is orphaned in the grid (i1280-02/03, i390-03).

**Fix.** Span the heading across the section, and use short card names or a one-column list on phones.

### [MINOR · medium] History plates: the plate 2 ghost reads as layout guides, the figures are peg dolls, and plate 3's sign and van aren't theirs (C-D05, C-F25, C-D06)

*Lens:* design · *Verifier:* partly

**Evidence.** Plate 2's dotted rectangles line up with the quote's lines. Plate 1's figures are schematic. Plate 3 sets the fascia in italic (deliberate, per NOTES) and draws a generic box van. The rail itself remains one of the site's best ideas.

**Fix.** Draw the ghost as a faint shopfront silhouette offset from the text, or drop it. Give the figures posture. Hint at blackletter on the plate 3 sign, and draw the 1930s van.

### [MINOR · small] The 'Book a guest room' link lands on a direct-book.com 404 (C-F14)

*Lens:* function · *Verifier:* partly

**Evidence.** Headless Chromium redirected to direct-book.com/404 ('Oh no! The page you are looking for does not exist'). That could be bot protection; the link comes from the copy deck.

**Fix.** Check it on a real phone. If it is dead, link maidshotel.co.uk (dossier S20) and raise it in the pitch.

### [MINOR · small] Small diner details are missing: the tart warming line and the set-tea cut-off (C-22)

*Lens:* content · *Verifier:* partly

**Evidence.** The copy deck's VERIFIED '150° Gas Mark 3, 5 to 8 mins' is absent beside 'Tarts by post'. The set-tea 'till 17:00' appears only in the dossier's S8 meta. The station suggestion is refuted because it isn't in the research.

**Fix.** Add the warming line under Tarts by post, and confirm the 17:00 cut-off with the owner before adding it.

### [POLISH · small] Typos corrected unevenly, a truncated Darjeeling line, and the Ellis full stop (C-12, C-13)

*Lens:* content · *Verifier:* partly

**Evidence.** About 7 typos were fixed, but Rooibush, Cardamon, Camomile/Chamomile, 'China Green \ Darjeeling', Gordons and Fullers remain. 'The ‘Champagne’' stops mid-sentence, as on the printed menu.

**Fix.** Choose one policy, and end cut lines with an ellipsis.

### [POLISH · small] Cryptic labels: Royal and Florentine, the menu h1, and the footer link 'The tearoom' (C-18)

*Lens:* content · *Verifier:* partly

**Evidence.** 'Royal £12' and 'Florentine £10' stand alone as dishes. The h1 is 'On the blue-and-white.'

**Fix.** Use 'Eggs Royale' and 'Eggs Florentine', make the h1 'Our menus', and label the footer link 'Home'.

### [POLISH · small] The V mark appears on one dish only (C-17, V part)

*Lens:* content · *Verifier:* partly

**Evidence.** V is shown only on Vegetarian English, as named on the printed menu, which suggests there is little for vegetarians.

**Fix.** Drop the V mark, or add 'Plenty of our dishes are vegetarian; ask us'.

### [POLISH · small] Double article in the disclaimer and banner (C-27)

*Lens:* content · *Verifier:* confirmed

**Evidence.** 'Not the official The Original Maids of Honour website' appears in the footer and the banner.

**Fix.** 'This is not the official website of The Original Maids of Honour…'

### [POLISH · small] Stutters: the LEGEND chip followed by 'Legend has it', 'Rebuilt, in Mock Tudor.', and the tart blurb twice (C-29)

*Lens:* content · *Verifier:* confirmed

**Evidence.** Seen in the index text dump and the screenshots.

**Fix.** Use the chip label 'Story', write 'Rebuilt in Mock Tudor.', and cut one of the two tart blurbs.

### [POLISH · small] With JS off, the intro promises a chooser that isn't there (C-D26, C-F15)

*Lens:* function · *Verifier:* confirmed

**Evidence.** With JS off, .teas__intro is display:block while .st-choose is display:none.

**Fix.** Show the intro only when the section is enhanced.

### [POLISH · small] The tier hover ring floats off the rim, and the tier rows aren't keyboard-reachable (C-D27, C-F26)

*Lens:* design · *Verifier:* confirmed

**Evidence.** In hover-mid.png the gilt ellipse is wider and lower than the rim. The tier rows contain 0 focusable elements, so focusin never fires.

**Fix.** Stroke the rim path itself, and make the tier labels buttons or drop the effect.

### [POLISH · small] White strip between the footer and the dock at phone width (C-D25)

*Lens:* design · *Verifier:* confirmed

**Evidence.** Visible in bottom390.png.

**Fix.** Move the dock clearance into the footer's own padding.

### [POLISH · small] Two anchors land badly: #before-h under the sticky nav, and the menu dock's 'Find us' on the hours card (C-F11, C-F13)

*Lens:* function · *Verifier:* confirmed

**Evidence.** The heading lands at 80–131 under the nav, which ends at 113. The dock links index.html#visit although #find exists.

**Fix.** Add scroll-margin-top, and link index.html#find.

### [POLISH · small] Printing gives an empty stand and blank history plates (C-F17)

*Lens:* function · *Verifier:* partly

**Evidence.** In print media the stand items and plate scenes are at opacity 0, and there is no @media print rule. At 1280 the dock is already hidden in print, so that part of the claim is wrong.

**Fix.** Add @media print rules that force the stand items and plates to opacity 1, and hide the dock and skip links.

### [POLISH · small] The oak '288 KEW ROAD' roundel reads as a coaster (C-D19)

*Lens:* design · *Verifier:* partly

**Evidence.** detail and 1280 screenshots.

**Fix.** Make it a lettered place card on a tabletop, or cut it.

### [POLISH · small] No og:image on either page (C-D24)

*Lens:* design · *Verifier:* partly

**Evidence.** A grep finds no og:image. The pitch link is a claude.ai artifact whose unfurl the host controls, so this matters at go-live.

**Fix.** Add a 1200x630 image of the filled stand in the red room.

## Refuted by the verifier

- **Preview index lacks charset and viewport**: The live artifact's index.html starts with the host skeleton <meta charset=utf8><meta name=viewport ...viewport-fit=cover>. My wrapped render reported document.characterSet UTF-8, the title 'Maids of Honour · The tearoom' and no overflow. The bare build file lacking these is expected, because the host wraps the page.
- **Type is generic period costume**: The brief assigns Old Standard TT and Nunito Sans to Concept C, and tech-spec-v2 says each brief lists its allowed fonts. Old Standard is a distinctive Victorian Modern face, not a generic choice. The only true detail is that oldstyle-nums has no effect (lining and old-style render at identical widths), which is trivia.
- **Preview banner looks like a warning bar**: It is the intentional, portfolio-wide honesty banner. Its effect on the first phone screen is kept as V-21.
- **Chintz and oak footer look stock or muddy**: Oak #6B4A2E is the briefed palette, and the chintz reads acceptably at viewing size. This is a subjective call I don't share.
- **Today card underweighted on desktop**: In the 1280 and 1920 screenshots the card reads clearly beside the H1.
- **'Shop & Tea Room on 288 Kew Road' reads as an error**: It is the business's own verbatim homepage line (copy deck §1, VERIFIED). The quoted strapline is handled in V-04.
- **Source comments carry researcher talk**: HTML and JS comments are invisible to the owner and to diners, and are harmless to the pitch.
- **Inline sprite and JSON-LD weight**: Performance is fine by the auditor's own numbers (LCP 1.9s throttled), and NOTES already acknowledges it.
- **No left and right safe-area padding**: Neither the auditor nor I could emulate it; the claim is speculative.
- **Gift-pack truffles drawn on the stand**: The truffles are listed as part of the Special Set Tea, and plate placement is the designer's documented reading. The dock inconsistency is kept in V-15.
- **GF badges contradict the allergen note**: The legend says accurately 'made with non-gluten-containing ingredients', next to the full allergen statement.
- **Add the nearest station**: The station isn't in the research, and adding it would break the copy-deck rule against new facts.
