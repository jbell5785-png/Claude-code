# Matsuba: research dossier

Researcher's dossier for a speculative website-redesign proposal. All access dates are **25 October 2026** unless stated. Status key: **VERIFIED** (official site or several agreeing sources), **REPORTED** (one third-party source, possibly dated), **UNKNOWN**. Evidence (page text, HTML, screenshots, downloaded PDFs and images) is in the scratchpad at `/tmp/claude-0/-home-user-Claude-code/e50707d5-9ec5-571e-9915-9e7145ebe50f/scratchpad/prospects/matsuba/pages/`. It is evidence only and must not be copied into the repo.

## Summary

1. Matsuba is a family-run Japanese restaurant at 10 Red Lion Street, Richmond TW9 1RW, "First opened in 2004" (official site). Harden's reports that a Korean family runs it and that it has about 30 covers.
2. The menu is extensive and fully published as HTML: about 140 menu entries across nine tabs, including sushi and sashimi, carpaccio, Stonepot Bibimbap, a lunch bento menu, a £100-per-person tasting menu, and separate vegan and gluten-free PDFs.
3. Booking goes through Favourite Table and ordering through Toast. Both are linked from the site, but booking needs two taps and a detour through an intermediate page, and the phone number is not tappable.
4. The site runs on a WordPress/Avada template whose copy is mostly generic filler. It has unsupported superlatives, stale content, conflicting hours and several typos. It also carries an **obfuscated script in `<head>` on every page** that calls an unrelated domain (see audit, item O1).
5. Worth keeping: real interior and food photography (dark wood, warm bulbs, sake bottles), a menu written as real text, and clear vegan (vg) and vegetarian (v) marks.

## Identity and positioning

