# Builds the three "What Google tells your customers" one-page sheets.
# python3 build_onepagers.py  -> richmond-sprint-v2/_ai-visibility/<biz>/one-pager.html
import base64, html, os

A = os.path.dirname(os.path.abspath(__file__))
OUT = '/home/user/Claude-code/richmond-sprint-v2/_ai-visibility'
e = html.escape

def img(path):
    return 'data:image/jpeg;base64,' + base64.b64encode(open(path, 'rb').read()).decode()

BIZ = [
  dict(slug='matsuba', folder='matsuba', name='Matsuba', title='Matsuba AI Check',
    where='10 Red Lion Street, Richmond',
    good='Google already ranks Matsuba second for “best Japanese restaurant in Richmond London”, described as a “classy, independent neighbourhood favourite”. AI can see you. It just has the details wrong.',
    rows=[
      ('Is there a no-show charge?', '“Matsuba generally does not enforce a strict no-show or cancellation fee… hold your table for 15 minutes.” (source: Reddit)', 'A card secures the table; £10 per person for a no-show or less than 24 hours’ notice.', 'wrong'),
      ('Tuna Tataki', '£11.90', '14.9 on your current menu', 'old'),
      ('Matsuba Special bento', '£31.90 in Google’s menu panel, “acquired from …/2024/09/MATSUBA-TA8-brown.pdf”; £32.90 in the AI answer', '32.9 on the menu page, 33.9 on the bento card: your own pages disagree', 'old'),
      ('Takeaway discount', '20% off collection “Tuesday–Thursday all day and Friday lunch”, phone or in person', '“20% off collection only, everyday, kids menu not included”, ordered online through Toast', 'old'),
      ('Aburi sushi in Richmond', 'Names only Sticks’n’Sushi, plus a restaurant in Richmond, Canada', 'Eight aburi nigiri, the Salmon Combo B and the Lion King nigiri', 'missing'),
      ('Open on Mondays?', '“Yes”, from your Instagram post of 29 Aug 2026; other listings still say closed', 'Your reservations page says Monday to Friday; please confirm', 'mixed'),
      ('Address and phone', '10 Red Lion St, TW9 1RW · 020 8605 3513', 'Correct', 'right'),
    ],
    why=['Old 2024 takeaway PDFs are still on your server, and Google reads them as current.',
         'Booking terms sit inside the booking widget, where AI can’t read them, so it fills the gap from Reddit.',
         'Your aburi dishes are listed, but nothing tells search engines they are your speciality.',
         'A sponsored Deliveroo ad appears above your own site when people search for your menu.'],
    fixes=['One current menu as plain text, with every aburi dish named and marked',
           'Booking terms and hours written out on the page',
           'Structured data (machine-readable menu, prices, booking and ordering links) matching the page',
           'Old PDFs retired or redirected at launch'],
    profile=['Confirm Monday hours and set them on your Google profile',
             'Point the profile’s menu link at the new menu page',
             'Add the booking link (Favourite Table) and the Toast ordering link',
             'Mention aburi in the description and menu items'],
    score=(17, 20, 'Read today’s web: missed the no-show charge and the everyday collection discount. Read the new site: got both right.'),
    shots=[('matsuba-2a12dd90.jpg', 'No-show policy, answered from Reddit'), ('matsuba-04c1264b.jpg', 'Tuna Tataki at an old price'), ('matsuba-f4e3cff7.jpg', 'Menu “acquired from” a 2024 PDF')]),
  dict(slug='maids', folder='maids-of-honour', name='The Original Maids of Honour', title='Maids of Honour AI Check',
    where='288 Kew Road, opposite Kew Gardens',
    good='Google puts you first for “afternoon tea near Kew Gardens” and second for “best traditional afternoon tea in Richmond”. You are being recommended. The details it gives visitors are where it goes wrong.',
    rows=[
      ('Afternoon tea conditions', '“Minimum spend of £20 per person plus a 12.5% service charge… between 12:00 PM and 3:00 PM”, given three times as an afternoon-tea rule', 'That minimum belongs to Luncheon. Your pages also disagree on it: £20 on the page, £22 on the printed menu.', 'wrong'),
      ('Set tea prices', 'High Tea £24.50 … Special £50, “represented by their set voucher pricing”', 'Correct today, but read from the gift-voucher shop because the tearoom menus are photos', 'mixed'),
      ('When were you founded?', '“Founded in 1850 by Robert Newens… 1860 moved to Kew… 1887 moved to 288 Kew Road”', 'Your own line: Est. 1850, when Alfred opened on the Kew Road “exactly where we are today”', 'wrong'),
      ('Google’s description', '“Chintzy family-run… since 1860”', 'Your logo says Est. 1850. Your history pages and the Council’s notes describe the family’s role differently, so Google can’t tell which is current', 'mixed'),
      ('Thursday cooked breakfast', '“No… bakery pastries remain available”', 'Correct (your breakfast page is text)', 'right'),
      ('Opening hours, tart prices', '9am–6pm daily; tart £3.50 in the tearoom, £2.25 online, £17 for 8', 'Correct', 'right'),
    ],
    why=['Breakfast, luncheon, set-tea and drinks menus are photos, so AI can’t read them and guesses from other pages.',
         'Rules for each service sit close together, so the lunch minimum gets attached to afternoon tea.',
         'Three founding dates (1850, 1860, 1887) appear across your site, the Council’s notes and listings.',
         'Paid results from OpenTable, Deliveroo and voucher sellers sit above the AI answer.'],
    fixes=['Every menu as real text, with prices, allergens and the service-charge line',
           'Clearly separated rules for breakfast, luncheon and set teas',
           'One history line, “Est. 1850 (our own date)”, with the Henry VIII story labelled as legend',
           'Structured data and booking links for each service (ResDiary)'],
    profile=['Match the profile description to your own history line',
             'Add the set-tea and luncheon booking links separately',
             'Set categories: Tea room, Bakery',
             'Reply to recent reviews and add current photos of the tearoom'],
    score=(10, 18, 'Read today’s web: fell back on Deliveroo prices and applied the lunch minimum to afternoon tea. Read the new site: quoted the set teas and tart price correctly.'),
    shots=[('maids-e41df021.jpg', 'Top pick, with the lunch minimum attached'), ('maids-92c51002.jpg', 'A founding timeline Google assembled'), ('maids-fb79dbb0.jpg', 'Tea prices read from the voucher shop')]),
  dict(slug='tide', folder='tide-tables', name='Tide Tables Café', title='Tide Tables AI Check',
    where='2 The Arches, under Richmond Bridge',
    good='Google shows Tide Tables first for “café by Richmond Bridge” and second for “riverside café in Richmond for Sunday brunch”, at 4.3 stars from 1,300 reviews. People are looking for you. Google is just unsure what to tell them.',
    rows=[
      ('Opening hours', 'Three versions: your .co.uk Contact page, VisitRichmond’s 8:00–18:00, and drinks “until 8:00 PM”', 'Your .co.uk site: Mon–Fri from 7:30am, Sat–Sun from 7am, until dusk. Your .com site: “daylight hours”', 'mixed'),
      ('Google profile hours', '“Add business hours”: none set', 'None set', 'missing'),
      ('What’s on the menu?', 'Cornish pasties, macaroni cheese, chickpea curry, red velvet cheesecake…, largely from a third-party site titled “Tide Tables Cafe Menu (Latest Full Update 2026)”', 'You don’t publish a menu, so a stranger’s site is writing it', 'guess'),
      ('Can I book?', '“Operates strictly on a walk-in basis”', 'Your site arranges parties by phone on 07922 474327', 'wrong'),
      ('Dogs?', '“Very dog friendly”, from a 2018 Tripadvisor answer', 'Not stated by you', 'guess'),
      ('Vegetarian? Walk to Hollyhock?', 'Strictly vegetarian with vegan and gluten-free options; Thames Path to Grotto Gate, tunnel and steps', 'Correct', 'right'),
    ],
    why=['Two official websites (.com and .co.uk) say different things, with different email addresses.',
         'No hours are set on your Google profile, so it borrows them from wherever it can.',
         'No menu online, so copycat sites invent one and Google repeats it.',
         'A competitor’s sponsored ad appears above your site when people search for your menu.'],
    fixes=['One website, with your published hours and phone number',
           'A real menu page, even a short one, as text',
           'Your own answers on booking, parties and dogs',
           'Structured data that matches the page'],
    profile=['Set opening hours (including Christmas and Boxing Day)',
             'Add the menu link and attributes: outdoor seating, dogs, vegetarian',
             'Point the profile at the one website you keep',
             'Retire or redirect the second website'],
    score=(16, 20, 'Read today’s web: leaned on third-party hours and said dogs were “probably” fine. Read the new site: used your own wording and phone number and gave the Grotto Gate route.'),
    shots=[('tide-57d36420.jpg', 'Your Google profile: no hours set'), ('tide-4e35bbaf.jpg', 'A menu Google pieced together'), ('tide-a928c111.jpg', 'A competitor’s ad on your name')]),
]

