# Matsuba v2: creative brief

## Reading order for builders
1. `research/identity.md` (only-here details, palette, signature ideas)
2. `research/photo-notes.md` (what the client's Google Maps photos show)
3. `research/copy-deck.md` (the only content allowed, including the v2 addendum)
4. `../_shared/tech-spec-v2.md`, plus the round 1 spec it builds on

## Reference images
Study these for proportion, colour and detail. Never copy, trace or embed them.
- Client photos: `/tmp/claude-0/-home-user-Claude-code/e50707d5-9ec5-571e-9915-9e7145ebe50f/scratchpad/v2/client-photos/matsuba/1.jpg` to `5.jpg`
  - 1: the frontage
  - 2: the long room with dark tables
  - 3: the brick wall, swing-arm lamps and fairy-light swags
  - 4: the slat wall and swing-arm lamp
  - 5: the whole room, with the bar canopy
- Matsuba's own photos: `/tmp/claude-0/-home-user-Claude-code/e50707d5-9ec5-571e-9915-9e7145ebe50f/scratchpad/v2/matsuba/`
  - The room: `matsuba-table…jpg`, `matsuba-banner2.jpg`, `matsuba-banner4.jpg`, `matsuba-footer.jpg`, `image11…jpeg`
  - The print menus: `MATSUBA-special2026.jpg`, `ta10*.png`
  - Provenance unknown, so don't build on them: `hero132x-scaled.jpg` (the cocktails), `slider32x`, `info112x`, `page52x`, `video-3`

## The place, in one paragraph
A charcoal-slate corner shop on Red Lion Street, once "a narrow and winding alley" and now a 1920s terrace of shops, with two awnings spelling MATSUBA in widely spaced white capitals and orchids in the windows. Inside is one long, narrow room. Down one side runs an exposed red-brick wall lit by black swing-arm lamps, with fairy lights swagged between them and a cool glow behind the banquette. Down the other, and at the far end, oak slats rise in two layers, the front layer stepping down one slat at a time in a clean diagonal. Brass twin sconces throw two warm glows onto the slats. At the front is a bar under a perforated metal canopy with upturned glasses and a shelf of sake. The tables are white marble-look, set with black pebble chopstick rests. It's family-run and first opened in 2004. The menu speaks the language of fire: aburi, "flame seared", "torched-seared" Tuna Tataki.

## Brand constants (all three concepts)
- **Wordmark:** "MATSUBA" in wide-tracked geometric capitals, about 0.45em tracking, as on the awnings. Set it in each concept's own geometric face. Don't redraw the logo file.
- **Booking:** Favourite Table, `https://booking.favouritetable.com/?SiteCode=2122`. The terms are a card to secure the table and a £10 per person charge for no-shows or less than 24 hours' notice, with parties over 12 by phone.
- **Ordering:** Toast, `https://order.toasttab.com/online/matsuba-10-red-lion-street`. 20% off collection, kids' menu excluded.
- **Hours as published.** Monday and the lunch end time carry visible "to confirm" markers.
- **Never:** a noren (none exists), parasols (unverified), kanji for the name, or the family's heritage.

## Three directions
Each direction is built on different only-here details, so the three must feel like three different studios.

### A: "Under the awning" (the threshold and the long room)
- **Only-here details:** the twin-awning charcoal corner frontage; the long narrow room; the brick wall with swing-arm lamps and fairy-light swags; the lit menu case in the window; the orchids.
- **Idea:** you arrive on Red Lion Street and step in under the awning. The page itself is shaped like the room: a long, narrow corridor of content, with brick on one side margin and slats on the other, and the tables running in single file.
- **Signature, "Step inside":**
  - The hero is an original, finely drawn SVG illustration of the real corner frontage: slate paint, both awnings with the tracked MATSUBA, sash windows, orchids on the sills, and the lit menu case.
  - On load, or when you tap "Come in", the near awning's fabric lifts and rolls up like a blind. The view moves through the door into the long room.
  - Then a short, gentle scroll sequence walks down the room: the bar canopy with its hanging glasses, the brick wall where the swing-arm lamps switch on one by one and the fairy-light swags glow, then the booths, then the far slat wall, where the booking panel sits.
  - It's honest to the curtain the client liked: it is the real awning, not a noren.
  - No scroll-jacking. Keep the pin short on phones. Reduced motion shows the interior view composed as a still.
- **Menu page:** presented as the lit menu case in the window. A glowing framed panel sits on the slate frontage, and inside it the menu is typeset in the print menus' system: tracked serif capitals flanked by thin gold rules, and "• RICE SET •" style sub-heads, adapted for the web. Course tabs run along the top of the case.
- **Type:** Josefin Sans (geometric, wide-tracking-friendly: the wordmark, labels and nav) with Source Serif 4 (text and dish names).
- **Colour:**
  - Slate #263440 (frontage, main dark)
  - Awning white #F5F3EE
  - Brick #9A5B3F, as texture only
  - Bulb #F2B65A
  - Oak #B26B45
  - Check AA throughout.
- **Port:** 8511.

### B: "The stepped wall" (the oak slats)
- **Only-here details:** the two-layer slat wall with its one-slat-at-a-time diagonal; the brass twin-glow sconces; the perforated bar canopy; the white tables with black pebble rests.
- **Idea:** the wall is the system. Every section boundary, index and progress mark on the site is made of slats stepping down a diagonal, in two layers like the real wall. It's an architectural, rhythmic and restrained identity.
- **Signature, "The wall is the index":**
  - On the homepage, a full-width slat wall (pure CSS or SVG, oak on warm grey, front and back layers) forms the hero. Its stepped diagonal edge descends as you scroll, so the "step" travels down the wall as a progress indicator through the page's sections.
  - On the menu page, the slats are the course index. Each front slat is a course button, stepped down in menu order. The 14 tasting dishes are 14 slats, and focusing or hovering one lifts it and shows the dish.
  - Hover and focus states everywhere use the twin sconce: a small brass disc that lights two warm glows at either end of the active element.
  - The perforated-metal texture is a quiet background for the booking panel.
  - Reduced motion: a static stepped wall.
- **Menu page:** clean, architectural columns in white "marble" panels. Each course is a top-down table setting: a white panel, a black pebble rest and chopsticks drawn in SVG as the section mark.
- **Type:** Urbanist (geometric, close to the wordmark) with Spectral (an elegant text serif).
- **Colour:**
  - Oak #B26B45 and light oak #CF9466
  - Wall grey #8C8B86
  - Charcoal #1E2124
  - Brass #9A6E1C (glows #F6C77A)
  - Marble #F3F1EC
- **Port:** 8512.

### C: "Aburi" (fire and the printed menu)
- **Only-here details:** their flame language (eight aburi nigiri, "flame seared", "Torched-seared" Tuna Tataki, "Torch-seared" salmon, Lion King nigiri "Salmon aburi nigiri with cheddar"); their print-menu system (burgundy, gold, taupe, tracked serif heads with gold rules); the candle in its copper holder; the white tables.
- **Idea:** Matsuba's printed menus come online for the first time, and the website "sears" its signature dishes. Warm, rich and confident. The print brand (burgundy, gold, brown) becomes the web brand.
- **Signature, "Sear":**
  - Every dish the menu itself describes as aburi or seared carries a torch mark. As it scrolls into view, or on hover or focus, a small blue-tipped flame passes along the dish name and leaves the letters caramelised: a gradient from gold to deep brown, with a slight char at the edges.
  - The hero does this to "Tuna Tataki, torched-seared", their signature appetizer, set huge.
  - It's built with CSS `background-clip: text` and gradients plus a small SVG flame. It must stay readable at every frame. Reduced motion shows the seared state.
- **Menu page:** a faithful, beautiful web edition of their print menu.
  - A centred page with a thin gold border.
  - Tracked serif capitals for section heads, flanked by thin gold rules, and "• RICE SET •" style sub-heads.
  - Bold serif dish names, light italic sans descriptions, and green vg/v marks.
  - Course navigation is a set of tracked labels.
  - An "Aburi" filter shows only the seared dishes, each with its torch mark.
- **Type:** Marcellus (tracked inscriptional serif capitals, echoing the print heads) with Albert Sans (light descriptions; use italic where the print uses italic sans).
- **Colour:**
  - Burgundy #640934
  - Gold #D1A75B (on dark only, or large)
  - Brown #3F2B1C
  - Taupe #5B4A42
  - Marble #F4F2EE
  - Flame blue #3A7BD5, used only in the flame
- **Port:** 8513.

## Shared content notes
- **Copy:** "Pull up a chair. Take a taste. Come join us." is theirs; use it. "Special Rolls: large 8 piece rolls exclusively created by MATSUBA."
- **Spelling:** the menu is verbatim, and spelling fixes go only in NOTES.md, as proposals.
- **The street:** history comes from Richmond Council's conservation appraisal. Red Lion Street "was a narrow and winding alley", widened in the early 20th century, and No. 10 is in "the 1920s terrace of shops at nos. 8-32 (even)". Concept A may tell it in one line.
- **The Lion King nigiri** may be mentioned playfully, without claiming any link to the street name.
