# Chez Lindsay · Concept A · "Ce midi, ce soir" (the service clock)

**The concept in two lines.** The site always knows what Chez Lindsay is serving right now (galettes and set lunch, happy hour, la carte, steak night, Sunday brunch or "Fermé le mardi") and says so in plain words at the top of every page. It is a calm, classic brasserie board in the restaurant's own olive and linen, with a bordeaux Book button.

Local preview: `python3 -m http.server 8301 --directory richmond-sprint/chez-lindsay/concept-a`, then open `http://localhost:8301/`.

## Files

| Path | What it is |
|---|---|
| `index.html` | Homepage: hero, service clock, weekly hours, galettes, the weekly rituals, wine bar and cider, private room, booking, find us |
| `menu.html` | All six menus as HTML in accessible tabs (static output; see "Menu page") |
| `css/site.css` | All styles, tokens and the fallback-font metrics |
| `js/service.js` | **The service model.** Pure functions (`serviceAt`, `serviceFor`, `ritualStatus`, `segmentsFor`, `fmtTime`). Works in the browser and in Node |
| `js/site.js` | Sticky "Now serving" bar, today's row in the hours table, the OpenTable hand-off |
| `js/clock.js` | The SVG dial, the timeline strip, the day/time preview and the ritual "next" markers |
| `js/menu.js` | The tablist (arrow keys, Home/End, `aria-selected`, deep links) |
| `tests/service.test.js` | Node tests for the model: `node tests/service.test.js` |
| `img/favicon.svg` | The favicon as a file (the pages use the same SVG inline as a data URI) |

## How the service clock works

1. `londonParts(date)` reads the weekday and hh:mm in **Europe/London** with `Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/London', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })`. The visitor's own device time zone never matters, and BST/GMT changes are handled by the platform.
2. `serviceFor(dayIndex, minutes)` is pure and holds the published rules:
   - Mon and Wed–Sat 12:00–22:00; Sun 12:00–21:00; Tue closed.
   - 12:00–17:00 lunch (set lunch and galettes); Sunday 12:00–17:00 is brunch (plus set lunch and galettes).
   - From 17:00, la carte and desserts; on Wednesday it is steak night (plus la carte).
   - Happy hour 16:00–18:00 on Mon, Wed, Thu and Fri. There is no Tuesday happy hour, because the restaurant is closed.
   - Boundaries are start-inclusive and end-exclusive: 17:00 is evening, 18:00 is after happy hour, 22:00 (Sun 21:00) is closed.
   - It returns the state (`open`, `before`, `after`, `closed-day`), the service, happy hour, the menus being served (as tab ids), the primary tab, the "until" time and the next opening. It also returns the wording: a title, a detail sentence, and the two short lines for the sticky bar.
3. `serviceAt(date)` = `serviceFor(londonParts(date))`.
4. The **closed states are written as hospitality, not errors**: "Opening at noon: from 12 noon, galettes and set lunch until 5pm"; "Closed for tonight: we closed at 10pm. Back on Wednesday at noon… We close on Tuesdays."; "Fermé le mardi: closed all day on Tuesdays. Back on Wednesday at noon, with steak night from 5pm."
5. **Visible surfaces:**
   - The sticky bar on every page: "Now · until 5pm / Galettes & set lunch". It links to the matching menu tab.
   - On the homepage, the dial (≥640px), the summary, and links to the menus being served.
   - The weekly ritual markers ("On now, until 10pm" / "Next: Wednesday from 5pm").
   - Today's row in the hours table.
   - On the menu page, the pre-selected tab, the "serving now" markers on tabs and a sentence above them.
6. **The dial** is a noon-to-midnight face (12 at the top means noon), so the services read like a real clock: the lunch band runs 12→5, the evening band 5→10 (9 on Sunday) and a dotted happy-hour arc 4→6. The hour and minute hands show the actual time and ease to it once (600ms), and are set instantly with reduced motion. Before noon the bands are ghosted, because the hands are then on the morning. A small window shows the French weekday (LUN, MAR…). On Tuesday the face reads "Fermé / le mardi".
7. **Preview:**
   - Seven day radios (native arrow-key behaviour) and a native range slider over the timeline strip. The slider runs 11am–11pm in 15-minute steps, with `aria-valuetext` such as "Saturday, 7.30pm".
   - The summary switches to "Preview · Saturday, 7.30pm" and "Back to now" appears. The text summary is an `aria-live="polite"` region and is only rewritten when it changes.
   - Live mode re-checks at the top of every minute and when the tab becomes visible again.
8. **No JS:** the summary shows a static line ("Lunch from noon, la carte from 5pm…"), the weekly hours/service table is always present, and the preview controls are not shown (they need JS).

### Test results (Node, `node tests/service.test.js`)

