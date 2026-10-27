# Audit: Tide Tables A · Under the keystone (lead)

**Verdict:** Needs work · **Readiness:** 5/10

Not ready to send. The concept, hero arch and opening-hours logic are good, but two blockers stand: the preview link the owner would open has a broken first screen on desktop and phone, and the signature walk says their far door opens onto the garden and the Thames, which their own photo shows is the wrong door. Behind those are an almost unreadable Call button, a Visit block that reads like research notes, a clip-art keystone face shown large, a crowded phone walk and a thin, template-like lower half.

| Lens | Raw findings | Impress owner | Craft | Usefulness | Accuracy |
|---|---|---|---|---|---|
| content | 25 | 5 | 6 | 6 | 5 |
| design | 30 | 5 | 5 | 7 | 7 |
| function | 26 | 5.5 | 6.5 | 6 | 6 |

## Strengths to keep

- The hero arch is an original, specific and well-made drawing: sooty stretcher-bond brick, two voussoir rings, the glazed screen and doors, the hanging CAFÉ sign, festoons along the curve, and the vault receding with ferns, red pendants and the counter. It should lead the pitch.
- The useful-first work is solid. The Today strip picks the day in London time, including Christmas and Boxing Day, and is plain HTML at first paint. The full hours table, tel: and Maps links and the bottom action bar all work; the pin is only 0.8 of a screen on phones, with no scroll-jacking; and reduced motion and no-JS both have designed fallbacks.
- The copy is unusually honest: almost entirely the café's own words, no invented prices or dishes, the face is never named, the bridge fact is stated precisely, and the JSON-LD is minimal and truthful.
- The menu chalkboards are charming: each has a red enamel lamp that lights over the board you're reading, and the chalk grain stays legible.
- Details drawn from the room: the header festoon bulbs light up as you read, and a bulb sits over each bottom-bar action.
- Technically clean: no console errors, no failed requests and no horizontal overflow from 320 to 1920, and the fonts load.

## Verified findings (ranked)

### [BLOCKER · small] Preview banner covers the fixed header and hides the Today strip's buttons under the bottom bar

*Lens:* function+content+design (A-C02, A-DES-01, A-F01, A-F02) · *Verifier:* confirmed

**Evidence.** Measured on the wrapped preview build. Banner height: 36px at 1280, 53px at 768, 71px at 390, 88px at 320. elementFromPoint on the home mark returns the banner at every width on both pages. At 1280 the header buttons (y 11–53) lose their top 25px. The strip button row is under the bar, and elementFromPoint returns a.act: at 390x844 the row is at 780–826 with the bar at 780; at 390x660 it is at 596–642 with the bar at 596; at 768 it is at 942–988 with the bar at 960. The menu page at 390 has no wordmark or home link on the first screen, and two stacked yellow notices. Shots: verify/shots/pv-index-1280x800-first.png, pv-index-390x844-first.png, pv-menu-390x844-first.png

**Fix.** In the publish step, bring the banner into the layout. Set --banner-h and offset .masthead top, the sticky stage top/height and scroll-padding-top by it, or render the banner as a slim strip above the bottom bar on phones and in the header row on desktop. Then re-measure at 320, 390x660, 390x844 and 768 on the build itself.

### [BLOCKER · medium] The walk ends at the wrong door: it claims the far door opens onto the garden and the Thames, and draws that view crudely

*Lens:* content+function+design (A-C01, A-F08, A-DES-03, A-F25 stub) · *Verifier:* confirmed

**Evidence.** The claim appears 4 times: caption 4, og:description, the #scene aria-label and the kicker 'Out the far door'. The café's own gallery photo thumbs_img_3476-2 looks out through the glazed CAFE arch to the garden and steps, and thumbs_img_3037-1 shows that same arch from outside, with the face. So the garden is outside the face arch and the far door leads inland. NOTES admits the claim is unverified. The vignette is a flat river with dash ripples, speckle gravel with a blurred ellipse, and one green shell chair, plus a stray dark bar from the arch crown to the door head (seq/idx390-01.png, seq/idx1280-02.png).

**Fix.** End on 'a smaller brick arch and a glazed door with daylight' with neutral daylight beyond, or turn the camera back to the glazed arch framing the garden. Rewrite caption 4, og:description and the aria-label, rename the kicker (for example 'Outside, by the towpath'), remove the stray bar, and add the far door to the owner questions.

