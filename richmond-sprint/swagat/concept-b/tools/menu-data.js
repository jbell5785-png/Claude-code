/*
 * Menu content for Concept B, transcribed from research/copy-deck.md.
 * Version A (text on swagatcuisine.uk/menu/) for every dish, with the restaurant's own
 * spellings. Codes are as printed in version A. Chilli counts are the icons printed on A.
 * Dessert and Lassi exist only in version B (online ordering menu) and are labelled so.
 * Fields: n name, meta (portion note as printed), codes, p prices [[label, price]], c chillies, d description
 */
module.exports = [
  {
    id: 'starters', title: 'Starters', index: 'Starters',
    groups: [
      {
        id: 'starters-non-veg', title: 'Non-Vegetarian', veg: false,
        dishes: [
          { n: 'King Prawn Naryali', codes: 'C D', p: [['', '£14.50']], c: 0, d: 'King prawn marinated in coconut & grilled in the tandoor.Perfect combination of prawn & coconut' },
          { n: 'Prawn Puri', codes: 'G C', p: [['', '£8.99']], c: 1, d: 'Deep fried Indian pancake topped with hot, sweet, sour Prawn.' },
          { n: 'Mix Grill Platter', meta: 'per person', codes: 'G C M D', p: [['', '£17.25']], c: 1, d: 'Combination of kebab includes prawn naryali, chick tikka, Seekh kebab, Lamb Chop and fish koliwada.' },
          { n: 'Chicken Tikka', codes: 'D M', p: [['', '£10.15']], c: 1, d: 'Chicken cubes marinated in spices and grilled in tandoor.' },
          { n: 'Prawn Angare', codes: 'C D', p: [['', '£15.25']], c: 1, d: 'King prawn marinated in yoghurt, spices & chilli & grilled in the tandoor.' },
          { n: 'Fish Koliwada', codes: 'G', p: [['', '£9.75']], c: 1, d: 'Tilapia fillet delicacy mixed with gram flour, ginger, cumin seeds, battered & deep fried.' },
          { n: 'Tandoori Lamb Chops', codes: 'D M', p: [['', '£11.99']], c: 1, d: 'Lamb Chops marinated in a blend of ginger, garlic, yoghurt & spices & grilled in the tandoor.' },
          { n: 'Seekh Kebab', codes: '', p: [['', '£10.15']], c: 1, d: 'Finely ground lamb mince delicately spiced & flavoured and grilled in tandoor.' }
        ]
      },
      {
        id: 'starters-veg', title: 'Vegetarian', veg: true,
        dishes: [
          { n: 'Samosa', codes: '', p: [['', '£8.75']], c: 1, d: 'Pastry stuffed with potatoes, spices and sautéed green peas.' },
          { n: 'Aloo Tikki Chaat', codes: '', p: [['', '£8.85']], c: 1, d: 'Spiced potato cake served on a bed of tangy chickpeas with sweet yoghurt and tamarind chutney.' },
          { n: 'Garlic Mushroom', codes: '', p: [['', '£7.95']], c: 0, d: 'Fresh button mushroom mixed with chopped garlic, chilli, and coriander batter & deep fried.' },
          { n: 'Veg Platter', meta: 'per person', codes: 'G D', p: [['', '£10.25']], c: 0, d: 'Small biscuit like puris topped with potatoes, Gram flour straws, sweet yogurt, mix of tamarind & mint chutneys.' },
          { n: 'Paneer Tikka Shashlik', codes: '', p: [['', '£8.99']], c: 1, d: 'Fresh cottage cheese wrapped in yoghurt marinade, Skewered with tomato, Onion, & Capsicum, grilled in the tandoor, Toped with medium spicy shashlik sauce' },
          { n: 'Papadoms & Chutney (Mint & Mango)', codes: '', p: [['', '£3.00']], c: 0, d: '' },
          { n: 'Onion Baji', codes: 'G', p: [['', '£7.85']], c: 0, d: 'Flavoursome onions fritters folded with gram flour & deep fried.' },
          { n: 'Extra Chutneys / Chopped Onions / Pickle', codes: '', p: [['', '£0.70']], c: 0, d: '' }
        ]
      }
    ]
  },
  {
    id: 'mains', title: 'Main Course', index: 'Main course',
    groups: [
      {
        id: 'mains-non-veg', title: 'Non-Vegetarian', note: 'Served In 500 Ml', veg: false,
        dishes: [
          { n: 'King Prawn Bhuna', codes: '', p: [['', '£19.50']], c: 1, d: 'Prawn cooked in a medium thick sauce, made with chopped tomatoes, Onion and spices.' },
          { n: 'Malabar Fish Curry', codes: '', p: [['', '£15.00']], c: 0, d: 'Traditional Kerala speciality cooked with coconut and tempered with mustard & curry leaves.' },
          { n: 'Grilled Sea Bass', codes: '', p: [['', '£16.99']], c: 0, d: 'Fillet of sea bass marinated in ginger & chilli, grilled & Served on bed of cumin flavoured potato & malabar sauce' },
          { n: 'Chicken Dhansak', codes: '', p: [['', '£14.50']], c: 2, d: 'Chicken cooked with a mixture of lentils in hot, sweet & sour Sauce. Originating among the Parsi Zoroastrian Community.' },
          { n: 'Butter Chicken', codes: '', p: [['', '£14.25']], c: 0, d: 'Tandoori morsels of chicken tikka cooked in clarified butter, sun-dried fenugreek, tomato, finished in sweet & creamy sauce.' },
          { n: 'Chicken Korma', codes: '', p: [['', '£14.00']], c: 0, d: 'Succulent morsels of chicken cooked with coconut,& almond, mild creamy sauce.' },
          { n: 'Murgh Chetinaad', codes: '', p: [['', '£14.00']], c: 1, d: 'A south Indian speciality of chicken in medium spicy coconut sauce.' },
          { n: 'Murgh Methiwala', codes: '', p: [['', '£14.00']], c: 1, d: 'Chicken tikka cooked with traditional Indian spices and fenugreek leaves tempered with garlic cumin seeds.' },
          { n: 'Lamb Dhansak', codes: '', p: [['', '£17.99']], c: 2, d: 'Dhansak is originating among the parsi Zoroastrian community. It is a combination of Lamb curry, lentils with a sweet, sour & spicy taste.' },
          { n: 'Murgh Jalfreezie', codes: '', p: [['', '£14.00']], c: 1, d: 'Cubes of chicken tossed with bell pepper, cooked with onion & tomato in a medium spicy sauce.' },
          { n: 'Handi Gosht', tag: 'In House Speciality', codes: '', p: [['', '£17.99']], c: 1, d: 'Diced spring lamb marinated in garlic, chilli, mint then cooked with onion, tomato & spices.' },
          { n: 'Lamb do payaza', codes: '', p: [['', '£17.50']], c: 1, d: 'Diced spring lamb cooked with onion and spices.' },
          { n: 'Lamb Jalfreezie', codes: '', p: [['', '£17.50']], c: 1, d: 'Cubes of spring lamb cooked with onion, bell peppers and spices' },
          { n: 'Lamb Saagwala', codes: '', p: [['', '£17.99']], c: 1, d: 'Diced spring lamb cooked with fresh spinach, tempered with garlic and cumin seeds.' },
          { n: 'Lamb Rogan Josh', codes: '', p: [['', '£17.50']], c: 1, d: 'A rich lamb curry delicately flavoured and cooked in onion sauce.' },
          { n: 'Tandoori Chicken', codes: '', p: [['Half', '£9.99'], ['Full', '£19.99']], c: 1, d: 'Chicken on bone marinated in ginger, garlic, spices & hung yogurt and grilled in tandoor' }
        ]
      },
      {
        id: 'mains-veg', title: 'Vegetarian', veg: true,
        sideNote: 'These dishes can also be ordered as a side. For each dish, there are two prices: the first for a main course size, and the latter for a side dish size.',
        dishes: [
          { n: 'Mix Veg Jalfreezie', codes: 'V', p: [['Main', '£9.50'], ['Side', '£6.50']], c: 1, d: 'Assorted mix vegetables tossed with bell pepper and onions & cooked in a medium spicy sauce.' },
          { n: 'Paneer Tikka Masala', codes: '', p: [['Main', '£9.99'], ['Side', '£6.75']], c: 1, d: 'Soft cottage cheese grilled in tandoor and finished with cream and tangy sauce.' },
          { n: 'Mutter Paneer', codes: '', p: [['Main', '£9.75'], ['Side', '£6.50']], c: 1, d: 'A north Indian speciality made with Peas and Cottage cheese' },
          { n: 'Aloo Gobi', codes: '', p: [['Main', '£9.50'], ['Side', '£6.50']], c: 1, d: 'Cubes of potato and cauliflower cooked in onion tomato sauce.' },
          { n: 'Gobi Masala', codes: '', p: [['Main', '£9.99'], ['Side', '£6.75']], c: 1, d: 'Cauliflower cooked in onion and tomato sauce.' },
          { n: 'Kadai Mushroom', codes: '', p: [['Main', '£9.50'], ['Side', '£6.50']], c: 1, d: 'Mushrooms cooked in a spiced onion and tomato gravy in a kadai' },
          { n: 'Baigan Bharta', codes: '', p: [['Main', '£9.99'], ['Side', '£6.99']], c: 1, d: 'Roasted aubergines sautéed with onion tomato & tempered withfresh garlic and cumin.' },
          { n: 'Saag', codes: '', p: [['Main', '£9.50'], ['Side', '£6.50']], c: 0, d: 'Fresh spinach puree sautéed and tempered with garlic cumin' },
          { n: 'Saag Paneer', codes: '', p: [['Main', '£9.99'], ['Side', '£6.99']], c: 0, d: 'Soft cottage cheese spinach puree sautéed & tempered with Garlic and cumin.' },
          { n: 'Saag Aloo', codes: '', p: [['Main', '£9.75'], ['Side', '£6.75']], c: 0, d: 'Fresh spinach puree & potato sautéed & tempered with garlic and cumin.' },
          { n: 'Chana Masala', codes: '', p: [['Main', '£9.50'], ['Side', '£6.50']], c: 1, d: 'Chickpeas tempered with ginger, green chilli and raw mango powder' },
          { n: 'Bombay Aloo', codes: '', p: [['Main', '£9.50'], ['Side', '£6.50']], c: 0, d: 'Potato cooked with delightfully simple green masala of coriander mint, curry leaves home made spices.' },
          { n: 'Masala Bhindi', codes: '', p: [['Main', '£9.75'], ['Side', '£6.75']], c: 1, d: 'Fresh Okra tempered with cumin & mustard seeds and stir fried' },
          { n: 'Dal Makhani', codes: '', p: [['Main', '£8.99'], ['Side', '£6.25']], c: 0, d: 'Black lentils gently stewed on a slow fire dash of cream & tempered with garlic and cumin' },
          // Version A repeats Masala Bhindi's description here (an evident error); B's description is used and flagged.
          { n: 'Yellow Dal Tadka', codes: '', p: [['Main', '£8.50'], ['Side', '£6.00']], c: 1, d: 'Yellow split lentil cooked with chopped fresh spinach and tempered with cumin, garlic, red chilli with a sweet, sour, spicy flavour.', descFromB: true }
        ]
      }
    ]
  },
  {
    id: 'rice', title: 'Biryanis & Rice', index: 'Biryanis & rice',
    groups: [{
      id: 'rice-all', title: '', veg: null,
      dishes: [
        { n: 'Chicken Biryani', meta: '650 ml', codes: 'D', p: [['', '£16.50']], c: 1, d: 'Cubes of chicken breast cooked in tandoor, blended & flavoured with basmati rice.' },
        { n: 'Lamb Biryani', meta: '650 ml', codes: 'D', p: [['', '£18.50']], c: 1, d: 'Diced of spring lamb cooked in traditional Indian style & flavoured with Basmati rice.' },
        { n: 'Vegetable Biryani', meta: '650 ml', codes: 'V', p: [['', '£13.50']], c: 1, d: 'The colourful combination of fresh vegetable and aromatic basmati rice cooked on dum style.' },
        { n: 'Peas Pulao', meta: '500 ml', codes: 'V', p: [['', '£5.50']], c: 0, d: 'Combination of Fresh Mushroom or peas with Indian baked rice.' },
        { n: 'Pulao rice', meta: '500 ml', codes: 'V', p: [['', '£4.75']], c: 0, d: 'Indian baked rice flavoured with whole spices & sautéed onions' },
        { n: 'Mushroom Pulao', meta: '500 ml', codes: 'V', p: [['', '£5.50']], c: 0, d: 'Combination of Fresh Mushroom with Indian baked rice.' },
        { n: 'Egg Fried Rice', meta: '500 ml', codes: 'S', p: [['', '£7.25']], c: 0, d: 'Basmati rice mixed with stir-fried egg, peas and finished with dash of soya sauce.' },
        { n: 'Jeera Rice', meta: '500 ml', codes: 'V', p: [['', '£4.75']], c: 0, d: 'Indian Basmati rice tempered with cumin seeds' },
        { n: 'Steam rice', meta: '500 ml', codes: 'V', p: [['', '£4.25']], c: 0, d: '' },
        { n: 'Lemon Rice', meta: '500 ml', codes: 'S', p: [['', '£5.50']], c: 0, d: 'Basmati rice tempered with turmeric, curry leaves, mustard & tossed with lemon juice' }
      ]
    }]
  },
  {
    id: 'breads', title: 'Breads', index: 'Breads',
    groups: [{
      id: 'breads-all', title: '', veg: null,
      dishes: [
        { n: 'Tandoori Naan', codes: 'G D', p: [['', '£3.75']], c: 0, d: 'White flour bread' },
        { n: 'Garlic Naan', codes: 'G D', p: [['', '£4.00']], c: 0, d: 'Bread topped with garlic' },
        { n: 'Stuffed Paratha', codes: 'G', p: [['', '£4.75']], c: 1, d: 'Bread stuffed with Vegetable & mashed Potatoes.' },
        { n: 'Chilly cheese Naan', codes: 'G D', p: [['', '£4.65']], c: 2, d: 'Combination of cheese & chilly stuffed in dough and baked in tandoor.' },
        { n: 'Peshwari Naan', codes: 'G D N', p: [['', '£4.50']], c: 0, d: 'Bread stuffed with shredded coconut and almond.' },
        { n: 'Tandoori Roti', codes: 'G V', p: [['', '£3.25']], c: 0, d: 'Whole wheat bread' },
        { n: 'Plain Paratha', codes: 'G', p: [['', '£4.20']], c: 0, d: 'Layered bread made with whole wheat flour' },
        { n: 'Kheema Naan', codes: 'G D', p: [['', '£4.85']], c: 0, d: 'Bread stuffed with mincemeat & baked in tandoor' }
      ]
    }]
  },
  {
    id: 'raita', title: 'Raita & Salad', index: 'Raita & salad',
    groups: [{
      id: 'raita-all', title: '', veg: null,
      dishes: [
        { n: 'Cucumber Raita', codes: 'D', p: [['', '£2.50']], c: 0, d: '' },
        { n: 'Vegetable Seasonal Salad', codes: '', p: [['', '£4.25']], c: 0, d: 'Lettuce, Sliced Cucumber, Carrot, Tomato, Onion, Lemon & chilli' }
      ]
    }]
  },
  {
    id: 'dessert', title: 'Dessert', index: 'Dessert', fromB: true,
    groups: [{
      id: 'dessert-all', title: '', veg: null,
      dishes: [
        { n: 'Gulab Jamun', codes: 'D G', p: [['', '£4.50']], c: null, d: 'Sugar syrup dough balls' },
        { n: 'Gajar ka halwa', codes: 'D', p: [['', '£4.50']], c: null, d: 'Homemade sweet carrot pudding' }
      ]
    }]
  },
  {
    id: 'lassi', title: 'Lassi', index: 'Lassi', fromB: true,
    groups: [{
      id: 'lassi-all', title: '', veg: null,
      dishes: [
        { n: 'Mango Lassi', codes: 'D', p: [['', '£4.25']], c: null, d: 'A refreshing blend of mangoes, creamy yogurt, and a touch of sweetness, served chilled.' },
        { n: 'Sweet Lassi', codes: 'D', p: [['', '£4.00']], c: null, d: 'A refreshing blend of creamy yogurt, and a touch of sweetness, served chilled.' }
      ]
    }]
  }
];
