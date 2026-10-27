# Audit: Tide Tables B · Five arches

**Verdict:** Needs work · **Readiness:** 5/10

Not ready to send yet. The desktop hero is handsome and the facts are careful, but the owner would see breakage before craft: on desktop the menu page's hours and buttons collapse into a sliver, the arch labels overprint on every iPad in portrait, and on a typical phone the preview's first screen hides half the Call/Find us/Menu buttons behind the bridge bar. The three blockers are under 30 minutes each, but the deeper problem is bigger: the site honours the bridge more than the café, the menu page shows bridges and notices before any food, and the Visit section reads like a form ("Not published." three times).

| Lens | Raw findings | Impress owner | Craft | Usefulness | Accuracy |
|---|---|---|---|---|---|
| content | 30 | 4 | 5 | 5 | 6 |
| design | 35 | 4 | 5 | 6 | 6 |
| function | 25 | 4 | 5 | 6 | 7 |

## Strengths to keep

- The desktop hero (1280 and 1920) is distinctive and restrained: a framed bridge elevation with Caslon lettered into its sky, crisp balusters, voussoirs and coursing at 2x, and a clever arches-as-navigation idea whose hover/focus inking works.
- The facts are careful and honest. Hours match the café's own Contact page (S27), with 'dusk' never turned into a clock time. It uses the precise 'oldest surviving Thames bridge in Greater London'. Address, phone, email, map and tel links are correct, with no invented dishes or prices.
- The structure is useful first: a Today line computed in London time (including Christmas and Boxing Day) under the hero, and the Visit 'copper plate' as the second section.
- The typography is not generic: Libre Caslon Display and Text with ligatures and careful small caps suit the concept, and none of the fonts are on the overused list.
- The menu card at desktop is elegant and makes the pitch point ('publish a real menu as text') clearly once V1, V7 and V8 are fixed.
- The build is clean: no console errors, motion that stops, no scroll-jacking, complete without JS, and sensible JSON-LD with no invented menu or opening-hours spec.

## Verified findings (ranked)

### [BLOCKER · small] Menu page: the hours and actions block collapses into the bridge grid's edge columns at 900px and wider

*Lens:* content+design · *Verifier:* confirmed

**Evidence.** Only .lede-wrap is placed in the .spans grid, so .hours and .actions auto-place into tracks 1 and 2. At 1280, .hours is x48 and 183px wide and .actions is 152px wide; the buttons wrap to 'Find / us' and 'Back to the / café'. At 1024 .hours is 145px; at 1920, 214px. Screenshot: verify/shots/menu-under-1280.png

**Fix.** Add .menu-page .underplate .lede-wrap{grid-column:2/11;grid-row:1} .hours{grid-column:2/7;grid-row:2} .actions{grid-column:7/11;grid-row:2;align-self:start}, or drop .spans from that section. Re-shoot at 900, 1280 and 1920.

### [BLOCKER · small] Arch nav labels overprint from 720 to 930px on both pages ('MENU SAMPHOLLYHOCK WALK'), covering every iPad portrait width

*Lens:* content+design+function · *Verifier:* confirmed

**Evidence.** Sweep: n1/n2 overlap is 29px at 720, 24 at 760, 16 at 820, 5 at 900 and 1 at 930, the same on index and menu. At 720–750 the caption 'Paine & Couse, architects' also touches 'Menu sample'. Screenshot: verify/shots/index-768-first.png

**Fix.** Below about 960px, use the phone key row, or let .al-name wrap with tighter tracking and hide .al-sub. Hide the plate caption from 720 to 960. Add an overlap sweep to QA.

### [BLOCKER · small] Preview build at 390x660 (iPhone in Safari): the Today Call/Find us/Menu buttons sit half under the bridge bar

*Lens:* function · *Verifier:* confirmed

**Evidence.** In the preview, the buttons span y 557–608 and the bar starts at 590. The Call number is hidden and the lede ghosts through the bar. In the source at 320x568 the buttons span 496–546 against a bar top of 515. The NOTES measurements ignored the 71px preview banner. Screenshots: verify/shots/prev-index-390x660.png, verify/shots/src-index-320x568.png

**Fix.** On phones, drop the Today button row while the bar is visible (the bar already holds the same three actions), or tighten the title block and crop the plate shorter. Re-check the preview build at 390x660 and 320x568.

