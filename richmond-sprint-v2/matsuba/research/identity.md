# Matsuba: identity research (v2)

What makes Matsuba, 10 Red Lion Street, Richmond TW9 1RW, unlike any other restaurant, with the evidence for each point. This builds on `../../../richmond-sprint/matsuba/research/dossier.md` and the copy deck (copied unchanged to `copy-deck.md` in this folder, with a marked v2 addendum).

**Access date for every source: 25 October 2026.** Status labels:
- **VERIFIED**: seen in the business's own files or photos, or in an official public record.
- **REPORTED**: one third-party source that I could not corroborate.
- **UNKNOWN**: not established.
- **INFERENCE**: my reading of the evidence, labelled as such.

Two kinds of photo are cited:
- **Site photo**: an image file on matsuba.co.uk, viewed once from a scratchpad copy. Never copy these into the repo.
- **Client photo 1–5**: a client-supplied Google Maps photo (third-party), viewed 25 Oct 2026. Photos 1–4 show the uploader as "Matsuba" (about 3, 4, 2 and 2 years ago); photo 5 is a customer upload (about a year ago). They are reference only (see `photo-notes.md`) and must not be reproduced or traced.

The family's heritage is not stated here, because only "family-run" is published. No people are named.

---

## 0. Correction to the brief: some "own photos" may not be Matsuba's

Five assets on the site sit in backdated upload folders (`2019/12/`, `2020/01/`). The server wrote all of them within 22 seconds, on 18 May 2021 between 10:02:49 and 10:03:11 GMT (HTTP `Last-Modified` headers). Every Matsuba-named photo was uploaded separately, on 29 June 2021 or later. The page slugs also date from the theme-demo era (dossier).

| Asset | What it shows | Status |
|---|---|---|
| `2020/01/hero132x-scaled.jpg` (Reservations page) | the **two salt/spice-rimmed cocktails** on a wooden tray, black background | provenance **UNKNOWN** |
| `2020/01/slider32x-scaled.jpg` (homepage) | seared tuna, rolls, white plates on a dark wood table | provenance **UNKNOWN** |
| `2020/01/info112x.jpg` (homepage) | hands slicing tuna on a board | provenance **UNKNOWN** |
| `2019/12/page52x.jpg` (homepage) | dumplings with tobiko on grey concrete | provenance **UNKNOWN** |
| `2020/01/video-3.mp4` (homepage, beside the Tuna Tataki copy) | overhead, 5 s: hands plating seared tuna with shredded mooli on dark slate | provenance **UNKNOWN** |

**INFERENCE:** the batch timing fits a theme demo or stock import. None of these shows the room. Their surfaces (grey concrete, dark slate) don't match the white marble-look tables in the venue photos, although the dark wood table in `slider32x` could match the earlier dark tables in client photo 2.

**Consequence:** treat the **salted-rim cocktails as unverified as Matsuba's**, and don't build identity on them. Everything ranked below comes from the 2021+ Matsuba-named photos, the client photos, the print files and the menu text.

---

## 1. Only-here details, ranked by design potential

### 1. The stepped two-layer slat wall (VERIFIED)

**Evidence:**
- Site photos `2021/06/matsuba-table-e1624960727855.jpg` (booth, "Our Story") and `2021/06/matsuba-banner2.jpg` (Reservations header).
- The far wall in `2021/07/matsuba-footer.jpg`.
- Client photos 2, 4 and 5.

**Detail:**
- The wall has two planes of square-section oak-coloured slats on a grey wall.
- The front layer is shorter, and its tops step down **one slat at a time in a straight, regular diagonal**. That makes a staircase or skyline edge.
- The back layer is sparser, and its slats run above the front layer's stepped edge to the ceiling.
- Each slat shows small round fixings.
- The motif appears in at least three places: behind the booths, along the side wall near the entrance (client 5), and at the far end of the long room (footer photo; client 2).

