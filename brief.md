# Brief: Caffè Mamma Ristorante, website redesign (pitch)

## Audience
- **Locals** (Richmond, Kew, North Sheen): already know it. They want tonight's hours, the phone number and a table, fast, on a phone.
- **Couples and families**: checking whether it's a good fit before they come. Kids' menu, high chairs [TO CONFIRM], price level, the courtyard.
- **Kew Gardens visitors**: often unfamiliar with Richmond, often walking. They need distance from the Gardens and the station, lunch times and the lunch deal.
- **Groups and parties**: function room for up to 58, party set menu, children's parties.
- **Takeaway customers**: pizza by phone.

## Brand personality
A family Italian that has fed Richmond since 1983 [TO CONFIRM], known as "the restaurant with the washing". Generous, unfussy and a little theatrical: Naples street life hung across a Richmond courtyard. Warm, not twee. Confident, not posh. Funny when it suits it.

## Primary actions (in order)
1. **Book a table**: date, time and party size, then hand-off to the booking system [TO CONFIRM: OpenTable or own system]. Phone for groups and same-day.
2. **See the menu**: full typeset menu with prices and dietary markers.
3. **Call**: `tel:02089488330`, one tap from every screen.
4. **Find us**: address, map link, walking times, parking.

## What must feel different from a template
- The washing line, the red script and the green are the identity. No generic "rustic Italian" stock look.
- Practical information is written in the restaurant's own voice, not "Opening Hours" boilerplate.
- Every concept has a layout logic you could name in one sentence, rather than a stack of centred sections.
- The menu is typeset like a menu, not delivered as cards.
- No hero carousel, no "Welcome to Caffè Mamma", no testimonials slider.

## Risks in this plan and how I've addressed them
| Risk | Mitigation |
|---|---|
| No photography, so the pages feel empty | Each concept is designed to work on type, colour and illustration alone. Image slots are composed and labelled with the exact shot to commission, so they read as intentional, not missing |
| Unconfirmed facts in front of the owners (hours, prices, dates) | Shown in-page with one discreet, consistent "to confirm" marker and listed in the README. Nothing is invented: no reviews, awards, staff names or new dishes |
| Booking system unknown | A front-end booking step (party, date, time) that hands off to the restaurant's OpenTable page or the phone. No fake confirmations |
| Motion gets in the way of someone checking the menu on the pavement | Book, menu and call are reachable in the first frame without motion. Animations never block reading, and reduced-motion users see the finished frame |
| The owners are attached to the 40-year-old logo | The original wordmark sits in a clearly marked logo slot in every concept. Type treatments evolve it rather than replace it |
| The three concepts drift together | They're locked to different type, grid, menu format and motion (table below) |
| The washing line tips into kitsch | Treated graphically, with lines, pegs and flat shapes, not cartoon clipart |
| Thin display type and scroll-driven colour fail contrast (Concept B) | Contrast checked at every colour stage; display type used only at sizes where AA applies |
| Font loading and layout shift | Two families per concept, `font-display: swap`, metric-adjusted fallbacks and fixed aspect ratios on all slots |

---

## Direction A: "La Carta"
**Concept.** The site is the menu card a local printer would run for a family trattoria: two inks, red and black, on white card, with notes in the margin and a waiter's red pen.

- **Type:** *Young Serif* (display: sturdy, warm, old-style, prints like letterpress) + *Instrument Sans* (text, UI and prices with tabular figures). Dish names in Young Serif; English descriptions in Instrument Sans small caps.
- **Palette:**
  - Card `#FAF8F3`: bright white card stock, deliberately not cream
  - Ink `#1C1B19`: text
  - Rosso `#C41E1A`: the logo's red, darkened to pass AA on card; used for the pen mark and the Book action
  - Basilico `#1E6B3C`: the logo green; dietary markers and links
  - Pencil `#5F5A52`: secondary text, AA on card
  - Rule `#D9D3C7`: hairlines
  - Rationale: a two-ink print job, with the brand's real colours used as a printer would.
- **Grid and spacing:** A 12-column broadsheet with a permanent **margin column** (2 columns, sticky) holding the date, today's hours, the dietary key and the course index. Content sits in a 7-column measure. Sections are separated by printers' double rules, not numbers. 8px baseline; spacing steps 8/16/24/40/64/104.
- **Menu presentation:** One continuous typeset card, two columns on desktop. Italian dish name, dotted leader, right-aligned price, English description beneath. Set menus appear as "stapled-on" slips.
- **Signature interaction: "Mark the menu".** Choose *vegetarian*, *fish*, *for the kids* or *lunch deal*. A red pen circle draws itself around every matching dish and the rest fade to pencil grey, the way a waiter marks a menu for you. The homepage hero is the day's printed sheet: today's date in Italian, today's hours and a "book for tonight" line.
- **Motion language:** ink and paper. Strokes draw (SVG stroke-dashoffset), rules extend from the left, lines of text set in one by one. No parallax, no pinning, nothing scrubbed. 250–600ms, ease-out.