### [MAJOR · small] Narrow phones (320–360): 'Skip to visit info' overprints the strapline and the page overflows to 325px

*Lens:* function+design+content · *Verifier:* confirmed

**Evidence.** Overlap with the strapline is 39px at 320, 29 at 330, 19 at 340 and 9 at 350; at 360 they just touch ('CAFÉSKIP TO VISIT INFO'); from 375 they are clear. scrollWidth is 325 at 320 and 333 at 330 (the arch-key ul and the Today buttons). Downgraded from blocker because 320–350 is a rare width. Screenshots: verify/shots/src-index-320x568.png, verify/shots/w360-top.png

**Fix.** Remove the visible skip link (see V22), or set it position:static on its own line below 400px. Add .arch-nav li{min-width:0}. Let the Today buttons wrap below 340px.

### [MAJOR · medium] First load on a phone connection glitches: doubled name, a jump, and a plate that paints, vanishes and re-engraves; the first scroll stacks two straplines

*Lens:* function · *Verifier:* confirmed

**Evidence.** 4G + 4x CPU filmstrip: the preview shows the masthead wordmark above the h1 for about 2s, because body.home is added only at DOMContentLoaded, then jumps. In both builds the finished inked plate paints, then the deferred main.js adds .intro, which erases it and redraws it. With JS off the preview keeps the duplicate masthead. After a 20px scroll on a phone, the translucent fixed masthead shows a second 'RICHMOND RIVERSIDE CAFÉ' over the h1's. Screenshots: verify/shots/slow/prev-sheet.png, verify/shots/slow/src-sheet.png, verify/shots/prev-nojs-390x660.png, verify/shots/scroll390-20.png

**Fix.** Add the 'home' class synchronously in the preview, or hook the CSS on the masthead. Decide the intro in an inline <head> script (session flag plus reduced motion) that hides the lines before the plate parses. Observe the title block, not a 1px sentinel, and make the stuck masthead opaque.

### [MAJOR · small] The Visit section reads like a half-filled form: 'Not published.' x3 and five 'to confirm' chips in the researcher's voice

*Lens:* content+design+function · *Verifier:* confirmed

**Evidence.** Parking, Step-free access and Dogs each say 'Not published. TO CONFIRM'; Booking says 'No online booking. TO CONFIRM'; By boat has another chip. That is five chips within about 600px on a phone, with chip text at 9.9px. The chips are allowed; the wording and clustering are the harm. Screenshots: verify/shots/idx390-slice0.png, verify/shots/idx390-slice1.png

**Fix.** Merge Parking, Step-free and Dogs into one line in the café's voice ('Dogs, parking and step-free access: just call us on 020 8948 8285'), with at most one marker. Keep Booking as 'walk-in, or call for groups' with its chip. Move the open questions to the cover email. Set chips at 11px or more.

### [MAJOR · medium] Menu page shows no food on the first screen at any size: two notices, a bridge plate and a vignette come first

*Lens:* content+design+function · *Verifier:* confirmed

**Evidence.** The first dish is at y 1117 (source) and 1188 (preview) at 390x844; the h1 is at 1027 at 1280x800. Screen 1 in the preview holds the yellow banner (71px), the dark Sample banner (115px), the wordmark, the full plate, the key and a vignette. The banner and the card disclaimer are mandated, but the H1 sub-line repeats the banner. Screenshots: verify/shots/prev-menu-390x844.png, verify/shots/menu-1280-full.png

**Fix.** On menu.html, replace the full plate with a 60–80px arch strip, or move it below the card. Drop the card vignette on phones and the H1 sub-line. Shorten the dark banner to one line on phones. Target: the Food heading plus three dishes on screen 1 at 390x660.

### [MAJOR · small] The sample menu is thinner than what the café itself advertises: no cakes, pastries or sweet dishes, and no cider

*Lens:* content+design · *Verifier:* confirmed

**Evidence.** Re-fetched live on 27 Oct, http://www.tidetablescafe.co.uk/ (S26) says 'Excellent selection of fresh juices, salads, pastries, cakes, organic wines and beers. Big selection of sweet and savoury dishes' and 'organic wines, beers and ciders'. The menu has no sweet item and no cider, although index says 'licensed, with organic wine, beer and cider'. 'Organic milk' is listed as a drink, and 'Wine & beer' sits under 'Organic Wines & Beers'. On desktop the Food column ends about 200px before Drink.