**Why build on it:**
- It is the room's one bespoke architectural gesture, and nothing else in Richmond looks like it.
- It already behaves like a graphic: a rhythm of verticals plus one diagonal.
- It can become section dividers, a progress bar, the menu's category index or a loading state, all from pure CSS (repeating gradients or flex bars with stepped heights). No photo licence is needed.

### 2. The corner frontage: slate paint, twin awnings, wide-tracked white MATSUBA (VERIFIED)

**Evidence:** client photo 1 (uploader "Matsuba").

**Detail:**
- A corner shopfront painted deep slate blue-grey throughout: fascia, window frames and the brick plinth below the sills.
- **Two awnings**, one on each face of the corner, each carrying "MATSUBA" in white, widely tracked geometric capitals that match the logo file.
- Red brick upper storeys with white sash windows, and black railings.
- The window shows white and purple phalaenopsis orchids along the sills, a lit framed menu case on the pier between windows, and a round decal on the door glass. At this resolution the decal appears to read "Matsuba" in a **script** face inside a ring, with small unreadable text and what look like hours below.
- **No noren or curtain.**

**Why build on it:**
- This is the first thing a guest sees on Red Lion Street.
- The awning is a real fabric threshold, which is the honest route to the "curtain" idea (see §3).
- The slate colour is a fourth brand colour the website doesn't use.
- The script door decal is a second lettering style that may be part of the brand. Confirm it with the owner before using it.

### 3. The wide-tracked geometric wordmark (VERIFIED)

**Evidence:**
- `2021/05/MATSUBA-logo-s.png` (512×60) and `MATSUBA-logo-ss.png` (300×35): white on transparent, no symbol or kanji.
- The awning (client photo 1).
- The takeaway PDF cover: "MATSUBA" reversed out of a brown box (`2026/06/MATSUBA-TA10-kids.pdf`).

**Measured on logo-s:**
- Cap height 56 px; total width 508 px, about 9.1 × the cap height.
- Gaps between letters are 29–43 px, averaging **0.65 × the cap height**. That is roughly 0.45em of tracking at Futura proportions (estimate).
- The M has splayed legs with a pointed vertex that reaches the baseline (Futura-like). The print menus are set in Futura PT (PDF font list), and the website in Jost, a Futura revival.

**Favicon:** `2021/06/MATSUBA-favicon.png`, 64×64, a single grey `#706F6F` "M" with that deep V.

**Why build on it:** the spacing is the brand. It runs the same across logo, awning, the takeaway cover and the tracked label bars in the print menus (see 8). Use it as the system's one display treatment.

### 4. Brass twin-arm sconces on the slats (VERIFIED)

**Evidence:** `matsuba-table-…jpg`, `matsuba-banner2.jpg`, and the footer photo (left).

**Detail:**
- A round brushed-brass backplate with a horizontal rod and a short cylinder at each end.
- Each cylinder holds a bare bulb, so the fitting throws **two warm glows** onto the slats.

**Why build on it:** a ready-made icon (disc plus two glow points) for focus and hover states, a "now open" indicator, or a booking button that "lights" its two ends. It is specific to this fitting, not a generic lamp.

### 5. The long exposed-brick wall: black swing-arm lamps and fairy-light swags (VERIFIED)

**Evidence:** `2021/07/matsuba-footer.jpg` (site); client photos 2, 3 and 5.

**Detail:**
- One long side of the narrow room is exposed red brick above a long dark banquette.
- **Black cantilevered swing-arm wall lamps** reach out over the tables. Each holds a bare filament bulb, and the drop rods are painted grey-blue.
- In client photos 3 and 5, **warm fairy lights hang in swags between the lamp arms**.
- A cool blue-white light washes up the brick from behind the banquette back (client 3).

**Why build on it:**
- It gives a second material, brick, against the oak.
- The long, single-file run of tables suits a vertical scroll that walks down the room: frontage, then bar, then booths, then the far slat wall.
- The swag curve is a gentle counter-shape to the slat diagonal.

