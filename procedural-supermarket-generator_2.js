import * as THREE from 'three';

const GEOMETRY_CACHE = new Map();
const MATERIAL_CACHE = new Map();

export function cachedGeometry(key, factory) {
    if (GEOMETRY_CACHE.has(key)) return GEOMETRY_CACHE.get(key);
    const geo = factory();
    GEOMETRY_CACHE.set(key, geo);
    return geo;
}

export function cachedMaterial(key, factory) {
    if (MATERIAL_CACHE.has(key)) return MATERIAL_CACHE.get(key);
    const matInstance = factory();
    MATERIAL_CACHE.set(key, matInstance);
    return matInstance;
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

function makeCanvas(size) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    return canvas;
}

function canvasToTexture(canvas, repeatWrapping) {
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = repeatWrapping ? THREE.RepeatWrapping : THREE.ClampToEdgeWrapping;
    tex.wrapT = repeatWrapping ? THREE.RepeatWrapping : THREE.ClampToEdgeWrapping;
    tex.anisotropy = 4;
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
}

/* ============================================================
   PROCEDURAL TEXTURE SYNTHESIS — supermarket edition
   ============================================================ */

/* --- 1. Fruit skin (apples, tomatoes, citrus) --- */
function createFruitSkinTexture(baseColor, spotColor, seed) {
    const s = 512;
    const c = makeCanvas(s);
    const ctx = c.getContext('2d');

    const grad = ctx.createRadialGradient(s * 0.5, s * 0.45, s * 0.05, s * 0.5, s * 0.5, s * 0.55);
    grad.addColorStop(0.0, baseColor);
    grad.addColorStop(0.7, baseColor);
    grad.addColorStop(1.0, '#1a0a06');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, s, s);

    const rng = mulberry32(seed || 1337);
    for (let i = 0; i < 3000; i++) {
        const x = rng() * s;
        const y = rng() * s;
        const r = rng() * 1.4;
        ctx.fillStyle = rng() > 0.55 ? 'rgba(0,0,0,0.18)' : 'rgba(255,255,255,0.12)';
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
    }

    if (spotColor) {
        for (let i = 0; i < 180; i++) {
            const x = rng() * s;
            const y = rng() * s;
            const r = 0.5 + rng() * 2.4;
            ctx.fillStyle = spotColor;
            ctx.globalAlpha = 0.35 + rng() * 0.4;
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;
    }

    return canvasToTexture(c, true);
}

/* --- 2. Leafy vegetable texture --- */
function createLeafyTexture() {
    const s = 1024;
    const c = makeCanvas(s);
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#4c9921';
    ctx.fillRect(0, 0, s, s);

    const rng = mulberry32(55331);
    for (let i = 0; i < 260; i++) {
        const x = rng() * s;
        const y = rng() * s;
        const r = 30 + rng() * 90;
        ctx.fillStyle = rng() > 0.5
            ? 'rgba(96, 179, 48, 0.28)'
            : 'rgba(40, 100, 18, 0.24)';
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.strokeStyle = 'rgba(180, 235, 120, 0.55)';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    for (let r = 0; r < 12; r++) {
        const angle = (r / 12) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(512, 512);
        let cx = 512, cy = 512;
        for (let s2 = 0; s2 < 5; s2++) {
            cx += Math.cos(angle) * 80 + (rng() - 0.5) * 25;
            cy += Math.sin(angle) * 80 + (rng() - 0.5) * 25;
            ctx.lineTo(cx, cy);
        }
        ctx.stroke();
    }

    return canvasToTexture(c);
}

/* --- 3. Dairy label (milk, yogurt, cheese packaging) --- */
function createDairyLabelTexture() {
    const s = 1024;
    const c = makeCanvas(s);
    const ctx = c.getContext('2d');

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, s, s);

    ctx.fillStyle = '#e8f2ff';
    ctx.fillRect(0, 0, s, s * 0.22);
    ctx.fillStyle = '#dbeafe';
    ctx.fillRect(0, s * 0.78, s, s * 0.22);

    ctx.fillStyle = '#1e40af';
    ctx.font = 'bold 90px Vazirmatn, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('شیر', s / 2, s * 0.5);

    ctx.font = 'normal 34px Vazirmatn, sans-serif';
    ctx.fillStyle = '#3b82f6';
    ctx.fillText('تازه · پاستوریزه', s / 2, s * 0.62);

    const rng = mulberry32(22114);
    for (let i = 0; i < 200; i++) {
        const x = rng() * s;
        const y = rng() * s;
        ctx.fillStyle = 'rgba(30, 64, 175, 0.08)';
        ctx.beginPath();
        ctx.arc(x, y, 1.5 + rng() * 3, 0, Math.PI * 2);
        ctx.fill();
    }

    return canvasToTexture(c);
}

/* --- 4. Meat flesh texture (raw) --- */
function createMeatFleshTexture(baseColor, marbling) {
    const s = 1024;
    const c = makeCanvas(s);
    const ctx = c.getContext('2d');

    ctx.fillStyle = baseColor;
    ctx.fillRect(0, 0, s, s);

    const rng = mulberry32(88117);
    for (let i = 0; i < 420; i++) {
        const x = rng() * s;
        const y = rng() * s;
        const r = 4 + rng() * 26;
        ctx.fillStyle = 'rgba(255, 220, 220, 0.14)';
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.filter = 'blur(3px)';
    ctx.strokeStyle = marbling;
    ctx.lineWidth = 8;
    for (let i = 0; i < 65; i++) {
        const x1 = rng() * s;
        const y1 = rng() * s;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        for (let t = 0.2; t <= 1.0; t += 0.2) {
            ctx.lineTo(x1 + (rng() - 0.5) * 140 * t, y1 + (rng() - 0.5) * 140 * t);
        }
        ctx.stroke();
    }
    ctx.filter = 'none';

    return canvasToTexture(c, true);
}

/* --- 5. Bread crust (Persian flatbread) --- */
function createFlatbreadTexture() {
    const s = 1024;
    const c = makeCanvas(s);
    const ctx = c.getContext('2d');

    const grad = ctx.createRadialGradient(s / 2, s / 2, 40, s / 2, s / 2, s * 0.6);
    grad.addColorStop(0.0, '#f0c075');
    grad.addColorStop(0.55, '#d59a4b');
    grad.addColorStop(0.9, '#a56a23');
    grad.addColorStop(1.0, '#6d3f11');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, s, s);

    const rng = mulberry32(22117);
    for (let i = 0; i < 380; i++) {
        const x = rng() * s;
        const y = rng() * s;
        const r = 1 + rng() * 5;
        ctx.fillStyle = rng() > 0.5 ? 'rgba(90, 45, 12, 0.55)' : 'rgba(255, 220, 160, 0.25)';
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
    }

    for (let i = 0; i < 30; i++) {
        const x = rng() * s;
        const y = rng() * s;
        const r = 20 + rng() * 60;
        ctx.fillStyle = 'rgba(70, 35, 8, 0.15)';
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
    }

    return canvasToTexture(c, true);
}

