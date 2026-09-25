/* =========================================================
 * burger-image-generator.js
 * تولیدکننده تصویر اختصاصی برای محصولات برگر
 * ========================================================= */

const burgerCache = new Map();
const usedBurgerUrls = new Set();

function bDjb2(s) {
    let h = 5381;
    for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
    return Math.abs(h);
}

function bFnv1a(s) {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < s.length; i++) {
        h ^= s.charCodeAt(i);
        h = Math.imul(h, 16777619);
    }
    return h >>> 0;
}

function bSdbm(s) {
    let h = 0;
    for (let i = 0; i < s.length; i++) h = s.charCodeAt(i) + (h << 6) + (h << 16) - h;
    return Math.abs(h);
}

function bMul(s, l) {
    const fns = [bDjb2, bFnv1a, bSdbm];
    return fns[l % 3](s + '#' + l);
}

function bPick(arr, seed) {
    if (!arr || !arr.length) return null;
    return arr[((seed % arr.length) + arr.length) % arr.length];
}

/* ---------------------------------------------------------
 * استخر عکس‌های تایید شده برگر (فقط برگر واقعی)
 * --------------------------------------------------------- */

const BURGER_IMAGES = {
    classic: [
        'photo-1568901346375-23c9450c58cd',
        'photo-1586190848861-99aa4a171e90',
        'photo-1594212699903-eca40af73ca9',
        'photo-1553979459-d2229ba7433b',
        'photo-1550547660-d9450f859349',
        'photo-1615719413546-198b25453f85',
        'photo-1571091718767-18b5b1457add',
        'photo-1562967916-eb82221dfb92',
        'photo-1607013251379-e6eecfffe234',
        'photo-1551782450-a2132b4ba21d',
        'photo-1603064752734-4c48eff53d05',
        'photo-1610440042657-612c34d95e9f'
    ],
    cheese: [
        'photo-1568901346375-23c9450c58cd',
        'photo-1586190848861-99aa4a171e90',
        'photo-1594212699903-eca40af73ca9',
        'photo-1553979459-d2229ba7433b',
        'photo-1550547660-d9450f859349',
        'photo-1615719413546-198b25453f85',
        'photo-1571091718767-18b5b1457add',
        'photo-1562967916-eb82221dfb92',
        'photo-1561758033-d89a9ad46330',
        'photo-1520072959219-c595dc870360'
    ],
    chicken: [
        'photo-1606755962773-d324e0a13086',
        'photo-1607013251379-e6eecfffe234',
        'photo-1562967916-eb82221dfb92',
        'photo-1610440042657-612c34d95e9f',
        'photo-1605333314051-7871b69d95f8',
        'photo-1626082927389-6cd097cdc6ec',
        'photo-1603064752734-4c48eff53d05'
    ],
    double: [
        'photo-1553979459-d2229ba7433b',
        'photo-1586190848861-99aa4a171e90',
        'photo-1568901346375-23c9450c58cd',
        'photo-1594212699903-eca40af73ca9',
        'photo-1550547660-d9450f859349',
        'photo-1615719413546-198b25453f85',
        'photo-1551782450-a2132b4ba21d'
    ],
    bacon: [
        'photo-1553979459-d2229ba7433b',
        'photo-1568901346375-23c9450c58cd',
        'photo-1562967916-eb82221dfb92',
        'photo-1607013251379-e6eecfffe234',
        'photo-1551782450-a2132b4ba21d',
        'photo-1586190848861-99aa4a171e90'
    ],
    mushroom: [
        'photo-1594212699903-eca40af73ca9',
        'photo-1553979459-d2229ba7433b',
        'photo-1568901346375-23c9450c58cd',
        'photo-1586190848861-99aa4a171e90',
        'photo-1615719413546-198b25453f85',
        'photo-1571091718767-18b5b1457add'
    ],
    spicy: [
        'photo-1605333314051-7871b69d95f8',
        'photo-1562967916-eb82221dfb92',
        'photo-1607013251379-e6eecfffe234',
        'photo-1610440042657-612c34d95e9f',
        'photo-1568901346375-23c9450c58cd',
        'photo-1553979459-d2229ba7433b'
    ]
};

/* ---------------------------------------------------------
 * تشخیص دقیق زیرنوع برگر از روی عنوان
 * --------------------------------------------------------- */

function detectBurgerType(title, desc) {
    const t = ((title || '') + ' ' + (desc || '')).toLowerCase();

    if (/چیکن|مرغ|سوخاری|کریسپی|زینگر|فیله\s*مرغ/.test(t)) return 'chicken';
    if (/دوبل|دو\s*پتی|دو\s*لایه|دو\s*قلو/.test(t)) return 'double';
    if (/بیکن/.test(t)) return 'bacon';
    if (/ماشروم|مشروم|قارچ|ترافل/.test(t)) return 'mushroom';
    if (/چیل|تند|آتشین|اسپایسی|مکزیکی|هالوپینو|پیکانته/.test(t)) return 'spicy';
    if (/چیز|پنیر|چدار|گودا|موزارلا/.test(t)) return 'cheese';
    if (/زغالی|دودی|اسموکی/.test(t)) return 'classic';

    return 'classic';
}