### 6. The bar: perforated metal canopy, hanging stemware and Gekkeikan shelf (VERIFIED)

**Evidence:** `2021/06/image11-scaled-e1624621506551.jpeg` (Our Story header), `2021/07/main02.jpg` (home slider), the footer photo and client photo 5.

**Detail:**
- A box canopy of dark perforated metal mesh in a black frame over the front bar.
- Under it, rows of upturned wine glasses on rails and Edison globe pendants on tube drops.
- A top shelf of sake bottles. The legible labels are **Gekkeikan 月桂冠** ("THE FINEST SAKE"). A red-labelled bottle beside them is not legible: I could not read it, so I don't claim it.

**Why build on it:** the perforation is a texture you could use as a subtle dotted-screen background. It ties to the booth screens (item 7).

### 7. Booths with perforated screens, white marble-look tables and black pebble chopstick rests (VERIFIED)

**Evidence:** `matsuba-table-…jpg`, the footer photo and client photos 3–5.

**Detail:**
- Dark leather or leatherette booths divided by black-framed **perforated-metal screens**.
- White marble-look tops, with napkins folded on small white dishes.
- **Black round chopstick rests** and plain wooden chopsticks.
- A candle in a small copper holder (client 3).
- Black high-back chairs, and pale large-format floor tiles.
- Client photo 2 (about 4 years ago) shows dark wood tables. The homepage copy says "dark-wood and marble top furniture".

**Why build on it:** the white table with a black rest and chopsticks is a clean, ownable top-down composition for menu pages. It can be drawn, so no photo is needed.

### 8. The print-menu system (VERIFIED)

**Evidence:** `2026/03/MATSUBA-special2026.jpg`, `2026/06/MATSUBA-TA10-kids.pdf`, `2024/09/MATSUBA-TA8-brown.pdf`, `2024/10/MATSUBA-menu-202409-GF3.pdf`, `2024/10/MATSUBA-menu-202409-vegan4.pdf` and `2026/08/MATSUBA-Kids-web-scaled.jpeg`. The PDFs are InDesign files; their fonts are Futura PT Book/Medium/Demi/Bold/Heavy, Georgia Italic and Nexa Bold.

**Lunch & Early Evening card:**
- Centred, on white with a thin gold border.
- Section heads are widely tracked serif capitals. "LUNCH & EARLY EVENING", "DRINKS" and "SIDES" are in taupe; "STARTERS", "MAINS" and "DESSERTS" are in **burgundy**.
- Each head is flanked by **thin gold rules**. Gold tracked sub-heads are framed by bullets ("• RICE SET •", "• NOODLES •").
- Dish names are in a bold serif, descriptions in a light italic sans, and the vg/v marks in green.

**Takeaway, GF and vegan menus:**
- Brown Futura on white.
- Section titles are tracked caps ("APPETIZERS", "SPECIAL ROLLS"), with Georgia Italic straplines.
- Sub-sections are **reversed-out label bars**: white, widely tracked caps on a brown box ("S U S H I  M O R I", "N I G I R I", "A B U R I  N I G I R I"). The same letter-spaced language as the wordmark.
- The GF menu carries a cream band down the left edge with an orange vertical "GLUTEN FREE" tab. The vegan menu has a pale green band with a green "VEGAN" tab.
- The kids menu uses a pink and navy panel and its own cartoon-sushi artwork.

**Why build on it:** this is Matsuba's real typographic voice, warmer than the grey website. The reversed tracked label bar and the gold-ruled centred head give two components you can lift straight into the web menu.

### 9. Flame language: aburi, "torched-seared" and "flame seared" (VERIFIED)

