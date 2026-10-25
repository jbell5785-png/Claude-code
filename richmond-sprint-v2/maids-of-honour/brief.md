# The Original Maids of Honour v2: creative brief

## Reading order for builders
1. `research/identity.md`
2. `research/photo-notes.md`
3. `research/copy-deck.md`: the only content allowed. Menus are verbatim with prices; history claims are labelled VERIFIED, REPORTED or LEGEND.
4. `research/dossier.md`
5. `../_shared/tech-spec-v2.md`, plus the round 1 spec it builds on

## Reference images
Study these; never copy, trace or embed them.
- **Client photos**, in `/tmp/claude-0/-home-user-Claude-code/e50707d5-9ec5-571e-9915-9e7145ebe50f/scratchpad/v2/client-photos/maids/`:
  - 1: the frontage
  - 2: the tearoom
  - 3: the cream tea on blue-and-white
  - 4: the afternoon tea in the red room
- **The business's own images**, in `/tmp/claude-0/-home-user-Claude-code/e50707d5-9ec5-571e-9915-9e7145ebe50f/scratchpad/v2/maids/img/`:
  - `outside.jpg`, `Kew_Road_OutsideRe_Touched_large.jpg`: the frontage
  - `logo-artwork.png`, `logo-03.jpg`: the pen-and-ink building
  - `New_Old_Newens_Shop_A4_B_W_large.jpg`, `Old_Miads_large.jpg`: the 1890s shop
  - `MOH_1950_s_pic_large.png`, `CCI02062011…`: mid-century
  - `Henry_postcard_large.jpg`: the 1907 Hill Street postcard
  - `tart.jpg`, `display.jpg`: the tart and the counter
  - `box-a.jpg`, `box-b.jpg`: packaging
  - `breadcart.jpg`: the bread tricycle
  - `Food_Menu_2024*.jpg`, `Drinks_Menu_2024*.jpg`: the printed menus

## The place, in one paragraph
A cream-rendered tearoom and bakery at 288 Kew Road, opposite Kew Gardens. Along the roof runs a long bottle-green fascia reading "The Original Maids of Honour" in gold blackletter, with a raised "TEAS" gable at its centre. Below is a clay-tile canopy with "Newens" in gold blackletter, iron cresting, a hanging lantern, topiary cones and white wrought-iron chairs. The side wall carries a painted sign: "Newens / The Original Maids of Honour / HOME MADE BREAD, CAKES & PASTRIES / MORNING COFFEE / LUNCHEONS / TEAS". Inside are Windsor chairs, round oak tables, chintz curtains, iron chandeliers, blue-and-white china on every table, three-tier stands, and a red room with a gilt mirror. The family's baking line runs back to the 1890s photo of "A.N. NEWENS Confectioner / REFRESHMENT ROOMS". The Victorian shop was bombed in the war, "a pile of rubble, the baker's oven a charred and blackened hulk" (1947), and rebuilt in mock-Tudor. The tart is round puff pastry with a blistered golden top, "sweet and yet slightly savoury". Legend says its recipe was "kept secret in a locked iron box at Richmond Palace".

## Constants
- **Booking (ResDiary), per service:**
  - General: https://booking.resdiary.com/widget/ThreeMonth/NewensTheOriginalMaidsofHonour/32717
  - Breakfast: …/Standard/NewensTheOriginalMaidsofHonour/33175
  - Luncheon: …/33176
  - Set tea: …/33177
  - Guest rooms: https://direct-book.com/properties/maidsguestroomsdirect
- **Shop:** link to their existing online shop as published in the copy deck.
- **Hours** (copy deck): Monday to Sunday 9am–6pm.
  - Cooked breakfast last orders 11am, and none on Thursdays.
  - Luncheon 12:00–15:00.
  - Set teas from 10:00; Champagne and Prosecco teas from 11:00.
  - Last walk-ins seated by 17:30.
