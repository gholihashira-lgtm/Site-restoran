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
   PROCEDURAL CANVAS TEXTURE SYNTHESIS
   ============================================================ */

/* --- 1. Brioche / Bread Crust Texture --- */
function createBriocheTexture() {
    const s = 1024;
    const c = makeCanvas(s);
    const ctx = c.getContext('2d');

    const grad = ctx.createRadialGradient(s * 0.5, s * 0.45, s * 0.06, s * 0.5, s * 0.5, s * 0.52);
    grad.addColorStop(0.0, '#f5c46b');
    grad.addColorStop(0.32, '#df9b3a');
    grad.addColorStop(0.62, '#b87221');
    grad.addColorStop(0.85, '#7a3d0f');
    grad.addColorStop(1.0, '#4a1e05');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, s, s);

    const rng = mulberry32(98213);
    for (let i = 0; i < 800; i++) {
        const x = rng() * s;
        const y = rng() * s;
        const r = 0.6 + rng() * 2.4;
        const roll = rng();
        if (roll > 0.72) ctx.fillStyle = 'rgba(90, 45, 12, 0.35)';
        else if (roll > 0.42) ctx.fillStyle = 'rgba(255, 220, 160, 0.22)';
        else ctx.fillStyle = 'rgba(60, 25, 8, 0.18)';
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.lineWidth = 1.2;
    ctx.strokeStyle = 'rgba(50, 22, 6, 0.42)';
    for (let i = 0; i < 90; i++) {
        const x1 = rng() * s;
        const y1 = rng() * s;
        const angle = rng() * Math.PI * 2;
        const length = 20 + rng() * 120;
        const x2 = x1 + Math.cos(angle) * length;
        const y2 = y1 + Math.sin(angle) * length;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        for (let t = 0.2; t <= 1.0; t += 0.2) {
            const px = x1 + (x2 - x1) * t + (rng() - 0.5) * 6;
            const py = y1 + (y2 - y1) * t + (rng() - 0.5) * 6;
            ctx.lineTo(px, py);
        }
        ctx.stroke();
    }

    for (let i = 0; i < 600; i++) {
        const x = rng() * s;
        const y = rng() * s;
        const r = 0.4 + rng() * 0.8;
        ctx.fillStyle = 'rgba(255, 245, 220, ' + (0.35 + rng() * 0.45) + ')';
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
    }

    for (let i = 0; i < 45; i++) {
        const x = rng() * s;
        const y = rng() * s;
        const r = 30 + rng() * 90;
        const warm = ctx.createRadialGradient(x, y, 0, x, y, r);
        warm.addColorStop(0, 'rgba(255, 210, 130, 0.24)');
        warm.addColorStop(0.6, 'rgba(230, 150, 60, 0.10)');
        warm.addColorStop(1, 'rgba(230, 150, 60, 0)');
        ctx.fillStyle = warm;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
    }

    return canvasToTexture(c);
}

/* --- 2. Caramelized Smash Patty Texture (Ultra-Detailed) --- */
function createPattyTexture() {
    const s = 1536;
    const c = makeCanvas(s);
    const ctx = c.getContext('2d');

    const baseGrad = ctx.createRadialGradient(s * 0.5, s * 0.5, s * 0.08, s * 0.5, s * 0.5, s * 0.65);
    baseGrad.addColorStop(0.0, '#5c2814');
    baseGrad.addColorStop(0.45, '#481c0d');
    baseGrad.addColorStop(0.78, '#2c0e05');
    baseGrad.addColorStop(1.0, '#180704');
    ctx.fillStyle = baseGrad;
    ctx.fillRect(0, 0, s, s);

    const rng = mulberry32(44019);

    for (let i = 0; i < 220000; i++) {
        const x = rng() * s;
        const y = rng() * s;
        const r = rng() * 3.2;
        const roll = rng();
        if (roll > 0.965) ctx.fillStyle = 'rgba(240, 190, 140, 0.68)';
        else if (roll > 0.90) ctx.fillStyle = 'rgba(155, 70, 30, 0.55)';
        else if (roll > 0.72) ctx.fillStyle = 'rgba(90, 40, 18, 0.62)';
        else if (roll > 0.42) ctx.fillStyle = 'rgba(50, 22, 10, 0.58)';
        else ctx.fillStyle = 'rgba(18, 6, 2, 0.55)';
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.save();
    ctx.filter = 'blur(5px)';
    ctx.strokeStyle = 'rgba(10, 3, 1, 0.72)';
    ctx.lineWidth = 22;
    for (let x = -260; x < s + 260; x += 210) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x + 340, s);
        ctx.stroke();
    }
    ctx.strokeStyle = 'rgba(150, 75, 30, 0.32)';
    ctx.lineWidth = 6;
    for (let x = -260 + 105; x < s + 260; x += 210) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x + 340, s);
        ctx.stroke();
    }
    ctx.strokeStyle = 'rgba(10, 3, 1, 0.55)';
    ctx.lineWidth = 18;
    for (let y = -260; y < s + 260; y += 220) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(s, y + 260);
        ctx.stroke();
    }
    ctx.restore();

    for (let i = 0; i < 220; i++) {
        const x = rng() * s;
        const y = rng() * s;
        const r = 8 + rng() * 34;
        const fat = ctx.createRadialGradient(x, y, 0, x, y, r);
        fat.addColorStop(0, 'rgba(245, 215, 185, 0.62)');
        fat.addColorStop(0.45, 'rgba(220, 175, 130, 0.34)');
        fat.addColorStop(0.8, 'rgba(190, 140, 95, 0.14)');
        fat.addColorStop(1, 'rgba(190, 140, 95, 0)');
        ctx.fillStyle = fat;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
    }

    for (let i = 0; i < 380; i++) {
        const x = rng() * s;
        const y = rng() * s;
        const r = 1.2 + rng() * 3.8;
        const glow = ctx.createRadialGradient(x, y, 0, x, y, r);
        glow.addColorStop(0, 'rgba(255, 245, 220, 0.95)');
        glow.addColorStop(0.4, 'rgba(255, 215, 160, 0.55)');
        glow.addColorStop(0.75, 'rgba(255, 190, 120, 0.22)');
        glow.addColorStop(1, 'rgba(255, 190, 120, 0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
    }

    for (let i = 0; i < 150; i++) {
        const x = rng() * s;
        const y = rng() * s;
        const r = 2 + rng() * 6;
        const crater = ctx.createRadialGradient(x, y, 0, x, y, r);
        crater.addColorStop(0, 'rgba(8, 3, 1, 0.72)');
        crater.addColorStop(0.6, 'rgba(30, 12, 5, 0.42)');
        crater.addColorStop(1, 'rgba(30, 12, 5, 0)');
        ctx.fillStyle = crater;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
    }

    for (let i = 0; i < 65; i++) {
        const x = rng() * s;
        const y = rng() * s;
        const r = 40 + rng() * 110;
        const smoke = ctx.createRadialGradient(x, y, 0, x, y, r);
        smoke.addColorStop(0, 'rgba(60, 30, 15, 0.18)');
        smoke.addColorStop(0.6, 'rgba(40, 20, 10, 0.08)');
        smoke.addColorStop(1, 'rgba(40, 20, 10, 0)');
        ctx.fillStyle = smoke;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
    }

    return canvasToTexture(c);
}

/* --- 3. Melted Cheese Texture --- */
function createCheeseTexture() {
    const s = 512;
    const c = makeCanvas(s);
    const ctx = c.getContext('2d');

    const base = ctx.createRadialGradient(s * 0.5, s * 0.45, s * 0.05, s * 0.5, s * 0.5, s * 0.55);
    base.addColorStop(0.0, '#ffd070');
    base.addColorStop(0.55, '#f3a83a');
    base.addColorStop(0.85, '#d97712');
    base.addColorStop(1.0, '#a85008');
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, s, s);

    const rng = mulberry32(45123);
    for (let i = 0; i < 80; i++) {
        const x = rng() * s;
        const y = rng() * s;
        const r = 8 + rng() * 38;
        const blob = ctx.createRadialGradient(x, y, 0, x, y, r);
        blob.addColorStop(0, 'rgba(155, 65, 12, 0.55)');
        blob.addColorStop(0.5, 'rgba(200, 110, 25, 0.35)');
        blob.addColorStop(1, 'rgba(200, 110, 25, 0)');
        ctx.fillStyle = blob;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
    }

    for (let i = 0; i < 60; i++) {
        const x = rng() * s;
        const y = rng() * s;
        const r = 20 + rng() * 70;
        const shine = ctx.createRadialGradient(x, y, 0, x, y, r);
        shine.addColorStop(0, 'rgba(255, 235, 175, 0.42)');
        shine.addColorStop(0.6, 'rgba(255, 220, 150, 0.18)');
        shine.addColorStop(1, 'rgba(255, 220, 150, 0)');
        ctx.fillStyle = shine;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
    }

    for (let i = 0; i < 40; i++) {
        const x = rng() * s;
        const y = rng() * s;
        const r = 2 + rng() * 6;
        ctx.fillStyle = 'rgba(80, 35, 8, 0.55)';
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
    }

    return canvasToTexture(c);
}

/* --- 4. Viscous Sauce Texture --- */
function createSauceTexture() {
    const s = 512;
    const c = makeCanvas(s);
    const ctx = c.getContext('2d');

    const base = ctx.createRadialGradient(s * 0.5, s * 0.5, 0, s * 0.5, s * 0.5, s * 0.7);
    base.addColorStop(0.0, '#c9281a');
    base.addColorStop(0.55, '#8a180f');
    base.addColorStop(0.85, '#5c0d07');
    base.addColorStop(1.0, '#380504');
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, s, s);

    const rng = mulberry32(88112);
    for (let i = 0; i < 220; i++) {
        const x = rng() * s;
        const y = rng() * s;
        const r = 8 + rng() * 40;
        const roll = rng();
        if (roll > 0.5) {
            const g = ctx.createRadialGradient(x, y, 0, x, y, r);
            g.addColorStop(0, 'rgba(155, 26, 11, 0.55)');
            g.addColorStop(1, 'rgba(155, 26, 11, 0)');
            ctx.fillStyle = g;
        } else {
            const g = ctx.createRadialGradient(x, y, 0, x, y, r);
            g.addColorStop(0, 'rgba(60, 8, 4, 0.55)');
            g.addColorStop(1, 'rgba(60, 8, 4, 0)');
            ctx.fillStyle = g;
        }
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
    }

    for (let i = 0; i < 1400; i++) {
        const x = rng() * s;
        const y = rng() * s;
        const r = 0.5 + rng() * 1.6;
        const roll = rng();
        if (roll > 0.7) ctx.fillStyle = 'rgba(255, 200, 90, 0.55)';
        else if (roll > 0.4) ctx.fillStyle = 'rgba(30, 15, 5, 0.62)';
        else ctx.fillStyle = 'rgba(200, 170, 60, 0.42)';
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
    }

    for (let i = 0; i < 50; i++) {
        const x = rng() * s;
        const y = rng() * s;
        const r = 8 + rng() * 32;
        const shine = ctx.createRadialGradient(x, y, 0, x, y, r);
        shine.addColorStop(0, 'rgba(255, 235, 210, 0.35)');
        shine.addColorStop(1, 'rgba(255, 235, 210, 0)');
        ctx.fillStyle = shine;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
    }

    return canvasToTexture(c);
}