**Evidence:** https://matsuba.co.uk/matsuba-menu/ and the takeaway PDF.
- A full **ABURI NIGIRI** section of 8 fish: Toro, Shake, Hotate, Suzuki, Maguro, Hamachi, Saba and Unagi.
- The takeaway strapline: "2 piece portions of flame seared nigiri".
- Tuna Tataki: "Torched-seared tuna slices with mooli and ponzu sauce", which the homepage calls "our signature appetizer".
- Salmon Aburi Carpaccio: "Torch-seared salmon pieces with yuzu miso dressing".
- The tasting menu's "Lion King nigiri: Salmon aburi nigiri with cheddar".
- Salmon Combo_B includes "4 pieces aburi nigiri".

**Why build on it:** sear is the kitchen's one repeated technique in its own words. It justifies a single warm "torch" accent and a sear interaction (§4, idea C). Spellings vary as published: "Torched-seared", "Torch-seared" and "flame seared".

### 10. Special Rolls "exclusively created by MATSUBA" (VERIFIED)

**Evidence:** the Our Story page: "Special Rolls: large 8 piece rolls exclusively created by MATSUBA". The takeaway PDF: "large 4 or 8 piece rolls exclusively created by Matsuba".

**The six dine-in rolls:** Matsuba Roll, Spider Roll, Crunch Tuna Roll, Dynamite Roll, Chicken Katsu Roll and Special K Roll (Beef or Veg vg).

**Site photos that match the menu text:**
- `2021/07/matsuba-roll.jpg` shows a crisp-coated roll topped with tobiko, spring onion and white mayo, which fits "Matsuba Roll: Prawn tempura, avocado, cucumber, spring onion, crispy coating, tobiko, lemon mayo".
- `2021/06/dynamite01.jpg` shows a roll with orange spicy mayo, dark sauce and sprouts on a dark stone-effect slab, which fits "Dynamite Roll".

**Why build on it:** this is the one claim of originality the restaurant makes itself. It earns a dedicated "only here" shelf.

### 11. Special K Roll and Stonepot Bibimbap (VERIFIED)

**Evidence:** the menu: "Special K Roll (Beef or Veg vg) Carrot, spinach, pickled radish, sesame seed, cucumber, seasoned tofu"; "Stonepot Bibimbap (Beef or Veg v) Assorted vegetables, chopped beef or tofu & egg topped on rice with spicy paste". The Special K Roll also comes as a lunch set with udon.

**What the "K" stands for: UNKNOWN.** Don't explain it.

**Why build on it:** these dishes are unusual on a Richmond Japanese menu and are part of what makes this menu Matsuba's. Present them by their published names and descriptions only.

### 12. The tasting menu (VERIFIED)

**Evidence:** the menu's Tasting tab: "Tasting menu £100 per person (minimum 2 persons) / A PRE-ORDER IS REQUIRED / Complimentary glass of Prosecco".

**The 14 listed items, in order:**
1. Dobin Mushi
2. Garlic Butter Edamame
3. Salmon Aburi Carpaccio
4. Sashimi Ceviche
5. Grilled Scallops
6. Gyoza
7. Sashimi
8. Lion King nigiri
9. Dynamite Roll
10. Zucchini Iridashi
11. Squid Shichimi Age
12. Black Cod Saikyo-yaki
13. Teriyaki with Rice
14. Yuzu Te & Macaron

**Note:** the site lists 14 items but doesn't use the word "courses". Harden's "14 courses" and its "£65" are out of date (REPORTED).

**Why build on it:** fourteen steps are a natural fit for a stepped sequence (§4, idea A).

### 13. The name: 松葉, and the "Matsu Set" (dictionary VERIFIED; pine imagery not found)

**Evidence:**
- Jisho (JMdict): 松葉 (まつば) = "pine needle".
- Kanji 松 = "pine tree" (kun reading まつ).
- 松竹梅 = "pine, bamboo and plum (an auspicious grouping)", and also "high, middle and low (ranking)".
- The menu's first sushi set is the **"Matsu Set" (9 pieces nigiri & 6 pieces maki, 29.9)**. It appears on the web menu, both takeaway PDFs and the GF PDF.

