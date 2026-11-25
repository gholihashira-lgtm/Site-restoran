(function (global) {
  'use strict';

  const L = global.SupermarketEngine;
  if (!L) {
    console.error('[SupermarketView] SupermarketEngine not found. Load loghme-master-engine.js first.');
    return;
  }

  const state = {
    mounted: false,
    screen: 'home',
    activeVendorId: null,
    activeCategory: 'all',
    searchQuery: '',
    sortBy: 'relevance',
    cartOpen: false,
    checkoutOpen: false,
    trackingOpen: false,
    checkoutDraft: null,
    activeCourier: null,
    unsubCart: null,
    unsubOrders: null,
    searchDebounceTimer: null,
    lastScrollY: 0
  };

  const t  = (n) => L.toPersianDigits(n);
  const fp = (n) => L.formatPrice(n);
  const esc = (s) => L.escapeHtml(s);
  const $  = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

  const FALLBACK_IMG = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&h=500&q=80&auto=format&fit=crop';

  function cartQty(productId) {
    return L.cart.getItemQuantity(productId);
  }

  function currentVendor() {
    return state.activeVendorId ? L.vendorById(state.activeVendorId) : null;
  }

  function open3DView(productId) {
    if (typeof window.openSupermarket3D === 'function') {
      window.openSupermarket3D(productId);
      return;
    }
    console.warn('[SupermarketView] openSupermarket3D not available.');
  }
  global.openSupermarket3D = global.openSupermarket3D || open3DView;

  const CATS = [
    { id: 'all',        label: 'همه',       icon: 'layout-grid', color: '#FF00A6' },
    { id: 'fruits',     label: 'میوه',      icon: 'apple',       color: '#DC2626' },
    { id: 'vegetables', label: 'سبزیجات',   icon: 'carrot',      color: '#16A34A' },
    { id: 'dairy',      label: 'لبنیات',    icon: 'milk',        color: '#0EA5E9' },
    { id: 'meat',       label: 'گوشت',      icon: 'beef',        color: '#991B1B' },
    { id: 'bread',      label: 'نان',       icon: 'croissant',   color: '#B45309' },
    { id: 'canned',     label: 'کنسرو',     icon: 'package',     color: '#7C3AED' },
    { id: 'frozen',     label: 'منجمد',     icon: 'snowflake',   color: '#0891B2' },
    { id: 'snacks',     label: 'تنقلات',    icon: 'cookie',      color: '#EA580C' },
    { id: 'drinks',     label: 'نوشیدنی',   icon: 'cup-soda',    color: '#2563EB' },
    { id: 'household',  label: 'خانه',      icon: 'home',        color: '#64748B' },
    { id: 'personal',   label: 'بهداشتی',   icon: 'sparkles',    color: '#DB2777' },
    { id: 'baby',       label: 'نوزاد',     icon: 'baby',        color: '#8B5CF6' },
    { id: 'pet',        label: 'حیوانات',   icon: 'cat',         color: '#F59E0B' },
    { id: 'spices',     label: 'ادویه',     icon: 'flame',       color: '#DC2626' },
    { id: 'dry',        label: 'خشکبار',    icon: 'wheat',       color: '#92400E' }
  ];

  function catMeta(id) {
    return CATS.find(c => c.id === id) || CATS[0];
  }

  const PHOTO_POOL = {
    fruits: [
      'photo-1560806887-1e4cd0b6cbd6',
      'photo-1571771894821-ce9b6c11b08e',
      'photo-1547514701-42782101795e',
      'photo-1610832958506-aa56368176cf',
      'photo-1573246123716-6b1782bfc499',
      'photo-1587049352846-4a222e784d38',
      'photo-1550258987-190a2d41a8ba',
      'photo-1528821128474-27f963b062bf',
      'photo-1610348725531-843dff563e2c',
      'photo-1519996529931-28324d5a630e',
      'photo-1591073113125-e46713c829ed',
      'photo-1464972377684-3b3b59ca5549'
    ],
    vegetables: [
      'photo-1518977676601-b53f82aba655',
      'photo-1584270354949-c26b0d5b4a0c',
      'photo-1598170845058-32b9d6a5da37',
      'photo-1563565375-f3fdfdbefa83',
      'photo-1592924357228-91a4daadcfea',
      'photo-1518577915332-c2a19f149a75',
      'photo-1566385101042-1a0aa0c1268c',
      'photo-1595855759920-86582396756a',
      'photo-1551754655-cd27e38d2076',
      'photo-1590779033100-9f60a05a013d',
      'photo-1519162808019-7de1683fa2ad',
      'photo-1518977956812-cd3dbadaaf31'
    ],
    dairy: [
      'photo-1550583724-b2692b85b150',
      'photo-1488900128323-21503983a07e',
      'photo-1488477181946-6428a0291777',
      'photo-1628088062854-d1870b4553da',
      'photo-1589985270958-b8b76f7146c4',
      'photo-1563636619-e9143da7973b',
      'photo-1560508180-03f285f67ded',
      'photo-1517445312882-bc9910d016b7'
    ],
    meat: [
      'photo-1607623814075-e51df1bdc82f',
      'photo-1604503468506-a8da13d82791',
      'photo-1588347818036-558601350947',
      'photo-1529692236671-f1f6cf9683ba',
      'photo-1580476262798-bddd9f4b7369',
      'photo-1615937657715-bc7b4b7962c1',
      'photo-1600891964092-4316c288032e'
    ],
    bread: [
      'photo-1509440159596-0249088772ff',
      'photo-1568254183919-78a4f43a2877',
      'photo-1555507036-ab1f40ce88cb',
      'photo-1549931319-a545dcf3bc73',
      'photo-1585478259715-876acc5be8eb',
      'photo-1608198093002-ad4e005484ec'
    ],
    canned: [
      'photo-1584568694244-14fbdf83bd30',
      'photo-1607083206329-1a8f8bd7f0a2',
      'photo-1584009213573-b9a2fe34a1b8',
      'photo-1590779033100-9f60a05a013d',
      'photo-1615485500803-4c1e2cf3b8d0'
    ],
    frozen: [
      'photo-1563805042-7684c019e1cb',
      'photo-1560008581-09826d1de69e',
      'photo-1587314168485-3236d6710814',
      'photo-1585109649139-366815a0d713',
      'photo-1626200419199-391ae4be7a41'
    ],
    snacks: [
      'photo-1566478989037-eec170784d0b',
      'photo-1621939514649-280e2ee25f60',
      'photo-1599490659213-e2b9527bd087',
      'photo-1511381939415-e44015466834',
      'photo-1548848221-0c2e497ed557',
      'photo-1560472354-b33ff0c44a43',
      'photo-1571506165871-ee72a35bc9d4'
    ],
    drinks: [
      'photo-1554866585-cd94860890b7',
      'photo-1622483767028-3f66f32aef97',
      'photo-1600271886742-f049cd451bba',
      'photo-1556881286-fc6915169721',
      'photo-1461023058943-07fcbe16d735',
      'photo-1544787219-7f47ccb76574',
      'photo-1581006852262-e4307cf6283a',
      'photo-1581636625402-29b2a704ef13',
      'photo-1587223962930-cb7f31384c19',
      'photo-1613478223719-2ab802602423'
    ],
    household: [
      'photo-1585421514738-01798e348b17',
      'photo-1556909114-f6e7ad7d3136',
      'photo-1581578731548-c64695cc6952',
      'photo-1584622781564-1d987f7333c1',
      'photo-1610557892470-55d9e80c0bce',
      'photo-1558618666-fcd25c85cd64'
    ],
    personal: [
      'photo-1556228720-195a672e8a03',
      'photo-1587854692152-cbe660dbde88',
      'photo-1607619056574-7b8d3ee536b2',
      'photo-1631729371254-42c2892f0e6e',
      'photo-1571781926291-c477ebfd024b'
    ],
    baby: [
      'photo-1519689680058-324335c77eba',
      'photo-1515488042361-ee00e0ddd4e4',
      'photo-1544126592-807ade215a0b',
      'photo-1522771930-78848d9293e8',
      'photo-1596461404969-9ae70f2830c1'
    ],
    pet: [
      'photo-1548199973-03cce0bbc87b',
      'photo-1450778869180-41d0601e046e',
      'photo-1583337130417-3346a1be7dee',
      'photo-1587300003388-59208cc962cb',
      'photo-1592194996308-7b43878e84a6'
    ],
    spices: [
      'photo-1596040033229-a9821ebd058d',
      'photo-1532336414038-cf19250c5757',
      'photo-1506368249639-73a05d6f6488',
      'photo-1599909533143-41a0c4c07f3a',
      'photo-1615485291234-0c4a2e5da3d1'
    ],
    dry: [
      'photo-1508747703725-719777637510',
      'photo-1599599810769-bcde5a160d32',
      'photo-1573855619003-97b4799dcd8b',
      'photo-1599009440505-c1f0d3e0c8e9',
      'photo-1615486364234-9f09e2b8f9a4'
    ]
  };

  const SUBTYPE_PHOTO = {
    /* FRUITS */
    apple: 'photo-1560806887-1e4cd0b6cbd6',
    banana: 'photo-1571771894821-ce9b6c11b08e',
    orange: 'photo-1547514701-42782101795e',
    lemon: 'photo-1590502593747-42a996133562',
    tomato: 'photo-1563565375-f3fdfdbefa83',
    cucumber: 'photo-1622206151226-18ca2c9ab4a1',
    grape: 'photo-1596363505729-4190a9506133',
    mango: 'photo-1553279768-865429fa0078',
    pomegranate: 'photo-1541344999736-83eca272f6fc',
    berry: 'photo-1610832958506-aa56368176cf',
    pineapple: 'photo-1550258987-190a2d41a8ba',
    kiwi: 'photo-1585059895524-72359e06133a',
    peach: 'photo-1629828874514-1c3e5e8dbdd6',
    plum: 'photo-1601039641847-7857b994d704',
    apricot: 'photo-1595124245030-41448b199d6d',
    fig: 'photo-1601379760883-1b1c3a8e2c8b',
    date: 'photo-1591073113125-e46713c829ed',
    cherry: 'photo-1528821154947-1aa3d1b74941',
    melon: 'photo-1587049352846-4a222e784d38',
    watermelon: 'photo-1587049352846-4a222e784d38',

    /* VEGETABLES */
    lettuce: 'photo-1592924357228-91a4daadcfea',
    spinach: 'photo-1576045057995-568f588f82fb',
    carrot: 'photo-1598170845058-32b9d6a5da37',
    broccoli: 'photo-1584270354949-c26b0d5b4a0c',
    cauliflower: 'photo-1568584711075-3d021a7c3ca3',
    onion: 'photo-1518577915332-c2a19f149a75',
    potato: 'photo-1518977956812-cd3dbadaaf31',
    mushroom: 'photo-1595855759920-86582396756a',
    pepper: 'photo-1566385101042-1a0aa0c1268c',
    pepperRed: 'photo-1566385101042-1a0aa0c1268c',
    pepperGreen: 'photo-1563565375-f3fdfdbefa83',
    pepperYellow: 'photo-1618512496248-a07fe83aa8cb',
    eggplant: 'photo-1615484477778-ca3b77940c25',
    zucchini: 'photo-1563252722-6434563a985d',
    pumpkin: 'photo-1506916466643-1c8a4d66ed43',
    corn: 'photo-1551754655-cd27e38d2076',
    beet: 'photo-1593105544559-ecb03bf76f82',
    pea: 'photo-1592394533824-9440e5d68530',
    bean: 'photo-1567375698348-5d9d5ae99de0',
    herb: 'photo-1466637574441-749b8f19452f',

    /* DAIRY */
    milk: 'photo-1550583724-b2692b85b150',
    cheese: 'photo-1488900128323-21503983a07e',
    yogurt: 'photo-1488477181946-6428a0291777',
    butter: 'photo-1589985270958-b8b76f7146c4',
    cream: 'photo-1563636619-e9143da7973b',
    doogh: 'photo-1556881286-fc6915169721',
    icecream: 'photo-1563805042-7684c019e1cb',
    egg: 'photo-1582722872445-44dc5f7e3c8f',
    kashk: 'photo-1560508180-03f285f67ded',

    /* MEAT */
    chicken: 'photo-1604503468506-a8da13d82791',
    beef: 'photo-1607623814075-e51df1bdc82f',
    lamb: 'photo-1588347818036-558601350947',
    fish: 'photo-1519708227418-c8fd9a32b7a2',
    shrimp: 'photo-1565680018434-b513d5e5fd47',
    sausage: 'photo-1590165482129-1b8b27698780',
    turkey: 'photo-1604503468506-a8da13d82791',

    /* BREAD */
    sangak: 'photo-1568254183919-78a4f43a2877',
    barbari: 'photo-1509440159596-0249088772ff',
    lavash: 'photo-1549931319-a545dcf3bc73',
    taftoon: 'photo-1509440159596-0249088772ff',
    toast: 'photo-1509440159596-0249088772ff',
    baguette: 'photo-1509440159596-0249088772ff',
    croissant: 'photo-1555507036-ab1f40ce88cb',
    pita: 'photo-1598103442097-8b74394b95c6',
    focaccia: 'photo-1595854341625-f33ee10dbf94',
    'sweet-bread': 'photo-1587241321921-91a834d6d191',
    sandwich: 'photo-1509440159596-0249088772ff',
    roll: 'photo-1555507036-ab1f40ce88cb',
    brioche: 'photo-1595854341625-f33ee10dbf94',
    'pizza-dough': 'photo-1595854341625-f33ee10dbf94',
    'burger-bun': 'photo-1550317138-10000687a72b',
    'hotdog-bun': 'photo-1612392062631-94dd858cba88',
    barley: 'photo-1509440159596-0249088772ff',
    rye: 'photo-1585478259715-876acc5be8eb',
    chapati: 'photo-1598103442097-8b74394b95c6',

    /* CANNED */
    tuna: 'photo-1584568694244-14fbdf83bd30',
    sardine: 'photo-1584009213573-b9a2fe34a1b8',
    beans: 'photo-1584568694244-14fbdf83bd30',
    peas: 'photo-1592394533824-9440e5d68530',
    paste: 'photo-1607083206329-1a8f8bd7f0a2',
    jam: 'photo-1587049352846-4a222e784d38',
    honey: 'photo-1587049352846-4a222e784d38',
    'peanut-butter': 'photo-1590080875515-8a3a8dc5735e',
    halva: 'photo-1519915028121-7d3463d20b13',
    compote: 'photo-1600271886742-f049cd451bba',
    olive: 'photo-1590080875515-8a3a8dc5735e',
    pickle: 'photo-1584009213573-b9a2fe34a1b8',

    /* FROZEN */
    'frozen-pizza': 'photo-1604382354936-07c5d9983bd3',
    fries: 'photo-1585109649139-366815a0d713',
    nugget: 'photo-1562967914-608f82629710',
    croquette: 'photo-1562967914-608f82629710',
    'frozen-veg': 'photo-1519996529931-28324d5a630e',
    'frozen-fruit': 'photo-1610832958506-aa56368176cf',
    pastry: 'photo-1555507036-ab1f40ce88cb',
    'frozen-meal': 'photo-1600891964092-4316c288032e',

    /* SNACKS */
    chips: 'photo-1566478989037-eec170784d0b',
    puff: 'photo-1621939514649-280e2ee25f60',
    snack: 'photo-1621939514649-280e2ee25f60',
    biscuit: 'photo-1548848221-0c2e497ed557',
    cracker: 'photo-1548848221-0c2e497ed557',
    chocolate: 'photo-1511381939415-e44015466834',
    'chocolate-spread': 'photo-1511381939415-e44015466834',
    gum: 'photo-1582058091505-f87a2e55a40f',
    gummy: 'photo-1582058091505-f87a2e55a40f',
    candy: 'photo-1582058091505-f87a2e55a40f',
    popcorn: 'photo-1571506165871-ee72a35bc9d4',
    nuts: 'photo-1508747703725-719777637510',

    /* DRINKS */
    soda: 'photo-1554866585-cd94860890b7',
    malt: 'photo-1581636625402-29b2a704ef13',
    water: 'photo-1556881286-fc6915169721',
    juice: 'photo-1600271886742-f049cd451bba',
    lemonade: 'photo-1621263764928-df1444c5e859',
    sharbat: 'photo-1544145945-f90425340c7e',
    tea: 'photo-1544787219-7f47ccb76574',
    coffee: 'photo-1461023058943-07fcbe16d735',

    /* HOUSEHOLD */
    dishwasher: 'photo-1585421514738-01798e348b17',
    laundry: 'photo-1610557892470-55d9e80c0bce',
    bleach: 'photo-1585421514738-01798e348b17',
    cleaner: 'photo-1585421514738-01798e348b17',
    tissue: 'photo-1584556812952-905ffd0c611a',
    'garbage-bag': 'photo-1610557892470-55d9e80c0bce',
    foil: 'photo-1584556812952-905ffd0c611a',
    'freezer-bag': 'photo-1610557892470-55d9e80c0bce',
    match: 'photo-1519003300449-424ad0405076',
    lighter: 'photo-1519003300449-424ad0405076',
    glove: 'photo-1583947215259-38e31be8751f',
    sponge: 'photo-1585421514738-01798e348b17',
    brush: 'photo-1585421514738-01798e348b17',
    broom: 'photo-1581578731548-c64695cc6952',
    mop: 'photo-1581578731548-c64695cc6952',
    bin: 'photo-1610557892470-55d9e80c0bce',
    'air-freshener': 'photo-1585421514738-01798e348b17',

    /* PERSONAL */
    shampoo: 'photo-1556228720-195a672e8a03',
    'shampoo-baby': 'photo-1556228720-195a672e8a03',
    conditioner: 'photo-1556228720-195a672e8a03',
    soap: 'photo-1607006483225-9c0c0f5b0b95',
    toothpaste: 'photo-1607619056574-7b8d3ee536b2',
    toothbrush: 'photo-1607619056574-7b8d3ee536b2',
    mouthwash: 'photo-1607619056574-7b8d3ee536b2',
    razor: 'photo-1587854692152-cbe660dbde88',
    'shaving-cream': 'photo-1587854692152-cbe660dbde88',
    aftershave: 'photo-1587854692152-cbe660dbde88',
    deodorant: 'photo-1631729371254-42c2892f0e6e',
    'face-cream': 'photo-1571781926291-c477ebfd024b',
    sunscreen: 'photo-1571781926291-c477ebfd024b',
    'hand-cream': 'photo-1571781926291-c477ebfd024b',
    'cotton-pad': 'photo-1587854692152-cbe660dbde88',
    'cotton-bud': 'photo-1587854692152-cbe660dbde88',
    'wet-wipes': 'photo-1587854692152-cbe660dbde88',
    'sanitary-pad': 'photo-1587854692152-cbe660dbde88',
    cotton: 'photo-1587854692152-cbe660dbde88',
    perfume: 'photo-1541643600914-78b084683601',

    /* BABY */
    diaper: 'photo-1519689680058-324335c77eba',
    formula: 'photo-1515488042361-ee00e0ddd4e4',
    'baby-food': 'photo-1522771930-78848d9293e8',
    'baby-wipes': 'photo-1519689680058-324335c77eba',
    'baby-shampoo': 'photo-1556228720-195a672e8a03',
    'baby-oil': 'photo-1515488042361-ee00e0ddd4e4',
    'baby-cream': 'photo-1515488042361-ee00e0ddd4e4',
    'baby-bottle': 'photo-1596461404969-9ae70f2830c1',
    nipple: 'photo-1596461404969-9ae70f2830c1',
    pacifier: 'photo-1544126592-807ade215a0b',
    'baby-glove': 'photo-1544126592-807ade215a0b',
    'baby-hat': 'photo-1544126592-807ade215a0b',
    'baby-underwear': 'photo-1544126592-807ade215a0b',
    'baby-pad': 'photo-1544126592-807ade215a0b',
    'baby-powder': 'photo-1515488042361-ee00e0ddd4e4',
    'baby-soap': 'photo-1607006483225-9c0c0f5b0b95',
    'baby-toy': 'photo-1596461404969-9ae70f2830c1',
    'baby-book': 'photo-1512820790803-83ca734da794',

    /* PET */
    'cat-food': 'photo-1548199973-03cce0bbc87b',
    'dog-food': 'photo-1450778869180-41d0601e046e',
    'pet-treat': 'photo-1583337130417-3346a1be7dee',
    'pet-shampoo': 'photo-1583337130417-3346a1be7dee',
    'cat-litter': 'photo-1592194996308-7b43878e84a6',
    'cat-litter-box': 'photo-1592194996308-7b43878e84a6',
    'pet-collar': 'photo-1601758228041-f3b2795255f1',
    'pet-toy': 'photo-1583337130417-3346a1be7dee',
    'pet-brush': 'photo-1583337130417-3346a1be7dee',
    'pet-bowl': 'photo-1548199973-03cce0bbc87b',
    'pet-carrier': 'photo-1592194996308-7b43878e84a6',
    'pet-pad': 'photo-1592194996308-7b43878e84a6',
    'pet-supplement': 'photo-1583337130417-3346a1be7dee',
    'pet-freshener': 'photo-1583337130417-3346a1be7dee',
    'pet-grooming': 'photo-1583337130417-3346a1be7dee',

    /* SPICES */
    saffron: 'photo-1596040033229-a9821ebd058d',
    turmeric: 'photo-1615485291234-0c4a2e5da3d1',
    pepper: 'photo-1506368249639-73a05d6f6488',
    cinnamon: 'photo-1599909533143-41a0c4c07f3a',
    ginger: 'photo-1615485500803-4c1e2cf3b8d0',
    cardamom: 'photo-1599909533143-41a0c4c07f3a',
    cumin: 'photo-1599909533143-41a0c4c07f3a',
    fennel: 'photo-1599909533143-41a0c4c07f3a',
    sumac: 'photo-1596040033229-a9821ebd058d',
    mixed: 'photo-1532336414038-cf19250c5757',
    salt: 'photo-1518110925495-b37e936f2a5c',

    /* DRY */
    pistachio: 'photo-1508747703725-719777637510',
    almond: 'photo-1508747703725-719777637510',
    cashew: 'photo-1567892737950-30c4db37cd89',
    walnut: 'photo-1599599810769-bcde5a160d32',
    hazelnut: 'photo-1573855619003-97b4799dcd8b',
    seed: 'photo-1599009440505-c1f0d3e0c8e9',
    chickpea: 'photo-1615486364234-9f09e2b8f9a4',
    raisin: 'photo-1599599810769-bcde5a160d32',
    mulberry: 'photo-1599599810769-bcde5a160d32',
    'dried-fruit': 'photo-1599009440505-c1f0d3e0c8e9',
    'dried-dairy': 'photo-1560508180-03f285f67ded'
  };

  function svHash(s) {
    let h = 2166136261 >>> 0;
    const str = String(s);
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  function buildPhotoUrl(id) {
    return 'https://images.unsplash.com/' + id + '?w=500&h=500&q=82&auto=format&fit=crop';
  }

  function pickSupermarketPhoto(p) {
    if (p.subtype && SUBTYPE_PHOTO[p.subtype]) {
      return buildPhotoUrl(SUBTYPE_PHOTO[p.subtype]);
    }
    const pool = PHOTO_POOL[p.categoryId] || PHOTO_POOL.fruits;
    const idx = svHash(String(p.id) + ':' + (p.title || '') + ':' + (p.subtype || '')) % pool.length;
    return buildPhotoUrl(pool[idx]);
  }

  function ensureIllustrations() {
    let replaced = 0;
    for (const p of L.PRODUCTS) {
      p.image = pickSupermarketPhoto(p);
      replaced++;
    }
    console.log('[SupermarketView] Set real photos for ' + replaced + ' products');
    if (L.Store.user.get('walletBalance') === 0) {
      L.Store.user.incrementWallet(2500000);
    }
  }

  function imgTag(p, extraClass) {
    const cls = extraClass || 'w-full h-full object-cover';
    const alt = esc(p.title || '');
    return '<img src="' + esc(p.image) + '" alt="' + alt + '" class="' + cls + '" loading="lazy" onerror="this.onerror=null;this.src=\'' + FALLBACK_IMG + '\';" draggable="false">';
  }

  function injectStyles() {
    if (document.getElementById('sv-styles')) return;
    const style = document.createElement('style');
    style.id = 'sv-styles';
    style.textContent = `
      #supermarket-view { scroll-behavior: smooth; }
      #supermarket-view .no-scrollbar::-webkit-scrollbar { display: none; }
      #supermarket-view .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      #supermarket-view .sv-fade { animation: svFade 0.25s ease both; }
      @keyframes svFade { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
      #supermarket-view .sv-pulse { animation: svPulse 1.6s ease-in-out infinite; }
      @keyframes svPulse { 0%,100% { opacity: 1; } 50% { opacity: 0.55; } }
      #supermarket-view .sv-progress-fill { transition: width 0.35s ease; }
      #supermarket-view .sv-cart-badge { transition: transform 0.2s ease; }
      #supermarket-view .sv-cart-badge.sv-bump { transform: scale(1.35); }
      .sv-track-stages { background: linear-gradient(90deg, #FF00A6, #7C3AED); }
      .sv-3d-btn {
        position: absolute; bottom: 6px; left: 6px; z-index: 5;
        width: 28px; height: 28px; border-radius: 10px;
        background: rgba(15, 15, 20, 0.72);
        backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
        border: 1px solid rgba(255,255,255,0.22);
        color: #fff; display: inline-flex; align-items: center; justify-content: center;
        cursor: pointer; padding: 0;
        transition: transform 0.15s ease, background 0.15s ease;
      }
      .sv-3d-btn:hover { background: rgba(255, 0, 166, 0.85); }
      .sv-3d-btn:active { transform: scale(0.9); }
      .sv-3d-btn svg { width: 14px; height: 14px; pointer-events: none; }
      .sv-3d-btn.sv-3d-btn--sm { width: 24px; height: 24px; border-radius: 8px; bottom: 4px; left: 4px; }
      .sv-3d-btn.sv-3d-btn--sm svg { width: 12px; height: 12px; }
    `;
    document.head.appendChild(style);
  }

  function openSupermarketView() {
    if (state.mounted) {
      const root = document.getElementById('supermarket-view');
      if (root) root.scrollTop = 0;
      return;
    }

    injectStyles();
    ensureIllustrations();

    state.mounted = true;
    state.lastScrollY = window.scrollY || 0;

    const view = document.createElement('div');
    view.id = 'supermarket-view';
    view.className = 'fixed inset-0 z-[60] bg-gray-50 overflow-y-auto font-vazir text-gray-800';
    view.style.opacity = '0';
    view.style.transition = 'opacity 0.25s ease';
    view.innerHTML = renderShell();
    document.body.appendChild(view);
    document.body.style.overflow = 'hidden';

    bindShellEvents(view);
    renderScreen();
    syncCartUI();

    if (window.lucide) lucide.createIcons();

    requestAnimationFrame(() => { view.style.opacity = '1'; });

    state.unsubCart = L.cart.on(() => {
      syncCartUI();
      renderScreen();
    });

    state.unsubOrders = L.Store.orders.on('created', (order) => {
      if (state.checkoutOpen) return;
      setTimeout(() => startTracking(order), 350);
    });
  }

  function closeSupermarketView() {
    const view = document.getElementById('supermarket-view');
    if (!view) return;

    stopTracking();

    if (state.unsubCart) { state.unsubCart(); state.unsubCart = null; }
    if (state.unsubOrders) { state.unsubOrders(); state.unsubOrders = null; }

    view.style.opacity = '0';
    setTimeout(() => {
      view.remove();
      document.body.style.overflow = '';
      window.scrollTo(0, state.lastScrollY);
      state.mounted = false;
      state.screen = 'home';
      state.activeVendorId = null;
      state.activeCategory = 'all';
      state.searchQuery = '';
    }, 240);
  }

  function renderShell() {
    return `
      <div class="max-w-md mx-auto bg-gray-50 min-h-screen relative pb-28">
        <header class="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100">
          <div class="flex items-center gap-2 px-4 pt-3 pb-2">
            <button id="sv-back" class="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 hover:bg-gray-200 active:scale-95 transition-all shrink-0">
              <i data-lucide="arrow-right" class="w-4 h-4"></i>
            </button>
            <div id="sv-header-title" class="flex-1 min-w-0"></div>
            <button id="sv-cart-btn" class="relative w-9 h-9 rounded-full bg-snapp-light flex items-center justify-center text-snapp hover:bg-pink-100 active:scale-95 transition-all shrink-0">
              <i data-lucide="shopping-bag" class="w-4 h-4"></i>
              <span id="sv-cart-badge" class="hidden absolute -top-1.5 -right-1.5 min-w-5 h-5 px-1 bg-snapp text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white sv-cart-badge">۰</span>
            </button>
          </div>
          <div class="px-4 pb-3">
            <div class="relative">
              <input id="sv-search-input" type="text" placeholder="جستجو در کالاها و فروشگاه‌ها..."
                class="w-full bg-gray-50 text-xs font-medium text-gray-800 placeholder-gray-400 pr-9 pl-9 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-snapp focus:bg-white focus:ring-2 focus:ring-snapp/10 transition-all">
              <i data-lucide="search" class="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"></i>
              <button id="sv-search-clear" class="hidden absolute left-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-600 active:scale-90 transition-all">
                <i data-lucide="x" class="w-3 h-3"></i>
              </button>
            </div>
          </div>
          <div id="sv-cats-scroll" class="flex gap-2 overflow-x-auto no-scrollbar px-4 pb-3">
            ${CATS.map(c => {
              const active = state.activeCategory === c.id;
              return `
                <button data-sv-cat="${c.id}" class="sv-cat-pill shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${active ? 'text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}"
                  style="${active ? 'background:' + c.color : ''}">
                  <i data-lucide="${c.icon}" class="w-3.5 h-3.5"></i>
                  ${c.label}
                </button>
              `;
            }).join('')}
          </div>
        </header>
        <main id="sv-main"></main>
        <div id="sv-floating-bar" class="fixed bottom-4 inset-x-0 max-w-md mx-auto px-4 z-30 pointer-events-none transition-all duration-300 transform translate-y-28 opacity-0">
          <button id="sv-floating-btn" class="w-full bg-gray-900 text-white rounded-2xl p-3.5 shadow-2xl flex items-center justify-between pointer-events-auto border border-white/10 active:scale-[0.98] transition-transform">
            <div class="flex items-center gap-3">
              <div class="relative">
                <div class="w-11 h-11 rounded-xl bg-snapp flex items-center justify-center shadow-md shadow-pink-500/30">
                  <i data-lucide="shopping-bag" class="w-5 h-5"></i>
                </div>
                <span id="sv-floating-count" class="absolute -top-1.5 -right-1.5 min-w-5 h-5 bg-white text-snapp text-[11px] font-black rounded-full flex items-center justify-center border-2 border-gray-900">۰</span>
              </div>
              <div class="text-right">
                <div class="text-[10px] text-gray-400 font-medium">مجموع سبد خرید</div>
                <div class="text-sm font-black">
                  <span id="sv-floating-total">۰</span>
                  <span class="text-[10px] font-normal text-gray-300 mr-0.5">تومان</span>
                </div>
              </div>
            </div>
            <span class="bg-snapp hover:bg-snapp-hover text-white font-black text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5">
              <span>مشاهده سبد</span>
              <i data-lucide="arrow-left" class="w-4 h-4"></i>
            </span>
          </button>
        </div>
        <div id="sv-cart-backdrop" class="fixed inset-0 bg-black/60 z-[70] opacity-0 pointer-events-none transition-opacity duration-300" style="backdrop-filter: blur(2px);"></div>
        <aside id="sv-cart-drawer" class="fixed inset-y-0 left-0 right-0 max-w-md mx-auto bg-white z-[75] rounded-t-3xl flex flex-col transform translate-y-full transition-transform duration-300 shadow-2xl" style="top:auto; bottom:0; height:90vh;">
          <div id="sv-cart-content" class="flex flex-col h-full"></div>
        </aside>
        <div id="sv-checkout-backdrop" class="fixed inset-0 bg-black/60 z-[80] opacity-0 pointer-events-none transition-opacity duration-300 flex items-center justify-center p-4">
          <div id="sv-checkout-content" class="bg-white rounded-3xl w-full max-w-sm max-h-[90vh] overflow-hidden shadow-2xl transform scale-95 transition-transform duration-300 flex flex-col"></div>
        </div>
        <div id="sv-tracking-backdrop" class="fixed inset-0 bg-black/60 z-[85] opacity-0 pointer-events-none transition-opacity duration-300 flex items-end sm:items-center justify-center">
          <div id="sv-tracking-content" class="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-md max-h-[92vh] overflow-hidden shadow-2xl transform translate-y-full sm:scale-95 transition-transform duration-300 flex flex-col"></div>
        </div>
      </div>
    `;
  }

  function renderScreen() {
    const main = document.getElementById('sv-main');
    if (!main) return;

    if (state.screen === 'vendor' && state.activeVendorId) {
      main.innerHTML = renderVendorScreen();
    } else {
      main.innerHTML = renderHomeScreen();
    }

    const headerTitle = document.getElementById('sv-header-title');

    if (state.screen === 'vendor') {
      const v = currentVendor();
      if (v && headerTitle) {
        headerTitle.innerHTML = `
          <div class="flex items-center gap-1.5">
            <img src="${esc(v.logo)}" class="w-5 h-5 rounded-md object-cover border border-gray-100" alt="" onerror="this.onerror=null;this.style.display='none';">
            <h1 class="font-black text-sm text-gray-900 truncate">${esc(v.name)}</h1>
          </div>
          <p class="text-[10px] text-gray-500 mt-0.5">${esc(v.type)}</p>
        `;
      }
    } else if (headerTitle) {
      headerTitle.innerHTML = `
        <div class="flex items-center gap-1.5">
          <span class="text-base">🛒</span>
          <h1 class="font-black text-sm text-gray-900 truncate">لقمه مارکت</h1>
        </div>
        <p class="text-[10px] text-gray-500 mt-0.5">
          ${t(L.VENDORS.length)} فروشگاه · ${t(L.PRODUCTS.length)} کالا
        </p>
      `;
    }

    if (window.lucide) lucide.createIcons();
  }

  function renderHomeScreen() {
    const query = state.searchQuery.trim();
    if (query.length > 0) return renderSearchResults(query);

    const featured = L.PRODUCTS
      .filter(p => p.discount > 0)
      .sort((a, b) => b.discount - a.discount)
      .slice(0, 10);

    const visibleVendors = L.VENDORS.slice();

    return `
      <div class="sv-fade">
        <section class="mx-4 mt-3 rounded-2xl overflow-hidden relative"
                 style="background: linear-gradient(135deg, #7C3AED 0%, #DB2777 60%, #FF00A6 100%);">
          <div class="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          <div class="absolute -left-6 -bottom-6 w-24 h-24 bg-amber-400/20 rounded-full blur-2xl"></div>
          <div class="relative z-10 p-5">
            <div class="flex items-center gap-2 mb-3">
              <span class="bg-white/20 backdrop-blur-sm border border-white/20 text-white text-[10px] font-black px-2.5 py-1 rounded-lg flex items-center gap-1">
                <i data-lucide="sparkles" class="w-3 h-3"></i>
                لقمه مارکت
              </span>
              <span class="bg-amber-400 text-purple-950 text-[9px] font-black px-2 py-0.5 rounded-md">٪۳۰ تخفیف</span>
            </div>
            <h2 class="font-black text-lg text-white leading-tight mb-1">خرید روزانه از<br>فروشگاه‌های محله</h2>
            <p class="text-[11px] text-white/85 leading-relaxed mb-4">میوه، لبنیات، نان و مایحتاج روزانه — با ارسال اکسپرس</p>
            <div class="grid grid-cols-3 gap-2">
              ${[
                { icon: 'zap', label: 'ارسال سریع' },
                { icon: 'badge-check', label: 'کیفیت تضمینی' },
                { icon: 'wallet', label: 'پرداخت آسان' }
              ].map(b => `
                <div class="bg-white/15 backdrop-blur-sm border border-white/20 rounded-xl p-2 text-center">
                  <i data-lucide="${b.icon}" class="w-4 h-4 text-white mx-auto mb-1"></i>
                  <div class="text-[9px] font-bold text-white/95">${b.label}</div>
                </div>
              `).join('')}
            </div>
          </div>
        </section>

        ${featured.length > 0 ? `
          <section class="mt-5">
            <div class="flex items-center justify-between px-4 mb-3">
              <div class="flex items-center gap-1.5">
                <div class="w-1.5 h-4 bg-gradient-to-b from-rose-500 to-pink-600 rounded-full"></div>
                <h3 class="font-black text-sm text-gray-900">پیشنهادهای ویژه</h3>
                <span class="bg-rose-100 text-rose-600 text-[9px] font-black px-1.5 py-0.5 rounded-md">٪${t(Math.max(...featured.map(p => p.discount)))}</span>
              </div>
            </div>
            <div class="flex gap-3 overflow-x-auto no-scrollbar px-4 pb-2">
              ${featured.map(p => renderFeaturedCard(p)).join('')}
            </div>
          </section>
        ` : ''}

        <section class="mt-5 px-4">
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-1.5">
              <div class="w-1.5 h-4 bg-snapp rounded-full"></div>
              <h3 class="font-black text-sm text-gray-900">فروشگاه‌ها و رستوران‌ها</h3>
              <span class="text-[10px] text-gray-400 font-bold">(${t(visibleVendors.length)})</span>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-3">
            ${visibleVendors.map(v => renderVendorCard(v)).join('')}
          </div>
        </section>

        <section class="mt-6 px-4 mb-4">
          <div class="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 rounded-2xl p-4">
            <div class="flex items-center gap-2 mb-3">
              <div class="w-8 h-8 rounded-xl bg-white flex items-center justify-center shadow-sm">
                <i data-lucide="info" class="w-4 h-4 text-emerald-600"></i>
              </div>
              <div>
                <div class="font-black text-xs text-gray-900">چطور خرید کنیم؟</div>
                <div class="text-[10px] text-gray-500 mt-0.5">فقط سه مرحله ساده</div>
              </div>
            </div>
            <ol class="space-y-2 text-[11px] text-gray-700">
              <li class="flex items-center gap-2"><span class="w-5 h-5 rounded-full bg-emerald-500 text-white text-[10px] font-black flex items-center justify-center shrink-0">۱</span><span>فروشگاه یا دسته‌بندی مورد نظرت رو انتخاب کن</span></li>
              <li class="flex items-center gap-2"><span class="w-5 h-5 rounded-full bg-emerald-500 text-white text-[10px] font-black flex items-center justify-center shrink-0">۲</span><span>کالاها رو به سبد اضافه کن</span></li>
              <li class="flex items-center gap-2"><span class="w-5 h-5 rounded-full bg-emerald-500 text-white text-[10px] font-black flex items-center justify-center shrink-0">۳</span><span>پرداخت کن و سفارشت رو در محل تحویل بگیر</span></li>
            </ol>
          </div>
        </section>
      </div>
    `;
  }

  function renderSearchResults(query) {
    const result = L.performSearch(query, { limit: 30, vendorLimit: 6 });

    if (result.total === 0) {
      return `
        <div class="sv-fade px-4 py-16 text-center">
          <div class="w-20 h-20 mx-auto mb-4 bg-pink-50 rounded-full flex items-center justify-center text-snapp">
            <i data-lucide="search-x" class="w-9 h-9"></i>
          </div>
          <h4 class="font-black text-sm text-gray-900 mb-1">نتیجه‌ای پیدا نشد!</h4>
          <p class="text-xs text-gray-500 leading-relaxed mb-5">برای «<span class="font-bold">${esc(query)}</span>» چیزی پیدا نکردیم.</p>
          <button onclick="SupermarketAPI.clearSearch()" class="bg-snapp hover:bg-snapp-hover text-white font-black text-xs px-6 py-3 rounded-2xl shadow-md shadow-pink-500/25 active:scale-95 transition-all">پاک کردن جستجو</button>
        </div>
      `;
    }

    return `
      <div class="sv-fade px-4 pt-3 pb-4 space-y-5">
        ${result.categories.length > 0 ? `
          <div>
            <div class="flex items-center gap-1.5 mb-2">
              <i data-lucide="layout-grid" class="w-3.5 h-3.5 text-snapp"></i>
              <span class="text-[11px] font-black text-gray-700">دسته‌بندی‌ها</span>
            </div>
            <div class="flex flex-wrap gap-2">
              ${result.categories.map(c => {
                const meta = catMeta(c.id);
                return `
                  <button onclick="SupermarketAPI.setCategory('${c.id}'); SupermarketAPI.clearSearch();"
                    class="bg-white border border-gray-200 hover:border-snapp/40 text-gray-700 text-[11px] font-bold px-3 py-1.5 rounded-xl transition-all active:scale-95 flex items-center gap-1.5">
                    <i data-lucide="${meta.icon}" class="w-3 h-3" style="color:${meta.color}"></i>
                    ${meta.label}
                    <span class="text-[9px] text-gray-400">(${t(c.count)})</span>
                  </button>
                `;
              }).join('')}
            </div>
          </div>
        ` : ''}
        ${result.vendors.length > 0 ? `
          <div>
            <div class="flex items-center gap-1.5 mb-2">
              <i data-lucide="store" class="w-3.5 h-3.5 text-snapp"></i>
              <span class="text-[11px] font-black text-gray-700">فروشگاه‌ها</span>
              <span class="text-[10px] text-gray-400">(${t(result.vendors.length)})</span>
            </div>
            <div class="space-y-2">
              ${result.vendors.map(r => renderVendorSearchRow(r.ref)).join('')}
            </div>
          </div>
        ` : ''}
        ${result.products.length > 0 ? `
          <div>
            <div class="flex items-center gap-1.5 mb-2">
              <i data-lucide="package" class="w-3.5 h-3.5 text-snapp"></i>
              <span class="text-[11px] font-black text-gray-700">کالاها</span>
              <span class="text-[10px] text-gray-400">(${t(result.products.length)})</span>
            </div>
            <div class="space-y-2.5">
              ${result.products.map(r => renderProductRow(r.ref)).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    `;
  }

  function renderVendorSearchRow(v) {
    return `
      <div onclick="SupermarketAPI.openVendor('${v.id}')" class="bg-white rounded-2xl border border-gray-100 p-3 flex items-center gap-3 hover:shadow-[0_4px_14px_-6px_rgba(0,0,0,0.1)] cursor-pointer active:scale-[0.98] transition-all">
        <img src="${esc(v.logo)}" class="w-11 h-11 rounded-xl object-cover border border-gray-100 shrink-0" alt="" onerror="this.onerror=null;this.src='${FALLBACK_IMG}';">
        <div class="flex-1 min-w-0">
          <div class="font-black text-xs text-gray-900 truncate">${esc(v.name)}</div>
          <div class="text-[10px] text-gray-500 truncate mt-0.5">${esc(v.type)}</div>
          <div class="flex items-center gap-2 mt-1 text-[10px] font-bold text-gray-500">
            <span class="flex items-center gap-0.5"><i data-lucide="star" class="w-3 h-3 fill-amber-400 text-amber-400"></i>${t(v.rating)}</span>
            <span class="w-1 h-1 bg-gray-300 rounded-full"></span>
            <span>${t(v.deliveryTimeMin)}-${t(v.deliveryTimeMax)} دقیقه</span>
          </div>
        </div>
        <i data-lucide="chevron-left" class="w-4 h-4 text-gray-300 shrink-0"></i>
      </div>
    `;
  }

  function renderVendorScreen() {
    const v = currentVendor();
    if (!v) { state.screen = 'home'; return renderHomeScreen(); }

    let products = L.productsByVendor(v.id);
    if (state.activeCategory !== 'all') {
      products = products.filter(p => p.categoryId === state.activeCategory);
    }
    products = sortProducts(products, state.sortBy);

    return `
      <div class="sv-fade">
        <div class="relative h-36 w-full bg-gray-900">
          <img src="${esc(v.banner)}" class="w-full h-full object-cover opacity-85" alt="" onerror="this.onerror=null;this.src='${FALLBACK_IMG}';">
          <div class="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/40"></div>
          <div class="absolute -bottom-7 right-4 z-10">
            <div class="w-16 h-16 rounded-2xl border-2 border-white bg-white shadow-xl overflow-hidden p-0.5">
              <img src="${esc(v.logo)}" class="w-full h-full object-cover rounded-xl" alt="" onerror="this.onerror=null;this.src='${FALLBACK_IMG}';">
            </div>
          </div>
        </div>
        <div class="pt-9 px-4 pb-3 bg-white border-b border-gray-100">
          <div class="flex items-start justify-between gap-2 mb-2">
            <div class="min-w-0">
              <h1 class="font-black text-base text-gray-900 leading-tight truncate">${esc(v.name)}</h1>
              <p class="text-[11px] text-gray-500 mt-0.5 truncate">${esc(v.type)}</p>
            </div>
            <div class="flex items-center gap-1 bg-amber-50 border border-amber-200 text-amber-600 px-2 py-1 rounded-xl text-[11px] font-black shrink-0">
              <i data-lucide="star" class="w-3.5 h-3.5 fill-amber-400 text-amber-400"></i>
              <span>${t(v.rating)}</span>
              <span class="text-[9px] text-gray-400 font-normal">(${t(v.reviews)})</span>
            </div>
          </div>
          <div class="flex items-center gap-3 text-[11px] font-bold text-gray-600 pt-1">
            <div class="flex items-center gap-1"><i data-lucide="clock" class="w-3.5 h-3.5 text-gray-400"></i><span>${t(v.deliveryTimeMin)}-${t(v.deliveryTimeMax)} دقیقه</span></div>
            <div class="w-1 h-1 bg-gray-300 rounded-full"></div>
            <div class="flex items-center gap-1"><i data-lucide="bike" class="w-3.5 h-3.5 text-gray-400"></i><span>${v.deliveryFee === 0 ? '<span class="text-emerald-600">ارسال رایگان</span>' : fp(v.deliveryFee) + ' تومان'}</span></div>
          </div>
        </div>
        <div class="sticky top-[122px] z-20 bg-white/95 backdrop-blur-md border-b border-gray-100 px-4 py-2.5">
          <div class="flex items-center gap-2 overflow-x-auto no-scrollbar">
            ${[
              { id: 'relevance', label: 'مرتبط‌ترین', icon: 'sparkles' },
              { id: 'price-asc', label: 'ارزان‌ترین', icon: 'arrow-down' },
              { id: 'price-desc', label: 'گران‌ترین', icon: 'arrow-up' },
              { id: 'rating', label: 'بیشترین امتیاز', icon: 'star' },
              { id: 'discount', label: 'بیشترین تخفیف', icon: 'percent' }
            ].map(s => {
              const active = state.sortBy === s.id;
              return `
                <button onclick="SupermarketAPI.setSort('${s.id}')"
                  class="shrink-0 px-3 py-1.5 rounded-full text-[11px] font-bold transition-all flex items-center gap-1.5 ${active ? 'bg-snapp text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}">
                  <i data-lucide="${s.icon}" class="w-3 h-3"></i>${s.label}
                </button>
              `;
            }).join('')}
          </div>
        </div>
        <div class="p-4">
          ${products.length === 0 ? `
            <div class="text-center py-16">
              <div class="w-16 h-16 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
                <i data-lucide="package-x" class="w-8 h-8"></i>
              </div>
              <h4 class="font-black text-sm text-gray-800 mb-1">کالایی در این دسته نیست</h4>
              <p class="text-xs text-gray-500">دسته‌بندی دیگری را امتحان کنید.</p>
            </div>
          ` : `
            <div class="flex items-center justify-between mb-3">
              <span class="text-[11px] text-gray-500 font-bold">${t(products.length)} کالا</span>
              ${state.activeCategory !== 'all' ? `
                <button onclick="SupermarketAPI.setCategory('all')" class="text-[10px] font-black text-snapp flex items-center gap-1">
                  <i data-lucide="x" class="w-3 h-3"></i> حذف فیلتر دسته
                </button>
              ` : ''}
            </div>
            <div class="grid grid-cols-2 gap-3">
              ${products.map(p => renderProductCard(p)).join('')}
            </div>
          `}
        </div>
      </div>
    `;
  }

  function sortProducts(list, mode) {
    const arr = list.slice();
    switch (mode) {
      case 'price-asc':  arr.sort((a, b) => a.price - b.price); break;
      case 'price-desc': arr.sort((a, b) => b.price - a.price); break;
      case 'rating':     arr.sort((a, b) => (b.rating || 0) - (a.rating || 0)); break;
      case 'discount':   arr.sort((a, b) => (b.discount || 0) - (a.discount || 0)); break;
      default:           arr.sort((a, b) => (b.rating || 0) * 10 + (b.discount || 0) - ((a.rating || 0) * 10 + (a.discount || 0)));
    }
    return arr;
  }

  function renderVendorCard(v) {
    const hasDiscount = L.productsByVendor(v.id).some(p => p.discount > 0);
    const isFree = v.deliveryFee === 0;

    return `
      <div onclick="SupermarketAPI.openVendor('${v.id}')"
           class="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_4px_18px_-6px_rgba(0,0,0,0.10)] cursor-pointer active:scale-[0.98] transition-all">
        <div class="relative h-24 w-full">
          <img src="${esc(v.banner)}" class="w-full h-full object-cover" alt="" onerror="this.onerror=null;this.src='${FALLBACK_IMG}';">
          <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
          ${hasDiscount ? `<span class="absolute top-2 right-2 bg-rose-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md shadow-md">تخفیف ویژه</span>` : ''}
          ${isFree ? `<span class="absolute top-2 left-2 bg-emerald-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md shadow-md">ارسال رایگان</span>` : ''}
          <div class="absolute bottom-2 right-2 flex items-center gap-1 bg-black/50 backdrop-blur-md border border-white/10 px-1.5 py-0.5 rounded-md">
            <i data-lucide="star" class="w-2.5 h-2.5 fill-amber-400 text-amber-400"></i>
            <span class="text-[10px] font-black text-white">${t(v.rating)}</span>
          </div>
        </div>
        <div class="p-2.5">
          <div class="flex items-center gap-2 mb-1.5">
            <div class="w-8 h-8 rounded-full overflow-hidden border-2 border-white bg-white shrink-0 -mt-5 shadow-md">
              <img src="${esc(v.logo)}" class="w-full h-full object-cover" alt="" onerror="this.onerror=null;this.src='${FALLBACK_IMG}';">
            </div>
            <div class="min-w-0 flex-1">
              <h4 class="font-black text-[11px] text-gray-900 truncate">${esc(v.name)}</h4>
              <p class="text-[9px] text-gray-400 truncate">${esc(v.type)}</p>
            </div>
          </div>
          <div class="flex items-center justify-between text-[9px] font-bold text-gray-500 mt-2">
            <div class="flex items-center gap-0.5"><i data-lucide="clock" class="w-3 h-3 text-gray-400"></i><span>${t(v.deliveryTimeMin)}-${t(v.deliveryTimeMax)}′</span></div>
            <div class="flex items-center gap-0.5"><i data-lucide="bike" class="w-3 h-3 text-gray-400"></i><span class="${isFree ? 'text-emerald-600' : ''}">${isFree ? 'رایگان' : fp(v.deliveryFee)}</span></div>
          </div>
        </div>
      </div>
    `;
  }

  function renderFeaturedCard(p) {
    const qty = cartQty(p.id);
    const saved = p.originalPrice - p.price;

    return `
      <div class="shrink-0 w-[180px] bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div class="relative aspect-square bg-gray-50">
          ${imgTag(p)}
          <span class="absolute top-2 right-2 bg-gradient-to-br from-rose-500 to-pink-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded-md shadow-sm">٪${t(p.discount)}</span>
          <button type="button" class="sv-3d-btn"
                  onclick="event.stopPropagation(); window.openSupermarket3D(${p.id});"
                  aria-label="نمایش سه‌بعدی" title="نمایش سه‌بعدی">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
              <line x1="12" y1="22.08" x2="12" y2="12"/>
            </svg>
          </button>
        </div>
        <div class="p-2.5">
          <h4 class="font-black text-[11px] text-gray-900 leading-snug line-clamp-2 mb-1.5 h-7">${esc(p.title)}</h4>
          <div class="flex items-center gap-1 mb-2">
            <i data-lucide="star" class="w-3 h-3 fill-amber-400 text-amber-400"></i>
            <span class="text-[10px] font-black text-amber-600">${t(p.rating)}</span>
          </div>
          <div class="mb-2">
            <div class="text-[10px] text-gray-400 line-through">${fp(p.originalPrice)}</div>
            <div class="text-xs font-black text-gray-900">${fp(p.price)} <span class="text-[9px] font-normal text-gray-500">تومان</span></div>
          </div>
          <div class="text-[9px] font-bold text-emerald-600 mb-2">${fp(saved)} تومان سود</div>
          <div id="sv-qty-${p.id}">${renderQtyControl(p.id, qty)}</div>
        </div>
      </div>
    `;
  }

  function renderProductCard(p) {
    const qty = cartQty(p.id);
    const hasDiscount = p.discount > 0;

    return `
      <div class="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_4px_16px_-6px_rgba(0,0,0,0.10)] transition-all flex flex-col">
        <div class="relative aspect-square bg-gray-50">
          ${imgTag(p)}
          ${hasDiscount ? `<span class="absolute top-2 right-2 bg-gradient-to-br from-rose-500 to-pink-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded-md shadow-sm">٪${t(p.discount)}</span>` : ''}
          ${p.stockLeft <= 5 ? `<span class="absolute top-2 left-2 bg-amber-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md shadow-sm">${t(p.stockLeft)} عدد باقی</span>` : ''}
          <button type="button" class="sv-3d-btn"
                  onclick="event.stopPropagation(); window.openSupermarket3D(${p.id});"
                  aria-label="نمایش سه‌بعدی" title="نمایش سه‌بعدی">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
              <line x1="12" y1="22.08" x2="12" y2="12"/>
            </svg>
          </button>
        </div>
        <div class="p-2.5 flex flex-col flex-1">
          <h4 class="font-black text-[11px] text-gray-900 leading-snug line-clamp-2 mb-1.5 h-7">${esc(p.title)}</h4>
          <div class="flex items-center gap-1 mb-2">
            <i data-lucide="star" class="w-3 h-3 fill-amber-400 text-amber-400"></i>
            <span class="text-[10px] font-black text-amber-600">${t(p.rating)}</span>
            <span class="text-[9px] text-gray-400">(${t(p.reviewsCount)})</span>
          </div>
          <div class="mt-auto">
            ${hasDiscount ? `<div class="text-[10px] text-gray-400 line-through">${fp(p.originalPrice)}</div>` : ''}
            <div class="text-xs font-black text-gray-900 mb-2">${fp(p.price)} <span class="text-[9px] font-normal text-gray-500">تومان</span></div>
            <div id="sv-qty-${p.id}">${renderQtyControl(p.id, qty)}</div>
          </div>
        </div>
      </div>
    `;
  }

  function renderProductRow(p) {
    const qty = cartQty(p.id);
    const vendor = L.vendorById(p.vendorId);
    const hasDiscount = p.discount > 0;

    return `
      <div class="bg-white rounded-2xl border border-gray-100 p-3 flex gap-3 hover:shadow-[0_4px_14px_-6px_rgba(0,0,0,0.1)] transition-all">
        <div class="relative w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-gray-50 border border-gray-100">
          ${imgTag(p)}
          ${hasDiscount ? `<span class="absolute top-1 right-1 bg-rose-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md">٪${t(p.discount)}</span>` : ''}
          <button type="button" class="sv-3d-btn sv-3d-btn--sm"
                  onclick="event.stopPropagation(); window.openSupermarket3D(${p.id});"
                  aria-label="نمایش سه‌بعدی" title="نمایش سه‌بعدی">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
              <line x1="12" y1="22.08" x2="12" y2="12"/>
            </svg>
          </button>
        </div>
        <div class="flex-1 min-w-0 flex flex-col justify-between">
          <div>
            <h4 class="font-black text-xs text-gray-900 leading-snug line-clamp-2">${esc(p.title)}</h4>
            ${vendor ? `<div class="text-[10px] text-gray-500 mt-0.5 truncate flex items-center gap-1"><i data-lucide="store" class="w-2.5 h-2.5"></i>${esc(vendor.name)}</div>` : ''}
          </div>
          <div class="flex items-end justify-between mt-2">
            <div>
              ${hasDiscount ? `<span class="text-[10px] text-gray-400 line-through block">${fp(p.originalPrice)}</span>` : ''}
              <span class="text-xs font-black text-gray-900">${fp(p.price)} <span class="text-[9px] font-normal text-gray-500">تومان</span></span>
            </div>
            <div id="sv-qty-${p.id}">${renderQtyControl(p.id, qty)}</div>
          </div>
        </div>
      </div>
    `;
  }

  function renderQtyControl(productId, qty) {
    if (qty === 0) {
      return `
        <button onclick="event.stopPropagation(); SupermarketAPI.addToCart(${productId});"
          class="w-full bg-snapp-light hover:bg-snapp hover:text-white text-snapp font-bold text-[11px] px-3 py-2 rounded-xl transition-all flex items-center justify-center gap-1 active:scale-95 border border-snapp/20">
          <i data-lucide="plus" class="w-3.5 h-3.5"></i>افزودن
        </button>
      `;
    }
    return `
      <div class="flex items-center bg-snapp text-white rounded-xl shadow-sm p-0.5 justify-between">
        <button onclick="event.stopPropagation(); SupermarketAPI.addToCart(${productId});"
          class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/20 active:scale-90 transition-transform">
          <i data-lucide="plus" class="w-3.5 h-3.5"></i>
        </button>
        <span class="text-xs font-black min-w-5 text-center select-none">${t(qty)}</span>
        <button onclick="event.stopPropagation(); SupermarketAPI.decFromCart(${productId});"
          class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/20 active:scale-90 transition-transform">
          <i data-lucide="${qty === 1 ? 'trash-2' : 'minus'}" class="w-3.5 h-3.5"></i>
        </button>
      </div>
    `;
  }

  function syncCartUI() {
    const count = L.cart.getCount();

    const topBadge = document.getElementById('sv-cart-badge');
    if (topBadge) {
      if (count > 0) {
        topBadge.textContent = t(count);
        topBadge.classList.remove('hidden');
        topBadge.classList.add('sv-bump');
        setTimeout(() => topBadge.classList.remove('sv-bump'), 200);
      } else {
        topBadge.classList.add('hidden');
      }
    }

    const bar = document.getElementById('sv-floating-bar');
    const barCount = document.getElementById('sv-floating-count');
    const barTotal = document.getElementById('sv-floating-total');
    if (bar && barCount && barTotal) {
      if (count > 0) {
        const summary = L.Store.summary();
        barCount.textContent = t(count);
        barTotal.textContent = fp(summary.grandTotal);
        bar.classList.remove('translate-y-28', 'opacity-0');
      } else {
        bar.classList.add('translate-y-28', 'opacity-0');
      }
    }

    if (state.cartOpen) renderCartContent();
  }

  function openCart() {
    state.cartOpen = true;
    const drawer = document.getElementById('sv-cart-drawer');
    const backdrop = document.getElementById('sv-cart-backdrop');
    if (!drawer || !backdrop) return;
    renderCartContent();
    backdrop.classList.remove('opacity-0', 'pointer-events-none');
    drawer.classList.remove('translate-y-full');
  }

  function closeCart() {
    state.cartOpen = false;
    const drawer = document.getElementById('sv-cart-drawer');
    const backdrop = document.getElementById('sv-cart-backdrop');
    if (!drawer || !backdrop) return;
    drawer.classList.add('translate-y-full');
    backdrop.classList.add('opacity-0', 'pointer-events-none');
  }

  function renderCartContent() {
    const host = document.getElementById('sv-cart-content');
    if (!host) return;

    const summary = L.Store.summary();
    const vendor = summary.vendor;

    if (summary.itemCount === 0) {
      host.innerHTML = `
        <div class="p-4 border-b border-gray-100 flex items-center justify-between shrink-0">
          <h3 class="font-black text-sm text-gray-900">سبد خرید</h3>
          <button onclick="SupermarketAPI.closeCart()" class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200"><i data-lucide="x" class="w-4 h-4"></i></button>
        </div>
        <div class="flex-1 flex flex-col items-center justify-center text-center px-6">
          <div class="w-20 h-20 rounded-full bg-pink-50 flex items-center justify-center mb-4 text-snapp"><i data-lucide="shopping-bag" class="w-10 h-10"></i></div>
          <h4 class="font-black text-sm text-gray-900 mb-1">سبد خرید خالی است</h4>
          <p class="text-xs text-gray-500 mb-5 max-w-xs">هنوز کالایی به سبد اضافه نکرده‌اید.</p>
          <button onclick="SupermarketAPI.closeCart()" class="bg-snapp hover:bg-snapp-hover text-white font-black text-xs px-6 py-3 rounded-2xl shadow-md shadow-pink-500/25 active:scale-95 transition-all">شروع خرید</button>
        </div>
      `;
      if (window.lucide) lucide.createIcons();
      return;
    }

    host.innerHTML = `
      <div class="p-4 border-b border-gray-100 flex items-center justify-between shrink-0">
        <div class="flex items-center gap-2">
          <div class="w-2 h-5 bg-snapp rounded-full"></div>
          <div>
            <h3 class="font-black text-sm text-gray-900">سبد خرید</h3>
            ${vendor ? `<div class="text-[10px] text-gray-500 mt-0.5 flex items-center gap-1"><i data-lucide="store" class="w-2.5 h-2.5"></i>${esc(vendor.name)}</div>` : ''}
          </div>
        </div>
        <div class="flex items-center gap-2">
          <button onclick="SupermarketAPI.confirmClearCart()" class="text-[10px] font-black text-rose-500 hover:bg-rose-50 px-2.5 py-2 rounded-lg transition-colors">پاک کردن</button>
          <button onclick="SupermarketAPI.closeCart()" class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200"><i data-lucide="x" class="w-4 h-4"></i></button>
        </div>
      </div>
      <div class="flex-1 overflow-y-auto p-4 space-y-2.5">${L.cart.getItems().map(it => renderCartItem(it)).join('')}</div>
      <div class="p-4 border-t border-gray-100 bg-gray-50/80 shrink-0 space-y-3">
        <div>
          ${summary.coupon && summary.coupon.ok ? `
            <div class="bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 flex items-center justify-between">
              <div class="flex items-center gap-2">
                <i data-lucide="badge-percent" class="w-4 h-4 text-emerald-600"></i>
                <div>
                  <div class="text-[11px] font-black text-emerald-900">${esc(summary.coupon.title || summary.coupon.code)}</div>
                  <div class="text-[10px] text-emerald-700">تخفیف: ${fp(summary.couponDiscount)} تومان</div>
                </div>
              </div>
              <button onclick="SupermarketAPI.removeCoupon()" class="w-6 h-6 rounded-full bg-white flex items-center justify-center text-emerald-700 hover:bg-emerald-100"><i data-lucide="x" class="w-3 h-3"></i></button>
            </div>
          ` : `
            <div class="flex gap-2">
              <input id="sv-coupon-input" type="text" placeholder="کد تخفیف (مثلاً FRESH20)" class="flex-1 text-xs bg-white border border-gray-200 rounded-xl px-3 py-2.5 font-bold uppercase placeholder-gray-400 focus:outline-none focus:border-snapp">
              <button onclick="SupermarketAPI.applyCoupon()" class="bg-gray-900 hover:bg-black text-white text-xs font-bold px-4 py-2.5 rounded-xl active:scale-95 transition-all">ثبت</button>
            </div>
            <p id="sv-coupon-msg" class="text-[10px] font-bold mt-1.5 hidden"></p>
          `}
        </div>
        <div class="space-y-1.5 text-xs text-gray-600 pt-1 border-t border-gray-200">
          <div class="flex justify-between"><span>جمع کالاها:</span><span class="font-bold text-gray-800">${fp(summary.subtotal)} تومان</span></div>
          ${summary.productSavings > 0 ? `<div class="flex justify-between text-rose-600"><span>سود شما از تخفیف کالاها:</span><span class="font-bold">-${fp(summary.productSavings)} تومان</span></div>` : ''}
          ${summary.couponDiscount > 0 ? `<div class="flex justify-between text-rose-600"><span>تخفیف کد:</span><span class="font-bold">-${fp(summary.couponDiscount)} تومان</span></div>` : ''}
          <div class="flex justify-between items-center"><span>هزینه ارسال:</span><span class="font-bold ${summary.deliveryFee === 0 ? 'text-emerald-600' : 'text-gray-800'}">${summary.deliveryFee === 0 ? 'رایگان' : fp(summary.deliveryFee) + ' تومان'}</span></div>
          <div class="border-t border-gray-200 pt-2.5 mt-2 flex justify-between items-center text-sm">
            <span class="font-black text-gray-900">مبلغ نهایی:</span>
            <div><span class="font-black text-snapp text-lg">${fp(summary.grandTotal)}</span><span class="text-xs font-normal text-gray-500 mr-0.5">تومان</span></div>
          </div>
        </div>
        <button onclick="SupermarketAPI.openCheckout()" class="w-full bg-snapp hover:bg-snapp-hover active:scale-[0.98] text-white font-black text-sm py-3.5 rounded-2xl shadow-lg shadow-pink-500/25 transition-all flex items-center justify-center gap-2">
          <span>ادامه و پرداخت</span><i data-lucide="arrow-left" class="w-4 h-4"></i>
        </button>
      </div>
    `;
    if (window.lucide) lucide.createIcons();
  }

  function renderCartItem(it) {
    const p = it.product;
    if (!p) return '';
    return `
      <div class="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0">
        <div class="w-14 h-14 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 shrink-0">
          ${imgTag(p)}
        </div>
        <div class="flex-1 min-w-0">
          <div class="font-black text-[11px] text-gray-900 truncate">${esc(p.title)}</div>
          <div class="text-xs font-black text-gray-700 mt-1">${fp(it.unitPrice * it.quantity)} <span class="text-[9px] font-normal text-gray-400">تومان</span></div>
        </div>
        <div class="flex items-center bg-gray-100 rounded-xl p-1 gap-1.5 shrink-0">
          <button onclick="SupermarketAPI.addToCart(${p.id})" class="w-7 h-7 flex items-center justify-center bg-white rounded-lg text-gray-800 shadow-sm active:scale-90"><i data-lucide="plus" class="w-3.5 h-3.5"></i></button>
          <span class="text-xs font-black min-w-4 text-center">${t(it.quantity)}</span>
          <button onclick="SupermarketAPI.decFromCart(${p.id})" class="w-7 h-7 flex items-center justify-center bg-white rounded-lg text-gray-800 shadow-sm active:scale-90"><i data-lucide="${it.quantity === 1 ? 'trash-2' : 'minus'}" class="w-3.5 h-3.5 text-rose-600"></i></button>
        </div>
      </div>
    `;
  }

  function openCheckout() {
    if (L.cart.isEmpty()) { L.notify.warning('سبد خرید خالی است'); return; }

    state.checkoutDraft = {
      paymentMethod: 'wallet',
      deliveryMode: L.cart.state.deliveryMode || 'delivery',
      address: 'تهران، سعادت‌آباد، خیابان سرو غربی، پلاک ۲۴، واحد ۳',
      notes: ''
    };

    state.checkoutOpen = true;
    renderCheckoutContent();

    const backdrop = document.getElementById('sv-checkout-backdrop');
    const content = document.getElementById('sv-checkout-content');
    if (!backdrop || !content) return;

    backdrop.classList.remove('opacity-0', 'pointer-events-none');
    content.classList.remove('scale-95');
    if (window.lucide) lucide.createIcons();
  }

  function closeCheckout() {
    state.checkoutOpen = false;
    const backdrop = document.getElementById('sv-checkout-backdrop');
    const content = document.getElementById('sv-checkout-content');
    if (!backdrop || !content) return;
    backdrop.classList.add('opacity-0', 'pointer-events-none');
    content.classList.add('scale-95');
  }

  function renderCheckoutContent() {
    const host = document.getElementById('sv-checkout-content');
    if (!host || !state.checkoutDraft) return;

    const summary = L.Store.summary();
    const wallet = L.Store.user.get('walletBalance');
    const d = state.checkoutDraft;
    const walletEnough = wallet >= summary.grandTotal;

    host.innerHTML = `
      <div class="h-1.5 bg-gradient-to-l from-snapp via-pink-500 to-rose-500 shrink-0"></div>
      <div class="p-4 bg-white border-b border-gray-100 flex items-center justify-between shrink-0">
        <h3 class="font-black text-sm text-gray-900">تکمیل خرید</h3>
        <button onclick="SupermarketAPI.closeCheckout()" class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200"><i data-lucide="x" class="w-4 h-4"></i></button>
      </div>
      <div class="overflow-y-auto p-4 space-y-4 flex-1">
        <div>
          <label class="text-[11px] font-black text-gray-700 mb-2 flex items-center gap-1.5"><i data-lucide="map-pin" class="w-3.5 h-3.5 text-snapp"></i>نشانی تحویل</label>
          <textarea id="sv-address-input" rows="2" class="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs font-medium text-gray-800 focus:outline-none focus:border-snapp resize-none leading-relaxed">${esc(d.address)}</textarea>
        </div>
        <div>
          <label class="text-[11px] font-black text-gray-700 mb-2 flex items-center gap-1.5"><i data-lucide="truck" class="w-3.5 h-3.5 text-snapp"></i>شیوه دریافت</label>
          <div class="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-xl">
            <button onclick="SupermarketAPI.setDeliveryMode('delivery')" class="py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${d.deliveryMode === 'delivery' ? 'bg-white text-snapp shadow-sm' : 'text-gray-500'}"><i data-lucide="bike" class="w-3.5 h-3.5"></i>ارسال با پیک</button>
            <button onclick="SupermarketAPI.setDeliveryMode('pickup')" class="py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${d.deliveryMode === 'pickup' ? 'bg-white text-snapp shadow-sm' : 'text-gray-500'}"><i data-lucide="shopping-bag" class="w-3.5 h-3.5"></i>مراجعه حضوری</button>
          </div>
        </div>
        <div>
          <label class="text-[11px] font-black text-gray-700 mb-2 flex items-center gap-1.5"><i data-lucide="credit-card" class="w-3.5 h-3.5 text-snapp"></i>شیوه پرداخت</label>
          <div class="space-y-2">
            <label class="flex items-center justify-between p-3 rounded-xl border-2 ${d.paymentMethod === 'wallet' ? 'border-snapp bg-snapp-light/30' : 'border-gray-100 bg-white'} cursor-pointer transition-all">
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600"><i data-lucide="wallet" class="w-4 h-4"></i></div>
                <div>
                  <div class="text-xs font-black text-gray-900">کیف پول لقمه</div>
                  <div class="text-[10px] mt-0.5 ${walletEnough ? 'text-gray-500' : 'text-rose-500 font-bold'}">موجودی: ${fp(wallet)} تومان</div>
                </div>
              </div>
              <input type="radio" name="sv-pay" value="wallet" ${d.paymentMethod === 'wallet' ? 'checked' : ''} onchange="SupermarketAPI.setPaymentMethod('wallet')" class="w-4 h-4 accent-snapp">
            </label>
            <label class="flex items-center justify-between p-3 rounded-xl border-2 ${d.paymentMethod === 'gateway' ? 'border-snapp bg-snapp-light/30' : 'border-gray-100 bg-white'} cursor-pointer transition-all">
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600"><i data-lucide="credit-card" class="w-4 h-4"></i></div>
                <div>
                  <div class="text-xs font-black text-gray-900">پرداخت اینترنتی</div>
                  <div class="text-[10px] text-gray-500 mt-0.5">درگاه شاپرک / سامان کیش</div>
                </div>
              </div>
              <input type="radio" name="sv-pay" value="gateway" ${d.paymentMethod === 'gateway' ? 'checked' : ''} onchange="SupermarketAPI.setPaymentMethod('gateway')" class="w-4 h-4 accent-snapp">
            </label>
          </div>
        </div>
        <div class="bg-gray-50 rounded-xl p-3 border border-gray-100 space-y-1.5 text-[11px]">
          <div class="flex justify-between text-gray-600"><span>جمع کالاها:</span><span class="font-bold">${fp(summary.subtotal)} تومان</span></div>
          ${summary.totalDiscount > 0 ? `<div class="flex justify-between text-rose-600"><span>تخفیف کل:</span><span class="font-bold">-${fp(summary.totalDiscount)} تومان</span></div>` : ''}
          <div class="flex justify-between text-gray-600"><span>هزینه ارسال:</span><span class="font-bold">${summary.deliveryFee === 0 ? 'رایگان' : fp(summary.deliveryFee) + ' تومان'}</span></div>
          <div class="flex justify-between items-center border-t border-gray-200 pt-2 mt-1">
            <span class="font-black text-gray-900 text-xs">قابل پرداخت:</span>
            <span class="font-black text-snapp text-base">${fp(summary.grandTotal)} <span class="text-[9px] font-normal text-gray-500">تومان</span></span>
          </div>
        </div>
      </div>
      <div class="p-4 bg-white border-t border-gray-100 shrink-0">
        <button onclick="SupermarketAPI.commitCheckout()" class="w-full bg-snapp hover:bg-snapp-hover text-white font-black text-sm py-4 rounded-2xl shadow-lg shadow-pink-500/30 transition-all flex items-center justify-center gap-2 active:scale-95">
          <i data-lucide="check-circle-2" class="w-5 h-5"></i>
          <span>تایید و پرداخت ${fp(summary.grandTotal)} تومان</span>
        </button>
      </div>
    `;
    if (window.lucide) lucide.createIcons();
  }

  function startTracking(order) {
    state.trackingOpen = true;
    const backdrop = document.getElementById('sv-tracking-backdrop');
    const content = document.getElementById('sv-tracking-content');
    if (!backdrop || !content) return;

    const vendor = L.vendorById(order.vendorId);
    const sim = new L.CourierSimulator({
      vendorId: order.vendorId,
      vendor: vendor,
      destination: { lat: order.userLat || 35.7860, lng: order.userLng || 51.3740 },
      etaMinutes: order.etaMinutes || 40,
      courier: {
        name: 'رضا محمدی',
        photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80',
        rating: 4.9,
        vehicle: 'موتور سیکلت',
        plate: '۱۲ ب ۳۴۵ ایران ۲۲'
      }
    });

    state.activeCourier = sim;

    sim.on((event, st) => {
      if (event === 'tick' || event === 'stage-change' || event === 'delivered') {
        updateTrackingUI(st);
        if (event === 'delivered') {
          L.Store.orders.updateStatus(order.id, 'delivered');
          setTimeout(() => L.notify.success('سفارش شما با موفقیت تحویل داده شد!'), 400);
        }
      }
    });

    sim.start();
    renderTrackingContent(order, sim.getState());

    backdrop.classList.remove('opacity-0', 'pointer-events-none');
    content.classList.remove('translate-y-full', 'sm:scale-95');
    if (window.lucide) lucide.createIcons();
  }

  function renderTrackingContent(order, st) {
    const host = document.getElementById('sv-tracking-content');
    if (!host) return;

    const vendor = L.vendorById(order.vendorId);

    host.innerHTML = `
      <div class="p-4 bg-gradient-to-r from-snapp to-pink-600 text-white shrink-0 relative overflow-hidden">
        <div class="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
        <div class="relative z-10 flex items-center justify-between">
          <div>
            <div class="flex items-center gap-1.5 mb-1">
              <span class="w-2 h-2 rounded-full bg-white sv-pulse"></span>
              <span class="text-[10px] font-black tracking-wider">در حال انجام</span>
            </div>
            <div class="text-2xl font-black" id="sv-tracking-eta">${t(st.etaMinutes)}</div>
            <div class="text-[11px] opacity-90">دقیقه تا رسیدن پیک</div>
          </div>
          <button onclick="SupermarketAPI.closeTracking()" class="w-9 h-9 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white"><i data-lucide="x" class="w-4 h-4"></i></button>
        </div>
      </div>
      <div class="overflow-y-auto p-4 space-y-4 flex-1">
        <div>
          <div class="flex items-center justify-between text-[10px] font-bold text-gray-500 mb-2">
            <span id="sv-tracking-stage">${st.stageLabel}</span>
            <span id="sv-tracking-progress-pct">٪${t(Math.round(st.progress * 100))}</span>
          </div>
          <div class="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div id="sv-tracking-progress" class="h-full sv-track-stages rounded-full sv-progress-fill" style="width: ${st.progress * 100}%"></div>
          </div>
        </div>
        <div class="bg-white rounded-2xl border border-gray-100 p-4">
          <h3 class="font-black text-xs text-gray-900 mb-4 flex items-center gap-1.5">
            <i data-lucide="activity" class="w-3.5 h-3.5 text-snapp"></i>وضعیت سفارش
          </h3>
          <div id="sv-tracking-stages" class="space-y-0">${renderStages(st)}</div>
        </div>
        <div class="bg-white rounded-2xl border border-gray-100 p-4">
          <div class="flex items-center gap-3 mb-3 pb-3 border-b border-gray-50">
            ${vendor ? `<img src="${esc(vendor.logo)}" class="w-10 h-10 rounded-xl object-cover border border-gray-100" onerror="this.onerror=null;this.src='${FALLBACK_IMG}';">` : ''}
            <div class="flex-1 min-w-0">
              <div class="font-black text-xs text-gray-900 truncate">${vendor ? esc(vendor.name) : 'فروشگاه'}</div>
              <div class="text-[10px] text-gray-500 mt-0.5">${t(order.items.length)} قلم کالا</div>
            </div>
          </div>
          <div class="flex justify-between items-center border-t border-gray-100 pt-3 mt-3">
            <span class="text-[11px] font-black text-gray-900">مبلغ پرداخت‌شده:</span>
            <span class="font-black text-sm text-snapp">${fp(order.grandTotal)} <span class="text-[10px] font-normal text-gray-500">تومان</span></span>
          </div>
        </div>
      </div>
      <div class="p-4 bg-white border-t border-gray-100 shrink-0 flex gap-2">
        <button onclick="SupermarketAPI.closeTracking()" class="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs py-3.5 rounded-2xl active:scale-95 transition-all">بستن</button>
      </div>
    `;
    if (window.lucide) lucide.createIcons();
  }

  function renderStages(st) {
    const stages = L.COURIER_STAGES;
    let activeIdx = 0;
    for (let i = 0; i < stages.length; i++) {
      if (st.progress >= stages[i].progressFrom) activeIdx = i;
    }

    return stages.map((s, i) => {
      const done = i < activeIdx;
      const active = i === activeIdx;
      return `
        <div class="flex gap-3 pb-4 relative last:pb-0">
          ${i < stages.length - 1 ? `<div class="absolute top-8 right-3.5 w-0.5 h-full ${done ? 'bg-emerald-400' : 'bg-gray-200'}" style="transform: translateX(50%)"></div>` : ''}
          <div class="relative z-10 shrink-0">
            <div class="w-7 h-7 rounded-full flex items-center justify-center ${
              done ? 'bg-emerald-500 text-white' :
              active ? 'bg-snapp text-white shadow-md shadow-pink-500/40' :
              'bg-gray-100 text-gray-400'
            }">
              ${done ? '<i data-lucide="check" class="w-3.5 h-3.5"></i>' : `<span class="text-xs">${s.emoji}</span>`}
            </div>
          </div>
          <div class="flex-1 min-w-0 pb-1">
            <div class="font-black text-[11px] ${active ? 'text-snapp' : done ? 'text-gray-900' : 'text-gray-400'} mb-0.5">${s.label}</div>
          </div>
        </div>
      `;
    }).join('');
  }

  function updateTrackingUI(st) {
    const progress = document.getElementById('sv-tracking-progress');
    const pct = document.getElementById('sv-tracking-progress-pct');
    const eta = document.getElementById('sv-tracking-eta');
    const stageEl = document.getElementById('sv-tracking-stage');
    const stagesHost = document.getElementById('sv-tracking-stages');

    if (progress) progress.style.width = (st.progress * 100) + '%';
    if (pct) pct.textContent = '٪' + t(Math.round(st.progress * 100));
    if (eta) eta.textContent = t(st.etaMinutes);
    if (stageEl) stageEl.textContent = st.stageLabel;
    if (stagesHost) {
      stagesHost.innerHTML = renderStages(st);
      if (window.lucide) lucide.createIcons();
    }
  }

  function closeTracking() {
    state.trackingOpen = false;
    stopTracking();
    const backdrop = document.getElementById('sv-tracking-backdrop');
    const content = document.getElementById('sv-tracking-content');
    if (!backdrop || !content) return;
    backdrop.classList.add('opacity-0', 'pointer-events-none');
    content.classList.add('translate-y-full', 'sm:scale-95');
  }

  function stopTracking() {
    if (state.activeCourier) {
      try { state.activeCourier.stop(); } catch (e) {}
      state.activeCourier = null;
    }
  }

  function bindShellEvents(view) {
    view.querySelector('#sv-back').addEventListener('click', () => {
      if (state.screen === 'vendor') {
        state.screen = 'home';
        state.activeVendorId = null;
        state.activeCategory = 'all';
        state.searchQuery = '';
        const inp = document.getElementById('sv-search-input');
        if (inp) inp.value = '';
        renderScreen();
      } else {
        closeSupermarketView();
      }
    });

    view.querySelector('#sv-cart-btn').addEventListener('click', () => openCart());

    const searchInput = view.querySelector('#sv-search-input');
    const clearBtn = view.querySelector('#sv-search-clear');

    searchInput.addEventListener('input', (e) => {
      const val = e.target.value;
      state.searchQuery = val;
      if (val.trim().length > 0) clearBtn.classList.remove('hidden');
      else clearBtn.classList.add('hidden');

      clearTimeout(state.searchDebounceTimer);
      state.searchDebounceTimer = setTimeout(() => {
        if (state.screen === 'vendor') {
          state.screen = 'home';
          state.activeVendorId = null;
        }
        renderScreen();
      }, 220);
    });

    clearBtn.addEventListener('click', () => {
      searchInput.value = '';
      state.searchQuery = '';
      clearBtn.classList.add('hidden');
      renderScreen();
      searchInput.focus();
    });

    view.querySelector('#sv-floating-btn').addEventListener('click', () => openCart());
    view.querySelector('#sv-cart-backdrop').addEventListener('click', () => closeCart());
    view.querySelector('#sv-checkout-backdrop').addEventListener('click', (e) => {
      if (e.target.id === 'sv-checkout-backdrop') closeCheckout();
    });

    view.addEventListener('click', (e) => {
      const catBtn = e.target.closest('[data-sv-cat]');
      if (catBtn) {
        const id = catBtn.dataset.svCat;
        state.activeCategory = id;
        view.querySelectorAll('[data-sv-cat]').forEach(btn => {
          const cid = btn.dataset.svCat;
          const meta = catMeta(cid);
          if (cid === id) {
            btn.className = 'sv-cat-pill shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 text-white shadow-sm';
            btn.style.background = meta.color;
          } else {
            btn.className = 'sv-cat-pill shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 bg-gray-100 text-gray-600 hover:bg-gray-200';
            btn.style.background = '';
          }
        });
        renderScreen();
      }
    });
  }

  global.SupermarketAPI = {
    openVendor(vendorId) {
      const v = L.vendorById(vendorId);
      if (!v) return;
      state.screen = 'vendor';
      state.activeVendorId = vendorId;
      state.activeCategory = 'all';
      state.sortBy = 'relevance';
      state.searchQuery = '';
      const inp = document.getElementById('sv-search-input');
      if (inp) inp.value = '';
      renderScreen();
      const main = document.getElementById('sv-main');
      if (main) main.scrollTop = 0;
    },
    goHome() {
      state.screen = 'home';
      state.activeVendorId = null;
      state.activeCategory = 'all';
      state.searchQuery = '';
      renderScreen();
    },
    setCategory(catId) { state.activeCategory = catId; renderScreen(); },
    setSort(sortId) { state.sortBy = sortId; renderScreen(); },
    clearSearch() {
      state.searchQuery = '';
      const inp = document.getElementById('sv-search-input');
      if (inp) inp.value = '';
      const clr = document.getElementById('sv-search-clear');
      if (clr) clr.classList.add('hidden');
      renderScreen();
    },
    addToCart(productId) {
      const res = L.cart.add(productId, [], 1);
      if (res.ok) {
        if (res.replacedVendor) L.notify.warning('سبد خرید از فروشگاه دیگری بود و پاک شد');
        else {
          const p = L.productById(productId);
          if (p) L.notify.cart('«' + p.title + '» به سبد اضافه شد');
        }
        const badge = document.getElementById('sv-cart-badge');
        if (badge) { badge.classList.add('sv-bump'); setTimeout(() => badge.classList.remove('sv-bump'), 220); }
      } else {
        L.notify.error('افزودن کالا به سبد ناموفق بود');
      }
    },
    decFromCart(productId) {
      const qty = L.cart.getItemQuantity(productId);
      if (qty <= 1) L.cart.remove(productId);
      else L.cart.setQty(productId, qty - 1);
    },
    openCart,
    closeCart,
    confirmClearCart() {
      if (confirm('آیا از پاک کردن سبد خرید مطمئن هستید؟')) {
        L.cart.clear();
        L.notify.info('سبد خرید پاک شد');
      }
    },
    applyCoupon() {
      const input = document.getElementById('sv-coupon-input');
      const msg = document.getElementById('sv-coupon-msg');
      if (!input || !msg) return;
      const code = input.value.trim().toUpperCase();
      const result = L.coupons.evaluate(code, L.cart);
      msg.classList.remove('hidden');
      if (result.ok) {
        L.cart.state.couponCode = result.code;
        msg.textContent = '✓ ' + (result.title || 'کد تخفیف اعمال شد');
        msg.className = 'text-[10px] font-bold mt-1.5 text-emerald-600';
        L.notify.success('کد تخفیف اعمال شد');
        renderCartContent();
        syncCartUI();
      } else {
        msg.textContent = result.errorLabel || 'کد نامعتبر است';
        msg.className = 'text-[10px] font-bold mt-1.5 text-rose-500';
      }
    },
    removeCoupon() {
      L.cart.state.couponCode = null;
      L.cart._emit('coupon-removed');
      renderCartContent();
      syncCartUI();
    },
    openCheckout,
    closeCheckout,
    setPaymentMethod(method) {
      if (state.checkoutDraft) { state.checkoutDraft.paymentMethod = method; renderCheckoutContent(); }
    },
    setDeliveryMode(mode) {
      if (state.checkoutDraft) {
        state.checkoutDraft.deliveryMode = mode;
        L.cart.setDeliveryMode(mode);
        renderCheckoutContent();
      }
    },
    commitCheckout() {
      const addrInput = document.getElementById('sv-address-input');
      const notesInput = document.getElementById('sv-notes-input');
      if (addrInput && state.checkoutDraft) state.checkoutDraft.address = addrInput.value.trim();
      if (notesInput && state.checkoutDraft) state.checkoutDraft.notes = notesInput.value.trim();

      if (!state.checkoutDraft || !state.checkoutDraft.address) {
        L.notify.warning('لطفاً نشانی تحویل را وارد کنید');
        return;
      }
      L.cart.state.notes = state.checkoutDraft.notes;
      const prepared = L.Store.checkout.prepare(L.cart, { paymentMethod: state.checkoutDraft.paymentMethod });
      if (!prepared.ready) { L.notify.error('سفارش قابل پردازش نیست'); return; }
      if (state.checkoutDraft.paymentMethod === 'wallet') {
        const wallet = L.Store.user.get('walletBalance');
        if (wallet < prepared.summary.grandTotal) {
          L.notify.error('موجودی کیف پول کافی نیست.');
          return;
        }
      }
      const finish = () => {
        const result = L.Store.checkout.commit(L.cart, prepared);
        if (result.ok) {
          closeCheckout();
          closeCart();
          setTimeout(() => L.notify.success('پرداخت با موفقیت انجام شد.'), 200);
          setTimeout(() => startTracking(result.order), 700);
        } else L.notify.error('ثبت سفارش ناموفق بود');
      };
      if (state.checkoutDraft.paymentMethod === 'gateway') {
        L.notify.info('در حال اتصال به درگاه پرداخت...');
        setTimeout(finish, 900);
      } else finish();
    },
    closeTracking,
    fakeCallCourier() { L.notify.info('در حال برقراری تماس با پیک...'); },
    fakeChatCourier() { L.notify.info('چت با پیک به‌زودی'); },
    topUpWallet(amount) { return L.Store.user.incrementWallet(amount || 500000); },
    open3D(productId) { open3DView(productId); }
  };

  global.SupermarketView = {
    open: openSupermarketView,
    close: closeSupermarketView,
    isOpen: () => state.mounted
  };

  global.openSupermarketView = openSupermarketView;
  global.closeSupermarketView = closeSupermarketView;

  console.log('[SupermarketView] Loaded ✓');

})(typeof window !== 'undefined' ? window : this);