# Audit: Caffè Mamma A · La Carta

**Verdict:** Needs work · **Readiness:** 4/10

Not ready to send. Three bugs are in the published preview, whose CSS and JS match the source byte for byte. The story section the pitch rests on, 'The restaurant with the washing', is visibly broken at every width from 768px up. The hero washing-line drawing breaks on 1920px screens. The booking form opens in an error state every evening after 7.30pm. Underneath is a calm, well-typeset menu site, but it reads as generic, because the restaurant's 40-year-old brush-script logo is replaced by Young Serif. It also has 43 red 'to confirm' chips, repeated facts, and some prices and dishes the research doesn't support. Most bugs take under 30 minutes to fix; the identity work takes longer.

| Lens | Raw findings | Impress owner | Craft | Usefulness | Accuracy |
|---|---|---|---|---|---|
| content | 27 | 4 | 4 | 6 | 5 |
| design | 28 | 4 | 4 | 7 | 6 |
| function | 26 | 5 | 5 | 7 | 6 |

## Strengths to keep

- The typeset menu is the best part. It has Italian names, dotted leaders and right-aligned tabular prices, sets in two columns on desktop, and is real HTML rather than a PDF. It reads like a printed card.
- The first phone screen is useful. It shows the date, today's hours, Call, the address with Directions, and Book and See the menu, with a fixed Book / Menu / Find us bar. That is a big improvement on the current site's nav-wall first screen.
- The booking hand-off is honest. Nothing is falsely confirmed, a 'Continue to OpenTable' link appears when the pop-up is blocked, and parties of nine or more are sent to the phone.
- 'Mark the menu' is a good, on-concept idea, and on the menu page the pen loops genuinely look hand-drawn.
- It degrades well. It works without JS and respects reduced motion. No console errors or horizontal overflow appeared at any width tested, axe reports nothing at 1280, and every tel: and Maps link is consistent.
- The two-ink palette is calm and high-contrast, with a strong red Book button.
- The honesty footer and the to-confirm system are open with the owner about which facts are unverified; the chips only need consolidating.

## Verified findings (ranked)

### [BLOCKER · small] The story section 'The restaurant with the washing' is broken at every width from 768px up

*Lens:* design+function+content (A-01, A-D01, A-F01) · *Verifier:* confirmed

**Evidence.** From 768 to 1440px, the computed grid-column of .story__date is 1/8, the same as the paragraph beside it. The years '1983 TO CONFIRM', '2004' and '2006' and the place labels print on top of the body text. Every row gets a red drop cap (C, T, I, T). The last row's <div> is auto-placed into a sliver 50px wide at 768, 78px at 1280 and 91px at 1440, so 'The line is still up…' and the bold Portuguese-family line set one word per line (the row is 735px tall at 1280). Mobile under 768 is fine. Cause: `.story__row > p {grid-column:1/8}` (specificity 0,1,1) beats `.story__date {grid-column:8/11}` (0,1,0), because .story__date is itself a <p>; no rule places the <div>; and `.story__lead p:first-child::first-letter` matches the first paragraph of every row. The published build has identical CSS. Screenshots: verify/shots/story-1280.png, story-768.png, sheet-d1280-index.png.

**Fix.** Use `.story__row > .story__date { grid-column: 8 / 11; grid-row: 1; }` and `.story__row > :not(.story__date) { grid-column: 1 / 8; grid-row: 1; }`. Limit the drop cap with `.story__lead .story__row:first-child > p:first-child::first-letter`. Re-shoot at 768, 1024, 1280 and 1920.

### [MAJOR · small] The hero washing-line drawing is left incomplete on screens wider than about 1650px when motion is on

*Lens:* design+function (A-D02, A-F02) · *Verifier:* confirmed

**Evidence.** At 1920×1080 the SVG scales 1.176×, and after the draw-in its paths keep stroke-dasharray 1px. The rope stops well short of the right-hand × and the shirts lose collars and shoulders (draw-1920-no-preference.png against draw-1920-reduce.png; first-1920.png). At 1280 and 1440 the scale is below 1 and the drawing is complete. Cause: pathLength=1 combined with vector-effect: non-scaling-stroke. I downgraded this from blocker because it only shows on wide screens and is a one-line fix.