**Pine imagery: none found.** Not in the logo files (wordmark only), the favicon (a plain "M"), any of the 2021+ photos, the PDFs or the client photos. The site never explains the name.

**INFERENCE:** "Matsu" is the first half of "Matsuba" and, as a set name, follows the 松竹梅 tiering convention. Whether either was intended is **UNKNOWN**.

**Why build on it:** a pine-needle motif would be a new brand invention and needs owner sign-off. The safer hook is verbal: the name's meaning, told once, and the Matsu Set as the "house" set.

### 14. Red Lion Street and the building (VERIFIED from the council and public collections)

**Conservation area:**
- 10 Red Lion Street (FSA geocode 51.459455, −0.3048076) lies in the **Central Richmond conservation area** (planning.data.gov.uk, conservation-area 7362; council conservation-area study).
- No listed-building entry was found at this point. The query was a point query, so this is not conclusive. Historic England's own page returned 403.

**Richmond Council, *Central Richmond Conservation Area Appraisal* (adopted 20 Nov 2023), Character Area 3 "Paradise and Sheen Roads":**
- "Originally, Red Lion Street was a narrow and winding alley"
- "Both streets were widened in the early 20th century though retaining some of their original winding nature."
- "The red brick former Police Station and 1920s terrace of shops at nos. 8-32 (even) Red Lion Street present a positive and lively aspect to the street"
- On frontage, nos. 8–32 are "an exception" to the street's generally weak sense of enclosure.
- "The entrance to Red Lion Street is framed by the impressive, curved corner buildings at 1 George Street"
- The appraisal has a figure titled "Numbers 8-32 Red Lion Street".

So **no. 10 is in the 1920s red-brick shop terrace**. This is consistent with the red brick upper storeys in client photo 1. The terrace dates from the council's description; the exact build date of no. 10 is UNKNOWN. Which cross-street the corner faces is also UNKNOWN.

**Before the widening, from the Orleans House Gallery, Richmond Borough Art Collection, Day Collection, watercolours by F. Viner:**
- *The Red Lion, Red Lion Street, Richmond 1904* (LDORL : 03126). It shows a tiled-roof inn with a weatherboarded upper storey over brick, and a post sign bearing a red lion.
- *Red Lion Street, Richmond 1905, showing Orlmond Passage and a corner of the Red Lion* (LDORL : 03123).
- *The Red Lion Street, Richmond 1906, from top of Artichoke Alley* (LDORL : 03125). It shows a cobbled lane, a picket fence, cottages, a gas lamp and an "ARTICHOKE ALLEY" name-board.

Pubs History lists occupants of the Red Lion, Red Lion Street, Richmond, 1822–1855 (REPORTED; the page has since returned 404). That **the street is named after the inn is plausible but UNKNOWN**: no source states it.

**Position:** Harden's says "on the fringe of Richmond town centre (near St Mary Magdalene)" (REPORTED).

**Why build on it:** a real story that belongs to the address, not the cuisine: a winding alley with an inn, widened in the early 1900s, then a lively 1920s shop terrace, and since 2004 Matsuba. Reproducing the watercolours needs the gallery's permission.

### 15. "Lion King nigiri" on Red Lion Street (dish VERIFIED; any link UNKNOWN)

**Evidence:** the tasting menu: "Lion King nigiri: Salmon aburi nigiri with cheddar". The GF PDF (2024): "Lion King Aburi: Seared salmon with chedder & seared toro nigiri 14.90".

**Why build on it:** a light, true wink between a house dish and the street. Never claim the dish was named for the street.

### Also verified, lower design potential