/* --- 6. Metal tin (canned goods) --- */
function createCanMetalTexture(labelColor) {
    const s = 512;
    const c = makeCanvas(s);
    const ctx = c.getContext('2d');

    ctx.fillStyle = '#c8ccd1';
    ctx.fillRect(0, 0, s, s);

    const grad = ctx.createLinearGradient(0, 0, 0, s);
    grad.addColorStop(0.0, 'rgba(255,255,255,0.5)');
    grad.addColorStop(0.5, 'rgba(255,255,255,0)');
    grad.addColorStop(1.0, 'rgba(0,0,0,0.2)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, s, s);

    if (labelColor) {
        ctx.fillStyle = labelColor;
        ctx.fillRect(0, s * 0.2, s, s * 0.55);
        ctx.fillStyle = 'rgba(255,255,255,0.85)';
        ctx.fillRect(0, s * 0.27, s, 3);
        ctx.fillRect(0, s * 0.7, s, 3);
    }

    return canvasToTexture(c, true);
}

/* --- 7. Glass jar (jam, honey, pickles) --- */
function createJarLabelTexture(labelColor) {
    const s = 512;
    const c = makeCanvas(s);
    const ctx = c.getContext('2d');

    ctx.fillStyle = '#f8f8f8';
    ctx.fillRect(0, 0, s, s);

    ctx.fillStyle = labelColor;
    ctx.fillRect(0, s * 0.15, s, s * 0.7);

    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.font = 'bold 44px Vazirmatn, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('خانگی', s / 2, s * 0.45);

    ctx.font = 'normal 24px Vazirmatn, sans-serif';
    ctx.fillText('۱۰۰٪ طبیعی', s / 2, s * 0.58);

    return canvasToTexture(c);
}

/* --- 8. Snack bag foil --- */
function createSnackFoilTexture(baseColor) {
    const s = 512;
    const c = makeCanvas(s);
    const ctx = c.getContext('2d');

    ctx.fillStyle = baseColor;
    ctx.fillRect(0, 0, s, s);

    const grad = ctx.createLinearGradient(0, 0, s, s);
    grad.addColorStop(0.0, 'rgba(255,255,255,0.35)');
    grad.addColorStop(0.4, 'rgba(255,255,255,0.05)');
    grad.addColorStop(0.6, 'rgba(255,255,255,0.05)');
    grad.addColorStop(1.0, 'rgba(0,0,0,0.15)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, s, s);

    const rng = mulberry32(77112);
    for (let i = 0; i < 400; i++) {
        const x = rng() * s;
        const y = rng() * s;
        ctx.fillStyle = 'rgba(255,255,255,0.08)';
        ctx.beginPath();
        ctx.arc(x, y, 0.8 + rng() * 2, 0, Math.PI * 2);
        ctx.fill();
    }

    return canvasToTexture(c, true);
}

/* --- 9. Plastic bottle label (shampoo, detergent) --- */
function createBottleLabelTexture(baseColor, accentColor) {
    const s = 512;
    const c = makeCanvas(s);
    const ctx = c.getContext('2d');

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, s, s);

    ctx.fillStyle = baseColor;
    ctx.fillRect(0, s * 0.12, s, s * 0.76);

    ctx.fillStyle = accentColor;
    ctx.fillRect(0, s * 0.12, s, 18);
    ctx.fillRect(0, s * 0.88 - 18, s, 18);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 52px Vazirmatn, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('لقمه', s / 2, s * 0.42);

    ctx.font = 'normal 26px Vazirmatn, sans-serif';
    ctx.fillText('کیفیت برتر', s / 2, s * 0.55);

    return canvasToTexture(c);
}

/* --- 10. Cardboard box (cereal, tea, tissue) --- */
function createCardboardTexture(baseColor) {
    const s = 512;
    const c = makeCanvas(s);
    const ctx = c.getContext('2d');

    ctx.fillStyle = baseColor;
    ctx.fillRect(0, 0, s, s);

    const rng = mulberry32(33112);
    for (let i = 0; i < 500; i++) {
        const x = rng() * s;
        const y = rng() * s;
        const w = 2 + rng() * 6;
        const h = 0.5 + rng() * 1.5;
        ctx.fillStyle = 'rgba(0,0,0,0.05)';
        ctx.fillRect(x, y, w, h);
    }

    return canvasToTexture(c, true);
}

/* --- 11. Nut kernel texture --- */
function createNutTexture(baseColor, ridgeColor) {
    const s = 512;
    const c = makeCanvas(s);
    const ctx = c.getContext('2d');

    ctx.fillStyle = baseColor;
    ctx.fillRect(0, 0, s, s);

    ctx.strokeStyle = ridgeColor;
    ctx.lineWidth = 3;
    const rng = mulberry32(99117);
    for (let i = 0; i < 40; i++) {
        const x = rng() * s;
        const y = rng() * s;
        ctx.beginPath();
        ctx.moveTo(x, y);
        for (let t = 0; t < 5; t++) {
            ctx.lineTo(x + (rng() - 0.5) * 80, y + (rng() - 0.5) * 80);
        }
        ctx.stroke();
    }

    for (let i = 0; i < 300; i++) {
        const x = rng() * s;
        const y = rng() * s;
        ctx.fillStyle = rng() > 0.5 ? 'rgba(255,235,200,0.25)' : 'rgba(40,20,5,0.25)';
        ctx.beginPath();
        ctx.arc(x, y, 0.7 + rng() * 1.6, 0, Math.PI * 2);
        ctx.fill();
    }

    return canvasToTexture(c, true);
}

/* --- 12. Spice powder texture --- */
function createSpiceTexture(baseColor, fleckColor) {
    const s = 512;
    const c = makeCanvas(s);
    const ctx = c.getContext('2d');

    ctx.fillStyle = baseColor;
    ctx.fillRect(0, 0, s, s);

    const rng = mulberry32(44119);
    for (let i = 0; i < 6000; i++) {
        const x = rng() * s;
        const y = rng() * s;
        const r = 0.4 + rng() * 1.5;
        ctx.fillStyle = rng() > 0.5 ? fleckColor : 'rgba(0,0,0,0.2)';
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
    }

    return canvasToTexture(c, true);
}

/* --- 13. Generic noise bump map --- */
function createNoiseBumpMap(size, repeat) {
    const s = size || 512;
    const c = makeCanvas(s);
    const ctx = c.getContext('2d');
    const imgData = ctx.createImageData(s, s);
    for (let i = 0; i < imgData.data.length; i += 4) {
        const v = Math.floor(Math.random() * 255);
        imgData.data[i] = v;
        imgData.data[i + 1] = v;
        imgData.data[i + 2] = v;
        imgData.data[i + 3] = 255;
    }
    ctx.putImageData(imgData, 0, 0);
    const tex = canvasToTexture(c, true);
    tex.repeat.set(repeat || 3, repeat || 3);
    return tex;
}

/* --- 14. Particle sprite --- */
function createParticleSprite() {
    const s = 64;
    const c = makeCanvas(s);
    const ctx = c.getContext('2d');
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0.0, 'rgba(255, 255, 255, 1.0)');
    grad.addColorStop(0.25, 'rgba(215, 240, 255, 0.7)');
    grad.addColorStop(0.65, 'rgba(160, 205, 245, 0.2)');
    grad.addColorStop(1.0, 'rgba(0, 0, 0, 0.0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, s, s);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
}

/* Pre-build shared textures */
const TEX = {
    appleRed: typeof document !== 'undefined' ? createFruitSkinTexture('#c81f1a', 'rgba(255,240,200,0.55)', 101) : null,
    appleGreen: typeof document !== 'undefined' ? createFruitSkinTexture('#7ba42a', 'rgba(220,255,180,0.5)', 102) : null,
    tomato: typeof document !== 'undefined' ? createFruitSkinTexture('#c81f14', null, 103) : null,
    orange: typeof document !== 'undefined' ? createFruitSkinTexture('#f28c1b', 'rgba(120,60,10,0.35)', 104) : null,
    lemon: typeof document !== 'undefined' ? createFruitSkinTexture('#e7c838', 'rgba(90,60,10,0.28)', 105) : null,
    banana: typeof document !== 'undefined' ? createFruitSkinTexture('#f2cd4a', 'rgba(120,80,20,0.3)', 106) : null,
    peach: typeof document !== 'undefined' ? createFruitSkinTexture('#f0a578', 'rgba(180,80,40,0.35)', 107) : null,
    grape: typeof document !== 'undefined' ? createFruitSkinTexture('#5b2a76', 'rgba(200,180,220,0.4)', 108) : null,
    plum: typeof document !== 'undefined' ? createFruitSkinTexture('#3d2050', 'rgba(180,160,200,0.35)', 109) : null,
    leafy: typeof document !== 'undefined' ? createLeafyTexture() : null,
    dairy: typeof document !== 'undefined' ? createDairyLabelTexture() : null,
    meatRed: typeof document !== 'undefined' ? createMeatFleshTexture('#a81f22', 'rgba(255,220,220,0.5)') : null,
    chickenMeat: typeof document !== 'undefined' ? createMeatFleshTexture('#e5b98a', 'rgba(255,240,220,0.55)') : null,
    fishFlesh: typeof document !== 'undefined' ? createMeatFleshTexture('#f4b7a1', 'rgba(255,230,220,0.65)') : null,
    flatbread: typeof document !== 'undefined' ? createFlatbreadTexture() : null,
    canSilver: typeof document !== 'undefined' ? createCanMetalTexture(null) : null,
    canTomato: typeof document !== 'undefined' ? createCanMetalTexture('#dc2626') : null,
    canTuna: typeof document !== 'undefined' ? createCanMetalTexture('#1e40af') : null,
    jarJam: typeof document !== 'undefined' ? createJarLabelTexture('#b91c1c') : null,
    jarHoney: typeof document !== 'undefined' ? createJarLabelTexture('#b45309') : null,
    jarPickle: typeof document !== 'undefined' ? createJarLabelTexture('#15803d') : null,
    snackRed: typeof document !== 'undefined' ? createSnackFoilTexture('#c81e1e') : null,
    snackYellow: typeof document !== 'undefined' ? createSnackFoilTexture('#d99a15') : null,
    snackBlue: typeof document !== 'undefined' ? createSnackFoilTexture('#1e40af') : null,
    snackGreen: typeof document !== 'undefined' ? createSnackFoilTexture('#15803d') : null,
    bottleBlue: typeof document !== 'undefined' ? createBottleLabelTexture('#0284c7', '#0ea5e9') : null,
    bottlePink: typeof document !== 'undefined' ? createBottleLabelTexture('#db2777', '#f472b6') : null,
    bottleGreen: typeof document !== 'undefined' ? createBottleLabelTexture('#16a34a', '#4ade80') : null,
    cardboard: typeof document !== 'undefined' ? createCardboardTexture('#c9a468') : null,
    cardboardWhite: typeof document !== 'undefined' ? createCardboardTexture('#f4f4f5') : null,
    nutBrown: typeof document !== 'undefined' ? createNutTexture('#6b3f24', '#3d2210') : null,
    nutGreen: typeof document !== 'undefined' ? createNutTexture('#88a440', '#4c5f1e') : null,
    spiceRed: typeof document !== 'undefined' ? createSpiceTexture('#c81e1e', '#fca5a5') : null,
    spiceYellow: typeof document !== 'undefined' ? createSpiceTexture('#eab308', '#fef08a') : null,
    spiceOrange: typeof document !== 'undefined' ? createSpiceTexture('#ea580c', '#fed7aa') : null,
    bump: typeof document !== 'undefined' ? createNoiseBumpMap(512, 3) : null,
    particle: typeof document !== 'undefined' ? createParticleSprite() : null
};

function mat(key, opts) {
    return cachedMaterial(key, () => new THREE.MeshPhysicalMaterial(opts));
}

/* ============================================================
   MATERIAL LIBRARY — supermarket edition
   ============================================================ */

export const SM = {
    /* ---------- Fruits ---------- */
    appleRed: () => mat('smAppleRed', {
        map: TEX.appleRed, bumpMap: TEX.bump, bumpScale: 0.012,
        roughness: 0.35, clearcoat: 0.85, clearcoatRoughness: 0.15,
        sheen: 0.4, sheenColor: new THREE.Color(0xffc8b0)
    }),
    appleGreen: () => mat('smAppleGreen', {
        map: TEX.appleGreen, bumpMap: TEX.bump, bumpScale: 0.012,
        roughness: 0.38, clearcoat: 0.8, clearcoatRoughness: 0.18
    }),
    banana: () => mat('smBanana', {
        map: TEX.banana, bumpMap: TEX.bump, bumpScale: 0.008,
        roughness: 0.5, clearcoat: 0.35
    }),
    orange: () => mat('smOrange', {
        map: TEX.orange, bumpMap: TEX.bump, bumpScale: 0.02,
        roughness: 0.55, clearcoat: 0.45, sheen: 0.55, sheenColor: new THREE.Color(0xffd8a0)
    }),
    lemon: () => mat('smLemon', {
        map: TEX.lemon, bumpMap: TEX.bump, bumpScale: 0.024,
        roughness: 0.5, clearcoat: 0.5
    }),
    tomato: () => mat('smTomato', {
        map: TEX.tomato, bumpMap: TEX.bump, bumpScale: 0.01,
        roughness: 0.15, clearcoat: 1.0, clearcoatRoughness: 0.05,
        transmission: 0.15, thickness: 0.5,
        sheen: 0.5, sheenColor: new THREE.Color(0xff8060)
    }),
    peach: () => mat('smPeach', {
        map: TEX.peach, bumpMap: TEX.bump, bumpScale: 0.014,
        roughness: 0.42, clearcoat: 0.5
    }),
    grape: () => mat('smGrape', {
        map: TEX.grape, roughness: 0.18, clearcoat: 0.95,
        transmission: 0.2, thickness: 0.4,
        sheen: 0.5, sheenColor: new THREE.Color(0xd8c8f0)
    }),
    plum: () => mat('smPlum', {
        map: TEX.plum, roughness: 0.16, clearcoat: 0.95,
        transmission: 0.18, thickness: 0.4
    }),
    kiwi: () => mat('smKiwi', {
        color: 0x8a6b3a, bumpMap: TEX.bump, bumpScale: 0.018,
        roughness: 0.62, clearcoat: 0.25
    }),
    pineapple: () => mat('smPineapple', {
        color: 0xdca43d, bumpMap: TEX.bump, bumpScale: 0.03,
        roughness: 0.7, clearcoat: 0.15
    }),
    pomegranate: () => mat('smPomegranate', {
        color: 0x9e1a1a, roughness: 0.28, clearcoat: 0.85,
        transmission: 0.15, thickness: 0.6
    }),
    berry: () => mat('smBerry', {
        color: 0x9c0f34, roughness: 0.22, clearcoat: 0.9,
        transmission: 0.18, thickness: 0.35,
        sheen: 0.55, sheenColor: new THREE.Color(0xff8098)
    }),
    cherry: () => mat('smCherry', {
        color: 0xb0142c, roughness: 0.14, clearcoat: 1.0,
        transmission: 0.2, thickness: 0.4
    }),
    dateFruit: () => mat('smDate', {
        color: 0x5a2a15, roughness: 0.55, clearcoat: 0.35
    }),
    fig: () => mat('smFig', {
        color: 0x4a1c2a, roughness: 0.32, clearcoat: 0.6,
        transmission: 0.15, thickness: 0.4
    }),
    apricot: () => mat('smApricot', {
        color: 0xe98b30, roughness: 0.38, clearcoat: 0.55
    }),
    mango: () => mat('smMango', {
        color: 0xdd7a1a, roughness: 0.32, clearcoat: 0.7,
        sheen: 0.4, sheenColor: new THREE.Color(0xffd8a0)
    }),

    /* ---------- Vegetables ---------- */
    leafy: () => mat('smLeafy', {
        map: TEX.leafy, bumpMap: TEX.bump, bumpScale: 0.02,
        roughness: 0.32, transmission: 0.28, thickness: 0.3,
        clearcoat: 0.35, side: THREE.DoubleSide,
        sheen: 0.45, sheenColor: new THREE.Color(0xb6e870)
    }),
    broccoli: () => mat('smBroccoli', {
        color: 0x3f7a26, bumpMap: TEX.bump, bumpScale: 0.04,
        roughness: 0.55, clearcoat: 0.3
    }),
    cauliflower: () => mat('smCauliflower', {
        color: 0xf5f2e0, bumpMap: TEX.bump, bumpScale: 0.035,
        roughness: 0.65, clearcoat: 0.25
    }),
    carrot: () => mat('smCarrot', {
        color: 0xe77420, bumpMap: TEX.bump, bumpScale: 0.02,
        roughness: 0.48, clearcoat: 0.4
    }),
    beet: () => mat('smBeet', {
        color: 0x7a0f3a, roughness: 0.35, clearcoat: 0.7
    }),
    onion: () => mat('smOnion', {
        color: 0xd4a585, roughness: 0.4, clearcoat: 0.55,
        transmission: 0.2, thickness: 0.3,
        sheen: 0.6, sheenColor: new THREE.Color(0xffe0c8)
    }),
    potato: () => mat('smPotato', {
        color: 0xc09464, bumpMap: TEX.bump, bumpScale: 0.022,
        roughness: 0.7, clearcoat: 0.15
    }),
    pepperRed: () => mat('smPepperRed', {
        color: 0xc4181e, roughness: 0.22, clearcoat: 0.85,
        transmission: 0.18, thickness: 0.4,
        sheen: 0.5, sheenColor: new THREE.Color(0xff8080)
    }),
    pepperGreen: () => mat('smPepperGreen', {
        color: 0x3f7a1e, roughness: 0.24, clearcoat: 0.85,
        transmission: 0.18, thickness: 0.4
    }),
    pepperYellow: () => mat('smPepperYellow', {
        color: 0xe5b81c, roughness: 0.22, clearcoat: 0.85,
        transmission: 0.18, thickness: 0.4
    }),
    eggplant: () => mat('smEggplant', {
        color: 0x2b1140, roughness: 0.2, clearcoat: 0.95,
        transmission: 0.12, thickness: 0.5,
        sheen: 0.55, sheenColor: new THREE.Color(0xa080c0)
    }),
    zucchini: () => mat('smZucchini', {
        color: 0x4a7a2a, roughness: 0.35, clearcoat: 0.55,
        transmission: 0.15, thickness: 0.35
    }),
    pumpkin: () => mat('smPumpkin', {
        color: 0xdd6a15, bumpMap: TEX.bump, bumpScale: 0.025,
        roughness: 0.55, clearcoat: 0.4
    }),
    mushroom: () => mat('smMushroom', {
        color: 0xc8b8a0, bumpMap: TEX.bump, bumpScale: 0.02,
        roughness: 0.45, clearcoat: 0.55
    }),
    corn: () => mat('smCorn', {
        color: 0xf5c750, bumpMap: TEX.bump, bumpScale: 0.018,
        roughness: 0.42, clearcoat: 0.5
    }),
    peaPod: () => mat('smPeaPod', {
        color: 0x5e9a2e, roughness: 0.3, clearcoat: 0.65,
        transmission: 0.2, thickness: 0.3
    }),
    herbBundle: () => mat('smHerbBundle', {
        color: 0x2e6b18, roughness: 0.4,
        side: THREE.DoubleSide,
        sheen: 0.5, sheenColor: new THREE.Color(0xa0d860)
    }),

    /* ---------- Dairy ---------- */
    milkCarton: () => mat('smMilkCarton', {
        map: TEX.dairy, bumpMap: TEX.bump, bumpScale: 0.008,
        roughness: 0.42, clearcoat: 0.6, clearcoatRoughness: 0.2
    }),
    yogurtCup: () => mat('smYogurtCup', {
        color: 0xf0f8ff, roughness: 0.35, clearcoat: 0.75
    }),
    cheese: () => mat('smCheese', {
        color: 0xf5c05a, bumpMap: TEX.bump, bumpScale: 0.018,
        roughness: 0.35, transmission: 0.18, thickness: 0.6,
        clearcoat: 0.55, sheen: 0.6, sheenColor: new THREE.Color(0xffd98a)
    }),
    butterBlock: () => mat('smButterBlock', {
        color: 0xffdf6e, roughness: 0.28, clearcoat: 0.65,
        transmission: 0.1, thickness: 0.4
    }),
    creamTub: () => mat('smCreamTub', {
        color: 0xf8f0e0, roughness: 0.3, clearcoat: 0.7
    }),
    eggShell: () => mat('smEggShell', {
        color: 0xf4ecd8, bumpMap: TEX.bump, bumpScale: 0.012,
        roughness: 0.32, clearcoat: 0.75
    }),
    eggYolk: () => mat('smEggYolk', {
        color: 0xf4a52e, roughness: 0.28, clearcoat: 0.7
    }),
    iceCream: () => mat('smIceCream', {
        color: 0xfaf0dc, roughness: 0.35, transmission: 0.2,
        thickness: 0.4, clearcoat: 0.5
    }),
    kashk: () => mat('smKashk', {
        color: 0xf2ece0, roughness: 0.35, clearcoat: 0.5
    }),

    /* ---------- Meat / Protein ---------- */
    meatRed: () => mat('smMeatRed', {
        map: TEX.meatRed, bumpMap: TEX.bump, bumpScale: 0.04,
        roughness: 0.4, clearcoat: 0.65,
        sheen: 0.5, sheenColor: new THREE.Color(0xff8060)
    }),
    chickenMeat: () => mat('smChickenMeat', {
        map: TEX.chickenMeat, bumpMap: TEX.bump, bumpScale: 0.03,
        roughness: 0.45, clearcoat: 0.5,
        sheen: 0.4, sheenColor: new THREE.Color(0xffd8a8)
    }),
    fishFlesh: () => mat('smFishFlesh', {
        map: TEX.fishFlesh, bumpMap: TEX.bump, bumpScale: 0.025,
        roughness: 0.38, clearcoat: 0.6,
        transmission: 0.12, thickness: 0.3
    }),
    fishScale: () => mat('smFishScale', {
        color: 0xa0b8c0, bumpMap: TEX.bump, bumpScale: 0.03,
        roughness: 0.4, clearcoat: 0.7, metalness: 0.2
    }),
    shrimp: () => mat('smShrimp', {
        color: 0xf08070, roughness: 0.35, clearcoat: 0.7,
        transmission: 0.15, thickness: 0.3
    }),
    sausage: () => mat('smSausage', {
        color: 0xa8281e, bumpMap: TEX.bump, bumpScale: 0.025,
        roughness: 0.32, clearcoat: 0.85
    }),
    turkeyMeat: () => mat('smTurkeyMeat', {
        color: 0xe4c096, roughness: 0.5, clearcoat: 0.4
    }),

    /* ---------- Bread ---------- */
    flatbread: () => mat('smFlatbread', {
        map: TEX.flatbread, bumpMap: TEX.bump, bumpScale: 0.024,
        roughness: 0.72, clearcoat: 0.15
    }),
    toastBread: () => mat('smToastBread', {
        color: 0xe8c48c, bumpMap: TEX.bump, bumpScale: 0.02,
        roughness: 0.65, clearcoat: 0.25
    }),
    darkBread: () => mat('smDarkBread', {
        color: 0x6a3d1e, bumpMap: TEX.bump, bumpScale: 0.03,
        roughness: 0.75, clearcoat: 0.1
    }),
    baguette: () => mat('smBaguette', {
        map: TEX.flatbread, bumpMap: TEX.bump, bumpScale: 0.024,
        color: 0xc09858, roughness: 0.62, clearcoat: 0.18
    }),

    /* ---------- Canned ---------- */
    canSilver: () => mat('smCanSilver', {
        map: TEX.canSilver, metalness: 0.85, roughness: 0.3, clearcoat: 0.6
    }),
    canTomato: () => mat('smCanTomato', {
        map: TEX.canTomato, metalness: 0.7, roughness: 0.32, clearcoat: 0.5
    }),
    canTuna: () => mat('smCanTuna', {
        map: TEX.canTuna, metalness: 0.7, roughness: 0.32, clearcoat: 0.5
    }),
    jamJar: () => mat('smJamJar', {
        map: TEX.jarJam, metalness: 0.1, roughness: 0.28, clearcoat: 0.85
    }),
    honeyJar: () => mat('smHoneyJar', {
        map: TEX.jarHoney, metalness: 0.1, roughness: 0.28, clearcoat: 0.85
    }),
    pickleJar: () => mat('smPickleJar', {
        map: TEX.jarPickle, metalness: 0.1, roughness: 0.28, clearcoat: 0.85
    }),
    glass: () => mat('smGlass', {
        color: 0xffffff, roughness: 0.06, transmission: 0.85,
        thickness: 0.6, clearcoat: 1.0, ior: 1.5,
        transparent: true, opacity: 0.92
    }),
    jarLid: () => mat('smJarLid', {
        color: 0xb87333, metalness: 0.75, roughness: 0.28, clearcoat: 0.85
    }),
    bottleCap: () => mat('smBottleCap', {
        color: 0xc83028, metalness: 0.4, roughness: 0.35, clearcoat: 0.6
    }),

    /* ---------- Frozen ---------- */
    frozenPizza: () => mat('smFrozenPizza', {
        color: 0xe5b86a, bumpMap: TEX.bump, bumpScale: 0.015,
        roughness: 0.65, clearcoat: 0.15
    }),
    frozenNugget: () => mat('smFrozenNugget', {
        color: 0xdba95a, bumpMap: TEX.bump, bumpScale: 0.03,
        roughness: 0.68, clearcoat: 0.15
    }),
    fryFrozen: () => mat('smFryFrozen', {
        color: 0xf0c875, bumpMap: TEX.bump, bumpScale: 0.014,
        roughness: 0.62, clearcoat: 0.18
    }),

    /* ---------- Snacks ---------- */
    snackRed: () => mat('smSnackRed', {
        map: TEX.snackRed, roughness: 0.3, metalness: 0.15, clearcoat: 0.75
    }),
    snackYellow: () => mat('smSnackYellow', {
        map: TEX.snackYellow, roughness: 0.3, metalness: 0.15, clearcoat: 0.75
    }),
    snackBlue: () => mat('smSnackBlue', {
        map: TEX.snackBlue, roughness: 0.3, metalness: 0.15, clearcoat: 0.75
    }),
    snackGreen: () => mat('smSnackGreen', {
        map: TEX.snackGreen, roughness: 0.3, metalness: 0.15, clearcoat: 0.75
    }),
    chocolateBar: () => mat('smChocolateBar', {
        color: 0x4a1a08, roughness: 0.35, clearcoat: 0.7, metalness: 0.05
    }),
    biscuit: () => mat('smBiscuit', {
        color: 0xd4a06a, bumpMap: TEX.bump, bumpScale: 0.015,
        roughness: 0.6, clearcoat: 0.35
    }),
    candy: () => mat('smCandy', {
        color: 0xe6455a, roughness: 0.15, clearcoat: 0.95,
        transmission: 0.35, thickness: 0.3
    }),

    /* ---------- Drinks ---------- */
    sodaCan: () => mat('smSodaCan', {
        color: 0xc81818, metalness: 0.75, roughness: 0.28, clearcoat: 0.8
    }),
    bottleClear: () => mat('smBottleClear', {
        color: 0xffffff, roughness: 0.05, transmission: 0.88,
        thickness: 0.6, clearcoat: 1.0, ior: 1.5,
        transparent: true, opacity: 0.9
    }),
    bottleGreen: () => mat('smBottleGreen', {
        color: 0x2c8b4a, roughness: 0.2, transmission: 0.55,
        thickness: 0.7, clearcoat: 0.85
    }),
    bottleBlue: () => mat('smBottleBlue', {
        map: TEX.bottleBlue, roughness: 0.28, clearcoat: 0.85
    }),
    bottlePink: () => mat('smBottlePink', {
        map: TEX.bottlePink, roughness: 0.28, clearcoat: 0.85
    }),
    liquidWater: () => mat('smLiquidWater', {
        color: 0xd8eaf0, transmission: 0.9, thickness: 0.6,
        roughness: 0.05, ior: 1.33
    }),
    liquidSoda: () => mat('smLiquidSoda', {
        color: 0x3a1208, transmission: 0.5, thickness: 0.6,
        roughness: 0.08
    }),
    liquidJuice: () => mat('smLiquidJuice', {
        color: 0xf58220, transmission: 0.55, thickness: 0.5,
        roughness: 0.1
    }),
    liquidMilk: () => mat('smLiquidMilk', {
        color: 0xfaf8f2, transmission: 0.25, thickness: 0.7,
        roughness: 0.25
    }),
    liquidTea: () => mat('smLiquidTea', {
        color: 0x6b2a10, transmission: 0.4, thickness: 0.5,
        roughness: 0.1
    }),
    liquidCoffee: () => mat('smLiquidCoffee', {
        color: 0x2b1508, transmission: 0.3, thickness: 0.5,
        roughness: 0.1
    }),

    /* ---------- Household ---------- */
    detergentBottle: () => mat('smDetergentBottle', {
        map: TEX.bottleBlue, roughness: 0.35, clearcoat: 0.6
    }),
    sprayBottle: () => mat('smSprayBottle', {
        map: TEX.bottleBlue, roughness: 0.28, clearcoat: 0.75
    }),
    tissueBox: () => mat('smTissueBox', {
        map: TEX.cardboardWhite, roughness: 0.5, clearcoat: 0.4
    }),
    cardboard: () => mat('smCardboard', {
        map: TEX.cardboard, bumpMap: TEX.bump, bumpScale: 0.02,
        roughness: 0.72, clearcoat: 0.1
    }),
    sponge: () => mat('smSponge', {
        color: 0xf5c842, bumpMap: TEX.bump, bumpScale: 0.05,
        roughness: 0.85
    }),
    brushBristle: () => mat('smBrushBristle', {
        color: 0xe0c890, roughness: 0.85
    }),
    plastic: () => mat('smPlastic', {
        color: 0xf5f5f5, roughness: 0.32, clearcoat: 0.6
    }),
    plasticDark: () => mat('smPlasticDark', {
        color: 0x2c2c2c, roughness: 0.35, clearcoat: 0.55
    }),

    /* ---------- Personal ---------- */
    shampooBottle: () => mat('smShampooBottle', {
        map: TEX.bottlePink, roughness: 0.3, clearcoat: 0.75
    }),
    soapBar: () => mat('smSoapBar', {
        color: 0xffe4f0, roughness: 0.35, clearcoat: 0.65
    }),
    toothpasteTube: () => mat('smToothpasteTube', {
        color: 0xffffff, roughness: 0.4, clearcoat: 0.55,
        metalness: 0.1
    }),
    toothbrush: () => mat('smToothbrush', {
        color: 0x2b80c8, roughness: 0.35, clearcoat: 0.7
    }),
    razorHandle: () => mat('smRazorHandle', {
        color: 0x1e88e5, roughness: 0.35, clearcoat: 0.65
    }),
    razorBlade: () => mat('smRazorBlade', {
        color: 0xd0d4d8, metalness: 0.92, roughness: 0.18, clearcoat: 0.9
    }),
    deodorantStick: () => mat('smDeodorantStick', {
        color: 0x2b2b2b, roughness: 0.35, clearcoat: 0.55
    }),
    perfumeBottle: () => mat('smPerfumeBottle', {
        color: 0xf0d8a0, transmission: 0.75, thickness: 0.8,
        roughness: 0.06, clearcoat: 1.0, ior: 1.5
    }),
    cotton: () => mat('smCotton', {
        color: 0xfafaf5, roughness: 0.9
    }),

    /* ---------- Baby ---------- */
    diaper: () => mat('smDiaper', {
        color: 0xf5d5e8, roughness: 0.55, clearcoat: 0.3
    }),
    babyBottle: () => mat('smBabyBottle', {
        color: 0xf8f0e0, transmission: 0.65, thickness: 0.5,
        roughness: 0.1, clearcoat: 0.9, ior: 1.45,
        transparent: true, opacity: 0.92
    }),
    pacifier: () => mat('smPacifier', {
        color: 0xffc8d8, roughness: 0.3, clearcoat: 0.75
    }),
    babyFormula: () => mat('smBabyFormula', {
        color: 0xf5e8b8, metalness: 0.6, roughness: 0.35, clearcoat: 0.5
    }),

    /* ---------- Pet ---------- */
    petFoodBag: () => mat('smPetFoodBag', {
        color: 0xd97706, roughness: 0.4, clearcoat: 0.65, metalness: 0.1
    }),
    petBowl: () => mat('smPetBowl', {
        color: 0xe0e0e0, metalness: 0.65, roughness: 0.25, clearcoat: 0.85
    }),
    petCollar: () => mat('smPetCollar', {
        color: 0xc4181e, roughness: 0.42, clearcoat: 0.55
    }),

    /* ---------- Spices ---------- */
    spiceRed: () => mat('smSpiceRed', {
        map: TEX.spiceRed, roughness: 0.72, clearcoat: 0.15
    }),
    spiceYellow: () => mat('smSpiceYellow', {
        map: TEX.spiceYellow, roughness: 0.72, clearcoat: 0.15
    }),
    spiceOrange: () => mat('smSpiceOrange', {
        map: TEX.spiceOrange, roughness: 0.72, clearcoat: 0.15
    }),
    spiceJarGlass: () => mat('smSpiceJarGlass', {
        color: 0xffffff, transmission: 0.85, thickness: 0.4,
        roughness: 0.08, clearcoat: 0.95, ior: 1.5
    }),
    spiceJarLid: () => mat('smSpiceJarLid', {
        color: 0xb87333, metalness: 0.7, roughness: 0.3, clearcoat: 0.85
    }),

    /* ---------- Dry / Nuts ---------- */
    nutBrown: () => mat('smNutBrown', {
        map: TEX.nutBrown, bumpMap: TEX.bump, bumpScale: 0.025,
        roughness: 0.55, clearcoat: 0.45
    }),
    nutGreen: () => mat('smNutGreen', {
        map: TEX.nutGreen, bumpMap: TEX.bump, bumpScale: 0.02,
        roughness: 0.5, clearcoat: 0.5
    }),
    pistachio: () => mat('smPistachio', {
        color: 0xc8d478, roughness: 0.48, clearcoat: 0.5
    }),
    walnut: () => mat('smWalnut', {
        color: 0x6b3f24, bumpMap: TEX.bump, bumpScale: 0.04,
        roughness: 0.62, clearcoat: 0.35
    }),
    almond: () => mat('smAlmond', {
        color: 0xdcb482, bumpMap: TEX.bump, bumpScale: 0.024,
        roughness: 0.55, clearcoat: 0.42
    }),
    raisin: () => mat('smRaisin', {
        color: 0x5a2c14, bumpMap: TEX.bump, bumpScale: 0.03,
        roughness: 0.62, clearcoat: 0.3
    }),
    date: () => mat('smDate', {
        color: 0x4a2010, roughness: 0.55, clearcoat: 0.4
    }),
    driedFig: () => mat('smDriedFig', {
        color: 0x9a6a3a, roughness: 0.7, clearcoat: 0.25
    }),

    /* ---------- Shared ---------- */
    paperLabel: () => mat('smPaperLabel', {
        color: 0xf5f5f0, roughness: 0.75, clearcoat: 0.1
    }),
    porcelain: () => mat('smPorcelain', {
        color: 0xffffff, roughness: 0.12, clearcoat: 1.0
    }),
    woodBoard: () => mat('smWoodBoard', {
        color: 0x8a5a2a, bumpMap: TEX.bump, bumpScale: 0.04,
        roughness: 0.75, clearcoat: 0.25
    }),
    frostParticleMat: () => cachedMaterial('smFrostParticle', () => new THREE.PointsMaterial({
        map: TEX.particle,
        size: 0.22,
        color: 0xdaf0ff,
        transparent: true,
        opacity: 0.72,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        sizeAttenuation: true
    }))
};

/* ============================================================
   GEOMETRY PRIMITIVES — supermarket edition
   ============================================================ */

/* ---------- FRUITS ---------- */

export function createAppleMesh(radius, matFn, seed) {
    const key = `sm-apple-${radius.toFixed(2)}`;
    const geo = cachedGeometry(key, () => {
        const g = new THREE.SphereGeometry(radius, 64, 48);
        const pos = g.attributes.position;
        const rng = mulberry32(55221);
        for (let i = 0; i < pos.count; i++) {
            let x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
            const a = Math.atan2(z, x);
            y = y * 0.95;
            const dip = Math.max(0, 1 - Math.pow(Math.hypot(x, z) / (radius * 0.4), 2)) * 0.25;
            if (y > 0) y -= dip * radius;
            const lobe = 1 + Math.sin(a * 5) * 0.025 + Math.cos(a * 3) * 0.018;
            x *= lobe; z *= lobe;
            pos.setXYZ(i, x, y, z);
        }
        g.computeVertexNormals();
        return g;
    });
    const m = new THREE.Mesh(geo, matFn());
    m.castShadow = m.receiveShadow = true;

    const stemGeo = cachedGeometry('sm-apple-stem', () => {
        const g = new THREE.CylinderGeometry(0.02, 0.028, 0.32, 10);
        return g;
    });
    const stem = new THREE.Mesh(stemGeo, cachedMaterial('smAppleStem', () => new THREE.MeshStandardMaterial({ color: 0x5a3a18, roughness: 0.85 })));
    stem.position.set(0, radius * 0.9, 0);
    stem.rotation.z = 0.12;
    m.add(stem);

    const leafGeo = cachedGeometry('sm-apple-leaf', () => {
        const g = new THREE.PlaneGeometry(0.22, 0.4, 8, 8);
        const p = g.attributes.position;
        for (let i = 0; i < p.count; i++) {
            const px = p.getX(i), py = p.getY(i);
            p.setZ(i, Math.abs(px) * 0.2 + Math.sin(py * Math.PI) * 0.14);
        }
        g.computeVertexNormals();
        return g;
    });
    const leaf = new THREE.Mesh(leafGeo, cachedMaterial('smAppleLeaf', () => new THREE.MeshPhysicalMaterial({
        color: 0x3f7a26, roughness: 0.4, side: THREE.DoubleSide,
        sheen: 0.5, sheenColor: new THREE.Color(0xa0d860)
    })));
    leaf.position.set(0.15, radius * 0.95, 0.05);
    leaf.rotation.set(-Math.PI / 2 + 0.3, 0, 0.4);
    m.add(leaf);

    return m;
}

export function createBananaMesh(matFn, seed) {
    const key = 'sm-banana';
    const geo = cachedGeometry(key, () => {
        class BananaCurve extends THREE.Curve {
            getPoint(t, target = new THREE.Vector3()) {
                const angle = (t - 0.5) * Math.PI * 0.9;
                const bend = -0.6;
                return target.set(Math.sin(angle) * 1.4, Math.cos(angle) * 0.4 - 0.4, bend * t);
            }
        }
        const g = new THREE.TubeGeometry(new BananaCurve(), 96, 0.22, 20, false);
        const p = g.attributes.position;
        for (let i = 0; i < p.count; i++) {
            const py = p.getY(i);
            if (Math.abs(py) < 0.05) {
                p.setY(i, py - 0.05);
            }
        }
        g.computeVertexNormals();
        return g;
    });
    const m = new THREE.Mesh(geo, matFn());
    m.castShadow = m.receiveShadow = true;
    return m;
}

export function createOrangeMesh(radius, matFn, seed) {
    const key = `sm-orange-${radius.toFixed(2)}`;
    const geo = cachedGeometry(key, () => {
        const g = new THREE.SphereGeometry(radius, 64, 48);
        const pos = g.attributes.position;
        const rng = mulberry32(66112);
        for (let i = 0; i < pos.count; i++) {
            let x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
            const a = Math.atan2(z, x);
            const b = Math.asin(Math.min(1, Math.max(-1, y / radius)));
            const n = Math.sin(a * 9) * Math.cos(b * 7) * 0.012 + (rng() - 0.5) * 0.006;
            x *= (1 + n); y *= (1 + n); z *= (1 + n);
            pos.setXYZ(i, x, y, z);
        }
        g.computeVertexNormals();
        return g;
    });
    const m = new THREE.Mesh(geo, matFn());
    m.castShadow = m.receiveShadow = true;
    return m;
}

export function createBerryMesh(radius, matFn, seed) {
    const key = `sm-berry-${radius.toFixed(2)}`;
    const geo = cachedGeometry(key, () => {
        const g = new THREE.SphereGeometry(radius, 32, 24);
        const pos = g.attributes.position;
        for (let i = 0; i < pos.count; i++) {
            let x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
            const a = Math.atan2(z, x);
            const bump = 1 + Math.sin(a * 8) * 0.015;
            x *= bump; z *= bump;
            pos.setXYZ(i, x, y * 1.05, z);
        }
        g.computeVertexNormals();
        return g;
    });
    const m = new THREE.Mesh(geo, matFn());
    m.castShadow = m.receiveShadow = true;
    return m;
}

export function createGrapeCluster(count, seed) {
    const group = new THREE.Group();
    const berryGeo = cachedGeometry('sm-grape-berry', () => {
        const g = new THREE.SphereGeometry(0.14, 20, 16);
        const p = g.attributes.position;
        for (let i = 0; i < p.count; i++) {
            p.setY(i, p.getY(i) * 1.15);
        }
        g.computeVertexNormals();
        return g;
    });
    const grapeMat = SM.grape();
    const rng = mulberry32(77221);

    for (let r = 0; r < 6; r++) {
        const ringCount = 6 - Math.floor(r / 1.5);
        const ringRadius = r * 0.16;
        const ringY = -r * 0.18;
        for (let i = 0; i < ringCount; i++) {
            const a = (i / ringCount) * Math.PI * 2 + r * 0.4;
            const berry = new THREE.Mesh(berryGeo, grapeMat);
            berry.position.set(
                Math.cos(a) * ringRadius + (rng() - 0.5) * 0.05,
                ringY + (rng() - 0.5) * 0.05,
                Math.sin(a) * ringRadius + (rng() - 0.5) * 0.05
            );
            berry.castShadow = true;
            group.add(berry);
        }
    }
    return group;
}

export function createCherryPair(matFn, seed) {
    const group = new THREE.Group();
    const geo = cachedGeometry('sm-cherry', () => new THREE.SphereGeometry(0.2, 24, 20));
    const m1 = new THREE.Mesh(geo, matFn());
    m1.position.set(-0.14, 0, 0);
    const m2 = new THREE.Mesh(geo, matFn());
    m2.position.set(0.14, 0, 0);
    m1.castShadow = m2.castShadow = true;
    group.add(m1, m2);

    const stemMat = cachedMaterial('smCherryStem', () => new THREE.MeshStandardMaterial({ color: 0x3d2010, roughness: 0.8 }));
    const stemGeo = cachedGeometry('sm-cherry-stem', () => new THREE.CylinderGeometry(0.012, 0.012, 0.35, 8));
    const s1 = new THREE.Mesh(stemGeo, stemMat);
    s1.position.set(-0.1, 0.3, 0);
    s1.rotation.z = -0.2;
    const s2 = new THREE.Mesh(stemGeo, stemMat);
    s2.position.set(0.1, 0.3, 0);
    s2.rotation.z = 0.2;
    group.add(s1, s2);
    return group;
}

export function createDateFruitMesh(matFn, seed) {
    const key = 'sm-date';
    const geo = cachedGeometry(key, () => {
        const g = new THREE.SphereGeometry(0.32, 32, 24);
        const p = g.attributes.position;
        for (let i = 0; i < p.count; i++) {
            let x = p.getX(i), y = p.getY(i), z = p.getZ(i);
            const a = Math.atan2(z, x);
            const taper = 1 - Math.pow(y / 0.32, 2) * 0.35;
            x *= taper; z *= taper;
            const wrinkle = 1 + Math.sin(a * 14) * 0.02;
            x *= wrinkle; z *= wrinkle;
            p.setXYZ(i, x, y * 1.6, z);
        }
        g.computeVertexNormals();
        return g;
    });
    const m = new THREE.Mesh(geo, matFn());
    m.castShadow = m.receiveShadow = true;
    return m;
}

export function createKiwiMesh(matFn, seed) {
    const key = 'sm-kiwi';
    const geo = cachedGeometry(key, () => {
        const g = new THREE.SphereGeometry(0.42, 32, 24);
        const p = g.attributes.position;
        const rng = mulberry32(99112);
        for (let i = 0; i < p.count; i++) {
            let x = p.getX(i), y = p.getY(i), z = p.getZ(i);
            const fuzz = 1 + (rng() - 0.5) * 0.02;
            x *= fuzz; y *= fuzz; z *= fuzz;
            p.setXYZ(i, x, y * 1.2, z);
        }
        g.computeVertexNormals();
        return g;
    });
    const m = new THREE.Mesh(geo, matFn());
    m.castShadow = m.receiveShadow = true;
    return m;
}

/* ---------- VEGETABLES ---------- */

export function createLeafyHead(radius, matFn, seed) {
    const group = new THREE.Group();
    const rng = mulberry32(22331);
    for (let i = 0; i < 6; i++) {
        const geo = cachedGeometry(`sm-leaf-${i}-${radius.toFixed(2)}`, () => {
            const g = new THREE.SphereGeometry(radius * (0.7 + rng() * 0.4), 48, 32, 0, Math.PI * 2, 0, Math.PI * 0.75);
            const p = g.attributes.position;
            for (let j = 0; j < p.count; j++) {
                let x = p.getX(j), y = p.getY(j), z = p.getZ(j);
                const a = Math.atan2(z, x);
                const ruffle = 1 + Math.sin(a * 8) * 0.08;
                x *= ruffle; z *= ruffle;
                p.setXYZ(j, x, y * 0.9, z);
            }
            g.computeVertexNormals();
            return g;
        });
        const leaf = new THREE.Mesh(geo, matFn());
        leaf.rotation.y = (i / 6) * Math.PI * 2;
        leaf.rotation.x = (rng() - 0.5) * 0.15;
        leaf.castShadow = true;
        group.add(leaf);
    }
    return group;
}

export function createCarrotMesh(matFn, seed) {
    const key = 'sm-carrot';
    const geo = cachedGeometry(key, () => {
        const g = new THREE.ConeGeometry(0.22, 1.4, 20, 12);
        const p = g.attributes.position;
        const rng = mulberry32(44771);
        for (let i = 0; i < p.count; i++) {
            let x = p.getX(i), y = p.getY(i), z = p.getZ(i);
            const a = Math.atan2(z, x);
            const n = 1 + Math.sin(a * 8) * 0.015 + (rng() - 0.5) * 0.01;
            x *= n; z *= n;
            p.setXYZ(i, x, y, z);
        }
        g.computeVertexNormals();
        return g;
    });
    const m = new THREE.Mesh(geo, matFn());
    m.rotation.z = Math.PI / 2;
    m.castShadow = m.receiveShadow = true;
    return m;
}

export function createBroccoliHead(matFn, seed) {
    const group = new THREE.Group();
    const rng = mulberry32(55221);
    const stemGeo = cachedGeometry('sm-broccoli-stem', () => new THREE.CylinderGeometry(0.15, 0.2, 0.5, 12));
    const stem = new THREE.Mesh(stemGeo, cachedMaterial('smBroccoliStem', () => new THREE.MeshPhysicalMaterial({
        color: 0x5fa83a, roughness: 0.55, clearcoat: 0.35
    })));
    stem.position.y = -0.25;
    group.add(stem);

    const floretMat = SM.broccoli();
    const floretGeo = cachedGeometry('sm-broccoli-floret', () => new THREE.SphereGeometry(0.15, 16, 12));
    for (let i = 0; i < 22; i++) {
        const f = new THREE.Mesh(floretGeo, floretMat);
        const phi = rng() * Math.PI;
        const theta = rng() * Math.PI * 2;
        const r = 0.22 + rng() * 0.14;
        f.position.set(Math.sin(phi) * Math.cos(theta) * r, r * 0.8 - 0.05, Math.sin(phi) * Math.sin(theta) * r);
        f.scale.setScalar(0.75 + rng() * 0.6);
        f.castShadow = true;
        group.add(f);
    }
    return group;
}

export function createCauliflowerHead(matFn, seed) {
    const group = new THREE.Group();
    const rng = mulberry32(66221);
    const floretMat = SM.cauliflower();
    const floretGeo = cachedGeometry('sm-cauli-floret', () => new THREE.SphereGeometry(0.13, 16, 12));
    for (let i = 0; i < 26; i++) {
        const f = new THREE.Mesh(floretGeo, floretMat);
        const phi = rng() * Math.PI;
        const theta = rng() * Math.PI * 2;
        const r = 0.24 + rng() * 0.1;
        f.position.set(Math.sin(phi) * Math.cos(theta) * r, r * 0.8, Math.sin(phi) * Math.sin(theta) * r);
        f.scale.setScalar(0.7 + rng() * 0.6);
        f.castShadow = true;
        group.add(f);
    }
    const stemGeo = cachedGeometry('sm-cauli-stem', () => new THREE.CylinderGeometry(0.14, 0.18, 0.4, 12));
    const stem = new THREE.Mesh(stemGeo, cachedMaterial('smCauliStem', () => new THREE.MeshPhysicalMaterial({
        color: 0xd8d4b0, roughness: 0.7
    })));
    stem.position.y = -0.2;
    group.add(stem);
    return group;
}

export function createOnionMesh(radius, matFn, seed) {
    const key = `sm-onion-${radius.toFixed(2)}`;
    const geo = cachedGeometry(key, () => {
        const g = new THREE.SphereGeometry(radius, 48, 32);
        const p = g.attributes.position;
        for (let i = 0; i < p.count; i++) {
            let x = p.getX(i), y = p.getY(i), z = p.getZ(i);
            const a = Math.atan2(z, x);
            y *= 1.15;
            const ridge = 1 + Math.sin(a * 6) * 0.02;
            x *= ridge; z *= ridge;
            if (y > radius * 0.85) {
                y = radius * 0.85 + Math.pow(y - radius * 0.85, 0.55) * 0.6;
            }
            if (y < -radius * 0.85) {
                y = -radius * 0.85 - Math.pow(-y - radius * 0.85, 0.55) * 0.4;
            }
            p.setXYZ(i, x, y, z);
        }
        g.computeVertexNormals();
        return g;
    });
    const m = new THREE.Mesh(geo, matFn());
    m.castShadow = m.receiveShadow = true;
    return m;
}

export function createPotatoMesh(seed) {
    const key = 'sm-potato';
    const geo = cachedGeometry(key, () => {
        const g = new THREE.SphereGeometry(0.42, 32, 24);
        const p = g.attributes.position;
        const rng = mulberry32(88441);
        for (let i = 0; i < p.count; i++) {
            let x = p.getX(i), y = p.getY(i), z = p.getZ(i);
            const n = 1 + (rng() - 0.5) * 0.08 + Math.sin(x * 5) * Math.cos(z * 5) * 0.04;
            x *= n; y *= n * 1.15; z *= n * 0.85;
            p.setXYZ(i, x, y, z);
        }
        g.computeVertexNormals();
        return g;
    });
    const m = new THREE.Mesh(geo, SM.potato());
    m.castShadow = m.receiveShadow = true;

    const eyeMat = cachedMaterial('smPotatoEye', () => new THREE.MeshStandardMaterial({ color: 0x5a3a1e, roughness: 0.9 }));
    const eyeGeo = cachedGeometry('sm-potato-eye', () => new THREE.SphereGeometry(0.022, 8, 8));
    const rng2 = mulberry32(33322);
    for (let i = 0; i < 6; i++) {
        const eye = new THREE.Mesh(eyeGeo, eyeMat);
        const phi = rng2() * Math.PI;
        const theta = rng2() * Math.PI * 2;
        eye.position.set(
            Math.sin(phi) * Math.cos(theta) * 0.4,
            Math.cos(phi) * 0.45,
            Math.sin(phi) * Math.sin(theta) * 0.35
        );
        m.add(eye);
    }
    return m;
}

export function createBellPepperMesh(matFn, seed) {
    const key = 'sm-bellpepper';
    const geo = cachedGeometry(key, () => {
        const g = new THREE.SphereGeometry(0.38, 48, 32);
        const p = g.attributes.position;
        const rng = mulberry32(77551);
        for (let i = 0; i < p.count; i++) {
            let x = p.getX(i), y = p.getY(i), z = p.getZ(i);
            const a = Math.atan2(z, x);
            y *= 1.05;
            const lobes = 1 + Math.sin(a * 4) * 0.06 + Math.cos(a * 8) * 0.02;
            x *= lobes; z *= lobes;
            if (y > 0.25) y -= Math.pow((y - 0.25) * 2, 1.5) * 0.05;
            p.setXYZ(i, x, y, z);
        }
        g.computeVertexNormals();
        return g;
    });
    const m = new THREE.Mesh(geo, matFn());
    m.castShadow = m.receiveShadow = true;

    const stemGeo = cachedGeometry('sm-pepper-stem', () => new THREE.CylinderGeometry(0.03, 0.04, 0.18, 8));
    const stem = new THREE.Mesh(stemGeo, cachedMaterial('smPepperStem', () => new THREE.MeshPhysicalMaterial({
        color: 0x2e5a1a, roughness: 0.6
    })));
    stem.position.y = 0.42;
    m.add(stem);
    return m;
}

export function createEggplantMesh(matFn, seed) {
    const key = 'sm-eggplant';
    const geo = cachedGeometry(key, () => {
        const g = new THREE.SphereGeometry(0.34, 48, 32);
        const p = g.attributes.position;
        for (let i = 0; i < p.count; i++) {
            let x = p.getX(i), y = p.getY(i), z = p.getZ(i);
            const a = Math.atan2(z, x);
            const taper = 1 - Math.pow(Math.max(0, y) / 0.34, 2) * 0.45;
            x *= taper; z *= taper;
            const ridge = 1 + Math.sin(a * 7) * 0.03;
            x *= ridge; z *= ridge;
            p.setXYZ(i, x, y * 1.8, z);
        }
        g.computeVertexNormals();
        return g;
    });
    const m = new THREE.Mesh(geo, matFn());
    m.castShadow = m.receiveShadow = true;

    const capGeo = cachedGeometry('sm-eggplant-cap', () => {
        const g = new THREE.SphereGeometry(0.14, 16, 10, 0, Math.PI * 2, 0, Math.PI * 0.55);
        return g;
    });
    const cap = new THREE.Mesh(capGeo, cachedMaterial('smEggplantCap', () => new THREE.MeshPhysicalMaterial({
        color: 0x2e5a1a, roughness: 0.5
    })));
    cap.position.y = 0.62;
    m.add(cap);
    return m;
}

export function createZucchiniMesh(matFn, seed) {
    const key = 'sm-zucchini';
    const geo = cachedGeometry(key, () => {
        const g = new THREE.CylinderGeometry(0.2, 0.24, 1.6, 24, 20);
        const p = g.attributes.position;
        const rng = mulberry32(11556);
        for (let i = 0; i < p.count; i++) {
            let x = p.getX(i), y = p.getY(i), z = p.getZ(i);
            const a = Math.atan2(z, x);
            const n = 1 + Math.sin(a * 9) * 0.02 + (rng() - 0.5) * 0.02;
            x *= n; z *= n;
            p.setXYZ(i, x, y, z);
        }
        g.computeVertexNormals();
        return g;
    });
    const m = new THREE.Mesh(geo, matFn());
    m.rotation.z = Math.PI / 2;
    m.castShadow = m.receiveShadow = true;
    return m;
}

export function createPumpkinMesh(matFn, seed) {
    const key = 'sm-pumpkin';
    const geo = cachedGeometry(key, () => {
        const g = new THREE.SphereGeometry(0.55, 48, 32);
        const p = g.attributes.position;
        for (let i = 0; i < p.count; i++) {
            let x = p.getX(i), y = p.getY(i), z = p.getZ(i);
            const a = Math.atan2(z, x);
            y *= 0.75;
            const lobes = 1 + Math.sin(a * 7) * 0.05;
            x *= lobes; z *= lobes;
            p.setXYZ(i, x, y, z);
        }
        g.computeVertexNormals();
        return g;
    });
    const m = new THREE.Mesh(geo, matFn());
    m.castShadow = m.receiveShadow = true;

    const stemGeo = cachedGeometry('sm-pumpkin-stem', () => new THREE.CylinderGeometry(0.04, 0.06, 0.2, 8));
    const stem = new THREE.Mesh(stemGeo, cachedMaterial('smPumpkinStem', () => new THREE.MeshPhysicalMaterial({
        color: 0x4a3a10, roughness: 0.85
    })));
    stem.position.y = 0.46;
    m.add(stem);
    return m;
}

export function createMushroomMesh(radius, matFn, seed) {
    const group = new THREE.Group();
    const capGeo = cachedGeometry(`sm-mushroom-cap-${radius.toFixed(2)}`, () => {
        const g = new THREE.SphereGeometry(radius, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.55);
        const p = g.attributes.position;
        for (let i = 0; i < p.count; i++) {
            let x = p.getX(i), y = p.getY(i), z = p.getZ(i);
            const a = Math.atan2(z, x);
            p.setY(i, y * 0.65);
        }
        g.computeVertexNormals();
        return g;
    });
    const cap = new THREE.Mesh(capGeo, matFn());
    cap.position.y = radius * 0.25;
    group.add(cap);

    const stemGeo = cachedGeometry(`sm-mushroom-stem-${radius.toFixed(2)}`, () => new THREE.CylinderGeometry(radius * 0.3, radius * 0.35, radius * 0.7, 16));
    const stem = new THREE.Mesh(stemGeo, matFn());
    stem.position.y = -radius * 0.15;
    group.add(stem);

    group.traverse(o => { if (o.isMesh) o.castShadow = true; });
    return group;
}

export function createCornCob(matFn, seed) {
    const group = new THREE.Group();
    const cobGeo = cachedGeometry('sm-corn-cob', () => {
        const g = new THREE.CylinderGeometry(0.14, 0.14, 0.7, 20, 12);
        const p = g.attributes.position;
        for (let i = 0; i < p.count; i++) {
            let x = p.getX(i), y = p.getY(i), z = p.getZ(i);
            const a = Math.atan2(z, x);
            const kern = 1 + Math.sin(a * 18) * 0.02;
            x *= kern; z *= kern;
            p.setXYZ(i, x, y, z);
        }
        g.computeVertexNormals();
        return g;
    });
    const cob = new THREE.Mesh(cobGeo, matFn());
    cob.castShadow = true;
    group.add(cob);

    const huskMat = SM.leafy();
    const huskGeo = cachedGeometry('sm-corn-husk', () => {
        const g = new THREE.PlaneGeometry(0.35, 0.75, 8, 12);
        const p = g.attributes.position;
        for (let i = 0; i < p.count; i++) {
            const px = p.getX(i), py = p.getY(i);
            p.setZ(i, Math.abs(px) * 0.4 + Math.sin(py * Math.PI) * 0.1);
        }
        g.computeVertexNormals();
        return g;
    });
    for (let i = 0; i < 2; i++) {
        const husk = new THREE.Mesh(huskGeo, huskMat);
        husk.rotation.y = i * Math.PI;
        husk.position.set(0, -0.2, 0.12);
        husk.rotation.x = 0.15;
        husk.castShadow = true;
        group.add(husk);
    }
    return group;
}

export function createHerbBundle(seed) {
    const group = new THREE.Group();
    const rng = mulberry32(99112);
    const stemMat = cachedMaterial('smHerbStem', () => new THREE.MeshPhysicalMaterial({
        color: 0x4a7a2a, roughness: 0.7
    }));
    const leafMat = SM.herbBundle();
    const stemGeo = cachedGeometry('sm-herb-stem', () => new THREE.CylinderGeometry(0.015, 0.02, 0.6, 6));
    const leafGeo = cachedGeometry('sm-herb-leaf', () => {
        const g = new THREE.PlaneGeometry(0.18, 0.28, 6, 8);
        const p = g.attributes.position;
        for (let i = 0; i < p.count; i++) {
            const px = p.getX(i), py = p.getY(i);
            p.setZ(i, Math.abs(px) * 0.25 + Math.sin(py * Math.PI) * 0.08);
        }
        g.computeVertexNormals();
        return g;
    });
    for (let i = 0; i < 8; i++) {
        const stem = new THREE.Mesh(stemGeo, stemMat);
        stem.position.set((rng() - 0.5) * 0.15, 0.1, (rng() - 0.5) * 0.15);
        stem.rotation.set((rng() - 0.5) * 0.4, rng() * Math.PI * 2, (rng() - 0.5) * 0.4);
        group.add(stem);
        for (let j = 0; j < 3; j++) {
            const leaf = new THREE.Mesh(leafGeo, leafMat);
            leaf.position.set(stem.position.x + (rng() - 0.5) * 0.1, 0.2 + j * 0.14, stem.position.z + (rng() - 0.5) * 0.1);
            leaf.rotation.set(-Math.PI / 2 + (rng() - 0.5) * 0.6, rng() * Math.PI * 2, 0);
            leaf.castShadow = true;
            group.add(leaf);
        }
    }
    return group;
}

/* ---------- DAIRY ---------- */

export function createMilkCarton(matFn, seed) {
    const key = 'sm-milk-carton';
    const geo = cachedGeometry(key, () => {
        const g = new THREE.BoxGeometry(0.65, 1.5, 0.65, 4, 8, 4);
        const p = g.attributes.position;
        for (let i = 0; i < p.count; i++) {
            let x = p.getX(i), y = p.getY(i), z = p.getZ(i);
            if (y > 0.6) {
                const t = (y - 0.6) / 0.15;
                x *= 1 - t * 0.15;
                z *= 1 - t * 0.15;
            }
            if (y > 0.7) y += Math.pow((y - 0.7) / 0.05, 2) * 0.1;
            p.setXYZ(i, x, y, z);
        }
        g.computeVertexNormals();
        return g;
    });
    const m = new THREE.Mesh(geo, matFn());
    m.castShadow = m.receiveShadow = true;

    const capGeo = cachedGeometry('sm-milk-cap', () => new THREE.CylinderGeometry(0.12, 0.12, 0.08, 16));
    const cap = new THREE.Mesh(capGeo, SM.bottleCap());
    cap.position.y = 0.82;
    m.add(cap);
    return m;
}

export function createYogurtCup(matFn, seed) {
    const group = new THREE.Group();
    const bodyGeo = cachedGeometry('sm-yogurt-body', () => {
        const g = new THREE.CylinderGeometry(0.42, 0.36, 0.6, 40, 4);
        return g;
    });
    const body = new THREE.Mesh(bodyGeo, matFn());
    body.castShadow = body.receiveShadow = true;
    group.add(body);

    const lidMat = cachedMaterial('smYogurtLid', () => new THREE.MeshPhysicalMaterial({
        color: 0xf0f8ff, roughness: 0.28, clearcoat: 0.85, metalness: 0.3
    }));
    const lidGeo = cachedGeometry('sm-yogurt-lid', () => new THREE.CylinderGeometry(0.44, 0.44, 0.03, 40));
    const lid = new THREE.Mesh(lidGeo, lidMat);
    lid.position.y = 0.315;
    group.add(lid);
    return group;
}

export function createCheeseWedge(matFn, seed) {
    const key = 'sm-cheese-wedge';
    const geo = cachedGeometry(key, () => {
        const g = new THREE.CylinderGeometry(0.6, 0.6, 0.35, 4, 1, false, 0, Math.PI * 0.45);
        const p = g.attributes.position;
        for (let i = 0; i < p.count; i++) {
            let x = p.getX(i), y = p.getY(i), z = p.getZ(i);
            if (Math.abs(y) > 0.15) {
                const n = Math.sin(x * 8) * Math.cos(z * 8) * 0.01;
                p.setY(i, y + n);
            }
            p.setXYZ(i, x, y, z);
        }
        g.computeVertexNormals();
        return g;
    });
    const m = new THREE.Mesh(geo, matFn());
    m.castShadow = m.receiveShadow = true;
    return m;
}

export function createButterBlock(matFn, seed) {
    const key = 'sm-butter-block';
    const geo = cachedGeometry(key, () => {
        const g = new THREE.BoxGeometry(0.7, 0.32, 0.4, 8, 4, 4);
        const p = g.attributes.position;
        for (let i = 0; i < p.count; i++) {
            let x = p.getX(i), y = p.getY(i), z = p.getZ(i);
            if (Math.abs(y) > 0.14) {
                const n = Math.sin(x * 6) * Math.cos(z * 6) * 0.005;
                p.setY(i, y + n);
            }
            p.setXYZ(i, x, y, z);
        }
        g.computeVertexNormals();
        return g;
    });
    const m = new THREE.Mesh(geo, matFn());
    m.castShadow = m.receiveShadow = true;
    return m;
}

export function createCreamTub(matFn, seed) {
    const group = new THREE.Group();
    const bodyGeo = cachedGeometry('sm-cream-tub', () => {
        const g = new THREE.CylinderGeometry(0.36, 0.32, 0.36, 32, 4);
        return g;
    });
    const body = new THREE.Mesh(bodyGeo, matFn());
    body.castShadow = body.receiveShadow = true;
    group.add(body);

    const lidGeo = cachedGeometry('sm-cream-lid', () => new THREE.CylinderGeometry(0.38, 0.38, 0.04, 32));
    const lid = new THREE.Mesh(lidGeo, cachedMaterial('smCreamLid', () => new THREE.MeshPhysicalMaterial({
        color: 0xf8f0e0, roughness: 0.32, clearcoat: 0.75
    })));
    lid.position.y = 0.2;
    group.add(lid);
    return group;
}

export function createEggMesh(matFn, seed) {
    const key = 'sm-egg';
    const geo = cachedGeometry(key, () => {
        const g = new THREE.SphereGeometry(0.16, 32, 24);
        const p = g.attributes.position;
        for (let i = 0; i < p.count; i++) {
            let x = p.getX(i), y = p.getY(i), z = p.getZ(i);
            const taper = 1 - Math.max(0, y / 0.16) * 0.35;
            x *= taper; z *= taper;
            y *= 1.35;
            p.setXYZ(i, x, y, z);
        }
        g.computeVertexNormals();
        return g;
    });
    const m = new THREE.Mesh(geo, matFn());
    m.castShadow = m.receiveShadow = true;
    return m;
}

export function createEggCarton(count, seed) {
    const group = new THREE.Group();
    const rng = mulberry32(66112);
    const trayMat = cachedMaterial('smEggTray', () => new THREE.MeshPhysicalMaterial({
        color: 0xc8b890, roughness: 0.85, clearcoat: 0.15
    }));
    const trayGeo = cachedGeometry('sm-egg-tray', () => new THREE.BoxGeometry(1.4, 0.06, 0.7));
    const tray = new THREE.Mesh(trayGeo, trayMat);
    tray.receiveShadow = true;
    group.add(tray);

    const holeGeo = cachedGeometry('sm-egg-hole', () => {
        const g = new THREE.CylinderGeometry(0.14, 0.14, 0.12, 16);
        return g;
    });
    const cols = 3;
    const rows = 2;
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const hole = new THREE.Mesh(holeGeo, trayMat);
            hole.position.set(-0.45 + c * 0.45, 0.03, -0.18 + r * 0.36);
            group.add(hole);
            if ((r * cols + c) < count) {
                const egg = createEggMesh(SM.eggShell, rng);
                egg.scale.setScalar(0.9);
                egg.position.set(-0.45 + c * 0.45, 0.16, -0.18 + r * 0.36);
                egg.rotation.z = (rng() - 0.5) * 0.5;
                group.add(egg);
            }
        }
    }
    return group;
}

