# Concept B, "Sera": notes

The walk back down Kew Road from the Gardens at the end of the afternoon. As you scroll, the light goes gold, then blue, and the lamps come on.

## Photography to commission

| # | Shot | Ratio | Where it goes |
|---|---|---|---|
| 1 | Int. dining room, lunch light. The shirts on the line, shot from below, with the deep-blue ceiling behind | 4:5 | Home, story scene |
| 2 | Ext. Kew Road, golden hour. The whole frontage from across the road: glass storey, cream sign, terrace laid for dinner | 2.39:1 | Home, stills strip (1) |
| 3 | Close. A table, evening. White cloth, yellow napkins and the yellow rose, lit by one pendant | 4:5 | Home, stills strip (2) |
| 4 | Int. dining room, lunch. The length of the room, the line of shirts running across under the blue ceiling | 16:9 | Home, stills strip (3) |
| 5 | Int. staircase. The curved staircase up to the function room, from the foot of the stairs | 4:5 | Home, stills strip (4) |
| 6 | Ext. the terrace, night. The coloured fairy lights on along the shopfront, a table for two beneath them | 2.39:1 | Home, stills strip (5) |
| 7 | Int. function room, early evening. The room upstairs laid for a party, from the top of the staircase | 16:9 (4:3 crop on phones) | Home, private parties |

Shoot the exteriors in the real light they name (golden hour, blue hour) so the photos can sit inside the scroll-driven palette.

## Logo
- The script "Caffè Mamma" on the illustrated fascia (`img/frontage.svg`) is a **stand-in drawn for this concept**, not the original logo. The header uses Italiana as a working wordmark.
- Both pages have a labelled logo slot in the footer ("Original wordmark goes here"). The original red script, green stroke and spaced RISTORANTE should be supplied as **vector art** and replace the stand-in on the fascia and in the slot.

## How the signature works ("Si accendono le luci")
- The hero is an inline SVG of the frontage (generated once from my own drawing script, then inlined, so CSS custom properties can drive it). Its layers are sky, a far layer (roofline and tree), the buildings (with the glazing interior and the festoon), and the foreground planting. Only the far and front layers move, to give the parallax depth.
- A GSAP ScrollTrigger pins the hero and scrubs one progress value. JS interpolates about 40 colour and opacity variables across four keyframes (afternoon, golden, dusk, night): sky, sun, glass reflections, the warm wash, the night shade, then the interior glow, the shirts' silhouettes and the lit windows. Then the 18 bulbs switch on one by one, each with a soft radial halo; no filters are animated. The last bulb triggers the "Table for tonight?" line and the Book action, as a 1.3s dissolve.
- Pin length is 170% of the viewport on desktop and **110% on phones**, so it never traps a thumb. On short landscape screens it doesn't pin, and shows the night frame.
- Portrait is composed for portrait rather than scaled down: container-query units crop to the sign, the glazing and the lights.
- With no JS, or with reduced motion, the static night frame shows, fully lit, with the booking line. The tiny bulb flicker runs only in motion mode.

## Page light and contrast
- `--bg`, `--ink`, `--ink-soft`, `--accent` and `--rule` on `:root` are driven by scroll (hero progress, then each scene's lead-in zone).
- Afternoon↔golden and dusk↔night scrub continuously; every point passes AA (worst cases: ink 7.2:1, soft ink 4.9:1 on golden; plaster 10.8:1, soft 6.2:1 on dusk).
- Golden↔dusk fails AA at the midpoint for both inks (#846452: 3.2:1 and 4.48:1). So the page never rests there. It dissolves across in 1.4s (`sine.inOut`) and the ink steps at the middle. That transient is the only sub-AA moment, and it lasts under a second.
- The "to confirm" marker, the V glyph and focus rings use `--accent`: lamplight on dark stages, ink on light ones. Focus rings are lamplight sandwiched in ink, so they stay visible on every stage.
- Static mode: each scene paints its own stage colour, and its empty lead-in fades from the previous stage. Stages: hero night, story afternoon, menu 0.6, lunch 0.2, stills golden, parties dusk, booking and find us night. Lunch is deliberately a touch brighter than the menu scene before it: it's the "lunch light" scene.

## Other implementation notes
- Fonts: Italiana (display, ≥ 32px only) and Hanken Grotesk, with metric-adjusted local fallbacks (approximate overrides).
- The menu page is night throughout. A sticky course rail sets `aria-current="location"` via IntersectionObserver and keeps itself scrolled on phones. Courses cross-dissolve with a scrubbed opacity on desktop only. All dishes stay in normal flow.
- Booking: party (1–8, 9 or more → call), date and time (12 noon–10pm, 30-minute steps). Then an in-page summary, and OpenTable opens in a new tab with a fallback link. Without JS, plain OpenTable and phone links show.
- `img/still-*.svg` are line motifs inside the image slots (lazy-loaded).
- Italiana's "110" reads like "IIO", so the address number is always set in Hanken, never in a headline.
- `img/frontage.svg` is the source art; its colours come from `css/home.css`, so open it through `index.html`, not on its own.
- Dish names are spelled exactly as in the copy deck, including the corrected spellings (Bruschetta, Mortadella, Bistecca, alla griglia).
