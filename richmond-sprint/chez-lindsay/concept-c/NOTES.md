# Chez Lindsay, Concept C: "Le Billig" (the griddle and the fold)

**The concept in two lines:** everything starts on the billig, the round cast-iron griddle. The site's identity is made from two shapes: the circle of batter and the square fold of a galette complète. It's loud, appetite-first poster typography in cast-iron black, buckwheat, egg-yolk yellow and flour white.

A speculative design proposal. It isn't the official site, and it isn't commissioned or endorsed by Chez Lindsay. Every page footer says so and links to chez-lindsay.co.uk.

## Run it

```
python3 -m http.server 8303 --directory richmond-sprint/chez-lindsay/concept-c
```

Then open http://localhost:8303/. The site is plain HTML, CSS and JS, with no build step and no dependencies. Google Fonts (Archivo, Literata) is the only external request.

## Files

- `index.html`: homepage. The fold hero, galettes, crêpes and flambé, the week (Sunday brunch, steak night, happy hour), cider, hours, private room, find us, book, footer.
- `menu.html`: full menu. Galettes come first, with anatomy disclosures. Then crêpes and desserts, set lunch, la carte, steak night, and drinks with cider first.
- `css/main.css`: all styles. Tokens sit at the top, and the fold rules are under "HERO: La pliure".
- `js/main.js`: hover tilt on the fold, the honest OpenTable hand-off, and the marker on today's opening-hours row (Europe/London).
- `js/menu.js`: galette disclosure buttons and the SVG anatomy diagrams.
- `img/lace.svg`: a procedural buckwheat-lace tile (feTurbulence), used on fold flaps and image slots.

Deep links: `menu.html#galettes`, `#crepes`, `#desserts`, `#set-lunch`, `#la-carte`, `#steak-night`, `#drinks`, `#cider`, `#happy-hour`. Each galette also has its own link, for example `menu.html#g-complete`; following it opens that galette's anatomy.

## The signature: "La pliure"

- **Build:** the hero is CSS 3D transforms over inline SVG. A hidden `<svg>` of defs holds the batter edge (a slightly irregular circle), the egg white, the clip paths, the gradients and two procedural textures:
  - the pale, pin-holed top side of the batter
  - the browned, lacy griddle side
- **Layers:** the stage holds the iron (billig), the base square, and four flaps. Each flap is a `preserve-3d` element with two faces:
  - **Front face:** the circular cap of batter outside the hinge line, showing the top side.
  - **Back face:** that cap mirrored across the hinge and clipped to the square, showing the griddle side. It's drawn already in its folded position and pre-rotated 180°, so the flap's own rotation of ±180° about the hinge brings it back to identity. That lands it flat and pixel-exact, and it never z-fights.
- **Shading:**
  - Each face carries a shade layer that darkens as the face turns edge-on (0.45 at 90°).
  - The back face carries a crease highlight and a dark band along the fold, plus a blurred cast shadow that fades in as the flap lands.
  - Lighting is slightly stronger on the top and left flaps.
- **Resting state = folded.** This is the default CSS, so no-JS and `prefers-reduced-motion: reduce` both show the folded square, with the circle of the billig around it.
- **Motion:**
  - A tiny inline script in `<head>` runs before first paint. If motion is allowed, it adds `fold-pending`, which lays the disc flat.
  - About 420ms after DOMContentLoaded it swaps to `fold-run`, and the flaps fold once: top, then bottom, left and right, staggered over 900ms.
  - A 3-second fail-safe means the disc can never be left flat.
  - On fine pointers the fold tilts slightly on hover. There's no tilt with reduced motion.
- **The yolk is the Book link:** `<a href="#book">Book a table</a>`, a real link with visible text and a high-contrast double focus ring. It sits above the flaps at all times, so the fold never covers or delays it. Book, Menu and Call are also in the sticky mobile dock from the first frame.

## Implementation notes

- **Type:**
  - Archivo variable, set very wide and heavy (`font-stretch:125%`, 900) for display and condensed (78–82%) for labels.
  - Literata for text.
  - Metric-matched fallback faces were computed from the font files with fontTools: Arial, Arial Bold wide and Arial Bold condensed for Archivo, and Times for Literata. Measured CLS is ≤ 0.002.
- **Mega headers fit by measurement:** they're sized as `(content width) / 7.4`, because the longest words (GALETTES, DESSERTS) measure 7.11em at wdth 125 / wght 900. Nothing overflows from 320px to 2560px.
- **Circle compositions (`.disc-head`):** the disc is sized in ems of the heading, so the heading always sits inside it. Light text never crosses onto a light ground, and the disc never overhangs other content (`pointer-events:none`).
- **Square compositions (`.fold`):** four elliptical flaps with lace texture, a crease highlight and a cast shadow frame the content window.
- **Galette anatomy:**
  - Built from `data-fillings`, whose values are copied verbatim from each published description. An authoring check made sure every label is a literal substring of its description.
  - The only other label is "buckwheat", from the menu's own heading ("Traditional buckwheat pancakes").
  - The fillings are drawn x-ray style, as abstract geometric tokens (no cartoon food) under translucent flaps, with leader-line labels.
  - Rows are `<button aria-expanded aria-controls>`. Without JS they stay plain headings with the full descriptions.
- **Booking:**
  - Every Book link goes to the in-page `#book` section, which explains the hand-off.
  - "Book on OpenTable" opens `https://www.opentable.co.uk/restref/client/?rid=93306` in a new tab. The page says honestly that nothing is booked until OpenTable confirms it.
  - If `window.open` is blocked, a visible link appears instead.
  - The page never navigates away on its own, and phone and email are always shown alongside.
