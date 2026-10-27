# Audit: Tide Tables C · Ride the tide

**Verdict:** Needs work · **Readiness:** 4.5/10

Not ready to send. The facts are right and the useful-first basics work, but on every phone the hire board slides over the Pause button and tide chip and leaves broken fragments. The hero shows generic steps and boats instead of the café or bridge, the biggest object is a neighbour's sign from an 8-year-old photo, and several lines sound like the researcher talking. Outlined buttons have a broken hover, and the garden drawing, the repeated layout and the Unbounded/Onest pairing fall short of the craft bar and the user's "no generic fonts or layouts" test. About a day of small and medium fixes makes it presentable as the second concept behind A; leading with C would also need the hero redrawn around the bridge or the arch.

| Lens | Raw findings | Impress owner | Craft | Usefulness | Accuracy |
|---|---|---|---|---|---|
| content | 28 | 4.5 | 6.5 | 5.5 | 7 |
| design | 32 | 4 | 4 | 7 | 7 |
| function | 29 | 5 | 5 | 6.5 | 7 |

## Strengths to keep

- Accurate, sourced facts. Hours, address, both phones (working tel: links), the email with its 'monitored periodically' note and the Maps links all match the copy deck. The JSON-LD, meta description and llms.txt agree. No invented dishes, prices or flood claims, and nothing claimed about the keystone face.
- A useful-first first screen that really works. An inline script shows today's hours in London time, including Christmas and Boxing Day. Address, Call, Find us and the menu sit on a solid panel at first paint. The fixed action bar carries Find us, Call and Menu, and the no-JS and reduced-motion states are designed, not broken.
- The walk to Hollyhock is a genuinely only-here second moment, built on the café's own 'free local map' habit. It uses real buttons with keyboard support, lists every step as plain text, and is honestly marked 'not to scale'.
- The tide model (the river 'held at half-tide or above' by Richmond's weir) is a clever, place-specific idea, and the shared shores tie the page together. Keep the idea and drop the chip that narrates it.
- Technical hygiene: no console errors, no horizontal overflow, LCP about 1.8s on slow 4G, and the menu is real HTML with jump links and back-to-top. The skiffs are nicely drawn, with clinker planking, covers and mooring ropes that slacken as the water rises.
- Visit comes second, straight after the hero, with a full day-by-day hours table and the café's own 'very crowded on sunny days' warning as a strong signal strip.

## Verified findings (ranked)

### [BLOCKER · small] On every phone the hire board slides over 'Pause the water' and the tide chip, and the hero leaves the screen in that state

*Lens:* function+design+content · *Verifier:* confirmed

**Evidence.** At 390x844, elementFromPoint at the Pause button's centre returns .hireboard__board, .hb or .hireboard__cap at every measured scrollY from 300 to 1000. At y=480 the button (650-694) is under the caption (663-707), leaving a white stub; 'Gates up: high water' pokes out below. At 390x660 the overlap runs y=300-900. At 1280x800 the button is clear, but the board and caption cover the chip from y=200 to 600, leaving '...ATIVE / ...ater'. The board also hides the skiffs at high water. Shots: verify/shots/src-hero-m390x844-y480.png, -y700.png, src-hero-d1280x800-y600.png

**Fix.** Remove the chip (V04). Move Pause to a corner the board never crosses (top-right of the scene), or hide it with an IntersectionObserver while .beat--board overlaps. Re-shoot every 100px at 390, 768 and 1280.

### [MAJOR · large] The café, its arch and Richmond Bridge are missing from the hero; the scene could be any riverside

*Lens:* design+content · *Verifier:* partly

**Evidence.** The first screen is steps, a wall, lamp posts, a hedge and five skiffs: two hull variants, evenly spaced on evenly spaced rings, with evenly sprinkled tufts. No bridge, arch or keystone; the only arch is a map glyph (first-d1920.png, src-hero-d1280x800-y0.png). Overstated: the weir model, Grotto Gate and the Hollyhock walk are only-here, and the draft email (_outreach/EMAILS.md §4) sends A and B, which show the vault and bridge, alongside C.

**Fix.** Put Richmond Bridge's arches behind the steps, or the brick café arch at the top of the flight, so the water rises against something only Richmond has. Vary the hulls, covers and mooring angles.

### [MAJOR · medium] The homepage centrepiece is a neighbouring business's board, known only from an 8-year-old photo

*Lens:* content+design · *Verifier:* confirmed

**Evidence.** The beat is full-width at 390 and about 560x375 at 1280. The present-tense caption 'From the boat-hire board next door.' rests only on client photo 2, which Maps dates to '8 years ago' (photo-notes.md). identity.md #10: 'Use the idea, not the other business's board.' 'LEAVE BEFORE H.W.' on a café homepage can read as advice to diners. The brief did list the board, so this is over-use rather than invention.

**Fix.** Give the beat the café's own chalk line ('The sort of place you can hang out all day...' or today's hours chalked up). Keep the hire board as the small A-board already in the drawing.

