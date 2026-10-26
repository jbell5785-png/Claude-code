# Real Google AI Overview / AI Mode checks: Matsuba (captured by the client on a phone, Richmond, 26 Oct 2026, 14:49 to 14:54)

Searches seen: "Matsuba Richmond menu and prices", "does Matsuba Richmond do takeaway discounts?", a booking/no-show question, plus the result page for the menu search.
Ground truth: richmond-sprint-v2/matsuba/research/copy-deck.md (current matsuba.co.uk menu, and the 2026 TA10 takeaway PDF).

## Wrong or stale facts in Google's AI answer
| What Google said | What Matsuba currently publishes | Likely source of the error |
|---|---|---|
| Tuna Tataki £11.90 | 14.9 | an old menu or PDF |
| Matsuba V Special Bento £28.90 | 29.9 (main menu); 30.9 (bento card) | old PDF |
| Sushi Bento / Sashimi Bento £27.90 each | Sushi 28.9 / Sashimi 29.9 (bento card) | old PDF |
| Matsuba Special: £32.90 (AI Overview); £31.90 (Google's menu panel) | 32.9 (main menu) and 33.9 (bento card): the restaurant's own pages disagree | Google's menu panel says "Acquired from matsuba.co.uk/wp-content/uploads/2024/09/MATSUBA-TA8-brown.pdf", a 2024 takeaway PDF still on their server |
| 20% off collection "Tuesday–Thursday all day and Friday lunch", phone or in person | "20% OFF COLLECTION ONLY EVERYDAY, Kids Menu not included" (2026 TA10 PDF); online ordering through Toast | the old 2024 takeaway PDF |
| Booking: "separate deposits or minimum-spend cancellation policies may apply depending on your specific arrangement" (vague) | card to secure the table; £10 per person for a no-show or less than 24 hours' notice; parties over 12 by phone | the policy sits inside the booking widget, so AI can't read it |

## Source quality
- **Weak sources cited:** an unrelated Reddit thread ("Been running my place for 3 years. No") and a scraper site (matsuba.uk-restaurants.com).
- **Other sources:** Deliveroo, OpenTable (4.5, 210 reviews, £26–40), myrichmond.london (10% off Tuesday–Thursday with a LoveLocal card; not on Matsuba's own site; to confirm), and Facebook.
- **Paid ad:** a **sponsored Deliveroo ad** sits above Matsuba's own site on a search for Matsuba's own menu.
- **Google profile:** 4.4 stars (263 reviews), £30–40.

## Right
- Address (10 Red Lion Street, TW9 1RW) and phone (020 8605 3513).
- The menu is largely read from matsuba.co.uk's HTML menu page. That's good: text menus work.
- The hours snippet from the Reservations page reads "Monday – Friday 12pm – 3pm / 5pm –…". Monday is disputed by other sources (to confirm with the owner).

## Pitch takeaway
Google is reading Matsuba's own website, including the out-of-date 2024 PDFs still on their server. That gives diners old prices and the wrong discount days, and even the current pages disagree on the bento price. The redesign fixes this with one current HTML menu, structured data with the same prices, booking terms in plain text, and retiring or redirecting the old PDFs. That's an honest, checkable before-and-after.

## Second batch (14:47 to 14:49)
### "how do I book Matsuba Richmond and is there a no-show charge?"
- **Wrong, and the most damaging error:**
  - Google said: "Matsuba generally **does not enforce a strict no-show or cancellation fee**… hold your table for a grace period of 15 minutes", citing **Reddit**.
  - Matsuba's actual terms: a card is required, and they "reserve the right to charge £10 per person" for a no-show or less than 24 hours' cancellation notice.
  - So AI is telling diners the opposite of the restaurant's policy, which undermines its no-show protection.
- **Unverified:** "full venue hire up to 30 guests" (source unknown).
- **Booking:** says OpenTable or the official reservations page; the official page uses Favourite Table.

### "is it open on Mondays?"
- Google: "Yes, Matsuba in Richmond is open on Mondays", citing **Instagram, 29 Aug 2026: "MONDAYS ARE NOW FOR MATSUBA"**. It also gives Mon–Fri 12–3 / 5–10, Sat 12–10, Sun closed (the official reservations page).
- **This is new evidence for our TO CONFIRM item:** Monday opening looks to have started around August 2026. It still needs confirming with the owner. Harden's and others still say closed Mondays.

### "aburi sushi Richmond" / "where can I get aburi sushi in Richmond"
- The AI Overview names **only Sticks'n'Sushi** (George Street) and lists its aburi nigiri. **Matsuba isn't mentioned**, even though its menu has eight aburi nigiri, a Salmon Combo with aburi, and the Lion King aburi nigiri.
- Its map also mixes in Zenbu Aburi in Richmond, **British Columbia, Canada**.

### "best Japanese restaurant in Richmond London"
- Matsuba **appears second**, after Sticks'n'Sushi (4.7, 599 reviews): "Classy, independent neighborhood favorite in the town center offering a combination of traditional and modern Japanese dishes with an omakase sushi selection."
- Also listed: Hanana Sushi, Neighbourhood Cafe Yukari, Umi and Ke Sushi.
- There's a **sponsored Ottolenghi** result and an OpenTable "25 Best Japanese Restaurants" list.

### "sushi near Richmond station"
- Sponsored results come first (Zuru Zuru, Namaiki and SUSHINOEN, none of them in Richmond).
- The map pack shows itsu, Sticks'n'Sushi and Matsuba (4.4, 263, "Stylish spot for broad Japanese dishes").
- In the organic list Matsuba comes after Sticks'n'Sushi and itsu.

## Overall pitch takeaways for Matsuba
1. **AI tells diners there's no no-show fee**, citing Reddit. The real policy is £10 a head, and it sits inside the booking widget where AI can't read it. Fix: put the terms in plain text on the page and in the structured data.
2. **The aburi speciality is invisible.** For "aburi sushi Richmond", Google sends people to Sticks'n'Sushi. Fix: aburi-led content with the dish names in text (Concept C is built on exactly this), plus Menu structured data.
3. **Stale 2024 PDF prices and the wrong discount days.** Fix: one current HTML menu, and retire or redirect the old PDFs.
4. **Monday opening:** their own Instagram says Mondays are on; other listings disagree. Fix: one source of truth for hours on the site, in structured data, and on the Google Business Profile.
