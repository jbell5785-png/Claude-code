# Matsuba · Concept A: "Noren"

**The concept in two lines.** You step through a split burgundy curtain into a small, warm, family-run room. Matsuba's own printed palette (burgundy, gold, brown) comes online on a washi ground, and the site gets quickly to booking, collection and a full, verbatim menu.

A speculative design proposal. Not the official Matsuba website, and not commissioned or endorsed by Matsuba.

## Files
- `index.html`: homepage (noren hero, story, signatures, bento lunch, tasting menu, collection, hours and find us)
- `menu.html`: full menu with sticky course index and deep-linkable sections
- `css/styles.css`: all styles (tokens at the top)
- `js/main.js`: progressive enhancement only (touch lift, mobile dock, course index, today's hours row, folded-card settle)
- `img/weave.svg`: fabric weave texture for the noren and the tasting cover (original, SVG turbulence)
- `img/washi.svg`: paper grain for the ground (original)
- `img/pine-needle.svg`: master of the pine-needle mark (the pages use the same drawing as an inline `<symbol>`)

Serve locally with `python3 -m http.server 8311 --directory concept-a`.

## Implementation notes

### The noren (homepage hero)
- Five panels hang from a wooden rod over an image slot of the room (an inline SVG "out of focus room": slats, sake shelf, three Edison-bulb glows, booths). All original CSS and SVG, no photos.
- **Fabric:** each panel layers a weave texture (`img/weave.svg`), broad soft fold bands (a horizontal gradient whose fold positions vary per panel through CSS custom properties), a light falloff from the top, a darker sleeve with a gold running stitch where the rod passes through, a stitched hem, and a slightly uneven hem line (`clip-path`).
- **Wordmark across the panels:** each panel holds the same five-panel-wide strip, offset by its index, so "MATSUBA" reads across the slits and each fragment moves with its own cloth. The letters sit on a fixed pitch (centres at 10% + n × 13.33%) so that every slit falls between two letters and none are sliced.
- **Part once on load:** a CSS keyframe (`noren-part`, 2.2s, centre panel first, outer panels 60 and 120ms later) swings the panels out from the rod and sways them to rest, slightly parted. It runs once and nothing loops. It doesn't need JS.
- **Lift:** hovering a panel (on hover-capable devices) swings it up and away from the rod (`perspective` + `rotateX` from a top transform-origin, 700ms, fabric easing), and horizontal crease shading fades in. Lifting a panel shows the sake shelf behind. When keyboard focus enters the hero (Book, Order, Menu, Call), all five panels lift in a stagger, like the curtain being held open for you. On touch screens a tap lifts a panel for 1.5s (`js/main.js`).
- **Never covers the actions:** the curtain sits inside the doorway figure, and Book, Order for collection and See the menu sit below it (mobile, tablet) or beside it (desktop). Measured at 390×844: Book and Order at 665–728px, See the menu at 742–786px, all in the first frame.
- **Reduced motion:** no load animation and no lift. The panels are drawn in their final, slightly parted resting state.
- The curtain is decorative (`aria-hidden`). The page's h1 is the restaurant's own line, "Pull up a chair. Take a taste. Come join us.", with a visually hidden "Matsuba." prefix.

### Layout and type
- Shippori Mincho for display and dish names, Zen Kaku Gothic New for text and UI (Google Fonts, `display=swap`, preconnects, metric-adjusted local fallbacks).
- Zen Kaku's pound sign is set wide, so a `unicode-range: U+00A3` face borrows a local Arial/Helvetica £ for that one character.
- **Working wordmark:** "MATSUBA" in wide-tracked Zen Kaku Gothic New capitals, set in our type. It is not the restaurant's logo file and doesn't redraw it.
- Section titles run vertically (`writing-mode: vertical-rl`) in a narrow sticky left rail on desktop, like a hanging scroll. On mobile they turn horizontal.
- Colour tokens: burgundy #640B35, kin #C9A15E (rules and small marks on dark only), kogecha #3F2B1C, washi #F7F3EC, sumi #1A1614, muted #5B4636 (8:1 on washi). Every text pairing passes AA. Gold text appears only on brown, burgundy or sumi (4.6:1 or better).

### Pine-needle motif: a design interpretation
"Matsuba" is ordinary Japanese for "pine needle(s)". The restaurant does not say why it chose the name, so the two-needles-joined-at-the-base mark is **our design interpretation of the word, not the restaurant's story or symbol**. It is never explained on the page. It is used sparingly: one small mark at the head of each section rail, and at the head of the menu's course index. No kanji is used for the name anywhere.

### Menu page
- Every section from the copy deck, in this order: Appetizers, Sushi & sashimi, Rolls & maki, Main a la carte, Sides & dessert, Lunch menu, Lunch & early evening, Tasting menu, Kids menu, Takeaway & collection. Deep links: `#appetizers`, `#sushi-sashimi`, `#rolls-maki`, `#mains`, `#sides-dessert`, `#lunch`, `#lunch-early-evening`, `#tasting`, `#kids`, `#takeaway`.
- Course index: vertical writing-mode labels in a sticky rail on desktop. On mobile it becomes a horizontal, scrolling, sticky index under the header. The current section is marked `aria-current` and kept in view inside the index, which never scrolls the page.
- Dishes sit in two columns from 760px (CSS multi-column, so reading order follows the DOM), with Shippori names, Zen Kaku descriptions, dotted leaders, right-aligned tabular prices and small v/vg marks (each with screen-reader text) and the key.
- Short items in the nigiri, sashimi and maki groups (e.g. "Toro · fatty tuna") are set on one line, like a ledger.
- The menu text is parsed directly from `research/copy-deck.md` by a build script kept outside the repo, so names, descriptions and prices are verbatim. The kids' and Lunch & Early Evening cards (published as images) are transcribed by hand from the copy deck. A line-by-line comparison against the copy deck found no differences.
- The tasting menu is a "folded card": a burgundy cover with a double gold rule (price, minimum 2, pre-order, Prosecco) and a washi inside leaf with all 14 dishes. On desktop the leaves are angled slightly at the crease. When the card first scrolls into view it settles open once (JS and motion allowed only; it is never closed while visible).
- The allergen line and the service/VAT line appear at the top and foot of the menu and in every footer.

### Honesty
- Hours are shown as published. Monday and the lunch end time carry the `to confirm` marker plus an HTML `[TO CONFIRM]` comment. So do the lunch-menu window ("Available between 12pm – 2:45pm") and the Lunch & Early Evening set menu (to confirm still running).
- Booking terms are stated plainly next to the hero actions and in a Booking block (`#booking`): online up to 12; more than 12 by phone; a card secures the booking and no money is taken when you book; the restaurant may charge £10 per person for less than 24 hours' notice or a no-show.
- Book and Order are plain links to the verified Favourite Table and Toast URLs (new tab, labelled as such). There is no interstitial, no fake confirmation and no `window.open`.
- How guests place the tasting-menu pre-order isn't published, so the card offers "Call to arrange" and "Book a table" and an HTML `[TO CONFIRM]` comment marks it.
- External links go only to: Favourite Table, Toast, `tel:`, `mailto:`, the official site, the current takeaway PDF on matsuba.co.uk (June 2026), the Instagram URL from the copy deck, and a Google Maps search link.
- Not used: "best sushi" claims or other superlatives, reviews or ratings (including the hygiene rating), names, the Korean heritage, the expired kids' promotion, the 2024 vegan and GF PDFs, and Harden's covers figure.

### Spellings (no corrections made)
The menu is reproduced exactly as published. **No spellings were corrected**, so the following appear as published, each [TO CONFIRM] with the owner before any correction: "Uangi Steak" (Unagi?), "Eby Fry" (Ebi?), "(all samon)", "South Amerian", "Chrispy", "shichimi chilli papper", "Yuzu Te" (Tea?), "Aperol Com Fanta", "Vanila". The homepage's Tuna Tataki description keeps the menu's "Torched-seared".

## Deviations from the brief
- **Index labels are shortened** ("Sushi", "Lunch", "Set menu", "Tasting", "Takeaway") so that ten vertical labels fit a 900px-tall desktop viewport without the rail scrolling. Section headings keep the full published names.
- **Sides & dessert follows Mains** rather than sitting last as in the brief's list, because it reads naturally there for dinner. Lunch & early evening and Takeaway are added to the index because the creative director asked for them.
- **No GSAP.** All motion is CSS with a few lines of plain JS. The tech spec allows this.
- **Hours rows:** "Monday – Friday" is split into "Monday" and "Tuesday – Friday" so the Monday marker sits on Monday alone. Times are unchanged.
- **Mobile dock:** a fixed Book / Order (20% off) / Call bar on screens narrower than 900px. On the homepage it tucks away while the hero actions are on screen. Without JS it is always visible.

## Known limitations
- The `to confirm` markers explain themselves only through a `title` tooltip and the hours note. Touch users see the marker but not the tooltip.
- Container-query units drive the noren's proportions (Chrome 105+, Safari 16+, Firefox 110+). Older browsers get a usable but less finely scaled curtain.
- The £ substitution relies on Arial, Helvetica or Liberation Sans being installed locally. Without one, Zen Kaku's wider £ shows.
- Font swap produced a cumulative layout shift of about 0.016 in testing (good is under 0.1).
- The image-slot drawings are composition sketches, not photographs, so the pages look quieter than they will with real photography.
- Toast and Favourite Table pages were not reviewed beyond the dossier. Takeaway prices that differ from dine-in are covered by linking to the PDF, not reproduced.

## Assets to replace
1. Every "Photograph to commission" slot (shot list below).
2. The working wordmark: swap for the restaurant's own logo artwork, with their permission, if they prefer it.
3. All `to confirm` items once the owner answers (hours, lunch end time, set-menu status, pre-order process, spellings).

## Photography shot list
1. **The room from the door** (hero, under the curtain): wood slats, Edison bulbs, sake bottles on the shelf, booths below. Warm evening light, framed so the curtain can hang over the top 60% of the frame.
2. **Tuna Tataki and the carpaccio:** torched edges, shredded mooli, ponzu, with the carpaccios alongside. Three-quarter angle on dark wood, low side light.
3. **A Special Roll, cut:** eight pieces in a line, side-on, so the filling shows; sauce and sprouts as served.
4. **A bento box from above:** the Matsuba Special, straight down, with every compartment filled.
5. **The stonepot bibimbap:** from above, just served, before it is mixed.
6. **Takeaway packed for collection:** an order bagged and ready on the counter by the door, in daylight.
7. **The frontage on Red Lion Street:** straight on, in daylight, so the door is easy to recognise from the pavement.
