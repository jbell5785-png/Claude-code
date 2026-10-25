# Chez Lindsay: research dossier

Prepared 25 October 2026 for a speculative redesign proposal. All access dates are 25 October 2026 unless stated.
Status key: **VERIFIED** = official site, or several sources agree. **REPORTED** = one third-party source, possibly dated. **UNKNOWN** = not established.
Evidence (page text, screenshots, extracted PDFs) is in the scratchpad only: `/tmp/claude-0/-home-user-Claude-code/e50707d5-9ec5-571e-9915-9e7145ebe50f/scratchpad/prospects/chez-lindsay/`. Nothing from there goes into the repo.

## Summary

1. Chez Lindsay is a Breton/French restaurant and wine bar at 11 Hill Rise, Richmond TW10 6UQ, by Richmond Bridge. It has traded there since 1988 and is known for buckwheat galettes, crêpes, seafood and Breton cider.
2. Founder Lindsay Wotton sold the lease after 35 years. Christie & Co's sale release is dated 2/7/2024, so the sale was in 2024, not 2023 (see Conflicts). The buyer is a private "experienced operator of French cuisine". Harden's says standards are "largely unchanged".
3. The site states its hours as Mon and Wed–Sat 12 noon–10pm, Sun 12 noon–9pm, closed Tuesday. Lunch (12–5pm) is the set menu and galettes; the full carte starts at 5pm. Wednesday is steak night, and there is a Sunday brunch.
4. The menus are current PDFs: La Carte (Sept 2026), Galettes and Prix Fixe (Jan 2026), Desserts and Wines (Feb 2026), and Steak Night. All six were captured verbatim.
5. The website is a 2014 Joomla build with a fixed 1000px layout and no viewport meta tag. At 390px it overflows by 610px. It has no tap-to-call links, and some content (the Sunday brunch offer) exists only inside an image. Booking runs through an embedded OpenTable widget.

## Identity and positioning

- **What it is (VERIFIED, official site):** the logo lockup reads "Chez Lindsay / RESTAURANT & WINE BAR". About Us says "fresh, authentic French cooking from Brittany, right here on the banks of the Thames". The menu focuses on "Seafood and pancakes" plus "starters, salads, fish and meat dishes that are all typical of the region". Galettes are "a speciality", "cooked to order on a flat griddle" from "organic buckwheat". The wine list is "unashamedly French in flavour" with "a range of sparkling Brittany ciders".
- **Independent (VERIFIED, official About Us):** "As an independent restaurant…". The home page quotes Time Out describing it as "a treasured asset in chain-dominated Richmond".
- **Longevity (VERIFIED):** Find Us says "Having been here since 1988, we are very much part of the landscape on Hill Rise." This agrees with Christie & Co (owner for 35 years, milestone August 2023).
- **Occasions the site names:** Sunday lunch, business brunch, film or theatre supper, relaxed three-course dinner, group and private events.
- **Third-party positioning (REPORTED):**
  - Harden's, 2026 guide: "much loved in Richmond for its good food – galettes, seafood and the rest". Price about £64 a head, banded £££.
  - Time Out, review dated 25 Sep 2013: "Breton and classic bistro dishes", a "wood- and wicker-clad dining area", "endearingly chaotic informality", "a terrific riverside view at the back", Breton cider served in "earthenware pichets" and "rustic bowls". This is old and the décor may have changed.
- **New owners (REPORTED):** Christie & Co says the buyer intends to continue the existing offering with "subtle improvements over time". The current menus include dishes in a more modern plated style (halibut with lobster and kaffir lime bisque, beetroot tartare, harissa poussin), plus steak night and brunch promotions. Whether these are new-owner changes is UNKNOWN, because no pre-sale menu was compared.

## Verified facts table

