# Matsuba: creative brief

Sources: `research/dossier.md` and `research/copy-deck.md` (researched 25 October 2026). The copy deck is the only content a designer may use.

## The business
- **What it is:** a small, family-run Japanese restaurant at 10 Red Lion Street, Richmond TW9 1RW, "First opened in 2004". In its own words: "sushi, sashimi and fine Japanese dishes with a modern twist."
- **Food:**
  - Signature appetizer: Tuna Tataki.
  - A carpaccio range, and large 8-piece special rolls "exclusively created by MATSUBA".
  - Bento lunches.
  - A £100 tasting menu (minimum 2, pre-order, complimentary Prosecco).
  - A few Korean touches on the menu (Stonepot Bibimbap, Special K Roll). The family's heritage is not to be stated.
- **The room:** dark wood slats, Edison bulbs, sake bottles, brick and booths (photos on their site). Harden's says about 30 covers; that's reported only.

## Audience (inference)
- Richmond locals for dinner, takeaway and collection.
- Couples and small groups.
- Lunchtime workers (bento).
- Special-occasion diners (the tasting menu).
- Families (kids' bento).

## Confirmed details
- **Contact:** 020 8605 3513 · info@matsuba.co.uk · @matsuba.london
- **Book:** https://booking.favouritetable.com/?SiteCode=2122. Online up to 12; larger parties by phone. A card is needed to secure the booking, with a £10 per person charge for no-shows or less than 24 hours' notice. Say this plainly.
- **Order:** https://order.toasttab.com/online/matsuba-10-red-lion-street. Collection gets 20% off every day (kids' menu excluded).
- **Hours as published:** Mon–Fri 12–3pm and 5–10pm; Sat 12–10pm; Sun closed.
  - Monday is [TO CONFIRM]: several sources, and their own card, say it's closed.
  - The lunch end time is [TO CONFIRM] (3pm, 2:45pm or 2:30pm).
- **Allergens and service:** "If you have a food allergy or a special dietary requirement, please inform a member of the staff." Discretionary 12.5% service. Dietary marks: v and vg, from the live menu only.

## Keep from the current site
- The menu is real text with v/vg marks.
- Booking and ordering use their own accounts.
- The wide-tracked capital wordmark.
- The line "Pull up a chair. Take a taste. Come join us."

## Opportunities (evidence in the dossier)
1. **Generic copy.** "delivered to the customer with service to the highest" appears six times; "BEST SUSHI IN LONDON" appears on every inner page, unsupported. Nothing about the family, the room or the dishes that make it particular.
2. **The first mobile screen** has no hours, address, menu or ordering link. Booking takes two taps; ordering is behind the hamburger; the phone number isn't tappable. The hamburger button is 51×18px.
3. **Out-of-date links.** The homepage takeaway button opens a 2024 PDF instead of Toast. The kids' offer expired on 1 September 2026. The vegan and GF PDFs date from 2024.
4. **Accessibility.** No h1; menu descriptions at 3.95:1 contrast; two menu tabs are images with empty alt text.
5. **The print brand isn't online.** Their printed menus use burgundy, gold and brown, which the black-and-grey site never uses.

## Visitor actions (priority order)
1. Book (Favourite Table) or order for collection (Toast, 20% off).
2. Read the menu: sushi, rolls, mains, bento lunch, tasting menu, kids'.
3. Check hours, with the lunch window clearly shown.
4. Call or find it: Red Lion Street, by Richmond town centre.

## Brand material
- Wide-tracked geometric capitals "MATSUBA" (use a working wordmark set in each concept's type).
- Print palette: burgundy ≈#640B35, gold ≈#D4A965, brown ≈#3F2B1C.
- "Matsuba" is Japanese for "pine needle(s)". The restaurant doesn't say why it chose the name, so a pine-needle motif is a design interpretation to note in NOTES.md and must never be stated as their story.
- Don't write kanji for the name: the restaurant doesn't publish any.
- Shots to commission:
  - the room (wood slats, Edison bulbs, sake bottles)
  - Tuna Tataki and the carpaccio
  - a Special Roll cut
  - a bento box from above
  - the stonepot bibimbap
  - the frontage on Red Lion Street
  - takeaway packed for collection

## Constraints
- **Copy:**
  - No "best sushi" claims. No reviews. No names.
  - Monday and the lunch end time carry visible "to confirm" markers.
  - The menu is verbatim. Spelling corrections ("Uangi" → "Unagi" etc.) may be shown only if NOTES.md lists each one, flagged [TO CONFIRM].
  - The Lunch & Early Evening set menu (£20.95 / £24.95) is "to confirm still running".
  - Dual prices: show them as published.
- **Security, a note for the studio only (not for any concept or email):** every page of the current site loads an obfuscated script that calls an unrelated domain. Raise it privately with the owner as a courtesy. Never use it as a sales point.

## Commercial purpose
Turn a template site into one that sounds and looks like this particular family restaurant. The first screen on a phone should take you to booking or ordering, and the print brand should come online.

---

## Three directions

### A: "Noren" (the curtain at the door)
- **Idea:** stepping through the split curtain into a tiny, warm, family room. The site brings Matsuba's own print palette online and makes small, intimate and personal the selling point.
- **Type:**
  - Shippori Mincho for display and dish names (refined Japanese Mincho with a good Latin set).
  - Zen Kaku Gothic New for text and UI.
  - Wordmark: wide-tracked capitals in Zen Kaku Gothic New.
- **Colour:**
  - Burgundy #640B35 (their print colour; the noren and Book)
  - Kin (gold) #C9A15E (fine rules, on dark only)
  - Kogecha (brown) #3F2B1C
  - Washi #F7F3EC ground
  - Sumi #1A1614 text
  - Check AA throughout.
- **Layout:** a quiet asymmetric grid with generous margins. Section titles run vertically (`writing-mode: vertical-rl`, Latin text rotated) in a narrow left column on desktop, like a hanging scroll. Pine-needle line motifs (original SVG, two needles joined at the base) mark section breaks, used sparingly.
- **Signature, "Noren":**
  - The hero is a burgundy split curtain in five panels, carrying the wordmark, over an image slot of the room.
  - Once on load the panels part slightly and sway to rest. On hover each panel lifts like fabric (a CSS transform with transform-origin at the top).
  - The panels never cover the actions: Book, Order and Menu sit below or beside the curtain and are visible in the first frame.
  - Reduced motion: still, slightly parted.
- **Menu page:** a classic Japanese menu board. Courses run down a sticky vertical index (Appetizers, Sushi & sashimi, Rolls & maki, Mains, Lunch bento, Tasting menu, Kids, Sides & desserts). Dishes are set in two columns with Shippori names, Zen Kaku descriptions, right-aligned tabular prices and small v/vg marks. The tasting menu is a separate folded "card".
- **Motion:** soft and slow (400–700ms), fabric-like easing. Nothing loops.
- **Port:** 8311.

### B: "Counter" (an evening at the bar)
- **Idea:** the moodier evening view: wood slats, warm bulbs, sake on the shelf, and the £100 tasting menu as the reason to come. Cinematic and dark, in a different register from A.
- **Type:**
  - Gowun Batang for display (a calm, literary serif).
  - Work Sans for text and UI.
  - Wordmark: wide-tracked Work Sans capitals.
- **Colour:**
  - Sugi (cedar dark) #191310
  - Akari (bulb amber) #E3A65A
  - Shoyu #5A3420
  - Sake glass #CFD8D2
  - Paper #EFE9DF for text on dark
- **Layout:** full-width dark bands with vertical slat rhythm: thin repeating vertical rules, original CSS, like the room's timber slats, used as a structural grid. Content sits in the "gaps" between slats.
- **Signature, "Omakase rail":**
  - The tasting menu's courses sit on a horizontal, scroll-snapping rail like dishes passed across a counter.
  - A slim progress line counts through them, with the course name large and the description small.
  - Works with swipe, trackpad, arrow buttons and the keyboard (left/right on the focused rail).
  - The full list is also present as text for screen readers and no-JS.
  - Ends with "Pre-order required · minimum 2 · £100 per person" and Book.
- **Menu page:** dark, one long elegant scroll with a sticky top index. Sushi and sashimi are set as a tight price ledger (piece counts aligned). Special rolls get a large feature treatment.
- **Motion:** bulbs "warm up" subtly on first view (opacity and glow on SVG bulbs, once). Rail transitions 300ms. Nothing loops.
- **Port:** 8312.

### C: "Bento" (lunch, takeaway, collection)
- **Idea:** the bright daytime and takeaway Matsuba, organised like a bento box: compartments of different sizes, each holding one thing you need. Bold, graphic and quick. Order for collection (20% off) and the bento lunch lead.
- **Type:**
  - Zen Maru Gothic for display (rounded, friendly, Japanese).
  - Lexend for text and UI (highly legible).
  - Wordmark: wide-tracked Lexend capitals.
- **Colour:**
  - Shari (rice white) #FBFAF6
  - Nori #141714
  - Matsu (pine green) #1F4D3A
  - Sake-salmon #EE7F62, for large shapes only; check text contrast
  - Wasabi #A9BC3E, accents on dark only
- **Layout:** a bento grid. The homepage is one big box divided into unequal compartments (Order for collection · Book · Today's hours · Bento lunch · Special rolls · Find us), laid out with CSS grid areas that re-pack sensibly on mobile. Compartments are flat colour fields with thick dividers, never identical rounded cards.
- **Signature, "Open the box":** on the menu page, the bento lid (a header panel) lifts away once to reveal the compartments, each a menu section. Selecting a compartment expands it to fill the box and shows that section's dishes; a "back to the box" control returns. Every section is also a normal anchor with full content in the DOM, and without JS it's a plain long menu.
- **Homepage extras:** a "20% off collection" strip linking to Toast, and the lunch window, marked to confirm.
- **Motion:** brisk 180–250ms with a little spring on compartment expand. The lid lifts once.
- **Port:** 8313.