export function createIceCreamTub(matFn, seed) {
    const group = new THREE.Group();
    const bodyGeo = cachedGeometry('sm-icecream-body', () => {
        const g = new THREE.CylinderGeometry(0.5, 0.44, 0.7, 40, 4);
        return g;
    });
    const body = new THREE.Mesh(bodyGeo, matFn());
    body.castShadow = body.receiveShadow = true;
    group.add(body);

    const lidGeo = cachedGeometry('sm-icecream-lid', () => new THREE.CylinderGeometry(0.52, 0.52, 0.05, 40));
    const lid = new THREE.Mesh(lidGeo, cachedMaterial('smIceCreamLid', () => new THREE.MeshPhysicalMaterial({
        color: 0xf8d8d8, roughness: 0.32, clearcoat: 0.8
    })));
    lid.position.y = 0.37;
    group.add(lid);
    return group;
}

/* ---------- MEAT / PROTEIN ---------- */

export function createMeatCut(matFn, seed) {
    const key = 'sm-meat-cut';
    const geo = cachedGeometry(key, () => {
        const g = new THREE.BoxGeometry(1.0, 0.35, 0.7, 24, 8, 16);
        const p = g.attributes.position;
        const rng = mulberry32(44821);
        for (let i = 0; i < p.count; i++) {
            let x = p.getX(i), y = p.getY(i), z = p.getZ(i);
            const n = Math.sin(x * 5) * Math.cos(z * 5) * 0.03 + (rng() - 0.5) * 0.02;
            p.setXYZ(i, x + n * 0.3, y + n, z + n * 0.3);
        }
        g.computeVertexNormals();
        return g;
    });
    const m = new THREE.Mesh(geo, matFn());
    m.castShadow = m.receiveShadow = true;
    return m;
}