/* --- 5. Porous Meat-Grain Bump Map (Dedicated for Patty) --- */
function createMeatBumpMap() {
    const s = 1024;
    const c = makeCanvas(s);
    const ctx = c.getContext('2d');
    const imgData = ctx.createImageData(s, s);
    const rng = mulberry32(66112);

    const data = imgData.data;
    for (let y = 0; y < s; y++) {
        for (let x = 0; x < s; x++) {
            const idx = (y * s + x) * 4;
            const fx = x / s;
            const fy = y / s;
            const n1 = Math.sin(fx * 87.3 + Math.cos(fy * 41.7) * 2.4);
            const n2 = Math.cos(fy * 121.9 + Math.sin(fx * 67.1) * 3.1);
            const n3 = Math.sin((fx + fy) * 199.3) * Math.cos((fx - fy) * 143.7);
            const n4 = Math.sin(fx * 23.1) * Math.cos(fy * 19.5) * 1.6;
            const noise = rng() * 0.35 - 0.175;
            const v = (n1 * 0.28 + n2 * 0.22 + n3 * 0.18 + n4 * 0.15 + noise) * 127 + 128;
            const clamped = Math.max(0, Math.min(255, v));
            data[idx] = clamped;
            data[idx + 1] = clamped;
            data[idx + 2] = clamped;
            data[idx + 3] = 255;
        }
    }
    ctx.putImageData(imgData, 0, 0);
    const tex = canvasToTexture(c, true);
    tex.repeat.set(4, 4);
    return tex;
}

/* --- 6. Generic Noise Bump Map --- */
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

/* --- 7. Particle Sprite (for ambient particles) --- */
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

const BRIOCHE_TEX = typeof document !== 'undefined' ? createBriocheTexture() : null;
const PATTY_TEX = typeof document !== 'undefined' ? createPattyTexture() : null;
const CHEESE_TEX = typeof document !== 'undefined' ? createCheeseTexture() : null;
const SAUCE_TEX = typeof document !== 'undefined' ? createSauceTexture() : null;
const BUMP_TEX = typeof document !== 'undefined' ? createNoiseBumpMap(512, 3) : null;
const MEAT_BUMP_TEX = typeof document !== 'undefined' ? createMeatBumpMap() : null;
const PARTICLE_SPRITE_TEX = typeof document !== 'undefined' ? createParticleSprite() : null;

function mat(key, opts) {
    return cachedMaterial(key, () => new THREE.MeshPhysicalMaterial(opts));
}

/* ============================================================
   PBR MATERIAL LIBRARY
   ============================================================ */

