/* ==========================================================================
 * geometry-stack.js
 * --------------------------------------------------------------------------
 * Procedural 3D geometry builder for the Snapp Shop 3D product viewer.
 *
 * This module exposes:
 *   - `buildProduct3D(scene, product)` — the main entry point that routes
 *     a product to the correct procedural builder based on category.
 *   - `updateParticles(delta)` — advances the ambient particle system.
 *   - `burgerGroup` / `explosionLayers` — shared state used by the
 *     ExplodedViewBuilder to animate layer separation on scroll.
 *
 * Categories supported:
 *   - burgers      (brioche buns, smash patty, cheese drape, veggies)
 *   - sandwich     (uses the burger builder)
 *   - pizza        (Neapolitan crust, marinara, mozzarella, pepperoni, basil)
 *   - kebab        (porcelain platter, saffron rice, koobideh skewers,
 *                   fire-roasted tomatoes, butter slab)
 *   - ash          (blue ceramic bowl, herbal broth, kashk spiral,
 *                   fried mint & shallots)
 *   - traditional  (uses the ash builder)
 *   - appetizers   (parchment paper, stacked fries, cheese fondue drizzle,
 *                   bacon bits)
 *   - drinks       (glass, ice, liquid, straw, garnish)
 *   - fallback     (renders the appetizers builder as a safe default)
 * ========================================================================== */

import * as THREE from 'three';
import { materials } from './materials-lighting.js';

/* ==========================================================================
 * SHARED MODULE STATE
 * ========================================================================== */

/** Root group that holds every product layer as a direct child. */
export const burgerGroup = new THREE.Group();

/** Layer descriptors with vertical positions for the exploded view. */
export const explosionLayers = [];

/** Reference to the ambient particle system so we can dispose/replace it. */
let particlesMesh = null;

/* ==========================================================================
 * LOCAL PROCEDURAL MATERIALS (for non-burger items)
 * ========================================================================== */

const localMats = {
    /* --- Pizza --------------------------------------------------------- */
    pizzaCrust: new THREE.MeshPhysicalMaterial({
        color: 0xdca263, roughness: 0.85, clearcoat: 0.05, metalness: 0.0
    }),
    pizzaSauce: new THREE.MeshPhysicalMaterial({
        color: 0x8a180f, roughness: 0.25, clearcoat: 0.9, metalness: 0.0
    }),
    mozzarella: new THREE.MeshPhysicalMaterial({
        color: 0xfffae6, roughness: 0.30, clearcoat: 0.5,
        transmission: 0.10, thickness: 0.2
    }),
    pepperoni: new THREE.MeshPhysicalMaterial({
        color: 0x801c10, roughness: 0.55, clearcoat: 0.6, metalness: 0.0
    }),
    basil: new THREE.MeshPhysicalMaterial({
        color: 0x2d5a27, roughness: 0.35, clearcoat: 0.2,
        side: THREE.DoubleSide
    }),

    /* --- Kebab --------------------------------------------------------- */
    porcelain: new THREE.MeshPhysicalMaterial({
        color: 0xffffff, roughness: 0.12, clearcoat: 1.0
    }),
    rice: new THREE.MeshPhysicalMaterial({ color: 0xfdfbf7, roughness: 0.9 }),
    riceSaffron: new THREE.MeshPhysicalMaterial({ color: 0xffb81c, roughness: 0.9 }),
    kebabMeat: new THREE.MeshPhysicalMaterial({
        color: 0x3a1b0b, roughness: 0.7, clearcoat: 0.35
    }),
    tomatoRoast: new THREE.MeshPhysicalMaterial({
        color: 0x730e06, roughness: 0.5, clearcoat: 0.8
    }),
    butter: new THREE.MeshPhysicalMaterial({
        color: 0xffe680, roughness: 0.3, clearcoat: 0.6
    }),

    /* --- Ash / traditional --------------------------------------------- */
    ceramicBlue: new THREE.MeshPhysicalMaterial({
        color: 0x003399, roughness: 0.2, clearcoat: 1.0, side: THREE.DoubleSide
    }),
    ashBroth: new THREE.MeshPhysicalMaterial({
        color: 0x3b4d2e, roughness: 0.12, clearcoat: 1.0
    }),
    kashk: new THREE.MeshPhysicalMaterial({
        color: 0xf4f0e6, roughness: 0.22, clearcoat: 0.5
    }),
    mintDagh: new THREE.MeshPhysicalMaterial({
        color: 0x1f3d17, roughness: 0.8
    }),

    /* --- Appetizers ----------------------------------------------------- */
    parchment: new THREE.MeshPhysicalMaterial({
        color: 0xe8ddc5, roughness: 0.9, side: THREE.DoubleSide
    }),
    fry: new THREE.MeshPhysicalMaterial({
        color: 0xe5a93d, roughness: 0.5, clearcoat: 0.2
    }),
    fondue: new THREE.MeshPhysicalMaterial({
        color: 0xff9900, roughness: 0.22, clearcoat: 0.8
    }),
    baconBit: new THREE.MeshPhysicalMaterial({
        color: 0x6e2015, roughness: 0.6
    }),

    /* --- Drinks --------------------------------------------------------- */
    glass: new THREE.MeshPhysicalMaterial({
        color: 0xffffff, roughness: 0.05, metalness: 0.0,
        transmission: 0.9, thickness: 1.0, clearcoat: 1.0,
        ior: 1.5, transparent: true, opacity: 0.9
    }),
    iceCube: new THREE.MeshPhysicalMaterial({
        color: 0xeaf6ff, roughness: 0.1, transmission: 0.85,
        thickness: 0.8, clearcoat: 0.9, ior: 1.31
    }),
    mintLiquid: new THREE.MeshPhysicalMaterial({
        color: 0xb8e986, roughness: 0.1, transmission: 0.5, thickness: 0.5
    }),
    colaLiquid: new THREE.MeshPhysicalMaterial({
        color: 0x3a1208, roughness: 0.08, transmission: 0.35, thickness: 0.6
    }),
    straw: new THREE.MeshPhysicalMaterial({
        color: 0xffffff, roughness: 0.5, clearcoat: 0.4
    })
};

