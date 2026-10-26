# Matsuba, Richmond: baseline raw audit record
Date captured: 2026-10-26. Tools: WebSearch (standard) and WebFetch only, plus local `pdftotext` on PDFs that WebFetch had saved to disk (appendix only, clearly labelled). Did not read /home/user/Claude-code/ research.

## Method caveats (important for the blind test)
- WebSearch does NOT return per-result snippets. It returns a list of (title, URL) pairs plus an AI-written summary of the results. "Verbatim snippets" are therefore not obtainable; the summary text is recorded verbatim in pack-baseline.md.
- WebFetch passes each page through a small model with a prompt and returns that model's answer, not raw HTML. It repeatedly declined to reproduce pages verbatim ("conflict with the quoting limits") and returned structured summaries. It cannot show page source, so JSON-LD/schema.org presence could not be verified directly; every fetch reported none visible in the rendered content.
- Several URLs were fetched with a prompt asking for "everything stated"; wording in the pack is that tool's output, not the raw page.

## Searches run (6 required + 2 supplementary)
Titles/URLs/summary text for each are in pack-baseline.md Part 1. Key observations:
1. "Matsuba Richmond": 9 results; none is matsuba.co.uk. 4x OpenTable country domains (mx, sg, uk, ie), Harden's, 2x opentable.jp "phrase" pages, 1x opentable.com.mx phrase page, Trip.com.
2. "best Japanese restaurant Richmond London": 10 results, all OpenTable (mostly odd "phrase" pages on .co.th/.sg/.hk/.ae domains and one /cuisine/best-japanese-restaurants-london-hampton-hill). Summary names Sticks'n'Sushi and Matsuba. No editorial list (Time Out, Harden's list, Michelin, Guardian etc.).
3. "sushi Richmond upon Thames": Matsuba absent. Sticks'n'Sushi (80 George Street), itsu, ThatsUp directory, tagvenue.
4. "aburi sushi Richmond": all Richmond BC / Melbourne / Toronto. Matsuba and Richmond London absent, even though Matsuba's menu has an "Aburi Nigiri" section, Salmon Aburi Carpaccio and "Lion King" aburi nigiri.
5. "Matsuba Richmond menu prices": official site absent; Harden's, OpenTable, Wanderlog.
6. "Matsuba Richmond opening hours": official site absent; Harden's, Foodle, OpenTable, Trip.com, plus two irrelevant atmosfy.io pages for "Matsuyama Japanese Restaurant" (Richmond, wrong restaurant).
Supplementary: "Matsuba Richmond Tripadvisor 10 Red Lion Street" and "Matsuba Japanese restaurant Richmond reviews Tripadvisor OR Time Out OR Square Meal": no Tripadvisor, Time Out or Square Meal page for Matsuba surfaced. matsuba.co.uk never appeared in ANY search result.

## Official site fetches
Fetched: https://matsuba.co.uk/ , /matsuba-menu/ , /reservations/ , /culinary-history/ (Our Story), plus PDFs. All fetched fine (no blocking). Site is WordPress (wp-content uploads), agency credit Dintent Creative.

Homepage: text above in pack. Hours in footer only. No phone, no street address in the homepage text. No prices. Booking links to /reservations/. Lazy-load placeholders ("Loading...", empty SVG data URIs). Typos: "Contemporary Japanense", "everytime". Slider repeats the same slide twice. Claims "The best sushi in Richmond" / "THE BEST SUSHI IN TOWN" (unsupported claim).
Reservations: booking via external link https://booking.favouritetable.com/?SiteCode=2122 (Favourite Table). Phone 020 8605 3513, email info@matsuba.co.uk, address 10 Red Lion St, Richmond TW9 1RW, shown only on this page (per fetch). No cancellation/deposit/policy text. Instagram https://www.instagram.com/matsuba.london/ . Online ordering https://order.toasttab.com/online/matsuba-10-red-lion-street .
Our Story: no address/phone in footer; "View in the menu" link points to a misspelt path /retaurant-home/; footer copyright "2004" but page posted 2021.
Menu page: HTML text with tabs (Appetizers, Main A La Carte, Sushi & Sashimi, Rolls & Maki, Sides & Dessert, Lunch Menu, Kids Menu, Tasting Menu, Lunch & Early Evening). Prices in HTML. Aburi dishes present. Not visible in HTML: dietary tags v/vg in some items (present in PDF); the "Lunch & Early Evening" tab is an image plus links only (image https://matsuba.co.uk/wp-content/uploads/2026/03/MATSUBA-special2026.jpg; menu content inside image not read). Kids menu is an image only (https://matsuba.co.uk/wp-content/uploads/2026/08/MATSUBA-Kids-web-scaled.jpeg); promo "valid until 1 September 2026" is now expired as of capture date (2026-10-26) but still on the page. Kids menu items/prices are in the TA10 PDF (see appendix) but not in HTML.
Structured data: none visible in any fetched page (cannot confirm from source). No odd scripts or suspicious external links seen; only external domains: toasttab.com, favouritetable.com, dintent.com, instagram.com.

## PDFs
- https://matsuba.co.uk/wp-content/uploads/2026/06/MATSUBA-TA10-kids.pdf : WebFetch: no text extractable (compressed streams). BUT locally `pdftotext -layout` on the saved file extracts a full text layer (takeaway menu, A4 landscape, kids bento boxes, "TAKEAWAY DEAL 20% OFF COLLECTION ONLY EVERYDAY", address and phone in footer). So the PDF is machine-readable by a proper PDF parser but not by this fetch tool.
- https://matsuba.co.uk/wp-content/uploads/2024/09/MATSUBA-TA8-brown.pdf : same; older (Sept 2024) takeaway menu with older prices. Still linked from the homepage.
- https://matsuba.co.uk/wp-content/uploads/2024/10/MATSUBA-menu-202409-vegan4.pdf : WebFetch no text; local pdftotext gives text.
- https://matsuba.co.uk/wp-content/uploads/2024/10/MATSUBA-menu-202409-GF3.pdf : not fetched.

## Third-party pages
- Harden's: fetched OK (see pack). Conflicts: hours Tue-Sat 12-2:30 / 6-10:30, Mon closed; email and website listed on matsuba-restaurant.com (domain does not resolve); no rating or review on fetched page though search summaries cite an older Harden's review text; £65 14-course tasting menu vs official £100.
- OpenTable (all country domains): direct fetch 503 on .co.uk, .ie, .sg, .com.mx. Only search-summary content available.
- Foodle, Trip.com, Wanderlog: fetched OK. Trip.com rating differs between fetch (4.4, 8 reviews) and search summary (5/5; "51 reviews" in one place, "one review" in another).
- Tripadvisor: no search hit; a guessed URL returned 403 (the URL was constructed by me and may not be the real page; not evidence of blocking).
- Time Out / Square Meal / Michelin: nothing found.
- Competitors seen in search: Sticks'n'Sushi (80 George Street) via tagvenue and OpenTable; itsu Richmond; Wagamama, Umi (Twickenham), Makoto Sushi Bar (Chiswick) listed on Harden's page. Competitor pages were not fetched.

## Conflicts between sources (hours)
- Official site (footer, reservations, Foodle, Wanderlog): Mon-Fri 12-3 and 5-10; Sat 12-10; Sun closed. Lunch menu 12-2:45pm.
- Harden's: Tue-Sat 12-2:30, 6-10:30; Mon & Sun closed.
- OpenTable (via search summaries): variously Mon-Sat lunch 12:00-14:30 and dinner 18:00-22:30; or lunch Tue-Fri 12-14:30, Sat 12-17:00, dinner Tue-Sat 17-22.
- Trip.com: 12:00-14:30 and 18:00-22:30 (day not shown).
Other conflicts: tasting menu £100 min 2 pax (official) vs £65 14 courses (Harden's); Harden's "run by Koreans"/"Korean family" and Wanderlog's mention of Korean dishes vs official site's silence on this; OpenTable says not on OpenTable network (book by phone) whereas official site uses Favourite Table; Trip.com ratings inconsistent; Wanderlog shows Google 4.4 (261) and Tripadvisor 4.0 (133) with a star breakdown totalling 261 labelled under Tripadvisor. Menu price differences between HTML menu page and TA10 PDF (e.g. Matsuba Special bento 32.9 on HTML lunch menu vs 33.9 on takeaway PDF; Tempura bento 18.9 vs 19.9; Matsuba Roll 22.9 8-piece in the 2024 PDF vs 12.9/22.9 in 2026 sources) are plausibly eat-in vs takeaway; flagged only.

## Appendix A (local pdftotext of PDFs; NOT in pack because WebFetch could not read them). Files saved at:
/tmp/claude-0/-home-user-Claude-code/e50707d5-9ec5-571e-9915-9e7145ebe50f/scratchpad/v2/aivis/matsuba/ta10.txt
/tmp/claude-0/-home-user-Claude-code/e50707d5-9ec5-571e-9915-9e7145ebe50f/scratchpad/v2/aivis/matsuba/ta8.txt
/tmp/claude-0/-home-user-Claude-code/e50707d5-9ec5-571e-9915-9e7145ebe50f/scratchpad/v2/aivis/matsuba/vegan.txt

### TA10 (2026 takeaway PDF) extracted text
```
                AP P E T I Z E RS                                                              A L A C A RTE                                                              B E N T O          B O X
                                                                                                                                                       Served with today’s appetizer, salad, rice, miso soup & pickles

Matsuba Salad vg                                                        8.9   Gyu Teriyaki                                                   26.9   Matsuba Special sashimi, sushi, tempura, chicken teriyaki 33.9
Fresh crispy salad with our own Matsuba dressing                              Sirloin beef steak grilled with balsamic teriyaki sauce
                                                                                                                                                    Matsuba V Special vg veg sushi, maki, tempura, tofu teriyaki 30.9
Edamame Salted vg Spicy v Garlic Butter v                  5.9/6.9/6.9        Chicken Teriyaki                                               17.9
Grilled soybean pods                                                          Grilled chicken fillet with teriyaki sauce                            Sashimi fresh pieces of assorted raw fish sashimi            29.9

                                                                                                                                                    Sushi assortment of nigiri and maki rolls                    28.9
Agedashi Tofu vg                                                        8.5   Salmon Teriyaki                                                19.9
Crispy coated tofu in tempura sauce                                           Grilled Scottish salmon with teriyaki sauce                           Tempura deep fried king prawn and vegetable in light batter 19.9
Zucchini Iridashi vg                                                    8.5   Tofu Teriyaki Steak vg                                         16.9
Crispy coated courgettes with light dipping                                   Deep fried tofu in teriyaki sauce                                                             R I C E        S E T
                                                                                                                                                                        Served with rice & miso soup
Pumpkin Korokke vg                                                      8.5   Black Cod Saikyo-yaki                                          36.9
Crispy panko coated croquettes filled with pumpkin                            Pre-marinated fillet of black cod in Saikyo miso sauce                Gyu Teriyaki Grilled sirloin beef steak with teriyaki               26.9
Nasu Dengaku vg                                                         9.9   Beef BBQ BBQ style sirloin beef in sweet marinade              18.9   Chicken Teriyaki Grilled chicken with teriyaki                      17.9
Lightly fried aubergine coated in sweet miso sauce
                                                                              Chicken BBQ Spicy pre-marinated BBQ style chicken              17.9   Salmon Teriyaki Grilled salmon with teriyaki                        19.9
Yakitori                                                                9.9
Grilled skewers of chicken pieces in teriyaki sauce                           Pork BBQ Strips of pork belly marinated in spicy BBQ sauce 17.9       Tofu Teriyaki v Deep fried tofu with teriyaki                       16.9

Squid Shichimi-Age                                                     11.9   Ebi Tempura                                                           Beef BBQ Sweet marinated BBQ beef                                   18.9
                                                                                                                                             18.9
Deep fried squid in light batter with shichimi chilli pepper                  Deep fried king prawns in light batter                                Chicken BBQ Spicy marinated BBQ chicken                             17.9
Gyoza Vegetable vg or Chicken                                       9.5/9.9   Tempura Mori                                                   17.9   Pork BBQ Spicy marinated BBQ pork                                   17.9
Pan grilled Japanese dumplings                                                Deep fried king prawn and vegetable in light batter
                                                                                                                                                    Katsu Curry Chicken or Prawn or Pumpkin                   17.9/16.9
Softshell Crab                                                         13.9   Yasai Tempura vg                                               17.9   Crispy coated chicken or prawn or pumpkin katsu with our own curry
Deep fried soft shell crab                                                    Deep fried mixed vegetables in light batter
                                                                                                                                                    Bibimbap Beef or Veg v                                     17.9/16.9
                                                                                                                                                    Assorted vegetables, beef or veg, egg topped on rice with spicy paste
Chicken Kara-age                                                        9.9   Eby Fry 3pcs /6pcs                                        10.9/18.9
Large balls of tender chicken with dribbles of sweet chilli sauce             Crispy coated Jumbo prawn with panko breadcrumbs                      Oyako Don Chicken, onion, egg rice bowl                             13.9
Sashimi Ceviche                                                        13.9
South American style salad with sashimi, green leaves in ponzu seasoning                                  S I D ES                                  Ten Don Deep fried king prawn & veg tempura on rice
                                                                                                                                                    Unaju Grilled fillet of eel with rice
                                                                                                                                                                                                                        17.9

                                                                                                                                                                                                                        23.9
Tuna Tataki                                                            14.9   Miso Shiru v Soybean paste soup made from bean curd            4.5
Torched-seared tuna slices with mooli and ponzu sauce
                                                                              Rice vg Plain steamed white rice                               4.5                            NOODLES
Salmon Carpaccio                                                       13.9
Thin sliced fresh salmon pieces with yuzu ponzu and jalapeño                                                                                        Yaki Soba Seafood/Chicken or Veg vg                       15.9/14.9
                                                                              Pak Choi vg Tender steam pak choi with teriyaki sauce           7.9   Pan grilled chicken or seafood and vegetable in soba noodles
Salmon Aburi Carpaccio                                                 13.9
Torch-seared salmon pieces with yuzu miso dressing                            Pickles vg Assorted Japanese pickled vegetables                6.9    Yaki Udon Seafood/Chicken or Veg vg                      16.9/15.9
                                                                                                                                                    Pan grilled chicken or seafood and vegetable in udon noodles
Yellowtail Carpaccio                                                   15.9   Broccoli miso vg Steamed broccoli with Japanese miso sauce 7.9
Thin sliced fresh yellowtail pieces with yuzu ponzu and jalapeño                                                                                    Tempura Udon Prawn or Veg vg                                 16.9/15.9
                                                                                                                                                    Udon noodles in light broth with king prawn or veg tempura
                                                                              Namool vg Assorted vegetables                                   7.9
Seabass Carpaccio                                                      14.9                                                                                              * FOOD ALLERGY NOTES *
Thin sliced fresh seabass pieces with yuzu ponzu and tobiko
                                                                              Horensou no goma ae vg                                         8.9         If you have a food allergy or a special dietary requirement,
                                                                              Blanched spinach leaves with sesame sauce                                              please inform a member of the staff.
    SUS H I & SAS H I M I                                                               SPECIAL ROLLS                                                                        MATSUBA
                                                                                  large 4 or 8 piece rolls exclusively created by Matsuba

  S U S H I         M O R I           Chef’s choice of assorted sushi sets      Matsuba Roll                                                 12.9/22.9
Matsu Set 9pcs nigiri & 6pcs maki			
				
                                                                       29.9
                                                                                Prawn tempura, avocado, cucumber, spring onion, lettuce, tobiko, mayo
                                                                                Spider Roll                                                  13.9/23.9
                                                                                                                                                                  TA K E AWAY
Sushi & Sashimi Combo 6pcs nigiri & 6pcs sashimi 		                    29.9     Soft shell crab, avocado, cucumber, spring onion, tobiko, lemon mayo
		
Salmon Combo_A 3pcs sashimi, 4pcs nigiri & 6pcs maki		
					
                                                                       20.9
                                                                                						
                                                                                Crunch Tuna Roll				 23.9
                                                                                Crispy coated tuna, avocado, cucumber, spring onion, spicy mayo
                                                                                                                                                                     MENU
Salmon Combo_B                                                         40.9     						
4pcs sashimi, 4pcs nigiri, 4pcs aburi nigiri, 8pcs special maki                 Dynamite Roll                                                        24.9
                                                                                Prawn tempura, salmon, spicy tuna, avocado, cucumber, jalapeño, spicy mayo       TAKEAWAY DEAL
Geisha Combo 33pcs chef’s selection of assorted sushi, sashimi 79.9             Chicken Katsu Roll
                                                                                Crispy coated chicken katsu, cucumber, salad, Tonkatsu sauce		
                                                                                                                                                     23.9           20% OFF
                                                                                			
  N I G I R I         2 piece portions of fish topped sushi rice                Special K Roll Beef or Veg vg                               18.9/17.9                 COLLECTION ONLY
                                                                                Carrot, spinach, pickled radish, sesame seed, cucumber, seasoned tofu
Toro fatty tuna               11.5        Hotate scallop                9.5                                                                                              EVERYDAY
Maguro tuna                    9.5        Unagi eel                     8.5                                                                                                Kids Menu not included*
Suzuki seabass
Hamachi yellow tail
                               8.5
                               9.5
                                          Ebi prawn
                                          Inari tofu vg
                                                                        6.5
                                                                        5.5                                MAKI                                                      K I D S     B E N T O        B O X
Shake salmon                   7.5                                                                 Single sushi rolls in 6 pieces
                                                                                                                                                                        Steamed Edamame
 ABURI NIGIRI                         2 piece portions of flame seared nigiri    Tekka tuna                    8.9       Shake salmon       7.9                       Salmon Hosomaki 8pcs
Toro fatty tuna               11.9        Maguro tuna                    9.9     Kappa cucumber vg             6.5       Avocado avocado vg 6.9                  Chicken Teriyaki or Chicken Katsu
Shake salmon                   7.9        Hamachi yellow tail            9.9                                                                                                   Rice
                                                                                 Spicy Tuna Tuna, spring onion, spicy sauce		                         10.9
                                                                                                                                                                          Chicken Gyoza
Hotate scallop                 9.9        Saba mackerel                  6.9     				
Suzuki seabass                 8.9        Unagi eel                      8.9     California Prawn, avocado, cucumber, tobiko, sesame, mayo            10.9
                                                                                                                                                                                   £15.95
                                                                                 Tempura Prawn tempura, avocado, sesame, lemon mayo                    11.9
                                                                                                                                                                  KIDS VEGAN BENTO BOX
 GUNKAN NIGIRI                          2 piece nigiri wrapped in seaweed        Calamari Roll Crispy coated baby squid maki		                        12.9
Tobiko flying fish roe          7.9                                              					                                                                                   Steamed Edamame
                                                                                 Unagi Cucumber Eel, cucumber, sesame seed                            12.9
                                                                                                                                                                     Cucumber Hosomaki 8pcs
 SASHIMI MORIAWASE                                                               Crunch Yellowtail                                                    12.9         Tofu Teriyaki or Pumpkin Katsu
                                                                                 Crispy coated yellowtail roll with lemon mayo & pomegranate
Chef’s choice of assorted sets of fresh sliced raw fish on daikon                                                                                                                Rice
                                                                                 Vegetarian vg                                                          8.9
Nami 3 sashimi selection, 9pcs                                         27.9      Cucumber, seasoned tofu, avocado,sesame			                                                 Veggie Gyoza
				                                                                             				
Omakase                                                                65.9      Salmon Avocado                                                         9.9                        £13.95
6 kinds of the freshest fish selected by the chef, 18pcs                         Salmon & avocado, sesame, lemon mayo
                                                                                                                                                                   DRINK                    DESSERT
                                                                                 Tuna Avocado                                                          11.9
 SASHIMI IRO IRO                              5 piece sashimi a la carte         Tuna & avocado, sesame, lemon mayo                                           Ramune Soda          4.9 French Macarons 4.9
Maguro tuna		 20.9                        Saba mackerel		              13.9      Salmon Lover                                                         13.9    Innocent Kid Juice 2.9 Vanilla Ice Cream 4.9
		                                        		                                     Salmon, avocado, lemon mayo
Toro fatty tuna		   25.9                  Suzuki seabass		             18.9
		                                        		
Hamachi yellow tail 22.9                  Hotate scallop               20.9      Black Cod Roll                                                       14.9    MATSUBA        10 Red Lion Street. Richmond. TW9 1RW
		                                                                               Grilled black cod, spring onion, saikyo miso                                 www.matsuba.co.uk                      020 8605 3513
Shake salmon        16.9
```