export const M = {
    brioche: () => mat('brioche-v3', {
        map: BRIOCHE_TEX,
        bumpMap: BUMP_TEX,
        bumpScale: 0.014,
        roughness: 0.42,
        metalness: 0.0,
        clearcoat: 0.38,
        clearcoatRoughness: 0.24,
        sheen: 0.42,
        sheenRoughness: 0.4,
        sheenColor: new THREE.Color(0xffb454)
    }),
    baguette: () => mat('baguette-v3', {
        map: BRIOCHE_TEX,
        bumpMap: BUMP_TEX,
        bumpScale: 0.02,
        color: 0xd0a464,
        roughness: 0.65,
        clearcoat: 0.18,
        clearcoatRoughness: 0.4
    }),
    ciabatta: () => mat('ciabatta-v3', {
        map: BRIOCHE_TEX,
        bumpMap: BUMP_TEX,
        bumpScale: 0.028,
        color: 0xe8c896,
        roughness: 0.7
    }),
    pretzel: () => mat('pretzel-v3', {
        map: BRIOCHE_TEX,
        bumpMap: BUMP_TEX,
        bumpScale: 0.022,
        color: 0x8a4a22,
        roughness: 0.45,
        clearcoat: 0.3,
        clearcoatRoughness: 0.3
    }),
    potatoRoll: () => mat('potatoRoll-v3', {
        map: BRIOCHE_TEX,
        bumpMap: BUMP_TEX,
        bumpScale: 0.012,
        color: 0xffd788,
        roughness: 0.32,
        clearcoat: 0.65,
        clearcoatRoughness: 0.2,
        sheen: 0.35,
        sheenColor: new THREE.Color(0xfff1c2)
    }),
    patty: () => mat('patty-v4', {
        map: PATTY_TEX,
        bumpMap: MEAT_BUMP_TEX,
        bumpScale: 0.055,
        roughness: 0.44,
        metalness: 0.02,
        clearcoat: 0.65,
        clearcoatRoughness: 0.22,
        sheen: 0.55,
        sheenRoughness: 0.35,
        sheenColor: new THREE.Color(0xff8450)
    }),
    pattyThick: () => mat('pattyThick-v4', {
        map: PATTY_TEX,
        bumpMap: MEAT_BUMP_TEX,
        bumpScale: 0.06,
        color: 0x8a4628,
        roughness: 0.5,
        metalness: 0.02,
        clearcoat: 0.6,
        clearcoatRoughness: 0.24,
        sheen: 0.5,
        sheenRoughness: 0.35,
        sheenColor: new THREE.Color(0xff7a48)
    }),
    pattyVegan: () => mat('pattyVegan-v4', {
        map: PATTY_TEX,
        bumpMap: MEAT_BUMP_TEX,
        bumpScale: 0.045,
        color: 0xb08460,
        roughness: 0.66,
        metalness: 0.0,
        clearcoat: 0.35,
        clearcoatRoughness: 0.3,
        sheen: 0.3,
        sheenColor: new THREE.Color(0xd8b088)
    }),
    crispyChicken: () => mat('crispyChicken-v4', {
        map: PATTY_TEX,
        bumpMap: MEAT_BUMP_TEX,
        bumpScale: 0.07,
        color: 0xf0bc6a,
        roughness: 0.52,
        metalness: 0.0,
        clearcoat: 0.45,
        clearcoatRoughness: 0.26,
        sheen: 0.4,
        sheenColor: new THREE.Color(0xffd89a)
    }),
    sausage: () => mat('sausage-v3', {
        color: 0xa8281e,
        roughness: 0.32,
        bumpMap: MEAT_BUMP_TEX,
        bumpScale: 0.035,
        clearcoat: 0.85,
        clearcoatRoughness: 0.18
    }),
    cheddar: () => mat('cheddar-v3', {
        map: CHEESE_TEX,
        bumpMap: BUMP_TEX,
        bumpScale: 0.012,
        color: 0xee8c14,
        roughness: 0.32,
        transmission: 0.15,
        thickness: 0.6,
        clearcoat: 0.45,
        clearcoatRoughness: 0.2,
        sheen: 0.6,
        sheenRoughness: 0.4,
        sheenColor: new THREE.Color(0xffbf60),
        ior: 1.42
    }),
    gouda: () => mat('gouda-v3', {
        map: CHEESE_TEX,
        bumpMap: BUMP_TEX,
        bumpScale: 0.012,
        color: 0xf7c458,
        roughness: 0.32,
        transmission: 0.18,
        thickness: 0.6,
        clearcoat: 0.45,
        clearcoatRoughness: 0.2,
        sheen: 0.55,
        sheenRoughness: 0.4,
        sheenColor: new THREE.Color(0xffd98a),
        ior: 1.45
    }),
    swiss: () => mat('swiss-v3', {
        map: CHEESE_TEX,
        bumpMap: BUMP_TEX,
        bumpScale: 0.014,
        color: 0xfff6dc,
        roughness: 0.36,
        transmission: 0.28,
        thickness: 0.55,
        clearcoat: 0.4,
        clearcoatRoughness: 0.24,
        sheen: 0.45,
        sheenColor: new THREE.Color(0xffeeb8)
    }),
    blueCheese: () => mat('blueCheese-v3', {
        map: CHEESE_TEX,
        bumpMap: BUMP_TEX,
        bumpScale: 0.02,
        color: 0xf5efe0,
        roughness: 0.4,
        transmission: 0.14,
        thickness: 0.5,
        clearcoat: 0.32,
        clearcoatRoughness: 0.28
    }),
    mozzarella: () => mat('mozzarella-v3', {
        map: CHEESE_TEX,
        bumpMap: BUMP_TEX,
        bumpScale: 0.012,
        color: 0xfffbec,
        roughness: 0.34,
        transmission: 0.12,
        thickness: 0.3,
        clearcoat: 0.4,
        clearcoatRoughness: 0.22,
        sheen: 0.5,
        sheenColor: new THREE.Color(0xfff4cf)
    }),
    lettuce: () => mat('lettuce-v3', {
        color: 0x4da22b,
        roughness: 0.32,
        transmission: 0.35,
        thickness: 0.35,
        clearcoat: 0.35,
        clearcoatRoughness: 0.25,
        sheen: 0.45,
        sheenColor: new THREE.Color(0xb6e870),
        side: THREE.DoubleSide
    }),
    tomato: () => mat('tomato-v3', {
        color: 0xc01a14,
        roughness: 0.08,
        transmission: 0.32,
        thickness: 0.85,
        clearcoat: 1.0,
        clearcoatRoughness: 0.05,
        sheen: 0.55,
        sheenColor: new THREE.Color(0xff7060)
    }),
    onion: () => mat('onion-v3', {
        color: 0xc29a86,
        roughness: 0.38,
        transmission: 0.18,
        thickness: 0.28,
        clearcoat: 0.5,
        sheen: 0.6,
        sheenColor: new THREE.Color(0xffe0c8)
    }),
    pickle: () => mat('pickle-v3', {
        color: 0x4e7230,
        roughness: 0.28,
        transmission: 0.42,
        thickness: 0.4,
        clearcoat: 0.85,
        clearcoatRoughness: 0.12,
        sheen: 0.55,
        sheenColor: new THREE.Color(0xc8e878)
    }),
    jalapeno: () => mat('jalapeno-v3', {
        color: 0x3e7723,
        roughness: 0.28,
        transmission: 0.55,
        thickness: 0.32,
        clearcoat: 0.72,
        clearcoatRoughness: 0.15,
        sheen: 0.6,
        sheenColor: new THREE.Color(0xa8e860)
    }),
    mushroom: () => mat('mushroom-v3', {
        color: 0x766046,
        roughness: 0.36,
        clearcoat: 0.7,
        clearcoatRoughness: 0.22,
        sheen: 0.4
    }),
    truffleMayo: () => mat('truffleMayo-v3', {
        map: SAUCE_TEX,
        color: 0xfef8ea,
        roughness: 0.12,
        transmission: 0.15,
        thickness: 0.5,
        clearcoat: 1.0,
        clearcoatRoughness: 0.05,
        sheen: 0.55,
        sheenColor: new THREE.Color(0xfffbe8)
    }),
    bbq: () => mat('bbq-v3', {
        map: SAUCE_TEX,
        color: 0x5a1a0c,
        roughness: 0.15,
        clearcoat: 0.95,
        clearcoatRoughness: 0.08,
        sheen: 0.45,
        sheenColor: new THREE.Color(0xff6a44)
    }),
    mustard: () => mat('mustard-v3', {
        map: SAUCE_TEX,
        color: 0xeaba46,
        roughness: 0.14,
        clearcoat: 0.92,
        clearcoatRoughness: 0.08,
        sheen: 0.5,
        sheenColor: new THREE.Color(0xffe680)
    }),
    marinara: () => mat('marinara-v3', {
        map: SAUCE_TEX,
        color: 0x9a1e12,
        roughness: 0.22,
        clearcoat: 0.92,
        clearcoatRoughness: 0.14,
        sheen: 0.55,
        sheenColor: new THREE.Color(0xff8050)
    }),
    pesto: () => mat('pesto-v3', {
        map: SAUCE_TEX,
        color: 0x4a7a26,
        roughness: 0.28,
        clearcoat: 0.78,
        clearcoatRoughness: 0.18
    }),
    alfredo: () => mat('alfredo-v3', {
        map: SAUCE_TEX,
        color: 0xfdf6e2,
        roughness: 0.2,
        transmission: 0.1,
        thickness: 0.45,
        clearcoat: 0.85,
        clearcoatRoughness: 0.1
    }),
    crust: () => mat('crust-v3', {
        map: BRIOCHE_TEX,
        bumpMap: BUMP_TEX,
        bumpScale: 0.025,
        color: 0xe8b070,
        roughness: 0.78,
        clearcoat: 0.15,
        sheen: 0.3,
        sheenColor: new THREE.Color(0xffd79a)
    }),
    pepperoni: () => mat('pepperoni-v3', {
        map: SAUCE_TEX,
        color: 0x8c2214,
        roughness: 0.48,
        clearcoat: 0.65,
        clearcoatRoughness: 0.18,
        sheen: 0.35,
        sheenColor: new THREE.Color(0xff7040)
    }),
    basil: () => mat('basil-v3', {
        color: 0x2d6626,
        roughness: 0.34,
        sheen: 0.55,
        sheenColor: new THREE.Color(0x9ee070),
        side: THREE.DoubleSide
    }),
    bellPepper: () => mat('bellPepper-v3', {
        color: 0xd4422a,
        roughness: 0.28,
        transmission: 0.35,
        thickness: 0.3,
        clearcoat: 0.7,
        clearcoatRoughness: 0.12,
        sheen: 0.5,
        sheenColor: new THREE.Color(0xffa880)
    }),
    olive: () => mat('olive-v3', {
        color: 0x16121a,
        roughness: 0.14,
        clearcoat: 0.92,
        clearcoatRoughness: 0.06
    }),
    porcelain: () => mat('porcelain', { color: 0xffffff, roughness: 0.12, clearcoat: 1.0 }),
    copper: () => mat('copper', { color: 0xb87333, roughness: 0.25, metalness: 0.75, clearcoat: 0.9 }),
    stoneware: () => mat('stoneware', { color: 0x8a7d6e, roughness: 0.85, bumpMap: BUMP_TEX, bumpScale: 0.05 }),
    ceramicBlue: () => mat('ceramicBlue', { color: 0x003399, roughness: 0.2, clearcoat: 1.0, side: THREE.DoubleSide }),
    ceramicClay: () => mat('ceramicClay', { color: 0xb87350, roughness: 0.35, clearcoat: 0.8, side: THREE.DoubleSide }),
    rice: () => mat('rice', { color: 0xfdfbf7, roughness: 0.9 }),
    riceSaffron: () => mat('riceSaffron', { color: 0xffb81c, roughness: 0.9 }),
    riceBarberry: () => mat('riceBarberry', { color: 0xc42b3b, roughness: 0.7 }),
    kebabMeat: () => mat('kebabMeat-v3', {
        map: PATTY_TEX,
        bumpMap: MEAT_BUMP_TEX,
        bumpScale: 0.06,
        color: 0x6a3418,
        roughness: 0.52,
        metalness: 0.02,
        clearcoat: 0.6,
        clearcoatRoughness: 0.24,
        sheen: 0.5,
        sheenRoughness: 0.35,
        sheenColor: new THREE.Color(0xff8a54)
    }),
    chickenMeat: () => mat('chickenMeat-v3', {
        map: PATTY_TEX,
        bumpMap: MEAT_BUMP_TEX,
        bumpScale: 0.04,
        color: 0xf0c890,
        roughness: 0.5,
        metalness: 0.0,
        clearcoat: 0.5,
        clearcoatRoughness: 0.24,
        sheen: 0.4,
        sheenColor: new THREE.Color(0xffd8a8)
    }),
    tomatoRoast: () => mat('tomatoRoast-v3', {
        color: 0x8a1808,
        roughness: 0.48,
        clearcoat: 0.78,
        clearcoatRoughness: 0.14,
        sheen: 0.4,
        sheenColor: new THREE.Color(0xff7a58)
    }),
    butter: () => mat('butter', { color: 0xffe680, roughness: 0.3, clearcoat: 0.6 }),
    brothGreen: () => mat('brothGreen', { color: 0x3b4d2e, roughness: 0.12, clearcoat: 1.0 }),
    brothYellow: () => mat('brothYellow', { color: 0xa07832, roughness: 0.15, clearcoat: 1.0 }),
    brothCream: () => mat('brothCream', { color: 0xf0e6c8, roughness: 0.2, clearcoat: 0.9 }),
    brothRed: () => mat('brothRed', { color: 0x8a2a0e, roughness: 0.18, clearcoat: 0.9 }),
    kashk: () => mat('kashk', { color: 0xf4f0e6, roughness: 0.22, clearcoat: 0.5 }),
    mintDagh: () => mat('mintDagh', { color: 0x1f3d17, roughness: 0.8 }),
    crispOnion: () => mat('crispOnion', { color: 0xb35f18, roughness: 0.5, clearcoat: 0.4 }),
    barberry: () => mat('barberry', { color: 0xa41828, roughness: 0.4, clearcoat: 0.5 }),
    parchment: () => mat('parchment', { color: 0xe8ddc5, roughness: 0.9, side: THREE.DoubleSide }),
    fry: () => mat('fry-v3', {
        color: 0xeeb455,
        roughness: 0.45,
        clearcoat: 0.35,
        clearcoatRoughness: 0.22,
        sheen: 0.35,
        sheenColor: new THREE.Color(0xffe698)
    }),
    fryCrinkle: () => mat('fryCrinkle-v3', {
        color: 0xdc9a34,
        roughness: 0.5,
        clearcoat: 0.32,
        sheen: 0.3,
        sheenColor: new THREE.Color(0xffd070)
    }),
    wing: () => mat('wing-v3', {
        map: PATTY_TEX,
        bumpMap: MEAT_BUMP_TEX,
        bumpScale: 0.06,
        color: 0xb85828,
        roughness: 0.4,
        clearcoat: 0.6,
        clearcoatRoughness: 0.2
    }),
    wingGlaze: () => mat('wingGlaze-v3', {
        map: SAUCE_TEX,
        color: 0xd0431c,
        roughness: 0.14,
        clearcoat: 1.0,
        clearcoatRoughness: 0.06,
        transmission: 0.18,
        thickness: 0.4,
        sheen: 0.55,
        sheenColor: new THREE.Color(0xff8a50)
    }),
    garlicBread: () => mat('garlicBread-v3', {
        map: BRIOCHE_TEX,
        bumpMap: BUMP_TEX,
        bumpScale: 0.03,
        color: 0xeccb88,
        roughness: 0.6,
        clearcoat: 0.3,
        sheen: 0.35,
        sheenColor: new THREE.Color(0xffe598)
    }),
    glass: () => mat('glass', { color: 0xffffff, roughness: 0.05, transmission: 0.9, thickness: 1.0, clearcoat: 1.0, ior: 1.5, transparent: true, opacity: 0.9 }),
    iceCube: () => mat('iceCube', { color: 0xeaf6ff, roughness: 0.1, transmission: 0.85, thickness: 0.8, clearcoat: 0.9 }),
    liquidCola: () => mat('liquidCola', { color: 0x3a1208, roughness: 0.08, transmission: 0.35, thickness: 0.6 }),
    liquidMint: () => mat('liquidMint', { color: 0xb8e986, roughness: 0.1, transmission: 0.5, thickness: 0.5 }),
    liquidCoffee: () => mat('liquidCoffee', { color: 0x2b1508, roughness: 0.1, transmission: 0.3, thickness: 0.5 }),
    liquidSoda: () => mat('liquidSoda', { color: 0xe8c56b, roughness: 0.08, transmission: 0.55, thickness: 0.4 }),
    liquidTea: () => mat('liquidTea', { color: 0x6b2a10, roughness: 0.1, transmission: 0.4, thickness: 0.5 }),
    liquidJuice: () => mat('liquidJuice', { color: 0xf58220, roughness: 0.1, transmission: 0.55, thickness: 0.5 }),
    liquidWater: () => mat('liquidWater', { color: 0xd8eaf0, roughness: 0.05, transmission: 0.85, thickness: 0.6 }),
    straw: () => mat('straw', { color: 0xffffff, roughness: 0.5, clearcoat: 0.4 }),
    lime: () => mat('lime', { color: 0xb8d44e, roughness: 0.35, transmission: 0.3 }),
    mintLeaf: () => mat('mintLeaf', { color: 0x3f7a2a, roughness: 0.4, side: THREE.DoubleSide }),
    cakeChocolate: () => mat('cakeChocolate', { color: 0x3d1e0e, roughness: 0.5, clearcoat: 0.4 }),
    cakeVanilla: () => mat('cakeVanilla', { color: 0xf2dfb6, roughness: 0.6, clearcoat: 0.3 }),
    ganache: () => mat('ganache', { color: 0x2a1208, roughness: 0.1, clearcoat: 1.0 }),
    baklavaDough: () => mat('baklavaDough', { color: 0xe8c46a, roughness: 0.4, clearcoat: 0.5 }),
    pistachio: () => mat('pistachio', { color: 0x88a440, roughness: 0.5 }),
    walnut: () => mat('walnut', { color: 0x6b3f24, roughness: 0.6 }),
    croissant: () => mat('croissant-v3', {
        map: BRIOCHE_TEX,
        bumpMap: BUMP_TEX,
        bumpScale: 0.02,
        color: 0xd8a84e,
        roughness: 0.42,
        clearcoat: 0.45,
        clearcoatRoughness: 0.2,
        sheen: 0.4,
        sheenColor: new THREE.Color(0xffd98a)
    }),
    cheesecake: () => mat('cheesecake', { color: 0xfff4d8, roughness: 0.3, clearcoat: 0.6 }),
    biscuitBase: () => mat('biscuitBase', { color: 0x8a5a2a, roughness: 0.7 }),
    sesame: () => mat('sesame', { color: 0xf5deb3, roughness: 0.4 }),
    poppy: () => mat('poppy', { color: 0x1c1c1c, roughness: 0.5 }),
    seaSalt: () => mat('seaSalt', { color: 0xffffff, roughness: 0.15, transmission: 0.7, clearcoat: 0.9 }),
    shamiPatty: () => mat('shamiPatty-v3', {
        map: PATTY_TEX,
        bumpMap: MEAT_BUMP_TEX,
        bumpScale: 0.05,
        color: 0x9a5a24,
        roughness: 0.5,
        metalness: 0.02,
        clearcoat: 0.55,
        clearcoatRoughness: 0.24,
        sheen: 0.45,
        sheenRoughness: 0.35,
        sheenColor: new THREE.Color(0xffb070)
    }),
    tahchinCrust: () => mat('tahchinCrust-v3', {
        map: BRIOCHE_TEX,
        bumpMap: BUMP_TEX,
        bumpScale: 0.028,
        color: 0xd4a84a,
        roughness: 0.5,
        clearcoat: 0.4,
        clearcoatRoughness: 0.25,
        sheen: 0.4,
        sheenColor: new THREE.Color(0xffd98a)
    }),
    frostParticleMat: () => cachedMaterial('frostParticleMat', () => new THREE.PointsMaterial({
        map: PARTICLE_SPRITE_TEX,
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
   ADVANCED PROCEDURAL GEOMETRY PRIMITIVES
   ============================================================ */

export function createBunBase(radius, height, matFn, seed) {
    const key = `bun-base-${radius}-${height}`;
    const geo = cachedGeometry(key, () => {
        const g = new THREE.CylinderGeometry(radius, radius * 0.9, height, 64, 16);
        const pos = g.attributes.position;
        const rng = mulberry32(44011);
        for (let i = 0; i < pos.count; i++) {
            const x = pos.getX(i);
            const y = pos.getY(i);
            const z = pos.getZ(i);
            const r = Math.sqrt(x * x + z * z);
            const nY = (y + height / 2) / height;
            const a = Math.atan2(z, x);
            if (r > 0.05) {
                const belly = Math.sin(nY * Math.PI) * 0.14;
                const organic = Math.sin(a * 5) * 0.012 + Math.cos(a * 9) * 0.008;
                pos.setX(i, x * (1 + belly + organic));
                pos.setZ(i, z * (1 + belly + organic));
            }
            if (nY < 0.03) pos.setY(i, -height / 2);
            if (nY > 0.97 && r < radius * 0.9) {
                pos.setY(i, y - (1 - r / (radius * 0.9)) * 0.06);
            }
        }
        g.computeVertexNormals();
        return g;
    });
    return new THREE.Mesh(geo, matFn());
}

export function createBunCrown(radius, matFn, seed, toppingType) {
    const key = `bun-crown-v2-${radius}`;
    const geo = cachedGeometry(key, () => {
        const g = new THREE.SphereGeometry(radius, 96, 48);
        const pos = g.attributes.position;
        for (let i = 0; i < pos.count; i++) {
            let x = pos.getX(i);
            let y = pos.getY(i);
            let z = pos.getZ(i);
            const a = Math.atan2(z, x);
            const r = Math.sqrt(x * x + z * z);
            if (y >= 0) {
                const asymmetry = 1 + Math.sin(a * 2.4) * 0.03;
                y = y * 0.6 * asymmetry;
                const puff = Math.sin(a * 7) * 0.02 * (r / radius);
                y += puff;
            } else {
                y = y * 0.05;
                x *= (1 + y * 0.18);
                z *= (1 + y * 0.18);
            }
            pos.setXYZ(i, x, y, z);
        }
        g.computeVertexNormals();
        return g;
    });
    const crown = new THREE.Mesh(geo, matFn());
    const group = new THREE.Group();
    group.add(crown);

    if (toppingType === 'sesame' || toppingType === 'poppy') {
        const toppingMat = toppingType === 'sesame' ? M.sesame() : M.poppy();
        const tGeo = cachedGeometry('topping-seed', () => {
            const g = new THREE.SphereGeometry(0.05, 10, 10);
            g.scale(0.65, 0.35, 1.4);
            return g;
        });
        for (let i = 0; i < 60; i++) {
            const seed2 = new THREE.Mesh(tGeo, toppingMat);
            const phi = 0.15 + Math.sqrt(seed()) * 1.05;
            const theta = seed() * Math.PI * 2;
            const sx = radius * Math.sin(phi) * Math.cos(theta);
            const sz = radius * Math.sin(phi) * Math.sin(theta);
            const sy = (radius * Math.cos(phi)) * 0.6;
            const norm = new THREE.Vector3(sx, sy / 0.36, sz).normalize();
            seed2.position.set(sx + norm.x * 0.01, sy + norm.y * 0.01, sz + norm.z * 0.01);
            seed2.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), norm);
            seed2.rotateY(seed() * Math.PI);
            seed2.rotateZ((seed() - 0.5) * 0.4);
            seed2.castShadow = true;
            group.add(seed2);
        }
    } else if (toppingType === 'salt') {
        const sGeo = cachedGeometry('salt-crystal', () => new THREE.BoxGeometry(0.08, 0.08, 0.08));
        for (let i = 0; i < 45; i++) {
            const s = new THREE.Mesh(sGeo, M.seaSalt());
            const phi = 0.18 + seed() * 1.0;
            const theta = seed() * Math.PI * 2;
            const sx = radius * Math.sin(phi) * Math.cos(theta);
            const sz = radius * Math.sin(phi) * Math.sin(theta);
            const sy = (radius * Math.cos(phi)) * 0.6;
            const norm = new THREE.Vector3(sx, sy / 0.36, sz).normalize();
            s.position.set(sx + norm.x * 0.025, sy + norm.y * 0.025, sz + norm.z * 0.025);
            s.rotation.set(seed() * Math.PI, seed() * Math.PI, seed() * Math.PI);
            s.castShadow = true;
            group.add(s);
        }
    } else if (toppingType === 'everything') {
        const tGeo = cachedGeometry('topping-seed', () => {
            const g = new THREE.SphereGeometry(0.05, 10, 10);
            g.scale(0.65, 0.35, 1.4);
            return g;
        });
        for (let i = 0; i < 45; i++) {
            const s = new THREE.Mesh(tGeo, M.sesame());
            const phi = 0.18 + seed() * 1.0;
            const theta = seed() * Math.PI * 2;
            const sx = radius * Math.sin(phi) * Math.cos(theta);
            const sz = radius * Math.sin(phi) * Math.sin(theta);
            const sy = (radius * Math.cos(phi)) * 0.6;
            const norm = new THREE.Vector3(sx, sy / 0.36, sz).normalize();
            s.position.set(sx + norm.x * 0.012, sy + norm.y * 0.012, sz + norm.z * 0.012);
            s.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), norm);
            s.rotateY(seed() * Math.PI);
            group.add(s);
        }
        const pGeo = cachedGeometry('poppy-seed', () => new THREE.SphereGeometry(0.03, 8, 8));
        for (let i = 0; i < 35; i++) {
            const s = new THREE.Mesh(pGeo, M.poppy());
            const phi = 0.2 + seed() * 0.95;
            const theta = seed() * Math.PI * 2;
            const sx = radius * Math.sin(phi) * Math.cos(theta);
            const sz = radius * Math.sin(phi) * Math.sin(theta);
            const sy = (radius * Math.cos(phi)) * 0.6;
            s.position.set(sx, sy, sz);
            group.add(s);
        }
    }

    return group;
}

