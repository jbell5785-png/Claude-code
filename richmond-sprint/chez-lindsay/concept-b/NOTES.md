# Chez Lindsay · Concept B · "Marée"

**The concept in two lines.** A Breton seafood-and-cider restaurant from the coast, sitting on the tidal Thames: a cool, grown-up maritime editorial built like an old coastal chart and a fishmonger's slate. It gives Chez Lindsay an evening identity, with oysters, fish soup, crémant and cider leading, and makes every menu readable on a phone.

Speculative design proposal. Not the official site, and not commissioned or endorsed by Chez Lindsay. All content comes from `../research/copy-deck.md` and `../brief.md`.

Local preview: `python3 -m http.server 8302 --directory richmond-sprint/chez-lindsay/concept-b`, then open http://localhost:8302.

## Files

| Path | What it is |
|---|---|
| `index.html` | Homepage: evening hero, happy hour, seafood, galettes, cider/Kir/Calvados, la semaine (hours and rituals), private room, find us, booking |
| `menu.html` | All six menus as HTML: `#carte`, `#galettes`, `#desserts`, `#prix-fixe`, `#steak-night`, `#vins`; plus La boussole |
| `css/maree.css` | All styles. Tokens on `:root`, mobile-first |
| `js/site.js` | Reveals (motion only), today's row in the hours table (Europe/London), booking hand-off |
| `js/boussole.js` | La boussole: the compass filter and rhumb lines |
| `img/slot-*.svg` | Eight original depth-contour fields used behind the image slots |
| `img/neatline-*.svg` | Chart neatline frame (border-image tile), foam and navy |
| `img/graticule.svg` | Faint coordinate-grid tile for light grounds |

## Design system

- **Type:** Bodoni Moda (display, dish names; optical sizes via the `opsz` axis) and Karla (text, UI, prices), both from Google Fonts with `display=swap` and preconnects. Fallback faces are metric-adjusted and calibrated: width ratios were measured in Chromium against Times/Arial-metric faces (Karla 102.8%, Bodoni upright 111.7%, Bodoni italic 106.6%), and ascent/descent come from each font's hhea table. Layout shift after the font swap is under 0.025 at every width tested.
- **Colour:** Atlantique `#12294A`, Écume `#F3F5F2`, Verre de mer `#9CC3B5`, Rouge `#C2362B`, Sable `#D8CAB0`. Derived shades: `#0B1C33` (footer, night slot), `#1C2B3D` (slate), `#44566F` (secondary text). Rouge is used only for Book, the "Fermé" Tuesday row, the allergen rule, the compass needle, the map pin and the "Not to scale" stamp.
- **Contrast (checked):** navy/foam 13.3; secondary `#44566F` on foam 6.8, on sable 4.6; navy on sea-glass 7.6; sea-glass on navy 7.6; foam on rouge 5.0; foam on slate 13.1. Secondary text is never set on sea-glass, and rouge text appears only on foam.
- **Chart devices (all original SVG/CSS):**
  - A full-bleed hero chart: graticule, a tidal river bend with dashed depth lines, and italic soundings that appear only in the water.
  - Neatline frames with an alternating latitude-scale band.
  - Depth-contour fields in the image slots.
  - Marinière stripes used only as thin three-line rules (the masthead, section dividers that draw in, and the footer).
  - No anchors, lighthouses, gulls or flags.
- **Motion:** plain CSS and JS (GSAP not needed). Tidal easing `cubic-bezier(.45,.05,.15,1)`, 0.9 to 1.4s. Content fades in, rules draw in, and on the sketch the walking route draws once. No scroll-scrubbing and no loops. Content is hidden only after JS has added `motion-ok`, which it never adds under `prefers-reduced-motion: reduce`.

## La boussole (signature)

- **Where:** `menu.html`. On desktop (1080px and up) it's a sticky compass-rose rail beside the menus. Below 1080px it becomes a sticky segmented control (Tout · Mer · Terre · Potager · Sucré) under the masthead, with a one-line count beneath it.
- **Controls:** five real `<button>`s with `aria-pressed`, in a `role="group"` labelled "La boussole". Selection is single. Pressing the active bearing again returns to Tout, and Tout is the explicit reset. The buttons are fully keyboard-operable with visible focus.
- **State change:**
  - Every `.dish` carries a `data-cap` tag, or none. Matching dishes stay open. Non-matching dishes fold to one readable line (name and price) through a `grid-template-rows` transition. They are never hidden.
  - Folded descriptions get `aria-hidden` so the filter means the same thing to screen-reader users.
  - Each section heading that contains matches fills its diamond marker and shows a count ("3 · Mer").
- **Live count:** a polite `role="status"` region, e.g. "Mer: 13 dishes in 6 sections. Fish and seafood stay open; the rest fold to one line." The second sentence is visually hidden on mobile.
- **Needle:** a red-and-foam needle turns the short way round to the chosen bearing (Mer N, Terre E, Potager S, Sucré W).
- **Rhumb lines** (desktop, motion allowed):
  - A fixed SVG overlay draws a fine line from the compass rim to the diamond on each matching section heading that is on screen. The lines use `stroke-dashoffset` over 1.1s.
  - As you scroll, the lines stay attached, and a heading that comes into view gets its line drawn in. A `ResizeObserver` and a short rAF loop keep them attached while the menu reflows.