/* ==========================================================================
 * ROUTER
 * ========================================================================== */

/**
 * Route a product to its procedural builder and repopulate the shared
 * `explosionLayers` array. The scene argument is used to add the root group
 * and the ambient particle system.
 *
 * @param {THREE.Scene} scene
 * @param {{categoryId:string,title:string,price:number}} product
 */
export function buildProduct3D(scene, product) {
    /* --- Clear previous state --------------------------------------- */
    explosionLayers.length = 0;
    while (burgerGroup.children.length > 0) {
        burgerGroup.remove(burgerGroup.children[0]);
    }
    if (particlesMesh && particlesMesh.parent) {
        particlesMesh.parent.remove(particlesMesh);
        if (particlesMesh.geometry) particlesMesh.geometry.dispose();
        particlesMesh = null;
    }

    /* --- Route by category ------------------------------------------ */
    const cat = product.categoryId;
    switch (cat) {
        case 'burgers':
        case 'sandwich':
            buildBurgerCategory();
            break;
        case 'pizza':
            buildPizzaCategory();
            break;
        case 'kebab':
            buildKebabCategory();
            break;
        case 'ash':
        case 'traditional':
            buildAshCategory();
            break;
        case 'appetizers':
            buildAppetizersCategory();
            break;
        case 'drinks':
            buildDrinksCategory();
            break;
        default:
            buildAppetizersCategory();
            break;
    }

    /* --- Attach all layers to the root group ------------------------ */
    explosionLayers.forEach(layer => {
        layer.mesh.position.y = layer.closedY;
        burgerGroup.add(layer.mesh);
    });

    scene.add(burgerGroup);
    createAmbientParticles(scene);

    return burgerGroup;
}

/* ==========================================================================
 * 1. BURGER & SANDWICH BUILDER
 * ========================================================================== */