Every case starts from a real UTC instant, so the Intl conversion is exercised too. The suite was run with the device zone set to UTC, America/Los_Angeles and Asia/Tokyo: **44 passed, 0 failed** in each (Node v22.22.0, ICU 77.1). The last line is an exhaustive sweep of all 10,080 minutes of the week against an independent restatement of the rules.

```
pass  Tuesday 2pm (closed all day)  ->  Fermé le mardi | Fermé le mardi · opens Wednesday at noon
pass  Tuesday 00:30 (just after midnight)  ->  Fermé le mardi | Fermé le mardi · opens Wednesday at noon
pass  Tuesday 23:59  ->  Fermé le mardi | Fermé le mardi · opens Wednesday at noon
pass  Sunday 9.30pm (after the 9pm close)  ->  Closed for tonight | Closed · opens tomorrow at noon
pass  Sunday 9pm exactly (closing time)  ->  Closed for tonight | Closed · opens tomorrow at noon
pass  Sunday 8.59pm (last minute open)  ->  La carte & desserts | La carte · until 9pm
pass  Sunday 1pm (brunch)  ->  Sunday brunch, galettes & set lunch | Sunday brunch & galettes · until 5pm
pass  Wednesday 6pm (steak night, happy hour just over)  ->  Steak night & la carte | Steak night & la carte · until 10pm
pass  Wednesday 4.59pm (lunch + happy hour, not yet steak)  ->  Galettes & set lunch | Galettes & set lunch · until 5pm
pass  Wednesday 5pm (steak night + happy hour)  ->  Steak night & la carte | Steak night & la carte · until 10pm
pass  Monday 4.30pm (lunch + happy hour)  ->  Galettes & set lunch | Galettes & set lunch · until 5pm
pass  Monday 11am (before opening)  ->  Opening at noon | Opens today at noon
pass  Monday 10pm (closed; Tuesday skipped)  ->  Closed for tonight | Closed · opens Wednesday at noon
pass  Monday 9.59pm  ->  La carte & desserts | La carte · until 10pm
pass  Thursday noon exactly (opening)  ->  Galettes & set lunch | Galettes & set lunch · until 5pm
pass  Friday 5.59pm (evening + happy hour)  ->  La carte & desserts | La carte · until 10pm
pass  Friday 6pm (happy hour over)  ->  La carte & desserts | La carte · until 10pm
pass  Saturday 4.30pm (no weekend happy hour)  ->  Galettes & set lunch | Galettes & set lunch · until 5pm
pass  Saturday 11.59pm  ->  Closed for tonight | Closed · opens tomorrow at noon
pass  BST: 11:30 UTC on Wed 15 Jul = 12.30pm London (lunch)  ->  Galettes & set lunch | Galettes & set lunch · until 5pm
pass  BST: 16:00 UTC on Wed 15 Jul = 5pm London (steak night)  ->  Steak night & la carte | Steak night & la carte · until 10pm
pass  GMT: 11:30 UTC on Wed 16 Dec = 11.30am London (before)  ->  Opening at noon | Opens today at noon
pass  Clocks go back: Sun 25 Oct 12:30 UTC = 12.30pm GMT (brunch)  ->  Sunday brunch, galettes & set lunch | Sunday brunch & galettes · until 5pm
pass  Clocks go back: Sat 24 Oct 21:30 UTC = 10.30pm BST (closed)  ->  Closed for tonight | Closed · opens tomorrow at noon
pass  Clocks go forward: Sun 29 Mar 11:15 UTC = 12.15pm BST (brunch)  ->  Sunday brunch, galettes & set lunch | Sunday brunch & galettes · until 5pm
pass  GMT: Sat 31 Oct 23:00 UTC = 11pm London (closed)  ->  Closed for tonight | Closed · opens tomorrow at noon
pass  Steak night, from Monday 10am  ->  Wednesday from 5pm
pass  Steak night, Wednesday 6pm  ->  On now, until 10pm
pass  Steak night, Wednesday 10.30pm  ->  Next Wednesday from 5pm
pass  Steak night, Wednesday 1pm  ->  Tonight from 5pm
pass  Happy hour, Saturday 4.30pm  ->  Monday from 4pm
pass  Happy hour, Monday 6pm  ->  Wednesday from 4pm
pass  Happy hour, Friday 5.30pm  ->  On now, until 6pm
pass  Happy hour, Thursday noon  ->  Today from 4pm
pass  Sunday brunch, Sunday 1pm  ->  On now, until 5pm
pass  Sunday brunch, Sunday 5pm  ->  Next Sunday from noon
pass  Sunday brunch, Saturday evening  ->  Tomorrow from noon
pass  fmtTime(720) = noon
pass  fmtTime(0) = midnight
pass  fmtTime(1020) = 5pm
pass  fmtTime(1170) = 7.30pm
pass  fmtTime(665) = 11.05am
pass  fmtTime(1320) = 10pm
pass  sweep: all 10,080 minutes of the week match the published rules

44 passed, 0 failed (Node v22.22.0, ICU 77.1)
```

