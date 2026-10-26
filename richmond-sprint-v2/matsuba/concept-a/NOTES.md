# Matsuba v2, Concept A: "Under the awning"

**The concept in two lines.** You arrive at the slate corner of Red Lion Street. The near awning rolls up like a blind, you go through the glazed door, and you walk down the long room: the bar, then the brick wall with its lamps, then the booths, then the far slat wall, where you book. After that the page *is* the room: one narrow corridor of content with oak slats down the left margin and brick down the right, and the sections run in single file like the tables.

Port 8511: `python3 -m http.server 8511 --directory richmond-sprint-v2/matsuba/concept-a`


## Useful first pass (26 October 2026): 23/32 → 32/32

The client felt the signature came before being useful. The walk is kept, but it now sits alongside the essentials instead of in front of them.

**What changed**
- **Today strip under the h1** (first screen, inside 390×660): today’s status from the published hours, in London time, with "to confirm" kept for Monday and the lunch end time. It also carries "10 Red Lion St, TW9 1RW · Directions" (Google Maps), Book a table and Menu, plus "Skip to visit info". The frontage art is 390×220 on phones so the strip fits.
- **Visit second:** "Hours, address, booking" now follows the hero. It has the full-week table, the address with a map link and phone, getting there (station, parking and access "to confirm"), the booking terms in plain words, and 20% off collection via Toast.
- **Priced taster third:** "From the menu" (the lit menu case) has five dishes with £ and v/vg marks, with the Lion King aside kept.
- **The walk after that, shortened on phones.** It shows the room once (3:2), and the four stops are a swipe rail with Bar · Brick wall · Booths · Slat wall buttons. The camera follows the rail, and the lamps switch on one by one, once. The awning now rolls up as the hero scrolls away, with no pin. Desktop keeps the pinned walk: the room opens through the door, then the camera walks it, all on native scroll. "Skip the walk to booking" comes before it. "Find the corner" (street history, Viner slot) moves to the end.
- **Action bar:** Book · Menu · Call, with Order in the header, plus `scroll-padding-bottom`.
- **Menu page:** the tabs are gone. It is one scrolling page with a sticky course row, Back to top after each course, and the legend, allergen statement and service line at the top. The footer on both pages adds the hours and a Book link.
- **Kept:** fonts, palette, both drawings, JSON-LD (no visible fact changed; the description sentence is still on the page), `llms.txt`, all "to confirm" markers.

| # | Item | Before | After | Evidence after |
|---|---|---|---|---|
| 1 | Essentials on screen 1 (G) | 1 | 2 | Status, address with Directions, Book a table and Menu at 417–585 px at 390×660 (bar top 596), as HTML; bar Book · Menu · Call |
| 2 | Time to essentials (G) | 2 | 2 | Strip is plain HTML; the status is set by an inline script before first paint, with a week-in-one-line fallback without JS |
| 3 | Signature is parallel (G) | 2 | 2 | "Skip to visit info" in the strip; "Skip the walk to booking" before the walk; Book and Menu in the strip and the bar |
| 4 | Signature budget | 0 | 2 | Phones: nothing pinned; the walk takes 787 px (skip link to the end of the rail), and the lamps switch on once in about 1.5 s. Desktop keeps a pinned walk of about 2.75 screens, native scroll |
| 5 | Hidden content duplicated | 2 | 2 | The four stops are DOM text in a swipe rail with tap buttons; nothing is only inside the drawing |
| 6 | Reduced motion and no-JS (G) | 2 | 2 | Reduced motion and no JS: lit frontage, lit room still, the same rail, the same strip (no-JS shows the week) |
| 7 | Hours table | 1 | 2 | Full week at 824 px, Monday and the lunch end marked "to confirm"; today’s row highlighted |
| 8 | Priced menu taster | 1 | 2 | "From the menu": five dishes with £ and v/vg marks plus a legend; first dish at 1,680 px |
| 9 | Find us | 1 | 2 | Address, Google Maps link, "in the heart of Richmond", station, parking and step-free access marked "to confirm" |
| 10 | Booking clarity | 2 | 2 | Visit block: online up to 12, card secures it, £10 per person for a no-show or under 24 hours’ notice, over 12 by phone |
| 11 | HTML menu (G) | 2 | 2 | Unchanged: HTML with h2/h3 |
| 12 | Menu navigation | 1 | 2 | Tabs removed: one scrolling page with a sticky "On this menu" course row and Back to top after every course |
| 13 | Prices and dietary marks | 1 | 2 | v/vg legend, allergen statement and service line at the top of the case |
| 14 | Action bar | 1 | 2 | Book · Menu · Call, opaque, Order moved to the header; `scroll-padding-bottom` 72 px |
| 15 | Accessibility of the interaction | 2 | 2 | Rail is native horizontal scroll with four stop buttons (tap or keyboard), a focusable region and no loops |
| 16 | Literal labels | 2 | 2 | "Hours, address, booking", "From the menu", "Book a table", "Menu", "Order" |
| | **Total** | **23/32** | **32/32** | |
**QA** (`pipeline/tools/qa.sh`, label `v2-matsuba-a-uf`, port 8941): no console errors, no failed requests, no bad links, no overflow at 390, 768 or 1440, axe clean on both pages. CLS: index 0.009 / 0.007 / 0.015, menu 0.064 / 0.021 / 0.010 (390 / 768 / 1440); the menu key reserves its web-font height. Keyboard run (60 Tabs per page at 390×844): no focused element lands under the action bar.

