# Caffè Mamma: three website concepts

An unsolicited redesign pitch for Caffè Mamma Ristorante, 110 Kew Road, Richmond TW9 2PQ. Background is in `research.md`; the brief and the three directions are in `brief.md`.

## How to open each concept

**On a phone or laptop (published copies):**
- A, "La Carta": https://claude.ai/artifact/VemRPwVwYPiq1Gf9o7Tqtt
- B, "Sera": https://claude.ai/artifact/4dxyaUUBrt5oHcQF5gTh5K
- C, "Bucato": https://claude.ai/artifact/32mhWYVm4GGgDWvjutUUwH

Inside the claude.ai viewer, call and email links may do nothing, and pop-ups are blocked, so booking shows a "Continue to OpenTable" link. On a real website both work normally.

**From this repo:** serve a folder and open it in a browser. Opening the file directly also works, but fonts and motion load more reliably over HTTP.

```
python3 -m http.server 8000 --directory concept-a   # then http://localhost:8000
```

Each folder (`concept-a`, `concept-b`, `concept-c`) is self-contained: `index.html` (homepage), `menu.html` (full menu), `css/`, `js/`, `img/`, and `NOTES.md` (photography shot list and implementation notes).

## The three directions

| | A "La Carta" | B "Sera" | C "Bucato" |
|---|---|---|---|
| Idea | The site is the trattoria's printed menu card | The walk down Kew Road from afternoon into evening | The line of shirts across the dining room as the identity |
| Type | Young Serif + Instrument Sans | Italiana + Hanken Grotesk | Bricolage Grotesque + Atkinson Hyperlegible |
| Colour | White card, red and black ink | Light that shifts with scroll, ending in night | Flat red, ceiling blue, napkin yellow, green |
| Layout | Broadsheet grid with a sticky margin column | Full-screen scenes, subtitle-style type | Poster blocks hung from sagging lines |
| Menu | One continuous typeset card with dotted price leaders | One course on stage at a time, sticky course rail | Hanging course tags, big bold dish list, prices on tags |
| Signature | "Mark the menu": a red pen circles vegetarian, fish, kids or lunch-deal dishes | "The lights come on": the illustrated frontage goes from day to night and the fairy lights switch on bulb by bulb | The washing line: shirts that say MENU, PRENOTA, PIZZA and DOVE sway, swing back when tugged, and work as navigation |
| Motion | Ink lines draw in; nothing tied to scroll | Slow, scroll-scrubbed, film-style fades | Springy physics and bounce |
| Feels like | Calm, classic, trustworthy | Romantic, a dinner date | Loud, funny, local |

## Recommendation

**Concept C, "Bucato".** It is built on the one thing no other restaurant in Richmond has: the washing line, from "the restaurant with the washing" on Hill Street to the shirts over today's tables. It turns that into an identity that could carry onto menus, signage, takeaway boxes and social media. It is also the most direct to use on a phone: big tap targets, a fixed Book / Menu / Call bar, and a menu that scans fast.

Two cautions. It is loud, so the owners need to want that. And it needs the real logo and photography to stop the flat colour feeling like a template.

If the owners want something quieter, choose **A**: it is the lowest-risk option and the easiest for them to maintain. A's "Mark the menu" filter could also be carried into C's menu page. **B** is the most atmospheric, but it depends most on motion and on future photography matching the illustration, and it does least for a lunchtime visitor in a hurry.

## Real assets needed to launch

