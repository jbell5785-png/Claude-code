# Audit: Caffè Mamma B · Sera

**Verdict:** Needs work · **Readiness:** 4.5/10

Sera is not ready to send. In the published preview, the disclaimer banner covers the restaurant's name on phones. 'Check availability' passes nothing to OpenTable and pre-fills bookings that have already passed. The signature scene hangs the shirts in the upstairs function room. Several prices and set-menu dishes have no source. Below the hero the page is generic text on colour fields, and the restaurant's nickname 'the restaurant with the washing' never appears. About a day of small fixes makes it safe to send; to impress the owner, the sections below the hero need a real design pass. (The required REPORT.md was not written: the harness refused the report write, so the full report is in this result.)

| Lens | Raw findings | Impress owner | Craft | Usefulness | Accuracy |
|---|---|---|---|---|---|
| content | 27 | 5 | 6 | 6 | 5 |
| design | 30 | 5 | 5 | 6 | 6 |
| function | 24 | 5 | 5.5 | 6.5 | 6 |

## Strengths to keep

- The hero is an accurate, recognisable drawing of the real frontage: the double-height glass storey with louvres, the cream fascia with the phone number and URL, the coloured festoon, the terrace tables and the green-fascia neighbour. The afternoon-to-night moment is the most memorable of the three concepts.
- The essentials are static HTML on the first phone screen: name, today's status, the address with a map link, Book a table and See the menu, plus a sticky Call, Find us and Book bar. Reduced-motion and no-JS visitors get the finished lit frame.
- The London-time status logic is correct: 'Open now, until 11pm' at 13:00 and 'Closed now…' at 23:30, and it stays in London time for a visitor in New York.
- The menu page reads well: cleanly typeset on night, with right-aligned tabular prices, all 53 dishes in the HTML, the corrected spellings, and a sticky course rail that tracks the course on screen.
- The booking and offer copy is honest ('Nothing is booked until you do', with the offer's exclusions written out).
- Contrast is handled at every colour stage, fonts load with metric-matched fallbacks, and the copy is calm and free of marketing filler.

## Verified findings (ranked)

### [BLOCKER · small] In the published preview, the disclaimer banner covers the fixed header and pushes the hero's Book button under the action bar

*Lens:* function/design/content (B-C11, B1, B-F01) · *Verifier:* confirmed

**Evidence.** The live artifact (version 1793046212-7e51) is served with its host skeleton. At 390x844 the banner covers 0–71px and the fixed header sits at 0–60px. A hit-test on the wordmark returns the banner (role=note), so the 'Caffè Mamma' wordmark and the 'Menu' link are invisible. The hero's 'Book a table' sits at 753–801px, and the action bar starts at 780px. At 320 the banner is 88px tall. At 1280 the banner covers 0–36px of the 76px header and slices through the wordmark and nav. Screenshots: verify/shots/prev-index.html-390x844.png and prev-index.html-1280x800.png. The cause is in banner_build.py: the banner is in normal flow with position:relative, while the header is position:fixed at top:0.

**Fix.** In banner_build.py, fix the banner to the top and expose its height as --ban. Inject .site-header{top:var(--ban)}, add var(--ban) to the hero's padding-top and to html scroll-padding-top, and keep the banner to one line on phones. Alternatively, move the notice to a slim strip above the footer. Change 'an independent studio' to 'Joseph Bell'. Re-shoot 320, 390 and 1280 from the live link.

### [MAJOR · small] 'Check availability' checks nothing, drops party, date and time, and offers times that have passed

*Lens:* function/content (B-C02, M8, B-F03, B-F04, B-F14) · *Verifier:* confirmed

**Evidence.** window.open was stubbed. It received exactly https://www.opentable.co.uk/r/caffe-mamma-ristorante-london with no parameters at every time tested. At Tue 27 Oct 23:30 London the form defaults to today, 7.30pm, and the summary reads 'Table for 2, Tuesday 27 October, 7.30pm: we'll take you to OpenTable to confirm.' The time list is a fixed 12 noon–10pm. home.js takes the date from the device. A New York visitor at London 00:00 on Saturday sees the status 'Open today', but the form defaults to Friday 30 October. The fallback line reads 'Open OpenTable … if it didn't open.'

**Fix.** Pass covers and dateTime on the deep link (e.g. ?covers=2&dateTime=2026-10-28T19:30; check the format against the live listing). Work out 'today' in Europe/London. After about 9.30pm, default the date to tomorrow, and disable today's past times. If the choices can't be passed through, rename the button 'Continue to OpenTable'. Reword the fallback to 'Didn't open? Book on OpenTable.'

### [MAJOR · medium] The signature scene hangs the shirts in the upstairs glass storey (the function room), drawn as 13 copies of one plain T-shirt

*Lens:* content/design (B-C01, M1) · *Verifier:* confirmed

**Evidence.** In the lit frame (verify/shots/zoom-night.png) the line of shirts runs across the double-height glass upper storey. The SVG desc says 'the tall glass upper storey lit from inside, with a line of shirts across the room'. The interior photo shows the shirts in the ground-floor dining room under the blue ceiling, with the curved staircase rising from that room, and research.md says the staircase goes 'up to the function room'. The page's own story says the line runs 'across the dining room'. All 13 shirts use the same path (M-11 0L-25 6L-31 20…), as muted crew-neck tees rather than red and blue football shirts. Lowered from blocker: it is an illustration, and Joseph can confirm quickly.

**Fix.** Confirm the room with Joseph. If it is the dining room, put the shirt silhouettes behind the ground-floor shopfront glass above the tables, and light the glass storey as the function room with lanterns or bunting. Redraw 5–6 distinct sports-shirt shapes (collars, stripes, hoops) in the brand red, blue and white, and update fr-desc to match.

### [MAJOR · small] 41 'to confirm' chips, styled as bright uppercase underlined links, with 4 on the menu's first phone screen before any dish

*Lens:* content/design/function (B-C07, B-C08, M7, B-F06) · *Verifier:* confirmed

**Evidence.** DOM count: 20 visible .tbc on index and 21 on the menu, at 390 and 1280. On the menu's first screen at 390x844 there are 4 chips (hours, dietary markers, prices, service charge) and the first dish is below the fold (verify/shots/src-menu.html-390-mo-first.png). On dark stages the chips are lamp #F4B54A, at 10.2:1 against night, uppercase and underlined. Some rows are only a chip: Last orders, Step-free access, Service charge, Lasagne's description, and the prices of Zuppa del giorno and Pane all'aglio. Chips also break sentences ('in 1983 TO CONFIRM, serving…'). Some can go now: the currency chip; parking, which research.md marks 'Confirmed (site)'; the hours chip repeated five times; and the walk time, which can be measured. Correction to B-C08: search does show a Deliveroo page (deliveroo.co.uk/menu/London/richmond/caffe-mamma) as well as the Uber Eats store.

**Fix.** Restyle the chip as a small muted marker in soft ink, with no uppercase, underline or accent colour (a superscript dagger works). Add one legend line to the preview banner or each page intro. Move chips to the ends of sentences. Mark each unconfirmed fact once. Remove chip-only rows or write 'Ask us when you book'. Check the delivery platforms and link only the live ones. Aim for 5–8 chips per page.

### [MAJOR · small] Specific facts with no source in research.md: per-pizza prices, the party price, named set-menu dishes, the 9+ rule and inconsistent V marks

*Lens:* content/design/function (B-C04, M12, B-F17, B-C17) · *Verifier:* confirmed

**Evidence.** research.md gives only '£13.95–£14.95' for eight pizzas, but six are each priced at exactly £14.95. The Quattro stagioni description has no source. The party set menu is printed at £23.95, while research says 'Party menu price [TO CONFIRM]' with no figure. The party dishes (calamari, sardines, caprese, sea bass, seafood risotto) and the Xpress Lunch starters (bruschetta con pomodoro, mozzarella and tomato salad, egg with spinach) appear nowhere in research.md, and web searches found none of them. 'Nine or more, please call' is presented as the restaurant's rule. Pesto, Quattro formaggi and Risotto paisana are marked V, while Formaggi italiani is not. Refuted sub-point: the '14 major allergens' line describes a UK legal duty.

**Fix.** Show the pizza range, or mark each inferred price. Drop the Quattro stagioni description and the named set-menu dishes. Show the party menu as 'Price to confirm'. Change the 9+ rule to 'Large groups: please call'. Remove the doubtful V marks until the kitchen confirms. Record a source for every price that stays.

### [MAJOR · large] Below the hero the page is generic: text on colour fields, empty right halves, the day rewinds, and the nickname is missing

*Lens:* design/function/content (M3, M4, M6, M10, M11, B-F08, B-F15, G1, B-C06, m12) · *Verifier:* confirmed

**Evidence.** At 1280 (verify/shots/sheet-index-1280.png), Visit, Find us, Lunch, Story, Parties and Book all use the same pattern: a label, a lowercase Italiana headline, and copy in 4 of 6 columns with the right side empty. There is no imagery after the hero apart from the small lamp. Measured empty lead-ins: 376px before Find us, and 176px before each later scene. Menu courses are about a viewport tall on desktop, so Insalate (two dishes) fills a screen. The hero ends at night, then Visit snaps back to afternoon cream. 'The restaurant with the washing' appears 0 times in B, against 3 in A and 3 in C. The taster shows five generic pastas instead of the house dishes (Funghi Mirele, alla Mamma, Zabaglione). With motion on at 390, nothing peeks below the hero. M6, M11 and G1 are subjective, and I agree after looking.

**Fix.** Carry the drawn world through in the hero's hand: a pegged line of shirts for Story, the curved staircase for Parties, the Kew Road walk for Find us, a laid table with a yellow napkin and rose for the taster. Use the empty half-columns for these. Tell the day once: either keep night and lamplight after the hero, or rest the hero at golden hour and switch the lamps on at Book. Remove min-height from text-only scenes and from .course. Add the nickname to the hero descriptor, the story lead and the meta and og descriptions. Lead the taster with the house dishes.

### [MAJOR · medium] The real red-script logo is missing: a thin Italiana wordmark replaces it, the promised logo slot was removed, and the type has no link to the brand

*Lens:* content/design (B-C12, M5, m6) · *Verifier:* partly

**Evidence.** The header and footer wordmark is Italiana in plaster colour. The only red script is the monoline stand-in drawn on the fascia. The brief promised 'a clearly marked logo slot in every concept', and NOTES.md says the slot was removed. The descriptor H1 is 11px and 'RISTORANTE' is 9px (computed). Correction to M5: the font list in qa.sh and tech-spec-v2 reserves Caffè Mamma's own fonts for distinctness in later projects; it is not an overused-fonts list. The brand-fit point stands: Hanken Grotesk is an ordinary grotesque, and Italiana's hairline Didone reads as fine dining, not a family trattoria.

**Fix.** Trace the real script, green stroke and spaced RISTORANTE from the current-site screenshot into an SVG placeholder. Use it in the header, the footer and on the fascia, or at least label the header mark 'your logo goes here'. Consider a text face with more character, and keep Italiana only for large display sizes.

### [MAJOR · small] On a phone, the 'lights come on' sequence is over in one swipe

*Lens:* function (B-F05) · *Verifier:* confirmed

**Evidence.** Real CDP touch drag of 500px at 390x660 with rAF logging: the first bulb lit at 289ms (scrollY 285) and all 18 were lit by 406ms (scrollY 385), so the bulb-by-bulb effect lasted about 117ms. The page settled at 485px.

**Fix.** Keep the sky scrubbed by scroll. Once progress passes about 0.6, play the bulbs as a timed tween of about 1.2–1.8s with a 60–90ms stagger. Keep reduced motion static.

### [MAJOR · small] 'Table for tonight?' contradicts 'Nine or more, or tonight: call', and stays up after closing

*Lens:* content/function/design (B-C03, B-F07, m9, B-F13, B-C23) · *Verifier:* confirmed

**Evidence.** The hero headline is static. At 23:30 London it shows 'Table for tonight?' directly above 'Closed now, open tomorrow from 12 noon' (verify/shots/hero-2330.png). The booking details say 'NINE OR MORE, OR TONIGHT — Call us … or email', while the online form defaults to today, and the summary adds 'Booking for today? You can also call us'. There is no holiday closure handling. Partly: the live open or closed state uses unconfirmed hours, but it is marked as such, which is acceptable in a pitch.

**Fix.** Have the London-time script also set the headline: 'Lunch today?' before 4pm, 'Table for tonight?' until 9.30pm, then 'Table for tomorrow?'. Pick one same-day rule and say it once. Add a short closures list (25–26 December).

### [MAJOR · small] A duplicated <div class="book__main"> stacks the booking details under the form on desktop

*Lens:* function/design/content (B-C21, B2, B-F02) · *Verifier:* confirmed

**Evidence.** index.html lines 268 and 269 both open book__main, and only one is closed. The live artifact has the same bug (lines 265–266). In the DOM, #book's children are svg.book__lamp and a single DIV.book__main. .book__details has parent book__main, at x 102 with width 708, the same column as the form. At 1280 the right 40% of the section is empty and the alt links sit right on top of 'BOOKING ONLINE'. Lowered from blocker: it looks unbalanced rather than broken.

**Fix.** Delete line 269, then re-check the two-column layout at 900, 1280 and 1920.

### [MINOR · medium] Craft slips in the hero illustration and the booking lamp

*Lens:* design/function (M2, p1, B-F12) · *Verifier:* partly

**Evidence.** Night frame at 1280 (verify/shots/zoom-night.png): the neighbours' windows and ground-floor doors are identical flat amber blocks; three translucent rectangles in the glass look like placeholder boxes; the edge of the terrace-glow ellipse is visible; and the moon sits against the header's bottom rule. The booking lamp's cone ends in a hard horizontal edge behind 'are on.' and 'of you?'. Partly: I don't agree that the whole illustration is a template. At a glance the frontage is accurate and attractive.

**Fix.** Vary the lit windows and keep the neighbours' doors dark. Delete the translucent boxes. Fade the terrace glow to zero inside its shape. Move the moon down. Fade the lamp cone before the edge of its viewBox and move it clear of the headline.

### [MINOR · small] Menu gaps: 19 dishes with no English description, a four-line drinks list, Christmas as a single line, nothing for gluten-free or vegan diners

*Lens:* content (B-C09, B-C20, B-C10, B-C17) · *Verifier:* partly

**Evidence.** Parsed menu.html: 53 dishes, 19 food items without a description (Ravioli aurora … Bistecca alla griglia). Vitello never says veal and Bistecca never says steak. Drinks has 4 lines, while the menu's og:description says 'The full menu with prices'. Christmas gets only 'Available in season. Details TO CONFIRM', and the home page doesn't mention it, on 27 October. B-C10's severity is overstated: this is a missed opportunity, not an error.

**Fix.** Give every dish a plain line of 4–10 words. Change 'full menu' to 'menu'. Add white, rosé, house wine by the glass and coffee as one 'to confirm' group. Add Christmas parties to Private parties. Add a gluten-free or vegan 'call ahead' line.

### [MINOR · small] Copy slips: cryptic headlines, researcher notes in diner copy, a line starting with a full stop, repetition, mislabelled links

*Lens:* content/design/function (B-C13, B-C14, B-C15, B-C16, B-C24, B-C25, m1, m2, m7, p2, B-F18) · *Verifier:* confirmed

**Evidence.** Cryptic or ungrammatical headlines: 'lunch light, a walk down Kew Road.', 'the lamps are on. how many of you?' and 'Fifteen on the full menu, with pizza, meat and fish.'. Researcher notes in diner copy: 'Prices in £, from our current menu', 'Service charge TO CONFIRM', and 'Italian name TO CONFIRM' for the seafood pizza. At 390 a line starts with '. Allergies?' (verify/shots/sheet-index-390.png). 'Full list TO CONFIRM Enquiries:' is missing a full stop, and 'Pane all'aglio' uses &#x27;. 'a walk down Kew Road' appears 3 times, the allergen line twice on index, and 'Pasta e / risotto' breaks after 'e' at 1280. 'All hours & directions' goes to hours only, and 'Allergen information' repeats the same sentence. The change 'alla Mamma's' to 'alla Mamma' is not in the README's list.

**Fix.** Rewrite the headlines (e.g. 'lunch, or a pizza home.', 'the lamps are on. How many of you?'). Relabel the links ('Opening hours' plus a separate 'Directions' link to #find). Use curly apostrophes, keep each repeated line in one place, put the full stop inside the chip's nowrap group, and list every change from the current menu in the README.

### [MINOR · small] Small screens, landscape and the menu rail: clipped time picker, buttons hidden behind the bar, focus under the rail, stray V markers, rail clipping

*Lens:* function/design (B-F09, B-F10, B-F11, B-F19, m5, m8, m10, m11, M9) · *Verifier:* confirmed

**Evidence.** At 320 the time select is 89px wide and clips '7.30pm', and the bar's 'Book a table' wraps (verify/shots/m320-fields.png). At 844x390 the status (337–361px) and address (361–385px) sit under the bar (from 326px) and the hero buttons start at 393px. On the menu at 390, V markers drop onto their own line. The rail clips names at the left with no fade (rail-both.png). Shift+Tab puts the focused phone link at 99px, under the rail (bottom 113px). At 390x844 the hero crop clips the URL to 'www.ca'. The hero's inline links are 20px tall. The duplicate Book buttons are intentional and are not counted here.

**Fix.** Below 360px, stack date and time and use 'Book' in the bar. Add a landscape query that shrinks the header and hides the bar. Wrap the last word and the V marker in a nowrap span. Add a left fade to the rail. Set the menu's scroll-padding-top to include --rail and add nowrap to tel: links. Use the 390x664 framing on tall phones.

### [POLISH · small] Practical details left out: the terrace, station lines and buses, map links, the Kew Gardens walk time, the Just Eat link

*Lens:* content/function (B-C18, B-C26, B-F23, B-C19) · *Verifier:* partly

**Evidence.** 'terrace', 'courtyard', 'outdoor' and 'outside' each appear 0 times in the visible text. 'A five-minute walk from Richmond Station.' names no lines, and no buses are listed. The addresses on the menu page and in the footer are plain text. 'From Kew Gardens: A walk down Kew Road.' gives no time. Partly: Just Eat rests on the door decal, which research.md accepts; search found no Just Eat listing.

**Fix.** Add a terrace line, the station lines and Kew Road buses (checked on TfL), and measured walks from Lion Gate and Victoria Gate. Link both addresses to maps, and link each live delivery platform.

### [POLISH · small] Metadata and build hygiene: invalid og:type, wrong hasMenu, unused images in the build, designer comments, rail label inside the list

*Lens:* content/design/function (B-C22, p3, B-F21, B-F24, B-C27, B-F22, B-C24) · *Verifier:* partly

**Evidence.** index has og:type='restaurant'. Neither page has an og:image. The menu's JSON-LD hasMenu points to https://www.caffemamma.co.uk/menu. The live title is 'Caffè Mamma Sera'. The 7 img/ files ship but nothing references img/ (grep). The source has designer comments. The rail's label is an <li> inside the <ol>, and .vh text runs together ('Tagliatelle al pestoVegetarian'). The llms.txt part of B-C22 is refuted as a round-2 requirement.

**Fix.** Use og:type 'website'. Point hasMenu at menu.html and add it to the home schema. Drop unused images from the publish map, strip comments in the build, move the rail label out of the list, and add leading spaces to .vh text.

### [POLISH · small] The story prints the owner's nationality before anyone has asked how the family wants it told

*Lens:* content (B-C05) · *Verifier:* partly

**Evidence.** The story reads 'Still family-run: an Italian kitchen with a Portuguese family behind it.' research.md flags 'How the owners want this told [TO CONFIRM]', and 'family' goes further than 'the owner is Portuguese'. Partly: 'family-run' and the 'we opened in 1983' story both come from the restaurant's own About page, so the continuity point is overstated.

**Fix.** Print 'Family-run, with the line still up across the dining room.' and ask the Portuguese question in the covering email.

### [POLISH · small] Without JS, the booking heading asks 'how many of you?' with no field to answer it

*Lens:* content/function (B-C27, B-F20) · *Verifier:* confirmed

**Evidence.** With JS off, the form stays hidden and the h2 sits above only 'Book on OpenTable' and 'Call'.

**Fix.** Swap the heading in the no-JS state, or render a plain link-builder form.

### [POLISH · medium] The scroll scrub drops frames on very slow phones

*Lens:* function (B-F16) · *Verifier:* confirmed

**Evidence.** At 6x CPU throttling, 390x660 and DPR 3, during a touch drag: p50 16.7ms, p95 50ms, worst frame 167ms, 21 frames over 34ms.

**Fix.** Write only the custom properties that changed, or cross-fade pre-coloured layers instead of recolouring about 40 fills per frame.

## Refuted by the verifier

- **The primary CTA is visually weaker than the accents**: The Book button's fill is 1.82:1 against night, but its label is 8.54:1, and WCAG doesn't require the fill to contrast when the text identifies the control. In every screenshot the button reads clearly as a filled block. The real problem, bright chips competing with it, is covered in V04.
- **Italiana used below 32px**: 28px and 30px dish names at 390 break only the designer's own note. They read cleanly in the screenshots, and nobody viewing the page would see a defect.
- **Bottom bar doubles the hero CTA**: The sticky Book, Call and Find us bar is deliberate: research.md principle 1 asks for Book to be reachable from every scroll position. The 320px wrap is kept in V14.
- **Fonts are on the pipeline's overused watch-list**: The font list in qa.sh line 12 and tech-spec-v2 reserves Caffè Mamma's own fonts so later projects don't reuse them. It is not a list of overused fonts. The brand-fit point is kept in V07.
- **No Deliveroo listing exists**: Web search returns deliveroo.co.uk/menu/London/richmond/caffe-mamma (family-run Italian, Richmond). The rest of B-C08 is kept in V04.
- **The allergen line makes a new promise on the owner's behalf**: UK food law requires businesses to provide information on all 14 allergens, and research.md §3 recommends saying so. It is only a wording tweak, included in V05.
- **£23.95 was taken from the wine range**: I can't confirm that it was copied from the wine range. The price is still unsourced, and that is kept in V05.
- **B has no llms.txt**: llms.txt is a round-2 (richmond-sprint-v2) build requirement, not part of this project's brief or spec.