export function createPatty(radius, height, matFn) {
    const key = `patty-v4-${radius}-${height}`;
    const geo = cachedGeometry(key, () => {
        const radialSeg = 128;
        const heightSeg = 24;
        const g = new THREE.CylinderGeometry(radius, radius, height, radialSeg, heightSeg, false);
        const pos = g.attributes.position;
        const rng = mulberry32(44821);

        for (let i = 0; i < pos.count; i++) {
            let x = pos.getX(i);
            let y = pos.getY(i);
            let z = pos.getZ(i);
            const r = Math.sqrt(x * x + z * z);
            const a = Math.atan2(z, x);
            const nR = r / radius;

            const edgeThin = Math.max(0, Math.min(1, (nR - 0.62) / 0.38));
            const thicknessScale = 1.0 - Math.pow(edgeThin, 1.6) * 0.86;

            const centerBump = Math.max(0, 1 - Math.pow(nR / 0.55, 2)) * 0.06;
            const domed = Math.cos(nR * Math.PI * 0.5) * 0.03;

            y *= thicknessScale;
            y += (y > 0 ? 1 : -1) * (centerBump + domed);

            if (r > 0.05) {
                const strandA = Math.sin(x * 8.7 + z * 3.1) * 0.018;
                const strandB = Math.cos(z * 11.3 - x * 2.4) * 0.014;
                const strandC = Math.sin((x + z) * 16.9) * 0.009;
                const coarseDimple = Math.sin(a * 5 + nR * 8) * 0.012;
                const fatVein = Math.cos(a * 3 - nR * 14) * 0.010;
                const micro = (rng() - 0.5) * 0.006;

                const surfaceLayer = strandA + strandB + strandC + coarseDimple + fatVein + micro;

                if (Math.abs(y) > height * 0.05) {
                    y += surfaceLayer * (y > 0 ? 1 : -1) * 0.9;
                }

                const craterChance = Math.sin(a * 7 + nR * 5);
                if (craterChance > 0.72 && Math.abs(y) > height * 0.2) {
                    y -= (craterChance - 0.72) * 0.08 * (y > 0 ? 1 : -1);
                }
            }

            if (nR > 0.68) {
                const lacyFringe =
                    Math.sin(a * 17) * 0.06 +
                    Math.sin(a * 37) * 0.035 +
                    Math.cos(a * 73) * 0.02 +
                    (rng() - 0.5) * 0.015;

                const tearing = Math.sin(a * 41 + r * 7) * 0.03 + (rng() - 0.5) * 0.012;

                const fringeScale = Math.pow((nR - 0.68) / 0.32, 1.4);
                const totalFringe = (lacyFringe + tearing) * fringeScale;

                const edgeFactor = 1.0 + totalFringe;
                x *= edgeFactor;
                z *= edgeFactor;

                const verticalTear = Math.sin(a * 23) * 0.02 + (rng() - 0.5) * 0.008;
                y += verticalTear * fringeScale;
            }

            pos.setXYZ(i, x, y, z);
        }
        g.computeVertexNormals();
        return g;
    });
    const m = new THREE.Mesh(geo, matFn());
    m.castShadow = m.receiveShadow = true;
    return m;
}