**Fix.** Add the S26 line to copy deck §6. Then add 'Cakes & pastries', rename the line to 'Organic wine, beer & cider', and make 'Organic milk' a Coffee note with plant milks (S26). Balance the columns.

### [MAJOR · large] It reads as a site for the bridge, not the café; it fails a swap test against the boat builders next door

*Lens:* design+content · *Verifier:* partly

**Evidence.** Every drawing is the bridge or its trees: the hero plate, a second plate on the menu page, the menu vignette, the locators, the favicon and the bar. There is also a whole 'Of the bridge overhead' section with a big 1777. Nothing of the café's brick arch, vault, counter or garden in use is drawn. The café copy is 2 sentences plus 4 one-liners, with the weakest line ('Warm and friendly atmosphere.') as the hero lede. The register ('Bill of Fare', 'Of the bridge overhead') is Georgian-civic against a 'hip veggie and vegan cafe' with music. Partly, because the brief chose a bridge-led concept.

**Fix.** Draw the café's own brick arch with its glazed screen on the Richmond bank as the Home element (this also cures V13). Demote the bridge facts to one line. Lead with the café's best lines ('hang out all day…'; S26 'the place to hang out all day and watch the world go by').

### [MAJOR · medium] The phone bridge bar is heavy and confusing: a solid black blob over CALL, 'sunglasses' on the menu, reversed order, see-through, too tall

*Lens:* design+function+content · *Verifier:* confirmed

**Evidence.** On home the current ink is a solid black lozenge directly above CALL, so it reads as if Call is selected. On the menu page, two black lozenges over arches 4–5 sit opposite the plate's inked arch 1. At 97% opacity, page text ('until dusk', 'Saturday and Sunday') ghosts through and the label chips show as boxes. Height is 70px at 390, 82 at 500 and 101 at 667, against the standard's 64px and the 76px the page reserves. Screenshots: verify/shots/bar-zoom-home.png, verify/shots/prev-menu-390x844.png

**Fix.** Make the bar opaque. Show the current arch with a heavier contour or hatch, never a solid fill, and none on home. Mirror the order to match the plate (Menu on the left, Find us on the right). Fix the height at about 60px plus the safe-area inset and scale the SVG inside it.

### [MAJOR · medium] On phones the five-arch signature is weak: a small strip, arches that can't be tapped, drifting 9.9px labels, and actions repeated 2–4 times

*Lens:* design+function · *Verifier:* partly

**Evidence.** The plate is cropped to a strip about 156px tall. Tapping a drawn arch does nothing (URL and scroll unchanged). The key labels sit 20–43px off their arches ('Home' is right of the inked arch) at 9.9px. On screen 1 the Menu link appears 4 times, and Call and Find us twice each. The live-river glints are paper colour on paper. Partly, because desktop hover inking works and is visible (verify/shots/hover-n1.png).

**Fix.** Lay out the key with the plate's crop geometry (width 120%, margin-left -15%) so labels sit under their arches. Add transparent 44px hit areas on the drawn arches. Drop the duplicate Today buttons (V3). Give the glints contrast, or drop them.

### [MAJOR · small] The plane-tree drawing is the weakest in the set, and the garden vignette blows it up beside 'Three majestic plane trees'

*Lens:* design · *Verifier:* partly

**Evidence.** At 2x: a cloud-blob canopy with tick marks, ruled straight branches, and a trapezoid trunk with outlined polygon 'bark' that reads as camouflage. It shows one and a half trees under a heading that says three. The bridge at 2x is crisp, which makes the trees look worse. Downgraded from blocker because it can be cut quickly. Screenshot: verify/shots/tree-vignette-2x.png

**Fix.** Before sending, cut the vignette or crop it to bridge and trunk, and pull the hero trees back to a quiet silhouette. Commission or hand-draw a proper engraving later.

### [MINOR · small] 'Home / the café' sits under the centre river arch, and the favicon fills that arch

*Lens:* content+design · *Verifier:* partly

**Evidence.** Copy deck §7 says to avoid implying the café is a river arch, and the qualifying hero note was cut. But the brief itself specified 'centre arch = the café (home)', and the label reads as a page name, so the risk is mild.