- **Logo:** the original red script "Caffè Mamma", green stroke and spaced RISTORANTE, as vector art (SVG or PDF). Every concept has a labelled logo slot.
- **Photography:** a commissioned shoot covering the line of shirts from below; the frontage at dusk with the fairy lights on; the terrace at lunch; a set table (white cloth, yellow napkin and rose); the curved staircase and the function room; and four to six dishes (a pizza, a pasta, the zabaglione). Each concept's `NOTES.md` lists the exact shots and where they go.
- **Confirmed content:** the current menu with prices, dietary information and the allergen sheet; opening and kitchen hours; the booking system and its booking link (OpenTable restaurant ID, if staying with OpenTable); the current offers; the set-menu details; and the wine list.
- **Decisions from the owners:** how they'd like the story told (the 1983 start, the Portuguese family); whether the shirts can be photographed (some may carry club crests, which would need care); and delivery platforms to link.
- **Technical:** a domain and hosting for a static site, a privacy notice (no tracking is used), and a decision on who updates the menu (a small CMS or a simple data file).

## Everything marked [TO CONFIRM]

Each appears on the pages with a small "to confirm" marker and in the HTML source as `<!-- [TO CONFIRM] -->` (`grep -rn "TO CONFIRM" concept-*`).

- Opened in 1983 on Hill Street (the "about 25 years" in listings conflicts with this).
- How to tell the Portuguese-owner part of the story.
- Opening hours, "7 days, 12 noon to 11pm" (from the door decal), plus kitchen and last-order times.
- Walking time from Kew Gardens.
- Free street parking after 4.30pm is still true.
- Booking system: OpenTable, or something else.
- Online-booking offer: 10% Monday to Friday (current homepage), or 20% Sunday to Friday (another page).
- Delivery platforms: Just Eat is confirmed; Deliveroo and Uber Eats are not.
- Every menu price (taken from the current website, which may be out of date).
- Prices unknown: soup of the day, garlic bread, Tagliatelle positanese, Quattro formaggi, the seafood pizza (and its Italian name).
- The insalate section, and the lasagne (found only on a third-party listing).
- Dietary markers (V is inferred from dish names; no vegan or gluten-free information exists).
- Xpress Lunch price (£11.95 or £18.95) and full dish list.
- Children's menu price (£9.95).
- Party set menu price (£23.95) and full dish list.
- Christmas menu details.
- Full wine and drinks list.
- Spelling corrections from the old site: Bruchetta → Bruschetta, Mortadela → Mortadella, Bisteca → Bistecca, "al griglia" → "alla griglia".

## Self-assessments

How each concept was checked: the agent that built it did two screenshot review passes. I then did a quick check of each one for console errors, broken links, accessibility (axe), horizontal overflow and layout shift at 390, 768 and 1440px, and fixed what I found. They have not yet been tested on a real phone or in Safari.

**A, "La Carta"**
- **Strong:** the clearest menu of the three. The red-pen filter is useful as well as charming. The type is calm and confident. It has the lightest motion and works fully without JavaScript.
- **Falls short:**
  - The desktop hero has too much empty space beside the wordmark.
  - The gallery is four large blank frames until there is photography.
  - The editorial broadsheet look sits close to a common style, and only the red-pen detail keeps it the restaurant's own.
  - A top studio would draw the washing-line illustration by hand, not as a programmatic line.

**B, "Sera"**
- **Strong:** the illustrated frontage and the lights coming on make the most memorable moment of the three. The night menu is elegant to read, and contrast is handled carefully at every stage of the light.
- **Falls short:**
  - The full-screen scenes leave a lot of empty space on phones.
  - The colour rewinds from night back to afternoon after the hero, which can feel like a jump.
  - Italiana is delicate at small phone sizes.
  - Scroll-tied effects are the part most likely to feel heavy on older phones.
  - The illustrated stand-in for the logo on the fascia needs replacing.

**C, "Bucato"**
- **Strong:** the most distinctive identity. The swaying shirts are a signature people will remember and talk about, and they are real, accessible links. The menu is fast to scan, and the colour contrast is careful throughout.
- **Falls short:**
  - The flat colour blocks and the yellow "to confirm" tags make it busy.
  - The image slots are bold colour fields that will look unfinished until there are photos.
  - The slashed zeros in Atkinson Hyperlegible look odd in phone numbers.
  - The no-JS angles for the garments rely on newer CSS; older browsers will show them hanging straight.
