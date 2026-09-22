import * as THREE from 'three';

import {
    M,
    cachedGeometry,
    cachedMaterial,
    createBunBase,
    createBunCrown,
    createPatty,
    createCheeseDrape,
    createLettuceRuffle,
    createTomatoSlice,
    createOnionRings,
    createPickleSlices,
    createJalapenoRings,
    createSauceLayer,
    createMushroomGroup,
    createChickenFillet,
    createBaguetteBottom,
    createBaguetteTop,
    createSausageDisc,
    createParsleyFlakes,
    createPizzaCrust,
    createPepperoniCups,
    createBasilLeaves,
    createBellPepperRings,
    createOliveRings,
    createPlatter,
    createRiceBed,
    createKebabSkewerGrooves,
    createKebabGroup,
    createRoastedTomato,
    createButterSlab,
    createCeramicBowl,
    createBrothSurface,
    createKashkSpiral,
    createGarnishScatter,
    createBarberryScatter,
    createFriesStack,
    createWingsGroup,
    createMozzarellaSticks,
    createGarlicBreadSlice,
    createGlassCup,
    createIceCubes,
    createLiquidColumn,
    createStraw,
    createLimeWheel,
    createMintSprig,
    createCanCylinder,
    createCakeSlice,
    createCheesecakeSlice,
    createBaklavaStack,
    createCroissant,
    createShamiPatty,
    createTahchinCake,
    attachOverheadFillLight,
    clearGeometryCache,
    disposeDishGroup
} from './procedural-food-generator_2.js';

function hashSeed(id) {
    let h = 2166136261 >>> 0;
    const str = String(id);
    for (let i = 0; i < str.length; i++) {
        h ^= str.charCodeAt(i);
        h = Math.imul(h, 16777619);
    }
    return h >>> 0;
}