### [MAJOR · small] The main 'Call 020 8948 8285' button in the Visit block is cream text on bulb yellow, at 1.31:1

*Lens:* function (A-F03) · *Verifier:* confirmed

**Evidence.** Computed: color rgb(233,231,224) on rgb(243,196,107) = 1.31:1. The cause is '.find a {color: var(--wash)}' (specificity 0,1,1), which overrides '.btn-bulb {color: var(--chalk)}' (0,1,0). The text is visibly washed out in sheet-idx390-b.png and sheet-idx1280-b.png.

**Fix.** Add '.find .btn-bulb { color: var(--chalk); }' and hand-check every text-on-texture contrast pair.

### [MAJOR · small] The Visit block and home board read like research notes: 'not published' twice, four chips in 350px, a bare 'Dogs:', and 'Tide Tables doesn't publish a menu… Ours is…'

*Lens:* content+design+function (A-C03, A-C04, A-C05, A-DES-12, A-DES-13, A-F16) · *Verifier:* partly

**Evidence.** Visit block text: 'Parking: not published. TO CONFIRM / Step-free access: not published. TO CONFIRM / Booking… TO CONFIRM / Dogs: TO CONFIRM'. Chips render at 9.7–11.6px; there are 8 on index and 1 on menu. VisitRichmond does report 'Disabled access' (S16). The board teaser switches from third person to 'Ours', and the same 'doesn't publish' sentence is the menu og:description. Correction: the chips are intentional and the standard requires parking and step-free notes, so the defect is the wording and clustering, not the markers.

**Fix.** Delete every 'not published'. Merge the open items into one café-voice line with a single chip, for example 'Parking, step-free access and dogs: please call us to check'. Replace the teaser with 'A sample of our boards. Call for today's specials.' Keep the brief's banner sentence on the menu page only, and give the menu page a positive og:description.

### [MAJOR · large] The keystone face, used as the brand mark, reads as cartoon clip-art rather than their weathered face, and the 'Over the door' section shows it full size

*Lens:* design+content (A-DES-02, A-C09 Over the door, A-DES-18) · *Verifier:* confirmed

**Evidence.** Side by side (design/shots/face-compare.png): the real face is asymmetric and brooding, with windswept hair and a heavy beard. The drawing is a symmetrical oval with identical spiral curls, a beard of teardrop spirals and blush-like cheeks. It passes at keystone size in the hero, but at full size it looks like clip-art (sheet-idx390-c.png, sheet-idx1280-c.png), on a lighter brick rectangle that doesn't match the section.

**Fix.** Quick mitigation: drop the large portrait, or merge it into Visit as a wayfinding cue, and keep the face small. Full fix: redraw it from the photo's structure without tracing it, with asymmetric locks, a heavy brow, the beard in carved masses, 3–4 tonal planes and weathering, plus a simplified version for the mark and favicon.

### [MAJOR · medium] On phones the signature is crowded by UI: six buttons for three actions on the first screen, and the card and caption cover much of the walk

*Lens:* design+function+content (A-C11, A-DES-06, A-DES-07, A-F06) · *Verifier:* confirmed

**Evidence.** At 390x844 the strip's Call/Find us/Menu sample (y 709–755) sits directly above the bar's Find us/Call/Menu sample (780–844). During the pinned walk, the caption box plus the strip and bar leave about half the stage for the vault. At 1280 the card and caption cover the tables and counter that caption 3 names (crop-walk-chair.png).

**Fix.** Below 900px, drop the strip's button row and keep the status, address link and number as text. Collapse the strip to one line once the walk starts. Set the captions on the vault with a scrim, and re-time the keyframes so each caption's subject sits in the uncovered area.

### [MAJOR · large] Below the walk the home page is a stock section stack, and the garden, their headline asset, has no drawing

*Lens:* design (A-DES-10, A-DES-11, A-DES-08) · *Verifier:* partly

**Evidence.** Below the walk the page runs: 3-column info grid → text-only garden band with blurred smudge 'gravel' → 2-column sections → face coda. At 1280 there are large empty zones, such as the left column under the chairs (sheet-idx1280-b.png). The bridge, plane trees and river appear in only one sentence plus the far-door glimpse. Correction: 'swap test only half passes' is overstated for the hero and walk, which are specific to the place.