export function createCheeseDrape(width, thickness, matFn, rotation) {
    const key = `cheese-v3-${width}-${thickness}`;
    const geo = cachedGeometry(key, () => {
        const seg = 96;
        const g = new THREE.BoxGeometry(width, thickness, width, seg, 6, seg);
        const pos = g.attributes.position;
        const pattyRadius = 1.78;
        const rng = mulberry32(33017);
        const dripPhases = [];
        for (let i = 0; i < 12; i++) {
            dripPhases.push({
                angle: (i / 12) * Math.PI * 2 + (rng() - 0.5) * 0.15,
                length: 0.28 + rng() * 0.14,
                width: 0.22 + rng() * 0.18
            });
        }
        for (let i = 0; i < pos.count; i++) {
            let x = pos.getX(i);
            let y = pos.getY(i);
            let z = pos.getZ(i);
            const r = Math.sqrt(x * x + z * z);
            const a = Math.atan2(z, x);

            if (r > pattyRadius) {
                const overhang = r - pattyRadius;
                const t = Math.min(overhang / 0.95, 1);
                const ease = Math.pow(t, 1.6);
                const baseDroop = ease * 0.34;

                let dripBoost = 0;
                for (let d = 0; d < dripPhases.length; d++) {
                    const dp = dripPhases[d];
                    let da = a - dp.angle;
                    while (da > Math.PI) da -= Math.PI * 2;
                    while (da < -Math.PI) da += Math.PI * 2;
                    const dist = Math.abs(da);
                    const falloff = Math.max(0, 1 - dist / dp.width);
                    dripBoost += dp.length * Math.pow(falloff, 2.4) * ease;
                }

                pos.setY(i, y - baseDroop - dripBoost);

                const pull = 1.0 - (baseDroop * 0.05 + dripBoost * 0.06);
                pos.setX(i, x * pull);
                pos.setZ(i, z * pull);
            } else {
                const top = y > 0;
                if (top) {
                    const softWaves = Math.sin(x * 7.5) * Math.cos(z * 7.5) * 0.01;
                    const dripPools = Math.sin(a * 5) * 0.008;
                    pos.setY(i, y + softWaves + dripPools);
                }
            }
        }
        g.computeVertexNormals();
        return g;
    });
    const m = new THREE.Mesh(geo, matFn());
    if (rotation) m.rotation.y = rotation;
    m.castShadow = m.receiveShadow = true;
    return m;
}

export function createLettuceRuffle(outerRadius, matFn) {
    const key = `lettuce-${outerRadius}`;
    const geo = cachedGeometry(key, () => {
        const g = new THREE.RingGeometry(0.4, outerRadius, 96, 24);
        g.rotateX(-Math.PI / 2);
        const pos = g.attributes.position;
        for (let i = 0; i < pos.count; i++) {
            const x = pos.getX(i);
            const z = pos.getZ(i);
            const r = Math.sqrt(x * x + z * z);
            const a = Math.atan2(z, x);
            const f = Math.pow(Math.max(0, (r - 0.4) / (outerRadius - 0.4)), 1.5);
            pos.setY(i, (Math.sin(a * 9) * 0.18 + Math.cos(r * 9.5) * 0.10 + Math.sin(a * 17) * 0.05) * f);
            const ruff = 1 + Math.sin(a * 11) * 0.08 * f + Math.cos(a * 23) * 0.04 * f;
            pos.setX(i, x * ruff);
            pos.setZ(i, z * ruff);
        }
        g.computeVertexNormals();
        return g;
    });
    const m = new THREE.Mesh(geo, matFn());
    m.castShadow = m.receiveShadow = true;
    return m;
}

export function createTomatoSlice(radius, thickness) {
    const key = `tomato-${radius}-${thickness}`;
    const geo = cachedGeometry(key, () => {
        const g = new THREE.CylinderGeometry(radius, radius, thickness, 48, 6);
        const pos = g.attributes.position;
        for (let i = 0; i < pos.count; i++) {
            const x = pos.getX(i);
            const y = pos.getY(i);
            const z = pos.getZ(i);
            if (Math.abs(y) > thickness / 2 - 0.02) {
                const bev = 1 - Math.pow((Math.abs(y) - thickness / 2 + 0.02) / 0.02, 2) * 0.08;
                pos.setX(i, x * bev);
                pos.setZ(i, z * bev);
            }
        }
        g.computeVertexNormals();
        return g;
    });
    const m = new THREE.Mesh(geo, M.tomato());
    m.castShadow = true;
    return m;
}

export function createOnionRings(count, seed) {
    const group = new THREE.Group();
    const ringGeo = cachedGeometry('onion-ring', () => new THREE.TorusGeometry(0.32, 0.07, 14, 32));
    for (let i = 0; i < count; i++) {
        const ring = new THREE.Mesh(ringGeo, M.onion());
        const rad = seed() * 1.6;
        const ang = seed() * Math.PI * 2;
        ring.position.set(rad * Math.cos(ang), 0, rad * Math.sin(ang));
        ring.rotation.x = Math.PI / 2 + (seed() - 0.5) * 0.3;
        ring.scale.set(1, 0.9 + seed() * 0.2, 1);
        ring.castShadow = true;
        group.add(ring);
    }
    return group;
}

export function createPickleSlices(count, seed) {
    const group = new THREE.Group();
    const sliceGeo = cachedGeometry('pickle-slice-v2', () => {
        const g = new THREE.CylinderGeometry(0.28, 0.28, 0.06, 32, 4);
        const pos = g.attributes.position;
        for (let i = 0; i < pos.count; i++) {
            const x = pos.getX(i);
            const y = pos.getY(i);
            const z = pos.getZ(i);
            const r = Math.sqrt(x * x + z * z);
            const a = Math.atan2(z, x);
            if (r > 0.24) {
                const ruffle = 1 + Math.sin(a * 14) * 0.06;
                pos.setX(i, x * ruffle);
                pos.setZ(i, z * ruffle);
            }
        }
        g.computeVertexNormals();
        return g;
    });
    for (let i = 0; i < count; i++) {
        const s = new THREE.Mesh(sliceGeo, M.pickle());
        s.position.set((seed() - 0.5) * 2.8, 0, (seed() - 0.5) * 2.2);
        s.rotation.set((seed() - 0.5) * 0.3, seed() * Math.PI, (seed() - 0.5) * 0.3);
        s.castShadow = true;
        group.add(s);
    }
    return group;
}

export function createJalapenoRings(count, seed) {
    const group = new THREE.Group();
    const ringGeo = cachedGeometry('jalapeno-ring-v2', () => {
        const g = new THREE.TorusGeometry(0.2, 0.075, 14, 32);
        return g;
    });
    const seedGeo = cachedGeometry('jalapeno-seed', () => new THREE.SphereGeometry(0.018, 6, 6));
    const seedMat = mat('jalapenoSeed', { color: 0xf0e0a8, roughness: 0.5 });
    for (let i = 0; i < count; i++) {
        const r = new THREE.Mesh(ringGeo, M.jalapeno());
        const rad = seed() * 2.0;
        const ang = seed() * Math.PI * 2;
        r.position.set(rad * Math.cos(ang), 0, rad * Math.sin(ang));
        r.rotation.x = Math.PI / 2 + (seed() - 0.5) * 0.2;
        r.scale.set(1, 1, 0.45);
        r.castShadow = true;
        group.add(r);

        const seedCount = 3 + Math.floor(seed() * 4);
        for (let j = 0; j < seedCount; j++) {
            const sd = new THREE.Mesh(seedGeo, seedMat);
            const sa = seed() * Math.PI * 2;
            sd.position.set(
                r.position.x + Math.cos(sa) * 0.16,
                r.position.y + 0.02,
                r.position.z + Math.sin(sa) * 0.16
            );
            group.add(sd);
        }
    }
    return group;
}

export function createSauceLayer(radius, thickness, matFn, seed) {
    const key = `sauce-v3-${radius}-${thickness}`;
    const geo = cachedGeometry(key, () => {
        const radialSeg = 128;
        const heightSeg = 8;
        const g = new THREE.CylinderGeometry(radius * 0.92, radius * 0.92, thickness, radialSeg, heightSeg);
        const pos = g.attributes.position;
        const rng = mulberry32(51723);
        const lobes = 8 + Math.floor(rng() * 5);
        const lobeAmp = 0.045 + rng() * 0.035;
        const dropletCount = 6 + Math.floor(rng() * 5);
        const droplets = [];
        for (let i = 0; i < dropletCount; i++) {
            droplets.push({
                angle: rng() * Math.PI * 2,
                amp: 0.06 + rng() * 0.08,
                width: 0.35 + rng() * 0.35
            });
        }
        for (let i = 0; i < pos.count; i++) {
            let x = pos.getX(i);
            let y = pos.getY(i);
            let z = pos.getZ(i);
            const r = Math.sqrt(x * x + z * z);
            const a = Math.atan2(z, x);
            const nR = r / radius;

            if (r > 0.05) {
                let wobble = 1.0 + Math.sin(a * lobes) * lobeAmp + Math.cos(a * (lobes + 3)) * 0.022;
                for (let d = 0; d < droplets.length; d++) {
                    const dp = droplets[d];
                    let da = a - dp.angle;
                    while (da > Math.PI) da -= Math.PI * 2;
                    while (da < -Math.PI) da += Math.PI * 2;
                    const falloff = Math.max(0, 1 - Math.abs(da) / dp.width);
                    wobble += dp.amp * Math.pow(falloff, 2.2);
                }

                const rr = r * wobble;
                pos.setX(i, Math.cos(a) * rr);
                pos.setZ(i, Math.sin(a) * rr);

                if (y > 0) {
                    const viscosity = Math.sin(a * 5) * 0.018 * nR + Math.cos(a * 11) * 0.008 * nR;
                    const pooled = Math.pow(nR, 2) * 0.012;
                    pos.setY(i, y + viscosity + pooled);
                } else if (y < 0) {
                    const dripDown = Math.sin(a * 4) * 0.006;
                    pos.setY(i, y - Math.abs(dripDown));
                }
            }
        }
        g.computeVertexNormals();
        return g;
    });
    const m = new THREE.Mesh(geo, matFn());
    m.castShadow = true;
    m.receiveShadow = true;
    return m;
}