- **What it is:** "a family-run Japanese restaurant well established in the heart of Richmond, South West London. We provide array of sushi, sashimi and fine Japanese dishes with a modern twist." (Our Story page, VERIFIED)
- **Founding:** "First opened in 2004" (homepage source content, VERIFIED). OpenTable search snippets say the same. The footer reads "© Copyright 2004 - 2026".
- **Korean family:** Harden's current page says "Low key Japanese café (run by Koreans) on the fringe of Richmond town centre (near St Mary Magdalene)" (REPORTED, undated listing, accessed 25 Oct 2026). A search-indexed Harden's survey line (2021–22 edition) reads "Lovely, tiny Japanese café run by a friendly family", with roughly 17 years of service (REPORTED, about 2022; it is not on the live page now). The official site does not mention Korean heritage.
- **Korean touches on the menu (inference):** Stonepot Bibimbap, Namool, "Special K Roll" (carrot, spinach, pickled radish, sesame, seasoned tofu) and spicy-marinated Beef, Chicken and Pork BBQ. The site never says what "K" means (UNKNOWN). Wanderlog lists "bulgogi" and "bibimbap" (REPORTED).
- **Self-positioning on the site:** "BEST SUSHI IN LONDON" is the eyebrow above the title on every inner page. The homepage source also says "The best sushi in Richmond" and "THE BEST SUSHI IN TOWN". No award or source backs these claims.
- **Price band:** OpenTable £26–40 (REPORTED via search snippet; the page itself returned 503). Square Meal £30–49 (REPORTED via search snippet; the page itself returned 403). Harden's averages: starter £13.90, main £20.40, pudding £6.90, service 12.5% (REPORTED, undated).
- **Size and atmosphere:** "Covers 30", "No dress code", "Highchair" (Harden's, REPORTED). Wanderlog mentions "dark-wood interiors, a discreet sushi bar, and vintage Japanese parasols" (REPORTED; the site photos show dark wood but no parasols). The site says "served amid dark-wood and marble top furniture" (homepage source).

## Verified facts table

| Fact | Value | Source | Status |
|---|---|---|---|
| Name as styled | MATSUBA (all caps in logo and copy) | matsuba.co.uk (all pages) | VERIFIED |
| Address | 10 Red Lion St, Richmond TW9 1RW | https://matsuba.co.uk/reservations/ ; takeaway PDF ; FSA | VERIFIED |
| Phone | 020 8605 3513 | /reservations/ ; takeaway PDF ; Favourite Table ; Harden's ; trip.com | VERIFIED |
| Email | info@matsuba.co.uk (envelope icon, mailto) | /reservations/ HTML | VERIFIED |
| Instagram | https://www.instagram.com/matsuba.london/ | /reservations/ icon link | VERIFIED (link only; profile refused with 429) |
| Opened | 2004 ("First opened in 2004") | homepage content (via /wp-json/wp/v2/pages) ; OpenTable snippet | VERIFIED |
| Family-run | "We are a family-run Japanese restaurant" | https://matsuba.co.uk/culinary-history/ | VERIFIED |
| Run by a Korean family | "run by Koreans" | hardens.com listing | REPORTED |
| Covers | 30 | hardens.com listing | REPORTED |
| Booking system | Favourite Table, https://booking.favouritetable.com/?SiteCode=2122 | /reservations/ "BOOK A TABLE" | VERIFIED |
| Online ordering | Toast, https://order.toasttab.com/online/matsuba-10-red-lion-street | nav "ORDER" on all pages | VERIFIED (link); the page itself showed a Cloudflare bot check to our headless browser |
| Takeaway deal | "TAKEAWAY DEAL 20% OFF COLLECTION ONLY EVERYDAY Kids Menu not included*" | MATSUBA-TA10-kids.pdf (created 19 Jun 2026) | VERIFIED |
| Service charge | "A discretionary 12.5% service charge will be added to your bill. All prices are inclusive of VAT." | /matsuba-menu/ | VERIFIED |
| Tasting menu | £100 per person, minimum 2, pre-order required, 14 items plus a complimentary glass of Prosecco | /matsuba-menu/ Tasting tab | VERIFIED (Harden's still lists £65 for 14 courses: out of date) |
| Set lunch and early evening | Tue–Fri 12–2.30pm and 5–6.30pm, 2 courses £20.95 / 3 courses £24.95 | MATSUBA-special2026.jpg (uploaded 2026/03) | VERIFIED as published; still running? [TO CONFIRM] |
| Food hygiene | 5, inspected 8 Aug 2026 | https://ratings.food.gov.uk/business/1574612 (FSA API) | VERIFIED |
| Online booking limit | Up to 12 guests online; larger parties phone | Favourite Table widget | VERIFIED |
| No-show policy | Card required; "we reserve the right to charge £10 per person" without 24h notice or on non-attendance | Favourite Table widget | VERIFIED |
| Web agency | "Created by DINTENT CREATIVE" (links to dintent.com) | footer, all pages | VERIFIED |
| Platform | WordPress 7.1.3, Avada/Fusion Builder theme | homepage meta generator ; HTML classes | VERIFIED |
| OpenTable | Listed; "not on the OpenTable booking network"; 4.5 from 210 reviews | opentable.co.uk (search snippets only; page 503) | REPORTED |
| Google / Tripadvisor ratings | Google 4.4 (261); Tripadvisor 4.0 (133) | wanderlog.com/place/details/1197161 | REPORTED (Tripadvisor page itself 403) |

## Opening hours

**As the official site states them** (footer on every page and /reservations/, VERIFIED as published):

> Monday – Friday 12pm – 3pm / 5pm – 10pm
> Saturday 12pm – 10pm
> Sunday Closed

(The footer writes Saturday as "12-10pm".)

**Conflicts.** Monday is the big one:

| Source | Hours | Date |
|---|---|---|
| matsuba.co.uk footer and /reservations/ | Mon–Fri 12–3 / 5–10; Sat 12–10; Sun closed | live 25 Oct 2026 (reservations page last modified 3 May 2026) |
| matsuba.co.uk Lunch Menu tab | "Available between 12pm – 2:45pm" | live |
| matsuba.co.uk Lunch & Early Evening card | "Tuesday - Friday 12 - 2.30pm & 5 - 6.30pm" (implies Monday closed) | image uploaded March 2026 |
| Vegan and GF PDFs | Lunch "Available between 12pm – 2:30pm" | files dated Sept/Oct 2024 |
| OpenTable (snippet) | Lunch Tue–Fri 12–2.30, Sat 12–5; dinner Tue–Sat 5–10; closed Sun–Mon | undated |
| Harden's | Tue–Sat 12–2.30pm, 6–10.30pm; closed Mon and Sun | undated |
| Square Meal, Tripadvisor (snippets) | Open Tuesday to Saturday | undated |
| Wanderlog | Matches the official site (Mon–Fri) | © 2025 |

Monday opening and the exact time lunch ends (2.30, 2.45 or 3pm) are **UNKNOWN** and need confirming with the owner. Every other source, and the restaurant's own set-menu card, suggests Monday is closed.

## Booking, takeaway and contact

- **Booking:** nav "RESERVATION" (or the homepage "BOOK NOW") goes to https://matsuba.co.uk/reservations/, where a "BOOK A TABLE" button opens Favourite Table (https://booking.favouritetable.com/?SiteCode=2122, which redirects to live.favouritetable.com). The widget offers Lunch or Dinner sessions and 1–12 guests. Its copy reads: "We accept web reservations for tables up to 12 guests. For larger parties, please contact us on 020 8605 3513. Thank you." and "Please note that we require credit card details to secure your booking. No money is taken at the time of booking, but we reserve the right to charge £10 per person if you do not provide us with at least 24 hours cancellation notice, or fail to attend your reservation on the day." No booking widget is embedded on matsuba.co.uk itself, and OpenTable is not used for booking.
- **Takeaway ordering:** the nav item "ORDER" links directly to Toast, https://order.toasttab.com/online/matsuba-10-red-lion-street. It showed a Cloudflare "Performing security verification" page to our headless browser, so I did not see the Toast menu. This is not evidence that it is broken for real users. Takeaway menus are PDFs: the current one is "MATSUBA-TA10-kids.pdf" (June 2026, linked from the Menu page). The homepage's "VIEW TAKEOUT MENU" still links to the older "MATSUBA-TA8-brown.pdf" (Sept 2024). Delivery: UNKNOWN (nothing on the site mentions it).
- **Contact:** phone 020 8605 3513 is plain text, not a `tel:` link, on every page (0 `tel:` links found). Email is an icon-only mailto link to info@matsuba.co.uk. The Google Maps embed on /reservations/ was blank in headless screenshots (likely a headless rendering artefact; not claimed broken).
- **Social:** Instagram @matsuba.london (icon on /reservations/ only). No Facebook, TikTok or other links were found.
- **Allergens:** the only statement is "* FOOD ALLERGY NOTES * If you have a food allergy or a special dietary requirement, please inform a member of the staff." Dietary marks are "v suitable for vegetarians" and "vg suitable for vegans" (key printed on the Lunch & Early Evening card), plus GF marks in the gluten-free PDF. No 14-allergen matrix is published.

## Menu

**Fully captured.** The complete dine-in menu (nine tabs) is HTML text at https://matsuba.co.uk/matsuba-menu/ (page last modified 16 Aug 2026). Two tabs are images, which I transcribed by viewing them. I extracted text from four PDFs. The verbatim transcription is in `copy-deck.md`, and raw extracts are in the scratchpad (`pages/menu-tabs.txt`, `pages/downloads/*.txt`).

- **Tabs:** APPETIZERS (21 dishes); MAIN A LA CARTE (18); SUSHI & SASHIMI (sushi mori, nigiri, aburi nigiri, gunkan, sashimi moriawase, sashimi iro iro); ROLLS & MAKI (6 special rolls, 15 maki); SIDES & DESSERT (6 sides, 2 desserts); LUNCH MENU (bento, rice sets, noodles; "Available between 12pm – 2:45pm"); KIDS MENU (image: Kids Bento £15.95, Kids Vegan Bento £13.95, drinks, desserts, plus an expired promotion "Available until 1 September 2026 only"); TASTING MENU (£100pp, 14 items); LUNCH & EARLY EVENING (image: 2 courses £20.95 / 3 courses £24.95).
- **Signature dishes the site itself names:** Tuna Tataki ("Taste our signature appetizer, Tuna Tataki, torched-seared tuna slices with mooli and ponzu sauce."), Special Rolls ("large 8 piece rolls exclusively created by MATSUBA"), Matsuba Roll and Matsuba Salad. Carpaccio range: salmon aburi, salmon, seabass and yellowtail (plus hotate in the GF PDF). Stonepot Bibimbap (beef or veg). Premium items: Black Cod Saikyo-yaki 36.9, Geisha Combo (33 pieces) 79.9, Omakase sashimi (18 pieces) 65.9.
- **Format:** prices have no £ sign and one decimal ("5.9"). Dual prices are written "6.9/6.9" or "18.9/17.9", with the variant order given only in the dish name.
- **Price inconsistencies across documents:** the takeaway PDF prices bento items £1 higher than the web Lunch Menu (e.g. Matsuba Special 33.9 vs 32.9) and Oyako Don 13.9 vs 12.9. The vegan and GF PDFs (Sept 2024) show older prices (e.g. Edamame Spicy/Garlic Butter 6.90/7.90 vs 6.9/6.9 online) and include dishes missing from the web menu (Kaiso Salad, The Big V roll, Tuna Tartare, Hotate Carpaccio, Lion King Aburi, Grilled Tuna Steak, Salmon Skin Roll, Wasabi Spider Roll, Salmon Don, Tuna & Samon Don, Veg Curry). Whether those dishes are current is UNKNOWN.
- **Drinks:** no drinks list is published. The only drinks shown are on the set-menu card (Nihonshu Sake hot 150ml £6.95; Prosecco or "Aperol Com Fanta" £6.95; Hojicha or Jasmine Tea £2.95) and in the kids and takeaway lists (Ramune Soda 4.9, Innocent Kid Juice 2.9).

## Brand assets and tone

- **Logo:** a wordmark only. "MATSUBA" in white, widely letter-spaced geometric sans capitals (Futura-like), on a transparent 300×35 PNG (`/wp-content/uploads/2021/05/MATSUBA-logo-ss.png`). It has no symbol, kanji or colour, and only works on dark backgrounds. The same file serves as the og:image.
- **Name:** "matsuba" (松葉) is ordinary Japanese for "pine needle(s)". This is general language knowledge; the site never explains the name, so the intended meaning is [TO CONFIRM].
- **Website colours (read with getComputedStyle):** text charcoal `#23282D`; header and footer near-black `#030303` (header overlay `rgba(3,3,3,0.8)`); page background `#D7D6D6` behind white `#FFFFFF` panels; menu tab greys `#F2F2F2` and `#EBEAEA`; footer text `#D6D6D6`; nav grey `#C1C1C1`; menu descriptions `grey` `#808080`; muted `#747474`; diet green `#008000`; vegan button green `#65BC7B`; gluten-free button orange `#EA9800`. The overall effect is monochrome black, white and grey.
- **Print colours (sampled from the official files):** Lunch & Early Evening card burgundy ≈`#640B35`, gold ≈`#D4A965`, warm taupe ≈`#5A4C44`, with a thin gold border. Takeaway PDF dark brown ≈`#3F2B1C` on white, with a pink kids panel. The print menus are warmer and more distinctive than the website.
- **Fonts:** website: Jost 400/500/700 (body and headings, `Jost, Georgia, serif`); Work Sans 500 uppercase with about 1.3–1.6px tracking (buttons). Lora is declared, and the homepage's "Book your table today!" renders as a serif italic, probably Lora (not confirmed by computed style). Bebas Neue is declared but never loaded on the pages checked. Takeaway PDF: Futura PT (Book through Heavy), Georgia Italic, Nexa Bold. Jost is a free Futura revival, so web and print already share a geometric-sans voice.
- **Photo subjects (described, not copied):** homepage hero: bar shelf with hanging wine glasses, Edison bulbs and sake bottles (Gekkeikan labels visible). Homepage section: Tuna Tataki with shredded mooli. Our Story: booth table set for four against a vertical timber-slat wall with brass wall lights; close-up of a special roll with spicy mayo, sauce drizzle and sprouts (`dynamite01.jpg`). Reservations: two salt-rimmed cocktails and a tumbler on a wooden board; the header shows a slatted wood wall with warm lights. Menu header: plated dishes. Footer (every page): dining room with dark leather booths, slatted wood, exposed brick, pendant bulbs and white-topped tables. The photos look like real photography of the venue and are mostly warm and low-lit.
- **Tone of voice:** mostly generic template copy. Quoted exactly as evidence:
  - "MATSUBA offers a combination of traditional and modern Japanese dishes placing the freshness and quality of ingredients at its centre and delivered to the customer with service to the highest." (six times in the homepage source: three slides, rendered twice)
  - "Located in the beauties of Richmond town centre, Matsuba strives to deliver excellence from dish to dish."
  - "MATSUBA has seen success with diners from near and far and delivers to the customer with service to the highest."
  - Headings: "Finest Dining Experience", "The best table in town", "Perfect For Groups", "Fresh produce everyday".
  - "Contemporary Japanense restaurant for modern and traditional dishes served amid dark-wood and marble top furniture." (typo as published)
  - "Our aim is to provide a warm-inviting, sincere, and atmost friendly service and to welcome each guest with a smile." (typo as published)
  - Specific to Matsuba and worth keeping: "We are a family-run Japanese restaurant well established in the heart of Richmond", "Pull up a chair. Take a taste. Come join us.", "large 8 piece rolls exclusively created by MATSUBA", and the Tuna Tataki "signature appetizer" line.
- **Template origin (inference):** the page slugs `home-alternate-1` and `culinary-history` date from Dec 2019 and Jan 2020, and the theme is Avada. That pattern is consistent with a theme demo import, which would explain why the "Our Story" page is titled "Culinary History" but contains no history.

## Current website audit

Measured in Playwright Chromium at 1440×900 and 390×844 (isMobile, DPR 2) on 25 Oct 2026. The site has four pages (confirmed via `/wp-json/wp/v2/pages`): Home, Our Menu, Culinary History (nav "OUR STORY") and Reservations. ORDER goes off-site, and there are no sub-pages.

### Strengths to keep
- **S1. Real text menu.** The full menu is HTML, not PDF-only. Every dish has a description and price, vegan and vegetarian marks are clear (green "vg" or "v"), and on mobile the tabs fold into an accordion with Appetizers open.
- **S2. Dedicated dietary menus.** Separate vegan and gluten-free menus, vg/v marks throughout, and vegan options in the kids, lunch and tasting menus.
- **S3. Direct channels.** Bookings go to Favourite Table and orders to Toast, both the restaurant's own accounts rather than a marketplace. The booking policy is clear.
- **S4. Real venue photography** with a consistent warm, dark-wood mood.
- **S5. Hours on every page** in the footer; short five-item nav; lang `en-GB`; responsive viewport meta; no horizontal scroll on any page at 390px.
- **S6. A few warm, specific lines:** "family-run", "Pull up a chair. Take a taste. Come join us.", "exclusively created by MATSUBA".

### Specific opportunities (with evidence)
- **O1. Possible security problem (priority; handle tactfully and privately).** Every page checked (menu, our-story, reservation) has a 5,966-character obfuscated inline `<script>` in `<head>` (`function _0x5162(...)`, a pattern often seen in injected code). On every page load, including the homepage, the browser sent an XHR to `https://get.whitelllshop.icu/landers/tzt.php`, a domain unrelated to the business. The browser's CORS policy blocked it in our session, and no redirect was seen. This is not confirmed as malware, but it warrants a professional check by the site owner or their web agency (DINTENT CREATIVE). A WordPress author archive link `https://matsuba.co.uk/author/master/` also exposes a username. Don't use this as a sales gimmick.
- **O2. Conflicting hours.** The site says Monday to Friday, while its own Lunch & Early Evening card and four third-party listings say Tuesday to Friday or Tuesday to Saturday. Lunch end time appears as 3pm, 2:45pm and 2:30pm on different parts of the official site.
- **O3. Booking takes two taps plus a page change.** On the mobile home screen, "BOOK NOW" goes to /reservations/, then "BOOK A TABLE" opens Favourite Table on another domain. The booking widget is never embedded or linked directly.
- **O4. Ordering is hidden on mobile.** It takes the hamburger, then ORDER (two taps). The first screen has no order CTA, and the homepage's takeout block links to the **Sept 2024** PDF (TA8), not Toast or the current TA10 PDF. The 20% collection discount is only mentioned inside the PDF.
- **O5. Generic, repeated copy and unsupported superlatives** (quoted above). The homepage has **no `<h1>`**, and its h2s repeat "Welcome to MATSUBA" four times and "Finest Dining Experience" twice (duplicated slider markup). Inner pages carry the eyebrow "BEST SUSHI IN LONDON" with nothing to back it.
- **O6. Mobile first screen at 390×844:** a black header with the logo (300×35) and a hamburger, then a hero photo with the h2 "Welcome to MATSUBA" (40px), the generic paragraph and "BOOK NOW". The first screen has no hours, address, phone, menu link or order link. The homepage's mobile document height measured **7,284px**, much of it full-bleed lazy-loaded sections that rendered blank in headless capture. I'm not claiming they're blank for users, but the page is very long for little content.
- **O7. Tap targets:** the hamburger "Toggle Menu" measures **51×18px** (below 44px; 18px tall is also under WCAG 2.5.8's 24px minimum). The footer credit link is 103×18. The phone number is not a `tel:` link anywhere. Email and Instagram are icon-only.
- **O8. Menu readability:** descriptions are `color: grey` (`#808080`) on white at 16px, a **3.95:1** contrast ratio, which fails WCAG AA's 4.5:1. 24 menu paragraphs carry `line-height: 0`. Prices have no £ and look like "6.9/6.9". Two tabs (Kids, Lunch & Early Evening) are **images with empty `alt`**, so their text can't be read by screen readers or found by search. The smallest text is 12px (copyright line).
- **O9. Stale content:** the Kids tab still promotes a free drink "Available until 1 September 2026 only". The homepage takeout link points to the 2024 PDF. The vegan and GF PDFs are from Sept 2024, with prices and dishes that differ from the live menu. Harden's still shows the old domain `matsuba-restaurant.com` and a £65 tasting menu.
- **O10. Typos in live copy** (quoted exactly): "Uangi Steak", "Eby Fry", "(all samon)", "South Amerian", "Chrispy", "shichimi chilli papper", "Yuzu Te", "Japanense", "atmost friendly", "everytime", "Torched-seared", "Tuna & Samon Don" (GF PDF), "Aperol Com Fanta".
- **O11. Page titles and meta:** titles are "MATSUBA – Japanese Dining Experience", "Our Menu – MATSUBA", "Culinary History – MATSUBA" and "Reservations – MATSUBA". Meta descriptions are auto-excerpts: home starts "ENJOY YOUR MEAL AT HOME TAKEOUT NOW AVAILABLE Freshly made everytime…", and menu starts "Edamame (Steamed) vg Lightly salted soybean pods 5.9…". The homepage og:title is empty. No title mentions "Richmond" or "sushi", and "Culinary History" doesn't match the nav label "OUR STORY".
- **O12. Brand underused online:** the warm print palette (burgundy, gold, brown) and the family and Korean story appear nowhere on the website, and there is no explanation of the name.
- **Not claimed broken:** the homepage's blank sections, the `video-3.mp4` request (aborted in headless), the blank Maps iframe and the Toast Cloudflare page are all plausibly artefacts of a headless browser.

## Audience (inference, labelled as such)

These groups are inferred from the menu and policies, not stated by the business:
- Richmond locals and regulars (a 22-year neighbourhood restaurant, low-key, about 30 covers).
- Weekday lunch and early-evening diners (set menu £20.95/£24.95, bento).
- Families (kids bentos, a highchair per Harden's, the kids promotion).
- Vegan, vegetarian and gluten-free diners (dedicated menus).
- Takeaway collectors (20% off collection, every day).
- Celebration and group diners (tasting menu £100pp with Prosecco, online bookings up to 12).

## Unknowns and conflicts

- Monday opening (official site says open; its own set-menu card and third parties say closed). Lunch end time (2:30, 2:45 or 3pm).
- Whether the Lunch & Early Evening set menu (published March 2026) is still running.
- Whether the vegan and GF PDF dishes and prices (Sept 2024) are current, and what's on the Toast menu (blocked to our browser).
- Delivery: not mentioned anywhere.
- Drinks list (sake, beer, wine): not published.
- Family and ownership details, and the Korean heritage (Harden's only). I have not named or researched any individual.
- Covers (30, Harden's only); bar seating, private hire or group capacity.
- Meaning of the name and of "Special K Roll".
- Basis for "BEST SUSHI IN LONDON" (no award found).
- The obfuscated script and the external XHR: cause and impact.
- Instagram content, follower count and posting activity (429 refusal).
- Pages that refused us: OpenTable (503 on .co.uk, .ie, .sg), Tripadvisor (403), Square Meal (403), Instagram (429), Toast (Cloudflare check). No retries or workarounds were attempted.

## Sources

All accessed 25 October 2026.

Official:
- https://matsuba.co.uk/ (home; Playwright)
- https://matsuba.co.uk/matsuba-menu/ (menu; Playwright)
- https://matsuba.co.uk/culinary-history/ (Our Story; Playwright)
- https://matsuba.co.uk/reservations/ (Playwright)
- https://matsuba.co.uk/wp-json/wp/v2/pages (public WordPress API; one request, for the homepage's full content and page dates)
- https://matsuba.co.uk/wp-content/uploads/2026/06/MATSUBA-TA10-kids.pdf (takeaway menu, created 19 Jun 2026)
- https://matsuba.co.uk/wp-content/uploads/2024/09/MATSUBA-TA8-brown.pdf (older takeaway menu, linked from homepage)
- https://matsuba.co.uk/wp-content/uploads/2024/10/MATSUBA-menu-202409-vegan4.pdf
- https://matsuba.co.uk/wp-content/uploads/2024/10/MATSUBA-menu-202409-GF3.pdf
- https://matsuba.co.uk/wp-content/uploads/2026/03/MATSUBA-special2026.jpg (Lunch & Early Evening)
- https://matsuba.co.uk/wp-content/uploads/2026/08/MATSUBA-Kids-web-scaled.jpeg (kids menu)
- https://booking.favouritetable.com/?SiteCode=2122 (booking widget; one load)
- https://order.toasttab.com/online/matsuba-10-red-lion-street (one load; Cloudflare verification page)

Third-party:
- https://www.hardens.com/az/restaurants/richmond/tw9/matsuba.htm and https://new.hardens.com/az/restaurants/richmond/tw9/matsuba.htm (undated listing; 2021–22 survey wording via search snippet)
- https://www.opentable.co.uk/r/matsuba-richmond (503; search snippets only)
- https://www.squaremeal.co.uk/restaurants/matsuba_1227 (403; search snippet only)
- https://www.tripadvisor.co.uk/Restaurant_Review-g191301-d733819-Reviews-Matsuba-Richmond_upon_Thames_Greater_London_England.html (403; search snippet only)
- https://wanderlog.com/place/details/1197161 (© 2025)
- https://sa.trip.com/travel-guide/richmond%20upon%20thames-54450-restaurant/Matsuba-19553377 (the page contained embedded instructions aimed at AI tools; ignored)
- https://ratings.food.gov.uk/business/1574612 (via api.ratings.food.gov.uk; rating 5, 8 Aug 2026)
- https://www.instagram.com/matsuba.london/ (429; not read)
- No Time Out or local-press coverage found (searched 25 Oct 2026).