**Fix.** Draw a garden set piece: a plane trunk with flaking bark, gravel, mesh chairs and the bridge's stone arch. Balance the desktop columns, and cut or merge the face coda.

### [MAJOR · medium] The menu page is thin and padded, and misses parts of the menu standard

*Lens:* content+design+function (A-C07, A-C08, A-C15, A-DES-14, A-F22, A-F13) · *Verifier:* partly

**Evidence.** 12 items across 5 boards over 3,727px (4.4 screens at 390). Tea has one line. 'Organic Wines & Beers' lists only 'Wine and beer'. The Coffee board lists 'Organic milk' and then 'All our milk is organic, too.' Cider is missing although index promises it (S26). There is no allergen line (standard items 12 and 26), the H1 'On the board' never says Menu (F34), and there is no back-to-top link (D25). The first phone screen shows no complete menu item, under an alert-style yellow '!' notice, plus the preview banner. Correction: the suggested '£–' price column conflicts with the brief's no-prices rule.

**Fix.** Lay the boards out more compactly and merge Tea with Juices. Use 'Organic wines, beers and ciders' and keep organic milk in the note only. Add 'Allergies or intolerances? Please ask us before you order' (confirm the wording with the owner). Make the H1 'Menu (sample)' with the kicker 'On the board'. Restyle the mandated notice as a calmer chalk note with the exact wording, and add a back-to-top link.

### [MINOR · small] The hours phrase 'Sat–Sun from 7am (from 7:30am)' reads as a typo

*Lens:* content+design (A-C06, A-DES-22 hours) · *Verifier:* partly

**Evidence.** The phrase appears in the footer on both pages, the no-JS strip, the meta description, the JSON-LD and llms.txt. It is the copy deck's own approved display wording, not the designer's invention, but diners can't parse it. The hours table and the JS strip are clear.

**Fix.** Use 'Sat–Sun from 7am (serving from 7:30am)' everywhere, in the café's own word, and ask the owner what 'serving' covers.

### [MINOR · small] The walk captions read as a décor inventory and include an unsourced 'the whole café is one vault'

*Lens:* content+design (A-C09 captions, A-DES-12 captions) · *Verifier:* partly

**Evidence.** 3 of the 4 captions list objects, which breaks voice rule (d)4. The number of arches is UNKNOWN and the café also has a garden. 'Under the carved face and in.' is a fragment.

**Fix.** Use two captions at most, one of them in the café's words ('Warm and friendly atmosphere'), and drop 'the whole café'.

### [MINOR · small] 'From the bridge' gives directions to the bridge, and the bank and level are never stated

*Lens:* content+function (A-C10, A-F23) · *Verifier:* confirmed

**Evidence.** 'From the bridge: once you reach Richmond, head straight for Richmond Bridge…' Nothing says Richmond side or river level, although the Richmond bank is VERIFIED (dossier fact 3).

**Fix.** Relabel it 'Getting here' and add 'on the Richmond side, down at river level beneath the bridge'.

### [MINOR · small] Caption 4 slides under the header; the 94%-opaque header lets text ghost through; with no JS the header is transparent

*Lens:* content+function (A-C16, A-F15) · *Verifier:* confirmed

**Evidence.** Caption 4 (data-to 1.1) overlaps the wordmark at the end of the walk (seq/idx390-01.png). Headings and menu items ghost through the header (sheet-menu390.png). With no JS, text overprints 'Tide Tables' (sheet-modes.png).

**Fix.** Fade caption 4 out by p ≤ 1.0, make the header fully opaque, and add html:not(.js) .masthead { background: var(--chalk-black) }.

### [MINOR · small] 'Find us' lands with the Visit headings clipped about 10px under the header

*Lens:* function+design (A-F04, A-DES-28) · *Verifier:* partly

**Evidence.** After the click, the h3 top is at y 48 against a header bottom of 58, at 390 and 1280 (findus-1280-top.png). The cause is the .reveal translateY(18px) at the moment the scroll target is computed. The headings are clipped, not hidden, so the auditor's major was overstated.