export function createMushroomGroup(count, seed) {
    const group = new THREE.Group();
    const capGeo = cachedGeometry('mushroom-cap', () => new THREE.CylinderGeometry(0.28, 0.1, 0.14, 24));
    const stemGeo = cachedGeometry('mushroom-stem', () => new THREE.CylinderGeometry(0.07, 0.07, 0.18, 12));
    for (let i = 0; i < count; i++) {
        const shroom = new THREE.Group();
        const cap = new THREE.Mesh(capGeo, M.mushroom());
        cap.position.y = 0.09;
        const stem = new THREE.Mesh(stemGeo, M.mushroom());
        shroom.add(cap, stem);
        const rad = Math.sqrt(seed()) * 1.8;
        const ang = seed() * Math.PI * 2;
        shroom.position.set(rad * Math.cos(ang), 0, rad * Math.sin(ang));
        shroom.rotation.set((seed() - 0.5) * 0.8, seed() * Math.PI, (seed() - 0.5) * 0.8);
        group.add(shroom);
    }
    return group;
}

export function createChickenFillet(seed) {
    const key = 'chicken-fillet-v2';
    const geo = cachedGeometry(key, () => {
        const g = new THREE.SphereGeometry(1.9, 64, 40);
        const pos = g.attributes.position;
        for (let i = 0; i < pos.count; i++) {
            let x = pos.getX(i);
            let y = pos.getY(i);
            let z = pos.getZ(i);
            const a = Math.atan2(z, x);
            y *= 0.4;
            const ripples = 1 + Math.sin(a * 8) * 0.14 + Math.sin(a * 16) * 0.07 + Math.sin(a * 26) * 0.035;
            x *= ripples;
            z *= ripples;
            pos.setXYZ(i, x, y, z);
        }
        g.computeVertexNormals();
        return g;
    });
    const m = new THREE.Mesh(geo, M.crispyChicken());
    m.castShadow = m.receiveShadow = true;
    return m;
}

export function createBaguetteBottom() {
    const key = 'baguette-bottom';
    const geo = cachedGeometry(key, () => {
        const g = new THREE.CylinderGeometry(1.5, 1.5, 5.0, 64, 16);
        g.rotateZ(Math.PI / 2);
        const pos = g.attributes.position;
        for (let i = 0; i < pos.count; i++) {
            let x = pos.getX(i);
            let y = pos.getY(i);
            let z = pos.getZ(i);
            const taper = 1 - Math.pow(x / 2.5, 4) * 0.4;
            y *= taper * 0.5;
            z *= taper * 0.8;
            if (y > 0.1) y = 0.1;
            pos.setXYZ(i, x, y, z);
        }
        g.computeVertexNormals();
        return g;
    });
    return new THREE.Mesh(geo, M.baguette());
}

export function createBaguetteTop() {
    const key = 'baguette-top';
    const geo = cachedGeometry(key, () => {
        const g = new THREE.CylinderGeometry(1.5, 1.5, 5.0, 64, 16);
        g.rotateZ(Math.PI / 2);
        const pos = g.attributes.position;
        for (let i = 0; i < pos.count; i++) {
            let x = pos.getX(i);
            let y = pos.getY(i);
            let z = pos.getZ(i);
            const taper = 1 - Math.pow(x / 2.5, 4) * 0.4;
            y *= taper * 0.6;
            z *= taper * 0.8;
            if (y < -0.1) y = -0.1;
            if (y > 0 && Math.abs(z) < 0.15 && Math.abs(x) < 2.0) {
                y -= (0.15 - Math.abs(z)) * 1.5;
            }
            pos.setXYZ(i, x, y, z);
        }
        g.computeVertexNormals();
        return g;
    });
    return new THREE.Mesh(geo, M.baguette());
}

export function createSausageDisc(count, seed) {
    const group = new THREE.Group();
    const dGeo = cachedGeometry('sausage-disc', () => new THREE.CylinderGeometry(0.32, 0.32, 0.14, 32));
    for (let i = 0; i < count; i++) {
        const s = new THREE.Mesh(dGeo, M.sausage());
        s.position.set((seed() - 0.5) * 4.2, (seed() - 0.5) * 0.1, (seed() - 0.5) * 1.0);
        s.rotation.set(seed() * 0.5, seed() * Math.PI, seed() * 0.5);
        s.castShadow = true;
        group.add(s);
    }
    return group;
}

export function createParsleyFlakes(count, seed) {
    const group = new THREE.Group();
    const geo = cachedGeometry('parsley-flake', () => new THREE.PlaneGeometry(0.15, 0.15));
    for (let i = 0; i < count; i++) {
        const p = new THREE.Mesh(geo, M.lettuce());
        p.position.set((seed() - 0.5) * 4, 0.05, (seed() - 0.5) * 1.2);
        p.rotation.set(-Math.PI / 2, 0, seed() * Math.PI);
        group.add(p);
    }
    return group;
}

export function createPizzaCrust(style) {
    const key = `pizza-crust-${style}`;
    const geo = cachedGeometry(key, () => {
        const baseR = style === 'deep' ? 3.4 : 3.5;
        const g = new THREE.CylinderGeometry(baseR, baseR, style === 'deep' ? 0.4 : 0.15, 96, 24);
        const pos = g.attributes.position;
        for (let i = 0; i < pos.count; i++) {
            const x = pos.getX(i);
            const y = pos.getY(i);
            const z = pos.getZ(i);
            const r = Math.sqrt(x * x + z * z);
            if (style === 'neapolitan' && r > baseR * 0.72 && y > 0) {
                const puffProgress = (r - baseR * 0.72) / (baseR * 0.28);
                let puff = Math.sin(puffProgress * Math.PI * 0.5) * 0.42;
                const blister = (Math.sin(Math.atan2(z, x) * 15) * Math.cos(r * 20)) * 0.07;
                const puff2 = Math.sin(Math.atan2(z, x) * 26) * 0.03;
                puff += blister + puff2;
                pos.setY(i, y + Math.max(0, puff));
            } else if (style === 'thin' && r > baseR * 0.8 && y > 0) {
                pos.setY(i, y * 0.3);
            } else if (style === 'deep' && r > baseR * 0.75 && y > 0) {
                pos.setY(i, y + 0.35);
            }
        }
        g.computeVertexNormals();
        return g;
    });
    const m = new THREE.Mesh(geo, M.crust());
    m.castShadow = m.receiveShadow = true;
    return m;
}

export function createPepperoniCups(count, seed) {
    const group = new THREE.Group();
    const cupGeo = cachedGeometry('pepperoni-cup', () => {
        const g = new THREE.CylinderGeometry(0.34, 0.34, 0.04, 32, 10);
        const pos = g.attributes.position;
        for (let i = 0; i < pos.count; i++) {
            const x = pos.getX(i);
            const y = pos.getY(i);
            const z = pos.getZ(i);
            const r = Math.sqrt(x * x + z * z);
            if (r > 0.12 && y > 0) {
                const lift = Math.pow((r - 0.12) / 0.22, 2) * 0.14;
                pos.setY(i, y + lift);
            }
        }
        g.computeVertexNormals();
        return g;
    });
    for (let i = 0; i < count; i++) {
        const pep = new THREE.Mesh(cupGeo, M.pepperoni());
        const rad = Math.sqrt(seed()) * 2.6;
        const ang = seed() * Math.PI * 2;
        pep.position.set(rad * Math.cos(ang), 0, rad * Math.sin(ang));
        pep.rotation.set((seed() - 0.5) * 0.3, seed() * Math.PI, (seed() - 0.5) * 0.3);
        pep.castShadow = true;
        group.add(pep);
    }
    return group;
}

export function createBasilLeaves(count, seed) {
    const group = new THREE.Group();
    const geo = cachedGeometry('basil-leaf', () => {
        const g = new THREE.PlaneGeometry(0.4, 0.7, 16, 16);
        const pos = g.attributes.position;
        for (let i = 0; i < pos.count; i++) {
            const bx = pos.getX(i);
            const by = pos.getY(i);
            pos.setZ(i, Math.abs(bx) * 0.15 + Math.sin(by * Math.PI) * 0.15);
        }
        g.computeVertexNormals();
        return g;
    });
    for (let i = 0; i < count; i++) {
        const leaf = new THREE.Mesh(geo, M.basil());
        const rad = Math.sqrt(seed()) * 2.4;
        const ang = seed() * Math.PI * 2;
        leaf.position.set(rad * Math.cos(ang), 0.04, rad * Math.sin(ang));
        leaf.rotation.set(-Math.PI / 2 + (seed() - 0.5) * 0.4, 0, seed() * Math.PI);
        group.add(leaf);
    }
    return group;
}

export function createBellPepperRings(count, seed) {
    const group = new THREE.Group();
    const geo = cachedGeometry('bell-pepper-ring', () => new THREE.TorusGeometry(0.24, 0.08, 14, 32));
    for (let i = 0; i < count; i++) {
        const r = new THREE.Mesh(geo, M.bellPepper());
        const rad = Math.sqrt(seed()) * 2.5;
        const ang = seed() * Math.PI * 2;
        r.position.set(rad * Math.cos(ang), 0, rad * Math.sin(ang));
        r.rotation.x = Math.PI / 2;
        r.scale.set(1, 1, 0.4);
        group.add(r);
    }
    return group;
}

