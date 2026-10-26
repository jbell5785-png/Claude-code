# The Original Maids of Honour, Concept B: "A royal secret"

**In two lines:** One tart, one secret. The site presents a single object the way a fine jeweller presents a ring: the tart on its silver stand in the hero, and the recipe locked in an iron box that the visitor opens with a key. The page itself is the bakery's white box, tied off-centre with their own black-and-gold ribbon.

Port 8532. Pages: `index.html`, `menu.html`. Plain HTML, CSS and JS; no framework, no build step at runtime, no GSAP (CSS transitions and the Web Animations API do the work).

---

## The signature: "The iron box"

**Only-here detail:** the legend that Henry VIII had the recipe "kept secret in a locked iron box at Richmond Palace".
**Sources:** Our History page [S3] (LEGEND, in the business's own words); homepage "kept it under lock and key at Richmond Palace!" and "A Royal Secret...." [S1]; High Tea menu boxed text [S8]; Richmond Council local history note [S21]. Labelled as legend everywhere on the page.

**How it works** (`index.html#box`, `js/box.js`, `.casket` in `css/style.css`):
- A wrought-iron casket built in real CSS 3D: front plate with riveted straps, S-scrolls and back-to-back C-scroll "lyre" panels, an ogee lock plate with a keyhole, a hasp hanging from the lid, a lattice-strapped lid with a ring handle, bun feet, and an oxblood velvet lining with our own blackletter "Newens" stamped in the lid.
- The key is a real `<button>` (`aria-controls="box-contents"`, `aria-expanded`, a visible hint "Turn the key / Click, tap, or press Enter or Space"). Click, tap, Enter and Space all work, because it is a native button.
- The sequence: the key turns (rotates 90°), the lid lifts on its back hinge and warm light spills out, then the layers rise one by one:
  1. **Legend has it…** (tagged LEGEND; the S3 text, the second "imprisoned Maid" account, and the Council's note of R. May's *The Accomplisht Cook*, 1665)
  2. **The tart** (our illustration)
  3. **In the bakery's own words**: "Deliciously sweet and yet slightly savoury, light and crisp yet unctuously soft in the middle." [S14]
  4. **Allergens, as published**: "Contains milk, wheat, gluten and eggs." [S14], with the Craft Bakery trace statement [S8]
  5. **The price**: £3.50 in the tearoom [S8]; £2.25 in the shop [S14] (to confirm)
- **The final beat:** a sealed recipe (a folded paper with an oxblood wax seal bearing our blackletter N) stirs as if to come out, then sinks back. The lid comes down on it and the key turns back. Then the line settles word by word: *"The recipe stays in the box."* with the bakery's own "That's still a secret – one that's safe with us for a good long time to come…" [S3]. Everything else came out of the box; the recipe did not.
- Turning the key during the sequence skips to the end; turning it again puts everything back.
- **The filling is never stated**, anywhere on either page.
- **Without JS:** the box is drawn open with the sealed recipe visible inside, every layer is on the page as an ordered list, and the button stays hidden (it would do nothing).
- **Reduced motion:** the box rests open with every layer showing. The key still toggles open and closed, instantly.
- **Layout shift:** while locked, the layers are `display:none`. They take their space at the moment of the click (inside the input window), then fade in, so no shift is counted.

## Second interaction: "Finest when warmed" (the reheating timer)

**Only-here detail:** the bakery's own instruction, "'Maids of Honour are finest when warmed in a moderate oven' (150° Gas Mark 3) for 5 to 8 mins. Place onto a warmed baking tray or wire rack. Devour when cooling from the oven, deliciously warm" [S14].

`index.html#warm`, `js/oven.js`:
- The instruction is quoted as published, then broken into four short steps.
- An oven dial (our drawing): a steel bezel, an enamel face with Gas Marks 1–9, mark 3 picked out in oxblood with "150°", and a black knob set to 3. A gold ring around the bezel fills as the minutes pass.
- Choose 5, 6, 7 or 8 minutes (a native radio group). Start, Pause or Resume, and Reset. The time is computed from `Date.now()`, so it stays accurate in a background tab.
- The small tart beside the dial grows warmer (saturation, brightness, glow) as time passes.
- **Sound only after the visitor's own tap:** the AudioContext is created only when they tick "Chime when warm" (a quiet preview chime confirms it) or press Start with it ticked. When the time is up: a soft three-note bell, three times.
- **Live region (polite):** announces the start, each whole minute left, pauses, and "Your tart is warm. Devour when cooling from the oven, deliciously warm." The ticking digits are `aria-hidden` so nothing is spoken every second.
- **Without JS:** the controls stay disabled and a line says the instruction is all you need.

---

## Every only-here detail used, with its source and where it appears

| Detail | Source | Where, and how it is used as design |
|---|---|---|
| **The tart itself**: round puff pastry, flaky layered sides, a blistered golden-to-caramel top, served warm on a silver cake stand with a paper doily | identity §1.4; official tart photo `IMG_9604_SQ.jpg` [S1] (reference `tart.jpg`); "served warm from our ovens" [S1, S3] | The hero illustration (`img/tart-salver.svg`: beaded silver stand, lace doily, three tarts with laminated sides, caramel blistering and rising steam). The single tart (`img/tart.svg`) in the box and in the timer. |
| **The locked iron box legend** | [S1], [S3], [S8], [S21] | The signature (above). |
| **The packaging**: white box, black ribbon printed in gold blackletter with "Original Maids of Honour" alternating with "Newens", and a black oval label with a gold border | identity §1.14; box-of-8 product photos [S15] (references `box-a.jpg`, `box-b.jpg`) | **The layout logic.** A vertical ribbon runs the full page height at a fixed off-centre line; it is the gutter between the narrow "ticket" column (labels, times, prices) and the content column. Every section break is a horizontal ribbon crossing it, tied with a satin bow at the crossing, and it ties itself as it scrolls into view. The **oval label** names every section. The ribbon lettering is **our own drawn blackletter** (see Type), not their artwork. A tied white-box illustration with its own label sits in the postal section. |
| **Their reheating instruction** "150° Gas Mark 3, 5 to 8 mins" | [S14] | The second interaction (above). |
| **The 1907 postcard of the Hill Street "Original Shop"**, handwritten "September 25th 1907", "THE ORIGINAL SHOP FOR MAIDS OF HONOUR", "BILLETT" in the window, "LUNCHEON & TEA ROOMS" upstairs, caption "ESTABLISHED IN RICHMOND NEARLY 200 YEARS" | Our History page image `CCI02062011_00005_large.jpg` [S3]; Billett on Hill Street confirmed by [S21] | The "Before Kew" section: our own SVG drawing of that shopfront in the postcard's tinted ink-and-card palette, tilted like a card on a table, beside a "Who has kept the secret" line of keepers. |
| **The Patisserie List leads with "Our Famous Maids of Honour Tart £3.50"**, with "Maids of Honour Tart" set in blackletter on the printed menu | `Food_Menu_2024-5.jpg` [S8] | It leads `menu.html` and the booking section on the homepage, with "Maids of Honour Tart" set in our own blackletter, exactly as their menu does it. |
| **The burgundy-red gratuity line** on their printed menus | identity §2 (menus: "a burgundy-red gratuity line"); [S6]–[S10] | Every menu's service-charge line is set in oxblood italic. |
| **The blackletter "N" monogram** (in their QR code) | identity §1.19; High Tea menu [S8] | Our own drawn N is the favicon (an oval label in gold on black) and the wax seal on the secret recipe. |
| **The line of keepers**: Robert Newens apprenticed at Hill Street; Alfred Nashbar Newens on the Kew Road; John and Kathleen; Peter's rebuild "with new gas ovens" | [S3], [S21] (names the business itself publishes, in historical context) | "Who has kept the secret": a diamond-marked line of keepers next to the postcard. No disputed dates are used; "Est. 1850" appears only as "the bakery's own date", with a to-confirm marker. |
| **"A Royal Secret...."**, "Shop & Tea Room on 288 Kew Road", "Serving you since 1850" | homepage [S1] | The hero label, the visit kicker, and the footer sign-off (as their own claim, marked to confirm). |
| **Silver dish and the Maids of Honour** in the legend | [S3] | The hero shows the tarts on silver, which is the legend's own image ("eating the tarts from a silver dish"), as well as how they are served today. |

## The swap test

Replace "The Original Maids of Honour" with any other tearoom or bakery and the concept stops working:
- The signature is a **locked iron box** because of a legend only this tart has. Another bakery has no royal recipe locked at Richmond Palace, and no recipe it refuses to publish.
- The hero is **this tart**: round puff with a blistered top on a silver stand and doily. It is not a cupcake or a scone.
- The **page is their box**: black ribbon printed with "Original Maids of Honour · Newens" and their oval label. It is their packaging, not a generic ribbon.
- The tool is **their reheating instruction**, to the degree and gas mark, for tarts that arrive by post.
- The history is **their 1907 Hill Street postcard** and their own family of keepers.

Swap the name and you would have to remove the signature, the hero, the layout device, the tool and the history section. Nothing is left that a generic tearoom could keep, so the concept passes.

---

## Type
- **IM Fell English** (roman and italic) for display: a 17th-century English face, the century of R. May's *Accomplisht Cook* and close to the legend's world.
- **Crimson Pro** (400, 500, 600, italic) for text. It uses old-style figures in prose and lining figures for prices and the timer, like their printed menus.
- **The blackletter is not a font.** It is our own textura, drawn with a broad-nib simulation: each glyph is a set of pen strokes swept by a nib held at 42°. It is used only on the ribbon, the wordmark's "Newens", the menu's "Maids of Honour Tart", the lid stamp, the seal and the favicon (`img/lettering.svg`, `img/ribbon.svg`, `img/ribbon-v.svg`). This avoids reusing Concept A's Grenze Gotisch and never redraws their logo.
- **Wordmark:** our own "Newens" blackletter above "The Original Maids of Honour" set in IM Fell English. It is not their logo. Replace it with the real logo only if the client wants it.
- **Metric-matched fallback faces, per platform:** Georgia (macOS/Windows), Liberation Serif/Times/Tinos (Linux/ChromeOS), Noto Serif (Android) and DejaVu Serif. Each has `size-adjust` set from widths measured in Chromium, and ascent/descent overrides from the web fonts' own metrics. Text measures are set in `em`, not `ch`, so they don't jump when the fonts swap in. Measured CLS is 0.000 at 390, 768 and 1440 on both pages. The Georgia and Noto widths are estimated, because neither font is installed on the test machine; check them on a Mac and an Android device.

## Colour
Iron #26262A · Box white #FAF8F3 · Ribbon black #111 · Gold #C79A3E (on dark only; a lighter foil #E2C27C for text on iron) · Pastry gold #D9A55B (illustration only) · Oxblood #5E1A22 (accents, prices, the gratuity line, the legend tag). WCAG AA was checked by script on both pages.

## Implementation notes
- `css/style.css` holds everything, including the tokens, the tied-box grid (`.frame`, `.ribbon-v`, `.tie`), the casket, the oven and the menus.
- `js/site.js`: the header ground on scroll, ribbons that tie themselves in view, and the menu index scroll-spy. `js/box.js`: the iron box. `js/oven.js`: the timer.
- A first-paint script adds `.js`, plus `.motion` unless reduced motion is set. Content is only hidden when both are present.
- The illustrations were generated by small Node scripts (not shipped; they are in the studio scratchpad at `…/scratchpad/v2/build-maids-b/gen/`), and the static SVG output is committed. There is no build step to run the site.
- Booking hands off to ResDiary per service, in a new tab, as plain links: Breakfast 33175, Luncheon 33176, Set tea 33177, any table ThreeMonth 32717. Guest rooms go to direct-book.com. An honest line says nothing is booked until it is confirmed there.
- JSON-LD `Restaurant` holds confirmed facts only.

## Reference images: a discrepancy
The brief lists `Henry_postcard_large.jpg` as "the 1907 Hill Street postcard". That file is actually a painted portrait of Henry VIII. The 1907 postcard is `CCI02062011_00005_large.jpg`, which is what the "Before Kew" drawing is based on. The portrait was not drawn or used; a Tudor king's portrait would be a generic cliché.

## Content decisions
- The High Tea menu's boxed text is reproduced as legend. I cut its second paragraph with an ellipsis, because it contains the unverified "oldest on-sight bakery in the country" claim and the disputed 1850 opening.
- Menus are transcribed verbatim from the 2024 menu images, with printed spellings kept and marked [sic]. A banner says they are the 2024 menus and may have changed.
- The tart's look is described from the photographs only; the filling is never named.

## Known limitations
- The salver and tart are rich SVGs (210 KB and 98 KB) with turbulence filters. They render well in Chromium; other browsers should be checked on a real device. The caramel blistering is procedural and could be refined by hand.
- The casket's 3D lid uses CSS `preserve-3d`. It is tested in Chromium only; Safari should be checked on a device.
- The vertical ribbon only appears at 960px and wider. On phones the section breaks are horizontal ribbons only.
- The key has a visible text hint, but the keyhole drawing is small on very narrow screens (the button is at least 64px).
- The chime depends on Web Audio being available; without it the live region and visual state still report the finish.
- The menu page is long (it holds every published menu). The sticky index and scroll-spy help, but there is no filter.

## Assets to replace
- The wordmark: swap in the real logo files if a vector exists (to confirm).
- The postcard drawing: use the archive scan with permission (to confirm).
- The photo slot in "Visit" (see the shot list).

## Photography shot list
1. The counter at 288 Kew Road at opening: a silver stand of Maids of Honour, warm, on a paper doily. Natural light, no people.
2. One tart, close, at the moment it comes out of the oven: the blistered top and flaky edge, with steam.
3. The white box being tied with the black and gold ribbon; the oval label in sharp focus.
4. Hands placing a tart on a warmed wire rack (for the warming instructions).
5. The 1907 postcard and the other archive images, scanned flat (with permission).

## To confirm with the client
The 1850 / 1860 / 1868 / 1887 dates; both tart prices; the £20 or £22 luncheon minimum; whether the 2024 menus are current; whether the Thursday breakfast rule is current; separate shop and tearoom hours; permission for archive images; logo files.

## Structured data and llms.txt

**Encoded** (facts from `research/copy-deck.md` only):
- `index.html`: one JSON-LD block (it replaces the earlier `Restaurant` block). Type `["CafeOrCoffeeShop","Bakery"]`, `name`, `description` ("A Historic Traditional English Tearoom Shop and Bakery. “We make everything ourselves on the premises using traditional methods to our own original recipes.”", shown on this page), `address` (288 Kew Road, Richmond, Surrey, TW9 3DU, GB), `telephone`, `email`, `url` https://theoriginalmaidsofhonour.co.uk/, `openingHoursSpecification` Monday–Sunday 09:00–18:00 (VERIFIED), `acceptsReservations` true, `potentialAction` ReserveAction with the four ResDiary entry points shown on the page (Book a table, Breakfast, Luncheon, Set tea), `hasMenu` https://theoriginalmaidsofhonour.co.uk/menu.html.
- `menu.html`: one `Menu` block (it replaces the earlier `Restaurant` block): 8 sections, 147 items, 182 GBP offers, generated from this page's own DOM. The Menu `description` carries the page's own caveat ("Transcribed from the tearoom’s 2024 printed menus. Dishes and prices may have changed since."), because the copy deck marks the 2024 prices [TO CONFIRM]. Printed labels become offer names: Hot/Cold, bottle/glass columns, "for 2, two glasses…" on the Champagne and Prosecco teas, and "Chicken or Steak £8". "From £2.50" uses a minimum price. Set teas are one item each, with their contents as the description. "Extra Portions" is its own item, not a price of the Roast.
- `llms.txt`: name, one-line description, address, phone, email, hours (9am–6pm every day; the shop/tearoom split and holiday hours marked "to be confirmed"), luncheon and set-tea times, the walk-in policy, the four ResDiary links, a link to the menus (prices "may have changed") and the service charge, plus a preview note matching the page banner.
- `<meta name="description">`: index 146 characters, menu 151 characters.

**Deliberately left out, and why:**
- `foundingDate` and any "Est. 1850" or "since 1850" claim: 1850, 1860, 1868 and 1887 are disputed.
- The Henry VIII and Anne Boleyn legend, and anything from the history labelled LEGEND or REPORTED-only.
- Tart prices (£3.50 in the tearoom; £2.25 and box prices in the shop): copy deck [TO CONFIRM] item 6. The tart is listed by name and description only.
- The Luncheon minimum charge (£20 or £22, disputed). The Thursday no-cooked-breakfast rule ([TO CONFIRM]).
- Upgrade and add-on prices ("extra £2", "£15 Extra", "Weekday Special: £15 each", plant milks "£0.50 extra"). They stay in descriptions as printed and are not offers.
- Unpriced lists such as the loose teas: they are priced per pot elsewhere, so they are not separate offers.
- `sameAs`: the copy deck lists no social profile URLs. `servesCuisine`: the copy deck states no cuisine. `geo`: no coordinates in the research. The guest rooms and the National Archives café are separate businesses.
- A single "main" booking URL: which ResDiary link is the main one is [TO CONFIRM], so `acceptsReservations` is `true` and all four links are listed.
- The page labels the hours "shop and tearoom to confirm". Only the published "every day 9am–6pm" is encoded. Whether the shop and tearoom keep separate hours is not encoded.
- The tart's name is drawn as SVG lettering with an accessible name ("Maids of Honour Tart"). The validator reads that name as visible text.

**Notes:**
- **Official-domain assumption.** `url`, `@id` and `hasMenu` assume this concept is deployed at https://theoriginalmaidsofhonour.co.uk/ with the menu at `/menu.html` (the file name this concept uses). If the live site keeps a different menu path, change `hasMenu` and the Menu `url`/`@id`, or add a redirect. `llms.txt` links to the menu relatively (`menu.html`), so it works on the preview and on the domain.
- **Matches the visible page.** Every price, phone number, hour, address part, description sentence and booking/order link in the JSON-LD was checked against this page's `document.body.innerText` (plus each menu tab's panel), and each menu price is paired with its own printed line. `llms.txt` phones, emails, times and links were checked against the index and menu pages. No console errors. Nothing visible changed: only the JSON-LD block and `<meta name="description">` in `<head>` were edited.
- **Preview mechanisms untouched.** The "speculative design proposal" banner is unchanged. Note: neither page has a `<meta name="robots" content="noindex">` tag (there was none before this pass, and none was added); if previews rely on `noindex`, it must come from the host (an `X-Robots-Tag` header).
- **Regenerating.** Scripts: `/tmp/claude-0/-home-user-Claude-code/e50707d5-9ec5-571e-9915-9e7145ebe50f/scratchpad/v2/aivis/jsonld/` (`extract.js` reads items and prices from each menu page's DOM, `build.js` writes JSON-LD, meta and `llms.txt` from `facts.js` (copy deck only), `validate.js` checks against the rendered pages, `servers.sh` serves ports 8701–8709). Re-run them if a menu or a fact changes.

---

## "Useful first" pass (26 October 2026)

The client felt the site put its signature ahead of being useful. The signature now sits alongside the essentials instead of in front of them; nothing of it was removed. Standard: `pipeline/research/information-hierarchy.md` §(b); rubric §(c); before scores from `pipeline/research/useful-first-audit.md`. Facts from `research/copy-deck.md` only.

### Score: 25/32 before → 32/32 after (rubric §(c), 390×844 and 390×660)

| Item | Before | After |
|---|---|---|
| 1 (G) Essentials on screen 1 | 1 | 2 |
| 2 (G) Time to essentials | 2 | 2 |
| 3 (G) Signature parallel | 2 | 2 |
| 4 Signature budget | 2 | 2 |
| 5 Hidden content duplicated | 1 | 2 |
| 6 (G) Reduced motion / no JS | 2 | 2 |
| 7 Hours table | 1 | 2 |
| 8 Priced taster | 1 | 2 |
| 9 Find us | 1 | 2 |
| 10 Booking clarity | 2 | 2 |
| 11 (G) HTML menu | 2 | 2 |
| 12 Menu navigation | 2 | 2 |
| 13 Prices and dietary marks | 2 | 2 |
| 14 Action bar | 1 | 2 |
| 15 Interaction accessibility | 2 | 2 |
| 16 Literal labels | 1 | 2 |
| **Total** | **25** | **32** |

### What changed
- **Today strip** under the headline, as a white box label on the velvet: status from the published hours (London clock; "Open every day" with JS off), "9am–6pm daily · last walk-ins seated 17:30", the address linked to Google Maps, Book a table and Menus, "Skip to visit info". The hero no longer forces full height on phones; the tart, its £3.50 tag and "Turn the key on the iron box" stay on the first screen at 844.
- **Visit second** ("Visit us."): the hours table by service with a Book button per row (any table 32717, breakfast 33175, luncheon 33176 with the £22/£20 marker, set teas 33177), bank-holiday and Thursday markers, a two-line policy (ResDiary hand-off, phone, walk-ins, 12.5%, preferred tables, vegan 24 h), the address with map and phone buttons, and getting there (opposite Kew Gardens, on-street parking; walk and step-free access to confirm).
- **Taster third** ("The menus, priced."): the blackletter tart line £3.50, High Tea £24.50, Savoury High Tea £26.50, Full English £13, Vegetarian English £13 (V), Roast of the Day £18, then the bakery's description, the tart's allergens and both tart prices with the marker. Section top 1,654 px, tart price 1,734 px (was screen 8).
- **The iron box, kept whole**, now fourth, behind visible "Skip past the iron box / Skip to visit info" links. Locked, it occupies 771 px on a phone. Everything it reveals is also plain text: the price, words and allergens in the taster, and the legend (both accounts and the 1665 recipe note) plus "the recipe stays a secret" line in Our story's line of keepers.
- **Order after that:** Our story (Hill Street) → Tarts by post (the timer) → "Also at 288" (photo slot, guest rooms, Archives café). The old "Sit down and have it warm" section is gone; its services became the Visit rows.
- **Nav:** Visit & hours · Menus · Our story · Tarts by post (no signature-only labels). Bar stays Book a table · Menus · Call; menu page bar is Book a table · Find us · Call. `scroll-padding-bottom` set below 1080 px.
- **Menu page:** "Before you order" box directly under the sticky "On this menu" row: dietary legend, the allergen statement verbatim, tart allergens, how to ask about the 14 allergens, vegan and service; dietary marks on the same items as A; "Back to top" after every section; header nav relabelled.

### QA
- `qa.sh` (port 8945, label `v2-maids-b-uf`): 0 console errors, 0 failed requests, 0 bad links, 0 horizontal overflow, axe clean on both pages. CLS 0.000 on every page and width.
- First screen checked by screenshot at 390×660 and 390×844 (motion, reduced motion and JS off): status, address with map link, Book and Menus all visible above the action bar.

### Caveats
- With JS off or reduced motion, the box still rests open with every layer showing (the designed static state), so it is longer than one screen there; nothing in it is unique any more.
- The tart price in the taster is at 1,734 px; the whole taster is inside screen 3.
- JSON-LD and `llms.txt` unchanged.