## Direction B: "Sera"
**Concept.** The site is the walk back down Kew Road from the Gardens at the end of the afternoon: as you scroll the light goes gold, then blue, and the lamps come on over your table.

- **Type:** *Italiana* (display: a fine Didone with film-title poise, used large only) + *Hanken Grotesk* (text and UI). Headlines in long lowercase lines, like subtitles.
- **Palette (driven by scroll):**
  - Afternoon `#E9DDC8` (with ink `#1E1A17`) → Golden hour `#D99A55` (with ink `#1E1A17`) → Dusk `#2E2F4F` (with plaster `#F1EAE0`) → Night `#121319` (with plaster `#F1EAE0`)
  - Lamplight `#F4B54A`: bulbs, focus rings and key accents
  - Barolo `#7A1F2B`: Book action (with plaster text)
  - Rationale: colour carries time of day. The evening palette is where dinner bookings are won.
- **Grid and spacing:** Cinematic frames. Each section is a full-viewport "scene" holding one idea, with type anchored to the lower-left third like a subtitle. 6-column grid with wide 8vw margins; spacing measured in viewport heights between scenes; thin letterbox rules at top and bottom of pinned scenes.
- **Menu presentation:** One course at a time. A sticky course rail (Antipasti → Dolci) and a single course on stage, with dish names set large and descriptions quiet. Scrolling advances the course with a dissolve. Every dish is in the DOM; the rail is also a jump list.
- **Signature interaction: "Si accendono le luci".** A pinned, layered illustration of the courtyard frontage. Scroll moves the sky from late afternoon to night, the windows warm up, and a festoon of bulbs lights one by one. The last bulb lights the "Table for tonight?" booking panel.
- **Motion language:** slow, scrubbed and continuous. Scroll-tied colour and light, at most three-layer parallax depth, film-style dissolves of 1.2–1.6s, `sine.inOut`. Nothing bounces, nothing snaps.

## Direction C: "Bucato"
**Concept.** *Bucato* is Italian for the washing. The restaurant's local nickname becomes a bold typographic identity: a line strung across every page, with words pegged to it like laundry in a Naples street.

- **Type:** *Bricolage Grotesque* (display: variable weight and width, chunky and characterful, set very large and tight) + *Atkinson Hyperlegible* (text and UI: built for legibility, with its own personality).
- **Palette:**
  - Pomodoro `#D7261E`: the logo red as a flat field
  - Bucato `#FFFFFF`: white washing
  - Cielo `#CFE6F4`: a Naples sky
  - Limone `#FFD447`: accents and the lunch deal
  - Basilico `#0F6E3A`: dietary markers and the courtyard
  - Inchiostro `#161311`: text
  - Rationale: laundry colours against a sky, flat and hard-edged. Red and green keep the 40-year-old brand recognisable.
- **Grid and spacing:** A poster grid of modular colour blocks on 4/8/12 columns, with type running edge to edge and extreme scale contrast (dish names up to 3× body). Structure hangs from horizontal lines: every section begins with a line across the page and its heading pegged to it.
- **Menu presentation:** A pegged index. Section names hang as tags on a sticky line; click one to jump. Dishes are set as big, bold lines with the price on a hole-punched tag shape and dietary markers as solid glyphs. A loud, fast-scanning list, the opposite of A's quiet card.
- **Signature interaction: the washing line.** Across the hero hangs a sagging line of pegged flat garments (shirt, tea towel, apron), each carrying a word: Menu, Book, Pizza to take away, Find us. They sway in a breeze driven by cursor speed (or scroll on touch), spring back when tugged, and work as navigation. Each garment is a real link with keyboard focus.
- **Motion language:** springy and physical. Elastic and back eases, quick 150–300ms snaps, gentle looping sway, a running marquee for takeaway ("Pizza da asporto: chiamaci").

## How the three stay apart
| | A "La Carta" | B "Sera" | C "Bucato" |
|---|---|---|---|
| Concept | Printed menu card | Afternoon into evening | The washing line as identity |
| Type | Young Serif + Instrument Sans | Italiana + Hanken Grotesk | Bricolage Grotesque + Atkinson Hyperlegible |
| Ground | White card, two inks | Shifting light, ends in night | Flat primary fields |
| Layout logic | Broadsheet with sticky margin column | Full-viewport scenes | Modular poster blocks hung from lines |
| Menu | Continuous typeset card + pen-mark filter | One course on stage + course rail | Pegged tag index + oversized type list |
| Motion | Ink drawing, no scroll-tie | Scrubbed, slow, cinematic | Springy physics, sway, snaps |
| Signature | Mark the menu | The lights come on | The washing line |
