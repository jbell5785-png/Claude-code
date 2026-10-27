# Audit: Matsuba C · Aburi

**Verdict:** Needs work · **Readiness:** 5/10

Not ready to send. The menu facts are right and the code is solid, but on a phone the owner would quickly hit a Book button that lands on a drawing, a hero price that reads '£  14.9', a full-screen 'Photograph to come' box, chips inside the menu's headline hours, and a course bar that cuts names in half. About a day of small fixes makes it sendable; the generic centred layout and the plain bronze-gradient sear are medium-to-large jobs. Note: REPORT.md was NOT written because the harness blocked report files, so the full report content is in this result.

| Lens | Raw findings | Impress owner | Craft | Usefulness | Accuracy |
|---|---|---|---|---|---|
| content | 27 | 5 | 6 | 6 | 7 |
| design | 27 | 4 | 5 | 6 | 7 |
| function | 27 | 5 | 6 | 6 | 7 |

## Strengths to keep

- Accurate HTML menu: the content auditor compared all 169 dishes against the copy deck by machine, and my spot checks matched (Tuna Tataki 14.9, Gyu Teriyaki 26.9, Black Cod 36.9, Eby Fry 10.9/18.9). Address, phone, hours and booking terms match the research.
- Built on the owner's own printed card: burgundy, gold, taupe and brown, tracked serif heads between gold rules, '• RICE SET •' bullets, green vg/v marks. The owner will recognise it, and the 1280 three-column menu reads like a real printed menu.
- It answers the pitch directly: aburi is named in text throughout, with a working Aburi filter and a menu.html?aburi deep link, which fixes the 'aburi invisible to Google' point.
- Booking terms written in plain words on the page (card to secure, £10 per person, 24 hours' notice, more than 12 by phone), which fixes the 'no no-show fee' AI error the email leads with.
- The 390 first screen (844 tall, no banner) is handsome and useful: dish, price, live status, address with Directions, and Book and Menu all fit.
- Solid engineering: no console errors, a today strip that uses London time correctly, a sear that never gets stuck, designed reduced-motion and no-JS versions, a light page and nothing animating at rest.
- Honest throughout: unconfirmed facts are flagged rather than invented, and the disclaimers are clear.

## Verified findings (ranked)

### [BLOCKER · small] Every 'Book' link goes to #book (the evening section); on phones and tablets the real Favourite Table button ends up under the dock

*Lens:* function/design/content (C-01, C-D01, C-F02) · *Verifier:* confirmed

**Evidence.** Measured where the gold button sits after tapping hero 'Book a table': top 791 vs dock 779 at 390x844; 792 vs dock 599 at 390x664; 1136 vs dock 959 at 768x1024; visible only at 1280x800 (694). On the menu page the dock Book goes to index.html#book and lands in the same place. verify/shots/book-index-390x844.png shows the candle drawing, 'Pull up a chair' and 'Book your table today!' with no button.

**Fix.** Point the hero, header, dock and menu-page Book links straight at https://booking.favouritetable.com/?SiteCode=2122 (new tab, keep the hidden screen-reader text). Or move id='book' onto .book and add scroll-margin-bottom of the dock height plus 2rem.

### [MAJOR · small] Hero price shows as '£  14.9' because of the flex gap, and prices use three styles across the two pages

*Lens:* design/content/function (C-08, C-D03, C-F14) · *Verifier:* confirmed

**Evidence.** .hero__price is display:flex with gap 16px, and the £ span and '14.9' are separate flex items; I measured a 17px gap. The homepage shows '£11.9' and '£12.9/22.9' (second price has no £); the menu hides the £ in screen-reader-only text ('11.9'); kids shows '£4.9'; the set card shows '£20.95'. To a UK reader '£14.9' looks like a typo, and it is the biggest number on the first screen.

**Fix.** Wrap £ and the number in one span so the gap only spaces the gold rules. Use one style on both pages, preferably their print style ('14.9' with one 'Prices in £' line), or £14.90 only if the owner signs it off.

### [MAJOR · small] A full-screen 'Photograph to come' placeholder sits in the signature Aburi section

*Lens:* design/content/function (C-09, C-D02, C-F08) · *Verifier:* partly

**Evidence.** At 390 the hatched 4:5 box is about one phone screen tall, between the nigiri and 'Also seared'; at 1280 it fills the right column with empty space below. The copy deck allows photo placeholders, so 'blocker' overstates it, but at this size, in the section the concept is built on, an owner will read it as unfinished.

**Fix.** Remove the slot and let the list run full width; put shot list no. 1 in the email. Better (medium effort): draw the Tuna Tataki plate in the same SVG style so the torch has a dish to sear.

### [MAJOR · small] 'To confirm' chips are repeated many times, sit in the most prominent type, and one sentence contains nothing but a chip

*Lens:* content/design/function (C-06, C-D11, C-F15, C-F18) · *Verifier:* partly

**Evidence.** Visible chips: 6 on the homepage (7 on Mondays or without JS) and 5 on the menu. The same two facts are flagged in the hero strip, Visit, the footer and the menu title. The menu's first screen has two dashed chips inside the large gold hours line (verify/shots/menu-390-first.png). Footer lines start with a chip. 'Nearest station, parking and step-free access: TO CONFIRM' is empty. The brief requires these markers, so the problem is repetition and placement, not the chips themselves. Research leans towards Monday open (their Instagram on 29 Aug 2026 and their reservations page) but still says confirm with the owner.

**Fix.** Use one quiet marker per region: a small † after 'Monday' and '3pm' with a single footnote. Show hours as published. Take chips out of the menu title and footer. Delete the station/parking/step-free sentence: nothing in the copy deck supports it, so stating the station would break the content rules.

### [MAJOR · small] Homepage overflows sideways from 320 to 363px; Visit hours, address and phone are clipped at 320

*Lens:* function (C-F01) · *Verifier:* partly

**Evidence.** In mobile emulation the layout viewport grows to 363px at 320 and 340, and 364 at 360 (the visible area stays at device width); desktop mode scrolls sideways. At 320 the text is clipped: '5pm–10', 'TO CON', 'TW9 1I', '020 8605 351' (verify/shots/visit-320-mobile.png). At 360 it is only 4px: the right gold frame line disappears and chips touch the edge. Clean at 375 and above. Cause: .find .hours grid '8.4rem auto' plus the no-wrap span holding the chip. 'Blocker' overstates it because at 360 the damage is cosmetic.

**Fix.** Use grid-template-columns: auto minmax(0,1fr), or stack day above hours below about 24em. Let the chip wrap. Add 360 to the QA widths.

### [MAJOR · small] On phones, the menu course bar's auto-centring cuts the current course name in half

*Lens:* function (C-F05) · *Verifier:* partly

**Evidence.** At 390, after scrolling to Sushi & Sashimi, the current label sits at x 38–199 while the visible part of the bar is 151–383, so only 'HIMI' shows (verify/shots/rail-sushi-390.png). Full-page slices show 'S ·', 'E ·' and 'TING ·' all down the menu. Cause in aburi.js: li.offsetLeft is measured from .courses__in, which includes the ~140px Aburi button. Not reproduced: at 768 the Sushi label was fully visible, and with the filter on the labels were not clipped.

**Fix.** Centre using li.offsetLeft - nav.offsetLeft (or bounding-rect maths plus nav.scrollLeft), and skip the scroll when all labels already fit.

### [MAJOR · medium] The signature sear ends as a bronze gradient with a grey outline, and the teardrop flame crosses the kicker and briefly doubles up

*Lens:* design/function/content (C-D04, C-D05, C-F09, C-F11, C-26) · *Verifier:* partly

**Evidence.** At 2x, every seared name has a thin grey keyline and a flat vertical bronze gradient; no char texture is visible (verify/shots/hero-seared-1280.png, nigiri-seared-1280.png). In effect it is a burgundy-to-bronze colour wipe, and the finished state is plainer than the raw one. Flame box y 108–231 at 1280 overlaps the kicker (y 149–173), covering 'TASTE OU|R', with the nozzle at the skip link; at 390 it covers 'SIGNATURE APPETIZER' (sheet-sear-1280.png, sheet-sear-390.png). At 390, t≈2.0s, two flames are visible at once (opacity 0.24 and 0.68). Text stays readable at every frame and nothing gets stuck.

**Fix.** Remove the grey rim (or make it ~0.006em burgundy at low opacity). Keep some burgundy and caramelise only the upper part of each letter with a subtle speckled char. Draw a real torch nozzle and barrel, angled, with the flame leaning the way it travels. Add space above the h1 so the flame never reaches the kicker. Fade one flame out before the next appears.

### [MAJOR · large] The layout is a conventional stack of centred sections; Matsuba's identity comes through copy and colour, not composition

*Lens:* design (C-D06, C-D07, C-D12) · *Verifier:* partly

**Evidence.** At 1280: centred text hero, 2x2 info block, dish grid with an image slot, two-column list, dark band with drawing left and text right, a lone drawing, centred footer (verify/shots/sh-index-d1280-a.png, -b.png). Almost all copy is centred, including the 5-line booking paragraph. The candle, pebble rest and orchids are common Japanese-restaurant props; a rival with an aburi section could reuse most of the page (NOTES admits the sear is not unique). This misses tech-spec 'nothing should look like a template section stack', which is the user's generic-layout concern. 'Squarespace template with a gold frame' overstates it: the print-card system is really theirs, and the 390 first screen is handsome.

**Fix.** Treat the printed card as an object (the Lunch & Early Evening card on the marble table). Use the takeaway cover's reversed brown label bars as the section system. Let dish names and drawings break the centre line, and left-align anything longer than two lines. Consider the Matsuba-only Lion King nigiri as the hero sear.

### [MAJOR · small] Two menu lines speak to the owner, not diners: the 14-allergen line and 'Set menu: Still running? to confirm'

*Lens:* content/design (C-02, C-D20, C-03) · *Verifier:* confirmed

**Evidence.** Menu first screen: 'Allergies: this menu does not list the 14 major allergens dish by dish.' This is an auditor's remark, published on the owner's own site. The set section reads 'SET MENU / Still running? TO CONFIRM', so a diner can't tell if it exists. The course bar says 'Early Evening' but the heading says 'Set menu' (verify/shots/sh-menu-m390-c.png).

**Fix.** Write 'Allergies or dietary needs? Please tell a member of staff, or call 020 8605 3513 before you come.' and move the 14-allergen point to the pitch notes. Title the section 'Lunch & Early Evening set' in both the heading and the nav, with one † on the days and no question.

### [MAJOR · small] The concept contradicts its own pitch: llms.txt leaves out the £10 no-show terms and aburi, and the menu links the 2024 PDFs the one-pager says will be retired

*Lens:* content (C-05, C-04, C-16) · *Verifier:* confirmed

**Evidence.** llms.txt mentions only the 12-guest limit: no card guarantee and no £10 per person charge, although that is the email's subject line. It never mentions aburi, and neither does the Restaurant JSON-LD description. menu.html links 'Vegan menu (PDF, 2024)' and 'Gluten-free menu (PDF, 2024)', whose prices differ from the live menu (copy deck TO CONFIRM item 3), while the one-pager promises 'Old PDFs retired or redirected at launch'. No gluten-free guidance appears anywhere else. The visible Visit › Booking text does carry the full terms, so this is a consistency gap rather than wrong content.

**Fix.** Add the booking terms word for word to llms.txt, plus a 'Signature dishes' block (Tuna Tataki 14.9, the eight aburi nigiri with prices, Salmon Aburi Carpaccio, Lion King nigiri). Add one aburi sentence to the JSON-LD description, using words already on the page. Replace the 2024 links with 'Vegan: look for vg · Gluten-free: please ask us on 020 8605 3513'.

### [MINOR · medium] Menu page on phones: no dishes on the first screen, course heads wrap with stub rules, and ?aburi gives no visible sign the filter is on

*Lens:* design/function (C-D13, C-F07, C-F26, C-D17) · *Verifier:* partly

**Evidence.** At 390x844 the course bar starts at 599px and the first dish at 762px, under the dock. Heads wrap: 'MAIN A / LA CARTE', 'TASTING / MENU', and 'SPECIAL / ROLLS' on the homepage. The page is 22,201px long, but that mostly reflects 169 dishes, and centred prices follow their print card, so those parts are not defects.

**Fix.** Cut the preamble to one line ('v · vg · allergies: ask us · 12.5% service') with a link to the full notes. Below 30em reduce .head tracking to ~0.18em and drop a size. On ?aburi, scroll to the menu or show a 'Showing 13 seared dishes · Show all' bar.

### [MINOR · small] Today strip hedges on Sundays and Mondays, and says 'Open now' on bank holidays and after the set-menu lunch ends

*Lens:* content/function (C-07, C-F04) · *Verifier:* confirmed

**Evidence.** Faked clock: Sun 12:00 shows 'Closed today · Opens Monday TO CONFIRM or Tuesday at 12pm'; Mon 13:00 shows 'Open now · Today (Monday TO CONFIRM) 12pm–3pm TO CONFIRM, 5pm–10pm'; Christmas Day 13:00 and Tue 14:50 show 'Open now'. Otherwise the logic is correct (summer time, Fri 22:45 'Opens tomorrow').

**Fix.** Never put a chip inside the status sentence. On Mondays show 'Monday: please call to check' with the phone link. Add a closures list (24–26 Dec, 1 Jan) that shows 'Holiday hours: please call'.

### [MINOR · small] On short phone screens the preview banner pushes the hero's Book and Menu buttons under the dock; landscape shows only the dish name

*Lens:* function (C-F03, C-F06, layout part of C-D24) · *Verifier:* partly

**Evidence.** Live-preview copy at 390x664: the banner is 71px tall and the hero buttons (582–630) sit behind the dock (from 599) (verify/shots/live-index-390x664.png). At 844x390 the first screen is just 'Tuna Tataki' with the dock over the description. The dock still offers Book and Menu, and the banner is intentional, so this is minor.

**Fix.** Shorten the banner to one line on phones ('Design concept · not Matsuba's official site'). Add @media (max-height:30em) to shrink the hero dish and slim the dock.

### [MINOR · small] Lines start with a comma or a chip, time ranges and the phone number split across lines, and five time formats are used

*Lens:* content/design/function (C-14, C-F17, C-D16) · *Verifier:* confirmed

**Evidence.** Without JS the hero strip's second line starts ', 5–10pm' (verify/shots/nojs-today.png). Footer lines start with a chip. The set card wraps '12 - 2.30pm & 5 / - 6.30pm'. At 1280 the booking text breaks 'Call 020 / 8605 3513'. Formats used: '12–3pm', '12pm–3pm', '12pm – 3pm', '12pm – 2:45pm', '12 - 2.30pm'.

**Fix.** Use one format (12pm–3pm) outside the verbatim card. Wrap time ranges and tel links in no-wrap spans, and keep each chip on the same line as its trailing punctuation.

### [MINOR · small] A 'Vegetarian & vegan' pair interrupts the Aburi section, and the dietary key is left-aligned with a one-word last line

*Lens:* content/design/function (C-13, C-D15, C-F22) · *Verifier:* confirmed

**Evidence.** Under the Aburi Nigiri H2, the eight nigiri are followed by an H3 'Vegetarian & vegan' (Nasu Dengaku, Edamame, neither seared), then 'Also seared'. .aburi__key is left-aligned under centred content and ends with 'staff' alone on the last line.

**Fix.** Move the pair into its own short strip after Special Rolls. Centre the key with text-wrap: balance.

### [MINOR · small] Typos are repeated in new copy (title 'torched-seared', tasting blurb 'Yuzu Te'); the pre-order line gives no way to pre-order

*Lens:* content/design (new-copy part of C-10, C-D25, C-17) · *Verifier:* partly

**Evidence.** <title> reads 'Tuna Tataki, torched-seared'. The new tasting blurb reads 'from Dobin Mushi to Yuzu Te & Macaron … on the way'. 'A pre-order is required' has no channel. The verbatim menu typos are required by the brief (refuted separately).

**Fix.** In the title write 'Torch-seared'. Rewrite the blurb as '14 dishes, from a clear fish and prawn soup to yuzu tea and macarons, including the Salmon Aburi Carpaccio and Lion King nigiri.' Add 'Call 020 8605 3513 to pre-order' (to confirm). Offer the typo list in the email as a quick win.

### [MINOR · small] The email address never appears, and the menu page has no address, hours or Instagram

*Lens:* content/design/function (C-15, C-F16, C-D23) · *Verifier:* confirmed

**Evidence.** Neither page's visible text contains info@matsuba.co.uk and there is no mailto link, although the email is in the JSON-LD and llms.txt. The menu page text contains no 'Red Lion' and no Instagram link.

**Fix.** Reuse the homepage footer on the menu page (address, one-line hours, Instagram). Add a mailto link in Visit › Find us and in both footers.

### [MINOR · small] The menu-footer 'to confirm' chip renders as a stretched, empty-looking 93x44 dashed box

*Lens:* content/design/function (C-20, C-D14, C-F13) · *Verifier:* confirmed

**Evidence.** Measured 93x44px, with the text pinned to the top edge beside the PDF links (verify/shots/sh-menu-m390-c.png). It is a flex item stretched to the links' 44px min-height.

**Fix.** Remove it together with the 2024 links (V-10), or set align-self:center on it.

### [MINOR · small] The hero shows scaffolding ('SKIP TO VISIT INFO', 'SEAR IT AGAIN'), and the phone header shows only 'ORDER'

*Lens:* content/design/function (C-19, C-D19, C-F20, C-D18, C-F19) · *Verifier:* confirmed

**Evidence.** The first line under the logo is an underlined 'SKIP TO VISIT INFO ⌄'. 'SEAR IT AGAIN' sits under the buttons like a third action. Below 60em the header shows 'ORDER — MATSUBA —' with nothing on the right. The 390 first screen has five calls to action.

**Fix.** Make the skip link visible only on keyboard focus, or recast it as 'Hours & directions ↓'. Replace the replay button with a 16px torch icon by the dish name (aria-label 'Replay the sear'). Balance the header with a call icon or a compact Book button.

### [MINOR · medium] The illustrations mix styles, the napkin reads as a card or phone, and the drawings sit as hard boxes or stranded figures

*Lens:* design/function (C-D08, C-D09, C-F21) · *Verifier:* partly

**Evidence.** Evening drawing: line-art glass, rendered metallic copper, flat napkin. The 'napkin on a small white dish' reads like a card terminal. At 1280 it is a hard rectangle with empty dark space below it beside the tasting text. The window drawing stands alone before the footer with only a caption (verify/shots/sh-index-d1280-b.png). Competent, but not at commissioned-illustration level.

**Fix.** Redraw in one consistent line-and-flat-fill style and draw the napkin as folded cloth. Fade the evening scene into the band with a mask. Move the window drawing into Visit › Find us and link it to Maps.

### [MINOR · medium] Marcellus has only one weight, so bold is faked with a text stroke; Marcellus and Albert Sans are common hospitality-template fonts

*Lens:* design (C-D10) · *Verifier:* partly

**Evidence.** Dish-name bold is -webkit-text-stroke 0.024em, which thickens the nigiri names and partly fills their counters (verify/shots/nigiri-seared-1280.png). The brief itself chose these fonts and said to set the wordmark in the concept's own face rather than redraw the logo, so 'the wordmark isn't their logo' is refuted.

**Fix.** Drop the faux bold, or use a serif with real weights for dish names. Ask the owner for the vector logo.

### [MINOR · small] On desktop, hovering resets seared names to raw burgundy and re-runs the sear

*Lens:* function (C-F10) · *Verifier:* confirmed

**Evidence.** aburi.js: pointer-enter calls resear(), which calls reset() and removes .is-seared. Moving the mouse across the large h1 on the way to Book makes 'Tuna Tataki' go raw and re-sear for 1–2.5s.

**Fix.** On hover run only the flame over the already-seared state, or allow one replay per element per page view.

### [POLISH · small] 'ABURI | 13' counts Salmon Aburi Carpaccio twice; screen readers hear 'Showing the full menu, 169 dishes.' on load

*Lens:* content/function (C-12, C-F23) · *Verifier:* confirmed

**Evidence.** DOM: 13 entries marked seared, 12 distinct (Salmon Aburi Carpaccio appears in Appetizers and Tasting). The status text after load reads 'Showing the full menu, 169 dishes.'

**Fix.** Count distinct dish names. Don't write the status until the first press. Consider a visible label such as 'Aburi · flame-seared'.

### [POLISH · small] Page titles and structured data: the title leads with the dish and a typo, the live tab shows the codename 'Matsuba · Aburi', and JSON-LD names carry 'vg'

*Lens:* content/function (C-21, C-22, title part of C-F27) · *Verifier:* confirmed

**Evidence.** Source title: 'Matsuba · Tuna Tataki, torched-seared · 10 Red Lion Street, Richmond' (no 'Japanese restaurant'). Live title: 'Matsuba · Aburi'. Menu JSON-LD names include 'Edamame (Steamed) vg' and 'Rice vg'.

**Fix.** Use the title 'Matsuba · Japanese restaurant · 10 Red Lion Street, Richmond' and publish with the same title. Strip v/vg from item names (keep suitableForDiet).

### [POLISH · small] Small accessibility and legibility issues: sub-12px labels, keyboard focus hidden under the course bar, an empty slot without JS, and a hover tint that sticks after tapping

*Lens:* design/function (C-D21, C-F12, C-F24, C-D26) · *Verifier:* confirmed

**Evidence.** Measured: hero chip 9.6px, skip link and Directions 11.2px, dock 11.84px. Shift+Tab focus on 'Back to top' lands at top 78 under the course bar (bottom 112). Without JS, .filter{visibility:hidden} reserves an empty slot. .filter:hover is not limited to hover-capable devices.

**Fix.** Use 12px minimum labels. Add the course-bar height to scroll-padding-top on the menu page. Use display:none for the filter without JS. Wrap hover styles in @media (hover:hover).

### [POLISH · small] Copy and markup hygiene: mixed apostrophes, repeated phrases, researcher comments in the live source, small alt-text inaccuracies

*Lens:* content (C-24, C-25) · *Verifier:* confirmed

**Evidence.** Straight apostrophes ('restaurant's', 'Japan's') next to curly ones; 'Family-run' appears 3 times on the homepage. The source and live page include comments such as '[TO CONFIRM] Monday: … OpenTable, Harden's, Square Meal and Tripadvisor list Monday closed'. The alt text says 'white marble table' where research says marble-look, and the SVG letters 'MATSUBA' on the menu case, which no source records.

**Fix.** Use curly apostrophes, strip comments from the pitch build, say 'marble-look', and remove the invented lettering.

### [POLISH · small] Special Rolls: unexplained two-price entries under the 'large 8 piece rolls' strapline

*Lens:* content (C-11) · *Verifier:* partly

**Evidence.** 'Matsuba Roll £12.9/22.9' sits under 'large 8 piece rolls exclusively created by MATSUBA'. What the pairs mean is open TO CONFIRM item 5; the takeaway PDF says 'large 4 or 8 piece rolls'. Severity lowered from major.

**Fix.** Use the takeaway wording ('large 4 or 8 piece rolls exclusively created by Matsuba') on the homepage and ask the owner which price is which.

## Refuted by the verifier

- **Collection deal tied to Toast without a source**: The brief and the one-pager both pair Toast ordering with the 20% collection deal, and the function auditor's Chromium visit found Toast's own Matsuba page advertising '20% Off All Takeaway'. The wording is clumsy, but the claim is supported.
- **Anonymous 'independent studio' credit**: The honesty footer and banner are intentional, and they do their job. Naming Joseph is optional, not a defect.
- **Preview banner clashes with the design**: The banner is intentional, and looking different is what marks it as not part of the site. Its one real effect, pushing the hero buttons down, is kept as V-13.
- **Preview index lacks doctype/charset (mojibake); dead CSS**: A read of the live artifact shows it wrapped in a utf8 skeleton with a viewport; the mojibake only appears when the raw file is served without a charset. Dead CSS is invisible to the owner.
- **Sticky chrome leaves only 79% of the screen for the menu**: 79% free is normal for a mobile page with a bottom bar and does not hurt reading.
- **Scroll reveals leave blank gaps in full-page captures and print**: With real scrolling everything revealed in all my full-page slices. Print is not a pitch scenario.
- **External links note; hasMenu returns 404**: Informational: every link points to the right venue, and hasMenu is a deployment assumption documented in NOTES. The title point is merged into V-24.
- **FSA 5 rating and kids menu not used on the homepage**: NOTES lists the hygiene rating under 'Deliberately left out'. This is an opportunity, not a defect.
- **The owner's typos are reproduced in the menu**: The brief requires the menu verbatim, with spelling fixes only as NOTES proposals. The new-copy part is kept as V-16.
- **The wordmark is not their logo**: The brief says to set the wordmark in the concept's own geometric face and not to redraw the logo file. The faux-bold part is kept as V-21.