| Fact | Value | Source | Status |
|---|---|---|---|
| Name | Chez Lindsay (logo strap: "Restaurant & Wine Bar") | chez-lindsay.co.uk (all pages) | VERIFIED |
| Address | 11 Hill Rise, Richmond, Surrey TW10 6UQ | /find-us.html; Harden's; Time Out; FSA | VERIFIED |
| Phone | 020 8948 7473 | every official page; wine list PDF; Harden's search data | VERIFIED |
| Email | restaurant@chez-lindsay.co.uk | home, /contact-us.html, wine list PDF | VERIFIED |
| Instagram | instagram.com/chez_lindsay (handle "chez_lindsay" also printed on the wine list) | site footer; Les_Vins_Feb_2026.pdf | VERIFIED (link exists; whether the account is active is UNKNOWN) |
| Facebook | facebook.com/chezlindsay (linked over http) | site footer | VERIFIED link; activity UNKNOWN |
| TripAdvisor | listing d1014985, linked from the footer badge | site footer | VERIFIED link |
| At this address since | 1988 | /find-us.html; Christie & Co | VERIFIED |
| Founder | Lindsay Wotton, owner for 35 years, retired | Christie & Co (31 Jan 2023 and 2/7/2024 releases) | VERIFIED (agent's releases) |
| Sale | Leasehold sold at asking price to a private "experienced French cuisine operator" | Christie & Co release dated 2/7/2024 | REPORTED |
| Lease terms at listing | 10 years remaining; offers over £150,000; rent £41,000 a year | Christie & Co release dated 1/31/2023 | REPORTED (dated) |
| Cuisine | Breton/French: galettes, crêpes, seafood, bistro dishes | /about-us.html; menus; Harden's; Time Out | VERIFIED |
| Private dining | First-floor room for 12 to 40 people; tailor-made, no set menus | /private-dining.html | VERIFIED |
| Service charge | "An optional service charge of 12.5% will be added to your bill" | La Carte, Galettes, Prix Fixe PDFs | VERIFIED |
| Booking system | OpenTable widget (rid=93306) embedded on /online-booking.html | page source of /online-booking.html | VERIFIED (embed present) |
| Food hygiene | Rating 5, inspected 8 Aug 2026 (FHRS ID 1574316) | FSA ratings API | VERIFIED (official register) |
| Website build | Joomla CMS; footer "© Chez Lindsay 2014", "site by prussian blue" (prussianblue.co.uk); meta author "tIMC Support" | page source | VERIFIED |
| River | "on the banks of the Thames" (official); "views of the river" (Christie 2023); riverside view "at the back" (Time Out 2013) | about-us; Christie; Time Out | VERIFIED that it is riverside; outdoor terrace UNKNOWN |

## Opening hours

As the official site states them (VERIFIED):

- **/find-us.html** (H1 "OUVERT 6 JOURS"): "We are open from 12 noon until 10pm Monday, Wednesday, Thursday, Friday and Saturday and from 12 noon until 9pm on Sundays."
- **/contact-us.html**: "We are open from 12 noon every day except Tuesdays, when we are closed all day"
- **/menus.html**: "Lunchtime Service 12-5pm: Limited to Prix Fixe and Les Galettes menus". "Evening Service from 5pm: La Carte & Les Desserts menus only, along with a Daily Special"
- **/online-booking.html**: "Please note that we now only serve the FULL CARTE IN THE EVENING with just the PRIX FIXE & GALETTE MENUS ON OFFER AT LUNCHTIME"
- **Galettes PDF:** "Served every day until 5pm". **Set lunch PDF:** "Served from 12pm till 5pm".
- **Steak Night** (homepage banner image): "Every Wednesday from 5pm till close".
- **Sunday Brunch** (homepage banner image): "Served from 12 to 5pm".
- **Happy Hour** (wine list PDF): "From 4pm to 6pm, Monday to Friday". Tuesday is closed, so this is in effect Mon and Wed–Fri (inference).

Summary table:

| Day | Hours |
|---|---|
| Monday | 12 noon – 10pm |
| Tuesday | Closed |
| Wednesday–Saturday | 12 noon – 10pm |
| Sunday | 12 noon – 9pm |

Harden's (2026) and an AAA listing give the same hours (REPORTED, corroborating). Kitchen last orders, bank-holiday and Christmas hours are UNKNOWN.

**Conflicts on the official site:** the homepage hero says "Toujours Ouvert!" and About Us says "open all day, every day". Both contradict the Tuesday closure.

## Booking and contact

- **Online:** /online-booking.html carries an H1, a note about which menus are served when, and a script that loads the OpenTable reservation widget: `//www.opentable.co.uk/widget/reservation/loader?rid=93306&type=standard&theme=tall…&ot_source=Restaurant%20website`. A source comment notes the widget depends on a "bookingcode" module.
  - In our headless load the widget did not render, and no request to opentable.co.uk was recorded. Fetching the loader URL directly returned HTTP 200.
  - **We do not claim the widget is broken for real users.** Whether it renders in a normal browser is UNKNOWN and needs a manual check on a real device.
  - OpenTable's own pages returned 503 to WebFetch, so the listing could not be read.
- **Booking-request form:** /contact-us.html has a form (RSForm) with Full name*, Email address*, Phone number*, an optional "Date & Time" and "Number of Guests" ("If you would like to reserve a table please choose your date and time below…"), and Your message*. Spam protection is CleanTalk.
- **Phone:** 020 8948 7473 appears on every page, but **never as a `tel:` link** (0 tel links across all 7 pages).
- **Email:** restaurant@chez-lindsay.co.uk, linked with `mailto:` on Home and Contact.
- **Private events:** call or email. "All our private dining functions are tailor-made (we don't have set menus or a set formula)".
- **Getting there (Find Us, VERIFIED copy):**
  - Buses: "Bus services to Richmond are aplenty."
  - Rail and Tube: "Richmond station is a 10 minute walk away and provides a link with South Western Rail to Waterloo, Network Rail's North London Line and TFL's District Line."
  - Parking: "The nearest NCP car park is in Paradise Road, a 5 minute walk away."
  - The page links to a Google Maps place at 51.457882, -0.305297.

## Menu

All six current PDFs linked from the **buttons** on /menus.html were downloaded once and extracted with pdftotext. Layout was checked against rendered page images.

- **Spelling:** shown verbatim, including the source's errors; suspected typos are marked [sic].
- **Prices:** in £ without a symbol unless the source shows one.
- **Dates:** each PDF's date comes from its filename, Last-Modified header and PDF creation date.

### A La Carte. Source: /images/PDF/La-Carte-Sept-2026.pdf (Last-Modified 7 Sep 2026)
"Dinner from 5pm"
- Glass of Cremant de Bourgogne 8.75 · Aperol, Campari or Pimm's spitz [sic] 12

**To Share:** Olives pot 5.5 · Charcuterie plate 14 · Corbeille de Pain 4.0 · Oyster 3

**Starters**
- Soupe à l'Oignon Gratinée: With rustic bread and cheese 10.5
- Soupe de Poisson: Fish soup served with cheese, rouille and croutons 14
- Salad de Crabe: Crab and Avocado salad with pink grapefruit and paprika maya [sic] 15.5
- Saint-Jacques Poêlées: Pan-fried scallops served with sweet corn puree, wild mushroom, hazelnut butter noisette drizzle with truffle oil 16.5
- Beetroot Tartare: Beetroot tartare, Grilled asparagus and Goat cheese mousse drizzled with herb infused oil 13.5
- Chicken liver and mushroom Parfait: Served with red onion marmalade and toasted sour dough bread 15
- Foie gras et chutney de figures [sic]: Terrine, fig chutney, brioche and toasted walnuts with port wine jelly 16.5

**Main course**
- Niçoise Salad: Fresh grilled tuna with mix leaves, green beans, potatoes, hardboiled egg in a vinegar dressing 21
- Filet de Dorade: Grilled fillet of sea bream, braised fennel, Provencal vegetable, sauce vierge 24.40
- Filet de Halibut: Pan-seared Halibut fillet with grilled prawns, piperade, potatoes dauphinoise, Lobster and Kaffer [sic] lime Bisque. 29.50
- Filet de Sole: Pan-fried sole fillet with sautéed spinach, capers, and parsley beurre noisette 28.5
- Spatchcock Baby Poussin: Harissa Spice grilled baby Poussin, French fries, mixed leaves salad, avocado mayo 24.50
- Confit de lapin: Confit rabbit leg, savoy cabbage and Pancetta, Potato Gnocchi, Tarragon and mustard sauce. 25.50
- Croupe d'Agneau: Lamb rump, Peas and Broad beans, Merguez sausage, Artichoke Hummus, Mint jus 26.50
- Steak Frites: Chargrilled 8oz Rump steak served with French fries and sautéed mushroom. Choice of Peppercorn or Bearnaise sauce 28.5
- Vegetarian galette: Cheese, onion, mushrooms, spinach, and tomato Buckwheat galette served with mix leaf salad 18

**Sides:** Pommes Frites 4.50 · Ratatouille 5.0 · Épinards 4.75 · Pomme de Terre Nouvelles 4.5 · Salade Panache 8 · Salade de tomates et oignon 8

"An optional service charge of 12.5% will be added to your bill". This PDF has no allergen statement.

### Les Galettes. Source: /images/PDF/Les-Galettes-January-2026.pdf (Last-Modified 15 Jan 2026)
"LES GALETTES / Traditional buckwheat pancakes with classic fillings / Served every day until 5pm"
- Complete Vegetarian With cheese, onion, mushrooms, spinach and tomato 15
- Complète with egg, cheese and ham 13
- Super Complète with egg, cheese, ham, onions, mushrooms, tomato 16.5
- Galette aux Gambas with king prawns and leeks 19.5
- Galette au Saumon Fumé with smoked salmon, lemon and chive cream 18
- Galette au Roquefort with onion sauce, celery, walnuts and Roquefort sauce 16.5
- Galette de Chez Lindsay with cheese, ham and spinach 14.5
- Galette au Chèvre with goats' cheese, tomato, spinach and lettuce 17
- Galette à la Ratatouille with cheese and ratatouille 14.5
- Galette Savoyard with Reblochon, ham, creamy potatoes 16.5

"A selection of our galettes is vegetarian and can be adapted to being vegan Add 3". Whether "Add 3" is a vegan surcharge or something else is unclear.
"An optional service charge of 12.5% will be added to your bill"
"(Please speak to our staff about your food allergies and intolerance before ordering)"

### Les Desserts. Source: /images/PDF/Les_Desserts_Feb_2026.pdf (Last-Modified 19 Feb 2026)

**Crêpes: Sweet Pancakes**
- Beurre et Sucre: With butter and sugar 7.5
- Citron: With lemon juice and sugar 7.5
- Miel Amandes: With honey sauce and almond 8.5
- Normande: With apples and salty caramel sauce 8.5
- Frangipane: With frangipane and vanilla ice cream 9.0
- Canadienne: With maple syrup 8.0
- Crêpe au Chocolat: With chocolate sauce 8.5
- Crêpe au Nutella: With Nutella chocolate 8.5
- Chocolat Banane: With chocolate sauce and banana 9.5
- Flambé your crêpe with Calvados, Cognac, Grand Marnier or a liqueur of your choice 6.5
- Chantilly – add sweet whipped cream 2.5

**Other desserts**
- Crêpe Suzette 13.5
- Fondant au Chocolat: Chocolate fondant with vanilla ice cream 8.5
- Crème Brûlée 7.5
- Dessert of the Day: Please ask for details 9.0

**Nos Sorbets:** Sorbets (3 scoops): Citron (lemon), Cassis (blackcurrant), Pomme Verte (apple) 8.5

**Nos Glaces:** Ice Creams (3 scoops): Vanille (vanilla), Chocolat (chocolate), Fraise (strawberry), Miel et Lavande (honey and lavender), Caramel Salé (salty caramel) 8.5

**Fromages:** Plateau de Fromages: Selection of French cheeses with baguette, grapes and walnuts 12.5

This PDF has no allergen or service-charge note.

### Set Lunch ("SAMPLE PRIX FIXE"). Source: /images/Prix-Fixe-January-2026.pdf (Last-Modified 15 Jan 2026, 2 pages)
"SET LUNCH / Two courses £24.50 / Three courses £28.50 / Served from 12pm till 5pm"

Each dish also carries its own price figure. Whether those are à la carte prices or something else is unclear [TO CONFIRM].

**Starters**
- Soupe du Jour: Soup of day 8
- Oignon Tarte Tatin: Caramelized onion tart, served with Herb cream 9.5
- Porc Rillettes: Pork rillettes served with chutney, balsamic glaze and country bread 10.5
- Crevettes grillées: Grilled prawns with garlic parsley butter and mixed leaves 12.5
- Saint Jacques Poêlées: Pan fried scallops, cauliflower puree, capers and raisins beurre noisette (£7 supplement) 16.5

**Mains**
- Foie de Veau: Pan fried calf liver, bacon, creamy savoy cabbage, new potatoes, and Dijon mustard sauce 19.5
- Suprême de Volaille: Pan seared corn fed chicken breast seved [sic] with pearl barely [sic] risotto and Parmensan [sic] sauce 23.5
- Filet de Daurade: Grilled Sea Bream fillet, sautéed fennel and samphire, gratin dauphinoise, Tomato and basil sauce 26
- Grilled Aubergine: Grilled Aubergine served with ratatouille, camembert, roasted new potatoes 18
- Entrecôte de Boeuf: Grilled ribeye steak served with French fries and mix salad (7 supplement) 29.5

**Desserts**
- Assiette de Fromage: Selection of French farmers cheese (4 supplement) 12.5
- Croquant au chocolat: Layered chocolate terrine with Chantilly and salted caramel ice cream (no price shown)
- Crêpe au Citron: Sweet pancake with lemon juice and sugar 8.5

Service-charge line and allergen line as on the Galettes menu.

### Steak Night. Source: /images/PDF/Steak-Night-Menu.pdf (Last-Modified 7 Sep 2026)
- Glass of Cremant de Bourgogne £8.75 · Aperol, Campari or Pimm's Spritz £12
- **Silver Package £54 for 2:** 2 x rump British Steak served with French fries, Plus, a bottle of Le Pioneer [sic, wine list spells it "Le Pionnier"] Red or White
- **Gold Package £74 for 2:** 2 x Ribeye British steak served with French fries, Plus, a Bottle of Le Tuffeau Merlot or Moulin d'Argent Chardonnay
- **Platinum Package £94 for 2:** 1x rump steak + 1 Ribeye +1 Spatchcock baby Poussin, Plus, a Bottle of Le Tuffeau Merlot or Moulin d'Argent Chardonnay
- **Sides:** Peppercorn sauce £2 · Bearnaise sauce £2 · Mix leaf salad £4.5 · Tomato and Onion salad £8 · Basket of Bread £4

The homepage banner (Banner_Steak_Night_Apr_26.jpg) says "Every Wednesday from 5pm till close / £54 for 2 / 8z [sic] rump steak with fries and a bottle of house wine to share".

### Sunday Brunch. Source: homepage banner image only (Banner_Brunch_Jul_26.png)
"Sunday Brunch £31.5 / 2 galettes + 2 drink of your choice / Served from 12 to 5pm". This is image text, not HTML. Whether £31.5 is per person or per two is UNKNOWN [TO CONFIRM].

### Les Vins (drinks list). Source: /images/PDF/Les_Vins_Feb_2026.pdf (4 pages, created 2 Feb 2026, Last-Modified 19 Feb 2026)

The full verbatim text is saved in the scratchpad (`pdfs/Les_Vins_Feb_2026.txt`). Key content:

- **Happy Hour, "From 4pm to 6pm, Monday to Friday":** 2 glasses of Crémant Blanc de Blancs & 6 Maldon Oysters 25 · Baked Camembert & 2 Glasses of House Wine (White or Red) 22 · Bottle of Selected House Wine 20.
- **Cidre (250 / pitcher / btl):** Kerisac Cidre Bouché Brut, Brittany 8 / 14.50 / 20 · Kerisac Cidre Bouché Sweet, Brittany 8 / 14.50 / 20 · Cidre Brut de Normandie Comte Louis de Lauriston, Normandy 8 / 14.50 / 20.
- **Pommeau:** Pommeau de Normandie Cidre de la Brique 125ml 9.
- **Kir:** Kir Breton (Cider and crème de cassis) 125ml 8 · Traditional Kir 8.50 · Special Kir (Rosé wine and raspberry liqueur) 8.50 · Kir Royal (Champagne with Chambord liqueur) 12.
- **Spritz:** Aperol 12 · Campari 12 · Pimm's 12.
- **Sparkling (125 / btl):** Crémant de Bourgogne Blanc de Blancs Deux Roches (biodynamic) 8.75 / 53 · Crémant d'Alsace Brut JB Adam 9.75 / 60.
- **Champagne (125 / btl):** Vauban Frères Brut AR Lenoble 13.50 / 75 · Pol Roger White Foil 20 / 120.
- **White (175 / 250 / 500 / btl):**
  - Le Pionnier Blanc, Gascogne 7.50 / 10.50 / 20 / 29
  - Chardonnay Vieilles Vignes Moulin d'Argent Domaine des Herbauges, Loire 8.50 / 12 / 23.50 / 35
  - Sauvignon Blanc L'Artiste, Loire 9.25 / 13.50 / 26 / 38
  - Picpoul de Pinet Rocs Blancs, Languedoc 9.75 / 14 / 27 / 41
  - Bottle only: Ventoux Océane La Villa des Nymphes (organic) 46 · Chablis Domaine des Miles 65 · Sancerre La Mercy-Dieu Domaine Bailly-Reverdy 70 · Montagny Blanc 1er Cru Les Deux Terres Sandrine Delétang 85
- **Rosé:** Essenciel Rosé Château Paradis, Provence (organic) 9 / 13 / 25.50 / 38.
- **Red (175 / 250 / 500 / btl):**
  - Le Pionnier Rouge, Languedoc 7.5 / 10.50 / 20 / 29
  - Merlot Le Tuffeau, Languedoc 8 / 11 / 21 / 31
  - Château Bel Air Bordeaux Supérieur 9.25 / 13 / 25 / 37.5
  - Pinot Noir L'Artiste, Loire 9.75 / 13.50 / 26 / 39
  - Bottle only: Grenache Syrah Tranquille Pinard, Rhône (organic) 42 · Brouilly L'Enfer des Balloquets Domaine Robert Perroud 50 · Château Louvie St-Émilion Grand Cru 68 · Château de la Coste Margaux 75 · Savigny-lès-Beaune Les Gollardes Domaine du Prieuré 85 · Gigondas Cuvée Tradition Domaine Gour de Chaule (organic) 90
- **Alcohol-free (250 / btl):** Bianco Alternativa Doppio Passo 0%, Sicily 9.50 / 28 · Rosso Alternativa Doppio Passo 0%, Sicily 9.50 / 28.
- **Dessert wine (125 / btl):** Monbazillac Château Ramon 37.5cl 6 / 32 · Pacherenc du Vic-Bilh Les Hautains (organic) 7 / 32.
- **Port (50ml):** Cockburn's Fine Ruby 7.50 · Taylor's LBV 8.
- **Beer:** Peroni 330ml 6.75 · Blanche de Cambrai 330ml 8 · Les Bière Des Sans Culottes 330ml 8 · Beck's Blue 0.0% 275ml 6.
- **Waters:** Hildon Still / Sparkling 3.25 (330) / 5.75 (750) · Badoit 6.50 (1ltr).
- **Café et thés:** Expresso 2.90 · Café Allongé 3.50 · Double Expresso 4 · Cappuccino 4.50 · Café au Lait 4.50 · Chocolat Chaud 4.50 · Thés 3.50 (Breakfast / Darjeeling / Green Peppermint / Chamomile).
- **Spirits, calvados, liqueurs (25ml):** full list in the scratchpad text. It includes Château du Breuil Calvados VSOP 7, Hors d'Âge (15 ans) 8.50 and Réserve des Seigneurs 30 ans 15.
- **Footer notes:** each wine is tagged biodynamic or organic; "all wines by the glass are available in 125ml glasses on request." The address is printed "11 Hillrise, Richmond TW10 6UQ".

### Outdated menus still linked
The inline text links in the /menus.html paragraphs ("La Carte", "Les Desserts", "Prix Fixe", "Les Galettes") point to **2024** PDFs: La_Carte_May_2024.pdf, Les_Desserts_Feb_2024.pdf, Prix-Fixe-Menu-Feb-24.pdf and Les_Galettes_May_2024.pdf. The buttons point to the 2026 versions. The 2024 files were not downloaded.

### Dietary and allergen statements (VERIFIED as published)
- Galettes and Prix Fixe PDFs: "(Please speak to our staff about your food allergies and intolerance before ordering)". La Carte, Desserts and the wine list carry no such line.
- Galettes PDF: "A selection of our galettes is vegetarian and can be adapted to being vegan".
- About Us: buckwheat is "gluten-free and packed with vitamins and minerals".
  - This is a claim about the flour, not a gluten-free guarantee for any dish. Do not turn it into a dietary claim [TO CONFIRM].
- No 14-allergen matrix is published.

## Brand assets and tone

- **Logo** (/images/logo.png, 490×126 PNG; no SVG found): "Chez Lindsay" in a hand-drawn, informal brush/marker script. It is not a connected copperplate script, and the "s" in Lindsay is a tall looped long-s form. Below it sits "RESTAURANT & WINE BAR" in widely tracked Gill Sans-style capitals. Both are dark olive/near-black on cream. The same lockup heads the La Carte and Galettes PDFs, and the wine list uses the script wordmark alone.
- **Colours** (from CSS via getComputedStyle and stylesheet rules; image colours sampled from screenshots):
  - Page background **#F2EFE6** (cream, `body`)
  - Text, headings and buttons **#2D2E1B / #2D2E1C** (dark olive; `body` colour, `.rsform-submit-button`, CTA buttons sampled #2D2E1C)
  - Nav bar **rgba(45,46,27,0.6)** laid over the hero image, nav text **#F2F0E6**. Over the orange brunch banner it reads as brown (#7E4117 sampled).
  - Form fields **#DFDDD1**
  - Brunch banner orange **≈#F75E12** (inside the image, not CSS)
  - Steak-night banner pale aqua (inside the image)
  - Off-palette: the mobile hamburger uses the menu module's default navy **#192F4D** with **#D1E3FB** icon colour.
- **Fonts:** self-hosted Gill Sans MT Std. Light is the body, nav and buttons; Bold is the H1 and emphasis; Medium is declared but did not load. Content text is set at 21px/30px centred, nav at 16.5px uppercase, footer at 10px. Web licensing for these files is UNKNOWN. Banners use casual handwritten display lettering inside the images.
- **Photo subjects** (described only, not copied):
  - **Plated dishes:** seared salmon on green purée with almonds; smoked salmon with beetroot and edible flowers; sliced duck or lamb with redcurrants; a glazed confit leg; cod or hake with prawns and caviar-style garnish in a beurre blanc; a leek-wrapped fish dish on gnocchi.
  - **Galettes and crêpes:** a square-folded buckwheat galette complète with egg and ham; a crêpe being flambéed with blue flame at the table.
  - **Seafood and the private room:** a fruits de mer platter of oysters, langoustines, mussels, whelks and lemon on a stand beside champagne in an ice bucket; flowers and rosé on a white-dressed table.
  - **Interiors:** a warm-lit, candle-lit dining room with diners.
  - **Motifs:** a crossed French and British cocktail-flag device sits centred in every footer, and every footer carries a TripAdvisor "Recommended" badge.
- **Recurring phrases:**
  - French greetings and signs: "Bienvenue . . .", "Bon appetit!", "Toujours Ouvert!", "Ouvert 6 jours", "Join us for Steak Night every Wednesday", "the glories of Breton cooking" / "the twin glories of Breton cooking" (attributed to Time Out).
  - Press lines: "neighbourhood restaurant par excellence", "French grub comme il faut" (attributed to Square Meal), "authentically Breton" (attributed to Harden's).
- **Tone:** warm, hospitable and conversational ("we would love to see you any time", "do call us", "We look forward to welcoming you"), with light Franglais and a modest rather than luxury register. Every page leans on third-party quotes (Time Out, Harden's, Square Meal, TripAdvisor).
- **Staff naming:** the official site names no current staff. The Private Dining testimonial names "Lindsay" (the retired founder) and gives a TripAdvisor reviewer's full name. Neither should be reused, and the founder-centred testimonial is out of date since the sale.

## Current website audit

Method:
- Each navigation page was loaded twice in Playwright headless Chromium with default settings, once at 1440×900 and once at 390×844 (desktop-mode viewport, `isMobile` not set). /online-booking.html had one extra diagnostic load.
- The menu PDFs and six homepage slide images were each fetched once.
- Raw data is in `pages/crawl-report.json` and `pages/styles.json` in the scratchpad.

### Strengths to keep
1. **Short, clear navigation:** seven plain labels (Home, Book Online, Menus, About Us, Private Dining, Find Us, Contact Us). The CTA row "BOOK ONLINE / MENUS / CONTACT US" repeats on most pages.
2. **Phone number up front:** it sits in the homepage hero and in large type on Private Dining and Find Us.
3. **Up-to-date content:** the La Carte and Steak Night PDFs are dated Sept 2026 and the banners Apr and Jul 2026, so someone maintains the site.
4. **Strong food photography:** bright plates, a seafood platter and a flambéed crêpe. Worth reusing with permission.
5. **Distinctive identity:** the hand-drawn script logo, the cream and dark-olive palette, and the French/British flags motif.
6. **Warm, practical copy:** the transport and parking directions are useful as written, and the private-dining capacity (12–40) is clearly stated.
7. **Credible third-party endorsements:** Time Out, Harden's and Square Meal.

### Specific opportunities (with measurements)
1. **Not mobile-ready.** No `<meta name="viewport">` on any of the 7 pages.
   - At 390px, `documentElement.scrollWidth` is **1000** against `innerWidth` **390** on every page, so **610px of horizontal overflow**. The logo and hero are clipped on the right (screenshot home-390-fold.png).
   - Inference, not measured: on a real phone with no viewport meta, the browser would lay out about 980–1000px and zoom out to about 39%. The 21px content text would then appear at about 8px and the 10px footer at about 4px.
2. **Small tap targets** (measured at 390px):
   - Footer Facebook icon link 22×11px, Instagram 45×11, TripAdvisor 84×11, "Site Map" 34×11.
   - Inline menu links are 21px tall. The large dark menu buttons measure only about 91–162×21px as links, so the clickable area appears to be the text rather than the whole 230×60 button (measured anchor box; worth a manual check).
   - The hamburger is 40×41px and sits on top of the logo. We could not confirm that it opens: after a viewport resize it did not open, so verify on a device.
3. **No tap-to-call.** None of the 7 pages has a `tel:` link, although the number appears 1–3 times per page.
4. **Menus are PDF only, with stale duplicates.** There are 6 current PDFs and no HTML menu. Four inline links on the same page open 2024 menus. The Sunday brunch offer exists **only inside an image**, whose alt text is a block of the hero box's text, the same on all 7 slides.
5. **Hours are hard to find and contradictory.** Hours are not on the homepage; on mobile they are two taps away (menu, then Find Us) if the hamburger works. The homepage says "Toujours Ouvert!" and About Us says "open all day, every day", but the restaurant closes on Tuesdays.
6. **Taps to book:** one tap from the homepage (BOOK ONLINE / BOOK YOUR TABLE NOW) reaches /online-booking.html, where the page relies entirely on the OpenTable script. It did not render in our environment (status for real users UNKNOWN), and the page has no fallback link, phone link or explanatory text if the widget fails.
7. **SEO and meta:**
   - Titles are generic and inconsistently cased: "Home", "BOOK ONLINE", "Menus", "ABOUT US", "PRIVATE DINING", "FIND US", "Contact Us". None includes "Chez Lindsay", "Richmond" or "crêperie".
   - Meta descriptions are auto-generated from body text with missing spaces, for example "JOIN US FOR STEAK NIGHT EVERY WEDNESDAY8oz rump & fries…".
   - The homepage has no H1. Hero slide images have empty or garbage alt text.
   - No structured data (Restaurant schema) was observed. This is inferred from the source; there was no exhaustive check.
8. **Hygiene and maintenance:**
   - The footer still reads "© Chez Lindsay 2014".
   - A stylesheet returns 404 on every page (/templates/chez/css/vmcss.css), with no visible effect.
   - A hidden third-party backlink ("make responsive website quickly", to thegrue.org) is injected by the menu module and hidden by script.
   - Facebook and TripAdvisor are linked over http.
   - The cookie notice is a fixed 500px box that covered intro text on the Contact page at 390px.
9. **Content currency after the sale:** testimonials centred on "Lindsay" and reviewer names; quotes from guides with unknown dates (the Time Out review is 2013). Old offers in third-party listings (an expired Richmond Card offer) are outside the site's control.
10. **Allergen information** is inconsistent across menus (see the Menu section).

## Audience (INFERENCE, not researched data)

- Local Richmond and Richmond Hill residents and long-time regulars. Harden's says there is "a very loyal local following", as quoted on the site.
- Couples and families on day trips to the riverside, Richmond Park and Richmond Hill.
- Pre- and post-theatre or cinema diners. The site itself names "film or theatre supper"; the Richmond Theatre is nearby (general knowledge, not checked).
- Small business and celebration groups for the 12–40 private room.
- Value-seekers drawn by the set lunch, steak night, happy hour and Sunday brunch promotions. Mobile traffic is likely high for a walk-in riverside restaurant (inference), which makes the mobile issues commercially relevant.

## Unknowns and conflicts

| # | Item | Detail | Status |
|---|---|---|---|
| 1 | Sale year | The brief says "sold the lease in 2023". Christie's sale release is dated "2/7/2024" (day/month order ambiguous). The 2023 date is the 35-year milestone (Aug 2023) and the for-sale listing (31 Jan 2023). Harden's 2025 edition says sold "last year". So the sale was 2024, with the month UNKNOWN. | CONFLICT, resolved to 2024 |
| 2 | "Toujours Ouvert" / "open every day" | Contradicts the Tuesday closure stated on Find Us and Contact. | CONFLICT on official site |
| 3 | Set lunch price | Official PDF (Jan 2026): £24.50 two / £28.50 three courses. Harden's and an OpenTable snippet: £27.50 three courses. Harden's is likely older. | CONFLICT; use the official figure |
| 4 | Per-dish prices on set lunch | Their meaning is unclear. | UNKNOWN |
| 5 | Private room capacity | Official: 12–40. OpenTable search snippet: up to 45 (page unreadable, 503). | CONFLICT; use the official figure |
| 6 | Brunch price basis | £31.5 per person or per two. | UNKNOWN |
| 7 | "Add 3" on galettes | Vegan surcharge? | UNKNOWN |
| 8 | OpenTable widget | Embedded but not rendered in headless; real-user behaviour unverified. | UNKNOWN |
| 9 | New operator identity, chef, any rebrand plans | Christie: the buyer wishes to remain private. | UNKNOWN |
| 10 | Outdoor seating, terrace, river-view tables | Not stated on the official site. | UNKNOWN |
| 11 | Instagram and Facebook activity, follower counts | Not checked (login walls). | UNKNOWN |
| 12 | Photo and font rights | Ownership of the photography and the Gill Sans web licence. | UNKNOWN |
| 13 | Last orders, holiday hours, Daily Special content | Not stated. | UNKNOWN |
| 14 | Wine house name spelling | "Le Pionnier" (wine list) vs "Le Pioneer" (steak night). | CONFLICT (typo) |
| 15 | Footer credit | The brief says "site by prussia"; the actual text is "site by prussian blue" (prussianblue.co.uk). | Corrected |
| 16 | Covers, capacity of the main room | Not found. | UNKNOWN |

## Sources (all accessed 25 October 2026)

**Official site, rendered in Playwright headless Chromium**
- https://www.chez-lindsay.co.uk/ (Home)
- https://www.chez-lindsay.co.uk/online-booking.html
- https://www.chez-lindsay.co.uk/menus.html
- https://www.chez-lindsay.co.uk/about-us.html
- https://www.chez-lindsay.co.uk/private-dining.html
- https://www.chez-lindsay.co.uk/find-us.html
- https://www.chez-lindsay.co.uk/contact-us.html

**Official menu PDFs and banner images**
- https://www.chez-lindsay.co.uk/images/PDF/La-Carte-Sept-2026.pdf
- https://www.chez-lindsay.co.uk/images/PDF/Les-Galettes-January-2026.pdf
- https://www.chez-lindsay.co.uk/images/PDF/Les_Desserts_Feb_2026.pdf
- https://www.chez-lindsay.co.uk/images/PDF/Les_Vins_Feb_2026.pdf
- https://www.chez-lindsay.co.uk/images/Prix-Fixe-January-2026.pdf
- https://www.chez-lindsay.co.uk/images/PDF/Steak-Night-Menu.pdf
- https://www.chez-lindsay.co.uk/images/HomeSlider/Banner_Brunch_Jul_26.png (viewed in screenshot)
- https://www.chez-lindsay.co.uk/images/HomeSlider/Banner_Steak_Night_Apr_26.jpg

**Third-party sources**
- OpenTable widget loader in page source: https://www.opentable.co.uk/widget/reservation/loader?rid=93306 (HTTP 200 on direct fetch)
- Christie & Co, sale release dated 2/7/2024: https://christie.com/news-resources/press-releases/popular-french-restaurant-in-richmond-sold-through-christie-co-as-owner-retires-after-35-years
- Christie & Co, for-sale release dated 1/31/2023: https://www.christie.com/news-resources/press-releases/popular-french-restaurant-in-richmond-seeks-new-owner-through-christie-co/
- Harden's, 2023–2026 survey entries: https://hardens.com/az/restaurants/richmond/tw10/chez-lindsay.htm
- Time Out, review dated 25 Sep 2013: https://www.timeout.com/london/restaurants/chez-lindsay
- Food Standards Agency, FHRS ID 1574316: https://ratings.food.gov.uk/business/1574316 (queried via https://api.ratings.food.gov.uk/Establishments?name=Chez%20Lindsay&address=TW10%206UQ)
- AAA listing (hours only, seen in search results): https://www.aaa.com/tripcanvas/restaurant/chez-lindsay-AA46999
- TripAdvisor (linked from the site; not read): http://www.tripadvisor.co.uk/Restaurant_Review-g191301-d1014985-Reviews-Chez_Lindsay-Richmond_upon_Thames_Surrey_England.html

**Sources that refused or had no usable content**
- OpenTable listing pages (https://www.opentable.com/chez-lindsay, https://www.opentable.co.uk/restref/client/?rid=93306) returned 503.
- Richmond Council Richmond Card page (https://www.richmond.gov.uk/richmondcard_business_details?bid=1223) returned a generic landing page only.
- The Lonely Planet page returned no venue content.
- No Square Meal page was found. The Square Meal quote comes from the official site only.