export function createChickenBreast(matFn, seed) {
    const key = 'sm-chicken-breast';
    const geo = cachedGeometry(key, () => {
        const g = new THREE.SphereGeometry(0.45, 48, 32);
        const p = g.attributes.position;
        const rng = mulberry32(66112);
        for (let i = 0; i < p.count; i++) {
            let x = p.getX(i), y = p.getY(i), z = p.getZ(i);
            const a = Math.atan2(z, x);
            const n = 1 + Math.sin(a * 6) * 0.1 + (rng() - 0.5) * 0.03;
            x *= n; z *= n;
            p.setXYZ(i, x * 1.4, y * 0.5, z * 1.0);
        }
        g.computeVertexNormals();
        return g;
    });
    const m = new THREE.Mesh(geo, matFn());
    m.castShadow = m.receiveShadow = true;
    return m;
}

export function createFishFillet(matFn, seed) {
    const key = 'sm-fish-fillet';
    const geo = cachedGeometry(key, () => {
        const g = new THREE.SphereGeometry(0.5, 48, 32);
        const p = g.attributes.position;
        const rng = mulberry32(88112);
        for (let i = 0; i < p.count; i++) {
            let x = p.getX(i), y = p.getY(i), z = p.getZ(i);
            const a = Math.atan2(z, x);
            const n = 1 + Math.sin(a * 5) * 0.08 + (rng() - 0.5) * 0.02;
            x *= n; z *= n;
            p.setXYZ(i, x * 1.6, y * 0.35, z * 0.7);
        }
        g.computeVertexNormals();
        return g;
    });
    const m = new THREE.Mesh(geo, matFn());
    m.castShadow = m.receiveShadow = true;
    return m;
}

