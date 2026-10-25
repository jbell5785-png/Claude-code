# Round 2 build spec: personalised, award-level

Round 1 was well built but generic. The client's verdict: nothing on the sites "screamed that restaurant" apart from the name. Round 2 is judged on personalisation first and craft second. Everything in `/home/user/Claude-code/richmond-sprint/_shared/tech-spec.md` still applies (stack, accessibility, honesty, booking hand-off, "to confirm" markers, no photos, prohibitions). This file adds to it and overrides it where they conflict.

## The swap test (pass or fail)
Imagine replacing the business name with another restaurant of the same cuisine. **If the concept would still work, it fails.** Every concept must be built on one or more *only-here* details from `research/identity.md`: the real building, room, object, history, ritual or place. The reference standard is the Caffè Mamma concept that turned the restaurant's real washing line of shirts into its navigation.
- The **signature moment** must come directly from a verified only-here detail. Name the detail and its source in NOTES.md.
- At least **three more** only-here details must appear elsewhere in the concept as design, not just as copy: illustration, layout logic, texture, motion, or how the menu is presented.
- Cuisine clichés don't count as personalisation. A generic noren, a generic Union Jack or a generic rolling pin is not the place.

## Craft bar (Awwwards Site of the Day level)
- **Bespoke illustration of the actual place.** Draw original SVG artwork of the real building, room or object (the bridge arch, the shopfront, the slat wall, the tart), studying the reference photos for proportion, colour and character, then drawing your own. Never trace or embed their photos. It should look made for this client by a skilled illustrator: considered line weight, a limited palette, real detail.
- **Type with intent:** a display face and treatment that echo something real, such as the business's signage, lettering, menus or era. Set a fluid type scale with real hierarchy, use optical sizes and features (old-style figures, ligatures, small caps) where they help, and keep the measure about 65ch.
- **Motion with meaning:** one orchestrated signature moment plus considered micro-interactions (hover, focus, press, reveal) in the same motion language. GSAP 3.12.5 and ScrollTrigger are allowed from cdnjs.
  - Page-to-page transitions are welcome if they degrade gracefully.
  - No scroll-jacking. Never block reading or tapping.
  - Reduced motion gets a designed static equivalent.
- **Composition:** a layout logic you can name, generous negative space, and deliberate asymmetry or alignment. Nothing should look like a template section stack.
- **Copy in the business's own voice**, built from the copy deck. Short, specific and warm. Use their own phrases where they're good.
- **Mobile is the main stage.** The first screen at 390px must feel as designed as the desktop hero, with the primary actions on it.

## Content rules (stricter)
- Use only `research/copy-deck.md` and `research/identity.md`. Label anything marked LEGEND as legend on the page ("Legend has it…"), never as fact.
- If no current menu is published, build the menu page as a clearly labelled **sample layout**, with a visible banner on the page saying it isn't the current menu, using only items verifiably published (or clearly generic placeholders labelled as such).
- Historic names the business itself publishes (for example, founders in its own history) may be used. Don't use current staff names.

## Distinctness
- Within a business, the three concepts must differ in idea, type, colour, layout logic, signature and motion language.
- Across the whole portfolio, never reuse fonts, palettes or signatures from Caffè Mamma (Young Serif, Instrument Sans, Italiana, Hanken Grotesk, Bricolage Grotesque, Atkinson Hyperlegible; pen-circle filter, day-to-night scroll lighting, washing-line physics). The same goes for Richmond round 1 (Gilda Display, Jost, Bodoni Moda, Karla, Archivo, Literata, Shippori Mincho, Zen Kaku Gothic New, Gowun Batang, Work Sans, Zen Maru Gothic, Lexend, Rozha One, Mukta, Tiro Devanagari Hindi, Hind, Big Shoulders Display, Public Sans).
- Each brief lists its allowed fonts.

## Self-review before reporting
Screenshot both pages at 390, 768 and 1440 (top, middle and bottom, plus the signature mid-animation and at rest), then judge against three questions:
1. Does it pass the swap test?
2. Would an Awwwards jury call it crafted?
3. Is the first phone screen beautiful and useful?

Fix the weakest thing and re-check. Do two focused passes. Report honestly what still falls short.

## Folder, ports and git
- Build into `richmond-sprint-v2/<business>/concept-<x>/`, using the files listed in the round 1 spec plus NOTES.md.
- Use the port given in your brief.
- Screenshots go to `/tmp/claude-0/-home-user-Claude-code/e50707d5-9ec5-571e-9915-9e7145ebe50f/scratchpad/v2/build-<business>-<x>/`.
- Do not commit.