export function createOliveRings(count, seed) {
    const group = new THREE.Group();
    const geo = cachedGeometry('olive-ring', () => new THREE.TorusGeometry(0.12, 0.05, 12, 24));
    for (let i = 0; i < count; i++) {
        const o = new THREE.Mesh(geo, M.olive());
        const rad = Math.sqrt(seed()) * 2.7;
        const ang = seed() * Math.PI * 2;
        o.position.set(rad * Math.cos(ang), 0, rad * Math.sin(ang));
        o.rotation.x = Math.PI / 2;
        o.scale.set(1, 0.8 + seed() * 0.3, 1);
        group.add(o);
    }
    return group;
}

export function createPlatter(shape, matFn) {
    const key = `platter-${shape}`;
    const geo = cachedGeometry(key, () => {
        if (shape === 'round') return new THREE.CylinderGeometry(3.6, 3.2, 0.15, 96);
        if (shape === 'oval') {
            const g = new THREE.CylinderGeometry(3.6, 3.2, 0.15, 96);
            g.scale(1, 1, 0.65);
            return g;
        }
        return new THREE.BoxGeometry(5, 0.15, 3.5);
    });
    const m = new THREE.Mesh(geo, matFn());
    m.castShadow = m.receiveShadow = true;
    return m;
}

export function createRiceBed(matFn, radius, seed) {
    const key = `rice-bed-${radius}`;
    const geo = cachedGeometry(key, () => {
        const g = new THREE.SphereGeometry(radius, 96, 48, 0, Math.PI * 2, 0, Math.PI / 2);
        const pos = g.attributes.position;
        for (let i = 0; i < pos.count; i++) {
            const x = pos.getX(i);
            const y = pos.getY(i);
            const z = pos.getZ(i);
            const noise = Math.sin(x * 12) * Math.cos(z * 12) * 0.04 + Math.sin(x * 24) * 0.015;
            pos.setXYZ(i, x * (1 + noise), y * (1 + noise), z * (1 + noise));
        }
        g.computeVertexNormals();
        return g;
    });
    const m = new THREE.Mesh(geo, matFn());
    m.scale.set(1, 0.35, 0.7);
    m.castShadow = m.receiveShadow = true;
    return m;
}

export function createKebabSkewerGrooves(type) {
    const key = `kebab-${type}`;
    const geo = cachedGeometry(key, () => {
        const g = new THREE.CylinderGeometry(0.22, 0.22, 4.5, 48, 48);
        g.rotateZ(Math.PI / 2);
        const pos = g.attributes.position;
        for (let i = 0; i < pos.count; i++) {
            const x = pos.getX(i);
            const y = pos.getY(i);
            const z = pos.getZ(i);
            if (type === 'koobideh') {
                const indent = Math.sin(x * 6) * 0.06;
                if (Math.abs(y) > 0.05) pos.setY(i, y - Math.sign(y) * Math.abs(indent));
            } else if (type === 'joojeh') {
                if (Math.abs(x % 0.9) < 0.05) {
                    pos.setY(i, y * 0.85);
                    pos.setZ(i, z * 0.85);
                }
            } else if (type === 'chenjeh') {
                const block = Math.floor((x + 2.25) / 0.75);
                if (block % 2 === 0) {
                    pos.setY(i, y * 1.1);
                    pos.setZ(i, z * 1.1);
                }
            } else if (type === 'shishlik') {
                const block = Math.floor((x + 2.25) / 0.9);
                if (block % 2 === 0) {
                    pos.setY(i, y * 1.25);
                    pos.setZ(i, z * 1.25);
                }
            } else if (type === 'barg') {
                pos.setY(i, y * 1.4);
                pos.setZ(i, z * 0.7);
            }
        }
        g.computeVertexNormals();
        return g;
    });
    return geo;
}

export function createKebabGroup(type, matFn, seed) {
    const group = new THREE.Group();
    const geo = createKebabSkewerGrooves(type);
    const s1 = new THREE.Mesh(geo, matFn());
    s1.position.set(0.5, 0.2, 0.4);
    const s2 = new THREE.Mesh(geo, matFn());
    s2.position.set(0.5, 0.2, -0.4);
    s1.castShadow = s2.castShadow = true;
    group.add(s1, s2);
    return group;
}

export function createRoastedTomato(seed) {
    const key = 'roasted-tomato';
    const geo = cachedGeometry(key, () => {
        const g = new THREE.SphereGeometry(0.4, 48, 48);
        const pos = g.attributes.position;
        for (let i = 0; i < pos.count; i++) {
            const px = pos.getX(i);
            const py = pos.getY(i);
            const pz = pos.getZ(i);
            const n = Math.sin(px * 10) * Math.cos(pz * 10) * 0.03 + Math.sin(px * 24) * 0.012;
            pos.setXYZ(i, px * (1 + n), py * (1 + n) * 0.8, pz * (1 + n));
        }
        g.computeVertexNormals();
        return g;
    });
    const m = new THREE.Mesh(geo, M.tomatoRoast());
    m.castShadow = true;
    return m;
}

export function createButterSlab() {
    const key = 'butter-slab';
    const geo = cachedGeometry(key, () => new THREE.BoxGeometry(0.35, 0.15, 0.35));
    const m = new THREE.Mesh(geo, M.butter());
    m.rotation.y = Math.PI / 4;
    m.castShadow = true;
    return m;
}

export function createCeramicBowl(matFn) {
    const key = 'ceramic-bowl';
    const geo = cachedGeometry(key, () => {
        const points = [
            new THREE.Vector2(0, 0),
            new THREE.Vector2(1.8, 0),
            new THREE.Vector2(2.4, 0.8),
            new THREE.Vector2(2.6, 2.0)
        ];
        return new THREE.LatheGeometry(points, 96);
    });
    const m = new THREE.Mesh(geo, matFn());
    m.castShadow = m.receiveShadow = true;
    return m;
}

export function createBrothSurface(radius, matFn) {
    const key = `broth-${radius}`;
    const geo = cachedGeometry(key, () => {
        const g = new THREE.CylinderGeometry(radius, radius, 0.1, 96);
        const pos = g.attributes.position;
        for (let i = 0; i < pos.count; i++) {
            const x = pos.getX(i);
            const y = pos.getY(i);
            const z = pos.getZ(i);
            if (y > 0) pos.setY(i, y + Math.sin(x * 6) * Math.cos(z * 6) * 0.04 + Math.sin(x * 14) * 0.012);
        }
        g.computeVertexNormals();
        return g;
    });
    const m = new THREE.Mesh(geo, matFn());
    m.receiveShadow = true;
    return m;
}

export function createKashkSpiral() {
    const key = 'kashk-spiral';
    const geo = cachedGeometry(key, () => {
        class SpiralCurve extends THREE.Curve {
            getPoint(t, target = new THREE.Vector3()) {
                const a = t * Math.PI * 6;
                const r = t * 1.8;
                return target.set(Math.cos(a) * r, 0, Math.sin(a) * r);
            }
        }
        return new THREE.TubeGeometry(new SpiralCurve(), 160, 0.1, 20, false);
    });
    const m = new THREE.Mesh(geo, M.kashk());
    m.castShadow = true;
    return m;
}

export function createGarnishScatter(count, matFn, seed, size) {
    const group = new THREE.Group();
    const s = size || 0.1;
    const geo = cachedGeometry(`garnish-${s}`, () => new THREE.BoxGeometry(s, s * 0.5, s));
    for (let i = 0; i < count; i++) {
        const g = new THREE.Mesh(geo, matFn());
        const rad = Math.sqrt(seed()) * 2.2;
        const ang = seed() * Math.PI * 2;
        g.position.set(rad * Math.cos(ang), 0, rad * Math.sin(ang));
        g.rotation.set(seed() * Math.PI, seed() * Math.PI, seed() * Math.PI);
        g.castShadow = true;
        group.add(g);
    }
    return group;
}

export function createBarberryScatter(count, seed) {
    const group = new THREE.Group();
    const geo = cachedGeometry('barberry', () => new THREE.SphereGeometry(0.06, 10, 10));
    for (let i = 0; i < count; i++) {
        const b = new THREE.Mesh(geo, M.barberry());
        const rad = Math.sqrt(seed()) * 2.0;
        const ang = seed() * Math.PI * 2;
        b.position.set(rad * Math.cos(ang), 0.03, rad * Math.sin(ang));
        b.castShadow = true;
        group.add(b);
    }
    return group;
}

export function createFriesStack(count, seed, style) {
    const group = new THREE.Group();
    const geo = cachedGeometry(`fry-${style}`, () => {
        if (style === 'crinkle') {
            const g = new THREE.BoxGeometry(0.22, 0.22, 2.0, 12, 6, 32);
            const pos = g.attributes.position;
            for (let i = 0; i < pos.count; i++) {
                const z = pos.getZ(i);
                const r = Math.sin(z * 8) * 0.03;
                pos.setX(i, pos.getX(i) + r);
                pos.setY(i, pos.getY(i) + r);
            }
            g.computeVertexNormals();
            return g;
        }
        if (style === 'wedge') {
            return new THREE.BoxGeometry(0.5, 0.4, 1.8);
        }
        return new THREE.BoxGeometry(0.2, 0.2, 2.2);
    });
    const matFn = style === 'crinkle' ? M.fryCrinkle() : M.fry();
    for (let i = 0; i < count; i++) {
        const fry = new THREE.Mesh(geo, matFn);
        fry.position.set(
            (seed() - 0.5) * 2.5,
            seed() * 1.0,
            (seed() - 0.5) * 2.5
        );
        fry.rotation.set(
            (seed() - 0.5) * 0.5,
            seed() * Math.PI,
            (seed() - 0.5) * 0.5
        );
        fry.castShadow = fry.receiveShadow = true;
        group.add(fry);
    }
    return group;
}

export function createWingsGroup(count, seed, glazed) {
    const group = new THREE.Group();
    const geo = cachedGeometry('wing', () => {
        const g = new THREE.SphereGeometry(0.35, 24, 16);
        g.scale(1.6, 0.6, 0.8);
        return g;
    });
    const matFn = glazed ? M.wingGlaze() : M.wing();
    for (let i = 0; i < count; i++) {
        const w = new THREE.Mesh(geo, matFn);
        const rad = Math.sqrt(seed()) * 1.8;
        const ang = seed() * Math.PI * 2;
        w.position.set(rad * Math.cos(ang), 0, rad * Math.sin(ang));
        w.rotation.set(seed() * Math.PI, seed() * Math.PI, seed() * Math.PI);
        w.castShadow = true;
        group.add(w);
    }
    return group;
}