export function createShrimpGroup(count, seed) {
    const group = new THREE.Group();
    const rng = mulberry32(99331);
    const bodyMat = SM.shrimp();
    const bodyGeo = cachedGeometry('sm-shrimp-body', () => {
        class ShrimpCurve extends THREE.Curve {
            getPoint(t, target = new THREE.Vector3()) {
                const angle = t * Math.PI * 1.1;
                return target.set(Math.cos(angle) * 0.15, Math.sin(angle) * 0.05, angle * 0.2);
            }
        }
        return new THREE.TubeGeometry(new ShrimpCurve(), 32, 0.045, 8, false);
    });
    for (let i = 0; i < count; i++) {
        const s = new THREE.Mesh(bodyGeo, bodyMat);
        const a = rng() * Math.PI * 2;
        const r = rng() * 0.8;
        s.position.set(Math.cos(a) * r, 0, Math.sin(a) * r);
        s.rotation.set(rng() * Math.PI, rng() * Math.PI, rng() * Math.PI);
        s.castShadow = true;
        group.add(s);
    }
    return group;
}

export function createSausageLinks(count, matFn, seed) {
    const group = new THREE.Group();
    const rng = mulberry32(77221);
    const key = 'sm-sausage-link';
    const geo = cachedGeometry(key, () => {
        const g = new THREE.CylinderGeometry(0.11, 0.11, 0.85, 20, 12);
        const p = g.attributes.position;
        for (let i = 0; i < p.count; i++) {
            let x = p.getX(i), y = p.getY(i), z = p.getZ(i);
            const a = Math.atan2(z, x);
            const n = 1 + Math.sin(a * 12) * 0.02;
            x *= n; z *= n;
            p.setXYZ(i, x, y, z);
        }
        g.computeVertexNormals();
        return g;
    });
    for (let i = 0; i < count; i++) {
        const s = new THREE.Mesh(geo, matFn());
        const row = Math.floor(i / 4);
        const col = i % 4;
        s.position.set(-0.45 + col * 0.3, 0.1, -0.2 + row * 0.4);
        s.rotation.set(rng() * 0.1, rng() * 0.3, Math.PI / 2 + (rng() - 0.5) * 0.15);
        s.castShadow = true;
        group.add(s);
    }
    return group;
}