### [MAJOR · small] The tide chip reads like live river status and narrates the design

*Lens:* content+design+function · *Verifier:* confirmed

**Evidence.** While scrolling it shows 'Gates down: held at half-tide or above', then 'Gates up: rising', then 'Gates up: high water'. Reduced motion shows 'Mid-tide (still)', no-JS 'Mid-tide'; the chip is aria-hidden. Breaks voice rule (d)2. The real barrier is drawn off 5-18 Nov 2026 (dossier fact 23), about when the pitch lands, so 'held at half-tide or above' would contradict the river outside the door.

**Fix.** Delete the chip and its state code. The hero isn't a 'today' tide graphic, so the brief doesn't require a label; if one is wanted, keep it in the SVG title.

### [MAJOR · small] The Visit block reads like a research audit: 5 TO CONFIRM chips and 'not published' twice

*Lens:* content+design+function · *Verifier:* confirmed

**Evidence.** At 390 the chips sit between y=2682 and 3332. 'Parking: not published.' and 'Step-free access: not published.' are researcher voice, and 'Dogs:' is followed by a chip and nothing else (verify/shots/full-index-m390-s03.png). Chips are intentional, but this volume and wording in the most useful block harms the pitch.

**Fix.** Replace the empty rows with one café-voice line, 'Dogs, parking or step-free access? Call 020 8948 8285 and we'll tell you.', with at most one chip. Move the questions to the pitch email.

### [MAJOR · small] The homepage food teaser talks about the missing menu in the third person

*Lens:* content · *Verifier:* confirmed

**Evidence.** Visible text: 'Tide Tables doesn't publish a menu online. Our menu sample has no prices.' The voice switches from third person to 'our'. The brief requires the sample notice on the menu page only (full-index-m390-s09.png).

**Fix.** 'All vegetarian, with vegan and gluten-free dishes too. For today's food, ask at the counter or call 020 8948 8285.' Then the See the menu sample button.

### [MAJOR · small] Every outlined button's hover and focus fill renders as a shrunken, frameless slab

*Lens:* design · *Verifier:* confirmed

**Evidence.** On hover 'Find us' becomes a black block about 10px short of the bottom, and its border disappears; the PLA chalk button does the same (verify/shots/btn-sheet.png, rest on the left, hover on the right). Cause: translateY(-12px) on an inset:-2px pseudo-element with a 12px wave mask, plus a currentColor border that flips.

**Fix.** Use inset:-14px -2px -2px and translateY(0) on hover. Pin border-color. Wrap the effect in @media (hover:hover).

### [MAJOR · medium] The signature's payoff is hidden by the board, and phones get a long blank-sky phase

*Lens:* design · *Verifier:* partly

**Evidence.** The rise is real (boats lift about 50px between scroll 0 and 600 at 1280), but from y=300 to 1000 the board covers the steps where it happens. At 390, scroll 480, the top half of the screen is empty grey sky (src-hero-m390x844-y480.png). 'Barely reads' is a little strong.

**Fix.** Place the board beat after the peak or beside the steps. Increase the amplitude and add a wet tide mark. Anchor the scene higher on phones.

### [MAJOR · small] The business name looks struck through on the first screen

*Lens:* design · *Verifier:* confirmed