**Scoring note.** Item 9 is scored under the audit's convention that unpublished station, parking and step-free facts may appear as "to confirm". Nothing in the copy deck states them, so they are flagged rather than written. Screens are 390×844 in motion mode unless stated. Screenshots and measurements: `/tmp/claude-0/-home-user-Claude-code/e50707d5-9ec5-571e-9915-9e7145ebe50f/scratchpad/ufm/` (`shots/`, `audit/`).

---

## The signature: "Step inside"

**Built on:** the twin-awning, slate-painted corner frontage (client photo 1, uploaded by "Matsuba"; identity.md §1.2) and the long, narrow room (client photos 2, 3 and 5; site `matsuba-footer.jpg`; identity.md §1.5). It answers the client's curtain idea honestly: the fabric that lifts is Matsuba's **real awning**, not a noren (identity.md §3).

**How it works** (`js/walk.js`, plain JS, no library):
1. **Frontage.** An original SVG elevation of the corner at dusk (`#frontage`). On load the window lights and the menu case warm up with a short flicker, and the near awning lifts a little and settles, as a hint.
2. **The awning rolls up.** Over the first third of a screen of scroll (or on tapping **Come in**), the near awning's fabric scales up into a roll tube at its rail. Its shadow lifts off the glass and the windows brighten. The corner awning stays down.
3. **Through the door.** The SVG `viewBox` zooms into the glazed door, and the interior drawing appears clipped to the door glass's on-screen rectangle. The clip then opens to full screen, so you literally see the room through the door before you enter it.
4. **The walk.** A one-point-perspective drawing of the room (`#room`) stays pinned with `position: sticky` while four short cards scroll past. A camera, which is just `viewBox` interpolation, moves bar canopy → brick wall → booths → far slat wall. Between the bar and the brick wall, the four swing-arm lamps **switch on one by one**, their light pools land on the tables, the fairy-light swags glow as both of their lamps come on, and the room's dimmer lifts.
5. **Booking at the far wall.** The last card hands over to the booking section, which opens on the same stepped slat wall.

**Rules kept:** no scroll-jacking (the page scrolls natively and the drawing follows it). "Come in" is a smooth `scrollTo` and moves focus to the first card. Since the Useful first pass, phones get a one-screen version (the room once, the stops as a swipe rail) and desktop keeps the pinned walk. Every card is readable text in the DOM. The action bar (Book, Menu, Call; Order is in the header) stays fixed throughout. **Reduced motion, or no JS:** the frontage rests lit with the awning down, the room is shown whole and fully lit as a composed still, and the four cards follow as a plain list.

---

## Only-here details used, where, and the source for each