**Fix.** When the timeline completes, clear the dash: tl.eventCallback('onComplete', () => gsap.set(paths, {clearProps:'strokeDasharray,strokeDashoffset'})). Alternatively, drop non-scaling-stroke on the animated paths. Re-check at 1920 and 2560.

### [MAJOR · small] The booking form shows an error every evening after 7.30pm, 'Check availability' checks nothing, and the visitor's choices are thrown away

*Lens:* function+content+design (A-F04, A-F05, A-11, A-F17, A-D11 partly) · *Verifier:* confirmed

**Evidence.** I faked the clock in Europe/London. At 19:45 and at 21:59 the form loads with 'That time has already gone today…' and a disabled button, because the time is hard-coded to 19:30 and the date to today (the 22:00 slot is still free at 21:59). Submitting calls window.open on the bare OpenTable URL with no party, date or time, then says 'Choose Table for 4, Wednesday 28 October, 7.30pm there; Nothing is booked…' (note the capital N after the semicolon). The copy says 'For nine or more, or a table today, please call', but the form defaults to today and og:description promises 'a table for tonight'. On top of that, the sentence form breaks awkwardly ('at' is orphaned and the party select is over-wide).

**Fix.** Default to the next bookable slot today, or to tomorrow at 19:30 if none is left, and show the error only after the user picks a past time. Rename the button 'Continue to OpenTable' and pass covers and date-time once the OpenTable ID is confirmed. Make the same-day rule consistent between the copy and the form. Fix 'there. Nothing'.

### [MAJOR · small] Specific prices and dishes are shown as fact with no source in the research

*Lens:* content+design+function (A-03, A-04, A-D13, A-F09, A-23) · *Verifier:* confirmed

**Evidence.** research.md line 37 gives eight pizzas only as a group range of £13.95–£14.95. The menu prints six of them (Diavola, Capricciosa, Quattro stagioni, Tonno e cipolle, Tropicana, Calzone) at exactly £14.95 with no chip. The party set menu shows £23.95 with a chip, but research says only 'Party menu price [TO CONFIRM]'. On menu.html the party starters line ('Calamari, sardines and mozzarella caprese') has no chip. The Quattro stagioni ingredients and the Xpress Lunch starters appear only in the intermediate scratchpad copy-deck.md, which cites no source, not in research.md. Owner-voice claims with no research source: 'For nine or more… please call', 'Soft drinks, juices and water from £1.90' (research says soft drinks only), and 'all 14 major allergens in every dish'. The brief says 'Nothing is invented'. Refuted sub-point: the zabaglione description is simply the dish's definition.

**Fix.** Show the six pizzas as '£13.95–£14.95', or chip each price. Show the party price as 'Price on request', or record its source in research.md. Chip or cut the party starters, the lunch starters and the Quattro stagioni description. Soften the claims: 'Large group? Call us', 'Soft drinks from £1.90', 'Ask us for allergen information on any dish'.

### [MAJOR · medium] 'To confirm' chips are too many and too repeated, and they turn copy into fragments and researcher talk

*Lens:* content+design+function (A-06, A-07, A-08, A-13, A-D08, A-F08, A-F16) · *Verifier:* partly

**Evidence.** There are 22 visible chips on the homepage and 21 on the menu. Each page has 4 in its first 390×844 screen, and the menu has 6 in its first 1280 screen. The hours fact ('12 noon – 11pm') is chipped 5 times on the homepage. The menu margin reads 'Prices in £, from our current menu, being re-checked. TO CONFIRM Service charge TO CONFIRM / Dietary markers to be confirmed with the kitchen. TO CONFIRM'. Fragments include 'Deliveroo and Uber Eats TO CONFIRM', 'Last orders TO CONFIRM', 'Online through OpenTable, TO CONFIRM or by phone' and 'The full wine and drinks list TO CONFIRM'. The 1983 date is chipped twice while 2004 has no chip. The chips are intentional and some are defensible (parking comes from a site last updated around 2015), but their volume and placement make the first screens look like a marked-up proof. Screenshots: m390-index-first.png, d1280-menu-first.png.

