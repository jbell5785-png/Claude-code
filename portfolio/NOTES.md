# Joseph Bell portfolio: notes

**In two lines:** the site is a field notebook of Richmond's independent places: ink drawings, blue-pencil notes in the margin, and one highlighter. Its signature is the method itself: a generic template restaurant page that gets marked up and redrawn into a specific place as you scroll.

Serve locally: `python3 -m http.server 8801 --directory portfolio`, then open http://localhost:8801/.

**Don't upload** `NOTES.md` or `_drawings/` when deploying. They're working files. Everything else in this folder is the site.

---

## The swap test, applied to Joseph
What only Joseph has: he's a local designer who goes and looks at a place, and then draws it. So the site is his sketchbook:
- **The hero** is a pen sketch of a parade of independent shopfronts with the signboards left blank, annotated in blue pencil ("what's only here?"). It isn't a real parade.
- **Layout logic: the notebook margin.** From 960px up, every section has a margin column on the left for the pencil label and a note, divided by a blue rule, with the content to its right. On phones the label sits above the content.
- **The paper:** a faint blue dot grid. Case-study drawings are taped in with tape strips.
- **Three inks:** ink black, blue pencil (all annotations, labels and links of note) and a highlighter yellow-green (the one thing that matters on each screen).
- **The services** are set as a menu card, with dotted leaders that end in "Ask for a quote" instead of prices.

## The signature: "Watch a template turn into a place" (`#swap-test`)
- **Four steps**, driven by scroll position:
  1. **The template:** a generic page with a stock photo, "Welcome to Our Restaurant", a PDF button and three identical cards.
  2. **Mark it up:** blue pencil circles and strikes through each generic thing, with notes such as "stock photo: could be anywhere", "swap the name: still works", "old PDF = old prices" and "the same three boxes as everyone".
  3. **Redraw it:** the page is wiped and redrawn in ink as a riverside café under a brick arch. The keystone face, the glazed screen and the festoon bulbs light up, the menu appears as real text, and the buttons become "Call the café" and "Find the arch".
  4. **The result:** "passes the swap test" is ticked and highlighted, and the face's eyes drop to look at you.
- **How it works:**
  - The section is 250svh tall, with a sticky stage of 100svh minus the header. The page scrolls natively and `js/site.js` only reads the scroll position (`requestAnimationFrame`), so there's no scroll-jacking. Steps change at 14%, 42% and 72% of the track.
  - The transitions are CSS: `clip-path` for the wipe, `stroke-dashoffset` with `pathLength="1"` for the pencil and the ink, and opacity for the notes.
  - On desktop the four step captions sit beside the mock, with the active one highlighted. On phones only the active caption shows, under the mock.
- **Reduced motion and no JS:** a designed static state. "Before: a template, marked up" and "After: redrawn from the place" sit side by side (stacked on phones), fully drawn, with the four steps as a list. The `motion` class is set in `<head>` before first paint, so there's no layout shift. A 3-second failsafe removes it if `site.js` never runs.
- **Assistive tech:** the mocks are `aria-hidden`, and the ordered list of steps carries the meaning (`aria-current="step"` in the motion version).
- The demonstration café has no name. Its wordmark reads "under the arch".

## Type and colour
- **Fonts:**
  - **Schibsted Grotesk** (400–800) for all print-like text;
  - **Kalam** (400, 700) for the pencil notes.
  - Neither appears anywhere else in the repo or on either banned list.
- **Metric-matched fallbacks**, measured from the font files:

  | Fallback | Schibsted size-adjust (400 / 800) | Kalam size-adjust |
  |---|---|---|
  | Arial / Liberation Sans / Arimo | 104.5% / 104.2% | 97.8% |
  | Roboto | 108.1% / 110.1% | 101.2% |
  | Noto Sans | 105.7% / 99.2% | 99.0% |
  | DejaVu Sans | 91.3% / 86.5% | 85.5% |

  - Ascent and descent overrides are in `css/site.css`.
  - **Checked:** with Google Fonts blocked, every heading and paragraph on both pages lands at the same position and height as with the web fonts, at 390 and 1440. Text widths are within 2% for Liberation and DejaVu.
- **Palette:**
  - paper #F3F4EE, card #FBFBF8, ink #17191B;
  - secondary ink #464B51 (8.1:1 on paper);
  - pencil #2346C0 (7.0:1 on paper);
  - highlighter #E9F36A (only ever behind ink or pencil text).
- **No dark mode.** It's a paper notebook, so `color-scheme: light` is set.