- **Dates:** the founding date conflicts (1850, 1860, 1868 or 1887). Use "Serving you since 1850" only as **their own claim** (it's their sign-off), and never build a precise timeline on the disputed dates.
- **Legend is legend:** the Henry VIII and Richmond Palace story is always introduced as "Legend has it…". The filling isn't disclosed by the business, so don't state it.
- **Family names:** only those the business itself publishes, in historical context.

## Three directions

### A: "Teas" (the signwriting)
- **Only-here details:** the green fascia with gold blackletter and the "TEAS" gable; the side-wall painted sign; the tile canopy with "Newens", the lantern and the iron cresting; topiary and white iron chairs.
- **Idea:** the website is signwritten like the building. Bottle green and gold leaf. Every page heading is lettered like the fascia, and the site's backbone is the side-wall sign.
- **Signature, "The side-wall sign":**
  - A large, beautifully lettered SVG recreation of the painted side sign, with this design's own lettering, not traced.
  - Its five lines (HOME MADE BREAD, CAKES & PASTRIES / MORNING COFFEE / LUNCHEONS / TEAS) are live.
  - The line being served right now "lights" like fresh gold leaf catching the sun, using Europe/London time and the published service windows.
  - Each line is a link to that service's menu and its own ResDiary booking link.
  - Test the time logic in Node.
  - Reduced motion or no JS: a static sign, with the current service in text.
- **Hero:** an original, detailed SVG illustration of the frontage: fascia, "TEAS" gable, canopy, lantern and topiary. Gold lettering catches light on hover.
- **Type:**
  - Grenze Gotisch (a readable modern blackletter, for display only: headings, never body)
  - Alegreya (text and menus)
- **Colour:**
  - Bottle green #24392F
  - Gold leaf #D9A845 (on green only)
  - Render cream #F1EAD9
  - Clay tile #7A3B26
  - Ink #1C1A17
- **Port:** 8531.

### B: "A royal secret" (the tart and the legend)
- **Only-here details:** the tart itself (round puff, blistered gold, served warm on silver with a doily); the "locked iron box" legend; the packaging (white box, black ribbon printed in gold blackletter, oval "Newens" label); their own reheating instruction, "150° Gas Mark 3, 5–8 mins"; the 1907 Hill Street postcard.
- **Idea:** one tart, one secret. A luxurious, intimate site built around a single object, the way a fine jeweller presents a ring.
- **Signature, "The iron box":**
  - A drawn wrought-iron casket (SVG). The visitor turns the key, by click, tap or keyboard, and the lid opens to reveal, layer by layer: the legend (clearly labelled), the tart (a beautiful original illustration), what the business says about it ("sweet and yet slightly savoury"), its allergens as published, and the price (£3.50).
  - Then the final layer: "The recipe stays in the box."
  - Reduced motion: the box rests open.
- **Second interaction, "Warm it like they do":** on the shop and delivery section, a small oven-dial timer using their exact instruction, "150°, Gas Mark 3, 5–8 minutes", as a genuinely useful tool for postal customers. It counts down with a gentle chime option (sound only after a tap) and an accessible live region.
- **Packaging as a layout device:** the black ribbon with gold blackletter runs across section breaks like a tied box, and the oval label marks sections.
- **Type:**
  - IM Fell English (period, for display)
  - Crimson Pro (text)
- **Colour:**
  - Iron #26262A
  - Box white #FAF8F3
  - Ribbon black #111
  - Gold #C79A3E
  - Pastry gold #D9A55B (illustration only)
  - Oxblood #5E1A22 (accents)
- **Port:** 8532.

### C: "The tearoom" (china, chintz and a building that was rebuilt)
- **Only-here details:** blue-and-white transferware on every table; three-tier stands; Windsor chairs and chintz; the red room with its gilt mirror; the 1890s A.N. Newens shop photo; the wartime bombing and mock-Tudor rebuild; the bread tricycle and the vintage van.
- **Idea:** sit down in the tearoom. The afternoon tea menu is a three-tier stand, the menus are on blue-and-white china, and the story is the building's survival.
- **Signature, "The three-tier stand":**
  - The set teas (Special Set Tea £50, High Tea £24.50, Savoury High Tea £26.50, and the Champagne and Prosecco teas, from the copy deck) are shown as an illustrated three-tier stand.
  - Choose a tea and the tiers fill with exactly what that tea includes: sandwiches, scones, cakes, as published. The price and a Book (set tea) link sit at the foot.
  - Each plate is rimmed with an original blue-and-white transferware-style border. Don't copy any real pattern; draw your own floral border inspired by the genre.
- **Second moment, "Still here":**
  - A compact three-frame story: the Victorian "REFRESHMENT ROOMS" shopfront (drawn), then "a pile of rubble, the baker's oven a charred and blackened hulk" (1947, as quoted), then today's mock-Tudor tearoom.
  - Tap or scroll through it. No disputed dates; use only the business's and the Council's agreed facts.
- **Type:**
  - Old Standard TT (19th-century, for display)
  - Nunito Sans (text)
- **Colour:**
  - Transfer blue #1F3F8F
  - China white #FBFBF8
  - Red room #5A1620
  - Gilt #A9803F
  - Oak #6B4A2E
  - A chintz floral pattern (your own SVG) used sparingly
- **Port:** 8533.