**Evidence.** --tide starts at 0.32, so the hairline wave crosses the cap height of 'TABLES' at 390, 1280 and 1920. In no-JS and reduced motion (0.5) it sits between the words and looks right (first-nojs-m390.png vs src-hero-m390x844-y0.png).

**Fix.** Start the H1 waterline at 0.5, or keep the hairline in the gap between the lines until the user scrolls.

### [MAJOR · medium] The garden illustration lets the craft down

*Lens:* design · *Verifier:* partly

**Evidence.** Plane bark really is camo-mottled and the brief asked for it as a pattern, so the pattern is defensible, but the uniform blobs read as camo print. Also: a symmetrical Y-shaped centre trunk; a canopy made of one repeated star stamp; chairs drawn through tables (centre group); two arches with voussoir rings and two without; chair legs cut by the frame at 1280 (full-index-d1280-s03.png). Major rather than blocker.

**Fix.** Vary the trunks' taper and lean, build the canopy from varied leaf clusters with a light direction, layer the chairs with contact shadows, make the arch rings consistent, fade the bottom edge into the gravel. A full redraw would be large.

### [MAJOR · large] One section template is repeated about seven times and reads as generic

*Lens:* design · *Verifier:* confirmed

**Evidence.** Every section is eyebrow, giant Unbounded H2, hairline, then body in columns 6-12, leaving the left 40% empty at 1280 again and again. Add stock stacked-wave dividers and a giant-wordmark footer (full-index-d1280-s01..s05.png). This is the 'generic layout' the user asked about.

**Fix.** Vary the compositions and use the empty column: the weir drawn beside the river sentence, the counter board beside the dishes, a tide gauge down the margin. Replace the wave dividers with a drawn step lip or wet line.

### [MAJOR · medium] The type pairing reads as tech/SaaS, the chalk board is set in Unbounded, and the wordmark's glyphs collide

*Lens:* design · *Verifier:* partly

**Evidence.** Unbounded and Onest are the brief's own choices (brief §C), so this is a brief-level decision, and I couldn't see the auditor's overused-fonts list. But the user explicitly asked for no generic fonts, and the board quote in Unbounded Light and Black with a noise filter looks like typed text, not chalk. Tracking of -0.035em (hero) and -0.045em (footer) fuses A-B-L-E-S, which is obvious in the 13rem footer mark (full-index-d1280-s05.png).

**Fix.** Hand-draw the board lettering as SVG. Loosen tracking to about -0.01em or draw the wordmark. Ask Joseph whether to replace Unbounded with a face that echoes the café's cream serif logo or its chalkboards.

### [MAJOR · medium] Below 900px the walk stepper animates a map that is off screen

*Lens:* function · *Verifier:* confirmed

**Evidence.** At 390x844, after three Next taps, the map spans -196 to 304 and the active marker is at -79. The active step (964-1097) is below the fold, so only the '4 / 5' counter visibly changes (verify/shots/walk-phone-step4.png). This is the second signature.

**Fix.** Make the map sticky on narrow screens with the controls under it, or put Prev/Next and the current step's line inside the map sheet.

### [MAJOR · small] The menu page shows no food on its first screen and opens with a stack of notices

*Lens:* content+design · *Verifier:* partly

**Evidence.** Preview at 390, top to bottom: yellow host banner, sticky black strip, eyebrow 'TIDE TABLES CAFÉ · MENU SAMPLE', H1, then the 'PLEASE READ' box in five lines of Unbounded display type. First dish at 927px (preview) or 834px (source) against a bar top of 780; at 1280 it is at 1080 against an 800px viewport (first-pre-menu-m390.png, full-menu-d1280-s00.png). Refuted parts: the banner wording is mandated verbatim by the brief, and the closing disclaimer is the café's approved line.

**Fix.** Drop '· Menu sample' from the eyebrow. Set the banner at body size rather than display type. Move the jump row up so the first dishes reach screen 1.

### [MAJOR · small] Neither footer has address, phone or hours, and the menu page has no hours or address at all

*Lens:* content+design+function · *Verifier:* confirmed