- **Reduced motion:** no lines, no needle or fold transitions. The state change and the count still work.
- **No JS:** the control and its instructions are not shown. A line reads "The full menu is shown below, grouped by course", and the full menu shows normally.
- **Scope:** all five food menus (carte, galettes, desserts, set lunch, steak night). The wine list is left out on purpose and sits outside the rail.

### Tagging decisions

Tags come strictly from published dish names and descriptions. Anything ambiguous is left untagged.

- **Mer (13):**
  - Carte: Oyster, Soupe de Poisson, Salad de Crabe, Saint-Jacques Poêlées, Niçoise Salad (grilled tuna), Filet de Dorade, Filet de Halibut, Filet de Sole.
  - Galettes: Galette aux Gambas, Galette au Saumon Fumé.
  - Set lunch: Crevettes grillées, Saint Jacques Poêlées, Filet de Daurade.
- **Terre (18):**
  - Carte: Charcuterie plate, Chicken liver and mushroom Parfait, Foie gras et chutney de figues, Spatchcock Baby Poussin, Confit de lapin, Croupe d'Agneau, Steak Frites.
  - Galettes: Complète, Super Complète, Galette de Chez Lindsay, Galette Savoyard (all with ham).
  - Set lunch: Porc Rillettes, Foie de Veau, Suprême de Volaille, Entrecôte de Boeuf.
  - Steak night: Silver, Gold and Platinum packages.
- **Potager (2):** only the two dishes the restaurant itself calls vegetarian: "Vegetarian galette" (carte) and "Complete Vegetarian" (galettes).
- **Sucré (19):**
  - Desserts: all nine crêpes, the flambé and Chantilly extras, Crêpe Suzette, Fondant au Chocolat, Crème Brûlée, Dessert of the Day, Nos Sorbets, Nos Glaces.
  - Set lunch: Croquant au chocolat, Crêpe au Citron.