function buildBurgerCategory() {
    /* 1.1 — Bottom brioche bun */
    const bottomBunGroup = new THREE.Group();
    const bBunGeo = new THREE.CylinderGeometry(2.18, 1.95, 0.65, 80, 24);
    const bPos = bBunGeo.attributes.position;
    for (let i = 0; i < bPos.count; i++) {
        const x = bPos.getX(i);
        const y = bPos.getY(i);
        const z = bPos.getZ(i);
        const r = Math.sqrt(x * x + z * z);
        const a = Math.atan2(z, x);
        const nY = (y + 0.325) / 0.65;
        const belly = Math.sin(nY * Math.PI) * 0.16;
        const noise = Math.sin(a * 5) * 0.03 + Math.cos(a * 8) * 0.02;
        if (r > 0.08) {
            bPos.setX(i, x * (1.0 + belly + noise));
            bPos.setZ(i, z * (1.0 + belly + noise));
        }
        if (nY < 0.03) bPos.setY(i, -0.325);
        if (nY > 0.95 && r < 1.95) bPos.setY(i, y - (1.0 - r / 1.95) * 0.05);
    }
    bBunGeo.computeVertexNormals();
    const bottomBunMesh = new THREE.Mesh(bBunGeo, materials.briocheMat);
    bottomBunMesh.castShadow = bottomBunMesh.receiveShadow = true;
    bottomBunGroup.add(bottomBunMesh);

    /* 1.2 — Smash patty */
    const pattyGeo = new THREE.CylinderGeometry(2.25, 2.22, 0.75, 64, 12);
    const pPos = pattyGeo.attributes.position;
    for (let i = 0; i < pPos.count; i++) {
        const x = pPos.getX(i);
        const y = pPos.getY(i);
        const z = pPos.getZ(i);
        const r = Math.sqrt(x * x + z * z);
        const a = Math.atan2(z, x);
        if (Math.abs(y) >= 0.355) {
            pPos.setY(i, y + Math.sin(x * 4.0) * Math.cos(z * 4.0) * 0.012);
        } else if (r > 1.85) {
            const edgeNoise = Math.sin(a * 9.0) * 0.08 + Math.cos(a * 19.0) * 0.04;
            const belly = Math.cos((y / 0.375) * Math.PI * 0.5) * 0.035;
            pPos.setX(i, x * (1.0 + edgeNoise + belly));
            pPos.setZ(i, z * (1.0 + edgeNoise + belly));
        }
    }
    pattyGeo.computeVertexNormals();
    const pattyMesh = new THREE.Mesh(pattyGeo, materials.pattyMat);
    pattyMesh.castShadow = pattyMesh.receiveShadow = true;

    /* 1.3 — Molten cheese drape */
    const cheeseGroup = new THREE.Group();
    const cheeseGeo = new THREE.BoxGeometry(3.6, 0.08, 3.6, 64, 4, 64);
    const cPos = cheeseGeo.attributes.position;
    for (let i = 0; i < cPos.count; i++) {
        const x = cPos.getX(i);
        const y = cPos.getY(i);
        const z = cPos.getZ(i);
        const d = Math.sqrt(x * x + z * z);
        if (d > 1.55) {
            const droop = Math.pow((d - 1.55) / 1.15, 2.2) * 0.72;
            cPos.setY(i, y - droop);
            cPos.setX(i, x * (1 - droop * 0.06));
            cPos.setZ(i, z * (1 - droop * 0.06));
        }
        cPos.setY(i, cPos.getY(i) + Math.sin(x * 4.0) * Math.cos(z * 4.0) * 0.015);
    }
    cheeseGeo.computeVertexNormals();
    const cheeseMesh = new THREE.Mesh(cheeseGeo, materials.cheeseMat);
    cheeseMesh.rotation.y = Math.PI * 0.25;
    cheeseMesh.castShadow = cheeseMesh.receiveShadow = true;
    cheeseGroup.add(cheeseMesh);

    /* 1.4 — Veggie layer (lettuce + tomato) */
    const vegGroup = new THREE.Group();
    const leafGeo = new THREE.RingGeometry(0.4, 2.7, 64, 16);
    leafGeo.rotateX(-Math.PI / 2);
    const lPos = leafGeo.attributes.position;
    for (let i = 0; i < lPos.count; i++) {
        const x = lPos.getX(i);
        const z = lPos.getZ(i);
        const r = Math.sqrt(x * x + z * z);
        const a = Math.atan2(z, x);
        const f = Math.pow(Math.max(0, (r - 0.4) / 2.3), 1.5);
        lPos.setY(i, (Math.sin(a * 8.0) * 0.16 + Math.cos(r * 8.5) * 0.09) * f);
        const ruff = 1.0 + Math.sin(a * 9.0) * 0.06 * f;
        lPos.setX(i, x * ruff);
        lPos.setZ(i, z * ruff);
    }
    leafGeo.computeVertexNormals();
    const leafMesh = new THREE.Mesh(leafGeo, materials.lettuceMat);
    leafMesh.castShadow = leafMesh.receiveShadow = true;
    vegGroup.add(leafMesh);

    const tomGeo = new THREE.CylinderGeometry(1.15, 1.15, 0.20, 32, 4);
    const tPos = tomGeo.attributes.position;
    for (let i = 0; i < tPos.count; i++) {
        const x = tPos.getX(i);
        const y = tPos.getY(i);
        const z = tPos.getZ(i);
        if (Math.abs(y) > 0.08) {
            const bev = 1.0 - Math.pow((Math.abs(y) - 0.08) / 0.02, 2) * 0.08;
            tPos.setX(i, x * bev);
            tPos.setZ(i, z * bev);
        }
    }
    tomGeo.computeVertexNormals();
    const t1 = new THREE.Mesh(tomGeo, materials.tomatoMat);
    t1.position.set(-0.68, 0.2, -0.22);
    t1.rotation.set(0.04, 0.25, -0.04);
    t1.castShadow = t1.receiveShadow = true;
    vegGroup.add(t1);

    /* 1.5 — Top brioche crown */
    const topBunGroup = new THREE.Group();
    const tBunGeo = new THREE.SphereGeometry(2.22, 96, 48);
    const tbPos = tBunGeo.attributes.position;
    for (let i = 0; i < tbPos.count; i++) {
        let x = tbPos.getX(i);
        let y = tbPos.getY(i);
        let z = tbPos.getZ(i);
        const a = Math.atan2(z, x);
        if (y >= 0) {
            y = y * 0.58;
            const nz = 1.0 + Math.sin(a * 3.0) * 0.02;
            x *= nz; z *= nz;
        } else {
            y = y * 0.04;
            x *= (1.0 + y * 0.15);
            z *= (1.0 + y * 0.15);
        }
        tbPos.setXYZ(i, x, y, z);
    }
    tBunGeo.computeVertexNormals();
    const topBunMesh = new THREE.Mesh(tBunGeo, materials.briocheMat);
    topBunMesh.castShadow = topBunMesh.receiveShadow = true;
    topBunGroup.add(topBunMesh);

    /* Add sesame seeds for realism */
    const seedGeo = new THREE.SphereGeometry(0.05, 10, 10);
    seedGeo.scale(0.65, 0.35, 1.4);
    for (let i = 0; i < 75; i++) {
        const seed = new THREE.Mesh(seedGeo, materials.sesameMat);
        const phi = 0.18 + Math.sqrt(Math.random()) * (Math.PI * 0.5 - 0.28);
        const theta = Math.random() * Math.PI * 2;
        const sx = 2.22 * Math.sin(phi) * Math.cos(theta);
        const sz = 2.22 * Math.sin(phi) * Math.sin(theta);
        const sy = 2.22 * Math.cos(phi) * 0.58;
        const normal = new THREE.Vector3(sx, sy / 0.3364, sz).normalize();
        seed.position.set(sx + normal.x * 0.015, sy + normal.y * 0.015, sz + normal.z * 0.015);
        seed.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal);
        seed.rotateY(Math.random() * Math.PI);
        seed.castShadow = true;
        topBunGroup.add(seed);
    }

    /* 1.6 — Assemble layers */
    explosionLayers.push(
        { mesh: bottomBunGroup, closedY: -0.90, openY: -4.2, text: 'بیس نان تست‌شده بریوش', side: 'right' },
        { mesh: pattyMesh,      closedY: -0.25, openY: -1.8, text: 'پتی گوشت اسمش‌شده ۱۰۰٪', side: 'left' },
        { mesh: cheeseGroup,    closedY:  0.12, openY:  0.4, text: 'پنیر گودا ذوب‌شده', side: 'right' },
        { mesh: vegGroup,       closedY:  0.30, openY:  2.4, text: 'کاهو پیچ و گوجه تازه', side: 'left' },
        { mesh: topBunGroup,    closedY:  0.52, openY:  5.0, text: 'نان بریوش کنجدی تنوری', side: 'right' }
    );
}