**Fix.** Chip each fact once, in its canonical place (the hours table, the menu key and each uncertain price). Replace the per-line researcher phrases with one sample line per page ('Draft menu: dishes and prices being checked with the restaurant'). Write placeholders as complete sentences ('Last orders: please ask.' / 'Also on Just Eat.' / 'Ask for the full wine list.'). Consider a pencil-grey chip so the red pen stays for Book and Mark the menu.

### [MAJOR · medium] The same facts repeat: two 'Oggi' blocks side by side on the desktop first screen, and a margin column that never changes

*Lens:* content+design (A-09, A-D09, A-D06 partly) · *Verifier:* confirmed

**Evidence.** The 1280 first screen has the margin 'OGGI martedì 27 ottobre / Open today 12 noon – 11pm' beside the hero 'OGGI Open today, 12 noon – 11pm'. On that screen the date appears twice, the hours 3 times and the phone number 3 times (header, TELEFONO, and the 'call' line). In the homepage text, '12 noon – 11pm' appears 5 times and '020 8948 8330' 8 times, and the allergy line appears twice plus once in the margin. The sticky margin repeats the same four notes (Oggi, Lunch, Key, Allergies) down the whole page, so the broadsheet margin does no work after the first screen (sheet-d1280-index.png).

**Fix.** Keep one Oggi block on desktop, and drop the masthead 'Telefono' and the hero 'Open 7 days…' line. Say the allergy line once on the homepage. Make the margin notes change by section (the offer beside Book, walking times beside Find us, dates beside the story), or end the margin after the hero.

### [MAJOR · large] The identity reads as generic: the real brush-script logo, its green stroke and the room's colours are gone, and the type and layout are common

*Lens:* design (A-D03, A-D04 partly, A-D06 partly) · *Verifier:* partly

**Evidence.** The real logo is a red dripping brush script with a green underline stroke and spaced RISTORANTE (research-assets/current-site-mobile-header.jpg, frontage-kew-road.jpg). The site sets the name in Young Serif at up to 176px, and the green stroke appears nowhere. The brief promised a labelled logo slot ('Type treatments evolve it rather than replace it'); that slot was removed on 27 October. The interior's blue ceiling, yellow napkins and roses, and coloured shirts don't appear. Young Serif with Instrument Sans is a common Google Fonts pairing, and the page structure is a standard kicker-plus-H2 stack repeated five times. Partly confirmed: the brief prescribed this pairing, and qa.sh's watch list is the sprint's own font list, not a list of AI defaults. This matters because the user explicitly asked for no generic fonts or layouts.

**Fix.** Trace the brush-script wordmark as SVG and use it in the header, the hero and the footer. Bring the green stroke back as a recurring mark. Add ceiling blue and napkin yellow somewhere, for example the lunch slip and the footer. Break the section formula at least once, for example by setting the story along a full-width line with the dates pegged to it.

### [MAJOR · small] 'Back to the courses' scrolls the desktop menu down instead of up

*Lens:* function (A-F03, A-D25) · *Verifier:* confirmed

**Evidence.** At 1280, clicking the link under Pizze moved scrollY from 2071 to 2384 and landed on Carne. The target #courses sits inside the sticky margin, so the browser scrolls by the sticky offset. There are 9 of these links, and on desktop the course index is always visible anyway.

**Fix.** Hide .back-top at 1024px and up. On smaller screens, point the link at an anchor outside any sticky container.

### [MAJOR · small] 'Mark the menu', the signature interaction, gives little or no visible result on phones and marks adult dishes as kids' dishes

*Lens:* function+content+design (A-F07, A-16, A-F19, A-F23, A-D07 partly) · *Verifier:* confirmed

**Evidence.** At 390 the mobile bar hides the title, the intro and the status line. Tapping 'Lunch deal' from scrollY 1400 marks one slip at y≈6090; nothing scrolls, and the only change on screen is that the visible dishes turn grey (m390-mark-lunch.png). 'For the kids' marks the adult Spaghetti bolognese (£13.75) and Margherita (£12.95) as well as the £9.95 children's menu; on the homepage it reports '1 dish marked.'. The vegetarian loops start at x = −2 to 0px and are clipped at the left screen edge (m390-mark-veg.png). The loops themselves read nicely as pen.