## Files
- `index.html`: hero, the swap-test signature, work (four case studies), method, the AI check summary, services, about and contact.
- `ai-check.html`: explains the AI visibility check, with anonymised findings, the blind test with its caveats in full, what a website changes and what it doesn't, and the monthly check.
- `css/site.css`, `js/site.js` (the signature only), `llms.txt`, `robots.txt`.
- `_drawings/draw.py`: source for every inline drawing. To change one, edit it and run `python3 _drawings/draw.py .` from this folder. It rewrites the SVG between the `<!--@svg name-->` and `<!--@end-->` markers in the HTML.
- Every drawing is original inline SVG, drawn from scratch: the parade, the shirts, the awnings, the wall sign, the arch, the two mock pages and the phone. There are no image files, photos or logos.

## Anonymity (Joseph's rule)
- No business names, addresses, street names, phone numbers or logos anywhere in this folder: text, alt text and SVG titles, structured data, `llms.txt`, code comments or file names. Checked with a grep for every prospect name, street and site, plus booking-platform names.
- Case studies are described by type:
  - **Case 1:** "A neighbourhood Italian restaurant" (marked "The room I used to work in").
  - **Case 2:** "A family-run Japanese restaurant".
  - **Case 3:** "A historic tearoom and bakery".
  - **Case 4:** "A riverside café under a bridge arch".
- **Imagery:** new small drawings of each *idea*, not screenshots. Lettering is drawn as unreadable brush strokes, and every signboard, fascia, awning and keystone is blank or generic. All were checked at full size.
- The AI check findings on `ai-check.html` are described by business type only.

### Switching a case study to its named version (once the owner agrees)
The mapping from case to business lives outside this folder, in `HANDOVER.md` and the sprint folders:
- **Case 1:** the first project, at the repo root.
- **Cases 2–4:** the three Round 2 businesses: the Japanese restaurant, the tearoom and the riverside café.

Any of the four can switch independently. For each one:
1. Change the `<h3>` from the type to the business name. Keep the type as the subtitle.
2. Add a line: "Unsolicited concept, shown with the owner's permission", with a link to the shared preview.
3. Optionally, replace the drawing with a screenshot of the concept, or keep the drawing and add the screenshot.
4. Rename the row in both blind-test tables (`index.html#ai-check` and `ai-check.html#test`), and the line in `llms.txt` under "Work". Case 1 has no blind-test row because no Google check has been run for it yet.
5. Update the footer line "shown unnamed until their owners agree" if *all* of them become named.

## Placeholders and things still to add
- **Portrait** (optional): a dashed slot in the About block, marked `[TO CONFIRM]` on the page and in an HTML comment. Joseph decides whether it's drawn or a photo. Delete the `<figure class="portrait">` if he doesn't want one.
- **Domain:** not known yet. Once it is, add `url` to the JSON-LD, plus `og:url`, `<link rel="canonical">`, a sitemap line in `robots.txt`, and absolute links in `llms.txt`.
- **No `og:image`:** add a 1200×630 crop of the hero sketch if wanted.
- **Already applied, from Joseph:**
  - email jbell5785@gmail.com and phone 07931 373488 (`tel:+447931373488`);
  - the bio line "Web designer in Richmond.";
  - no mention of AI in how the sites are designed, built or researched. AI appears only as the visibility service he sells.

## Content sources and honesty
- **Facts about Joseph** are limited to the brief: his name, Richmond, his former job at an Italian restaurant locally (not named), his services and his method. No clients, testimonials, awards, years or qualifications are claimed. No prices.
- **Case-study facts and findings** come from the concepts' own NOTES and the AI visibility README.
- **Blind-test numbers:** 17→20, 16→20 and 10→18. The tearoom's figures are from the fairer re-run. Every place the numbers appear carries the caveat (small, simulated, accuracy not rankings, nobody can guarantee rankings), and `ai-check.html` lists all the caveats, including scorer variance.
- **The demonstration café** in the signature (its menu lines and buttons) is a generic demo and is labelled as one in the static state.

## QA (port 8801)
- Run with `PAGES="index.html ai-check.html" WORK=<scratch> pipeline/tools/qa.sh portfolio 8801 portfolio`.
- **Results:**
  - no console errors, failed requests, bad links or axe violations (WCAG 2 A/AA) at 390 and 1440;
  - no overflow at 390, 768 or 1440;
  - CLS 0 to 0.001;
  - no banned-word or banned-font lint hits.
- **Extra checks:**
  - no horizontal overflow on either page at 320, 360, 414, 600, 900, 1024, 1280, 1920 or 2560;
  - the no-JS and reduced-motion first frames are complete.
- **Tool change:** `pipeline/tools/review.js` and `qa.sh` now accept a `PAGES` environment variable (space-separated) in place of the default `index.html menu.html`. The default behaviour is unchanged.
- **Not tested:** real iOS Safari or Android devices.