/* ==========================================================================
 * 2. PIZZA BUILDER
 * ========================================================================== */

function buildPizzaCategory() {
    /* 2.1 — Crust base + rim */
    const crustGroup = new THREE.Group();
    const baseGeo = new THREE.CylinderGeometry(3.5, 3.5, 0.15, 64);
    const baseMesh = new THREE.Mesh(baseGeo, localMats.pizzaCrust);

    const rimGeo = new THREE.TorusGeometry(3.4, 0.25, 32, 64);
    const rimPos = rimGeo.attributes.position;
    for (let i = 0; i < rimPos.count; i++) {
        const x = rimPos.getX(i);
        const y = rimPos.getY(i);
        const z = rimPos.getZ(i);
        const a = Math.atan2(z, x);
        const blister = Math.sin(a * 14) * 0.04 + Math.cos(a * 22) * 0.02;
        rimPos.setY(i, y + Math.abs(blister));
    }
    rimGeo.computeVertexNormals();
    const rimMesh = new THREE.Mesh(rimGeo, localMats.pizzaCrust);
    rimMesh.position.y = 0.05;

    baseMesh.castShadow = rimMesh.castShadow = true;
    crustGroup.add(baseMesh, rimMesh);

    /* 2.2 — Marinara sauce layer */
    const sauceGeo = new THREE.CylinderGeometry(3.2, 3.2, 0.18, 32);
    const sauceMesh = new THREE.Mesh(sauceGeo, localMats.pizzaSauce);
    sauceMesh.receiveShadow = true;

    /* 2.3 — Mozzarella with blobs */
    const cheeseGeo = new THREE.CylinderGeometry(3.1, 3.1, 0.22, 64, 8);
    const cPos = cheeseGeo.attributes.position;
    for (let i = 0; i < cPos.count; i++) {
        const x = cPos.getX(i);
        const y = cPos.getY(i);
        const z = cPos.getZ(i);
        if (y > 0) {
            const blobs = Math.sin(x * 5) * Math.cos(z * 5) * 0.04;
            cPos.setY(i, y + blobs);
        }
    }
    cheeseGeo.computeVertexNormals();
    const cheeseMesh = new THREE.Mesh(cheeseGeo, localMats.mozzarella);
    cheeseMesh.castShadow = cheeseMesh.receiveShadow = true;

    /* 2.4 — Pepperoni slices */
    const pepGroup = new THREE.Group();
    const pepGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.04, 32);
    for (let i = 0; i < 18; i++) {
        const pep = new THREE.Mesh(pepGeo, localMats.pepperoni);
        const rad = Math.sqrt(Math.random()) * 2.8;
        const ang = Math.random() * Math.PI * 2;
        pep.position.set(rad * Math.cos(ang), 0, rad * Math.sin(ang));
        pep.rotation.set(
            (Math.random() - 0.5) * 0.2,
            Math.random() * Math.PI,
            (Math.random() - 0.5) * 0.2
        );
        pep.castShadow = true;
        pepGroup.add(pep);
    }

    /* 2.5 — Fresh basil leaves */
    const basilGroup = new THREE.Group();
    const basilGeo = new THREE.PlaneGeometry(0.4, 0.6, 8, 8);
    const bPos = basilGeo.attributes.position;
    for (let i = 0; i < bPos.count; i++) {
        const y = bPos.getY(i);
        bPos.setZ(i, Math.sin(y * Math.PI) * 0.1);
    }
    basilGeo.computeVertexNormals();
    for (let i = 0; i < 12; i++) {
        const leaf = new THREE.Mesh(basilGeo, localMats.basil);
        const rad = Math.sqrt(Math.random()) * 2.9;
        const ang = Math.random() * Math.PI * 2;
        leaf.position.set(rad * Math.cos(ang), 0, rad * Math.sin(ang));
        leaf.rotation.set(
            -Math.PI / 2 + (Math.random() - 0.5) * 0.4,
            0,
            Math.random() * Math.PI
        );
        leaf.castShadow = true;
        basilGroup.add(leaf);
    }

    explosionLayers.push(
        { mesh: crustGroup, closedY: -0.60, openY: -4.0, text: 'خمیر دست‌ساز ناپلی', side: 'right' },
        { mesh: sauceMesh,  closedY: -0.58, openY: -1.5, text: 'سس مارینارای خانگی', side: 'left' },
        { mesh: cheeseMesh, closedY: -0.55, openY:  0.8, text: 'پنیر موزارلای کش‌دار', side: 'right' },
        { mesh: pepGroup,   closedY: -0.42, openY:  3.2, text: 'ورقه‌های پپرونی تند', side: 'left' },
        { mesh: basilGroup, closedY: -0.38, openY:  5.2, text: 'برگ ریحان تازه و ادویه', side: 'right' }
    );
}

