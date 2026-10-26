# Real Google checks: Tide Tables Café (client's phone, Richmond, 26 Oct 2026, 15:19 to 15:23)

Ground truth: `../../tide-tables/research/copy-deck.md`, plus a **new finding** (below).

## New finding: the café has TWO official websites
- **tidetablescafe.com:** the site our research used. It says "Open during daylight hours… please call", has no menu, and gives the email hey@tidetablescafe.com.
- **tidetablescafe.co.uk:** also live, over http only; https fails with a certificate error.
  - Google treats this one as the "Business website", and its menu panel says "Acquired from Business website · 1 month ago".
  - Its Contact page gives specific hours: **"Monday-Friday 7:30am, serving from 8am till Dusk. Saturday & Sunday 7am, serving from 7:30am till Dusk."** It also lists Christmas and Boxing Day hours and the email contact@tidetablescafe.co.uk.
  - Its homepage says "The food is strictly vegetarian, and there are vegan and gluten-free menus… licensed and serve organic wines, beers and ciders."
  - Checked by plain HTTP request on 26 Oct 2026.
- **Our research missed it.** The dossier recorded `.co.uk` as "did not resolve", which was true over https but not over http. The copy deck and the three concepts are being updated to use these published hours.

## Google Business Profile
- **No opening hours are set at all.** Google shows "Add business hours".
- The listing reads 4.3 stars (1.3k reviews), £1–10 per person, "Hip veggie and vegan cafe in converted arches with a large, tree-shaded terrace next to ferry dock." The description is written by Google.

## What Google's AI says
- **Hours:** taken from the `.co.uk` Contact page (correct as published), plus VisitRichmond's 08:00–18:00 / 07:30–18:00, plus "call to confirm". Elsewhere it says drinks are "served until 8:00 PM", which conflicts with "till dusk".
- **Menu:** "100% vegetarian… extensive vegan and gluten-free" (correct). But the listed dishes include Cornish pasties, feta and spinach quiche, chickpea curry, harissa flatbreads, samosas, macaroni cheese and red velvet cheesecake.
  - These come largely from **tide-tables-cafe.hey-restaurants.com**, a scraper site titled "Tide Tables Cafe Menu (Latest Full Update 2026)".
  - The café publishes no menu, so a third party fills the gap, and Google repeats it. Unverified.
- **Booking:** "Tide Tables Cafe operates strictly on a walk-in basis". This is unverified. The café's own site arranges parties by phone (07922 474327).
- **Dogs:** "very dog friendly", from a 2018 Tripadvisor answer, staycation.co.uk and review snippets. The café itself says nothing.
  - The dog search map also shows **"Tide Cafe" in Grange-over-Sands**, a name mix-up.
- **Walk to Hollyhock:** correct, via the Thames Path and Grotto Gate, the tunnel and the steps (source: thamespath blog). It also offers an alternative via Hill Rise, 0.4 miles and 10–12 minutes.

## Niche searches
- **"riverside café in Richmond for Sunday brunch":**
  - A sponsored Ottolenghi result comes first.
  - The AI picks are Peggy Jean, Bingham Riverhouse, Tapas Brindisa and Hollyhock. Tide Tables is mentioned only as "strictly walk-in".
  - In the places pack, Tide Tables comes **first** for "café by Richmond Bridge", and second after Peggy Jean for the brunch search.
- **"Tide Tables Richmond menu":** a **sponsored competitor ad** (an Instagram-hosted "All-Day Breakfast & Brunch – Proper Full English Fry-Up") sits above Tide Tables' own site.
- **"vegetarian café Richmond riverside":** sponsored Ottolenghi and Roebuck pub first; Hollyhock 4.6 then Tide Tables 4.3 in places.

## Pitch takeaways for Tide Tables
1. **Two websites saying different things**, and the Google profile has **no hours**. That is the root of the hours confusion. Fix: one site, one set of hours (published and in structured data), and hours set on the Google profile.
2. **No menu, so a scraper site invents one**, and Google repeats it (Cornish pasties and macaroni cheese at a vegetarian café, possibly correct, possibly not). Fix: publish a real menu as text, even a short one.
3. **Booking and dogs are answered by strangers.** AI says "strictly walk-in" and "very dog friendly", from old reviews. Fix: state the policy on the site and in the Google profile's attributes.
4. **A competitor pays to appear above their name** on a menu search. That's an ads and Google profile matter, so it belongs in the add-on.