**Fix.** Change the sub-label to 'welcome' or remove it, or adopt V9's café arch.

### [MINOR · small] Some open items can be answered or worded better: the Hollyhock postcode chip, and the Jam Jar in the present tense

*Lens:* content · *Verifier:* partly

**Evidence.** The chip sits on TW10 6UX, the café's own published postcode. The Jam Jar is in the present tense and third person ('at Tide Tables Café'), while the café's site says 'starting again soon'. The auditor's booking and parking evidence is from the Hollyhock page only (see refuted R6).

**Fix.** Show the postcode without a chip and raise the council conflict in the email. Use 'The Jam Jar, our live music nights, will be back soon', or cut it.

### [MINOR · small] Footers carry only the disclaimer; the menu page has no address anywhere; dead dark band on phones

*Lens:* content+design+function · *Verifier:* confirmed

**Evidence.** The menu page's innerText has no '2 The Arches' or 'TW9' (standard items 29 and 35). body and .foot both pad for the bar, leaving about 100px of empty ink.

**Fix.** Add '2 The Arches, beneath Richmond Bridge, TW9 1TH · 020 8948 8285 · Mon–Fri from 7:30am, Sat–Sun from 7am, until dusk' above the disclaimer, and pad for the bar once.

### [MINOR · small] No allergen or dietary guidance and no plant-milk mention, although the site promotes vegan and gluten-free

*Lens:* content · *Verifier:* confirmed

**Evidence.** Standard items 12 and 26 ask for a dietary line and how to ask about allergens. S26 confirms cow-milk alternatives.

**Fix.** Add 'Vegetarian throughout. Ask us which dishes are vegan or gluten-free today, and tell us about any allergy before you order.' Add plant milks under Coffee.

### [MINOR · small] Directions are vague, and the 'From the bridge' heading doesn't match its text

*Lens:* content · *Verifier:* partly

**Evidence.** The text is about reaching the bridge, not finding the café, and names no station. S26 has 'Richmond is as little as 15 minutes from Waterloo by train' (verified live). The copy is the café's own, so this is partly a source limitation.