/* ==========================================================================
 * 3. KEBAB BUILDER
 * ========================================================================== */

function buildKebabCategory() {
    /* 3.1 — Porcelain platter */
    const platterGeo = new THREE.CylinderGeometry(3.6, 3.2, 0.15, 64);
    const platterMesh = new THREE.Mesh(platterGeo, localMats.porcelain);
    platterMesh.scale.set(1, 1, 0.65);
    platterMesh.castShadow = platterMesh.receiveShadow = true;

    /* 3.2 — Saffron rice bed */
    const riceGroup = new THREE.Group();
    const riceGeo = new THREE.SphereGeometry(2.0, 64, 32, 0, Math.PI * 2, 0, Math.PI / 2);
    const rPos = riceGeo.attributes.position;
    for (let i = 0; i < rPos.count; i++) {
        const x = rPos.getX(i);
        const y = rPos.getY(i);
        const z = rPos.getZ(i);
        const noise = Math.sin(x * 12) * Math.cos(z * 12) * 0.04;
        rPos.setXYZ(i, x * (1 + noise), y * (1 + noise), z * (1 + noise));
    }
    riceGeo.computeVertexNormals();

    const whiteRice = new THREE.Mesh(riceGeo, localMats.rice);
    whiteRice.scale.set(1, 0.35, 0.7);
    whiteRice.position.set(-0.8, 0.05, 0);
    whiteRice.castShadow = whiteRice.receiveShadow = true;

    const saffronRice = new THREE.Mesh(riceGeo, localMats.riceSaffron);
    saffronRice.scale.set(0.6, 0.4, 0.4);
    saffronRice.position.set(-0.8, 0.08, 0);
    saffronRice.castShadow = true;

    riceGroup.add(whiteRice, saffronRice);

    /* 3.3 — Koobideh skewers */
    const kebabGroup = new THREE.Group();
    const kebabGeo = new THREE.CylinderGeometry(0.22, 0.22, 4.5, 32, 32);
    kebabGeo.rotateZ(Math.PI / 2);
    const kPos = kebabGeo.attributes.position;
    for (let i = 0; i < kPos.count; i++) {
        const x = kPos.getX(i);
        const y = kPos.getY(i);
        const z = kPos.getZ(i);
        const indent = Math.sin(x * 6.0) * 0.06;
        if (Math.abs(y) > 0.05) {
            kPos.setY(i, y - Math.sign(y) * Math.abs(indent));
        }
    }
    kebabGeo.computeVertexNormals();

    const skewer1 = new THREE.Mesh(kebabGeo, localMats.kebabMeat);
    skewer1.position.set(0.5, 0.2, 0.4);
    const skewer2 = new THREE.Mesh(kebabGeo, localMats.kebabMeat);
    skewer2.position.set(0.5, 0.2, -0.4);
    skewer1.castShadow = skewer2.castShadow = true;
    kebabGroup.add(skewer1, skewer2);

    /* 3.4 — Fire-roasted tomatoes */
    const tomGroup = new THREE.Group();
    const tomGeo = new THREE.SphereGeometry(0.4, 32, 32);
    const tomPos = tomGeo.attributes.position;
    for (let i = 0; i < tomPos.count; i++) {
        const pX = tomPos.getX(i);
        const pY = tomPos.getY(i);
        const pZ = tomPos.getZ(i);
        const n = Math.sin(pX * 10) * Math.cos(pZ * 10) * 0.03;
        tomPos.setXYZ(i, pX * (1 + n), pY * (1 + n) * 0.8, pZ * (1 + n));
    }
    tomGeo.computeVertexNormals();
    const t1 = new THREE.Mesh(tomGeo, localMats.tomatoRoast);
    t1.position.set(2.4, 0.2, 0.6);
    const t2 = new THREE.Mesh(tomGeo, localMats.tomatoRoast);
    t2.position.set(2.6, 0.2, -0.5);
    t1.castShadow = t2.castShadow = true;
    tomGroup.add(t1, t2);

    /* 3.5 — Butter slab */
    const butterGeo = new THREE.BoxGeometry(0.3, 0.15, 0.3);
    const butterMesh = new THREE.Mesh(butterGeo, localMats.butter);
    butterMesh.position.set(-0.8, 0.75, 0);
    butterMesh.rotation.y = Math.PI / 4;
    butterMesh.castShadow = true;

    explosionLayers.push(
        { mesh: platterMesh, closedY: -0.80, openY: -4.5, text: 'دیس سرو چینی دست‌ساز', side: 'right' },
        { mesh: riceGroup,   closedY: -0.70, openY: -1.5, text: 'چلو زعفرانی دم‌کشیده', side: 'left' },
        { mesh: kebabGroup,  closedY: -0.55, openY:  1.0, text: 'دو سیخ کباب کوبیده گوشت', side: 'right' },
        { mesh: tomGroup,    closedY: -0.55, openY:  3.5, text: 'گوجه کبابی ذغالی', side: 'left' },
        { mesh: butterMesh,  closedY: -0.45, openY:  5.5, text: 'کره محلی و سماق اعلا', side: 'right' }
    );
}