The in-browser check used Playwright with the page clock pinned. Wed 6pm, Tue 2pm, Sun 1pm, Mon 11am and Mon 10.30pm each produced the expected bar text, summary, ritual markers and menu tab pre-selection (Wed 6pm → Steak night tab; Sun 1pm → Galettes; closed → Galettes).

## Menu page

- **Tabs:** Galettes · Set lunch · La carte · Desserts & crêpes · Steak night · Les vins.
  - Without JS these are jump links and all six menus show in turn.
  - With JS they form a real `role="tablist"`, with roving tabindex, ←/→/↑/↓, Home/End and Space, `aria-selected`/`aria-controls`, and `role="tabpanel"` panels that can take focus. Panels cross-fade in 200ms, with no fade under reduced motion.
- **Deep links:** `menu.html#galettes`, `#set-lunch`, `#carte`, `#desserts`, `#steak-night`, `#vins` open that tab. Sub-anchors such as `#vins-red` open the wine tab and scroll to the red wines.
  - With no hash, the clock picks the tab being served now.
  - The choice is made by a tiny inline script in `<head>` (after `service.js`) that sets `data-tab` on `<html>` before first paint, so there is no layout shift. Clicking a tab updates the hash with `replaceState`.
- **Set lunch:**
  - Only the course prices (two courses £24.50, three courses £28.50) and the supplements are shown, as "Supplement £7" and "Supplement £4". The source prints "£7 supplement" once and "7 supplement" elsewhere; the £ was made consistent.
  - The unexplained per-dish figures are left out.
  - The menu is labelled as a sample, as the restaurant does.
- **The allergen line** ("Please speak to our staff about your food allergies and intolerance before ordering.") is on every panel, including the wine list. The service-charge line is on every panel too.
- **Wine list:**
  - Grouped by colour (Sparkling & Champagne, White, Rosé, Red, Dessert wine & port, Alcohol-free, Cidre, Kir/pommeau/spritz), with small colour swatches and a "By colour" jump bar.
  - Each colour is a real `<table>` with per-measure columns (125ml/bottle, 175/250/500ml/bottle, 250ml/pitcher/bottle). Prices are right-aligned in tabular figures, and "–" marks "not available by this measure", with screen-reader text.
  - Beer, water, coffee and spirits follow as aligned lists.
  - Biodynamic and organic marks from the key are written out as words.
- `menu.html` is **static HTML**. It was produced once from a transcription of the copy deck by a throwaway script kept outside the repo; there is no build step. Edit the HTML directly.

## Deviations and decisions (and why)

1. **[sic] spellings corrected:** each is listed here as **[TO CONFIRM]**, with an HTML comment beside it in `menu.html`. All other menu text is verbatim, including the house capitalisation and "puree", "mix leaves", "sour dough" and "Bearnaise".
   - "Pimm's spitz" → "spritz" (La carte aperitifs) [TO CONFIRM]
   - "paprika maya" → "paprika mayo" (Salad de Crabe) [TO CONFIRM]
   - "chutney de figures" → "chutney de figues" [TO CONFIRM]
   - "Kaffer lime" → "Kaffir lime" (Filet de Halibut) [TO CONFIRM]
   - "seved" → "served", "pearl barely" → "pearl barley", "Parmensan" → "Parmesan" (Suprême de Volaille, set lunch) [TO CONFIRM]
   - "Le Pioneer" → "Le Pionnier", to match the wine list (Steak night, Silver) [TO CONFIRM]
   - Homepage only: the brunch banner's "2 galettes + 2 drink of your choice" is written as "Two galettes and two drinks of your choice" [TO CONFIRM]
