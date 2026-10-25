# Concept A, "La Carta": notes

The site is a two-ink menu card: red and black on white card stock, with a margin column of running notes. Plain HTML, CSS and JS: `index.html`, `menu.html`, `css/carta.css`, `js/carta.js`. All illustration is inline SVG drawn for this concept. There are no image files, so `img/` is empty.

## Photography to commission

| Shot | Where it goes | Frame |
|---|---|---|
| The shirts on the line, shot from below in lunch light, with the deep-blue ceiling behind | Homepage gallery, tall left plate | 4:5 portrait |
| The Kew Road frontage at dusk: fairy lights on, cream sign lit, terrace tables laid | Homepage gallery, wide plate | 3:2 landscape |
| A table, overhead: white cloth, yellow napkin, the yellow rose | Homepage gallery, square plate | 1:1 |
| Zabaglione being whisked to order: hands and pan, close and warm | Homepage gallery, offset plate | 4:5 portrait |

Each slot already has a fixed aspect ratio, so a photo can replace the `.plate__mark` block with an `<img loading="lazy" width height>` and nothing will shift.

## Logo
The red script is set as a working wordmark in Young Serif. A labelled **logo slot** sits beside the hero drawing. The original wordmark (red script, green stroke, spaced RISTORANTE) needs to be supplied as vector art (SVG or PDF) and placed there, and it can also replace the header wordmark.

## Implementation
- **Without JS**, the page is complete: the date line reads "Aperti tutti i giorni", booking falls back to plain OpenTable and phone links, and the Mark the menu buttons don't render.
- **Motion** uses GSAP 3.12.5 and ScrollTrigger from cdnjs and only runs when `html.motion` is set, which needs JS plus no reduced-motion preference. A 2-second failsafe in `<head>` removes the class if GSAP never arrives. On phones, text doesn't fade in on scroll; only rules and strokes draw.
- **Mark the menu** is in `js/carta.js` (`setupMarker`). Each item carries `data-tags` (`v`, `fish`, `kids`, `lunch`). Each ellipse is generated from a hash of the dish name, so every dish gets its own loop, and it is redrawn on resize. On screens under 1024px the controls move into a sticky bar under the running strip.
- **Booking** opens the plain OpenTable URL. Once the system is confirmed, party, date and time could be passed as query parameters.
- `menu.html` is static HTML. It was generated once from the copy deck so that the dish markup stays consistent.

## Spelling corrections from the old site
Bruchetta → Bruschetta · Mortadela → Mortadella · Bisteca → Bistecca · "al griglia" → "alla griglia".

## Still to confirm (all marked in-page with "to confirm" and `<!-- [TO CONFIRM] -->`)
Opening year (1983), hours and kitchen/last-order times, the Xpress Lunch price (£11.95 or £18.95) and full list, children's menu price, party menu price and full list, Christmas menu details, prices with no source (zuppa, pane all'aglio, tagliatelle positanese, quattro formaggi, seafood pizza), the seafood pizza's Italian name, the Insalate section and lasagne price (third-party only), the wine and drinks list, dietary markers, the booking system, the online offer (10% or 20%), the Kew Gardens walking time, parking, Deliveroo and Uber Eats, and how the owners want the Portuguese family told.