function buildPoolFor(type) {
    const primary = BURGER_IMAGES[type] || BURGER_IMAGES.classic;
    const merged = [];
    const seen = new Set();
    for (let i = 0; i < primary.length; i++) {
        if (!seen.has(primary[i])) { seen.add(primary[i]); merged.push(primary[i]); }
    }
    const extras = ['classic', 'cheese', 'double'];
    for (let e = 0; e < extras.length; e++) {
        const p = BURGER_IMAGES[extras[e]];
        for (let j = 0; j < p.length; j++) {
            if (!seen.has(p[j])) { seen.add(p[j]); merged.push(p[j]); }
        }
    }
    return merged;
}

/* ---------------------------------------------------------
 * ساخت URL با واریانت‌های تصویری
 * --------------------------------------------------------- */

const CROPS = ['center', 'entropy', 'top', 'bottom', 'left', 'right'];
const FITS = ['crop', 'fill', 'clip'];
const SIZES = [[500, 500], [520, 520], [540, 540], [560, 560], [580, 580], [600, 600]];
const QUALITIES = [78, 80, 82, 84];
const SATS = [0, 5, -5, 10, -10, 15, -15];
const BRIS = [0, 3, -3, 6, -6, 10];
const CONS = [0, 3, -3, 6, -6, 10];
const HUES = [0, 5, -5, 10, -10];
const VIBS = [0, 8, 16, -8];

function buildUrl(photoId, p) {
    const parts = [
        'w=' + p.w,
        'h=' + p.h,
        'q=' + p.q,
        'auto=format',
        'fm=jpg',
        'fit=' + p.fit,
        'crop=' + p.crop,
        'ixlib=rb-4.0.3'
    ];
    if (p.sat) parts.push('sat=' + p.sat);
    if (p.bri) parts.push('bri=' + p.bri);
    if (p.con) parts.push('con=' + p.con);
    if (p.hue) parts.push('hue=' + p.hue);
    if (p.vib) parts.push('vib=' + p.vib);
    return 'https://images.unsplash.com/' + photoId + '?' + parts.join('&');
}

/* ---------------------------------------------------------
 * API اصلی
 * --------------------------------------------------------- */

export function isBurgerProduct(product) {
    if (!product) return false;
    if ((product.categoryId || '') === 'burgers') return true;
    const t = ((product.title || '') + ' ' + (product.desc || '')).toLowerCase();
    return /برگر|همبرگر|اسلایدر|چیزبرگر/.test(t);
}

export function getBurgerImage(product) {
    if (!product) {
        return 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=540&h=540&q=80&auto=format&fit=crop';
    }

    const key = 'b_' + product.id + '_' + (product.title || '');
    if (burgerCache.has(key)) return burgerCache.get(key);

    const type = detectBurgerType(product.title, product.desc);
    const pool = buildPoolFor(type);
    const seed = 'B::' + product.id + '::' + (product.title || '') + '::' + type;

    const h1 = bMul(seed, 0);
    const h2 = bMul(seed, 1);
    const h3 = bMul(seed, 2);
    const h4 = bMul(seed, 3);
    const h5 = bMul(seed, 4);
    const h6 = bMul(seed, 5);
    const h7 = bMul(seed, 6);
    const h8 = bMul(seed, 7);
    const h9 = bMul(seed, 8);
    const h10 = bMul(seed, 9);
    const h11 = bMul(seed, 10);

    let url = null;

    for (let attempt = 0; attempt < 2000; attempt++) {
        const photo = pool[(h1 + attempt) % pool.length];
        const size = bPick(SIZES, h2 + attempt);
        const params = {
            w: size[0],
            h: size[1],
            q: bPick(QUALITIES, h3 + attempt),
            fit: bPick(FITS, h4 + attempt * 2),
            crop: bPick(CROPS, h5 + attempt * 3),
            sat: bPick(SATS, h6 + attempt * 5),
            bri: bPick(BRIS, h7 + attempt * 7),
            con: bPick(CONS, h8 + attempt * 11),
            hue: bPick(HUES, h9 + attempt * 13),
            vib: bPick(VIBS, h10 + attempt * 17)
        };
        const candidate = buildUrl(photo, params);
        if (!usedBurgerUrls.has(candidate)) {
            url = candidate;
            break;
        }
    }

    if (!url) {
        const photo = pool[h1 % pool.length];
        url = buildUrl(photo, {
            w: 540, h: 540, q: 80, fit: 'crop', crop: 'center',
            sat: 0, bri: 0, con: 0, hue: 0, vib: 0
        }) + '&sig=' + h11.toString(36);
    }

    usedBurgerUrls.add(url);
    burgerCache.set(key, url);
    return url;
}

export function refreshBurgerImages(catalog) {
    if (!Array.isArray(catalog)) return;
    usedBurgerUrls.clear();
    burgerCache.clear();
    for (let i = 0; i < catalog.length; i++) {
        if (isBurgerProduct(catalog[i])) {
            catalog[i].image = getBurgerImage(catalog[i]);
        }
    }
}

export function getBurgerType(product) {
    if (!product) return null;
    return detectBurgerType(product.title, product.desc);
}

export function clearBurgerCache() {
    burgerCache.clear();
    usedBurgerUrls.clear();
}

if (typeof window !== 'undefined') {
    window.BurgerImages = {
        isBurger: isBurgerProduct,
        getImage: getBurgerImage,
        refresh: refreshBurgerImages,
        getType: getBurgerType,
        clear: clearBurgerCache
    };
}

export default {
    isBurgerProduct,
    getBurgerImage,
    refreshBurgerImages,
    getBurgerType,
    clearBurgerCache
};