| # | Only-here detail | Where it appears in the concept (as design) | Source |
|---|---|---|---|
| 1 | **Twin slate awnings on the corner, each carrying a wide-tracked white MATSUBA** | Hero illustration; the awning that rolls up (signature); the favicon (a small slate awning); the stitched-valance line along the mobile action bar; the awning valance at the top of the menu page | Client photo 1; identity.md §1.2 |
| 2 | **Slate paint throughout, including the painted brick plinth** | Main palette `#263440`; the painted-brick plinth in the drawing; the footer, which is the plinth (`img/plinth-tile.svg`); the slate boards behind the menu case | Client photo 1; identity.md §1.2 and the colour table (`#263440`) |
| 3 | **Red brick upper storeys with white sash windows** | The drawing's upper storeys (soldier-course lintels, stone sills, sashes) | Client photo 1; council appraisal: No. 10 is in "the 1920s terrace of shops at nos. 8-32 (even)", the red-brick terrace |
| 4 | **Orchids on the sills** (purple and white phalaenopsis, one lime) | Six orchids in the drawing's window; the orchids on the sill under the menu case on `menu.html` | Client photo 1; photo-notes.md |
| 5 | **The lit, framed menu case on the pier** (steel frame, small MATSUBA plate) | Drawn in the hero, glowing and "switching on" at load; the "lit menu case" teaser on the homepage; **the whole menu page is that case**, with a steel frame, MATSUBA plate, backlit paper and glow | Client photo 1; identity.md §1.2 |
| 6 | **Black hoop-top railings, the glazed door with its long steel pull and the round door decal** | Drawn in the hero. The decal is drawn as an empty ring only, because its wording is unconfirmed | Client photo 1; copy deck v2 addendum (decal wording [TO CONFIRM]) |
| 7 | **The long, narrow room** | The walk sequence; the corridor layout of every section after it; the single-file run of sections | Client photos 2 and 5; `matsuba-footer.jpg`; identity.md §1.5 |
| 8 | **Exposed brick wall, black swing-arm lamps with bare bulbs, grey-blue drop rods, fairy-light swags and a cool glow behind the banquette** | Walk beat 2: the lamps switch on one by one and the swags glow. **Every section divider is a fairy-light swag** that lights bulb by bulb as it scrolls in. The right margin of the corridor is brick (`img/brick-tile.svg`) | Client photos 3 and 5; `matsuba-footer.jpg`; identity.md §1.5 |
| 9 | **The bar: perforated metal canopy, upturned glasses on rails, brass tube pendants with globe bulbs and a shelf of sake** | Walk beat 1, drawn in perspective | `image11-scaled…jpeg`; client photo 5; identity.md §1.6. Sake labels are not drawn as text |
| 10 | **Booths behind perforated screens, white marble-look tables, black pebble chopstick rests and a candle in a copper holder** | Walk beat 3; every table in the room drawing carries a pebble rest, chopsticks, a napkin dish and a copper candle | `matsuba-table…jpg`; client photos 3–5; identity.md §1.7 |
| 11 | **The two-layer oak slat wall, with the front layer stepping down one slat at a time** | Walk beat 4 (the camera ends on it); the booking section backdrop; the slatted left margin of the corridor; the walk's progress mark (a single slat) | Client photos 2, 4 and 5; `matsuba-banner2.jpg`; identity.md §1.1 |
| 12 | **The wordmark's spacing (about 0.45em tracking, Futura-like M)** | Header wordmark and both awnings, set in Josefin Sans (a working wordmark, not a redrawn logo) | Logo files and awning; identity.md §1.3 |
| 13 | **Matsuba's print-menu system:** tracked serif capitals flanked by thin gold rules, "• RICE SET •" sub-heads, green v/vg | The whole menu page typography | `MATSUBA-special2026.jpg`; identity.md §1.8 |
| 14 | **Red Lion Street, "a narrow and winding alley", and the 1920s terrace** | One line in "Find the corner", with a dashed winding line that straightens as it scrolls in | Richmond Council, *Central Richmond Conservation Area Appraisal* (2023); copy deck v2 addendum |
| 15 | **"Pull up a chair. Take a taste. Come join us."** | The h1; the Book icon is a chair | Our Story page; copy deck |
| 16 | **Lion King nigiri, on Red Lion Street** | A one-line aside on the teaser and the tasting menu: "A Lion King nigiri, served on Red Lion Street." It makes no claim about the name | Tasting menu; brief (playful, no claimed link) |

Lesser truthful details: the brass twin sconces glow through the drawn windows and on the slats, because they are really there (identity.md §1.4). They are kept quiet because they are Concept B's signature. The table settings come from the photos.

---

## Swap test: why this fails for any other restaurant