/* ---------- BREAD ---------- */

export function createFlatbread(radius, thickness, matFn, seed) {
    const key = `sm-flatbread-${radius.toFixed(2)}-${thickness.toFixed(2)}`;
    const geo = cachedGeometry(key, () => {
        const g = new THREE.CylinderGeometry(radius, radius, thickness, 64, 4);
        const p = g.attributes.position;
        const rng = mulberry32(33112);
        for (let i = 0; i < p.count; i++) {
            let x = p.getX(i), y = p.getY(i), z = p.getZ(i);
            if (y > 0) {
                const bumps = Math.sin(x * 4) * Math.cos(z * 4) * 0.02 + (rng() - 0.5) * 0.01;
                p.setY(i, y + bumps);
            }
        }
        g.computeVertexNormals();
        return g;
    });
    const m = new THREE.Mesh(geo, matFn());
    m.castShadow = m.receiveShadow = true;
    return m;
}

export function createToastSlice(matFn, seed) {
    const key = 'sm-toast-slice';
    const geo = cachedGeometry(key, () => {
        const g = new THREE.BoxGeometry(1.0, 0.14, 1.0, 12, 4, 12);
        const p = g.attributes.position;
        for (let i = 0; i < p.count; i++) {
            let x = p.getX(i), y = p.getY(i), z = p.getZ(i);
            if (Math.abs(y) > 0.05) {
                const corner = Math.max(Math.abs(x), Math.abs(z));
                if (corner > 0.35) {
                    const cut = 1 - (corner - 0.35) * 0.15;
                    x *= cut; z *= cut;
                }
            }
            p.setXYZ(i, x, y, z);
        }
        g.computeVertexNormals();
        return g;
    });
    const m = new THREE.Mesh(geo, matFn());
    m.castShadow = m.receiveShadow = true;
    return m;
}

export function createBaguetteShape(matFn, seed) {
    const key = 'sm-baguette';
    const geo = cachedGeometry(key, () => {
        const g = new THREE.CylinderGeometry(0.22, 0.22, 2.0, 48, 24);
        const p = g.attributes.position;
        const rng = mulberry32(44112);
        for (let i = 0; i < p.count; i++) {
            let x = p.getX(i), y = p.getY(i), z = p.getZ(i);
            const taper = 1 - Math.pow(Math.abs(y) / 1.0, 4) * 0.3;
            x *= taper; z *= taper;
            const notch = Math.sin(y * 12) * 0.008;
            x += notch; z += notch;
            p.setXYZ(i, x, y, z);
        }
        g.computeVertexNormals();
        return g;
    });
    const m = new THREE.Mesh(geo, matFn());
    m.rotation.z = Math.PI / 2;
    m.castShadow = m.receiveShadow = true;
    return m;
}

/* ---------- CANNED / JARS ---------- */

export function createTinCan(matFn, seed) {
    const group = new THREE.Group();
    const bodyGeo = cachedGeometry('sm-tin-can-body', () => new THREE.CylinderGeometry(0.35, 0.35, 0.6, 48, 4));
    const body = new THREE.Mesh(bodyGeo, matFn());
    body.castShadow = body.receiveShadow = true;
    group.add(body);

    const topMat = cachedMaterial('smTinTop', () => new THREE.MeshPhysicalMaterial({
        color: 0xd0d4d8, metalness: 0.9, roughness: 0.24, clearcoat: 0.85
    }));
    const topGeo = cachedGeometry('sm-tin-top', () => new THREE.CylinderGeometry(0.36, 0.36, 0.02, 48));
    const top = new THREE.Mesh(topGeo, topMat);
    top.position.y = 0.31;
    group.add(top);
    const bot = new THREE.Mesh(topGeo, topMat);
    bot.position.y = -0.31;
    group.add(bot);
    return group;
}

export function createGlassJar(matFn, seed) {
    const group = new THREE.Group();
    const bodyGeo = cachedGeometry('sm-jar-body', () => {
        const g = new THREE.CylinderGeometry(0.32, 0.3, 0.55, 32, 6);
        return g;
    });
    const body = new THREE.Mesh(bodyGeo, matFn());
    body.castShadow = body.receiveShadow = true;
    group.add(body);

    const lidMat = SM.jarLid();
    const lidGeo = cachedGeometry('sm-jar-lid', () => new THREE.CylinderGeometry(0.34, 0.34, 0.08, 32));
    const lid = new THREE.Mesh(lidGeo, lidMat);
    lid.position.y = 0.32;
    group.add(lid);
    return group;
}

export function createSauceBottle(matFn, seed) {
    const group = new THREE.Group();
    const bodyGeo = cachedGeometry('sm-sauce-body', () => new THREE.CylinderGeometry(0.3, 0.3, 0.7, 32, 4));
    const body = new THREE.Mesh(bodyGeo, matFn());
    body.castShadow = body.receiveShadow = true;
    group.add(body);

    const neckGeo = cachedGeometry('sm-sauce-neck', () => new THREE.CylinderGeometry(0.12, 0.18, 0.2, 20));
    const neck = new THREE.Mesh(neckGeo, matFn());
    neck.position.y = 0.45;
    group.add(neck);

    const capGeo = cachedGeometry('sm-sauce-cap', () => new THREE.CylinderGeometry(0.14, 0.14, 0.08, 20));
    const cap = new THREE.Mesh(capGeo, SM.bottleCap());
    cap.position.y = 0.57;
    group.add(cap);
    return group;
}

/* ---------- SNACKS ---------- */

export function createSnackBag(matFn, seed) {
    const key = 'sm-snack-bag';
    const geo = cachedGeometry(key, () => {
        const g = new THREE.BoxGeometry(0.9, 1.3, 0.32, 12, 20, 6);
        const p = g.attributes.position;
        const rng = mulberry32(44112);
        for (let i = 0; i < p.count; i++) {
            let x = p.getX(i), y = p.getY(i), z = p.getZ(i);
            const bulge = 1 + Math.max(0, 1 - Math.pow(y / 0.5, 2)) * 0.15;
            z *= bulge;
            if (Math.abs(y) > 0.6) {
                const t = (Math.abs(y) - 0.6) / 0.05;
                x *= 1 - t * 0.15;
                z *= 1 - t * 0.4;
            }
            const wrinkle = 1 + (rng() - 0.5) * 0.03;
            x *= wrinkle;
            p.setXYZ(i, x, y, z);
        }
        g.computeVertexNormals();
        return g;
    });
    const m = new THREE.Mesh(geo, matFn());
    m.castShadow = m.receiveShadow = true;
    return m;
}