**Fix.** Use a 'Getting here' heading. Add 'Richmond side, down at the riverside' (dossier #3) and the Waterloo line, after a copy-deck update.

### [MINOR · small] llms.txt implies phone booking and contains a researcher's provenance sentence

*Lens:* content · *Verifier:* confirmed

**Evidence.** It says 'There is no online booking. Please phone the café.' and 'As published on the café's own Contact page (http://…); "dusk" is the café's word…'.

**Fix.** Write 'Booking policy: please call', and delete the provenance sentence.

### [MINOR · small] Hours wording is cryptic and inconsistent: '(from 7:30am)', '9:30 till dusk', and 'food and drink' for 'serving'

*Lens:* content+design · *Verifier:* confirmed

**Evidence.** 'Sat–Sun from 7am (from 7:30am)' appears on the menu page, in the no-JS strip, the meta, the JSON-LD and llms.txt. It is the copy deck's approved wording but unexplained. 'till' and 'until' are mixed, and there is no 'am' on 9:30. The copy deck still asks what 'serving' means.

**Fix.** Use '(serving from 7:30am)' everywhere and one time format. Confirm 'serving' with the owner.

### [MINOR · small] Phone formats vary between pages, and numbers and postcodes break across lines

*Lens:* content+design+function · *Verifier:* confirmed

**Evidence.** Menu uses '+44 (0)20 8948 8285' twice; index uses 020 8948 8285. 'call 020 / 8948 8285' breaks at 1280, 'TW10 / 6UX' at 390, and 'Richmond / Bridge' leaves an orphan.

**Fix.** Use 020 8948 8285 everywhere visible, with white-space:nowrap on tel links and postcodes.

### [MINOR · small] Repetition: H2s echo the next sentence, H2 plus H3 'Opening hours', parties twice, the towpath three times

*Lens:* content+design · *Verifier:* confirmed

**Evidence.** 'All day for the price of a cup of coffee' is followed by the same sentence; 'Three majestic plane trees' likewise. The parties number appears in Good to know and in the aside.

**Fix.** Write H2s that add something, keep parties in the aside only, and drop the duplicate H3.

### [MINOR · small] Labels: the visible 'SKIP TO VISIT INFO ↓' in the hero, 'from the board', an H1 'Bill of Fare' with no 'Menu', 'Of the bridge overhead'

*Lens:* content+design+function · *Verifier:* confirmed

**Evidence.** The skip link is accessibility jargon lettered into the sky on every viewport. The dishes come from the website, not the chalkboard. Standard item 34 says literal labels lead.

**Fix.** Make the skip link visible on focus only. Change the sub-label to 'what we serve'. Use H1 'Menu' with 'Bill of Fare' as a kicker, and the kicker 'Richmond Bridge'.

### [MINOR · small] Sharing and meta: preview tab title 'Tide Tables · Five arches', a 221-character meta description, no og:image

*Lens:* content+function · *Verifier:* confirmed

**Evidence.** The preview index title is the designer's codename. The meta description is 221 characters (NOTES says 156, which predates the hours update). There is no og:image or og:url, so the link Joseph sends shows as a text-only card.

**Fix.** Use the café title. Trim the description to about 155 characters. Add a 1200x630 og:image cropped from the plate, plus og:url.

### [MINOR · small] Copy-paste and innerText duplicate the dates: '(17771777, …) widened in 19371937'

*Lens:* content+function · *Verifier:* confirmed

**Evidence.** Selecting the facts paragraph returns the doubled digits, because the .vh copy and the aria-hidden digit spans are both in the text flow.

**Fix.** Keep one real text node: drop the .vh copy, or use role=text with an aria-label.

### [MINOR · small] The display '1777': the hand-scaled 1 is visibly lighter than the 7s

*Lens:* design · *Verifier:* partly

**Evidence.** It reads as old-style, not as the superscript the auditor described, but the 62%-scaled lining 1 has thinner strokes than the full 7s. Screenshot: verify/shots/big-date-2x.png

**Fix.** Set the big date in lining figures and remove the digit-scaling spans.

### [MINOR · small] The Today strip never shows open or closed: at 23:30 it still says 'Open from 7am'

*Lens:* function+content · *Verifier:* confirmed

**Evidence.** The inline script checks only the weekday and date, never the time.

**Fix.** After a conservative evening cut-off, show 'Closed now · opens tomorrow from 7:30am'. Never display a dusk time.

### [MINOR · small] Sticky chrome on the menu takes half of a small phone

*Lens:* function+design · *Verifier:* confirmed

**Evidence.** After tapping 'Tea': masthead, jump row and bar take 281 of 568px at 320 (the jump row wraps to 3 lines) and 249 of 844px at 390.

**Fix.** Make the jump row one scrollable line of about 44px and drop its caption once stuck.

### [MINOR · small] Landscape phones: at 667x375 the 101px bar covers the plate's arches; at 844x390 the hours are below the fold

*Lens:* function · *Verifier:* confirmed

**Evidence.** Screenshot: verify/shots/land-667x375.png (two bridges stacked). #today starts at 497px at 844x390.

**Fix.** Add a max-height:500px query that crops the plate and caps the bar height.

### [MINOR · small] Phone UI labels are under 10px

*Lens:* design · *Verifier:* confirmed

**Evidence.** Arch key 9.92px, Call number 9.92px, strapline 9.67px, chips 9.92px (8.8px on the menu).

**Fix.** Minimum 11–12px for UI labels.

### [MINOR · small] The desktop Today strip looks bolted on: misaligned with the lede, and stock icons

*Lens:* design · *Verifier:* partly

**Evidence.** The strip's left edge is at x48 while the lede below starts at x238. Generic line icons sit on the buttons.

**Fix.** Align the left edges, and drop the icons or set the strip as an imprint line in the text face.

### [MINOR · small] The palette collapsed to stone and charcoal; the brief's plane green and river blue are unused

*Lens:* design · *Verifier:* partly

**Evidence.** var(--plane) and var(--river) are used 0 times in style.css. The restraint suits the engraving but under-delivers the brief.

**Fix.** Add one or two deliberate colour moments, for example a river-blue wash in an inked reflection and green ink in the garden.

### [MINOR · medium] Below the hero, the layout becomes a standard section stack, and the gravel band reads as a placeholder dot grid

*Lens:* design · *Verifier:* partly

**Evidence.** Every section is the same template: locator, kicker, H2, text. The 'gravel' band is a regular dot lattice (verify/shots/idx1280-slice3.png). It is well set, but it is the generic layout the user is wary of.

**Fix.** Bring the drawing back as structure (a section-opening crop per arch, the café-arch drawing from V9, real stipple), or remove the gravel band.

### [POLISH · small] Small craft slips

*Lens:* design+content+function · *Verifier:* confirmed

**Evidence.** 'menu↑' has no space; the chip touches italic 'vegan'; the phone menu card shows 4 frame lines per side; at 1920 the masthead ends at x1872 while the plate ends at x1640; 'Paine & Couse, architects' stands alone under the desktop plate like a site credit; the inked centre arch and reflection form a smooth grey disc; the copper plate's inner rule sits 6px from the text on phones; the bold Franklin caps look like web chrome.

**Fix.** Each is a one-line CSS or copy change: gap:.35em on .to-top a; margin before .tbc; one frame line on phones; constrain the masthead to .page; caption 'Richmond Bridge, 1777 · Paine & Couse' or none; break the reflection hatch.

### [POLISH · small] Build hygiene: tooltip says 'restaurant', 'client question' comments, unreferenced img files shipped, dead highlight layers

*Lens:* content+design · *Verifier:* confirmed

**Evidence.** title='To be confirmed with the restaurant' x9; HTML comments '(client question 9/10)'. The publish folder ships unreferenced img/plate-generator.mjs (header: 'proportions studied … from client photo 4') and a 270KB SVG. Five dead --hl-* groups remain in the plate.

**Fix.** Use 'with the café', strip the comments and img/ from the publish build, and delete the hl-* groups.

### [POLISH · small] Keyboard: tabbing back to the top lands focus on the hidden masthead wordmark

*Lens:* function · *Verifier:* partly

**Evidence.** Tabbing from the footer, focus went body, then Skip, then the wordmark while it was fading to visibility:hidden on desktop home.

**Fix.** Make the wordmark inert while hidden, or keep it visible on desktop.

### [POLISH · small] Small grammar slips carried over from the café's copy, and the verified hygiene rating is unused

*Lens:* content · *Verifier:* partly

**Evidence.** '…animal welfare so many of our products' needs a comma; 'the best place' should be 'places'. The FSA rating of 5 (5 Nov 2025) is VERIFIED but unused, an opportunity rather than a defect.

**Fix.** Add the comma and the plural. Consider 'Food hygiene rating: 5' in Good to know.

## Refuted by the verifier

- **design m1: the yellow preview banner clashes with the palette**: It is an intentional honesty device. Its stacking effect on the menu's first screen is kept under V7.
- **design m8: the 'Home' arch links to #top and does nothing**: This is standard behaviour for a current-page link with aria-current. When the user is scrolled down, the key isn't on screen anyway.
- **design p2: the intro reveal shows hard rectangular seams**: Not reproduced in my load filmstrips; it is a transient effect under 1s.
- **function p5: the menu card border replays on every visit**: It is a 1.4s line-draw that blocks no content. Harmless.
- **content m13 (part): Hollyhock's party terms suggest Tide Tables oversells parties**: Verified live: 'parties from 8pm on weekdays only' is on the Hollyhock page, which says 'bring your own alcohol'. Tide Tables is licensed, so nothing shows these terms apply to it.
- **content M2 (part 1): the café's .co.uk site already answers booking and parking for Tide Tables**: Verified live: 'We do not reserve tables… we do not have parking available' are on the Hollyhock Cafe page, not Tide Tables'. 'No online booking · to confirm' for Tide Tables is legitimate. The rest of M2 is kept as V14.
- **content m5 (part): 'under the planes' reads as aircraft**: 'Planes' for plane trees, in a label headed Garden, is ordinary British usage. The 'from the board' half is kept in V22.
- **design M4 (main): the engraving has no tonal range, is washed out, the ashlar reads as brick, a CAD drawing**: At 2x the bridge is crisp and well drawn (balusters, voussoirs, coursing), and the tonal restraint is a style choice that works on desktop. Only the grey-disc inked state is kept (V33).
- **content M5 (part): four disclaimers on the menu page is too many**: The banner wording is mandated verbatim by the brief, and the card disclaimer is the copy deck's approved text. Only the H1 sub-line is redundant (V7).
- **design M7 (part): the display date reads as '¹777', like a superscript**: It reads as old-style figures. The real flaw is the weight mismatch of the scaled 1 (V25).