**Evidence.** Both footers hold only the giant mark and the honesty line. Fails Useful-first F35 and D29.

**Fix.** Add '2 The Arches, beneath Richmond Bridge, Richmond TW9 1TH · 020 8948 8285 · Mon–Fri from 7:30am, Sat–Sun from 7am, until dusk' with a map link, and keep the honesty line below it.

### [MAJOR · medium] Scrolling stutters on a mid-range phone because --tide restyles the whole document every frame

*Lens:* function · *Verifier:* confirmed

**Evidence.** My scripted scroll at 390x660, DPR 3, 4x CPU: p95 frame 50.1ms, 142 frames over 50ms, worst 350ms. With --tide writes blocked: p95 16.8ms, 1 frame over 50ms, worst 183ms (verify/perf.js).

**Fix.** Register @property --tide with inherits:false and set it only on the roughly ten elements that read it, or write transforms directly. Throttle the rope redraws.

### [MAJOR · small] The garden SVG's endless dapple animation burns CPU and ignores 'Pause the water'

*Lens:* function · *Verifier:* partly

**Evidence.** At 1280 with the garden centred the main thread is busy 4.03s per 5s; after pressing Pause, 4.14s; with the image hidden, 0.00s. Headless software rendering probably exaggerates the cost versus a GPU phone, but the loop is real, ignores Pause (WCAG 2.2.2), and contradicts NOTES' claim that the hero is the only self-running loop.

**Fix.** Remove the dap animation from img/garden.svg.

### [MAJOR · medium] The menu sample is 12 bare phrases, so it doesn't demonstrate Joseph's 'publish a real menu as text' pitch

*Lens:* content · *Verifier:* partly

**Evidence.** Six dish names and one-line drinks; no descriptions, dietary marks or price column. The content rules forbid inventing dishes, which limits this, but the copy deck allows a priced layout labelled 'Sample layout: items and prices not from Tide Tables'.

**Fix.** Add one clearly labelled demonstration block showing how a full entry sits (name, short description, V/VG/GF marks with a legend, a price column) with obviously generic placeholder content.

### [MINOR · small] On a landscape phone (844x390) the essentials fall below the fold and the lede collides with Pause

*Lens:* function · *Verifier:* confirmed

**Evidence.** The Today strip is at 359-534 in a 390px viewport, and 'Thames Path.' overlaps the Pause button (verify/shots/landscape-844x390.png).

**Fix.** Add (max-height:500px) rules: compact strip, hidden lede, Pause and chip hidden.

### [MINOR · small] No navigation on phones; Garden, Walk and River are reachable below 1100px only by scrolling

*Lens:* content+design+function · *Verifier:* confirmed

**Evidence.** Visible nav links: 390 none; 768 and 1024 two; 1280 five. The walk starts at 5,904px on a 9,629px page at 390.

**Fix.** An 'On this page' chip row after Visit, plus a back-to-top link before the footer.

### [MINOR · small] 'Vegetarian' isn't on the first phone screen

*Lens:* content · *Verifier:* partly

**Evidence.** A1 is technically met ('Richmond Riverside Café', 'Under Richmond Bridge'), but the lede is hidden below 768, and vegetarian is the deciding fact for diners.

**Fix.** Use the eyebrow 'Vegetarian café under Richmond Bridge' on phones.

### [MINOR · small] The booking chip sits on a verified fact, and the stale Jam Jar gets its own column

*Lens:* content · *Verifier:* partly

**Evidence.** Dossier §4 verifies that no booking system exists; only the walk-in policy is unknown. llms.txt states it as fact while the page chips it. The Jam Jar text is stale ('starting again soon'). C15 part 3 (step-free line) is refuted: those facts are not in the copy deck.

**Fix.** 'No online booking. For parties, phone 07922 474327.' with no chip. Drop The Jam Jar or fold it into Parties.

### [MINOR · small] No allergen line or way to ask

*Lens:* content · *Verifier:* confirmed

**Evidence.** 'allerg' appears nowhere in index, menu or llms.txt. B12 asks for how to ask even though rubric item 13 was scored n/a for Tide Tables.