- "Pull up a chair. Take a taste. Come join us." (Our Story).
- "First opened in 2004" (homepage), and "family-run" (Our Story).
- Bento boxes with red-lacquered compartments inside a black box (`2021/07/main01.jpg`).
- Textured indigo-blue and moss-green glazed rectangular plates, and dark stone-effect slabs (`matsuba-banner4.jpg`, `main3-1.jpg`, `dynamite01.jpg`).

### Counter or sushi bar

- The photos show a **drinks and service bar** at the front left, under the perforated canopy (client 5; `image11`, `main02`).
- No fish display case or sushi-chef counter seating is visible.
- Wanderlog's "a discreet sushi bar" is REPORTED (generated summary).
- Whether sushi is made in view of guests is **UNKNOWN**.

### Parasols

**Unverified. Don't use.** Wanderlog's About text says "dark-wood interiors, a discreet sushi bar, and vintage Japanese parasols". The page attaches no reviewer or date, and it reads as a generated summary. It has no photo captions.

**No parasol appears in any image checked:**
- 17 site images, plus the homepage video;
- 6 menu files;
- 5 client photos.

---

## 2. Visual identity

### Colours from the print menus

Pixel modes from the official files; the PDFs are flat vector colour, so these are exact to within rendering.

| Role | Hex | Source |
|---|---|---|
| Takeaway and print brown (text, label bars, cover box) | `#3F2B1C` | TA10 PDF (both pages) |
| GF/vegan menu brown | `#45321F` | GF3 PDF |
| Burgundy (section heads, prices) | `#640934` | Lunch & Early Evening card |
| Gold (hours line, sub-heads, rules) | `#D1A75B` | Lunch & Early Evening card |
| Gold border tint | `#E9D3AC` | Lunch & Early Evening card |
| Taupe (title, dish names) | `#5B4A42` | Lunch & Early Evening card |
| GF tab orange | `#F8AC1A` | GF3 PDF |
| GF band cream | `#FDE6BA` | GF3 PDF |
| Vegan and vg green | `#42B23C` | vegan4 PDF and TA10 PDF |
| Vegan band green | `#C6E8C4` | vegan4 PDF |
| Kids pink | `#F578C2` | TA10 PDF, page 2 |
| Kids navy | `#2A3E92` | TA10 PDF, page 2 |
| Favicon grey | `#706F6F` | MATSUBA-favicon.png |

### Colours from the venue photos

Approximate median samples. They depend on the lighting, so use them as mood references, not exact paint colours.

| Material | Hex | Source |
|---|---|---|
| Lit oak slat | `#BD6F00` | banner2 |
| Oak slat, booth wall | `#B26B45` | matsuba-table |
| Oak slat, unlit | `#996828` | banner2 |
| Brass sconce | `#986B08` / `#AA661B` | banner2 / matsuba-table |
| Edison bulb core | `#FFF8E7` | image11 |
| Fairy-light glow | `#E9D8AA` | client photo 3 |
| Booth leather (near-black brown) | `#220B0A` | matsuba-table |
| Marble-look table under warm light | `#FEE9CA` | matsuba-table |
| Grey wall behind the slats | `#8F8692` | matsuba-table |
| Perforated metal screen | `#50414E` | matsuba-table |
| Red brick | `#9C7145` / `#8B654D` | client photos 3 / 5 |
| Frontage slate (fascia and plinth) | `#263440` / `#273745` | client photo 1 |
| Awning slate in daylight | `#5A6F7F` | client photo 1 |
| Awning lettering | `#EFF5FA` | client photo 1 |

The website colours are in the dossier: monochrome `#030303`, `#23282D`, `#D7D6D6` and `#FFFFFF`.

### Suggested core palette (INFERENCE)

| Role | Colour | Hex |
|---|---|---|
| Base | print brown | `#3F2B1C` |
| Accent | burgundy | `#640934` |
| Accent | gold | `#D1A75B` |
| Material | oak | `#B26B45` |
| Material | frontage slate | `#263440` |
| Paper | warm white | `#FFFFFF`, with `#FEE9CA` as a lit-marble tint |
| Diet colours | the menus' own | `#42B23C` vegan; `#F8AC1A` GF |

