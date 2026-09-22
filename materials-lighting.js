/* ==========================================================================
 * materials-lighting.js
 * --------------------------------------------------------------------------
 * Procedural textures, PBR materials, three-point studio lighting, and
 * optional post-processing helpers for the Snapp Shop 3D viewer.
 * ========================================================================== */

import * as THREE from 'three';

/* ==========================================================================
 * TEXTURE GENERATORS — Canvas-based, procedural, seeded
 * ========================================================================== */

function makeCanvas(size) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    return canvas;
}

function canvasToTexture(canvas, repeatWrapping = true) {
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = repeatWrapping ? THREE.RepeatWrapping : THREE.ClampToEdgeWrapping;
    tex.wrapT = repeatWrapping ? THREE.RepeatWrapping : THREE.ClampToEdgeWrapping;
    tex.anisotropy = 4;
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
}

/* --------------------------- 1. Brioche crust --------------------------- */
function createBriocheTexture() {
    const c = makeCanvas(1024);
    const ctx = c.getContext('2d');

    const grad = ctx.createRadialGradient(512, 480, 80, 512, 512, 520);
    grad.addColorStop(0.0, '#df9b3a');
    grad.addColorStop(0.45, '#c57822');
    grad.addColorStop(0.8, '#8c4210');
    grad.addColorStop(1.0, '#562106');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1024, 1024);

    const imgData = ctx.getImageData(0, 0, 1024, 1024);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
        const n = (Math.random() - 0.5) * 18;
        data[i]     = Math.min(255, Math.max(0, data[i]     + n * 1.1));
        data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + n * 0.7));
        data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + n * 0.3));
    }
    ctx.putImageData(imgData, 0, 0);

    ctx.fillStyle = 'rgba(255, 230, 180, 0.08)';
    for (let i = 0; i < 40; i++) {
        const x = Math.random() * 1024;
        const y = Math.random() * 1024;
        const r = 20 + Math.random() * 80;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
    }

    return canvasToTexture(c);
}

/* -------------------------- 2. Beef patty ------------------------------ */
function createPattyTexture() {
    const c = makeCanvas(1024);
    const ctx = c.getContext('2d');

    ctx.fillStyle = '#220f09';
    ctx.fillRect(0, 0, 1024, 1024);

    for (let i = 0; i < 75000; i++) {
        const x = Math.random() * 1024;
        const y = Math.random() * 1024;
        const r = Math.random() * 2.2;
        const roll = Math.random();
        if (roll > 0.88)      ctx.fillStyle = '#dfa575';
        else if (roll > 0.52) ctx.fillStyle = '#3a180f';
        else if (roll > 0.22) ctx.fillStyle = '#120502';
        else                  ctx.fillStyle = '#5a2215';
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.strokeStyle = 'rgba(14, 5, 2, 0.65)';
    ctx.lineWidth = 16;
    ctx.filter = 'blur(4px)';
    for (let x = -200; x < 1300; x += 170) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x + 260, 1024);
        ctx.stroke();
    }
    ctx.filter = 'none';

    return canvasToTexture(c);
}

/* ------------------------- 3. Generic bump map ------------------------- */
function createNoiseBumpMap(size = 512, repeat = 4) {
    const c = makeCanvas(size);
    const ctx = c.getContext('2d');
    const imgData = ctx.createImageData(size, size);
    for (let i = 0; i < imgData.data.length; i += 4) {
        const v = Math.floor(Math.random() * 255);
        imgData.data[i]     = v;
        imgData.data[i + 1] = v;
        imgData.data[i + 2] = v;
        imgData.data[i + 3] = 255;
    }
    ctx.putImageData(imgData, 0, 0);
    const tex = canvasToTexture(c);
    tex.repeat.set(repeat, repeat);
    return tex;
}

/* --------------------------- 4. Cheese ---------------------------------- */
function createCheeseTexture() {
    const c = makeCanvas(512);
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#ffa71a';
    ctx.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 40; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 512;
        const rad = 40 + Math.random() * 90;
        const grad = ctx.createRadialGradient(x, y, 0, x, y, rad);
        grad.addColorStop(0, 'rgba(255, 198, 70, 0.45)');
        grad.addColorStop(0.6, 'rgba(235, 130, 15, 0.25)');
        grad.addColorStop(1, 'rgba(255, 167, 26, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x, y, rad, 0, Math.PI * 2);
        ctx.fill();
    }
    return canvasToTexture(c);
}

