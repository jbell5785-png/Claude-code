# Concept C, "Bucato": notes

## Revision, 27 October 2026: Useful-first and Voice passes

**Useful first** (against `pipeline/research/information-hierarchy.md` §b and the audit's fixes for C):

- **First screen (390×660):** the line on phones is now one row of three garments (Menu, Book, Find us). Directly under it, outside the moving line, sits a static **Today** panel: status ("Open now, until 11pm" / "Opens today at 12 noon" / "Closed now, opens tomorrow at 12 noon", worked out in Europe/London time by a tiny inline script before first paint), the short address with a Directions link, and "Italian restaurant and pizza takeaway · 5 minutes' walk from Richmond Station". Without JS the panel reads "Open every day, 12 noon – 11pm". The hours carry the to-confirm marker everywhere.
- **Labels:** English leads on every shirt, hangtag and the bar (Book · *prenota*, Find us · *dove*, Lunch · *pranzo*, Parties · *feste*); the Italian stays as the small second line. The menu's sticky index is in English ("On this menu": Starters, Salads, Pasta, Pizza, Meat, Fish, Desserts, Set menus, Drinks); course headings keep the Italian with the English beneath.
- **Visit block second:** a full week's hours table (today's row highlighted), last orders (to confirm), address, Directions, train, Kew Gardens, parking, step-free access (to confirm) and the booking line with the phone number. Lunch, takeaway and parties sit as plain links under the headline on phones, where those three garments are not hung.
- **Priced taster:** five dishes with £ prices and V marks; the first price lands at about 1,690 px at 390 wide.
- **Action bar:** home is Book · Menu · Find us; the menu page is Book · Call · Find us. `html { scroll-padding-bottom: dock height + 8px + safe area }` below 900 px, so focused links and anchors never land under it.
- **Motion (WCAG 2.2.2):** the recurring gust (every 5–9 s) is gone. The washing swings in on load and is settled within 3 s; after that it only moves in response to the visitor (pointer, scroll on touch, hover, focus, drag). The marquee keeps its Pause button.
- **Menu page:** today's status and address in the intro; Key (V, to confirm), an allergen statement (14 allergens, tell us when you book), "All prices in £" and service charge (to confirm) above the first course; a "Back to the top" link after the drinks.
- **Fonts:** metric-adjusted fallbacks for Arial/Helvetica/Liberation Sans, Noto Sans and DejaVu Sans, each measured in Chromium against the web fonts (Bricolage matched at its condensed display widths; ascent and descent reproduce its 1.20em line box, Atkinson's 1.24em).

## Pitch notes (not for the site)

Use these when presenting the concept; they no longer appear on the pages.

- **The idea in one line:** every section hangs from a washing line strung edge to edge, with its heading pegged to it, on flat poster blocks in the dining room's own colours (blue ceiling, white cloths, yellow napkins, red shirts). The menu is "all of it, pegged out on one line": a sticky index of course tags on a string.
- **How the hero line works (for the pitch, not the page):** each garment is a navigation link. It sways with the cursor on desktop and with scrolling on phones, lifts when tugged or focused, and springs back if dragged. On phones three garments hang (Menu, Book, Find us); on desktop all six.
- **Logo:** the header and footer use a working wordmark set in Bricolage Grotesque. Please supply the original red script and green stroke as vector art; it drops into the same slot. (The page used to say "Logo slot: original wordmark goes here".)
- **Photography to commission.** The homepage gallery ("Le foto: six photographs to commission first") has been removed from the page. The brief for each shot:

  | Shot | Use |
  |---|---|
  | The shirts on the line, shot from below against the blue ceiling, in lunch light | A second hero, or the story block |
  | A Margherita on a white cloth, from directly above | Menu taster, Pizze course header |
  | A yellow rose and a yellow napkin, close up | Lunch strip |
  | The curved staircase up to the function room | Parties block |
  | The Kew Road frontage at dusk, fairy lights on, terrace laid | Hours and find us |
  | Zabaglione, whisked to order and served hot | Dolci course header |

  Daylight or the room's own light, no props brought in, real tables and plates. No staff faces until the owners agree.
- **Schematic map (removed):** a yellow strip map, "not to scale", with callouts for Richmond Station, "5 minutes' walk", Kew Road, Caffè Mamma and "towards Kew Gardens". The same facts are now plain text in the Visit block with a Google Maps link.
- **Story, cut to its essentials:** the longer version told it year by year: 1983, Hill Street, serving pasta in a room dressed like a street in Naples, washing lines overhead and murals on the walls; 2004, a move to Rocks Lane, Barnes, as Mamma Ristorante, when main courses joined the pasta; March 2006, back to Richmond ("its spiritual home") at 110 Kew Road; today, the line hung with sports shirts under a deep-blue ceiling, white cloths, yellow napkins and a yellow rose on every table. The page keeps one paragraph and the four pegged dates. Murals credited to "Nick Smith": confirm before naming.
- **Facts the page no longer explains (kept as `[TO CONFIRM]` comments):** the Xpress Lunch price appears as both £11.95 and £18.95 on the current site; the online-booking offer is 10% Mon–Fri on one page and 20% Sun–Fri on another; the Insalate section and the Lasagne (£13.95) come from third-party listings (OpenTable) only; the seafood pizza's Italian name is unknown; opening hours come from the door decal ("open 7 days 12.00–11.00pm"), while OpenTable shows 12:00–22:00, probably last bookings.
- **Removed from the footer:** "Concept C of three" and the links to concepts A and B. The honesty line stays: a speculative design proposal, not the official site.

## Implementation

- Files: `index.html`, `menu.html`, `img/favicon.svg` (source art for the inline favicon; all other SVG is inline so it renders without JS), `css/base.css` (tokens, fallbacks, tags, pegs, lines, today line, header, dock, footer), `css/home.css`, `css/menu.css`, `js/bucato.js` (lines, today's row, marquee, drop-in motion), `js/washing-line.js` (hero physics), `js/booking.js`, `js/menu.js`. Plain HTML, CSS and JS. GSAP 3.12.5 and ScrollTrigger come from cdnjs and are optional.
- **Strung lines.** Every `[data-strung]` block draws a true catenary per row of hanging items. Each item's pegs are measured, the item is dropped so its peg sits on the line, and it is turned to the slope there. Without JS a static parabola with near-identical offsets is drawn instead.
- **Hero washing line.** Each garment is a damped spring pendulum about the midpoint of its pegs. The breeze comes from mouse speed on desktop and from scroll speed on touch screens. Hover or focus gives a garment a tug and a lift. On desktop a garment can be dragged sideways with the mouse and springs back. The rope is redrawn through every peg each frame. The arrival swing settles within 3 s and there are no automatic gusts; the loop sleeps at rest and when the hero is off screen. Garments hidden at the current width are skipped. Touch handlers are passive and never call `preventDefault`. Each garment is a real `<a>` with a visible focus ring. Without JS, or with reduced motion, the garments hang still at slope-matched angles (CSS `atan2()` and container units).
- **Today line.** An inline script right after the panel (home) and in the menu intro sets the status before first paint, so nothing shifts. `bucato.js` highlights today's row in the hours table (class only, no layout change).
- **To confirm.** Every uncertain fact uses `<span class="tbc" title="To be confirmed with the restaurant">to confirm</span>`, next to a `<!-- [TO CONFIRM] ... -->` comment, so `grep -n "TO CONFIRM"` lists them all.
- **Menu.** Every dish and set menu in the copy deck is on `menu.html`, using the deck's spelling. The site's old spellings are corrected: Bruchetta → Bruschetta, Mortadela → Mortadella, Bisteca → Bistecca, "al griglia" → "alla griglia". V markers are inferred from dish names and carry one page-level to-confirm marker. Dishes with unknown prices show a "Price" tag with a to-confirm tag under it.
- **Booking.** Party size (1–8, plus "9 or more: please call"), date and time (12 noon to 10pm, every 30 minutes). A live summary sits above the button. "Check availability" opens OpenTable in a new tab, and nothing claims a booking has been made. Without JS the form stays hidden, and the plain OpenTable and phone links below it remain.
- **Contrast** (all pass AA): white on Pomodoro 5.02:1, white on Soffitto 10.09:1, ink on Tovagliolo 11.81:1, white on Basilico 6.34:1, Basilico on white 6.34:1. Ink is never set on Pomodoro (3.69:1), and red is never set on yellow.