/* ==========================================================================
 * 4. ASH / TRADITIONAL BUILDER
 * ========================================================================== */

function buildAshCategory() {
    /* 4.1 — Lathe ceramic bowl */
    const points = [
        new THREE.Vector2(0, 0),
        new THREE.Vector2(1.8, 0),
        new THREE.Vector2(2.4, 0.8),
        new THREE.Vector2(2.6, 2.0)
    ];
    const bowlGeo = new THREE.LatheGeometry(points, 64);
    const bowlMesh = new THREE.Mesh(bowlGeo, localMats.ceramicBlue);
    bowlMesh.castShadow = bowlMesh.receiveShadow = true;

    /* 4.2 — Herbal broth */
    const brothGeo = new THREE.CylinderGeometry(2.45, 2.45, 0.1, 64);
    const bPos = brothGeo.attributes.position;
    for (let i = 0; i < bPos.count; i++) {
        const x = bPos.getX(i);
        const y = bPos.getY(i);
        const z = bPos.getZ(i);
        if (y > 0) bPos.setY(i, y + Math.sin(x * 6) * Math.cos(z * 6) * 0.04);
    }
    brothGeo.computeVertexNormals();
    const brothMesh = new THREE.Mesh(brothGeo, localMats.ashBroth);
    brothMesh.receiveShadow = true;

    /* 4.3 — Kashk spiral */
    class SpiralCurve extends THREE.Curve {
        getPoint(t, target = new THREE.Vector3()) {
            const a = t * Math.PI * 6;
            const r = t * 1.8;
            return target.set(Math.cos(a) * r, 0, Math.sin(a) * r);
        }
    }
    const kashkGeo = new THREE.TubeGeometry(new SpiralCurve(), 128, 0.1, 16, false);
    const kashkMesh = new THREE.Mesh(kashkGeo, localMats.kashk);
    kashkMesh.castShadow = true;

    /* 4.4 — Fried mint & shallots scatter */
    const garnishGroup = new THREE.Group();
    const mintGeo = new THREE.BoxGeometry(0.1, 0.05, 0.1);
    for (let i = 0; i < 80; i++) {
        const m = new THREE.Mesh(mintGeo, localMats.mintDagh);
        const rad = Math.sqrt(Math.random()) * 2.2;
        const ang = Math.random() * Math.PI * 2;
        m.position.set(rad * Math.cos(ang), 0, rad * Math.sin(ang));
        m.rotation.set(
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            Math.random() * Math.PI
        );
        m.castShadow = true;
        garnishGroup.add(m);
    }

    explosionLayers.push(
        { mesh: bowlMesh,     closedY: -1.50, openY: -4.5, text: 'کاسه سفالی لعاب فیروزه‌ای', side: 'right' },
        { mesh: brothMesh,    closedY:  0.20, openY: -1.0, text: 'آش رشته غلیظ با سبزیجات', side: 'left' },
        { mesh: kashkMesh,    closedY:  0.25, openY:  2.0, text: 'کشک زعفرانی سنتی', side: 'right' },
        { mesh: garnishGroup, closedY:  0.28, openY:  4.5, text: 'نعناداغ و پیازداغ برشته', side: 'left' }
    );
}