The slate is the one colour visitors see before they enter.

### Type

- **Wordmark:** Futura-style geometric capitals tracked at about 0.65 × cap height. On the web, use Jost (already on the site) with `letter-spacing` around 0.4–0.45em.
- **Print:** Futura PT for heads and labels; Georgia Italic for straplines.
- **Lunch & Early Evening card:** a tracked serif for heads and a bold serif for dish names. The card is a flattened JPG, so the exact serif is UNKNOWN.
- **Door decal:** a script "Matsuba" (low-resolution photo; confirm with the owner).

---

## 3. The noren question

**Not found.** No noren, door curtain or fabric hanging appears in any source.

**What I checked:**
- All 17 image files on matsuba.co.uk, plus the homepage video.
- Both menu images and the four PDFs.
- The five client-supplied Google Maps photos, including the frontage: the door is glazed, with a decal, and no curtain is visible.
- Wanderlog's text, which mentions no noren or curtain.
- A web search.
- The Instagram profile (@matsuba.london) returned an HTTP 302 redirect (login wall) and was not read.

**Can the client's curtain idea be justified honestly? Yes, by reinterpreting it, not by claiming a noren.** Two real threshold elements exist:
1. **The awnings.** Matsuba's own fabric over the door, carrying the wordmark on both faces of the corner (client photo 1).
2. **The slat wall.** A screen of vertical timber strips, and the nearest thing in the room to a split curtain.

A "curtain" entrance can be built from either. Don't call it a noren, and don't add Japanese text or crests that the restaurant doesn't use.

---

## 4. Signature ideas (each tied to a verified detail)

### A. The stepped wall as the site's spine

**Tied to:** detail 1, with detail 12.

- The page edge or menu index is a row of vertical oak slats. Their tops step down in a straight diagonal, at the wall's rhythm.
- Each slat is a menu section, or one of the tasting menu's 14 items. Its height steps as you scroll, so the diagonal advances one slat per section, the way the wall steps one slat at a time.
- On the tasting-menu page, the 14 slats are the 14 items in order.
- Built in CSS only; no photography needed.

### B. Two-glow sconce states

**Tied to:** detail 4.

- Focus, hover and "selected" states, and the primary BOOK button, use the sconce's form: a small brass disc with a warm glow at each end.
- Hovering BOOK "switches on" both ends.
- Optionally, the brass glows brighter during service hours. Show those hours only with the copy deck's [TO CONFIRM] flag until Monday opening is settled.

### C. Sear the aburi

**Tied to:** detail 9.

- In the ABURI NIGIRI section, each dish name carries a quiet gold-to-amber gradient that "sears" across the word on hover or scroll-into-view: `#D1A75B` to `#F8AC1A`, with a brown `#3F2B1C` edge.
- The section strapline is Matsuba's own: "2 piece portions of flame seared nigiri".
- The same treatment marks Tuna Tataki ("our signature appetizer") and the Salmon Aburi Carpaccio.
- Respect `prefers-reduced-motion`.

### D. Under the awning, on Red Lion Street

**Tied to:** details 2, 3 and 14; the client's curtain request.

- The first screen is the slate fascia and awning, drawn rather than photographed, with "MATSUBA" in the wide tracking.
- On load or tap, the awning's valance lifts like a curtain to reveal the room: the slat wall, then the brick wall. This is the honest version of the noren the client liked.
- Further down, a short "The street" panel tells the council-sourced story: alley, early-1900s widening, the 1920s terrace at nos. 8–32, since 2004.
- It can optionally show Viner's 1904 Red Lion watercolour, with the gallery's permission.
- Optionally, a tiny "Lion King nigiri" aside, with no claim that the dish was named for the street.

---

## Sources (all accessed 25 October 2026)