**Fix.** Add 'Allergies or intolerances? Please ask before you order.' on the menu page and in Visit.

### [MINOR · small] The footer names one 'real site'; there is no og:image or og:url; the JSON-LD has no opening hours

*Lens:* content+design+function · *Verifier:* partly

**Evidence.** The footer names only .com, yet the hours come from .co.uk. There is no og:image or twitter:card, so the link the owner receives unfurls as plain text. Leaving out 'closes' is deliberate and correct; an opens-only openingHoursSpecification is optional.

**Fix.** Name both sites. Add a 1200x630 og:image and og:url. Consider an opens-only openingHoursSpecification.

### [MINOR · small] The preview tab title is the neighbour's slogan, and lang is set only by script

*Lens:* content+function · *Verifier:* partly

**Evidence.** The live artifact's title is 'Tide Tables · Ride the tide'. The mojibake claim is refuted: the live host wraps the page with <meta charset=utf8> and a viewport meta, and the garbling came only from serving the bare fragment locally.

**Fix.** Restore 'Tide Tables Café · Richmond Riverside Café, beneath Richmond Bridge' and carry lang into the wrapper.

### [MINOR · small] The pages don't say who made the pitch

*Lens:* content · *Verifier:* partly

**Evidence.** The banner and footer say 'independent studio'. The email signs Joseph Bell with phone and email, so this matters only if the link is forwarded on its own.

**Fix.** Add 'Design proposal by Joseph Bell, Richmond' plus contact details to the preview banner only.

### [MINOR · small] The hours wording is cryptic in places, 'dusk' is never explained, and the Today strip never says closed

*Lens:* content+function · *Verifier:* partly

**Evidence.** 'Sat–Sun from 7am (from 7:30am)' is the copy deck's approved wording, so it needs a deck change rather than a designer fix. At 21:30 the strip still reads 'Today, Tuesday · Open from 7:30am...'.

**Fix.** Label the strip 'Today's hours'. Add 'We close at dusk, so earlier in winter'. Propose '(food and drink from 7:30am)' to the copy deck.

### [MINOR · small] 'From the bridge' explains how to reach the bridge, and transport comes last in small type

*Lens:* content · *Verifier:* partly

**Evidence.** The label mismatch is confirmed. Naming a station or adding 'take the steps down' would add facts that aren't in the copy deck.

**Fix.** Relabel it 'Getting here', put the transport line first, and title the block 'Find us'.

### [MINOR · small] Food and drink details: no cider on the menu, 'organic and Fairtrade' reads as all, and 'from the counter' is unsourced

*Lens:* content · *Verifier:* partly

**Evidence.** The index says cider (S26) but the menu omits it. The source is 'many of our products are organic or Fairtrade' (S1).

**Fix.** Add 'Organic cider' to the menu. Write 'much of it organic or Fairtrade'. Make the H2 'All vegetarian'.

### [MINOR · small] Map labels sit on the river, 'not to scale' appears twice, and the route drawing is out of step

*Lens:* content+design+function · *Verifier:* confirmed

**Evidence.** 'Petersham Meadows: gone too far' and 'Grotto Gate / low on the left' are drawn on the water. Route segments 2, 4 and 5 light at steps 000/100/100/110/111, so step 3 adds nothing, and marker 4 sits left of its route.

**Fix.** Move the labels onto land, keep one 'not to scale', and use four segments that end on each marker.

### [MINOR · small] Hidden text: chip tooltips say 'restaurant', HTML comments carry designer notes, and aria-label sits on a <p>

*Lens:* content · *Verifier:* confirmed

**Evidence.** All nine chips carry title='To be confirmed with the restaurant'. View-source shows comments such as 'SIGNATURE: the waterline...'.

**Fix.** Change to '...with the café', strip the comments from the build that gets sent, and turn the dishes <p> into a <ul aria-label>.

### [MINOR · medium] The phone first screen's card hides the art at 660px, and actions are duplicated in card and bar

*Lens:* design · *Verifier:* partly

**Evidence.** Six buttons for three actions, plus the skip link. At 390x660 the card covers most of the art. The card itself was a deliberate Useful-first fix.

