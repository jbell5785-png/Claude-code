# Chez Lindsay: creative brief

Sources: `research/dossier.md` and `research/copy-deck.md` (researched 25 October 2026). The copy deck is the only content a designer may use.

## The business
- **What it is:** a Breton restaurant and wine bar at 11 Hill Rise, Richmond TW10 6UQ, at the foot of Richmond Hill by the bridge. It has been "part of the landscape on Hill Rise" since 1988.
- **Food and drink:**
  - Buckwheat galettes cooked to order on a flat griddle, sweet crêpes (flambéed if you like), seafood, oysters, and a French carte in the evening.
  - Breton cider by the glass, pitcher or bottle; Kir Breton; Calvados.
- **Ownership:** the lease changed hands in July 2024. The new operator is private and is not to be named.
- **Positioning:** a long-standing independent neighbourhood restaurant that is also a wine bar, with clear weekly rituals: Wednesday steak night, Sunday brunch, and a weekday happy hour of oysters and crémant.

## Audience (inference)
- Richmond locals, regular and loyal.
- Couples and friends before or after the theatre, cinema or the river.
- Families at weekend lunch (galettes and crêpes).
- Visitors walking between the station, the bridge and Richmond Hill.
- People organising a party for 12 to 40 in the first-floor room.

## Confirmed details
- **Contact:** 020 8948 7473 · restaurant@chez-lindsay.co.uk · @chez_lindsay
- **Hours:**
  - Mon and Wed–Sat 12 noon–10pm; Sun 12 noon–9pm; **closed Tuesday**.
  - Lunch 12–5pm: set lunch and galettes only. From 5pm: the carte and desserts.
  - Steak night: Wed from 5pm. Sunday brunch: 12–5pm. Happy hour: Mon–Fri 4–6pm.
- **Booking:** OpenTable, restaurant ID 93306.
  - Use `https://www.opentable.co.uk/restref/client/?rid=93306` as the hand-off. This URL is built from their published widget ID, so mark it [TO CONFIRM].
  - Always offer phone and email alongside.

## Keep from the current site
- Plain navigation and a prominent phone number.
- Current, frequently updated menus.
- Warm French touches in the copy ("Bienvenue", "Bon appétit!").
- The olive-and-cream colouring and hand-drawn script logo as brand equity.

## Opportunities (evidence in the dossier)
1. **Not built for phones:**
   - There's no viewport meta tag and the layout is a fixed 1000px, so at 390px it overflows by 610px and the logo is clipped.
   - There are no tap-to-call links.
   - Tap targets are about 21px tall.
2. **Menus are PDF-only** (six of them), and four links still point to 2024 versions.
3. **Hours are confusing:**
   - They're not on the homepage, and the site says "Toujours Ouvert!" and "open all day, every day" while closing on Tuesdays.
   - The lunch/evening menu split is explained only in a booking note.
4. **Generic page titles** ("Home", "BOOK ONLINE") and weak search metadata.
5. **Booking depends on an embedded widget** with no visible fallback link.

## Visitor actions (priority order)
1. Book a table (OpenTable, phone, email).
2. See what's served right now: lunch or evening, today's offer.
3. Read the menus (HTML, not PDF).
4. Find it (Hill Rise, 10 minutes from the station, the NCP on Paradise Road).
5. Enquire about the private room.

## Brand material
- **Existing:**
  - Hand-drawn brush-script logo "Chez Lindsay" over spaced "RESTAURANT & WINE BAR" (use a labelled logo slot or a working wordmark).
  - Colours: cream #F2EFE6, dark olive #2D2E1B; promo orange #F75E12 and pale aqua.
  - Gill Sans.
- No photographs may be copied. Shots to commission: a galette on the griddle, a complète folded with its yolk, a crêpe flambéed at the table, an oyster plate with crémant, a cider pitcher, the room, the first-floor private room, and the frontage on Hill Rise.

## Constraints
- **Content:**
  - Use menus exactly as published. Spellings marked [sic] may be shown corrected only if NOTES.md lists each correction, flagged [TO CONFIRM].
  - Set lunch: show only the course prices (two courses £24.50, three £28.50) and the supplements, because the per-dish figures are unexplained.
  - Do not use press quotes or reviews.
  - Do not state "gluten-free". Use the restaurant's allergen line on every menu view.
- **Brunch:** the £31.5 price is per person or per two [TO CONFIRM]. Show it as published with the marker.
- **Accessibility, privacy and operations:**
  - No tracking.
  - No booking may be presented as confirmed.
  - Step-free access is unknown, so don't claim it.

## Commercial purpose
Show the new owners what a phone-first site could do: menus you can read on a phone, hours and today's service at a glance, one-tap booking and calling. It should keep the 37-year neighbourhood identity they bought into while making it feel cared for again.

---

## Three directions

Each concept uses its own fonts and palette, and none reuses Caffè Mamma choices.

### A: "Ce midi, ce soir" (the service clock)
- **Idea:** the site always knows what Chez Lindsay is serving right now: the set lunch and galettes, happy hour, the evening carte, steak night, Sunday brunch, or "fermé le mardi". It's a calm, classic French bistro site that evolves the restaurant's own olive and cream.
- **Why it suits:** the real confusion is the lunch/evening split, the Tuesday closure and the weekly rituals. Solving that is the most useful thing a new site could do.
- **Type:**
  - Gilda Display for headlines and dish names (French, classical, refined).
  - Jost for text and UI (geometric, a respectful nod to the Gill Sans they use now).
  - Prices in Jost with tabular figures.
- **Colour:**
  - Olive #2D2E1B for text and dark bands
  - Linen #F2EFE6 ground (their own cream, kept as heritage)
  - Bordeaux #7A2131 for Book and active states
  - Cidre #C98A2E for small accents on dark only
  - Chalk #FFFFFF
  - Check every pair for AA.
