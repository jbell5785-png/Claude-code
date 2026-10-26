# Matsuba v2, Concept A: "Under the awning"

**The concept in two lines.** You arrive at the slate corner of Red Lion Street. The near awning rolls up like a blind, you go through the glazed door, and you walk down the long room: the bar, then the brick wall with its lamps, then the booths, then the far slat wall, where you book. After that the page *is* the room: one narrow corridor of content with oak slats down the left margin and brick down the right, and the sections run in single file like the tables.

Port 8511: `python3 -m http.server 8511 --directory richmond-sprint-v2/matsuba/concept-a`

---

## The signature: "Step inside"

**Built on:** the twin-awning, slate-painted corner frontage (client photo 1, uploaded by "Matsuba"; identity.md §1.2) and the long, narrow room (client photos 2, 3 and 5; site `matsuba-footer.jpg`; identity.md §1.5). It answers the client's curtain idea honestly: the fabric that lifts is Matsuba's **real awning**, not a noren (identity.md §3).

**How it works** (`js/walk.js`, plain JS, no library):
1. **Frontage.** An original SVG elevation of the corner at dusk (`#frontage`). On load the window lights and the menu case warm up with a short flicker, and the near awning lifts a little and settles, as a hint.
2. **The awning rolls up.** Over the first third of a screen of scroll (or on tapping **Come in**), the near awning's fabric scales up into a roll tube at its rail. Its shadow lifts off the glass and the windows brighten. The corner awning stays down.
3. **Through the door.** The SVG `viewBox` zooms into the glazed door, and the interior drawing appears clipped to the door glass's on-screen rectangle. The clip then opens to full screen, so you literally see the room through the door before you enter it.
4. **The walk.** A one-point-perspective drawing of the room (`#room`) stays pinned with `position: sticky` while four short cards scroll past. A camera, which is just `viewBox` interpolation, moves bar canopy → brick wall → booths → far slat wall. Between the bar and the brick wall, the four swing-arm lamps **switch on one by one**, their light pools land on the tables, the fairy-light swags glow as both of their lamps come on, and the room's dimmer lifts.
5. **Booking at the far wall.** The last card hands over to the booking section, which opens on the same stepped slat wall.

**Rules kept:** no scroll-jacking (the page scrolls natively and the drawing follows it). "Come in" is a smooth `scrollTo` and moves focus to the first card. On phones the sequence is about four screens, and every card is readable text in the DOM. The action bar (Book, Order, Menu, Call) stays fixed throughout. **Reduced motion, or no JS:** the frontage rests lit with the awning down, the room is shown whole and fully lit as a composed still, and the four cards follow as a plain list.

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
- **Files:** `index.html`, `menu.html`, `css/site.css`, `css/menu.css`, `js/site.js` (header, swags, booking hand-off), `js/walk.js` (signature), `js/menu.js` (tabs), `img/` (favicon, frontage, tiles, grain).
- **No layout shift:** the hero art, room still, slot and swags all have fixed aspect ratios or heights. The booking status line reserves no space until it is used, and it sits below the button.
- **Type:** Josefin Sans (wordmark, labels, nav: wide tracking as on the awnings) and Source Serif 4 (text, dish names; optical sizing on; old-style figures in running text, lining tabular figures for prices). Metric-adjusted local fallbacks are defined.
- **Colour and contrast** (checked): awning white on slate is 11.5:1; bulb `#F2B65A` on slate is 7.1:1; muted `#b3bcc1` on slate is above 5.9:1; ink on paper is 13.7:1; gold text `#7f5410` on paper is 6.2:1; vg green `#2c7a2f` on paper is 5.0:1. Oak `#B26B45` and brick `#9A5B3F` are used only as texture or decoration.
- **Accessibility:**
  - skip link, landmarks and a logical heading order
  - both drawings have `<title>` and `<desc>`
  - `:focus-visible` rings
  - the menu tabs follow the ARIA tabs pattern (arrow keys, Home and End; the hash deep-links to a course); without JS every course shows in order and the tabs are jump links
  - tap targets are 44px or more
  - the action bar is a labelled `<nav>`
- **Booking:** the form's party size is not sent anywhere. Submitting opens `https://booking.favouritetable.com/?SiteCode=2122` in a new tab (`opener` nulled) and states plainly that nothing is booked until the guest confirms it there. If `window.open` is blocked, a visible link appears instead. Choosing "13 or more" points to the phone, as Matsuba's terms say. The terms are quoted verbatim. Without JS, the form submits as a GET to the same URL in a new tab.
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