**Fix.** Remove .find-grid > div from the reveal list (or use an opacity-only reveal) and add scroll-margin-top.

### [MINOR · small] Short viewports (landscape phone, 200% zoom) lose the Today strip entirely

*Lens:* function (A-F05) · *Verifier:* confirmed

**Evidence.** At 844x390 the strip is at 350–554 with the bar at 326, so the first screen is the wall and the top of the arch (landscape-844x390.png).

**Fix.** Add @media (max-height: 600px): drop min-height 540px, use a one-row strip and shorten the pin.

### [MINOR · small] Menu picker: chips clipped at 390 with no cue; desktop highlights the wrong board after a click

*Lens:* content+design+function (A-C18, A-DES-16, A-F11, A-F12) · *Verifier:* confirmed

**Evidence.** At 390 the nav scrollWidth is 575 against clientWidth 355: 'Juices & smoothi…' is cut and 'Organic Wines & Beers' is off-screen. At 1280, clicking Food lights Coffee and clicking Tea lights Juices (menuclick.js).

**Fix.** Shorten the labels, wrap them, or add an edge fade. Call scrollIntoView({inline:'nearest'}) on the active chip, and lock the clicked board until scrollend.

### [MINOR · small] Typesetting and consistency: split phone numbers, mixed formats, Cafe/Café, tiny chips

*Lens:* content+design+function (A-C13, A-C14, A-C17, A-DES-17, A-DES-23, A-DES-24, A-F20) · *Verifier:* confirmed

**Evidence.** 'Phone to arrange: 07922 / 474327' and 'Sat– / Sun' break at 390. Phone formats mix 020 and +44 (0)20; times mix '9:30 till dusk' and '7:30am'; 'Hollyhock Cafe' appears beside 'Café'; 'organic and Fairtrade' overstates the café's 'many… organic or Fairtrade'; chips are 9.7px.

**Fix.** Use nowrap on phone numbers, 'Sat–Sun' and 'Richmond Bridge'; one display format; 'Café' everywhere; a 12px floor for labels.

### [MINOR · small] The Today strip has no opening or closed-now state

*Lens:* content+function (A-C12, A-F10) · *Verifier:* partly

**Evidence.** The code has no time-of-day branch, so at 21:30 it still reads 'Open from 7:30am · … · until dusk'. It states the schedule, not 'open now', so the harm is low.

**Fix.** Show 'Opens today at 7:30am' before opening and 'Tomorrow · from 7:30am' after about 21:00 London time; recompute on visibilitychange.

### [MINOR · medium] Incomplete when a script fails; blank sections in print and full-page captures

*Lens:* function (A-F07, A-F14) · *Verifier:* confirmed

**Evidence.** With site.js blocked, all 12 menu items stay clipped and the boards are empty. With vault.js blocked, #scene has 0 children and the hero is an empty brown box (sheet-blocked.png). .reveal content stays at opacity 0 in print. Standard item 22.

**Fix.** Gate the hiding on readiness classes set by each script (vault-ready, boards-ready) and add @media print overrides.

### [MINOR · medium] Illustration craft below the hero is uneven

*Lens:* design (A-DES-04, A-DES-05, A-DES-21, A-DES-25, A-DES-26 counter) · *Verifier:* partly

**Evidence.** The vault limewash is clean white with floating brick 'tiles' (crop-walk-chair.png). The section whitewash reads as ruled paper. The chairs are icon-level and the green splat reads as a vase. The door D-handles form a wishbone. The fern bullets look like ticks, and the counter edge looks like a fence. These are real but not individually major.

**Fix.** Show brick through the limewash in clusters of courses, and use a lighter version of the same mottling for sections. Give the chairs joinery, draw two separate handles, use a clearer frond bullet, and draw the counter properly or cut it.

### [MINOR · medium] The chalk is Gloock plus a grain filter rather than the drawn lettering the brief asked for

*Lens:* design (A-DES-09) · *Verifier:* partly

**Evidence.** Gloock and Mulish are the brief's mandated pairing, and Gloock is a characterful choice, not a generic one. The brief asked for 'draw your own chalk lettering style'. Gloock also carries mid-level roles (dt, address, Today link).

**Fix.** Hand-letter the board titles as SVG paths, and keep Gloock for display roles.

