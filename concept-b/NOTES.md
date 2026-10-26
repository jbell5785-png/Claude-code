# Concept B, "Sera": notes

## Page order (revised for the "Useful first" standard and the voice rule)

**Home:** hero (name and descriptor, "Table for tonight?", today's status, address with map link, Book a table, See the menu) → Visit (opening hours, last orders, booking) → From the menu (five priced pastas with £, V marks, allergen line, links to the full menu) → Find us (address, map, train, Kew Gardens, parking, step-free access) → Lunch & takeaway → Our story → Private parties → Book a table → footer.

**Menu:** intro with today's status, address and Book; legend, allergen statement, prices and service-charge lines at the top; sticky "On this menu" course rail; every course in normal flow with a "Back to top" link; booking and takeaway at the end.

**Measured at 390×844** (document height ÷ 844): home 13.0 screens with motion (11.9 reduced motion, 11.6 no JS) before, now 8.1 (7.6 reduced motion, 7.3 no JS). Menu 13.2 before, now 11.6. Opening hours start at 874 px (1,296 px with motion, because of the half-screen pin), and the first priced dish sits at 1,396 px (1,818 px with motion).

## How the signature works ("the lights come on")
- The hero is an inline SVG of the frontage (generated once from my own drawing script, then inlined, so CSS custom properties can drive it). Its layers are sky, a far layer (roofline and tree), the buildings (with the glazing interior and the festoon), and the foreground planting. Only the far and front layers move, to give the parallax depth.
- **Only the picture changes.** The night band underneath holds the essentials as static HTML: name and descriptor, "Table for tonight?", today's status, the address and map link, Book a table and See the menu. It never fades, moves, swaps text or changes colour, in any mode. The old hero lines ("Kew Road, late afternoon." / "Upstairs, the shirts are on the line.") and their 1.3 s dissolve into "Table for tonight?" are gone, so nothing overprints.
- The band comes before the SVG in the source and the hero is a two-row grid, so the essentials paint first and keep their place while the 80 KB drawing streams in.
- A GSAP ScrollTrigger pins the hero and scrubs one progress value. JS interpolates about 40 colour and opacity variables across four keyframes (afternoon, golden, dusk, night): sky, sun, glass reflections, the warm wash, the night shade, then the interior glow, the shirts' silhouettes and the lit windows. Then the 18 bulbs switch on one by one, each with a soft radial halo; no filters are animated.
- **Pin length: 0.5 of a screen on phones, 1.1 on desktop** (was 1.1 and 1.7). The distance is reserved from first paint as the hero's bottom margin (`html.motion .hero`), and the pin runs with `pinSpacing: false`, so nothing jumps when GSAP arrives (CLS stays at 0). On short landscape screens it doesn't pin and shows the lit frame.
- **Plays once, then rests.** Progress only moves forward: scroll back up and the lamps stay on. The infinite bulb flicker (9–13 s loops) was removed, so nothing loops without a pause control.
- Portrait is composed for portrait rather than scaled down: container-query units crop to the sign, the glazing and the lights.
- With no JS, or with reduced motion, the static night frame shows, fully lit. The band is identical in every mode.
- "All hours & directions" in the hero jumps straight to the Visit block, past the pin; the bar and header reach Book, Menu and Find us without touching it.

## Page light and contrast
- The scroll-driven page palette is gone. Each section now paints its own stage in every mode, running afternoon → night down the page: Visit afternoon, taster 0.2, Find us and Lunch 0.6, Our story golden, Private parties dusk, Book a table night. Each section's empty lead-in fades from the previous stage, with no text in the fade.
- This removes the old sub-AA transient (the golden↔dusk midpoint, #846452, 3.2:1 and 4.48:1) and stops body-text colour changing under the reader. Every stage passes AA for both inks (worst: ink 7.2:1 and soft ink 4.9:1 on golden; plaster 10.8:1 and soft 6.2:1 on dusk).
- The "to confirm" marker, the V glyph and focus rings use `--accent`: lamplight on dark stages, ink on light ones. Focus rings are lamplight sandwiched in ink, so they stay visible on every stage.

## Today's status
- A small inline script after the hero (and in the menu intro) works out London time and writes "Open now, until 11pm", "Open today, 12 noon – 11pm" or "Closed now, open tomorrow from 12 noon", before first paint. Without JS the line reads "Open 7 days, 12 noon – 11pm". It always carries the "to confirm" marker, because the hours come from the door decal (OpenTable shows 12:00–22:00, probably last bookings).
- Last orders, kitchen times, step-free access and the service charge are not published anywhere; they show "to confirm" rather than a guess.

## Other implementation notes
- Fonts: Italiana (display, ≥ 32px only) and Hanken Grotesk. Metric-adjusted local fallbacks were measured with fontTools against the actual web fonts (English letter frequency): Arial/Liberation Sans, DejaVu Sans and Noto Sans for Hanken (separate regular and bold faces); Times New Roman/Liberation Serif, DejaVu Serif and Noto Serif for Italiana.
- `html { scroll-padding-bottom }` matches the action bar (64 px + 8) on every page, so focused links and anchor targets never land under it.
- The action bar is Call · Find us · Book a table; Menu is in the header on phones and in the hero.
- The menu page is night throughout. The sticky course rail ("On this menu") sets `aria-current="location"` via IntersectionObserver and keeps itself scrolled on phones. The desktop opacity scrub on courses was removed (text sat at 18% opacity as it entered, which failed contrast); the menu page no longer loads GSAP.
- Booking: party (1–8, 9 or more → call), date and time (12 noon–10pm, 30-minute steps). Then an in-page summary, and OpenTable opens in a new tab with a fallback link. Without JS, plain OpenTable and phone links show.
- Italiana's "110" reads like "IIO", so the address number is always set in Hanken, never in a headline.
- `img/frontage.svg` is the source art; its colours come from `css/home.css`, so open it through `index.html`, not on its own. `img/still-*.svg` are no longer used on the pages (they were the line motifs in the photo placeholders).
- Dish names are spelled exactly as in the copy deck, including the corrected spellings (Bruschetta, Mortadella, Bistecca, alla griglia).

## Pitch notes (not for the site)

Use these when presenting the concept; they no longer appear on the pages.

- **The idea in one line:** the walk back down Kew Road from the Gardens at the end of the afternoon. As you scroll, the light goes gold, then blue, and the lamps come on. ("Si accendono le luci.")
- **What the page used to say about itself:** the hero swapped "Kew Road, late afternoon." and "Upstairs, the shirts are on the line." before "Table for tonight?" arrived with the last bulb. The menu taster was labelled "One course, on stage"; the menu page was titled "one course at a time." with "Use the rail to jump to a course." Those lines explained the design, so they are cut.
- **The stills strip ("Stills to commission: the frames we'd shoot first. No photography yet, so every frame here is composed and captioned with the shot to commission.")** was cut from the home page, along with the two "Photo to commission" frames in the story and private-parties sections. The shot list below still applies; when the photographs exist, the strip and the two frames can return with real images and no captions about commissioning.
- **The route sketch** in the lunch section (Kew Gardens at the top of Kew Road, Caffè Mamma at number 110, Richmond Station beyond; "Route sketch, not to scale"; labels "a walk down Kew Road / time to confirm / KEW ROAD") was an annotated diagram, so it is cut. The same facts are in Find us.
- **The dining room, in full** (cut to one sentence in "Our story"): the line runs across the dining room under a deep-blue ceiling, hung with sports shirts, over white cloths, yellow napkins and a yellow rose on every table. The story's timeline row ("Hill Street, 1983 · Rocks Lane, Barnes, 2004 · Kew Road, 2006") duplicated the paragraph and was cut; Mamma Ristorante on Rocks Lane, Barnes (2004), adding meat and fish to the pasta, is the fuller version.
- **Logo:** the script "Caffè Mamma" on the illustrated fascia (`img/frontage.svg`) is a stand-in drawn for this concept, not the original logo; the header and footer use Italiana as a working wordmark. The footer used to carry a labelled "Logo slot: original wordmark goes here". The original red script, green stroke and spaced RISTORANTE should be supplied as vector art and replace the stand-in on the fascia and the wordmark.
- **Source notes that were visible on the menu:** "From a third-party listing" (the Insalate course) is now a "to confirm" marker with an HTML comment. The lunch price (£11.95 or £18.95) and the online offer (10% here, 20% Sunday to Friday on another page of the current site) conflict on the current site; both stay "to confirm".
- **Footer navigation** to Concepts A and C ("Concept B of three") was pitch navigation, not something a diner needs; it is replaced by Book a table, the menu and Find us. The footer keeps the line saying this is a speculative design proposal and not the official site.

## Photography to commission

| # | Shot | Ratio | Where it goes |
|---|---|---|---|
| 1 | Int. dining room, lunch light. The shirts on the line, shot from below, with the deep-blue ceiling behind | 4:5 | Home, Our story |
| 2 | Ext. Kew Road, golden hour. The whole frontage from across the road: glass storey, cream sign, terrace laid for dinner | 2.39:1 | Home, stills strip (1) |
| 3 | Close. A table, evening. White cloth, yellow napkins and the yellow rose, lit by one pendant | 4:5 | Home, stills strip (2) |
| 4 | Int. dining room, lunch. The length of the room, the line of shirts running across under the blue ceiling | 16:9 | Home, stills strip (3) |
| 5 | Int. staircase. The curved staircase up to the function room, from the foot of the stairs | 4:5 | Home, stills strip (4) |
| 6 | Ext. the terrace, night. The coloured fairy lights on along the shopfront, a table for two beneath them | 2.39:1 | Home, stills strip (5) |
| 7 | Int. function room, early evening. The room upstairs laid for a party, from the top of the staircase | 16:9 (4:3 crop on phones) | Home, private parties |

Shoot the exteriors in the real light they name (golden hour, blue hour) so the photos sit naturally beside the afternoon-to-night palette.
