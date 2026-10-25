# Matsuba, Concept B: "Counter"

**In two lines:** the moody evening view of Matsuba. A cedar-dark site lit by amber Edison bulbs, built on a grid of thin timber-slat rules, where the £100 tasting menu runs course by course along a horizontal "omakase rail".

Speculative proposal only. Not the official Matsuba website, and not commissioned or endorsed by Matsuba. Every page footer says so and links to https://matsuba.co.uk/.

## Files
- `index.html`: home. Hero (wordmark, line, Book / Order / Menu), Omakase rail, Signatures, The room, Lunch bento (daytime band), Takeaway, Visit (hours, find us, booking terms), footer.
- `menu.html`: the full dine-in menu, one long dark scroll with a sticky top index. Sections, all deep-linkable: `#appetizers`, `#sushi-sashimi`, `#special-rolls`, `#maki`, `#mains`, `#sides-dessert`, `#tasting-menu`, `#lunch`, `#lunch-early-evening`, `#kids`, `#takeaway`.
- `css/style.css`: one stylesheet, tokens at the top.
- `js/main.js`: progressive enhancement only (rail, today's row in the hours table, active item in the menu index). No GSAP: CSS and plain JS were enough.
- `img/shot-*.svg`: original line drawings used inside the image slots as storyboard sketches of the shots to commission.
- Local preview: `python3 -m http.server 8312 --directory richmond-sprint/matsuba/concept-b`.

## Design system
- **Type:** Gowun Batang 400 for display and dish names; Work Sans 400/500/600 for text and UI. Google Fonts with `display=swap`, preconnects, and metric-adjusted fallbacks computed from the real font files against Liberation/Arial/Times metrics (`size-adjust` / `ascent-override` / `descent-override`).
- **Wordmark:** a working wordmark, "MATSUBA" set in Work Sans 500 caps with 0.38–0.42em tracking. It is not their logo file and not a redraw of it. No kanji.
- **Colour (brief palette):** Sugi #191310 ground, Akari #E3A65A for actions and light, Shoyu #5A3420, Sake glass #CFD8D2 for focus rings and dietary marks, Paper #EFE9DF for text. Derived: muted text #A99C8A on dark, #5E5248 on the paper band.
- **Contrast checked (WCAG):** paper on sugi 15.2:1; amber on sugi 8.6:1; sugi on amber (buttons) 8.6:1; muted on sugi 6.8:1 (6.4:1 on the deeper panels); sake glass on sugi 12.6:1; on the paper band, sugi 15.2:1, shoyu 8.9:1, muted 6.3:1. axe-core (WCAG 2.0/2.1/2.2 A and AA plus best practice) reports zero violations on both pages at 390 and 1440.
- **The slat grid:** `.frame.slats` is a 4 / 8 / 12-column grid. A 1px rule sits on every column line (CSS gradient, `background-size: calc(100% / var(--cols))`). Content blocks (`.cell`) span whole columns, carry the ground colour so they interrupt the rules behind them, and keep a transparent left border so the slat line stays visible. The rules show only in negative space, so text never sits on a line.
- **The warm wall:** the hero's timber wall is pure CSS (repeating-linear-gradient slats with a soft-light amber pool). Five original SVG Edison bulbs (cap, thread, glass, stem, looped filament) hang over it on cords of different lengths.
- **Motion:** the bulbs warm up once on load: the halo and filament rise with a single hesitation, staggered per bulb, over 2.2s, CSS only. Rail moves are a 300ms ease-out. Nothing loops. With `prefers-reduced-motion: reduce` there is no animation and no smooth scrolling, and the bulbs simply rest lit.
- **Daytime counterpoint:** the Lunch bento band flips to the paper ground with shoyu accents, so lunch reads as the daylight side of the restaurant.

## The Omakase rail (signature)
- **One source of truth:** a single `<ol class="courses">` of 14 `<li>` holds the courses verbatim from the copy deck, each with an `<h3>` name and a description. Without JS it is a plain, styled list (1/2/3 columns), and screen readers always get a normal list with 14 items.
- **Enhancement:** `main.js` adds `.is-rail` to the section. The same list becomes a horizontal `scroll-snap-type: x mandatory` rail inside `div.rail`, and the end panel follows the last course.
  - The rail gets `tabindex="0"`, `role="region"`, an aria-label and `aria-describedby` instructions.
  - The controls (`.rail-ui`, which ships with `hidden`) are revealed.
- **Input:**
  - Native swipe and trackpad scrolling, snapping per course.
  - Previous/next buttons (48px, `aria-controls`, disabled at the ends).
  - ←/→ step, Home/End jump, when the rail itself has focus. Keys are only intercepted when the event target is the rail, so links inside the end panel behave normally.
- **Never traps vertical scroll:**
  - Plain `overflow-x: auto; overflow-y: hidden`, with `touch-action: pan-x pan-y` and `overscroll-behavior-x: contain`. There are no wheel or touch handlers and no `preventDefault` on scroll.
  - Verified in Chromium with raw CDP touch events: a vertical swipe over the rail scrolls the page, a horizontal swipe advances one course, and a mostly vertical diagonal scrolls the page.
  - A vertical mouse wheel over the rail also scrolls the page.
- **Progress:**
  - "Course 4 of 14" text (tabular figures).
  - A slim line divided into 14 tick segments (the slat motif again), filled in amber up to the current course.
  - The active course gets a pool of bulb light and an amber "plate" ring.
- **Screen readers:** the visible counter is `aria-hidden`. A separate polite live region announces "Course 4 of 14: Sashimi Ceviche" only after button or key navigation, so swiping is never chatty.
- **Ending:** the last stop is a full-width panel with "Pre-order required · Minimum 2 persons · £100 per person · Complimentary glass of Prosecco", Book a table, and Call. The status reads "All 14 courses · pre-order required".

## Deviations from the brief (and why)
1. **14 courses, not 15.** The copy deck's TASTING MENU block lists 14 dishes, and the dossier confirms "14 items plus a complimentary glass of Prosecco". Counting the Prosecco as a course would misstate the menu, so it appears in the terms instead. The headline says "Fourteen courses".
2. **End-of-rail terms** read "Pre-order required · minimum 2 persons · £100 per person · complimentary glass of Prosecco" as the creative director asked, which is fuller than the brief's shorter line.
3. **Sushi and sashimi as a cross-tab ledger.** NIGIRI, ABURI NIGIRI and SASHIMI IRO IRO share the same fish and the same English glosses (checked by the generator). The ledger lists each fish once with its three prices side by side, with "–" (read as "Not listed") where a fish isn't offered. Every name, gloss and price is unchanged; only the arrangement differs from the site's three separate lists. Rows follow the published NIGIRI order, then Saba. SUSHI MORI, GUNKAN NIGIRI and SASHIMI MORIAWASE stay as separate verbatim tables.
4. **Mobile action dock.** Below 1100px a fixed bottom bar holds Book · Order · Menu · Call, so the primary actions sit in the first frame and at every scroll position, including at 320px. The header there carries only the wordmark and "Hours & map". At 1100px and up, the header carries Tasting menu, Menu, Hours & map, the phone number, Order and Book. Body padding reserves the dock's height.
5. **Monday split out of "Monday – Friday"** in the hours table, so the to-confirm marker can sit on Monday alone. The times are as published.
6. **"A PRE-ORDER IS REQUIRED"** is shown in sentence case on the menu page. The words are unchanged.
7. **Lunch & Early Evening and Kids** were published as images. The text is the copy deck's transcription. Supplements are joined to their description with a "·", and the two Innocent flavours share a line.
8. **Not linked:** Instagram is shown as text, because the spec's list of allowed external links doesn't include it. The 2024 vegan and gluten-free PDFs are omitted because they're stale (copy deck [TO CONFIRM] 3). The Food Hygiene Rating 5 is a confirmed fact but is omitted to steer clear of "no ratings".
9. **JSON-LD** has no `openingHoursSpecification`, because Monday and the lunch end time are unconfirmed. It includes only confirmed facts: name, address, phone, email, the 2004 founding date, cuisine, the official menu URL, the booking URL and Instagram.

## Honesty and to-confirm markers on the page
Every marker uses `<span class="tbc" title="To be confirmed with the restaurant">to confirm</span>` plus an `<!-- [TO CONFIRM] ... -->` comment:
- Monday opening (home, Visit).
- The lunch end time: on the Tue–Fri row, the Lunch bento band, and the menu's Lunch section (published as 3pm, 2:45pm or 2:30pm).
- Whether Lunch & Early Evening is still running: the home bento band and the menu section.

Also:
- Booking terms are stated plainly: online bookings up to 12, larger parties by phone, card details secure the booking, no money taken at booking, £10 per person for under 24 hours' notice or a no-show, and the discretionary 12.5% service charge.
- Book and Order are ordinary links to Favourite Table and Toast, opening in a new tab with screen-reader text saying so. There is no `window.open`, no fake confirmation, and the page never navigates away by itself.
- No "best sushi", no reviews, no names, no Korean heritage, and no claim about what the name means.
- "Family-run", "First opened in 2004", "Pull up a chair. Take a taste. Come join us.", "exclusively created by MATSUBA", "signature appetizer" (Tuna Tataki) and "We look forward to welcoming you to MATSUBA!" all come from the copy deck.

## Menu is verbatim: proposed spelling corrections (not applied)
These are shown exactly as published. Each needs owner sign-off before it is corrected. All [TO CONFIRM]:
- "Uangi Steak" → Unagi Steak
- "Eby Fry" → Ebi Fry
- "(all samon)" → (all salmon)
- "Salmon Combo_B Salmon Combo_B 4 pieces…" (the name repeats inside the description)
- "South Amerian" → South American (tasting menu)
- "Chrispy" → Crispy
- "chilli papper" → chilli pepper
- "Yuzu Te" → Yuzu Tea
- "Aperol Com Fanta" → ?
- "Vanila" → Vanilla
- "Torched-seared" → Torch-seared

Dual prices (for example "18.9/17.9" on three-variant dishes) are shown as published; their meaning is [TO CONFIRM] 5.

## Pine-needle note
"Matsuba" means "pine needle(s)" in Japanese, but the restaurant doesn't say why it chose the name. Concept B does not use a pine-needle motif and never states a meaning.

## Assets to replace
- Every `.slot` (eight on the home page, one on the menu page) is a fixed-ratio placeholder: a CSS slat ground, an original line sketch from `img/`, viewfinder corners and a visible "Photograph to commission" caption. Replace the `<img>` inside `.slot__art` with the commissioned photograph at the same aspect ratio and keep the caption as alt text.
- The wordmark is a set-in-type stand-in. If the owner prefers their logo file, use it in a labelled logo slot.

## Photography shot list (warm, low-lit, real room; no stock)
1. The dining room in the evening: slatted timber wall, Edison bulbs, booths, brick. Wide, from the door (16:9).
2. Sake bottles on the bar shelf under the bulbs (4:5).
3. The frontage on Red Lion Street at dusk, lights on inside (4:5).
4. Tuna Tataki: torched slices over mooli with ponzu, dark plate, one warm overhead light, 45° (4:5).
5. The carpaccio range, optionally in the same session as Tuna Tataki.
6. A Special Roll cut into eight pieces in a line, side-lit at table height (16:9).
7. Stonepot Bibimbap from directly above, egg on top, before mixing (1:1).
8. A bento box from above in daylight, miso soup alongside (1:1).
9. Takeaway packed for collection, bagged on the counter by the door (4:5).

## QA run (Chromium via Playwright, local server on 8312)
- **Errors and links:** 390 / 768 / 1440 checked, plus 320 and 2560 for overflow. Zero console errors, zero failed requests, no horizontal scroll at any width. Cumulative layout shift ≤ 0.005.
- **axe-core 4.10:** zero violations on both pages at 390 and 1440, after fixing one header-button contrast bug found during QA. Tap targets: every non-inline link or button is at least 44px tall.
- **Anchors and deep links:**
  - All internal anchors resolve, and every external link is on the allowed list.
  - Fresh loads of `menu.html#sushi-sashimi`, `#special-rolls`, `#tasting-menu`, `#lunch-early-evening`, `#kids` and `#takeaway` land exactly below the sticky header and index (112px at 390).
  - On each of those loads, the index marks the right section with `aria-current`.
- **No-JS:** all 14 courses are visible as a list, the rail controls stay hidden, and every section renders.
- **Reduced motion:** no animation, auto scroll behaviour, and the bulbs rest lit.

## Known limitations
- Without JS, the menu's sticky index works as plain anchors but doesn't highlight the current section. On phones it scrolls sideways (with a right-edge fade) because eleven sections don't fit.
- The bulb warm-up runs on every page load (not once per visitor), because a CSS-only animation needs no storage.
- The rail's light pool and plate ring mark the course snapped at the left edge. On wide screens three or four courses are visible at once, so "Course n of 14" counts the leftmost one.
- Takeaway prices differ from dine-in. The page says so and links the current takeaway PDF (June 2026) rather than duplicating it.
- Hours highlight today's row (London time) but deliberately make no "open now" claim while Monday and lunch end times are unconfirmed.
- The menu HTML was generated once from the copy deck by a scratch script (outside the repo) to keep it verbatim. The shipped files are plain static HTML, and future edits go straight into `menu.html` and `index.html`.