### [MINOR · medium] Some dropped frames while scrubbing the walk under CPU throttle

*Lens:* function (A-F09) · *Verifier:* partly

**Evidence.** My run at 390, DPR 3, 4x CPU: median 16.7ms, p95 33.4ms, max 66.8ms, with 2 long tasks (55 and 73ms). Unthrottled p95 was 16.7ms. The auditor's 172ms and p95 83ms were not reproduced.

**Fix.** Test on a real mid-range Android and skip redraws when the change in progress is under 0.002.

### [MINOR · small] The bulb-yellow focus ring is about 1.3:1 on cream sections

*Lens:* function (A-F17) · *Verifier:* confirmed

**Evidence.** Computed: a 3px #F3C46B outline on #E9E7E0, below the 3:1 non-text minimum.

**Fix.** Use a two-tone ring: a chalk outline plus a bulb halo.

### [POLISH · small] Metadata, llms.txt and NOTES inaccuracies; the preview title is the concept codename; no og:image

*Lens:* content+design+function (A-C19, A-C22, A-C23, A-C25, A-DES-27, A-F18, A-F19, A-F21) · *Verifier:* partly

**Evidence.** The meta description is 225 characters; NOTES says 160 and also mentions hasMenu. llms.txt says 'Please phone the café' for booking (unverified) and carries sourcing commentary. The footer names only the .com site, although the hours come from .co.uk. The preview <title> is 'Tide Tables · Under the keystone'. There is no og:image, and the preview fragment lacks viewport-fit=cover. sameAs to .co.uk is optional; it conflicts with the one-site pitch.

**Fix.** Trim the meta description to about 155 characters, fix the llms.txt booking line, name both sites in the footer or neither, use the real title, add a PNG og:image, and correct NOTES before quoting it.

### [POLISH · small] Hidden template leftovers and unneeded weight

*Lens:* content+design+function (A-C21, A-DES-29, A-F26) · *Verifier:* confirmed

**Evidence.** The chip tooltip says 'To be confirmed with the restaurant'. HTML and SVG comments include 'client question 10' and 'Not to scale'. The chairs are announced 3 times. window.__tide is exposed (site.js:223). Dead CSS remains (.slot, .reported, .hours-big, .garden-warn). The italic Mulish axis loads for one caption, and the 40KB face symbol is inlined in both pages.

**Fix.** Change the tooltip to 'café', strip comments in the build, keep one accessible name for the chairs, remove the dead code and the italic axis, and use an external face sprite.

### [POLISH · small] Copy wrinkles

*Lens:* content+design (A-C24, A-DES-22 headings, A-DES-26 quote) · *Verifier:* confirmed

**Evidence.** 'great' appears 4 times in two lines. The h2 'Opening hours and how to find us' is followed by the h3 'Opening hours'. 'Parties under the arch' sits over Hollyhock copy. 'No two chairs alike' overstates 'mismatched'. The quote 'all items and prices are subject to change' appears on a page with no prices.

**Fix.** Light edit: change the h2 to 'Visit' and the parties heading to 'Parties', and drop 'and prices' from the quote.

### [POLISH · small] Composition details: plain wall above the arch, festoon across the mark, squeeze at 320

*Lens:* design+function (A-DES-20, A-DES-30, A-F24) · *Verifier:* partly

**Evidence.** The wall is large and plain above the arch on desktop, and the festoon wire crosses the face mark. At 320 the strip kicker wraps, and 'MENU SAMPLE' touches the screen edge.

**Fix.** Cap the wall with the bridge parapet line, start the festoon right of the mark, and use shorter labels below 360px.

## Refuted by the verifier

- **Useful verified facts missing (hygiene rating 5, payment, takeaway)**: None of these is in research/copy-deck.md, which the brief makes the only content designers may use, so leaving them out follows the rules. Suggest them in the pitch email instead.
- **Short of an Awwwards or FWA hospitality standard**: Not a separate defect: it restates the face, lower-half, illustration and lettering findings, which are ranked as V5, V7, V19 and V20.
- **The hero brick wall visibly tiles**: No repeat is visible at normal viewing in the 1280 and 1920 first screens. Autocorrelation may detect it, but it doesn't harm the pitch.