2. **Brunch price:** £31.5 is shown exactly as published, with the "to confirm" marker. The page says plainly that per person or per two, and which drinks, are still to be confirmed.
3. **Sunday lunch:** the copy deck says lunchtime service (set lunch and galettes) runs 12–5pm, and galettes are served "every day until 5pm". Sunday 12–5pm is therefore modelled as brunch **plus** set lunch and galettes. If the restaurant serves only brunch on Sundays, change `MENUS.brunch` and the Sunday wording in `service.js`.
4. **Desserts tab:** the menus page says "Evening Service from 5pm: La Carte & Les Desserts", so desserts are shown as from 5pm and are not marked as on at lunch. The set lunch has its own desserts.
5. **Happy hour:** it is shown on the wine tab (it is printed on the wine list). The clock marks the wine tab "serving now" during happy hour.
6. **The Daily Special** is mentioned on La carte with a "to confirm" marker; its contents are unknown.
7. **The wordmark** is a *working wordmark*: "Chez Lindsay" in Gilda Display over tracked Jost capitals "Restaurant & Wine Bar". It deliberately does not imitate or trace the hand-drawn logo. Replace it with the real logo once the vector file and rights are confirmed.
8. **"Ouvert 6 jours"** (one of the site's own phrases) is the no-JS kicker in the sticky bar. "Toujours Ouvert!" and "open all day, every day" are not used anywhere.
9. **Not used, by design:**
   - No press quotes or reviews.
   - No gluten-free wording, no allergen icons.
   - No step-free access claim.
   - No owner or chef names.
   - No social links (whether the accounts are active is to be confirmed).
   - The food hygiene rating (5, FSA, inspected 8 August 2026) is used once, in the footer, because the copy deck lists it as confirmed.
10. **Booking:**
    - The OpenTable link is built from the published widget ID and marked "to confirm".
    - With JS, the button calls `window.open`; the page says what happened, or shows a plain link if the browser blocked the tab. The page never navigates itself and never claims a booking.
    - Without JS, it is an ordinary `target="_blank"` link.
    - Phone and email always sit beside it, and the private room for 12 to 40 is mentioned.
11. **Fallback fonts:** the serif fallback is Times New Roman, not Georgia, because the metric overrides were measured against Liberation Serif (metric-compatible with Times New Roman). Measured overrides:
    - Gilda: size-adjust 109.7%, ascent 81.1%, descent 26.4%
    - Jost: 95.4% / 112.1% / 39.8%

## Checks run (Playwright, Chromium, served on :8301)

- **Widths 320, 390, 768, 1024, 1440 and 2560, both pages:**
  - no horizontal overflow
  - 0 console errors or warnings
  - 0 failed requests
  - layout shift ≤ 0.008 everywhere
- **axe-core 4.10 (WCAG 2.0/2.1/2.2 A and AA, plus best practice):** no violations on either page at 390 and 1440, across several clock states.
- **Links:** every internal link and anchor resolves, and there are no duplicate ids. External links go only to the approved destinations (tel:, mailto:, the OpenTable hand-off, a Google Maps search, chez-lindsay.co.uk).
- **Tap targets:** every non-inline control is at least 44px tall.
- **No JS:** the homepage keeps the hero, the static clock summary and the weekly table. The menu page shows all six menus.
- **Reduced motion:** the hands are set without easing, there is no panel fade, and scrolling is not smooth.
- **Screenshots** (not in the repo): `/tmp/claude-0/-home-user-Claude-code/e50707d5-9ec5-571e-9915-9e7145ebe50f/scratchpad/sprint/chez-lindsay-a/`

## Known limitations

- **The clock reflects published hours only.** Bank holidays, Christmas and kitchen last orders are unknown and marked "to confirm" on the page. The model would need an exceptions list (dates → hours) once the restaurant supplies them.
- **The clock trusts the visitor's device clock** for the current instant; only the zone is forced to London. A device with a wrong clock sees the wrong service.
- **The preview slider covers 11am–11pm.** Live times outside that range still show correctly in the text and on the dial, but the strip marker rests at the nearer end.
- **Below 640px the dial is replaced by the strip, by design.** The dial's SVG labels are decorative and hidden from assistive technology, so the text summary carries the meaning.
- **Fallback-font metrics** were tuned against Liberation fonts. Results on macOS and Windows (real Times New Roman and Arial) should match closely but were not measured there.
- **Menu content needs keeping in step with the PDFs.** There is no CMS; menus are HTML in `menu.html`.

## Assets to replace

- The working wordmark → the restaurant's hand-drawn logo (vector; rights to confirm).
- Eight image slots → commissioned photographs (shot list below).
- Gill Sans is not used (web licence unknown). Jost stands in as the geometric nod the brief asked for.

## Photography shot list (to commission)

| Slot | Shot | Ratio | Notes |
|---|---|---|---|
| Hero | The room, set for evening service | 16:9 | Warm lamplight, tables laid, no diners in focus |
| Galettes | A galette on the griddle | 4:5 | Overhead, batter just set, the spreader in frame |
| Galettes | A complète, folded, its yolk at the centre | 1:1 | On the plate, from above |
| Galettes | A crêpe flambéed at the table | 3:2 | Low light, the blue of the flame |
| Wine bar | A pitcher of Breton cider | 4:5 | On the bar, two bowls beside it |
| Wine bar | Six oysters and two glasses of crémant | 1:1 | Happy hour, late-afternoon light |
| Private room | The first-floor private room, laid for a party | 3:2 | Daylight, long table, white linen |
| Find us | The frontage on Hill Rise | 4:5 | From across the street, early evening, windows lit |