**Fix.** On phones keep Call in the card and rely on the bar for Find us and Menu. Recrop so the lamp and A-board aren't cut by edges.

### [MINOR · small] In the preview build the banner pushes the tide chip under the action bar

*Lens:* design+function · *Verifier:* partly

**Evidence.** Preview 390x844: chip at 779-829 against the bar at 780-844, so fully hidden; at 1280 it is clipped by 8px. Resolved if the chip goes (V04), but the Pause button still needs room.

**Fix.** Subtract a --banner-h from the hero height, or remove the chip.

### [MINOR · small] The palette reads overcast rather than 'bright, outdoorsy'

*Lens:* design · *Verifier:* partly

**Evidence.** The colour tokens are the brief's; the grey sky gradient and desaturated hedges make the result dull.

**Fix.** Warm the sky, add sunlit plane greens, and one warm accent (skiff varnish or the logo's cream).

### [MINOR · small] The 'Find us' jump lands with its heading cut off

*Lens:* function · *Verifier:* partly

**Evidence.** At 390x660 the heading lands at -10 to 3; at 1280 it is 10px under the header; with reduced motion it lands correctly. The address stays visible, so minor rather than major.

**Fix.** Add scroll-margin-top to #find and #hours, or make the reveal fade-only.

### [MINOR · small] The menu's 'Back to the top' hides the H1 under the sticky strip on phones

*Lens:* function · *Verifier:* confirmed

**Evidence.** At 320 the H1 top is at 12px against a strip bottom of 50px, so only 'DRINK' shows (verify/shots/menu-top-m320x568.png).

**Fix.** Target #main, or add the strip height to scroll-padding-top.

### [MINOR · small] Printing or a full-page capture leaves the menu and visit content blank

*Lens:* function · *Verifier:* confirmed

**Evidence.** In print media after load, 12 .rv elements stay at opacity 0 on the menu and 19 on index.

**Fix.** Add @media print { .rv { opacity:1; transform:none } }.

### [MINOR · small] The walk stepper loses keyboard focus at the last step, and its aria-label goes stale

*Lens:* function · *Verifier:* confirmed

**Evidence.** After the last Next, activeElement is BODY. The text says 'Arrived' while the aria-label stays 'Next step'.

**Fix.** Use aria-disabled instead of disabled, and keep the label in sync with the text.

### [MINOR · small] 'Pause the water' pauses only part of the motion, is forgotten on the menu page, and is first in the tab order

*Lens:* function · *Verifier:* confirmed

**Evidence.** menu.html has no [data-still] button, so the stored choice is never applied there. The garden ignores Pause (V17). In the DOM the button comes before Call, Find us and Menu.

**Fix.** Apply the stored state on every page and move the button after the Today strip in the DOM.

### [MINOR · small] At 320px 'Menu sample' clips in the card, and at 200% zoom Pause hides behind the card

*Lens:* design+function · *Verifier:* confirmed

**Evidence.** 'Menu sample' has scrollWidth 94 against clientWidth 85. At 640x400, elementFromPoint at the Pause button returns .today__v.

**Fix.** Shorten the label to 'Menu' below 360px. Hide Pause and the chip when the scene is under 480px tall.

### [MINOR · small] The hero's loops keep restyling after the hero has scrolled off screen

*Lens:* function · *Verifier:* confirmed

**Evidence.** Idle at the page bottom: 300 recalcs and 300 layouts per 5s, about 0.27s of CPU; zero when paused.

**Fix.** Add .still while the hero is not intersecting.

### [POLISH · small] Headings repeated in the next sentence, the strapline twice, mixed phone formats, Café/Cafe

*Lens:* content+design · *Verifier:* confirmed

**Evidence.** 'Three majestic plane trees' appears as the H2 and again in the next sentence. 'Hollyhock Café' appears three times in a row, once as 'Cafe'. The desktop first view shows the strapline twice. 'Call +44 (0)20...' on the menu vs '020...' elsewhere. innerText contains 'TIDE TABLES TIDE TABLES'.

**Fix.** Vary the H2s, use 'Café' consistently and one phone format, and hide the hero eyebrow when the header is visible.

### [POLISH · small] Mixed apostrophes, arrows touching text, the crowded strip overshooting, nav order

*Lens:* content+design+function · *Verifier:* confirmed

**Evidence.** 'What’s' is the only curly apostrophe. 'Back to the top↑' has no space before the arrow. The .signal strip ends at x1225 against a column edge of 1216. The nav order doesn't match the page order.

**Fix.** Use curly apostrophes, gap:.35em on the flex links, max-width:100% on .signal, and reorder the nav.

### [POLISH · small] Fragments copied out of context leave dangling words

*Lens:* content · *Verifier:* partly

**Evidence.** 'Our cafés are the best place…' with the Hollyhock half cut. 'By boat: we are also just by…' has a dangling 'also'. The 'though' in 'Watch out though' still mostly works.

**Fix.** 'Boat trips: we're just by the landing stage for boats to Hampton Court…', and restore the Hollyhock clause in Parties.

### [POLISH · small] 'About the river' is opaque without the second half of its sentence

*Lens:* content · *Verifier:* partly

**Evidence.** The section is brief-mandated and uses the copy deck's approved line. Adding 'the rest of the time holds the river at or above half-tide' (dossier fact 22) would need a copy-deck change.

**Fix.** Propose adding that clause to the copy deck. Optionally move the river section lower in the nav.

### [POLISH · small] Grid rules of different lengths, the dish teaser orphaning 'rice', a straight hero cut, the sample strip wrapping at 320

*Lens:* design · *Verifier:* confirmed

**Evidence.** The .find__grid border spans the wrap's padding box while the H2 rule spans the content. Only 'Good to know' has a top rule. At 390 'rice ·' starts a line. The hero ends in a straight cut. At 320 the strip wraps, leaving 'MENU' alone.

**Fix.** Put borders on inner elements, give all three columns one heading treatment, set the dishes as a list on phones, use a shore at the hero's foot, and shorten the strip text below 360px.

### [POLISH · small] Dead CSS and JS; the owner question list misses takeaway, toilets and payment; FHRS 5 unused

*Lens:* design+content · *Verifier:* partly

**Evidence.** Selectors .cue, .hero__actions, .hours, .menu-note, .dg-marker and .slot match nothing. FHRS 5 (S17) is verified, but it isn't in the copy deck, so using it needs a deck addition first.

**Fix.** Remove the dead code, add those questions to the email, and add FHRS 5 to the copy deck before using it.

## Refuted by the verifier

- **Unconfirmed facts printed without markers**: Each item is copy-deck sanctioned. The parties number and 'three majestic plane trees' are the café's own published words (§4, §5). The Christmas hours and the 'food and drink from 8am' wording are the deck's approved display lines (§3). They belong in the owner question list, not on the page. The real inconsistency, booking chip vs llms.txt, is kept under V22.
- **Stock phrases ('great' x4) and an unexplained 'Popina'**: This is the café's own copy, which the brief and tech spec tell designers to use. Glossing 'Popina' would add an unsourced fact.
- **PLA tide-times link could not be verified**: I reproduced the Cloudflare 403, but there is no evidence the URL is wrong, and NOTES already flags it. It is a pre-send check (open it in a real browser), not a defect.
- **Preview build garbles text because it has no charset meta**: The live artifact the email links to (claude.ai/artifact/7YgxyLyU9ztJUooKxTYehH) is wrapped by the host with <meta charset=utf8> and a viewport meta. The garbling happens only when the bare fragment is served locally. The title part stands (V25).
- **The banner's 'their site' clashes with 'our'; the closing disclaimer mentions prices**: The banner text is mandated verbatim by the brief, and the closing disclaimer is the café's own approved line (copy deck §6). The stacking and first-screen problem stands (V14).
- **Swap test 'largely fails'**: The half-tide-weir model, Grotto Gate and the Hollyhock walk are only-here. Only the hero visual is generic, which is kept as V02.
- **Write a cautious step-free line from VisitRichmond and the photos**: Those facts are in the dossier but not the copy deck, which is the only content designers may use. This needs owner confirmation first.