export function createMozzarellaSticks(count, seed) {
    const group = new THREE.Group();
    const geo = cachedGeometry('mozz-stick', () => new THREE.BoxGeometry(0.25, 0.25, 1.5));
    for (let i = 0; i < count; i++) {
        const s = new THREE.Mesh(geo, M.crispyChicken());
        s.position.set(
            (seed() - 0.5) * 2.0,
            0,
            (seed() - 0.5) * 1.5
        );
        s.rotation.set(seed() * 0.4, seed() * Math.PI, seed() * 0.4);
        s.castShadow = true;
        group.add(s);
    }
    return group;
}

export function createGarlicBreadSlice() {
    const key = 'garlic-bread';
    const geo = cachedGeometry(key, () => {
        const g = new THREE.BoxGeometry(3.2, 0.35, 1.2, 32, 10, 12);
        const pos = g.attributes.position;
        for (let i = 0; i < pos.count; i++) {
            const x = pos.getX(i);
            const z = pos.getZ(i);
            if (Math.abs(pos.getY(i)) > 0.15) {
                pos.setY(i, pos.getY(i) + Math.sin(x * 4) * 0.05 + Math.cos(z * 6) * 0.03);
            }
        }
        g.computeVertexNormals();
        return g;
    });
    const m = new THREE.Mesh(geo, M.garlicBread());
    m.castShadow = true;
    return m;
}

export function createGlassCup(style) {
    const key = `glass-${style}`;
    const geo = cachedGeometry(key, () => {
        if (style === 'tall') return new THREE.CylinderGeometry(1.1, 0.95, 4.5, 64, 4, true);
        if (style === 'short') return new THREE.CylinderGeometry(1.2, 1.1, 2.8, 64, 4, true);
        if (style === 'mug') {
            const g = new THREE.CylinderGeometry(1.0, 1.0, 2.4, 48, 4, true);
            return g;
        }
        return new THREE.CylinderGeometry(1.1, 0.95, 4.5, 64, 4, true);
    });
    const m = new THREE.Mesh(geo, M.glass());
    m.castShadow = true;
    return m;
}

export function createIceCubes(count, seed) {
    const group = new THREE.Group();
    const geo = cachedGeometry('ice-cube', () => new THREE.BoxGeometry(0.55, 0.55, 0.55));
    for (let i = 0; i < count; i++) {
        const ice = new THREE.Mesh(geo, M.iceCube());
        const a = seed() * Math.PI * 2;
        const r = seed() * 0.5;
        ice.position.set(
            Math.cos(a) * r,
            -1.5 + seed() * 3.0,
            Math.sin(a) * r
        );
        ice.rotation.set(seed() * Math.PI, seed() * Math.PI, seed() * Math.PI);
        ice.castShadow = true;
        group.add(ice);
    }
    return group;
}

export function createLiquidColumn(liquidMatFn) {
    const geo = cachedGeometry('liquid-column', () => new THREE.CylinderGeometry(1.0, 0.9, 3.8, 64));
    const m = new THREE.Mesh(geo, liquidMatFn());
    m.position.y = -0.3;
    m.castShadow = true;
    return m;
}

export function createStraw() {
    const key = 'straw';
    const geo = cachedGeometry(key, () => new THREE.CylinderGeometry(0.08, 0.08, 5.5, 20));
    const m = new THREE.Mesh(geo, M.straw());
    m.position.set(0.4, 1.0, 0.3);
    m.rotation.set(0.15, 0, 0.2);
    return m;
}

export function createLimeWheel() {
    const key = 'lime-wheel';
    const geo = cachedGeometry(key, () => new THREE.CylinderGeometry(0.5, 0.5, 0.08, 40));
    const m = new THREE.Mesh(geo, M.lime());
    m.castShadow = true;
    return m;
}

export function createMintSprig(count, seed) {
    const group = new THREE.Group();
    const geo = cachedGeometry('mint-leaf-sprig', () => {
        const g = new THREE.SphereGeometry(0.18, 20, 20);
        g.scale(1, 0.3, 1.6);
        return g;
    });
    for (let i = 0; i < count; i++) {
        const l = new THREE.Mesh(geo, M.mintLeaf());
        l.position.set(-0.3 + i * 0.3, 2.3, 0.2);
        l.rotation.set(Math.PI / 3, i * 0.4, 0);
        l.castShadow = true;
        group.add(l);
    }
    return group;
}

export function createCanCylinder() {
    const key = 'soda-can';
    const geo = cachedGeometry(key, () => new THREE.CylinderGeometry(0.85, 0.85, 3.5, 48, 4));
    const m = new THREE.Mesh(geo, mat('canBody', { color: 0xcc1111, roughness: 0.25, metalness: 0.65, clearcoat: 0.9 }));
    m.castShadow = true;
    return m;
}

export function createCakeSlice(style, seed) {
    const key = `cake-${style}`;
    const geo = cachedGeometry(key, () => new THREE.BoxGeometry(2.2, 1.4, 1.4));
    const group = new THREE.Group();
    const baseMat = style === 'chocolate' ? M.cakeChocolate() : M.cakeVanilla();
    const base = new THREE.Mesh(geo, baseMat);
    base.castShadow = base.receiveShadow = true;
    group.add(base);

    if (style === 'chocolate') {
        const ganacheGeo = cachedGeometry('ganache-top', () => new THREE.BoxGeometry(2.25, 0.12, 1.45));
        const top = new THREE.Mesh(ganacheGeo, M.ganache());
        top.position.y = 0.71;
        top.castShadow = true;
        group.add(top);

        for (let i = 0; i < 6; i++) {
            const hazel = new THREE.Mesh(
                cachedGeometry('hazelnut', () => new THREE.SphereGeometry(0.1, 12, 12)),
                mat('hazelnut', { color: 0xa87a4b, roughness: 0.6 })
            );
            hazel.position.set((seed() - 0.5) * 1.8, 0.78, (seed() - 0.5) * 1.2);
            group.add(hazel);
        }
    }
    return group;
}

export function createCheesecakeSlice(seed) {
    const group = new THREE.Group();
    const baseGeo = cachedGeometry('cheesecake-base', () => new THREE.BoxGeometry(2.2, 0.35, 1.4));
    const base = new THREE.Mesh(baseGeo, M.biscuitBase());
    base.position.y = -0.55;
    base.castShadow = true;
    group.add(base);

    const bodyGeo = cachedGeometry('cheesecake-body', () => new THREE.BoxGeometry(2.15, 1.0, 1.35));
    const body = new THREE.Mesh(bodyGeo, M.cheesecake());
    body.position.y = 0.05;
    body.castShadow = true;
    group.add(body);

    for (let i = 0; i < 5; i++) {
        const berry = new THREE.Mesh(
            cachedGeometry('berry', () => new THREE.SphereGeometry(0.12, 14, 14)),
            mat('berry', { color: 0xa01030, roughness: 0.3, clearcoat: 0.8 })
        );
        berry.position.set((seed() - 0.5) * 1.6, 0.62, (seed() - 0.5) * 1.0);
        berry.castShadow = true;
        group.add(berry);
    }
    return group;
}

export function createBaklavaStack(count, seed, filling) {
    const group = new THREE.Group();
    const doughGeo = cachedGeometry('baklava-dough', () => new THREE.BoxGeometry(1.8, 0.05, 0.9));
    const fillGeo = cachedGeometry('baklava-fill', () => new THREE.BoxGeometry(1.8, 0.12, 0.9));
    const fillMat = filling === 'pistachio' ? M.pistachio() : M.walnut();
    for (let i = 0; i < count; i++) {
        const dough = new THREE.Mesh(doughGeo, M.baklavaDough());
        dough.position.y = i * 0.17;
        dough.castShadow = true;
        group.add(dough);
        if (i < count - 1) {
            const fill = new THREE.Mesh(fillGeo, fillMat);
            fill.position.y = i * 0.17 + 0.085;
            group.add(fill);
        }
    }
    return group;
}

export function createCroissant() {
    const key = 'croissant';
    const geo = cachedGeometry(key, () => {
        class CroissantCurve extends THREE.Curve {
            getPoint(t, target = new THREE.Vector3()) {
                const angle = (t - 0.5) * Math.PI * 1.3;
                const r = 1.2;
                return target.set(Math.sin(angle) * r, 0, (Math.cos(angle) - 1) * r * 0.6);
            }
        }
        return new THREE.TubeGeometry(new CroissantCurve(), 96, 0.28, 20, false);
    });
    const m = new THREE.Mesh(geo, M.croissant());
    m.castShadow = m.receiveShadow = true;
    return m;
}

export function createShamiPatty(seed) {
    const key = 'shami-patty';
    const geo = cachedGeometry(key, () => {
        const g = new THREE.CylinderGeometry(1.1, 1.05, 0.35, 64, 12);
        const pos = g.attributes.position;
        const rng = mulberry32(91827);
        for (let i = 0; i < pos.count; i++) {
            const x = pos.getX(i);
            const y = pos.getY(i);
            const z = pos.getZ(i);
            const a = Math.atan2(z, x);
            const r = Math.sqrt(x * x + z * z);
            if (r > 0.85) {
                const wobble = Math.sin(a * 8) * 0.06 + Math.cos(a * 13) * 0.04 + Math.sin(a * 21) * 0.025;
                pos.setX(i, x * (1 + wobble));
                pos.setZ(i, z * (1 + wobble));
            }
            if (Math.abs(y) > 0.15) {
                pos.setY(i, y + Math.sin(x * 5) * Math.cos(z * 5) * 0.025 + (rng() - 0.5) * 0.012);
            }
        }
        g.computeVertexNormals();
        return g;
    });
    const m = new THREE.Mesh(geo, M.shamiPatty());
    m.castShadow = m.receiveShadow = true;
    return m;
}

export function createTahchinCake() {
    const key = 'tahchin-cake';
    const geo = cachedGeometry(key, () => {
        const g = new THREE.CylinderGeometry(2.3, 2.1, 0.85, 96, 12);
        const pos = g.attributes.position;
        for (let i = 0; i < pos.count; i++) {
            const x = pos.getX(i);
            const y = pos.getY(i);
            const z = pos.getZ(i);
            const a = Math.atan2(z, x);
            const r = Math.sqrt(x * x + z * z);
            if (r > 1.9) {
                const crust = Math.sin(a * 14) * 0.05 + Math.sin(a * 26) * 0.028;
                pos.setX(i, x * (1 + crust));
                pos.setZ(i, z * (1 + crust));
            }
            if (y > 0.3) pos.setY(i, y + Math.sin(a * 10) * 0.045 + Math.cos(a * 21) * 0.02);
        }
        g.computeVertexNormals();
        return g;
    });
    const m = new THREE.Mesh(geo, M.tahchinCrust());
    m.castShadow = m.receiveShadow = true;
    return m;
}

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