VERDICT = {'wrong': 'Wrong', 'old': 'Out of date', 'missing': 'Missing', 'mixed': 'Mixed', 'guess': 'Guessed', 'right': 'Right'}

CSS = '''
:root{
  /* Layout: a fact-check sheet. Summary, then a three-column correction table, then fixes; screenshots as evidence. */
  --paper:#F7F8FA; --sheet:#FFFFFF; --ink:#16202B; --muted:#55616E; --rule:#D9DEE4;
  --red:#B3261E; --red-bg:#FBE9E7; --amber:#8A5300; --amber-bg:#FFF3DC; --green:#1E6B3A; --green-bg:#E5F4EA; --blue:#244C8F;
  --f-display:"Newsreader",Georgia,"Times New Roman",serif; --f-body:"IBM Plex Sans",system-ui,-apple-system,"Segoe UI",sans-serif; --f-quote:"IBM Plex Mono",ui-monospace,Menlo,monospace;
}
@media (prefers-color-scheme: dark){:root:not([data-theme="light"]){--paper:#0F141A;--sheet:#161D25;--ink:#E8ECF1;--muted:#A3AFBC;--rule:#2B3540;--red:#FF8A80;--red-bg:#3A1C1A;--amber:#FFC56B;--amber-bg:#352711;--green:#7FD49B;--green-bg:#15301F;--blue:#9DB8F0;color-scheme:dark}}
:root[data-theme="dark"]{--paper:#0F141A;--sheet:#161D25;--ink:#E8ECF1;--muted:#A3AFBC;--rule:#2B3540;--red:#FF8A80;--red-bg:#3A1C1A;--amber:#FFC56B;--amber-bg:#352711;--green:#7FD49B;--green-bg:#15301F;--blue:#9DB8F0;color-scheme:dark}
*{box-sizing:border-box}
body{background:var(--paper);color:var(--ink);font:400 15px/1.55 var(--f-body);padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px));padding-block:24px 40px}
.sheet>*{min-width:0}
.sheet{max-width:1040px;margin:0 auto;background:var(--sheet);border:1px solid var(--rule);border-radius:4px;padding:clamp(18px,4vw,44px);display:grid;gap:28px}
header{display:grid;gap:6px;border-bottom:2px solid var(--ink);padding-bottom:18px}
.eyebrow{font:600 12px/1.3 var(--f-body);letter-spacing:.12em;text-transform:uppercase;color:var(--muted)}
h1{font:600 clamp(28px,5vw,44px)/1.08 var(--f-display);margin:0;text-wrap:balance}
h1 em{font-style:italic;font-weight:500}
h2{font:600 22px/1.2 var(--f-display);margin:0 0 10px;text-wrap:balance}
.meta{color:var(--muted);font-size:14px}
.good{font-size:17px;max-width:70ch;margin:0}
table{width:100%;border-collapse:collapse;font-size:14px}
.tablewrap{overflow-x:auto}
th{text-align:left;font:600 12px/1.3 var(--f-body);letter-spacing:.08em;text-transform:uppercase;color:var(--muted);padding:8px 10px;border-bottom:1px solid var(--rule)}
td{padding:12px 10px;border-bottom:1px solid var(--rule);vertical-align:top}
td.q{font-weight:600;min-width:9em}
td.said{font-family:var(--f-quote);font-size:13px;color:var(--ink);min-width:16em}
td.truth{min-width:14em}
.chip{display:inline-block;font:600 11px/1 var(--f-body);letter-spacing:.06em;text-transform:uppercase;padding:6px 8px;border-radius:3px;white-space:nowrap}
.v-wrong{color:var(--red);background:var(--red-bg)} .v-old,.v-mixed,.v-guess,.v-missing{color:var(--amber);background:var(--amber-bg)} .v-right{color:var(--green);background:var(--green-bg)}
tr.r-wrong td.said{text-decoration:line-through;text-decoration-color:var(--red);text-decoration-thickness:1.5px}
.cols{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:24px}
.cols>*{min-width:0}
ul{margin:0;padding-left:1.1em;display:grid;gap:6px}
.score{display:grid;grid-template-columns:auto 1fr;gap:18px;align-items:center;border:1px solid var(--rule);border-radius:4px;padding:16px 18px}
.nums{font:600 34px/1 var(--f-display);font-variant-numeric:tabular-nums;white-space:nowrap}
.nums span{color:var(--muted);font-size:18px;font-weight:400}
.nums b{color:var(--green)}
.score p{margin:0;font-size:14px}
.small{font-size:12.5px;color:var(--muted)}
.shots{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}
figure{margin:0;display:grid;gap:6px}
figure img{width:100%;height:auto;max-height:420px;object-fit:cover;object-position:top;border:1px solid var(--rule);border-radius:4px}
figcaption{font-size:13px;color:var(--muted)}
footer{border-top:1px solid var(--rule);padding-top:14px;display:grid;gap:4px}
@media (max-width:640px){table,tbody,tr,td{display:block;width:100%}thead{display:none}tr{border-bottom:1px solid var(--rule);padding-block:12px;display:grid;gap:6px}td{border:0;padding:0;min-width:0!important}td.q{font-size:15px}td[data-label]::before{content:attr(data-label);display:block;font:600 11px/1.4 var(--f-body);letter-spacing:.08em;text-transform:uppercase;color:var(--muted)}.shots{grid-template-columns:1fr 1fr}.shots figure:last-child{display:none}.score{grid-template-columns:1fr}}
'''