Replace "Matsuba" with another Japanese restaurant, and nearly everything breaks:
- **The hero is a drawing of one specific building.** It shows a slate corner with two awnings, one on a splayed corner face; a painted-brick plinth; hoop railings; a menu case on the pier between orchid-filled windows; and a red-brick 1920s terrace above. No other restaurant has this frontage.
- **The signature is that building's awning lifting, then that room.** The walk only makes sense for a room that is long and narrow, with the bar under a perforated canopy at the front, brick and swing-arm lamps down one side, booths with perforated screens down the other, and a stepped two-layer slat wall at the far end.
- **The layout logic is the floor plan.** It is the corridor with slats on the left and brick on the right, as you see them walking in (client photo 5).
- **The menu page is the object in their window,** typeset in their own print-menu system.

Nothing on the site relies on cuisine shorthand. It has no noren, no parasols, no kanji, no cherry blossom, no rising sun and no brush strokes. The cuisine is only present in the menu itself.

---

## Distinct from B and C

| | A (this) | B "The stepped wall" | C "Aburi" |
|---|---|---|---|
| Idea | Threshold and the long room | The slat wall as a system | Fire and the print menu |
| Signature | Awning rolls up, through the door, lamps switch on down the room | Stepped wall as the scroll index | Torch-sear across dish names |
| Type | Josefin Sans + Source Serif 4 | Urbanist + Spectral | Marcellus + Albert Sans |
| Colour | Slate, awning white, bulb, brick and oak as texture | Oak, wall grey, brass, marble | Burgundy, gold, brown, flame blue |
| Motion | Lighting up (lamps, swags, case) and the blind rolling up | Slats stepping and lifting | Flame passing, letters caramelising |

The slat wall appears in A only as the room's far end (beat 4 and the booking backdrop) and as a margin texture, never as a navigation system. The print-menu heads appear in A only inside the menu case, in A's own palette (slate heads, gold rules), not C's burgundy.

---

## Implementation notes

- **Stack:** plain HTML, CSS and JS, with no frameworks and no GSAP. Motion is written in about 200 lines of JS (`js/walk.js`), with rAF-throttled scroll handling that only runs while the walk section is in view.
- **Illustrations:** both drawings are original inline SVG. They were drawn by procedural scripts that place every element: a real one-point perspective projection for the room, with bricks, lamps, swags, tables, glasses and slats placed in depth, and a measured elevation for the frontage. Proportions came from studying client photos 1–5 and the site photos. **No photo was traced or embedded.** `img/frontage.svg` is a standalone copy of the frontage for print or social use.
- **Texture:** a feTurbulence grain tile (`img/grain.svg`) is blended over both drawings. Brick and plinth are tiny SVG tiles.
- **Files:** `index.html`, `menu.html`, `css/site.css`, `css/menu.css`, `js/site.js` (header, swags, booking hand-off), `js/walk.js` (signature), `js/menu.js` (marks the current course in the sticky row), `img/` (favicon, frontage, tiles, grain).
- **No layout shift:** the hero art, room still, slot and swags all have fixed aspect ratios or heights. The booking status line reserves no space until it is used, and it sits below the button.
- **Type:** Josefin Sans (wordmark, labels, nav: wide tracking as on the awnings) and Source Serif 4 (text, dish names; optical sizing on; old-style figures in running text, lining tabular figures for prices). Metric-adjusted local fallbacks are defined.
- **Colour and contrast** (checked): awning white on slate is 11.5:1; bulb `#F2B65A` on slate is 7.1:1; muted `#b3bcc1` on slate is above 5.9:1; ink on paper is 13.7:1; gold text `#7f5410` on paper is 6.2:1; vg green `#2c7a2f` on paper is 5.0:1. Oak `#B26B45` and brick `#9A5B3F` are used only as texture or decoration.
- **Accessibility:**
  - skip link, landmarks and a logical heading order
  - both drawings have `<title>` and `<desc>`
  - `:focus-visible` rings
  - the menu is one scrolling page; the course row is a set of sticky jump links (the ARIA tabs were removed in the Useful first pass because they hid 100 of 121 prices)
  - tap targets are 44px or more
  - the action bar is a labelled `<nav>`
