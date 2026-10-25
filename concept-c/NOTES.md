# Concept C, "Bucato": notes

**The idea in one line:** every section hangs from a washing line strung edge to edge, with its heading pegged to it, on flat poster blocks in the dining room's own colours (blue ceiling, white cloths, yellow napkins, red shirts).

## Photography to commission

Each slot on the homepage gallery is a flat colour field with a fixed grid size, so a photo can replace it with no layout change.

| Slot (homepage, "Le foto") | Shot | Also useful for |
|---|---|---|
| A, large blue | The shirts on the line, shot from below against the blue ceiling, in lunch light | A future second hero on the story block |
| B, red, portrait | A Margherita on a white cloth, from directly above | Menu preview, Pizze course header |
| C, yellow, portrait | A yellow rose and a yellow napkin, close up | Lunch strip |
| D, green, tall | The curved staircase up to the function room | Parties block ("Le feste") |
| E, ink, landscape | The Kew Road frontage at dusk, fairy lights on, terrace laid | Find us block |
| F, red, landscape | Zabaglione, whisked to order and served hot | Dolci course header |

Brief for all of them: daylight or the room's own light, no props brought in, and real tables and plates. No staff faces until the owners agree.

## Implementation

- Files: `index.html`, `menu.html`, `img/favicon.svg` (source art for the inline favicon; all other SVG is inline so it renders without JS), `css/base.css` (tokens, tags, pegs, lines, header, dock, footer), `css/home.css`, `css/menu.css`, `js/bucato.js` (lines and motion), `js/washing-line.js` (hero physics), `js/booking.js`, `js/menu.js`. Plain HTML, CSS and JS. GSAP 3.12.5 and ScrollTrigger come from cdnjs and are optional.
- **Strung lines.** Every `[data-strung]` block draws a true catenary per row of hanging items. Each item's pegs are measured, the item is dropped so its peg sits on the line, and it is turned to the slope there. Without JS a static parabola with near-identical offsets is drawn instead.
- **Hero washing line.** Each garment is a damped spring pendulum about the midpoint of its pegs. The breeze comes from mouse speed on desktop and from scroll speed on touch screens. Hover or focus gives a garment a tug and a lift. On desktop a garment can be dragged sideways with the mouse and springs back. The rope is redrawn through every peg each frame, so the line moves with the washing. The loop sleeps at rest and when the hero is off screen, with a gentle gust every 5 to 9 seconds. Touch handlers are passive and never call `preventDefault`, so scrolling always wins. Each garment is a real `<a>` with a visible focus ring. Without JS, or with reduced motion, the garments hang still at slope-matched angles. CSS does this alone using `atan2()` and container units.
- **To confirm.** Every uncertain fact uses `<span class="tbc" title="To be confirmed with the restaurant">to confirm</span>`: 17 on the homepage and 18 on the menu. Each one sits next to a `<!-- [TO CONFIRM] ... -->` comment, so `grep -n "TO CONFIRM"` lists them all.
- **Logo.** The header and footer use a working wordmark set in Bricolage Grotesque, inside a labelled logo slot. Please supply the original red script and green stroke as vector art.
- **Menu.** Every dish and set menu in the copy deck is on `menu.html`, using the deck's spelling. The site's old spellings are corrected: Bruchetta → Bruschetta, Mortadela → Mortadella, Bisteca → Bistecca, "al griglia" → "alla griglia". V markers are inferred from dish names and flagged with one page-level note. Dishes with unknown prices show a "Price" tag with a to-confirm tag under it.
- **Booking.** Party size (1–8, plus "9 or more: please call"), date and time (12 noon to 10pm, every 30 minutes). A live summary sits above the button. "Check availability" opens OpenTable in a new tab, and nothing claims a booking has been made. Without JS the form stays hidden, and the plain OpenTable and phone links below it remain.
- **Fallback fonts.** The metric overrides were measured against Arial in Chromium: Bricolage `size-adjust` 90.4%, Atkinson 96.5%.
- **Contrast** (all pass AA): white on Pomodoro 5.02:1, white on Soffitto 10.09:1, ink on Tovagliolo 11.81:1, white on Basilico 6.34:1, Basilico on white 6.34:1. Ink is never set on Pomodoro (3.69:1), and red is never set on yellow.