**Fix.** Show a visible one-line status in the bar ('3 marked · show me ↓') and scroll to the first match. Tag only the children's menu as kids. Clamp the loops to start at least 2px inside the screen edge. On the homepage, link 'For the kids' and 'Lunch deal' through to menu.html with that filter applied.

### [MINOR · medium] The washing-line drawing is small and generic, and on phones only its two end marks show above the action bar

*Lens:* design (A-D05, A-D23, A-D24) · *Verifier:* partly

**Evidence.** At 390×844 the drawing's top is at 745px, so only the two red × end marks peek above the action bar, which looks like a glitch. At 1280 it is 486×183px. It shows six uniform outline T-shirts in one stroke weight, not the sports shirts, bunting and blue ceiling of the real room. The menu page has no drawing at all. I don't agree it is 'clip-art grade': it is clean and on-concept, just modest.

**Fix.** Bring the line into the first phone screen, or drop it fully below the bar. Redraw it from the interior photo with club shirts, varied line weight and pegs drawn individually. Consider a small reprise on the menu page, for example with the set-menu slips hanging from it.

### [MINOR · small] The restaurant's name is invisible in the hero until the GSAP CDN script arrives

*Lens:* function+design (A-F06, A-D22) · *Verifier:* confirmed

**Evidence.** `.motion .js-set {opacity:0}` hides the hero wordmark. It reached full opacity at about 680ms on a normal load and about 2,450ms with a 1.8s CDN delay, leaving a blank hole above the voice line (m390-slowcdn-900ms.png). The header still shows the brand name, which is why this is minor. NOTES.md says no essentials are faded.

**Fix.** Remove .js-set from the wordmark, the descriptor and the masthead, and keep the ink-line draw as the only motion moment.

### [MINOR · small] On phones the menu page shows no dish on its first screen, and the sticky mark bar is 105px tall

*Lens:* design+function (A-D12, A-F12) · *Verifier:* confirmed

**Evidence.** At 390×844 the first dish starts at y=1020; the first screen is spent on the title, the course index and a dietary key with 3 chips. The sticky mark bar is 105px tall around 44px buttons, with dead space underneath.

**Fix.** Reduce the dietary key to one line under the index. Add `.mark-bar .marker {margin:0}` and remove the min-height reserve.

### [MINOR · small] 'In Richmond since 1983' contradicts the page's own story

*Lens:* content (A-02) · *Verifier:* partly

**Evidence.** The hero says 'In Richmond since 1983', while the story says the restaurant moved to Barnes in 2004 and 'came back to Richmond' in 2006. Partly confirmed: Barnes is inside the London Borough of Richmond upon Thames, and research.md itself proposed this wording, so the line isn't false. But the page contradicts itself.

**Fix.** Use 'Since 1983' or 'Feeding Richmond since 1983'.

### [MINOR · small] An unconfirmed line about the owner's nationality is set as the story's payoff

*Lens:* content (A-05) · *Verifier:* partly

**Evidence.** 'An Italian kitchen with a Portuguese family behind it, and family-run to this day. TO CONFIRM' is set in bold serif as the closing line. Research has only 'The owner is Portuguese' and 'How the owners want this told [TO CONFIRM]'. 'Family… to this day' implies a continuity from 1983 that isn't established.

**Fix.** End the story on 'The line is still up…' and ask the question in the pitch email instead. Joseph knows the owner and can judge.

### [MINOR · small] 'Open today' is static text beside a live date

*Lens:* content+function (A-21, A-F10) · *Verifier:* confirmed

**Evidence.** The status reads 'Open today, 12 noon – 11pm' at 23:30 and on 25 December, while the live Italian date beside it makes it look like a live status. The code only swaps in the date.

**Fix.** Compute 'Open now until 11pm' or 'Opens 12 noon' in JS, add an exceptions list to confirm with the owner, and keep the static line as the no-JS fallback.

### [MINOR · medium] The set menus and drinks are thin, Christmas is an empty card in late October, and the taster's descriptions are one word

*Lens:* content+design (A-15, A-D21, A-10 partly, A-D20) · *Verifier:* partly