- **Booking:** the form's party size is not sent anywhere. Submitting opens `https://booking.favouritetable.com/?SiteCode=2122` in a new tab (`opener` nulled) and states plainly that nothing is booked until the guest confirms it there. If `window.open` is blocked, a visible link appears instead. Choosing "13 or more" points to the phone, as Matsuba's terms say. The terms are stated in Visit › Booking. Without JS, the form submits as a GET to the same URL in a new tab.
- **Checked with Playwright** at 390, 768 and 1440: no console errors, no failed requests, no horizontal overflow on either page. Also checked: reduced-motion and no-JS states, the "Come in" click (lands on the bar card with focus moved there), the booking pop-up (opens Favourite Table's real booking page) and keyboard tabs. Screenshots are in `/tmp/claude-0/-home-user-Claude-code/e50707d5-9ec5-571e-9915-9e7145ebe50f/scratchpad/v2/build-matsuba-a/`.

## Content and honesty

- All copy comes from `copy-deck.md` and `identity.md`. Matsuba's own lines are used where they are good: the h1, "Book your table today!", the Special Rolls line, the "signature appetizer" line, the booking terms and the takeaway deal.
- **The menu is the live, published dine-in menu**, so it isn't a sample. It is reproduced verbatim from the copy deck, and `menu.html` is parsed directly from it, with prices as published (no £ sign) and spellings as published. Kids and Lunch & Early Evening are labelled as transcribed from Matsuba's image menus. Straplines such as "2 piece portions of flame seared nigiri" are Matsuba's own, from the takeaway PDF.
- **"To confirm" markers** (visible, plus `<!-- [TO CONFIRM] -->` comments):
  - Monday opening
  - the lunch end time, on the homepage and on the menu's Lunch tab
  - whether the Lunch & Early Evening set still runs
  - the vegan and gluten-free PDFs (2024)
  - the door decal's wording (not drawn as text)
- **Not used:** noren, parasols, kanji, the family's heritage, any names, reviews or ratings (the FSA hygiene rating is a public record), the 2019/2020 stock-like photos, the expired kids' promotion, delivery, pine imagery, and any claim that the Lion King nigiri is named after the street.
- JSON-LD holds confirmed facts only. Hours are left out because Monday is unconfirmed.

### Spelling proposals (need the owner's sign-off; not applied on the page)
- "Uangi Steak" → Unagi Steak
- "Eby Fry" → Ebi Fry
- "(all samon)" → (all salmon)
- "South Amerian" → South American
- "Chrispy" → Crispy
- "chilli papper" → chilli pepper
- "Yuzu Te" → Yuzu Tea
- "Aperol Com Fanta" → Aperol con Fanta (?)
- "Vanila" → Vanilla
- "Torched-seared" vs "Torch-seared": pick one

## Known limitations

- The drawings are vector illustration with grain, not hand-inked line art. A commissioned illustrator would add hand-drawn line variation and finer detail on the sash windows and the brick. The frontage's upper storeys are inferred: the photo only shows the first-floor window line, so the second storey is an assumption.
- The corner geometry is simplified to one splayed face. Which cross-street the corner faces is unknown, so the drawing doesn't name it.
- The far slat wall is easiest to read at the end of the walk. At the overview zoom it is small.
- `viewBox` animation re-rasterises the room SVG (about 180KB of paths) on each scroll frame. It is smooth on desktop Chrome, but mid-range phones should be profiled. If it is too heavy, drop the brick joints beyond mid-depth.
- On wide desktops the two corridor walls are large flat areas. They are dimmed, but a lamp glow tied to each section would make them feel more like the room.
- The menu page has no dietary filter. The vegan and gluten-free PDFs are linked but flagged, because they date from 2024.
- `index.html` is about 290KB because both drawings are inline (they are animated, so they can't be external images). It gzips to about 75KB.
- Web fonts load from Google Fonts. The fallbacks are metric-adjusted but not perfect, so the awning lettering shifts slightly while the fonts load.

## Assets to replace or clear
- **Wordmark:** set live in Josefin Sans at 0.45em tracking. Swap in the official logo file if the owner prefers; don't redraw it.
- **Image slot:** F. Viner, *The Red Lion, Red Lion Street, Richmond 1904* (Orleans House Gallery, LDORL : 03126). Reproduce only with the gallery's permission.
- **Door decal:** confirm its wording before drawing it as text.

## Photography shot list (for the owner, if photos are wanted later)
1. The frontage at blue hour from across Red Lion Street, both awnings in frame, the menu case lit and the orchids on the sills.
2. The same frame with the near awning retracted (for a photographic version of the signature).
3. From the doorway down the long room, all swing-arm lamps and fairy lights on, at about eye height.
4. Under the bar canopy, looking up at the upturned glasses and the pendants.
5. The brick wall at the banquette, showing the cool glow behind the banquette back.
6. A booth: perforated screen, marble-look table, pebble rests and chopsticks, the copper candle lit.
7. The far stepped slat wall, square-on, lit by its brass sconce.
8. The menu case close-up, for the menu page header.

## Structured data and llms.txt

**Encoded** (facts from `research/copy-deck.md` only):
- `index.html`: one JSON-LD block (it replaces the earlier block, which also pointed `menu` at the live site's `/matsuba-menu/`). Type `Restaurant`, `servesCuisine` "Japanese", `name`, `description` ("A family-run Japanese restaurant, first opened in 2004. Pull up a chair. Take a taste. Come join us.", sentences shown on this page), `foundingDate` 2004 ("First opened in 2004"), `address` (10 Red Lion Street, Richmond, TW9 1RW, GB), `telephone`, `email`, `url` https://matsuba.co.uk/, `sameAs` Instagram (@matsuba.london), `acceptsReservations` = the Favourite Table URL, `potentialAction` ReserveAction (Favourite Table) and OrderAction (Toast, collection), `hasMenu` https://matsuba.co.uk/menu.html.
- `menu.html`: one `Menu` block (it replaces the earlier `Restaurant` block): 8 sections, 141 items, 141 GBP offers, generated from this page's own DOM. Names, descriptions and spellings are as printed ("Uangi Steak", "Eby Fry"). A dual price such as "12.9/22.9" is two offers with no variant label, because which price goes with which variant is [TO CONFIRM]; "6.9/6.9" is one offer. `suitableForDiet` is set only where a vg/v mark covers the whole dish (not "Katsu Curry (… Pumpkin vg)"). Each kids bento is one priced item. The tasting menu's "£100 per person (minimum 2 persons)" is the section description; its 14 dishes carry no individual price.
- `llms.txt`: name, one-line description, address, phone, email, Instagram, hours as published with Monday and the lunch end time marked "to confirm", booking (Favourite Table, up to 12 guests online) and collection ordering (Toast, 20% off collection), links to the menu and the takeaway PDF, a preview note matching the page banner.
- `<meta name="description">`: index 148 characters, menu 156 characters. The menu one no longer advertises the Lunch & Early Evening set.

**Deliberately left out, and why:**
- `openingHoursSpecification`: Monday opening and the lunch end time (3pm, 2:45pm or 2:30pm) are disputed. A partial schedule would tell search engines the restaurant is closed at times it may be open, so hours appear only in `llms.txt`, flagged.
- The Lunch & Early Evening set menu (whether it still runs is [TO CONFIRM]); the lunch-menu time "12pm – 2:45pm"; the 2024 vegan and gluten-free PDFs ([TO CONFIRM]); the expired kids promotion; delivery (never mentioned).
- `geo`: `research/identity.md` has an FSA geocode, but no coordinates are shown on the page.
- The Food Hygiene Rating, the name's meaning, heritage, people and any review or "best" claims.

**Notes:**
- **Official-domain assumption.** `url`, `@id` and `hasMenu` assume this concept is deployed at https://matsuba.co.uk/ with the menu at `/menu.html` (the file name this concept uses). If the live site keeps a different menu path, change `hasMenu` and the Menu `url`/`@id`, or add a redirect. `llms.txt` links to the menu relatively (`menu.html`), so it works on the preview and on the domain.
- **Matches the visible page.** Every price, phone number, hour, address part, description sentence and booking/order link in the JSON-LD was checked against this page's `document.body.innerText` (plus each menu tab's panel), and each menu price is paired with its own printed line. `llms.txt` phones, emails, times and links were checked against the index and menu pages. No console errors. Nothing visible changed: only the JSON-LD block and `<meta name="description">` in `<head>` were edited.
- **Preview mechanisms untouched.** The "speculative design proposal" banner is unchanged. Note: neither page has a `<meta name="robots" content="noindex">` tag (there was none before this pass, and none was added); if previews rely on `noindex`, it must come from the host (an `X-Robots-Tag` header).
- **Regenerating.** Scripts: `/tmp/claude-0/-home-user-Claude-code/e50707d5-9ec5-571e-9915-9e7145ebe50f/scratchpad/v2/aivis/jsonld/` (`extract.js` reads items and prices from each menu page's DOM, `build.js` writes JSON-LD, meta and `llms.txt` from `facts.js` (copy deck only), `validate.js` checks against the rendered pages, `servers.sh` serves ports 8701–8709). Re-run them if a menu or a fact changes.

## Editorial pass (26 October 2026): the site talks to diners

After client review, every word was reread as a diner deciding where to eat. This section supersedes anything above that describes the cut items. The awning, the walk down the long room, the Useful-first structure, the menu and the "to confirm" markers are unchanged.

**Homepage, cut or rewritten**
- *From the menu:* the "The lit menu case" eyebrow and the line "The case hangs on the pier between the orchids, so you can read it from the pavement. These five are from it, at Matsuba's published prices." removed; "served on Red Lion Street" dropped from the tasting line.
- *Step inside:* hint shortened to "From the bar to the far wall. Swipe or tap a stop." (the stop buttons stay; they are the control). The four stop cards are one plain sentence each; "the front one stepping down a slat at a time. This is as far as the room goes, and where you book." is gone. "Skip the walk to booking" became "Skip to booking".
- *Reservations:* eyebrow "At the far wall" became "Reservations"; the intro is now "Choose how many of you, then pick a date and time with Favourite Table, our booking service." The verbatim booking-terms quotes were removed (Visit › Booking states them; choosing "13 or more" still shows the phone note).
- *Collect from the corner:* removed; it repeated Visit › Collection. The takeaway PDF link moved into Visit › Collection.
- *Out on the street / Find the corner:* removed: the conservation-area quotes and source line, the winding-line graphic, and the 1904 F. Viner image slot. Its Instagram link moved to the footer (email and map were already on the page).
- Visit › Getting there no longer repeats the awnings line from the hero lede. "Opening hours as published" (screen-reader caption) became "Opening hours".

**Menu, cut or rewritten**
- "The case on the pier, between the orchids, at 10 Red Lion Street." removed.
- "The dine-in menu as published on matsuba.co.uk (updated 16 August 2026). Prices in pounds. Spellings as published." became "Our dine-in menu, updated 16 August 2026. Prices in pounds."
- "Transcribed from the restaurant's image menu." (Kids) removed; "Transcribed from the restaurant's set-menu card. to confirm still running" became "Still running? to confirm".
- Meta, Open Graph and JSON-LD descriptions lost "as published" and "from the lit case in the window".

**Page length at 390px:** homepage 6,346px → 4,407px (7.5 → 5.2 screens); menu 18,690px → 18,535px (22.1 → 22.0 screens). Today strip (406px) and Visit (725px) unchanged in position.

## Pitch notes (not for the site)

Use these when presenting the concept; they no longer appear on the pages.

- **The menu case:** the lit, framed menu case hangs on the pier between the orchid windows, so passers-by can read it from the pavement. The homepage teaser and the whole menu page are drawn as that case ("The case on the pier, between the orchids, at 10 Red Lion Street"). The five teaser dishes are at Matsuba's published prices.
- **The walk:** from the bar to the far slat wall, where you book. The slat wall's front layer steps down a slat at a time; "this is as far as the room goes, and where you book." The booking panel was framed as "At the far wall", and collection as "At the door".
- **Room details behind the stop cards:** glasses hang upturned beneath a perforated metal canopy, with a shelf of sake along the top; black swing-arm lamps reach out over the tables with fairy lights strung in swags between them, tables in single file along the banquette; booths behind perforated screens, white marble-look tables and black pebble chopstick rests.
- **The street:** Red Lion Street "was a narrow and winding alley", widened in the early 20th century; no. 10 is part of "the 1920s terrace of shops at nos. 8-32 (even)" (Richmond Council, *Central Richmond Conservation Area Appraisal*, 2023). The dashed winding line straightened as it scrolled in. A historic image is available, subject to the gallery's permission: F. Viner, *The Red Lion, Red Lion Street, Richmond 1904*, Orleans House Gallery, Richmond Borough Art Collection (LDORL : 03126).
- **Lion King nigiri:** "a Lion King nigiri, served on Red Lion Street" (playful; no claim about the name).
- **Menu provenance:** verbatim from matsuba.co.uk (updated 16 August 2026), spellings as published; Kids and Lunch & Early Evening transcribed from the restaurant's images.