- **Opening hours:** there's no service clock (that's Concept A's idea). The hours table only marks today's row (Europe/London). The marker's space is reserved, so nothing moves.
- **Metadata:**
  - Each page has its own title and description, `theme-color`, Open Graph, an inline SVG favicon, `lang="en-GB"`, and Restaurant JSON-LD (confirmed facts only).
  - Both pages also carry `noindex`, so the proposal can't be mistaken for the official site in search results.
- **Checks run (Playwright, Chromium):**
  - 320, 390, 768, 1440 and 2560: no horizontal scroll, no console errors, no failed requests.
  - axe (WCAG 2.1 AA + best practice): clean after fixes.
  - All tap targets are 44px or more; the order is logical; no-JS and reduced-motion renders checked.
  - The fold was sampled frame by frame.
- **Screenshots:** in the scratchpad only (`sprint/chez-lindsay-c/`), never in the repo.

## Content and honesty

- **Sources:** all copy comes from `research/copy-deck.md` and the brief. Menus are as published. "Lightly trimmed" approved copy drops the bracketed gluten-free clause from About Us, as the copy deck instructs.
- **Set lunch:**
  - Labelled "Sample Prix Fixe".
  - It shows only "Two courses £24.50 / Three courses £28.50" and the supplements; the unexplained per-dish figures are left out.
  - Supplements are typeset consistently as "£7 supplement" / "£4 supplement". The source prints "(£7 supplement)", "(7 supplement)" and "(4 supplement)". [TO CONFIRM]
- **Allergen line:** "Please speak to our staff about your food allergies and intolerance before ordering" appears on every menu section: galettes, desserts, set lunch, la carte, steak night and drinks.
- **No "gluten-free" wording anywhere.** There are no allergen icons, ratings, reviews or press quotes.
- **Vegetarian marks:** only on dishes whose own name says "Vegetarian" (Complete Vegetarian, and the la carte Vegetarian galette).
- **"To confirm" markers:** on page each one uses the spec's `<span class="tbc">` together with an HTML comment.
  - Sunday brunch £31.5, per person or per two.
  - "Add 3" on the vegan line.
  - Bank holiday, Christmas and last-orders times.
  - The OpenTable URL (built from widget rid 93306).

### Spelling corrections [TO CONFIRM with the restaurant]

Each is shown corrected on the page, with an HTML comment beside it:

| Source | Shown as | Where |
|---|---|---|
| spitz | spritz | La carte aperitif line |
| paprika maya | paprika mayo | Salad de Crabe |
| chutney de figures | chutney de figues | Foie gras starter |
| Kaffer lime | Kaffir lime | Filet de Halibut |
| seved | served | Suprême de Volaille (set lunch) |
| pearl barely | pearl barley | Suprême de Volaille (set lunch) |
| Parmensan | Parmesan | Suprême de Volaille (set lunch) |
| Le Pioneer | Le Pionnier (as on the wine list) | Steak night Silver package |

These are kept exactly as published: "Complete Vegetarian", "Salad de Crabe", "Expresso", "2 galettes + 2 drink of your choice", and "Les Bière Des Sans Culottes".

## Deviations from the brief, and why

- **Every Book link goes to `#book`, not straight to OpenTable.** This applies to the yolk and the dock too. The shared spec asks for an honest in-page summary with phone and email alongside, and the URL is unconfirmed. Booking is still one tap more.
- **The mobile hero fold is 112vw wide and slightly cropped by the viewport.** At 100% the folded square was too small to be appetising. The yolk stays above 90px.
- **Sweet crêpes on the homepage are labelled "on the evening menu, from 5pm".** The restaurant serves Les Desserts in the evening only. A crêpe also appears on the sample set lunch.
- **Instagram and Facebook are not linked.** The spec allows only verified destinations, and whether the accounts are active is [TO CONFIRM].

## Known limitations

- The lace is procedural (feTurbulence). It reads well at hero size but is busier than a real galette at very small sizes. A real photograph of the griddle side would be the better texture source once one is commissioned.
- During the fold, the small corner pieces of the top and bottom flaps vanish as they pass edge-on (90°), because they're tucked under rather than physically simulated. At that angle you can't see it.
- The 3D fold relies on `backface-visibility`. Very old browsers without it would show the folded state at once (an acceptable fallback).
- The "today" marker uses the visitor's clock with Europe/London; it doesn't know about bank holidays.
- The hero SVG and the menu lists were generated by authoring scripts outside the repo. To edit the menu, edit the HTML directly (it's plain static markup).
- The OpenTable restref URL returned 503 to the research crawler and hasn't been verified in a real browser.

## Assets to replace

- **Logo:** the working wordmark "Chez Lindsay / Restaurant & Wine Bar" is set in Archivo, with a small circle-and-square mark. It's a stand-in for the restaurant's hand-drawn script logo; get the vector file and permission to use it [TO CONFIRM].
- **Photographs:** every image area is a captioned placeholder (see the shot list).

## Photography shot list (to commission)

1. A galette on the griddle, from above: batter spread thin on the billig, edges just lifting (circle slot, homepage galettes).
2. A complète, folded, with its yolk (square slot, homepage galettes).
3. A crêpe flambéed at the table: low light, blue flame, the pan at the table edge (tall slot, crêpes).
4. An oyster plate with crémant: six Maldon oysters, two glasses poured (circle slot, happy hour).
5. A cider pitcher: Kerisac poured from the pitcher, a galette beside it (circle slot, cider).
6. The first-floor private room, laid for a party (square slot, private room).
7. The frontage on Hill Rise (square slot, find us).
8. The room (circle slot, find us).