export function createChocolateBar(matFn, seed) {
    const key = 'sm-chocolate-bar';
    const geo = cachedGeometry(key, () => new THREE.BoxGeometry(0.9, 0.2, 0.5, 8, 4, 4));
    const m = new THREE.Mesh(geo, matFn());
    m.castShadow = m.receiveShadow = true;
    return m;
}

export function createBiscuitPack(matFn, seed) {
    const key = 'sm-biscuit-pack';
    const geo = cachedGeometry(key, () => {
        const g = new THREE.BoxGeometry(1.0, 1.2, 0.25, 8, 12, 4);
        const p = g.attributes.position;
        for (let i = 0; i < p.count; i++) {
            let x = p.getX(i), y = p.getY(i), z = p.getZ(i);
            if (Math.abs(y) > 0.55) {
                const t = (Math.abs(y) - 0.55) / 0.05;
                x *= 1 - t * 0.1;
                z *= 1 - t * 0.3;
            }
            p.setXYZ(i, x, y, z);
        }
        g.computeVertexNormals();
        return g;
    });
    const m = new THREE.Mesh(geo, matFn());
    m.castShadow = m.receiveShadow = true;
    return m;
}

/* ---------- DRINKS ---------- */

export function createSodaCanMesh(matFn, seed) {
    const group = new THREE.Group();
    const bodyGeo = cachedGeometry('sm-soda-can', () => new THREE.CylinderGeometry(0.35, 0.35, 0.65, 40, 4));
    const body = new THREE.Mesh(bodyGeo, matFn());
    body.castShadow = body.receiveShadow = true;
    group.add(body);

    const rimMat = cachedMaterial('smCanRim', () => new THREE.MeshPhysicalMaterial({
        color: 0xe0e4e8, metalness: 0.92, roughness: 0.2, clearcoat: 0.9
    }));
    const rimGeo = cachedGeometry('sm-can-rim', () => new THREE.TorusGeometry(0.33, 0.02, 8, 32));
    const topRim = new THREE.Mesh(rimGeo, rimMat);
    topRim.position.y = 0.33;
    topRim.rotation.x = Math.PI / 2;
    group.add(topRim);
    const botRim = new THREE.Mesh(rimGeo, rimMat);
    botRim.position.y = -0.33;
    botRim.rotation.x = Math.PI / 2;
    group.add(botRim);
    return group;
}

export function createBottleMesh(matFn, hasCap, seed) {
    const group = new THREE.Group();
    const profile = [
        new THREE.Vector2(0, 0),
        new THREE.Vector2(0.28, 0),
        new THREE.Vector2(0.32, 0.1),
        new THREE.Vector2(0.32, 0.7),
        new THREE.Vector2(0.24, 0.85),
        new THREE.Vector2(0.14, 1.0),
        new THREE.Vector2(0.14, 1.15),
        new THREE.Vector2(0.16, 1.2),
        new THREE.Vector2(0.16, 1.25),
        new THREE.Vector2(0, 1.25)
    ];
    const geo = cachedGeometry(`sm-bottle-${hasCap ? 'cap' : 'nocap'}`, () => new THREE.LatheGeometry(profile, 40));
    const body = new THREE.Mesh(geo, matFn());
    body.castShadow = body.receiveShadow = true;
    group.add(body);

    if (hasCap) {
        const capGeo = cachedGeometry('sm-bottle-cap', () => new THREE.CylinderGeometry(0.17, 0.17, 0.1, 20));
        const cap = new THREE.Mesh(capGeo, SM.bottleCap());
        cap.position.y = 1.28;
        group.add(cap);
    }
    return group;
}

export function createJuiceBox(matFn, seed) {
    const key = 'sm-juice-box';
    const geo = cachedGeometry(key, () => {
        const g = new THREE.BoxGeometry(0.55, 0.85, 0.42, 4, 8, 4);
        const p = g.attributes.position;
        for (let i = 0; i < p.count; i++) {
            let x = p.getX(i), y = p.getY(i), z = p.getZ(i);
            if (y > 0.3) {
                const t = (y - 0.3) / 0.1;
                x *= 1 - t * 0.1;
                z *= 1 - t * 0.2;
            }
            p.setXYZ(i, x, y, z);
        }
        g.computeVertexNormals();
        return g;
    });
    const m = new THREE.Mesh(geo, matFn());
    m.castShadow = m.receiveShadow = true;

    const strawMat = cachedMaterial('smStrawMat', () => new THREE.MeshPhysicalMaterial({
        color: 0xe0e0e0, roughness: 0.5, clearcoat: 0.35
    }));
    const strawGeo = cachedGeometry('sm-juice-straw', () => new THREE.CylinderGeometry(0.018, 0.018, 0.5, 8));
    const straw = new THREE.Mesh(strawGeo, strawMat);
    straw.position.set(0.15, 0.55, 0.15);
    straw.rotation.z = 0.15;
    m.add(straw);
    return m;
}

export function createTeaBox(matFn, seed) {
    const key = 'sm-tea-box';
    const geo = cachedGeometry(key, () => new THREE.BoxGeometry(0.85, 1.0, 0.55, 4, 8, 4));
    const m = new THREE.Mesh(geo, matFn());
    m.castShadow = m.receiveShadow = true;
    return m;
}

export function createCoffeeJar(matFn, seed) {
    const group = new THREE.Group();
    const bodyGeo = cachedGeometry('sm-coffee-body', () => {
        const g = new THREE.CylinderGeometry(0.4, 0.36, 0.65, 40, 4);
        return g;
    });
    const body = new THREE.Mesh(bodyGeo, matFn());
    body.castShadow = body.receiveShadow = true;
    group.add(body);

    const lidGeo = cachedGeometry('sm-coffee-lid', () => new THREE.CylinderGeometry(0.42, 0.42, 0.06, 40));
    const lid = new THREE.Mesh(lidGeo, SM.bottleCap());
    lid.position.y = 0.36;
    group.add(lid);
    return group;
}

/* ---------- HOUSEHOLD / PERSONAL ---------- */

export function createDetergentBottle(matFn, seed) {
    const group = new THREE.Group();
    const profile = [
        new THREE.Vector2(0, 0),
        new THREE.Vector2(0.38, 0),
        new THREE.Vector2(0.42, 0.1),
        new THREE.Vector2(0.42, 1.1),
        new THREE.Vector2(0.38, 1.2),
        new THREE.Vector2(0.36, 1.25),
        new THREE.Vector2(0, 1.25)
    ];
    const geo = cachedGeometry('sm-detergent-body', () => new THREE.LatheGeometry(profile, 40));
    const body = new THREE.Mesh(geo, matFn());
    body.castShadow = body.receiveShadow = true;
    group.add(body);

    const capGeo = cachedGeometry('sm-detergent-cap', () => new THREE.CylinderGeometry(0.2, 0.2, 0.14, 20));
    const cap = new THREE.Mesh(capGeo, matFn());
    cap.position.y = 1.32;
    group.add(cap);

    return group;
}

export function createSprayBottle(matFn, seed) {
    const group = new THREE.Group();
    const profile = [
        new THREE.Vector2(0, 0),
        new THREE.Vector2(0.24, 0),
        new THREE.Vector2(0.26, 0.1),
        new THREE.Vector2(0.26, 0.9),
        new THREE.Vector2(0.22, 1.05),
        new THREE.Vector2(0.14, 1.2),
        new THREE.Vector2(0.14, 1.35),
        new THREE.Vector2(0, 1.35)
    ];
    const geo = cachedGeometry('sm-spray-body', () => new THREE.LatheGeometry(profile, 40));
    const body = new THREE.Mesh(geo, matFn());
    body.castShadow = body.receiveShadow = true;
    group.add(body);

    const sprayMat = cachedMaterial('smSprayHead', () => new THREE.MeshPhysicalMaterial({
        color: 0xe8e8e8, roughness: 0.35, clearcoat: 0.6
    }));
    const headGeo = cachedGeometry('sm-spray-head', () => new THREE.BoxGeometry(0.35, 0.1, 0.15));
    const head = new THREE.Mesh(headGeo, sprayMat);
    head.position.set(-0.1, 1.42, 0);
    group.add(head);
    const nozzle = new THREE.Mesh(
        cachedGeometry('sm-spray-nozzle', () => new THREE.CylinderGeometry(0.03, 0.03, 0.08, 8)),
        sprayMat
    );
    nozzle.position.set(-0.28, 1.42, 0);
    nozzle.rotation.z = Math.PI / 2;
    group.add(nozzle);
    return group;
}

export function createTissueBoxMesh(matFn, seed) {
    const group = new THREE.Group();
    const boxGeo = cachedGeometry('sm-tissue-box', () => new THREE.BoxGeometry(1.1, 0.5, 0.55, 4, 4, 4));
    const box = new THREE.Mesh(boxGeo, matFn());
    box.castShadow = box.receiveShadow = true;
    group.add(box);

    const slotGeo = cachedGeometry('sm-tissue-slot', () => new THREE.BoxGeometry(0.6, 0.02, 0.18));
    const slotMat = cachedMaterial('smTissueSlot', () => new THREE.MeshPhysicalMaterial({
        color: 0x8a8a8a, roughness: 0.7
    }));
    const slot = new THREE.Mesh(slotGeo, slotMat);
    slot.position.y = 0.26;
    group.add(slot);

    const tissueMat = cachedMaterial('smTissue', () => new THREE.MeshPhysicalMaterial({
        color: 0xffffff, roughness: 0.85, clearcoat: 0.05
    }));
    const tissueGeo = cachedGeometry('sm-tissue-pull', () => {
        const g = new THREE.PlaneGeometry(0.45, 0.3, 8, 6);
        const p = g.attributes.position;
        for (let i = 0; i < p.count; i++) {
            const px = p.getX(i), py = p.getY(i);
            p.setZ(i, Math.sin(py * Math.PI) * 0.08 + (px * px) * 0.15);
        }
        g.computeVertexNormals();
        return g;
    });
    const tissue = new THREE.Mesh(tissueGeo, tissueMat);
    tissue.position.y = 0.42;
    tissue.rotation.x = -Math.PI / 2.5;
    group.add(tissue);
    return group;
}

export function createGarbageRollMesh(matFn, seed) {
    const key = 'sm-garbage-roll';
    const geo = cachedGeometry(key, () => new THREE.CylinderGeometry(0.32, 0.32, 0.6, 40, 4));
    const m = new THREE.Mesh(geo, matFn());
    m.rotation.z = Math.PI / 2;
    m.castShadow = m.receiveShadow = true;
    return m;
}

export function createSpongeMesh(seed) {
    const key = 'sm-sponge';
    const geo = cachedGeometry(key, () => {
        const g = new THREE.BoxGeometry(0.6, 0.22, 0.4, 8, 4, 6);
        const p = g.attributes.position;
        const rng = mulberry32(33112);
        for (let i = 0; i < p.count; i++) {
            let x = p.getX(i), y = p.getY(i), z = p.getZ(i);
            const n = (rng() - 0.5) * 0.04;
            p.setXYZ(i, x + n, y + n * 0.5, z + n);
        }
        g.computeVertexNormals();
        return g;
    });
    const m = new THREE.Mesh(geo, SM.sponge());
    m.castShadow = m.receiveShadow = true;

    const scotchMat = cachedMaterial('smScotchPad', () => new THREE.MeshPhysicalMaterial({
        color: 0x1e5a2e, roughness: 0.7
    }));
    const scotchGeo = cachedGeometry('sm-scotch-pad', () => new THREE.BoxGeometry(0.55, 0.04, 0.38));
    const pad = new THREE.Mesh(scotchGeo, scotchMat);
    pad.position.y = 0.13;
    m.add(pad);
    return m;
}

export function createToothbrushMesh(seed) {
    const group = new THREE.Group();
    const handleMat = SM.toothbrush();
    const handleGeo = cachedGeometry('sm-toothbrush-handle', () => {
        const g = new THREE.BoxGeometry(0.06, 0.6, 0.14, 4, 12, 4);
        const p = g.attributes.position;
        for (let i = 0; i < p.count; i++) {
            let x = p.getX(i), y = p.getY(i), z = p.getZ(i);
            if (y > 0.2) {
                const t = (y - 0.2) / 0.1;
                x *= 1 - t * 0.5;
                z *= 1 - t * 0.3;
            }
            if (y < -0.2) {
                const t = (-y - 0.2) / 0.1;
                x *= 1 - t * 0.2;
                z *= 1 + t * 0.3;
            }
            p.setXYZ(i, x, y, z);
        }
        g.computeVertexNormals();
        return g;
    });
    const handle = new THREE.Mesh(handleGeo, handleMat);
    handle.castShadow = true;
    group.add(handle);

    const bristleMat = cachedMaterial('smBristle', () => new THREE.MeshPhysicalMaterial({
        color: 0xf5f5f5, roughness: 0.85
    }));
    const bristleGeo = cachedGeometry('sm-bristle-cluster', () => {
        const g = new THREE.BoxGeometry(0.05, 0.1, 0.1);
        return g;
    });
    const rng = mulberry32(55221);
    for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 4; c++) {
            const b = new THREE.Mesh(bristleGeo, bristleMat);
            b.position.set(0, 0.28, -0.06 + c * 0.04);
            b.scale.y = 0.6 + rng() * 0.4;
            b.castShadow = true;
            group.add(b);
        }
    }
    return group;
}

export function createRazorMesh(seed) {
    const group = new THREE.Group();
    const handleMat = SM.razorHandle();
    const handleGeo = cachedGeometry('sm-razor-handle', () => {
        const g = new THREE.CylinderGeometry(0.055, 0.075, 0.6, 20);
        const p = g.attributes.position;
        for (let i = 0; i < p.count; i++) {
            let x = p.getX(i), y = p.getY(i), z = p.getZ(i);
            const taper = 1 - Math.max(0, y / 0.3) * 0.2;
            x *= taper; z *= taper;
            p.setXYZ(i, x, y, z);
        }
        g.computeVertexNormals();
        return g;
    });
    const handle = new THREE.Mesh(handleGeo, handleMat);
    handle.castShadow = true;
    group.add(handle);

    const headMat = SM.razorBlade();
    const headGeo = cachedGeometry('sm-razor-head', () => new THREE.BoxGeometry(0.3, 0.1, 0.2));
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.y = 0.36;
    group.add(head);
    return group;
}