**Official (Matsuba):**
- https://matsuba.co.uk/ , /matsuba-menu/ , /culinary-history/ , /reservations/ (page HTML from the earlier Playwright capture; image references extracted)
- Site images (each downloaded once): https://matsuba.co.uk/wp-content/uploads/2021/06/matsuba-table-e1624960727855.jpg ; …/2021/06/matsuba-banner2.jpg ; …/2021/06/matsuba-banner4.jpg ; …/2021/06/image11-scaled-e1624621506551.jpeg ; …/2021/06/dynamite01.jpg ; …/2021/06/MATSUBA-favicon.png ; …/2021/05/MATSUBA-logo-s.png ; …/2021/05/MATSUBA-logo-ss.png ; …/2021/07/matsuba-footer.jpg ; …/2021/07/matsuba-roll.jpg ; …/2021/07/main01.jpg ; …/2021/07/main02.jpg ; …/2021/07/main3-1.jpg ; …/2020/01/hero132x-scaled.jpg ; …/2020/01/slider32x-scaled.jpg ; …/2020/01/info112x.jpg ; …/2019/12/page52x.jpg ; …/2020/01/video-3.mp4 (HTTP Last-Modified headers checked once)
- Print: …/2026/03/MATSUBA-special2026.jpg ; …/2026/08/MATSUBA-Kids-web-scaled.jpeg ; …/2026/06/MATSUBA-TA10-kids.pdf ; …/2024/09/MATSUBA-TA8-brown.pdf ; …/2024/10/MATSUBA-menu-202409-GF3.pdf ; …/2024/10/MATSUBA-menu-202409-vegan4.pdf

**Client-supplied:** Google Maps photos 1–5 (third-party), viewed 25 Oct 2026. Notes are in `photo-notes.md`; the files are outside the repo.

**Public records and collections:**
- Richmond Council, Central Richmond Conservation Area Appraisal: https://richmond.gov.uk/central_richmond_conservation_area_appraisal
- Conservation-area study page: https://www.richmond.gov.uk/services/planning/conservation_and_urban_design/conservation_areas/conservation_area_study
- planning.data.gov.uk conservation-area entity 44005250 (Central Richmond, ref 7362): https://www.planning.data.gov.uk/entity/44005250/ , via `entity.json?dataset=conservation-area&latitude=51.459455&longitude=-0.3048076`
- FSA: https://ratings.food.gov.uk/business/1574612 (geocode via api.ratings.food.gov.uk)
- Orleans House Gallery: https://orleanshousegallery.org/collection/the-red-lion-street-richmond-1906-from-top-of-artichoke-alley ; http://orleanshousegallery.org/collection/the-red-lion-red-lion-street-richmond-1904/ ; http://orleanshousegallery.org/collection/red-lion-street-richmond-1905-showing-orlmond-passage-and-a-corner-of-the-red-lion/ (catalogue images viewed once each for 1904 and 1906; not copied into the repo)
- Historic England list entry 1062216 "10, RED LION STREET" is **not Matsuba**: its planning.data point is at 52.65°N, far north of Richmond. https://www.planning.data.gov.uk/entity/31519856 ; historicengland.org.uk returned 403.
- Jisho (word entries credit JMdict): https://jisho.org/search/%E6%9D%BE%E8%91%89 ; https://jisho.org/search/%E6%9D%BE%E7%AB%B9%E6%A2%85 ; https://jisho.org/search/%E6%9D%BE%20%23kanji

**Third-party:**
- https://wanderlog.com/place/details/1197161 (parasol claim; generated summary)
- https://pubshistory.com/LondonPubs/Richmond/RedLion.shtml (seen via a search snippet only; 404 on fetch)
- https://www.hardens.com/az/restaurants/richmond/tw9/matsuba.htm (via the dossier)
- https://www.instagram.com/matsuba.london/ (HTTP 302 to a login wall; not read)