/* -------------------------- 5. Lettuce --------------------------------- */
function createLettuceTexture() {
    const c = makeCanvas(1024);
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#4c9921';
    ctx.fillRect(0, 0, 1024, 1024);
    for (let i = 0; i < 300; i++) {
        const x = Math.random() * 1024;
        const y = Math.random() * 1024;
        const r = 20 + Math.random() * 60;
        ctx.fillStyle = Math.random() > 0.5
            ? 'rgba(96, 179, 48, 0.25)'
            : 'rgba(56, 128, 22, 0.2)';
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.strokeStyle = 'rgba(175, 232, 110, 0.65)';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.filter = 'blur(1px)';
    for (let r = 0; r < 8; r++) {
        const angle = (r / 8) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(512, 512);
        let cx = 512, cy = 512;
        for (let s = 0; s < 6; s++) {
            cx += Math.cos(angle) * 75 + (Math.random() - 0.5) * 25;
            cy += Math.sin(angle) * 75 + (Math.random() - 0.5) * 25;
            ctx.lineTo(cx, cy);
        }
        ctx.stroke();
    }
    ctx.filter = 'none';
    return canvasToTexture(c);
}

/* -------------------------- 6. Tomato --------------------------------- */
function createTomatoTexture() {
    const c = makeCanvas(512);
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#b51414';
    ctx.fillRect(0, 0, 512, 512);
    const center = 256;
    for (let a = 0; a < 5; a++) {
        const angle = (a / 5) * Math.PI * 2 + 0.3;
        const lx = center + Math.cos(angle) * 115;
        const ly = center + Math.sin(angle) * 115;
        const gelGrad = ctx.createRadialGradient(lx, ly, 10, lx, ly, 65);
        gelGrad.addColorStop(0, '#5f0808');
        gelGrad.addColorStop(0.7, '#8f1212');
        gelGrad.addColorStop(1, '#b51414');
        ctx.fillStyle = gelGrad;
        ctx.beginPath();
        ctx.arc(lx, ly, 60, 0, Math.PI * 2);
        ctx.fill();
        for (let s = 0; s < 4; s++) {
            const sx = lx + (Math.random() - 0.5) * 45;
            const sy = ly + (Math.random() - 0.5) * 45;
            ctx.fillStyle = '#ecd379';
            ctx.beginPath();
            ctx.ellipse(sx, sy, 7, 4, Math.random() * Math.PI, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    ctx.strokeStyle = '#e0281b';
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.arc(center, center, 248, 0, Math.PI * 2);
    ctx.stroke();
    return canvasToTexture(c, false);
}

/* -------------------------- 7. Aioli ---------------------------------- */
function createAioliTexture() {
    const c = makeCanvas(512);
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#fdf8ea';
    ctx.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 450; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 512;
        if (Math.random() > 0.4) {
            ctx.fillStyle = '#2d4424';
            ctx.fillRect(x, y, 2.5 + Math.random() * 3, 1.5);
        } else {
            ctx.fillStyle = '#1e1a16';
            ctx.beginPath();
            ctx.arc(x, y, 1 + Math.random() * 1.5, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    return canvasToTexture(c);
}

/* ------------------------ 8. Particle sprite -------------------------- */
function createParticleSprite() {
    const c = makeCanvas(64);
    const ctx = c.getContext('2d');
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0.0, 'rgba(255, 255, 255, 1.0)');
    grad.addColorStop(0.25, 'rgba(215, 240, 255, 0.7)');
    grad.addColorStop(0.65, 'rgba(160, 205, 245, 0.2)');
    grad.addColorStop(1.0, 'rgba(0, 0, 0, 0.0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
}

/* ==========================================================================
 * CREATE TEXTURES ONCE
 * ========================================================================== */
const briocheTex = createBriocheTexture();
const pattyTex = createPattyTexture();
const meatBumpTex = createNoiseBumpMap(512, 4);
const cheeseTex = createCheeseTexture();
const lettuceTex = createLettuceTexture();
const tomatoTex = createTomatoTexture();
const aioliTex = createAioliTexture();
const particleSpriteTex = createParticleSprite();

/* ==========================================================================
 * PBR MATERIALS
 * ========================================================================== */
export const materials = {
    briocheMat: new THREE.MeshPhysicalMaterial({
        map: briocheTex,
        bumpMap: meatBumpTex,
        bumpScale: 0.014,
        roughness: 0.35,
        metalness: 0.0,
        clearcoat: 0.40,
        clearcoatRoughness: 0.30,
        sheen: 0.32,
        sheenRoughness: 0.45,
        sheenColor: new THREE.Color(0xf5a442),
        reflectivity: 0.5
    }),

    pattyMat: new THREE.MeshPhysicalMaterial({
        map: pattyTex,
        bumpMap: meatBumpTex,
        bumpScale: 0.10,
        roughness: 0.65,
        metalness: 0.12,
        clearcoat: 0.35,
        clearcoatRoughness: 0.22,
        reflectivity: 0.55
    }),

    cheeseMat: new THREE.MeshPhysicalMaterial({
        map: cheeseTex,
        bumpMap: meatBumpTex,
        bumpScale: 0.015,
        roughness: 0.18,
        metalness: 0.0,
        transmission: 0.18,
        thickness: 0.65,
        clearcoat: 0.82,
        clearcoatRoughness: 0.14,
        reflectivity: 0.75
    }),

    lettuceMat: new THREE.MeshPhysicalMaterial({
        map: lettuceTex,
        bumpMap: meatBumpTex,
        bumpScale: 0.02,
        roughness: 0.28,
        metalness: 0.0,
        transmission: 0.35,
        thickness: 0.30,
        clearcoat: 0.45,
        clearcoatRoughness: 0.25,
        side: THREE.DoubleSide
    }),

    tomatoMat: new THREE.MeshPhysicalMaterial({
        map: tomatoTex,
        roughness: 0.08,
        metalness: 0.0,
        transmission: 0.22,
        thickness: 0.85,
        clearcoat: 1.0,
        clearcoatRoughness: 0.06,
        reflectivity: 0.95
    }),

    sesameMat: new THREE.MeshPhysicalMaterial({
        color: 0xf6e3c5,
        roughness: 0.28,
        metalness: 0.02,
        clearcoat: 0.55,
        clearcoatRoughness: 0.2
    }),

    aioliMat: new THREE.MeshPhysicalMaterial({
        map: aioliTex,
        roughness: 0.06,
        metalness: 0.0,
        transmission: 0.18,
        thickness: 0.45,
        clearcoat: 1.0,
        clearcoatRoughness: 0.03,
        reflectivity: 0.98
    }),

    frostParticleMat: new THREE.PointsMaterial({
        map: particleSpriteTex,
        size: 0.22,
        color: 0xdaf0ff,
        transparent: true,
        opacity: 0.72,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        sizeAttenuation: true
    })
};

/* Aliases for cross-module compatibility */
materials.pretzelBunMat = materials.briocheMat;
materials.blackBunMat = materials.briocheMat;
materials.dryAgedPattyMat = materials.pattyMat;
materials.charredPattyMat = materials.pattyMat;
materials.blueCheeseMat = materials.cheeseMat;
materials.pepperJackMat = materials.cheeseMat;
materials.mushroomMat = materials.lettuceMat;
materials.onionStrawMat = materials.tomatoMat;
materials.saltMat = materials.sesameMat;
materials.emberParticleMat = materials.frostParticleMat;

/* ==========================================================================
 * STUDIO LIGHTING — 5-point setup tuned for physical materials
 * ========================================================================== */
export function initLighting(scene) {
    /* Warm ambient to lift blacks slightly */
    const ambient = new THREE.AmbientLight(0x332a22, 1.4);

    /* Key light — warm, casts shadows */
    const keyLight = new THREE.DirectionalLight(0xffeed6, 3.4);
    keyLight.position.set(6.5, 8.5, 6.5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 30;
    keyLight.shadow.camera.left = -6.5;
    keyLight.shadow.camera.right = 6.5;
    keyLight.shadow.camera.top = 6.5;
    keyLight.shadow.camera.bottom = -6.5;
    keyLight.shadow.bias = -0.0003;
    keyLight.shadow.radius = 2.0;

    /* Cool fill from the opposite side */
    const fillLight = new THREE.DirectionalLight(0x8cb4e6, 1.8);
    fillLight.position.set(-7.5, 3.2, 5.0);

    /* Warm rim from behind */
    const rimLight = new THREE.SpotLight(0xffb862, 5.5);
    rimLight.position.set(0.0, 7.5, -7.5);
    rimLight.angle = Math.PI / 3.8;
    rimLight.penumbra = 0.55;
    rimLight.lookAt(0, 0, 0);

    /* Bounce from below for that food-photography glow */
    const bounceLight = new THREE.DirectionalLight(0x523219, 0.85);
    bounceLight.position.set(0.0, -5.0, 2.0);

    scene.add(ambient, keyLight, fillLight, rimLight, bounceLight);
    return { ambient, keyLight, fillLight, rimLight, bounceLight };
}