function mulberry32(a) {
    return function () {
        a |= 0;
        a = a + 0x6D2B79F5 | 0;
        let t = Math.imul(a ^ a >>> 15, 1 | a);
        t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
}

function makeRng(product) {
    const seed = hashSeed(product.id || product.title || 'loghme');
    return mulberry32(seed);
}

function buildBurgerLayers(product, seed, subtype) {
    let protein = 'classicPatty';
    if (subtype === 'crispyChicken') protein = 'crispyChicken';
    else if (subtype === 'doubleSmash') protein = 'doubleSmash';
    else if (subtype === 'vegan') protein = 'vegan';
    else if (subtype === 'bandari') protein = 'bandari';
    else if (subtype === 'thickSirloin') protein = 'thickSirloin';
    else {
        const pool = ['classicPatty', 'doubleSmash', 'classicPatty', 'thickSirloin'];
        protein = pool[hashSeed(product.id + '-p') % pool.length];
    }

    const buns = ['brioche', 'potatoRoll', 'pretzel', 'ciabatta'];
    const bun = subtype === 'bandari' ? 'potatoRoll' : buns[hashSeed(product.id + '-b') % buns.length];

    const layers = [];

    let bottomBun;
    if (bun === 'brioche') bottomBun = createBunBase(2.0, 0.6, M.brioche, seed);
    else if (bun === 'potatoRoll') bottomBun = createBunBase(1.95, 0.5, M.potatoRoll, seed);
    else if (bun === 'pretzel') bottomBun = createBunBase(1.95, 0.6, M.pretzel, seed);
    else bottomBun = createBunBase(2.0, 0.5, M.ciabatta, seed);

    layers.push({
        mesh: bottomBun,
        closedY: -0.9,
        openY: -4.2,
        text: bun === 'brioche' ? 'نان بریوش تست‌شده' :
              bun === 'potatoRoll' ? 'نان پوتیتو رول کره‌ای' :
              bun === 'pretzel' ? 'نان پرتزل نمکی' :
              'نان چاباتا ایتالیایی',
        side: 'right'
    });

    if (protein === 'classicPatty') {
        layers.push({
            mesh: createPatty(2.05, 0.75, M.patty),
            closedY: -0.25,
            openY: -1.8,
            text: 'پتی گوشت ۱۰۰٪ گوساله',
            side: 'left'
        });
    } else if (protein === 'doubleSmash') {
        const g = new THREE.Group();
        const p1 = createPatty(2.3, 0.25, M.patty);
        const p2 = createPatty(2.3, 0.25, M.patty);
        p1.position.y = -0.15;
        p2.position.y = 0.15;
        g.add(p1, p2);
        layers.push({
            mesh: g,
            closedY: -0.25,
            openY: -1.8,
            text: 'دو پتی اسمش‌شده گوشت',
            side: 'left'
        });
    } else if (protein === 'thickSirloin') {
        layers.push({
            mesh: createPatty(2.1, 0.95, M.pattyThick),
            closedY: -0.25,
            openY: -2.1,
            text: 'پتی ضخیم راسته گوساله',
            side: 'left'
        });
    } else if (protein === 'crispyChicken') {
        layers.push({
            mesh: createChickenFillet(seed),
            closedY: -0.25,
            openY: -1.9,
            text: 'فیله مرغ سوخاری کریسپی',
            side: 'left'
        });
    } else if (protein === 'vegan') {
        layers.push({
            mesh: createPatty(2.05, 0.75, M.pattyVegan),
            closedY: -0.25,
            openY: -1.8,
            text: 'پتی گیاهی وگان',
            side: 'left'
        });
    } else {
        const g = new THREE.Group();
        g.add(createBunBase(1.9, 0.5, M.baguette, seed));
        g.add(createSausageDisc(10, seed));
        layers.push({
            mesh: g,
            closedY: -0.25,
            openY: -1.8,
            text: 'سوسیس بندری تفت‌خورده',
            side: 'left'
        });
    }

    const cheeses = ['cheddar', 'gouda', 'swiss', 'blueCheese'];
    const cheese = subtype === 'bandari' ? 'cheddar' : cheeses[hashSeed(product.id + '-c') % cheeses.length];
    const cheeseMatFn = cheese === 'cheddar' ? M.cheddar :
                        cheese === 'gouda' ? M.gouda :
                        cheese === 'swiss' ? M.swiss : M.blueCheese;
    const cheeseText = cheese === 'cheddar' ? 'پنیر چدار ذوب‌شده' :
                       cheese === 'gouda' ? 'پنیر گودا کش‌دار' :
                       cheese === 'swiss' ? 'پنیر سوئیسی آب‌شده' : 'پنیر بلوچیز تند';
    layers.push({
        mesh: createCheeseDrape(3.6, 0.08, cheeseMatFn, Math.PI / 4),
        closedY: 0.1,
        openY: 0.5,
        text: cheeseText,
        side: 'right'
    });

    const veggie = hashSeed(product.id + '-v') % 4;
    if (veggie === 0) {
        const g = new THREE.Group();
        g.add(createLettuceRuffle(2.7, M.lettuce));
        const t1 = createTomatoSlice(1.1, 0.2);
        t1.position.set(-0.65, 0.2, -0.2);
        const t2 = createTomatoSlice(1.1, 0.2);
        t2.position.set(0.65, 0.2, 0.2);
        g.add(t1, t2);
        layers.push({
            mesh: g,
            closedY: 0.3,
            openY: 2.4,
            text: 'کاهو پیچ و گوجه‌فرنگی',
            side: 'left'
        });
    } else if (veggie === 1) {
        layers.push({
            mesh: createOnionRings(8, seed),
            closedY: 0.3,
            openY: 2.2,
            text: 'حلقه‌های پیاز کاراملی',
            side: 'left'
        });
    } else if (veggie === 2) {
        layers.push({
            mesh: createPickleSlices(10, seed),
            closedY: 0.3,
            openY: 2.0,
            text: 'خیارشور ترد ورقه‌ای',
            side: 'left'
        });
    } else {
        layers.push({
            mesh: createJalapenoRings(10, seed),
            closedY: 0.3,
            openY: 2.2,
            text: 'حلقه‌های هالوپینو تند',
            side: 'left'
        });
    }

    const sauces = ['truffleMayo', 'bbq', 'mustard'];
    const sauce = sauces[hashSeed(product.id + '-s') % sauces.length];
    const sauceMatFn = sauce === 'truffleMayo' ? M.truffleMayo :
                       sauce === 'bbq' ? M.bbq : M.mustard;
    const sauceText = sauce === 'truffleMayo' ? 'سس مایونز ترافل' :
                      sauce === 'bbq' ? 'سس باربیکیو دودی' : 'سس خردل تند';
    layers.push({
        mesh: createSauceLayer(1.9, 0.06, sauceMatFn, seed),
        closedY: 0.42,
        openY: 3.2,
        text: sauceText,
        side: 'right'
    });

    let crownMatFn;
    if (bun === 'brioche') crownMatFn = M.brioche;
    else if (bun === 'potatoRoll') crownMatFn = M.potatoRoll;
    else if (bun === 'pretzel') crownMatFn = M.pretzel;
    else crownMatFn = M.ciabatta;

    const toppings = ['sesame', 'sesame', 'poppy', 'everything', 'none'];
    const topping = toppings[hashSeed(product.id + '-t') % toppings.length];

    layers.push({
        mesh: createBunCrown(2.05, crownMatFn, seed, topping),
        closedY: 0.55,
        openY: 5.0,
        text: topping === 'sesame' ? 'نان کنجدی تاج' :
              topping === 'poppy' ? 'نان خشخاشی تاج' :
              topping === 'salt' ? 'نان نمکی دریا تاج' :
              topping === 'everything' ? 'نان تاپینگ مخلوط' :
              'نان تاج ساده',
        side: 'right'
    });

    return layers;
}

function buildPizzaLayers(product, seed, subtype) {
    const layers = [];

    const crustStyles = ['neapolitan', 'neapolitan', 'thin', 'deep'];
    const crust = crustStyles[hashSeed(product.id + '-cr') % crustStyles.length];

    layers.push({
        mesh: createPizzaCrust(crust),
        closedY: -0.6,
        openY: -4.0,
        text: crust === 'neapolitan' ? 'خمیر ناپلی پفکی' :
              crust === 'thin' ? 'خمیر نازک رومی' :
              'خمیر ضخیم دیترویت',
        side: 'right'
    });

    let sauce = 'marinara';
    if (subtype === 'fourCheese') sauce = 'alfredo';
    else if (subtype === 'veggie') sauce = 'pesto';
    const sauceMatFn = sauce === 'marinara' ? M.marinara :
                       sauce === 'pesto' ? M.pesto : M.alfredo;
    const sauceText = sauce === 'marinara' ? 'سس مارینارای سن‌مارزانو' :
                      sauce === 'pesto' ? 'سس پستو جنوایی' :
                      'سس آلفردو خامه‌ای';
    layers.push({
        mesh: createSauceLayer(2.95, 0.12, sauceMatFn, seed),
        closedY: -0.55,
        openY: -1.5,
        text: sauceText,
        side: 'left'
    });

    layers.push({
        mesh: createSauceLayer(2.8, 0.16, M.mozzarella, seed),
        closedY: -0.5,
        openY: 0.8,
        text: 'پنیر موزارلا کش‌دار',
        side: 'right'
    });

    if (subtype === 'pepperoni') {
        layers.push({
            mesh: createPepperoniCups(20, seed),
            closedY: -0.35,
            openY: 3.2,
            text: 'ورقه‌های پپرونی کاسه‌ای',
            side: 'left'
        });
    } else if (subtype === 'veggie') {
        const g = new THREE.Group();
        g.add(createMushroomGroup(12, seed));
        g.add(createBellPepperRings(10, seed));
        g.add(createOliveRings(8, seed));
        layers.push({
            mesh: g,
            closedY: -0.35,
            openY: 3.2,
            text: 'قارچ، فلفل دلمه و زیتون',
            side: 'left'
        });
    } else if (subtype === 'fourCheese') {
        const g = new THREE.Group();
        g.add(createMushroomGroup(6, seed));
        g.add(createOliveRings(6, seed));
        layers.push({
            mesh: g,
            closedY: -0.35,
            openY: 3.2,
            text: 'چهار پنیر ممتاز ایتالیایی',
            side: 'left'
        });
    } else {
        const g = new THREE.Group();
        g.add(createPepperoniCups(10, seed));
        g.add(createBellPepperRings(6, seed));
        layers.push({
            mesh: g,
            closedY: -0.35,
            openY: 3.4,
            text: 'تاپینگ مخصوص پیتزا',
            side: 'left'
        });
    }

    layers.push({
        mesh: createBasilLeaves(10, seed),
        closedY: -0.2,
        openY: 5.0,
        text: 'برگ ریحان تازه جنوا',
        side: 'right'
    });

    return layers;
}

function buildKebabLayers(product, seed, subtype) {
    const layers = [];

    const platterShapes = ['round', 'round', 'oval'];
    const platterShape = platterShapes[hashSeed(product.id + '-pl') % platterShapes.length];

    layers.push({
        mesh: createPlatter(platterShape, M.porcelain),
        closedY: -0.8,
        openY: -4.5,
        text: 'دیس چینی دست‌ساز',
        side: 'right'
    });

    const riceMatFn = subtype === 'rice' ? M.riceSaffron : M.rice;
    const riceText = subtype === 'rice' ? 'چلوی زعفرانی خالص' : 'چلوی ایرانی ساده';
    const rice = createRiceBed(riceMatFn, 2.0, seed);
    rice.position.set(-0.8, 0.05, 0);
    layers.push({
        mesh: rice,
        closedY: -0.7,
        openY: -1.5,
        text: riceText,
        side: 'left'
    });

    let skewerType = 'koobideh';
    let meatMat = M.kebabMeat;
    let kebabText = 'دو سیخ کباب کوبیده مخصوص';

    if (subtype === 'joojeh') {
        skewerType = 'joojeh';
        meatMat = M.chickenMeat;
        kebabText = 'دو سیخ جوجه کباب زعفرانی';
    } else if (subtype === 'chenjeh') {
        skewerType = 'chenjeh';
        kebabText = 'دو سیخ کباب چنجه گوساله';
    } else if (subtype === 'shishlik') {
        skewerType = 'shishlik';
        kebabText = 'دو سیخ شیشلیک دنده ممتاز';
    } else if (subtype === 'barg') {
        skewerType = 'barg';
        kebabText = 'دو سیخ کباب برگ راسته اعلا';
    } else if (subtype === 'kebab') {
        const pool = ['koobideh', 'joojeh', 'chenjeh', 'koobideh'];
        skewerType = pool[hashSeed(product.id + '-k') % pool.length];
        if (skewerType === 'joojeh') { meatMat = M.chickenMeat; kebabText = 'دو سیخ جوجه کباب زعفرانی'; }
        else if (skewerType === 'chenjeh') kebabText = 'دو سیخ کباب چنجه گوساله';
        else kebabText = 'دو سیخ کباب کوبیده مخصوص';
    }

    layers.push({
        mesh: createKebabGroup(skewerType, meatMat, seed),
        closedY: -0.55,
        openY: 1.0,
        text: kebabText,
        side: 'right'
    });

    const g = new THREE.Group();
    const t1 = createRoastedTomato(seed);
    t1.position.set(2.4, 0.2, 0.6);
    g.add(t1);
    const pepperRing = new THREE.Mesh(
        cachedGeometry('roasted-pepper', () => new THREE.TorusGeometry(0.3, 0.1, 12, 32)),
        M.bellPepper()
    );
    pepperRing.position.set(2.5, 0.2, -0.5);
    pepperRing.rotation.x = Math.PI / 2;
    g.add(pepperRing);
    layers.push({
        mesh: g,
        closedY: -0.55,
        openY: 3.5,
        text: 'گوجه و فلفل کبابی ذغالی',
        side: 'left'
    });

    const butter = createButterSlab();
    butter.position.set(-0.8, 0.75, 0);
    layers.push({
        mesh: butter,
        closedY: -0.45,
        openY: 5.5,
        text: 'کره محلی و سماق اعلا',
        side: 'right'
    });

    return layers;
}

function buildShamiLayers(product, seed) {
    const layers = [];

    layers.push({
        mesh: createPlatter('round', M.copper),
        closedY: -0.85,
        openY: -4.5,
        text: 'دیس مسی سنتی',
        side: 'right'
    });

    const rice = createRiceBed(M.riceSaffron, 2.0, seed);
    rice.position.set(-0.8, 0.05, 0);
    layers.push({
        mesh: rice,
        closedY: -0.7,
        openY: -1.5,
        text: 'چلوی زعفرانی خوش‌عطر',
        side: 'left'
    });

    const patties = new THREE.Group();
    for (let i = 0; i < 4; i++) {
        const p = createShamiPatty(seed);
        p.position.set(
            (i % 2 === 0 ? -0.6 : 0.6) + (seed() - 0.5) * 0.3,
            0.1,
            (i < 2 ? -0.6 : 0.6) + (seed() - 0.5) * 0.3
        );
        p.rotation.y = seed() * Math.PI;
        patties.add(p);
    }
    layers.push({
        mesh: patties,
        closedY: -0.5,
        openY: 1.2,
        text: 'شامی کباب خانگی سرخ‌شده',
        side: 'right'
    });

    const garnish = new THREE.Group();
    const tomato = createRoastedTomato(seed);
    tomato.position.set(1.8, 0.2, 0.5);
    garnish.add(tomato);
    const peppers = createGarnishScatter(15, M.bellPepper, seed, 0.12);
    peppers.position.set(0, 0.25, 0);
    garnish.add(peppers);
    layers.push({
        mesh: garnish,
        closedY: -0.4,
        openY: 3.5,
        text: 'گوجه کبابی و فلفل رنگین',
        side: 'left'
    });

    const barberries = createBarberryScatter(30, seed);
    barberries.position.set(-0.8, 0.4, 0);
    layers.push({
        mesh: barberries,
        closedY: -0.35,
        openY: 5.2,
        text: 'زرشک اعلا و خلال پسته',
        side: 'right'
    });

    return layers;
}

function buildTahchinLayers(product, seed) {
    const layers = [];

    layers.push({
        mesh: createPlatter('round', M.porcelain),
        closedY: -0.8,
        openY: -4.5,
        text: 'دیس چینی مخصوص ته‌چین',
        side: 'right'
    });

    const tahchin = createTahchinCake();
    tahchin.position.set(0, -0.2, 0);
    layers.push({
        mesh: tahchin,
        closedY: -0.4,
        openY: 0.6,
        text: 'ته‌چین زعفرانی طلایی',
        side: 'left'
    });

    const chicken = new THREE.Group();
    for (let i = 0; i < 6; i++) {
        const fillet = new THREE.Mesh(
            cachedGeometry('chicken-strip', () => new THREE.BoxGeometry(0.6, 0.15, 0.25)),
            M.chickenMeat()
        );
        const a = (i / 6) * Math.PI * 2;
        fillet.position.set(Math.cos(a) * 1.4, 0.35, Math.sin(a) * 1.4);
        fillet.rotation.y = a;
        fillet.castShadow = true;
        chicken.add(fillet);
    }
    layers.push({
        mesh: chicken,
        closedY: -0.15,
        openY: 2.5,
        text: 'مرغ ریش‌ریش زعفرانی',
        side: 'right'
    });

    const barberries = createBarberryScatter(40, seed);
    barberries.position.set(0, 0.55, 0);
    layers.push({
        mesh: barberries,
        closedY: 0.0,
        openY: 4.5,
        text: 'زرشک تازه و خلال پسته',
        side: 'left'
    });

    const yogurt = new THREE.Mesh(
        cachedGeometry('yogurt-bowl', () => new THREE.CylinderGeometry(0.5, 0.45, 0.4, 40)),
        M.porcelain()
    );
    yogurt.position.set(2.2, 0.2, 0);
    layers.push({
        mesh: yogurt,
        closedY: 0.3,
        openY: 5.5,
        text: 'ماست چکیده کنار غذا',
        side: 'right'
    });

    return layers;
}

function buildStewLayers(product, seed, subtype) {
    const layers = [];

    const bowlMatFn = subtype === 'halim' ? M.ceramicClay : M.ceramicBlue;

    layers.push({
        mesh: createCeramicBowl(bowlMatFn),
        closedY: -1.5,
        openY: -4.5,
        text: subtype === 'halim' ? 'کاسه سفالی سنتی' : 'کاسه سفالی لعاب فیروزه‌ای',
        side: 'right'
    });

    let brothMatFn, brothText;
    if (subtype === 'halim') {
        brothMatFn = M.brothCream;
        brothText = 'حلیم گندم و گوشت گوسفندی';
    } else if (subtype === 'ashDoogh') {
        brothMatFn = M.brothCream;
        brothText = 'آش دوغ تبریزی خنک';
    } else if (subtype === 'ashShole') {
        brothMatFn = M.brothCream;
        brothText = 'آش شله قلمکار غلیظ';
    } else if (subtype === 'reshteh') {
        brothMatFn = M.brothGreen;
        brothText = 'آش رشته سبزی کوهی';
    } else if (subtype === 'jo') {
        brothMatFn = M.brothYellow;
        brothText = 'آش جو سنتی';
    } else if (subtype === 'stew') {
        if (/قیمه/.test(product.title)) { brothMatFn = M.brothYellow; brothText = 'خورش قیمه بادمجان'; }
        else if (/فسنجان/.test(product.title)) { brothMatFn = M.brothRed; brothText = 'خورش فسنجان اعلا'; }
        else if (/قورمه/.test(product.title)) { brothMatFn = M.brothGreen; brothText = 'خورش قورمه سبزی'; }
        else if (/کرفس/.test(product.title)) { brothMatFn = M.brothGreen; brothText = 'خورش کرفس خوش‌عطر'; }
        else { brothMatFn = M.brothYellow; brothText = 'خورش سنتی ایرانی'; }
    } else {
        brothMatFn = M.brothGreen;
        brothText = 'آش رشته سنتی';
    }

    layers.push({
        mesh: createBrothSurface(2.45, brothMatFn),
        closedY: 0.2,
        openY: -1.0,
        text: brothText,
        side: 'left'
    });

    if (subtype === 'reshteh' || subtype === 'stew' || subtype === 'halim') {
        layers.push({
            mesh: createKashkSpiral(),
            closedY: 0.25,
            openY: 2.0,
            text: subtype === 'halim' ? 'روغن کرمانشاهی و دارچین' : 'کشک زعفرانی سنتی',
            side: 'right'
        });
    }

    if (subtype !== 'halim') {
        const g = createGarnishScatter(50, M.mintDagh, seed, 0.1);
        g.position.y = 0.28;
        layers.push({
            mesh: g,
            closedY: 0.28,
            openY: 4.0,
            text: 'نعناداغ برشته',
            side: 'left'
        });
    }

    const onions = createGarnishScatter(40, M.crispOnion, seed, 0.12);
    onions.position.y = 0.3;
    layers.push({
        mesh: onions,
        closedY: 0.3,
        openY: 5.0,
        text: 'پیازداغ ترد طلایی',
        side: 'right'
    });

    if (subtype !== 'halim') {
        const barberries = createBarberryScatter(40, seed);
        barberries.position.y = 0.32;
        layers.push({
            mesh: barberries,
            closedY: 0.32,
            openY: 5.5,
            text: 'زرشک اعلا و خلال',
            side: 'left'
        });
    }

    return layers;
}

function buildSandwichLayers(product, seed, subtype) {
    const layers = [];

    if (subtype === 'baguette' || subtype === 'bagnette') {
        layers.push({
            mesh: createBaguetteBottom(),
            closedY: -0.85,
            openY: -4.0,
            text: 'نان باگت فرانسوی',
            side: 'right'
        });
        layers.push({
            mesh: createSausageDisc(14, seed),
            closedY: -0.3,
            openY: -1.6,
            text: 'گوشت رست بیف مخصوص',
            side: 'left'
        });
        const greens = new THREE.Group();
        greens.add(createPickleSlices(12, seed));
        greens.add(createParsleyFlakes(30, seed));
        layers.push({
            mesh: greens,
            closedY: -0.05,
            openY: 1.2,
            text: 'خیارشور و جعفری ساطوری',
            side: 'left'
        });
        layers.push({
            mesh: createSauceLayer(1.5, 0.08, M.marinara, seed),
            closedY: 0.15,
            openY: 2.8,
            text: 'سس مخصوص باگت',
            side: 'right'
        });
        layers.push({
            mesh: createBaguetteTop(),
            closedY: 0.55,
            openY: 5.2,
            text: 'تاج باگت کنجدی',
            side: 'right'
        });
        return layers;
    }

    if (subtype === 'bndari') {
        layers.push({
            mesh: createBaguetteBottom(),
            closedY: -0.85,
            openY: -4.0,
            text: 'نان باگت فرانسوی',
            side: 'right'
        });
        layers.push({
            mesh: createSausageDisc(16, seed),
            closedY: -0.3,
            openY: -1.6,
            text: 'سوسیس بندری در رب گوجه',
            side: 'left'
        });
        const greens = new THREE.Group();
        greens.add(createPickleSlices(10, seed));
        greens.add(createParsleyFlakes(25, seed));
        layers.push({
            mesh: greens,
            closedY: -0.05,
            openY: 1.2,
            text: 'خیارشور و جعفری ساطوری',
            side: 'left'
        });
        layers.push({
            mesh: createSauceLayer(1.5, 0.08, M.marinara, seed),
            closedY: 0.15,
            openY: 2.8,
            text: 'سس بندری تند و پُرادویه',
            side: 'right'
        });
        layers.push({
            mesh: createBaguetteTop(),
            closedY: 0.55,
            openY: 5.2,
            text: 'تاج باگت کنجدی',
            side: 'right'
        });
        return layers;
    }

    if (subtype === 'hotdog') {
        layers.push({
            mesh: createBunBase(1.6, 0.6, M.potatoRoll, seed),
            closedY: -0.8,
            openY: -4.0,
            text: 'نان هات‌داگ مخصوص',
            side: 'right'
        });
        const sausage = createKebabGroup('koobideh', M.sausage, seed);
        sausage.scale.set(0.6, 0.9, 0.9);
        layers.push({
            mesh: sausage,
            closedY: -0.2,
            openY: -1.0,
            text: 'سوسیس ۷۰٪ گوشت تنوری',
            side: 'left'
        });
        layers.push({
            mesh: createCheeseDrape(2.4, 0.08, M.cheddar, 0),
            closedY: 0.15,
            openY: 1.5,
            text: 'پنیر چدار ذوب‌شده',
            side: 'right'
        });
        layers.push({
            mesh: createOnionRings(6, seed),
            closedY: 0.35,
            openY: 3.0,
            text: 'پیاز سوخاری ترد',
            side: 'left'
        });
        layers.push({
            mesh: createSauceLayer(1.2, 0.06, M.mustard, seed),
            closedY: 0.5,
            openY: 4.5,
            text: 'سس خردل و کچاپ',
            side: 'right'
        });
        return layers;
    }

    if (subtype === 'coldSandwich') {
        layers.push({
            mesh: createBunBase(2.0, 0.5, M.potatoRoll, seed),
            closedY: -0.85,
            openY: -4.0,
            text: 'نان ساندویچی نرم',
            side: 'right'
        });
        const deli = new THREE.Group();
        for (let i = 0; i < 6; i++) {
            const slice = new THREE.Mesh(
                cachedGeometry('deli-slice', () => new THREE.BoxGeometry(2.6, 0.06, 1.4)),
                cachedMaterial('deliMeat', () => new THREE.MeshPhysicalMaterial({
                    color: 0xc98a6a,
                    roughness: 0.5,
                    clearcoat: 0.3,
                    clearcoatRoughness: 0.25,
                    sheen: 0.35,
                    sheenColor: new THREE.Color(0xffb090)
                }))
            );
            slice.position.y = -0.3 + i * 0.08;
            slice.rotation.z = (seed() - 0.5) * 0.15;
            deli.add(slice);
        }
        layers.push({
            mesh: deli,
            closedY: -0.2,
            openY: -1.4,
            text: 'ژامبون گوشت و مرغ تنوری',
            side: 'left'
        });
        layers.push({
            mesh: createLettuceRuffle(2.4, M.lettuce),
            closedY: 0.15,
            openY: 1.5,
            text: 'کاهو و گوجه تازه',
            side: 'left'
        });
        layers.push({
            mesh: createSauceLayer(1.9, 0.07, M.truffleMayo, seed),
            closedY: 0.35,
            openY: 3.2,
            text: 'سس مایونز فراوان',
            side: 'right'
        });
        layers.push({
            mesh: createBunCrown(1.95, M.potatoRoll, seed, 'none'),
            closedY: 0.55,
            openY: 4.8,
            text: 'نان ساندویچی تاج',
            side: 'right'
        });
        return layers;
    }

    if (subtype === 'chickenSandwich') {
        layers.push({
            mesh: createBunBase(2.0, 0.55, M.potatoRoll, seed),
            closedY: -0.9,
            openY: -4.2,
            text: 'نان ساندویچی نرم',
            side: 'right'
        });
        layers.push({
            mesh: createChickenFillet(seed),
            closedY: -0.3,
            openY: -1.6,
            text: 'فیله مرغ سوخاری اسپایسی',
            side: 'left'
        });
        layers.push({
            mesh: createLettuceRuffle(2.5, M.lettuce),
            closedY: 0.15,
            openY: 1.5,
            text: 'کاهو پیچ تازه و گوجه',
            side: 'left'
        });
        layers.push({
            mesh: createSauceLayer(1.9, 0.07, M.mustard, seed),
            closedY: 0.35,
            openY: 3.0,
            text: 'سس تند فرانسوی',
            side: 'right'
        });
        layers.push({
            mesh: createBunCrown(1.95, M.potatoRoll, seed, 'sesame'),
            closedY: 0.55,
            openY: 4.8,
            text: 'نان ساندویچی تاج',
            side: 'right'
        });
        return layers;
    }

    layers.push({
        mesh: createBaguetteBottom(),
        closedY: -0.85,
        openY: -4.0,
        text: 'نان باگت فرانسوی',
        side: 'right'
    });
    layers.push({
        mesh: createSausageDisc(14, seed),
        closedY: -0.3,
        openY: -1.6,
        text: 'گوشت ساندویچی مخصوص',
        side: 'left'
    });
    const greens = new THREE.Group();
    greens.add(createPickleSlices(10, seed));
    greens.add(createParsleyFlakes(25, seed));
    layers.push({
        mesh: greens,
        closedY: -0.05,
        openY: 1.2,
        text: 'خیارشور و جعفری ساطوری',
        side: 'left'
    });
    layers.push({
        mesh: createSauceLayer(1.5, 0.08, M.truffleMayo, seed),
        closedY: 0.15,
        openY: 2.8,
        text: 'سس مخصوص ساندویچ',
        side: 'right'
    });
    layers.push({
        mesh: createBaguetteTop(),
        closedY: 0.55,
        openY: 5.2,
        text: 'تاج باگت کنجدی',
        side: 'right'
    });
    return layers;
}

function buildAppetizerLayers(product, seed, subtype) {
    const layers = [];

    if (subtype === 'wings') {
        layers.push({
            mesh: createPlatter('oval', M.porcelain),
            closedY: -0.85,
            openY: -4.2,
            text: 'دیس سرامیکی سرو',
            side: 'right'
        });
        layers.push({
            mesh: createWingsGroup(8, seed, /گلیز|بوفالو|تند/.test(product.title)),
            closedY: -0.3,
            openY: 0.5,
            text: /گلیز|بوفالو|تند/.test(product.title) ? 'بال‌های گلیز شده بوفالو' : 'بال کبابی ساده',
            side: 'left'
        });
        const dip = new THREE.Mesh(
            cachedGeometry('dip-bowl', () => new THREE.CylinderGeometry(0.6, 0.5, 0.35, 40)),
            M.porcelain()
        );
        dip.position.set(2.2, 0.2, 0);
        layers.push({
            mesh: dip,
            closedY: 0.1,
            openY: 3.0,
            text: 'سس دیپ مخصوص',
            side: 'right'
        });
        return layers;
    }

    if (subtype === 'garlicBread') {
        layers.push({
            mesh: createPlatter('rect', M.parchment),
            closedY: -0.7,
            openY: -4.0,
            text: 'کاغذ سرو مخصوص',
            side: 'right'
        });
        for (let i = 0; i < 3; i++) {
            const slice = createGarlicBreadSlice();
            slice.position.set(0, i * 0.4 - 0.2, 0);
            layers.push({
                mesh: slice,
                closedY: -0.1 + i * 0.35,
                openY: 1.5 + i * 1.2,
                text: i === 0 ? 'نان سیر تنوری با پارمزان' :
                      i === 1 ? 'کره سیر تازه' :
                      'جعفری خرد شده',
                side: i % 2 === 0 ? 'left' : 'right'
            });
        }
        return layers;
    }

    if (subtype === 'mozzSticks') {
        layers.push({
            mesh: createPlatter('rect', M.parchment),
            closedY: -0.75,
            openY: -4.0,
            text: 'کاغذ سرو مخصوص',
            side: 'right'
        });
        layers.push({
            mesh: createMozzarellaSticks(6, seed),
            closedY: -0.3,
            openY: 1.2,
            text: 'استیکس موزارلا کش‌دار',
            side: 'left'
        });
        const dip = new THREE.Mesh(
            cachedGeometry('dip-bowl', () => new THREE.CylinderGeometry(0.6, 0.5, 0.35, 40)),
            M.porcelain()
        );
        dip.position.set(2.2, 0.2, 0);
        layers.push({
            mesh: dip,
            closedY: 0.1,
            openY: 3.5,
            text: 'سس مارینارای گرم',
            side: 'right'
        });
        return layers;
    }

    layers.push({
        mesh: createPlatter('rect', M.parchment),
        closedY: -1.0,
        openY: -4.0,
        text: 'کاغذ سرو مخصوص',
        side: 'right'
    });

    let friesStyle = 'straight';
    if (/چیپسی|موج/.test(product.title)) friesStyle = 'crinkle';
    else if (/قاچی|وج|گوه/.test(product.title)) friesStyle = 'wedge';

    const friesText = friesStyle === 'crinkle' ? 'سیب‌زمینی چیپسی موج‌دار' :
                      friesStyle === 'wedge' ? 'سیب‌زمینی قاچی تنوری' :
                      'سیب‌زمینی بلژیکی ترد';
    layers.push({
        mesh: createFriesStack(40, seed, friesStyle),
        closedY: -0.5,
        openY: -1.0,
        text: friesText,
        side: 'left'
    });

    const cheeseSauce = new THREE.Mesh(
        cachedGeometry('cheese-drizzle', () => new THREE.TorusKnotGeometry(1.2, 0.12, 128, 20, 3, 5)),
        M.cheddar()
    );
    cheeseSauce.rotation.x = Math.PI / 2;
    cheeseSauce.scale.set(1, 1, 0.3);
    layers.push({
        mesh: cheeseSauce,
        closedY: 0.8,
        openY: 2.0,
        text: 'دیپ چدار گرم و غلیظ',
        side: 'right'
    });

    const bacon = createGarnishScatter(30, M.bbq, seed, 0.14);
    bacon.position.y = 1.1;
    layers.push({
        mesh: bacon,
        closedY: 1.1,
        openY: 4.5,
        text: 'بیکن سوخاری خرد شده',
        side: 'left'
    });

    return layers;
}

function buildDrinkLayers(product, seed, subtype) {
    const layers = [];

    let glassStyle = 'tall';
    let liquidMatFn = M.liquidCola;
    let liquidText = 'نوشیدنی گازدار خنک';

    if (subtype === 'soda') {
        glassStyle = 'can';
        liquidMatFn = M.liquidCola;
        liquidText = 'نوشیدنی گازدار کولا';
    } else if (subtype === 'lemonade') {
        glassStyle = 'tall';
        liquidMatFn = M.liquidSoda;
        liquidText = 'لیموناد خنک تابستانی';
    } else if (subtype === 'mint') {
        glassStyle = 'tall';
        liquidMatFn = M.liquidMint;
        liquidText = 'موهیتوی نعنا و لیمو';
    } else if (subtype === 'coffee') {
        glassStyle = 'mug';
        liquidMatFn = M.liquidCoffee;
        liquidText = 'قهوه تخصصی عربیکا';
    } else if (subtype === 'tea') {
        glassStyle = 'mug';
        liquidMatFn = M.liquidTea;
        liquidText = 'چای تازه‌دم معطر';
    } else if (subtype === 'shake') {
        glassStyle = 'tall';
        liquidMatFn = M.liquidCoffee;
        liquidText = 'شیک خامه‌ای مخصوص';
    } else if (subtype === 'juice') {
        glassStyle = 'tall';
        liquidMatFn = M.liquidJuice;
        liquidText = 'آبمیوه طبیعی تازه';
    } else if (subtype === 'water') {
        glassStyle = 'tall';
        liquidMatFn = M.liquidWater;
        liquidText = 'آب معدنی خنک';
    } else {
        glassStyle = 'tall';
        liquidMatFn = M.liquidSoda;
        liquidText = 'نوشیدنی خنک و تازه';
    }

    if (glassStyle === 'can') {
        layers.push({
            mesh: createCanCylinder(),
            closedY: -0.6,
            openY: -4.0,
            text: 'قوطی نوشیدنی خنک',
            side: 'right'
        });
        const liquid = createLiquidColumn(liquidMatFn);
        liquid.scale.set(0.75, 0.85, 0.75);
        layers.push({
            mesh: liquid,
            closedY: -0.4,
            openY: -1.5,
            text: liquidText,
            side: 'left'
        });
        layers.push({
            mesh: createIceCubes(4, seed),
            closedY: -0.4,
            openY: 1.5,
            text: 'یخ خرد‌شده تازه',
            side: 'right'
        });
        return layers;
    }

    layers.push({
        mesh: createGlassCup(glassStyle),
        closedY: 0.0,
        openY: -4.5,
        text: glassStyle === 'mug' ? 'ماگ سرامیکی کلاسیک' : 'لیوان شیشه‌ای بلند',
        side: 'right'
    });

    layers.push({
        mesh: createLiquidColumn(liquidMatFn),
        closedY: -0.3,
        openY: -1.5,
        text: liquidText,
        side: 'left'
    });

    layers.push({
        mesh: createIceCubes(6, seed),
        closedY: -0.3,
        openY: 1.5,
        text: 'یخ خرد‌شده و تازه',
        side: 'right'
    });

    const hasLime = subtype === 'lemonade' || subtype === 'juice' || subtype === 'soda';
    const hasMint = subtype === 'mint' || subtype === 'juice';
    const hasStraw = subtype !== 'coffee' && subtype !== 'tea';

    if (hasLime) {
        const lw = createLimeWheel();
        lw.position.set(1.0, 2.3, 0);
        lw.rotation.z = Math.PI / 2;
        layers.push({
            mesh: lw,
            closedY: 2.0,
            openY: 3.5,
            text: 'برش لیمو ترش تازه',
            side: 'left'
        });
    }

    if (hasMint) {
        layers.push({
            mesh: createMintSprig(3, seed),
            closedY: 2.2,
            openY: 5.0,
            text: 'برگ نعنا تازه',
            side: 'right'
        });
    }

    if (hasStraw) {
        layers.push({
            mesh: createStraw(),
            closedY: 0.5,
            openY: 5.5,
            text: 'نی و تزئینات',
            side: 'left'
        });
    }

    return layers;
}

function buildDessertLayers(product, seed, subtype) {
    const layers = [];

    if (subtype === 'chocolateCake' || subtype === 'vanillaCake') {
        layers.push({
            mesh: createPlatter('round', M.porcelain),
            closedY: -0.7,
            openY: -4.0,
            text: 'بشقاب سرامیکی سرو',
            side: 'right'
        });
        const cake = createCakeSlice(subtype === 'chocolateCake' ? 'chocolate' : 'vanilla', seed);
        cake.position.y = -0.2;
        layers.push({
            mesh: cake,
            closedY: -0.2,
            openY: 1.0,
            text: subtype === 'chocolateCake' ? 'کیک شکلاتی فاج خیس' : 'کیک وانیلی اسفنجی',
            side: 'left'
        });
        return layers;
    }

    if (subtype === 'cheesecake') {
        layers.push({
            mesh: createPlatter('round', M.porcelain),
            closedY: -0.7,
            openY: -4.0,
            text: 'بشقاب سرامیکی سرو',
            side: 'right'
        });
        const cc = createCheesecakeSlice(seed);
        cc.position.y = 0.0;
        layers.push({
            mesh: cc,
            closedY: 0.0,
            openY: 1.2,
            text: 'چیزکیک نیویورکی خامه‌ای',
            side: 'left'
        });
        return layers;
    }

    if (subtype === 'croissant') {
        layers.push({
            mesh: createPlatter('round', M.porcelain),
            closedY: -0.6,
            openY: -4.0,
            text: 'بشقاب سرامیکی سرو',
            side: 'right'
        });
        const croissant = createCroissant();
        croissant.position.y = 0.1;
        layers.push({
            mesh: croissant,
            closedY: 0.1,
            openY: 1.5,
            text: 'کروسان کره‌ای فرانسوی',
            side: 'left'
        });
        return layers;
    }

    if (subtype === 'baklava') {
        layers.push({
            mesh: createPlatter('round', M.porcelain),
            closedY: -0.6,
            openY: -4.0,
            text: 'بشقاب سرامیکی سنتی',
            side: 'right'
        });
        const isPistachio = /پسته/.test(product.title);
        const baklava = createBaklavaStack(6, seed, isPistachio ? 'pistachio' : 'walnut');
        baklava.position.y = -0.2;
        layers.push({
            mesh: baklava,
            closedY: -0.2,
            openY: 1.5,
            text: isPistachio ? 'باقلوا پسته رفسنجان' : 'باقلوا گردوی اعلا',
            side: 'left'
        });
        const garnish = createGarnishScatter(
            12,
            isPistachio ? M.pistachio : M.walnut,
            seed,
            0.08
        );
        garnish.position.y = 0.9;
        layers.push({
            mesh: garnish,
            closedY: 0.9,
            openY: 3.5,
            text: isPistachio ? 'پودر پسته سبز' : 'مغز گردوی خرد شده',
            side: 'right'
        });
        return layers;
    }

    layers.push({
        mesh: createPlatter('round', M.porcelain),
        closedY: -0.6,
        openY: -4.0,
        text: 'بشقاب سرامیکی سرو',
        side: 'right'
    });
    const generic = createCakeSlice('vanilla', seed);
    generic.position.y = -0.2;
    layers.push({
        mesh: generic,
        closedY: -0.2,
        openY: 1.2,
        text: 'دسر تازه و خوش‌طعم',
        side: 'left'
    });
    const garnish = createGarnishScatter(10, M.pistachio, seed, 0.08);
    garnish.position.y = 0.9;
    layers.push({
        mesh: garnish,
        closedY: 0.9,
        openY: 3.5,
        text: 'تزئین پسته و خامه',
        side: 'right'
    });
    return layers;
}

export function detectSubtype(product) {
    if (product.subtype) return product.subtype;

    const t = ((product.title || '') + ' ' + (product.desc || '')).toLowerCase();
    const c = product.categoryId || 'burgers';

    if (c === 'traditional' || c === 'kebab') {
        if (/شامی/.test(t)) return 'shami';
        if (/ته\s*چین/.test(t)) return 'tahchin';
        if (/قورمه|فسنجان|خورش|آلو\s*اسفناج|کرفس|قیمه\s*بادمجان/.test(t)) return 'stew';
        if (/قیمه\s*نثار|قیمه/.test(t)) return 'rice';
        if (/کوبیده/.test(t)) return 'koobideh';
        if (/جوجه/.test(t)) return 'joojeh';
        if (/چنجه/.test(t)) return 'chenjeh';
        if (/شیشلیک/.test(t)) return 'shishlik';
        if (/برگ|راسته/.test(t)) return 'barg';
        if (/لقمه/.test(t)) return 'koobideh';
        if (/بختیاری|سلطانی|میکس|مخلوط/.test(t)) return 'kebab';
        if (/پلو|چلو|کته|زرشک/.test(t)) return 'rice';
        if (/کباب|دیس|بشقاب|پرس/.test(t)) return 'kebab';
        return c === 'kebab' ? 'kebab' : 'stew';
    }
    if (c === 'ash') {
        if (/حلیم/.test(t)) return 'halim';
        if (/رشته/.test(t)) return 'reshteh';
        if (/جو/.test(t)) return 'jo';
        if (/دوغ/.test(t)) return 'ashDoogh';
        if (/شله/.test(t)) return 'ashShole';
        return 'reshteh';
    }
    if (c === 'burgers') {
        if (/چیکن|کریسپی|سوخاری/.test(t)) return 'crispyChicken';
        if (/دوبل|دو\s*پتی|دوگانه/.test(t)) return 'doubleSmash';
        if (/وگان|گیاهی|گیاه/.test(t)) return 'vegan';
        if (/بندری/.test(t)) return 'bandari';
        if (/واگیو/.test(t)) return 'thickSirloin';
        return 'classic';
    }
    if (c === 'pizza') {
        if (/پپرونی/.test(t)) return 'pepperoni';
        if (/چهار\s*پنیر|چهارپنیر/.test(t)) return 'fourCheese';
        if (/مارگاریتا|سبزیجات|روستیکا|ریحان/.test(t)) return 'veggie';
        if (/بلوچیز/.test(t)) return 'fourCheese';
        if (/باربیکیو|پیکانته|آتشین|تند/.test(t)) return 'pepperoni';
        return 'classicPizza';
    }
    if (c === 'sandwich') {
        if (/بندری/.test(t)) return 'bndari';
        if (/هات\s*داگ|هاتداگ/.test(t)) return 'hotdog';
        if (/باگت|رست\s*بیف|بیف/.test(t)) return 'baguette';
        if (/ژامبون\s*سرد|هایدا|سرد/.test(t)) return 'coldSandwich';
        if (/فیله\s*مرغ|زینگر|مرغ\s*گریل|شنیسل/.test(t)) return 'chickenSandwich';
        if (/مغز|زبان/.test(t)) return 'baguette';
        return 'sandwich';
    }
    if (c === 'appetizers') {
        if (/سیب\s*زمینی|چیپسی|قاچی|بلژیکی|سرخ\s*کرده/.test(t)) return 'fries';
        if (/بال|پاچینی|وینگز|بوفالو/.test(t)) return 'wings';
        if (/موزارلا|استیکس|کروکت/.test(t)) return 'mozzSticks';
        if (/نان\s*سیر|پارمزان/.test(t)) return 'garlicBread';
        return 'fries';
    }
    if (c === 'drinks' || c === 'supermarket') {
        if (/نوشابه|کوکاکولا|فانتا|پپسی/.test(t)) return 'soda';
        if (/لیموناد/.test(t)) return 'lemonade';
        if (/موهیتو|نعنا/.test(t)) return 'mint';
        if (/قهوه|لاته|اسپرسو|کلد\s*برو/.test(t)) return 'coffee';
        if (/چای/.test(t)) return 'tea';
        if (/شیک|اسموتی/.test(t)) return 'shake';
        if (/آبمیوه|پرتقال|سیب\s*طبیعی|انار/.test(t)) return 'juice';
        if (/آب\s*معدنی|آب\s*خنک/.test(t)) return 'water';
        if (/دوغ/.test(t)) return 'juice';
        return 'genericDrink';
    }
    if (c === 'sweets') {
        if (/باقلوا/.test(t)) return 'baklava';
        if (/کروسان/.test(t)) return 'croissant';
        if (/چیزکیک/.test(t)) return 'cheesecake';
        if (/شکلاتی|فاج|براونی|گاناش/.test(t)) return 'chocolateCake';
        if (/وانیلی|اسفنجی/.test(t)) return 'vanillaCake';
        if (/شله|زرد/.test(t)) return 'genericSweet';
        return 'genericSweet';
    }
    return c;
}

export function generateDish3D(scene, product) {
    const seed = makeRng(product);
    const subtype = detectSubtype(product);

    let layers = [];

    if (subtype === 'shami') {
        layers = buildShamiLayers(product, seed);
    } else if (subtype === 'tahchin') {
        layers = buildTahchinLayers(product, seed);
    } else if (subtype === 'stew' || subtype === 'halim' || subtype === 'reshteh' || subtype === 'jo' || subtype === 'ashDoogh' || subtype === 'ashShole') {
        layers = buildStewLayers(product, seed, subtype);
    } else if (subtype === 'koobideh' || subtype === 'joojeh' || subtype === 'chenjeh' || subtype === 'shishlik' || subtype === 'barg' || subtype === 'kebab' || subtype === 'rice') {
        layers = buildKebabLayers(product, seed, subtype);
    } else if (subtype === 'crispyChicken' || subtype === 'doubleSmash' || subtype === 'vegan' || subtype === 'bandari' || subtype === 'thickSirloin' || subtype === 'classic') {
        layers = buildBurgerLayers(product, seed, subtype);
    } else if (subtype === 'pepperoni' || subtype === 'fourCheese' || subtype === 'veggie' || subtype === 'classicPizza') {
        layers = buildPizzaLayers(product, seed, subtype);
    } else if (subtype === 'bndari' || subtype === 'hotdog' || subtype === 'baguette' || subtype === 'coldSandwich' || subtype === 'chickenSandwich' || subtype === 'sandwich' || subtype === 'bagnette') {
        layers = buildSandwichLayers(product, seed, subtype);
    } else if (subtype === 'fries' || subtype === 'wings' || subtype === 'mozzSticks' || subtype === 'garlicBread') {
        layers = buildAppetizerLayers(product, seed, subtype);
    } else if (subtype === 'soda' || subtype === 'lemonade' || subtype === 'mint' || subtype === 'coffee' || subtype === 'tea' || subtype === 'shake' || subtype === 'juice' || subtype === 'water' || subtype === 'genericDrink') {
        layers = buildDrinkLayers(product, seed, subtype);
    } else if (subtype === 'baklava' || subtype === 'croissant' || subtype === 'cheesecake' || subtype === 'chocolateCake' || subtype === 'vanillaCake' || subtype === 'genericSweet') {
        layers = buildDessertLayers(product, seed, subtype);
    } else {
        layers = buildBurgerLayers(product, seed, 'classic');
    }

    if (layers.length < 4) {
        while (layers.length < 4) {
            const filler = new THREE.Group();
            layers.push({
                mesh: filler,
                closedY: 0,
                openY: 1.5,
                text: 'جزئیات تکمیلی',
                side: layers.length % 2 === 0 ? 'left' : 'right'
            });
        }
    } else if (layers.length > 7) {
        layers = layers.slice(0, 7);
    }

    const group = new THREE.Group();
    layers.forEach(l => {
        l.mesh.position.y = l.closedY;
        group.add(l.mesh);
    });

    scene.add(group);

    try {
        attachOverheadFillLight(scene);
    } catch (e) {}

    return { group, layers };
}

export function getRecipe(product) {
    const seed = makeRng(product);
    const subtype = detectSubtype(product);
    const recipe = { title: product.title, subtype, ingredients: [] };

    if (subtype === 'shami') {
        recipe.ingredients.push({ name: 'گوشت چرخ‌کرده', calories: 320 });
        recipe.ingredients.push({ name: 'سیب‌زمینی رنده', calories: 80 });
        recipe.ingredients.push({ name: 'پیاز و ادویه', calories: 30 });
        recipe.ingredients.push({ name: 'چلوی زعفرانی', calories: 280 });
    } else if (subtype === 'tahchin') {
        recipe.ingredients.push({ name: 'برنج طارم', calories: 300 });
        recipe.ingredients.push({ name: 'مرغ زعفرانی', calories: 220 });
        recipe.ingredients.push({ name: 'ماست و زرده', calories: 90 });
        recipe.ingredients.push({ name: 'زرشک و پسته', calories: 60 });
    } else if (subtype === 'stew') {
        recipe.ingredients.push({ name: 'گوشت گوسفندی', calories: 280 });
        recipe.ingredients.push({ name: 'سبزیجات خورش', calories: 80 });
        recipe.ingredients.push({ name: 'لوبیا یا بادمجان', calories: 120 });
        recipe.ingredients.push({ name: 'برنج ایرانی', calories: 250 });
    } else if (subtype === 'halim') {
        recipe.ingredients.push({ name: 'گندم کامل', calories: 220 });
        recipe.ingredients.push({ name: 'گوشت گوسفندی', calories: 180 });
        recipe.ingredients.push({ name: 'دارچین و شکر', calories: 60 });
    } else if (subtype === 'reshteh') {
        recipe.ingredients.push({ name: 'رشته آشی', calories: 200 });
        recipe.ingredients.push({ name: 'حبوبات', calories: 120 });
        recipe.ingredients.push({ name: 'سبزی کوهی', calories: 40 });
        recipe.ingredients.push({ name: 'کشک و نعناداغ', calories: 100 });
    } else if (subtype === 'koobideh' || subtype === 'joojeh' || subtype === 'chenjeh' || subtype === 'shishlik' || subtype === 'barg') {
        const meatName = subtype === 'joojeh' ? 'مرغ زعفرانی' : 'گوشت گوسفندی';
        recipe.ingredients.push({ name: meatName, calories: 380 });
        recipe.ingredients.push({ name: 'برنج زعفرانی', calories: 300 });
        recipe.ingredients.push({ name: 'گوجه کبابی', calories: 40 });
        recipe.ingredients.push({ name: 'کره محلی', calories: 80 });
    } else if (subtype === 'crispyChicken' || subtype === 'chickenSandwich') {
        recipe.ingredients.push({ name: 'فیله مرغ سوخاری', calories: 380 });
        recipe.ingredients.push({ name: 'نان تازه', calories: 220 });
        recipe.ingredients.push({ name: 'سبزیجات', calories: 45 });
    } else if (subtype === 'doubleSmash' || subtype === 'classic' || subtype === 'thickSirloin' || subtype === 'vegan') {
        recipe.ingredients.push({ name: 'پتی گوشت', calories: 320 });
        recipe.ingredients.push({ name: 'نان بریوش', calories: 240 });
        recipe.ingredients.push({ name: 'پنیر ذوب‌شده', calories: 90 });
        recipe.ingredients.push({ name: 'سبزیجات و سس', calories: 110 });
    } else if (subtype === 'pepperoni' || subtype === 'fourCheese' || subtype === 'veggie' || subtype === 'classicPizza') {
        recipe.ingredients.push({ name: 'خمیر ناپلی', calories: 400 });
        recipe.ingredients.push({ name: 'پنیر موزارلا', calories: 180 });
        recipe.ingredients.push({ name: 'سس گوجه', calories: 60 });
        recipe.ingredients.push({ name: 'تاپینگ‌ها', calories: 180 });
    } else if (subtype === 'bndari') {
        recipe.ingredients.push({ name: 'سوسیس آلمانی', calories: 320 });
        recipe.ingredients.push({ name: 'نان باگت', calories: 220 });
        recipe.ingredients.push({ name: 'رب و ادویه', calories: 60 });
    } else if (subtype === 'hotdog') {
        recipe.ingredients.push({ name: 'سوسیس گوشت', calories: 280 });
        recipe.ingredients.push({ name: 'نان هات‌داگ', calories: 200 });
        recipe.ingredients.push({ name: 'پنیر و سس', calories: 120 });
    } else if (subtype === 'baguette') {
        recipe.ingredients.push({ name: 'رست بیف', calories: 340 });
        recipe.ingredients.push({ name: 'باگت کنجدی', calories: 230 });
        recipe.ingredients.push({ name: 'پنیر گودا', calories: 110 });
    } else if (subtype === 'coldSandwich') {
        recipe.ingredients.push({ name: 'ژامبون', calories: 180 });
        recipe.ingredients.push({ name: 'نان ساندویچی', calories: 200 });
        recipe.ingredients.push({ name: 'مایونز و سبزیجات', calories: 130 });
    } else if (subtype === 'fries') {
        recipe.ingredients.push({ name: 'سیب‌زمینی', calories: 280 });
        recipe.ingredients.push({ name: 'روغن سرخ‌کردنی', calories: 180 });
        recipe.ingredients.push({ name: 'سس دیپ', calories: 120 });
    } else if (subtype === 'wings') {
        recipe.ingredients.push({ name: 'بال مرغ', calories: 320 });
        recipe.ingredients.push({ name: 'سس گلیز', calories: 90 });
        recipe.ingredients.push({ name: 'دیپ سرد', calories: 80 });
    } else if (subtype === 'mozzSticks') {
        recipe.ingredients.push({ name: 'پنیر موزارلا', calories: 280 });
        recipe.ingredients.push({ name: 'آرد پانکو', calories: 140 });
        recipe.ingredients.push({ name: 'سس مارینارا', calories: 60 });
    } else if (subtype === 'garlicBread') {
        recipe.ingredients.push({ name: 'خمیر پیتزا', calories: 220 });
        recipe.ingredients.push({ name: 'کره سیر', calories: 130 });
        recipe.ingredients.push({ name: 'پنیر پارمزان', calories: 110 });
    } else if (subtype === 'soda' || subtype === 'lemonade' || subtype === 'juice' || subtype === 'water') {
        recipe.ingredients.push({ name: 'نوشیدنی خنک', calories: 90 });
        recipe.ingredients.push({ name: 'یخ', calories: 0 });
    } else if (subtype === 'coffee') {
        recipe.ingredients.push({ name: 'قهوه عربیکا', calories: 5 });
        recipe.ingredients.push({ name: 'شیر و شکر', calories: 80 });
    } else if (subtype === 'tea') {
        recipe.ingredients.push({ name: 'چای دم‌کرده', calories: 2 });
        recipe.ingredients.push({ name: 'قند', calories: 40 });
    } else if (subtype === 'shake') {
        recipe.ingredients.push({ name: 'شیر و بستنی', calories: 320 });
        recipe.ingredients.push({ name: 'شکلات یا وانیل', calories: 90 });
    } else if (subtype === 'baklava') {
        recipe.ingredients.push({ name: 'خمیر یوفکا', calories: 220 });
        recipe.ingredients.push({ name: 'کره حیوانی', calories: 180 });
        recipe.ingredients.push({ name: 'پسته یا گردو', calories: 150 });
        recipe.ingredients.push({ name: 'شربت زعفران', calories: 120 });
    } else if (subtype === 'croissant') {
        recipe.ingredients.push({ name: 'خمیر هزارلا', calories: 260 });
        recipe.ingredients.push({ name: 'کره فرانسوی', calories: 180 });
    } else if (subtype === 'cheesecake') {
        recipe.ingredients.push({ name: 'پنیر خامه‌ای', calories: 280 });
        recipe.ingredients.push({ name: 'بیسکویت پایه', calories: 140 });
        recipe.ingredients.push({ name: 'توت‌فرنگی', calories: 40 });
    } else if (subtype === 'chocolateCake' || subtype === 'vanillaCake') {
        recipe.ingredients.push({ name: 'کیک اسفنجی', calories: 280 });
        recipe.ingredients.push({ name: 'گاناش یا خامه', calories: 160 });
    } else {
        recipe.ingredients.push({ name: 'مواد اولیه مخصوص', calories: 400 });
    }

    recipe.totalCalories = recipe.ingredients.reduce((s, i) => s + i.calories, 0);
    return recipe;
}

export function estimateCalories(product) {
    return getRecipe(product).totalCalories;
}

export function getProceduralThumbnail(product) {
    const seed = makeRng(product);
    const subtype = detectSubtype(product);
    const hue1 = Math.floor(seed() * 360);
    const hue2 = (hue1 + 40) % 360;

    let shape = 'circle';
    if (['pepperoni', 'fourCheese', 'veggie', 'classicPizza'].includes(subtype)) shape = 'flat';
    else if (['soda', 'lemonade', 'mint', 'coffee', 'tea', 'shake', 'juice', 'water', 'genericDrink'].includes(subtype)) shape = 'tall';
    else if (['chocolateCake', 'vanillaCake', 'cheesecake', 'baklava', 'croissant', 'genericSweet'].includes(subtype)) shape = 'square';
    else if (['stew', 'halim', 'reshteh', 'jo', 'ashDoogh', 'ashShole'].includes(subtype)) shape = 'bowl';

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
        <defs>
            <radialGradient id="g" cx="50%" cy="40%" r="70%">
                <stop offset="0%" stop-color="hsl(${hue1}, 70%, 70%)"/>
                <stop offset="100%" stop-color="hsl(${hue2}, 60%, 35%)"/>
            </radialGradient>
        </defs>
        <rect width="200" height="200" fill="url(#g)"/>
        ${shape === 'circle' ? '<circle cx="100" cy="110" r="60" fill="rgba(255,255,255,0.35)"/>' : ''}
        ${shape === 'flat' ? '<ellipse cx="100" cy="120" rx="80" ry="30" fill="rgba(255,255,255,0.35)"/>' : ''}
        ${shape === 'tall' ? '<rect x="70" y="60" width="60" height="100" rx="10" fill="rgba(255,255,255,0.35)"/>' : ''}
        ${shape === 'square' ? '<rect x="50" y="60" width="100" height="100" rx="14" fill="rgba(255,255,255,0.35)"/>' : ''}
        ${shape === 'bowl' ? '<path d="M40 100 Q100 180 160 100 Z" fill="rgba(255,255,255,0.35)"/>' : ''}
    </svg>`;
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

export { clearGeometryCache, disposeDishGroup };

export default { generateDish3D, getRecipe, estimateCalories, getProceduralThumbnail, clearGeometryCache, disposeDishGroup, detectSubtype };