export function createDeodorantStick(matFn, seed) {
    const group = new THREE.Group();
    const bodyGeo = cachedGeometry('sm-deodorant-body', () => {
        const g = new THREE.CylinderGeometry(0.14, 0.14, 0.5, 20);
        return g;
    });
    const body = new THREE.Mesh(bodyGeo, matFn());
    body.castShadow = body.receiveShadow = true;
    group.add(body);

    const capMat = cachedMaterial('smDeodorantCap', () => new THREE.MeshPhysicalMaterial({
        color: 0xf0f0f0, roughness: 0.4, clearcoat: 0.6
    }));
    const capGeo = cachedGeometry('sm-deodorant-cap', () => new THREE.CylinderGeometry(0.16, 0.16, 0.18, 20));
    const cap = new THREE.Mesh(capGeo, capMat);
    cap.position.y = 0.34;
    group.add(cap);
    return group;
}

export function createPerfumeBottleMesh(matFn, seed) {
    const group = new THREE.Group();
    const bodyGeo = cachedGeometry('sm-perfume-body', () => {
        const g = new THREE.BoxGeometry(0.4, 0.5, 0.22, 4, 8, 4);
        const p = g.attributes.position;
        for (let i = 0; i < p.count; i++) {
            let x = p.getX(i), y = p.getY(i), z = p.getZ(i);
            const bevel = 1 - Math.max(0, (Math.abs(y) - 0.18) / 0.07) * 0.15;
            x *= bevel; z *= bevel;
            p.setXYZ(i, x, y, z);
        }
        g.computeVertexNormals();
        return g;
    });
    const body = new THREE.Mesh(bodyGeo, matFn());
    body.castShadow = body.receiveShadow = true;
    group.add(body);

    const capMat = cachedMaterial('smPerfumeCap', () => new THREE.MeshPhysicalMaterial({
        color: 0xd4af37, metalness: 0.85, roughness: 0.25, clearcoat: 0.9
    }));
    const neckGeo = cachedGeometry('sm-perfume-neck', () => new THREE.CylinderGeometry(0.06, 0.06, 0.06, 16));
    const neck = new THREE.Mesh(neckGeo, capMat);
    neck.position.y = 0.28;
    group.add(neck);
    const capGeo = cachedGeometry('sm-perfume-cap', () => new THREE.BoxGeometry(0.14, 0.12, 0.14));
    const cap = new THREE.Mesh(capGeo, capMat);
    cap.position.y = 0.36;
    group.add(cap);
    return group;
}

/* ---------- BABY ---------- */

export function createDiaperPack(matFn, seed) {
    const key = 'sm-diaper-pack';
    const geo = cachedGeometry(key, () => {
        const g = new THREE.BoxGeometry(1.0, 0.85, 0.5, 6, 8, 4);
        const p = g.attributes.position;
        for (let i = 0; i < p.count; i++) {
            let x = p.getX(i), y = p.getY(i), z = p.getZ(i);
            const bulge = 1 + Math.max(0, 1 - Math.pow(y / 0.4, 2)) * 0.06;
            z *= bulge;
            p.setXYZ(i, x, y, z);
        }
        g.computeVertexNormals();
        return g;
    });
    const m = new THREE.Mesh(geo, matFn());
    m.castShadow = m.receiveShadow = true;
    return m;
}

export function createBabyBottleMesh(matFn, seed) {
    const group = new THREE.Group();
    const profile = [
        new THREE.Vector2(0, 0),
        new THREE.Vector2(0.24, 0),
        new THREE.Vector2(0.28, 0.08),
        new THREE.Vector2(0.28, 0.7),
        new THREE.Vector2(0.22, 0.85),
        new THREE.Vector2(0.14, 1.05),
        new THREE.Vector2(0, 1.05)
    ];
    const geo = cachedGeometry('sm-babybottle-body', () => new THREE.LatheGeometry(profile, 40));
    const body = new THREE.Mesh(geo, matFn());
    body.castShadow = body.receiveShadow = true;
    group.add(body);

    const nippleMat = cachedMaterial('smNippleMat', () => new THREE.MeshPhysicalMaterial({
        color: 0xf5d0c0, roughness: 0.35, transmission: 0.3, thickness: 0.3
    }));
    const nippleGeo = cachedGeometry('sm-baby-nipple', () => new THREE.ConeGeometry(0.08, 0.18, 16, 8, false));
    const nipple = new THREE.Mesh(nippleGeo, nippleMat);
    nipple.position.y = 1.18;
    group.add(nipple);

    const ringMat = cachedMaterial('smBabyRing', () => new THREE.MeshPhysicalMaterial({
        color: 0xffc8d8, roughness: 0.32, clearcoat: 0.75
    }));
    const ringGeo = cachedGeometry('sm-baby-ring', () => new THREE.CylinderGeometry(0.18, 0.18, 0.06, 24));
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.y = 1.08;
    group.add(ring);
    return group;
}

export function createPacifierMesh(matFn, seed) {
    const group = new THREE.Group();
    const shieldGeo = cachedGeometry('sm-pacifier-shield', () => {
        const g = new THREE.CylinderGeometry(0.22, 0.22, 0.05, 24);
        return g;
    });
    const shield = new THREE.Mesh(shieldGeo, matFn());
    group.add(shield);

    const nippleGeo = cachedGeometry('sm-pacifier-nipple', () => {
        const g = new THREE.SphereGeometry(0.08, 16, 12);
        g.scale(1, 0.7, 1);
        return g;
    });
    const nipple = new THREE.Mesh(nippleGeo, matFn());
    nipple.position.y = -0.1;
    group.add(nipple);

    const ringGeo = cachedGeometry('sm-pacifier-ring', () => new THREE.TorusGeometry(0.1, 0.02, 8, 24));
    const ring = new THREE.Mesh(ringGeo, matFn());
    ring.position.y = 0.08;
    ring.rotation.x = Math.PI / 2;
    group.add(ring);
    return group;
}

/* ---------- PET ---------- */

export function createPetFoodBag(matFn, seed) {
    const key = 'sm-petfood-bag';
    const geo = cachedGeometry(key, () => {
        const g = new THREE.BoxGeometry(1.0, 1.4, 0.45, 8, 16, 4);
        const p = g.attributes.position;
        for (let i = 0; i < p.count; i++) {
            let x = p.getX(i), y = p.getY(i), z = p.getZ(i);
            const bulge = 1 + Math.max(0, 1 - Math.pow(y / 0.55, 2)) * 0.12;
            z *= bulge;
            if (Math.abs(y) > 0.65) {
                const t = (Math.abs(y) - 0.65) / 0.05;
                x *= 1 - t * 0.1;
                z *= 1 - t * 0.4;
            }
            p.setXYZ(i, x, y, z);
        }
        g.computeVertexNormals();
        return g;
    });
    const m = new THREE.Mesh(geo, matFn());
    m.castShadow = m.receiveShadow = true;
    return m;
}

export function createPetBowlMesh(matFn, seed) {
    const group = new THREE.Group();
    const bowlGeo = cachedGeometry('sm-petbowl', () => {
        const points = [
            new THREE.Vector2(0, 0),
            new THREE.Vector2(0.5, 0),
            new THREE.Vector2(0.55, 0.1),
            new THREE.Vector2(0.55, 0.28)
        ];
        return new THREE.LatheGeometry(points, 40);
    });
    const bowl = new THREE.Mesh(bowlGeo, matFn());
    bowl.castShadow = bowl.receiveShadow = true;
    group.add(bowl);

    const foodMat = cachedMaterial('smPetFood', () => new THREE.MeshPhysicalMaterial({
        color: 0x8a5a2a, bumpMap: TEX.bump, bumpScale: 0.03, roughness: 0.75
    }));
    const foodGeo = cachedGeometry('sm-petfood-surface', () => {
        const g = new THREE.CylinderGeometry(0.48, 0.48, 0.05, 40);
        const p = g.attributes.position;
        const rng = mulberry32(22114);
        for (let i = 0; i < p.count; i++) {
            const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
            if (y > 0) p.setY(i, y + Math.sin(x * 8) * Math.cos(z * 8) * 0.02 + (rng() - 0.5) * 0.01);
        }
        g.computeVertexNormals();
        return g;
    });
    const food = new THREE.Mesh(foodGeo, foodMat);
    food.position.y = 0.2;
    group.add(food);
    return group;
}

export function createPetCollarMesh(matFn, seed) {
    const group = new THREE.Group();
    const collarGeo = cachedGeometry('sm-petcollar', () => {
        const g = new THREE.TorusGeometry(0.35, 0.04, 12, 48);
        return g;
    });
    const collar = new THREE.Mesh(collarGeo, matFn());
    collar.rotation.x = Math.PI / 2;
    collar.castShadow = true;
    group.add(collar);

    const tagMat = cachedMaterial('smPetTag', () => new THREE.MeshPhysicalMaterial({
        color: 0xd4af37, metalness: 0.85, roughness: 0.25, clearcoat: 0.9
    }));
    const tagGeo = cachedGeometry('sm-pettag', () => new THREE.CylinderGeometry(0.06, 0.06, 0.01, 20));
    const tag = new THREE.Mesh(tagGeo, tagMat);
    tag.position.y = -0.38;
    group.add(tag);
    return group;
}

/* ---------- SPICES ---------- */

export function createSpiceJar(matFn, seed) {
    const group = new THREE.Group();
    const bodyGeo = cachedGeometry('sm-spicejar-body', () => new THREE.CylinderGeometry(0.14, 0.14, 0.32, 24, 4));
    const body = new THREE.Mesh(bodyGeo, matFn());
    body.castShadow = body.receiveShadow = true;
    group.add(body);

    const lidGeo = cachedGeometry('sm-spicejar-lid', () => new THREE.CylinderGeometry(0.15, 0.15, 0.05, 24));
    const lid = new THREE.Mesh(lidGeo, SM.spiceJarLid());
    lid.position.y = 0.185;
    group.add(lid);
    return group;
}

export function createSaltShaker(matFn, seed) {
    const group = new THREE.Group();
    const bodyGeo = cachedGeometry('sm-salt-body', () => {
        const g = new THREE.CylinderGeometry(0.14, 0.11, 0.35, 24, 4);
        return g;
    });
    const body = new THREE.Mesh(bodyGeo, matFn());
    body.castShadow = body.receiveShadow = true;
    group.add(body);

    const lidGeo = cachedGeometry('sm-salt-lid', () => new THREE.SphereGeometry(0.13, 20, 12, 0, Math.PI * 2, 0, Math.PI * 0.5));
    const lid = new THREE.Mesh(lidGeo, SM.spiceJarLid());
    lid.position.y = 0.17;
    group.add(lid);
    return group;
}

/* ---------- DRY / NUTS ---------- */

export function createNutBag(matFn, seed) {
    const key = 'sm-nut-bag';
    const geo = cachedGeometry(key, () => {
        const g = new THREE.CylinderGeometry(0.4, 0.4, 0.85, 32, 12);
        const p = g.attributes.position;
        const rng = mulberry32(77441);
        for (let i = 0; i < p.count; i++) {
            let x = p.getX(i), y = p.getY(i), z = p.getZ(i);
            const bulge = 1 + Math.max(0, 1 - Math.pow(y / 0.4, 2)) * 0.1;
            x *= bulge; z *= bulge;
            const wrinkle = 1 + (rng() - 0.5) * 0.02;
            x *= wrinkle; z *= wrinkle;
            p.setXYZ(i, x, y, z);
        }
        g.computeVertexNormals();
        return g;
    });
    const m = new THREE.Mesh(geo, matFn());
    m.castShadow = m.receiveShadow = true;
    return m;
}

export function createNutKernelMesh(matFn, seed) {
    const key = 'sm-nut-kernel';
    const geo = cachedGeometry(key, () => {
        const g = new THREE.SphereGeometry(0.12, 16, 12);
        const p = g.attributes.position;
        const rng = mulberry32(88221);
        for (let i = 0; i < p.count; i++) {
            let x = p.getX(i), y = p.getY(i), z = p.getZ(i);
            const n = 1 + (rng() - 0.5) * 0.15;
            x *= n; y *= n * 1.4; z *= n;
            p.setXYZ(i, x, y, z);
        }
        g.computeVertexNormals();
        return g;
    });
    const m = new THREE.Mesh(geo, matFn());
    m.castShadow = true;
    return m;
}

export function createDriedFruitMesh(matFn, seed) {
    const key = 'sm-dried-fruit';
    const geo = cachedGeometry(key, () => {
        const g = new THREE.SphereGeometry(0.15, 16, 12);
        const p = g.attributes.position;
        const rng = mulberry32(99112);
        for (let i = 0; i < p.count; i++) {
            let x = p.getX(i), y = p.getY(i), z = p.getZ(i);
            const n = 1 + (rng() - 0.5) * 0.2;
            x *= n; y *= n * 1.2; z *= n;
            p.setXYZ(i, x, y, z);
        }
        g.computeVertexNormals();
        return g;
    });
    const m = new THREE.Mesh(geo, matFn());
    m.castShadow = true;
    return m;
}

/* ---------- UTILITIES ---------- */

export function attachOverheadFillLight(scene) {
    if (!scene) return null;
    const light = new THREE.DirectionalLight(0xfff2e0, 1.8);
    light.position.set(0, 8, 2);
    light.castShadow = false;
    scene.add(light);
    const hemi = new THREE.HemisphereLight(0xfff0d8, 0x2a1a10, 0.7);
    scene.add(hemi);
    return { light, hemi };
}

export function clearGeometryCache() {
    GEOMETRY_CACHE.forEach(geo => {
        if (geo.dispose) geo.dispose();
    });
    GEOMETRY_CACHE.clear();
    MATERIAL_CACHE.forEach(m => {
        if (m.dispose) m.dispose();
    });
    MATERIAL_CACHE.clear();
}

export function disposeDishGroup(group) {
    if (!group) return;
    group.traverse(obj => {
        if (obj.geometry && typeof obj.geometry.dispose === 'function') {
            const used = Array.from(GEOMETRY_CACHE.values()).includes(obj.geometry);
            if (!used) obj.geometry.dispose();
        }
    });
}