/* ==========================================================================
 * 5. APPETIZERS BUILDER
 * ========================================================================== */

function buildAppetizersCategory() {
    /* 5.1 — Parchment paper with bent edges */
    const paperGeo = new THREE.PlaneGeometry(5, 5, 32, 32);
    const pPos = paperGeo.attributes.position;
    for (let i = 0; i < pPos.count; i++) {
        const x = pPos.getX(i);
        const y = pPos.getY(i);
        const d = Math.sqrt(x * x + y * y);
        pPos.setZ(i, Math.pow(d * 0.4, 2));
    }
    paperGeo.computeVertexNormals();
    const paperMesh = new THREE.Mesh(paperGeo, localMats.parchment);
    paperMesh.rotation.x = -Math.PI / 2;
    paperMesh.castShadow = paperMesh.receiveShadow = true;

    /* 5.2 — Stacked fries */
    const friesGroup = new THREE.Group();
    const fryGeo = new THREE.BoxGeometry(0.2, 0.2, 2.2);
    for (let i = 0; i < 50; i++) {
        const fry = new THREE.Mesh(fryGeo, localMats.fry);
        fry.position.set(
            (Math.random() - 0.5) * 2.5,
            Math.random() * 1.0,
            (Math.random() - 0.5) * 2.5
        );
        fry.rotation.set(
            (Math.random() - 0.5) * 0.5,
            Math.random() * Math.PI,
            (Math.random() - 0.5) * 0.5
        );
        fry.castShadow = fry.receiveShadow = true;
        friesGroup.add(fry);
    }

    /* 5.3 — Molten cheddar drizzle (torus knot) */
    const drizzleGeo = new THREE.TorusKnotGeometry(1.2, 0.12, 128, 16, 3, 5);
    const drizzleMesh = new THREE.Mesh(drizzleGeo, localMats.fondue);
    drizzleMesh.rotation.x = Math.PI / 2;
    drizzleMesh.scale.set(1, 1, 0.3);
    drizzleMesh.castShadow = true;

    /* 5.4 — Bacon bits scatter */
    const baconGroup = new THREE.Group();
    const baconGeo = new THREE.BoxGeometry(0.15, 0.15, 0.15);
    for (let i = 0; i < 40; i++) {
        const b = new THREE.Mesh(baconGeo, localMats.baconBit);
        b.position.set(
            (Math.random() - 0.5) * 2.5,
            0,
            (Math.random() - 0.5) * 2.5
        );
        b.rotation.set(
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            Math.random() * Math.PI
        );
        b.castShadow = true;
        baconGroup.add(b);
    }

    explosionLayers.push(
        { mesh: paperMesh,   closedY: -1.0, openY: -4.0, text: 'ظرف سرو مخصوص', side: 'right' },
        { mesh: friesGroup,  closedY: -0.5, openY: -1.0, text: 'سیب‌زمینی ادویه‌دار بلژیکی', side: 'left' },
        { mesh: drizzleMesh, closedY:  0.8, openY:  2.0, text: 'دیپ چدار گرم و غلیظ', side: 'right' },
        { mesh: baconGroup,  closedY:  1.1, openY:  4.5, text: 'بیکن سوخاری و پیازچه', side: 'left' }
    );
}