def page(b):
    rows = ''.join(
        f'<tr class="r-{v}"><td class="q">{e(q)}</td><td class="said" data-label="Google’s AI said">{e(s)}</td><td class="truth" data-label="What you publish">{e(t)}</td><td class="verdict"><span class="chip v-{v}">{VERDICT[v]}</span></td></tr>'
        for q, s, t, v in b['rows'])
    li = lambda xs: '<ul>' + ''.join(f'<li>{e(x)}</li>' for x in xs) + '</ul>'
    shots = ''.join(f'<figure><img src="{img(os.path.join(A, "thumbs", f))}" alt="{e(c)}" loading="lazy"><figcaption>{e(c)}</figcaption></figure>' for f, c in b['shots'])
    before, after, note = b['score']
    return f'''<title>{e(b["title"])}</title>
<meta name="claude:viewport-fit-sides" content="cover">
<meta name="robots" content="noindex">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400&family=IBM+Plex+Sans:wght@400;600&family=Newsreader:ital,opsz,wght@0,6..72,500;0,6..72,600;1,6..72,500&display=swap">
<style>{CSS}</style>
<main class="sheet">
  <header>
    <span class="eyebrow">AI search check · {e(b["where"])}</span>
    <h1>What Google tells your customers about <em>{e(b["name"])}</em></h1>
    <span class="meta">Checked on 26 October 2026 with Google’s AI answers, on a phone in Richmond. Screenshots below.</span>
  </header>
  <section><h2>The good news</h2><p class="good">{e(b["good"])}</p></section>
  <section>
    <h2>What Google says, against what you publish</h2>
    <div class="tablewrap"><table>
      <thead><tr><th>Question</th><th>Google’s AI said</th><th>What you publish</th><th>Verdict</th></tr></thead>
      <tbody>{rows}</tbody>
    </table></div>
  </section>
  <section class="cols">
    <div><h2>Why it happens</h2>{li(b["why"])}</div>
    <div><h2>What the new website fixes</h2>{li(b["fixes"])}</div>
    <div><h2>Your Google profile</h2>{li(b["profile"])}</div>
  </section>
  <section>
    <h2>A side-by-side test</h2>
    <div class="score">
      <div class="nums">{before}<span>/20</span> → <b>{after}</b><span>/20</span></div>
      <p>Fresh AI models answered ten everyday customer questions, once from today’s web and once with the new website in place, and a separate checker scored the answers against your own published facts. {e(note)}</p>
    </div>
    <p class="small">A small, simulated test: it shows AI describing you more accurately, not where you would rank. No one can guarantee a position in Google or ChatGPT.</p>
  </section>
  <section><h2>The evidence</h2><div class="shots">{shots}</div></section>
  <footer>
    <span class="small">Prepared independently by [Your name]; not commissioned by {e(b["name"])}. Facts are taken from your own website and published menus.</span>
  </footer>
</main>
'''

for b in BIZ:
    p = os.path.join(OUT, b['folder'], 'one-pager.html')
    open(p, 'w', encoding='utf-8').write(page(b))
    print(p, os.path.getsize(p))