- **Deliberately untagged:**
  - Meat-free but not labelled vegetarian by the restaurant, so not Potager:
    - Beetroot Tartare
    - Galette au Roquefort, Galette au Chèvre, Galette à la Ratatouille ("a selection of our galettes is vegetarian" doesn't say which)
    - Oignon Tarte Tatin
    - Grilled Aubergine
    - All sides (Pommes Frites, Ratatouille, Épinards, Pomme de Terre Nouvelles, Salade Panache, Salade de tomates et oignon)
  - Stock not stated: Soupe à l'Oignon Gratinée and Soupe du Jour.
  - Neither sweet nor protein-led: Olives pot, Corbeille de Pain, and the steak-night sauces, salads and bread.
  - On the dessert menu but not sweet: Fromages (Plateau de Fromages) and Assiette de Fromage.
  - Drinks (apéritif lines, wine list) are outside the filter.

## Content decisions and deviations

- **Set lunch:** only "Two courses £24.50 / Three courses £28.50" and the supplements ("£7 supplement", "7 supplement", "4 supplement", as printed) are shown. The unexplained per-dish figures are omitted, and the menu is labelled as a sample, as the restaurant labels it.
- **Allergen line:** "Please speak to our staff about your food allergies and intolerance before ordering" sits at the foot of all six menu sections, and also on the homepage seafood and galettes blocks. There is no gluten-free wording anywhere.
- **Service charge:** shown where the restaurant prints it (carte, galettes, set lunch) and once in the footer.
- **Spelling corrections** [TO CONFIRM]: each is listed below and flagged in the HTML with `<!-- [TO CONFIRM] ... -->`. Revert them if the client prefers the published text.
  1. "Pimm's spitz" → "Pimm's spritz" (carte apéritif)
  2. "paprika maya" → "paprika mayo" (Salad de Crabe; homepage and menu)
  3. "chutney de figures" → "chutney de figues" (Foie gras)
  4. "Kaffer lime" → "Kaffir lime" (Filet de Halibut; homepage and menu)
  5. "seved" → "served", "pearl barely" → "pearl barley", "Parmensan" → "Parmesan" (Suprême de Volaille)
  6. "Le Pioneer" → "Le Pionnier" (Steak Night Silver package, matching the wine list)
  7. Sunday brunch "2 drink of your choice" → "2 drinks of your choice"
  8. "8z" isn't used: the homepage steak-night line uses the "8oz" version the restaurant published.
- **Light trims of approved copy:**
  - The Time Out phrase inside the About Us sentence was removed ("Seafood and pancakes feature highly on the menu…"), because the brief bans press quotes.
  - The "gluten-free" clause was cut from the galettes paragraph.
- **Other copy choices:**
  - Section headings and kickers are original microcopy ("Ce soir, à marée haute", "La mer, le soir", "La semaine"). They make no factual claims.
  - "That's Monday and Wednesday to Friday" for happy hour follows from the published Tuesday closure.
- **Brunch:** "£31.5" is shown as published, with the visible "to confirm" marker and a plain sentence saying the per-person or per-two basis is unconfirmed.
- **Booking:**
  - Every Book button goes to the in-page `#reserver` block, so the honest summary is always seen. That block offers OpenTable (`https://www.opentable.co.uk/restref/client/?rid=93306`, marked "to confirm"), phone and email.
  - The OpenTable link is a real `target="_blank"` anchor. With JS, the click calls `window.open` and the status line says "OpenTable should now be open in a new tab. Your table is only booked once OpenTable or the restaurant confirms it." If `window.open` returns null, the page shows a visible "Continue to OpenTable" link and the phone number instead. The page never navigates away and never shows a confirmation.
- **Not linked:**
  - Instagram (@chez_lindsay) appears as text with "to confirm", because whether it's active is unknown and it isn't on the spec's verified-destination list.
  - Facebook and TripAdvisor are omitted.
- **Not claimed:** step-free access, terrace or river-view seating, last orders, bank-holiday hours (marked "to confirm"), the Daily Special's contents, owners' or chef's names, press quotes, ratings.
- **Hours:**
  - Tuesday is a hatched row reading "Fermé · closed all day".
  - Today's row is marked using `Intl` in Europe/London. Its label space is reserved, so nothing shifts.
  - The lunch/evening split is stated on both pages.
  - "Ouvert 6 jours" is used; "Toujours Ouvert" is not.
- **Wordmark:** "Chez Lindsay" is set in Bodoni Moda italic over tracked Karla capitals "RESTAURANT & WINE BAR". It's a working wordmark in this concept's type, not a redraw of the brush-script logo. The footer carries a labelled logo slot for the real vector file.
- **JSON-LD:** Restaurant, with name, the official URL, telephone, email, address, cuisine (French, Breton), reservations, and opening hours (Mon and Wed–Sat 12:00–22:00, Sun 12:00–21:00). Nothing unconfirmed is included.
- **Tables on small screens:** below 600px the wine manifest rows become aligned CSS grids, with the measure header row kept, so prices stay in true columns. Explicit ARIA table roles preserve semantics when the display changes.

## Checks run (Playwright Chromium, port 8302)

- Zero console errors and zero failed requests on both pages at 390, 768 and 1440.
- No horizontal overflow at 320, 390, 768, 1440 and 2560.
- axe-core 4.10 (WCAG 2 A/AA plus best practice): no violations on either page at 390 and 1440.
- No visible link or button shorter than 44px (inline text links excepted). No broken in-page anchors.
- Layout shift on load: at most 0.025.
- No JS: no text content hidden. Reduced motion: no lines are drawn, and the filter state and count still work.

## Known limitations

- Rhumb lines are desktop-only (1080px and up). On a phone they would cross the text, so smaller screens get the state change, heading markers and counts.
- Rhumb lines are drawn only to matching headings that are on screen. Off-screen headings get their line as they scroll in, and the count covers the rest.
- When a bearing folds content above the viewport, the browser's scroll anchoring keeps the reader's place, but a heading you were looking at can move off screen.
- The route sketch is a deliberately simplified, not-to-scale diagram. It shows the station, bridge, Hill Rise and the NCP, and no other street names, because the copy deck doesn't name them. The text alternative and the printed directions carry the real information.
- The homepage hero is evening-led all day by design. It doesn't switch to a lunchtime state; that's Concept A's territory.
- Google Fonts is a third-party request. Self-host the two families for production.
- Image slots use `loading="lazy"` (except the hero), so on a very fast scroll a slot can paint its contour field a moment late. The frames have fixed aspect ratios, so nothing shifts.

## Assets to replace

1. The eight image slots (`img/slot-*.svg` plus captions) with commissioned photography. Keep the aspect ratios: 4:5, 4:3, 3:2, 1:1, 3:4, 4:5, 3:2, 4:5.
2. The footer logo slot with the restaurant's own vector logo (file and rights to confirm).
3. Google Fonts with self-hosted WOFF2 files of Bodoni Moda and Karla.
4. The OpenTable hand-off URL with a direct booking URL from the restaurant.

## Photography shot list

| Slot | Ratio | Shot |
|---|---|---|
| Hero | 4:5 | The dining room in the evening, candles lit and tables laid for dinner |
| Happy hour | 4:3 | A plate of six oysters on ice with two glasses of crémant, early-evening light |
| Galettes A | 3:2 | A galette on the flat griddle, the buckwheat batter just set at the edges |
| Galettes B | 1:1 | A complète folded square, the yolk whole at its centre |
| Cidre A | 3:4 | A pitcher of Breton cider with two bowls, on a bare table |
| Cidre B | 4:5 | A crêpe flambéed at the table, the blue flame caught mid-pour |
| Private room | 3:2 | The light first-floor private room, set for a party |
| Find us | 4:5 | The frontage on Hill Rise, shot from across the street |

## Build note

The pages are plain static HTML. They were generated once from a small Python script (menu data, contour and rose SVGs) kept outside the repo. Edit the HTML directly from here on.