**Evidence.** The Christmas slip reads 'Available in season. Details TO CONFIRM'. The lunch slip has no price because the research conflicts (£11.95 or £18.95). 21 of 49 dishes have no description; that is correct under the copy deck's no-invention rule, so it isn't a defect in itself. But the homepage taster shows off 'Linguine alle vongole: Clams.'.

**Fix.** Make Christmas an action: 'Christmas parties: now booking. Call for dates and the menu.' Pick taster dishes that have descriptions. Get the current menu from the owner.

### [MINOR · small] Takeaway, the terrace and the Kew Gardens walk are underplayed

*Lens:* content+function (A-12, A-18, A-F21) · *Verifier:* partly

**Evidence.** Takeaway is a single row ending in the fragment 'Deliveroo and Uber Eats TO CONFIRM', with no Just Eat link. The confirmed front terrace is never mentioned. The Kew Gardens row reads 'Up the road: a walk along Kew Road. TO CONFIRM', with no time and no gate named.

**Fix.** Add a line 'Pizza to take away: call 020 8948 8330 · Just Eat →'. Add a terrace line. State the walk to the named gate in minutes (Joseph can measure it).

### [MINOR · small] Vegetarian markers are inferred and may be wrong on cheese dishes

*Lens:* content (A-17) · *Verifier:* partly

**Evidence.** V appears on Quattro formaggi, Tagliatelle al pesto and others, but hard cheeses such as parmesan often use animal rennet. The markers are already flagged with a 'to be confirmed' chip, which is why this is only partly confirmed.

**Fix.** Mark only dishes that are vegetarian beyond doubt, or show 'Vegetarian? Ask us' until the kitchen confirms.

### [MINOR · small] The sticky course index hides 'Bevande' on common laptop screens, and its highlight goes stale

*Lens:* function (A-F11, A-F25) · *Verifier:* confirmed

**Evidence.** At 1280×800 the sticky box ends at y=776 but Bevande sits at 768–804. At 1366×768 the box ends at 744, so Bevande needs a nested scroll. After pressing End and returning to the top, 'Bevande' stays highlighted (aria-current).

**Fix.** Make the marker more compact on desktop or put the index first, and clear aria-current when the reader is above the first course.

### [MINOR · small] Keyboard focus is hidden under the sticky header

*Lens:* function (A-F13) · *Verifier:* confirmed

**Evidence.** Walking backwards with Shift+Tab on the 1280 menu left 5 focused links at a top of 0–53px, under the 64px header. scroll-padding-top is not set.

**Fix.** Set html { scroll-padding-top: calc(var(--head-h) + 16px) }, and on the mobile menu page use the mark-bar height instead.

### [MINOR · small] The header and running strip break at 320px

*Lens:* design+function (A-D19, A-F14) · *Verifier:* confirmed

**Evidence.** At 320px 'Find us' wraps to two lines, the strip truncates to 'Today 12 noon – 11pm…' and hides its chip (scrollWidth 183 > 181), and 'ITALIAN · RICHMOND' wraps (m320-index-first.png). I didn't verify A-F14's claim about anchors landing under the mark bar.

**Fix.** Below 360px, shorten the nav, let the strip wrap, and stack the sub-labels on purpose.

### [MINOR · small] The homepage 'Mark the menu' heading is in faux bold

*Lens:* design (A-D15) · *Verifier:* confirmed

**Evidence.** The h3.marker__title computes to font-weight 700 in Young Serif, which ships only weight 400, and font-synthesis is on. It renders heavier than the H2 above it. On menu.html the same title is a <p> at weight 400.

**Fix.** Set .marker__title { font-weight: 400 }, and add font-synthesis: none on the serif.

### [POLISH · small] The footer's honesty line has a full stop floating away from the link

*Lens:* content+design+function (A-25, A-D16, A-F15) · *Verifier:* confirmed

**Evidence.** .foot__proposal a is inline-flex with margin-right 12px and a 44px min-height, so the line renders as 'caffemamma.co.uk   .' on both pages.

**Fix.** Make the link display:inline with no margin, and get the tap size from vertical padding.

### [POLISH · small] Small alignment flaws: the ASK label, inset rules, an over-wide select and a chip inside a heading