/* ==========================================================================
 * 6. DRINKS BUILDER
 * ========================================================================== */

function buildDrinksCategory() {
    /* 6.1 — Tall glass tumbler */
    const glassGroup = new THREE.Group();
    const glassGeo = new THREE.CylinderGeometry(1.1, 0.95, 4.5, 64, 4, true);
    const glassMesh = new THREE.Mesh(glassGeo, localMats.glass);
    glassMesh.castShadow = true;
    glassGroup.add(glassMesh);

    /* 6.2 — Ice cubes */
    const iceGroup = new THREE.Group();
    const iceGeo = new THREE.BoxGeometry(0.6, 0.6, 0.6);
    for (let i = 0; i < 6; i++) {
        const ice = new THREE.Mesh(iceGeo, localMats.iceCube);
        const a = Math.random() * Math.PI * 2;
        const r = Math.random() * 0.5;
        ice.position.set(
            Math.cos(a) * r,
            -1.5 + Math.random() * 3.0,
            Math.sin(a) * r
        );
        ice.rotation.set(
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            Math.random() * Math.PI
        );
        ice.castShadow = true;
        iceGroup.add(ice);
    }

    /* 6.3 — Liquid body */
    const liquidGeo = new THREE.CylinderGeometry(1.0, 0.9, 3.8, 64);
    const liquidMesh = new THREE.Mesh(liquidGeo, localMats.colaLiquid);
    liquidMesh.position.y = -0.3;
    liquidMesh.castShadow = true;

    /* 6.4 — Straw */
    const strawGeo = new THREE.CylinderGeometry(0.08, 0.08, 5.5, 16);
    const strawMesh = new THREE.Mesh(strawGeo, localMats.straw);
    strawMesh.position.set(0.4, 1.0, 0.3);
    strawMesh.rotation.set(0.15, 0, 0.2);

    /* 6.5 — Mint garnish */
    const mintGroup = new THREE.Group();
    const leafGeo = new THREE.SphereGeometry(0.18, 16, 16);
    leafGeo.scale(1, 0.3, 1.6);
    for (let i = 0; i < 3; i++) {
        const leaf = new THREE.Mesh(leafGeo, localMats.mintLiquid);
        leaf.position.set(-0.3 + i * 0.3, 2.3, 0.2);
        leaf.rotation.set(Math.PI / 3, i * 0.4, 0);
        leaf.castShadow = true;
        mintGroup.add(leaf);
    }

    explosionLayers.push(
        { mesh: glassGroup,  closedY:  0.00, openY: -4.5, text: 'لیوان شیشه‌ای دست‌ساز', side: 'right' },
        { mesh: liquidMesh,  closedY: -0.30, openY: -1.5, text: 'نوشیدنی گازدار خنک', side: 'left' },
        { mesh: iceGroup,    closedY: -0.30, openY:  1.5, text: 'یخ خرد‌شده و تازه', side: 'right' },
        { mesh: strawMesh,   closedY: -0.30, openY:  3.5, text: 'نی و تزئینات', side: 'left' },
        { mesh: mintGroup,   closedY: -0.30, openY:  5.5, text: 'نعنا و لیمو تازه', side: 'right' }
    );
}

/* ==========================================================================
 * ENVIRONMENT PARTICLES
 * ========================================================================== */

function createAmbientParticles(scene) {
    const count = 400;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    const speeds = new Float32Array(count);

    for (let i = 0; i < count * 3; i += 3) {
        pos[i] = (Math.random() - 0.5) * 16;
        pos[i + 1] = (Math.random() - 0.5) * 16;
        pos[i + 2] = (Math.random() - 0.5) * 16;
        speeds[i / 3] = 0.2 + Math.random() * 0.7;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.userData = { speeds };

    particlesMesh = new THREE.Points(geo, materials.frostParticleMat);
    scene.add(particlesMesh);
    return particlesMesh;
}

/**
 * Advance particle simulation by delta seconds.
 * @param {number} delta
 */
export function updateParticles(delta) {
    if (!particlesMesh) return;
    const pos = particlesMesh.geometry.attributes.position;
    const speeds = particlesMesh.geometry.userData.speeds;
    for (let i = 0; i < pos.count; i++) {
        let y = pos.getY(i) - speeds[i] * delta * 0.45;
        if (y < -8) y = 8;
        pos.setY(i, y);
    }
    pos.needsUpdate = true;
    particlesMesh.rotation.y += delta * 0.035;
}

/* ==========================================================================
 * CONVENIENCE EXPORTS
 * ========================================================================== */

export const buildAlpinePretzel = buildBurgerCategory;
export const buildDarkInferno = buildBurgerCategory;
export const buildGourmetBurger = buildBurgerCategory;