- **Layout:** a classic brasserie menu-board logic. A wide central "board" carries the content, flanked by narrow side rails for the hours and the service clock on desktop; on mobile it's a single column with a sticky "Now serving" bar. Rules are fine double hairlines in olive.
- **Signature, "L'horloge du service":**
  - A clock dial (SVG) divides the day into services:
    - Lunch 12–5pm: galettes and set lunch
    - Happy hour 4–6pm, Mon–Fri
    - Evening from 5pm: the carte; on Wednesday, steak night
    - Sunday brunch 12–5pm
    - Closed all Tuesday
  - The hand points to the current London time and the dial names the current service and its menu, with a link to it.
  - Visitors can pick another day and time ("Saturday, 7.30pm") to see what will be on.
  - Built with plain JS and `Intl` in Europe/London. Fully keyboard operable, and a text summary is always present.
  - No JS: a static weekly service table.
- **Menu page:** tabs (real `role="tablist"`) for Galettes · Set lunch · La carte · Desserts & crêpes · Steak night · Les vins. The clock pre-selects the tab that's on now. Typeset menu-board style with dish names in Gilda Display and descriptions in Jost.
- **Motion:** almost none. The clock hand eases to its time once (600ms), and tab panels cross-fade (200ms).
- **Mobile:**
  - A sticky top bar: "Now: Galettes & set lunch · until 5pm" plus Book and Call.
  - The dial becomes a horizontal timeline strip.
- **Port:** 8301.

### B: "Marée" (Brittany coast, Richmond's tidal Thames)
- **Idea:** a seafood-and-cider restaurant from the Breton coast, sitting on the tidal Thames. A cool maritime editorial built like an old coastal chart and a fishmonger's slate.
- **Why it suits:** seafood, oysters, fish soup, crémant and cider carry the menu, and the Thames at Richmond is tidal. This gives the restaurant a fresher, more grown-up evening identity than "pancake house".
- **Type:** Bodoni Moda for headlines (engraved-chart elegance, high contrast) and Karla for text and UI.
- **Colour:**
  - Atlantique #12294A
  - Écume (foam) #F3F5F2
  - Verre de mer (sea-glass) #9CC3B5
  - Rouge #C2362B, used sparingly
  - Sable #D8CAB0
- **Layout:** an asymmetric chart composition on a 12-column grid. Fine coordinate-style ruled grids are used as texture, with content blocks set off-axis like chart legends and cartouches. Marinière stripes appear only as thin structural rules, never as wallpaper.
- **Signature, "La boussole" (the compass):**
  - On the menu page, a compass-rose control filters the carte and galettes by Mer (fish and seafood), Terre (meat), Potager (dishes the restaurant itself labels vegetarian) and Sucré (crêpes and desserts).
  - Tag dishes strictly from their published names and descriptions. Where a dish is ambiguous, leave it untagged, and say so in NOTES.md.
  - On activation, fine rhumb lines draw from the compass to each matching section heading, and non-matching dishes collapse to a single readable line rather than disappearing.
  - Accessible `aria-pressed` buttons and a live count.
  - No JS: the full menu shows, grouped normally.
- **Homepage:**
  - An "Ce soir / at high tide" evening-led hero.
  - The happy-hour oysters and crémant block.
  - A cider and wine panel.
  - The private room.
  - Getting here: a stylised, clearly not-to-scale route sketch from the station to Hill Rise and the bridge.
- **Motion:** slow, tidal easing. Section rules draw in like soundings. Gentle 0.8–1.2s fades. No scroll-scrubbing.
- **Mobile:** the compass becomes a sticky four-way segmented control at the top of the menu; the hero becomes a tall chart cartouche.
- **Port:** 8302.

### C: "Le Billig" (the griddle and the fold)
- **Idea:** everything starts on the billig, the flat round griddle where every galette is cooked to order. It's a bold graphic identity built from the circle of batter and the square fold of a galette complète. It's a loud, joyful, lunchtime-and-family site.
- **Why it suits:** galettes are the speciality and served every day until 5pm. Families, walkers and weekend brunch need an energetic, appetite-first site.
- **Type:**
  - Archivo (variable width and weight): display set very wide and heavy, labels condensed.
  - Literata for menu descriptions and text, a bookish warmth against the bold sans.
- **Colour:**
  - Billig (cast-iron black) #1B1714
  - Sarrasin (buckwheat) #8B5A2B
  - Jaune d'œuf #F5B731
  - Farine (flour white) #FBF8F2
  - Cidre vert #2F6B3F for vegetarian marks
- **Layout:** built from circles and squares. Major sections alternate between a circular composition (a large disc behind the heading, the griddle) and a square fold composition (content framed by four folded "flaps"). A modular 8-column grid. Generous, punchy scale contrasts.
- **Signature, "La pliure" (the fold):**
  - The hero is a large buckwheat disc. Once, on load, its four edges fold inward to make a square, revealing the yolk at the centre, which becomes the Book button.
  - Built with CSS 3D transforms or SVG. The folded square is the resting state, and reduced motion and no-JS show it already folded.
- **Menu page:** the galettes come first. Each galette row expands, by click, tap or keyboard, into a small "anatomy" diagram showing its published fillings arranged in the fold square, labelled with words only from the menu text. Below that come desserts and crêpes, set lunch, the carte and drinks, with section headers set in huge wide Archivo.
- **Motion:** quick and tactile: the fold (900ms, one time), rows expanding (200ms), hover tilt on the disc.
- **Mobile:** the fold hero fills the first screen with Book (the yolk) and Call reachable. A sticky bottom bar holds Book, Menu and Call.
- **Port:** 8303.