*Lens:* design+function (A-D17, A-D18, A-F24) · *Verifier:* partly

**Evidence.** In the party facts, the 'ASK' label sits higher than its 44px inline-flex link. The double rules on the footer and the offer are built from a box-shadow with -4px spread, so the thin line is inset 4px at each end. The party select is far wider than the '2' it shows. The Insalate heading carries a chip.

**Fix.** Use align-items: baseline in the party facts. Build double rules from real borders or the existing .dbl element. Size the select to its content. Move the Insalate chip out of the heading.

### [POLISH · small] There is no maximum content width on very wide screens

*Lens:* design (A-D10) · *Verifier:* partly

**Evidence.** At 1920 the menu leaders are about 510px long and each dish row is 733px wide. It is still readable, so the auditor's 'unreadable' is overstated.

**Fix.** Cap the content at about 1440px and the menu card at about 1100px.

### [POLISH · small] Copy and labels need tidying

*Lens:* content+function (A-14, A-22, A-24, A-19, A-F20) · *Verifier:* partly

**Evidence.** The Find-us section has four names ('Find us', 'Opening hours and getting here', 'Opening hours and how to find us', 'Opening hours and find us'). The story has filler ('its spiritual home', 'and more'). The children's menu is worded differently on the two pages. 'marsala' should be 'Marsala'. 'alla Mamma's' was changed to 'alla Mamma' without being listed in the README's corrections. Italian text such as the date and the kickers has no lang="it".

**Fix.** Use one label everywhere, cut the filler, align the children's menu wording, capitalise Marsala, list every name change in the README, and add lang="it" to the Italian spans.

### [POLISH · small] Metadata and accessibility housekeeping

*Lens:* content+design+function (A-26 partly, A-D26, A-F22, A-D28) · *Verifier:* partly

**Evidence.** There is no og:image, so a shared link previews without a picture. The JSON-LD hasMenu points at caffemamma.co.uk/menu.html, which doesn't exist on the live site. The source has no noindex (the publish build adds it). axe-core reports region (moderate, 3 nodes) at 390 on both pages, because the running strip and mark bar sit outside any landmark.

**Fix.** Add a 1200×630 og:image, remove or mark the placeholder URLs, and put the strip and mark bar inside landmarks.

## Refuted by the verifier

- **The preview banner is out of palette and pushes the buttons down**: The banner is intentional. In the wrapped preview it is 71px (3 lines) at 390. At 390×844 the hero Book and See the menu buttons still show, and at 390×660 Book and Menu remain in the fixed action bar. Its look doesn't genuinely harm the pitch.
- **The preview index has no meta charset**: The artifact host wraps the page in a document skeleton. Once wrapped it renders 'Caffè' correctly, and the function auditor found the live file matches apart from the wrapper. A tab title of 'Caffè Mamma La Carta' is fine for a pitch. The other metadata points are kept in V-27.
- **Cryptic Italian labels and kickers**: This is the concept's intended flavour, and every Italian kicker is followed by a plain English H2. It is harmless. Only the missing lang="it" is kept, in V-26.
- **The menu page's h1 should be 'Menu'**: 'La carta' is the concept title. 'The full menu' sits directly beneath it, and the nav marks Menu as current. The inconsistent Find-us labels are kept in V-26.
- **The menu page loads 42KB of GSAP**: 42KB of cached CDN script with no runtime cost is irrelevant to whether this pitch is ready to send.
- **The best story sits at the bottom of the page**: This is a deliberate useful-first ordering (essentials first), and the hero voice line already carries the washing line. Only the filler-copy part is kept, in V-26.
- **The zabaglione description is unsourced**: 'Egg yolk, Marsala and sugar' is the definition of the dish, not an invented claim. Only the capitalisation of Marsala is kept, in V-26.
- **The parking chip marks a fact the research confirms**: Chipping it is defensible: the source site hasn't been updated since about 2015, and the README lists parking as to confirm. The other A-07 points are folded into V-05.
- **The fonts are watch-listed AI or template defaults**: qa.sh's watch list is the sprint's own font list across all three concepts, not a list of AI defaults, and the brief prescribed this pairing. The underlying point, a common pairing and a lost logo, is kept in V-07.
