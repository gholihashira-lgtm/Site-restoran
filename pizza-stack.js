import * as THREE from 'three';

/* ==========================================================================
 * PROCEDURAL IN-MEMORY CANVAS TEXTURE GENERATORS
 * ========================================================================== */

function createCanvas(size) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    return canvas;
}

function createWoodPeelTexture() {
    const s = 1024;
    const c = createCanvas(s);
    const ctx = c.getContext('2d');
    
    ctx.fillStyle = '#6b4324';
    ctx.fillRect(0, 0, s, s);
    
    // Wood grain rings
    ctx.lineWidth = 2;
    for (let i = 0; i < 200; i++) {
        ctx.beginPath();
        const r = i * 4 + Math.random() * 2;
        ctx.arc(s / 2, s / 2, r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(50, 25, 10, ${Math.random() * 0.15 + 0.05})`;
        ctx.stroke();
    }
    
    // Burn marks
    for (let i = 0; i < 40; i++) {
        ctx.beginPath();
        const r = 300 + Math.random() * 200;
        const a = Math.random() * Math.PI * 2;
        ctx.arc(s/2 + Math.cos(a)*r, s/2 + Math.sin(a)*r, 20 + Math.random()*50, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(20, 10, 5, 0.4)';
        ctx.fill();
    }
    
    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    return tex;
}

function createNeapolitanCrustTexture() {
    const s = 1024;
    const c = createCanvas(s);
    const ctx = c.getContext('2d');
    
    // Golden amber base dough
    const grad = ctx.createRadialGradient(s/2, s/2, s*0.2, s/2, s/2, s*0.5);
    grad.addColorStop(0, '#e6b771');
    grad.addColorStop(0.7, '#d49642');
    grad.addColorStop(1, '#a66721');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, s, s);
    
    // Leopard-spotting char blisters
    for (let i = 0; i < 400; i++) {
        const x = Math.random() * s;
        const y = Math.random() * s;
        const r = 2 + Math.pow(Math.random(), 3) * 18;
        const op = 0.4 + Math.random() * 0.6;
        
        const spotGrad = ctx.createRadialGradient(x, y, 0, x, y, r);
        spotGrad.addColorStop(0, `rgba(20, 8, 4, ${op})`);
        spotGrad.addColorStop(0.5, `rgba(74, 34, 13, ${op * 0.8})`);
        spotGrad.addColorStop(1, 'rgba(166, 103, 33, 0)');
        
        ctx.fillStyle = spotGrad;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
    }
    
    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    return tex;
}

function createMarinaraTexture() {
    const s = 512;
    const c = createCanvas(s);
    const ctx = c.getContext('2d');
    
    // Deep San Marzano red
    ctx.fillStyle = '#8f1a0d';
    ctx.fillRect(0, 0, s, s);
    
    // Crushed tomatoes variation
    for (let i = 0; i < 200; i++) {
        ctx.fillStyle = Math.random() > 0.5 ? 'rgba(163, 26, 11, 0.6)' : 'rgba(102, 13, 5, 0.5)';
        ctx.beginPath();
        ctx.arc(Math.random() * s, Math.random() * s, 10 + Math.random() * 25, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Oregano & Black Pepper specks
    for (let i = 0; i < 800; i++) {
        const isHerb = Math.random() > 0.3;
        ctx.fillStyle = isHerb ? '#2b3b18' : '#141110';
        ctx.beginPath();
        ctx.arc(Math.random() * s, Math.random() * s, 0.5 + Math.random() * 1.5, 0, Math.PI * 2);
        ctx.fill();
    }
    
    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    return tex;
}

function createCheeseTexture() {
    const s = 512;
    const c = createCanvas(s);
    const ctx = c.getContext('2d');
    
    // Ivory / pale yellow base
    ctx.fillStyle = '#fffae6';
    ctx.fillRect(0, 0, s, s);
    
    // Melted golden-brown blister spots
    for (let i = 0; i < 60; i++) {
        const x = Math.random() * s;
        const y = Math.random() * s;
        const r = 10 + Math.random() * 35;
        
        const bGrad = ctx.createRadialGradient(x, y, 0, x, y, r);
        bGrad.addColorStop(0, 'rgba(191, 123, 27, 0.7)');
        bGrad.addColorStop(0.5, 'rgba(235, 172, 70, 0.4)');
        bGrad.addColorStop(1, 'rgba(255, 250, 230, 0)');
        
        ctx.fillStyle = bGrad;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
    }
    
    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    return tex;
}

function createPepperoniTexture() {
    const s = 256;
    const c = createCanvas(s);
    const ctx = c.getContext('2d');
    
    // Dark meat base
    const grad = ctx.createRadialGradient(s/2, s/2, 0, s/2, s/2, s/2);
    grad.addColorStop(0, '#ba301c');
    grad.addColorStop(0.8, '#851a0d');
    grad.addColorStop(0.9, '#4a0d05'); // Charred cup edge
    grad.addColorStop(1, '#2b0702');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, s, s);
    
    // Fat marbling / grease spots
    for (let i = 0; i < 150; i++) {
        ctx.fillStyle = Math.random() > 0.5 ? 'rgba(235, 114, 52, 0.4)' : 'rgba(255, 164, 99, 0.3)';
        ctx.beginPath();
        ctx.arc(Math.random() * s, Math.random() * s, 1 + Math.random() * 5, 0, Math.PI * 2);
        ctx.fill();
    }
    
    const tex = new THREE.CanvasTexture(c);
    return tex;
}

function createGenericBumpMap() {
    const s = 512;
    const c = createCanvas(s);
    const ctx = c.getContext('2d');
    const imgData = ctx.createImageData(s, s);
    for (let i = 0; i < imgData.data.length; i += 4) {
        const v = Math.floor(Math.random() * 255);
        imgData.data[i] = imgData.data[i+1] = imgData.data[i+2] = v;
        imgData.data[i+3] = 255;
    }
    ctx.putImageData(imgData, 0, 0);
    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(3, 3);
    return tex;
}

// Generate Textures
const texWood = createWoodPeelTexture();
const texCrust = createNeapolitanCrustTexture();
const texSauce = createMarinaraTexture();
const texCheese = createCheeseTexture();
const texPep = createPepperoniTexture();
const texBump = createGenericBumpMap();

/* ==========================================================================
 * HIGH-END PBR MATERIALS
 * ========================================================================== */

const mats = {
    peel: new THREE.MeshStandardMaterial({
        map: texWood, roughness: 0.85, metalness: 0.05, bumpMap: texBump, bumpScale: 0.02
    }),
    crust: new THREE.MeshPhysicalMaterial({
        map: texCrust, roughness: 0.7, clearcoat: 0.1, bumpMap: texBump, bumpScale: 0.03
    }),
    sauce: new THREE.MeshPhysicalMaterial({
        map: texSauce, roughness: 0.15, clearcoat: 0.9, clearcoatRoughness: 0.05, bumpMap: texBump, bumpScale: 0.015
    }),
    cheese: new THREE.MeshPhysicalMaterial({
        map: texCheese, roughness: 0.22, clearcoat: 0.75, clearcoatRoughness: 0.1,
        transmission: 0.18, thickness: 0.5, bumpMap: texBump, bumpScale: 0.02
    }),
    pepperoni: new THREE.MeshPhysicalMaterial({
        map: texPep, roughness: 0.2, clearcoat: 0.85, clearcoatRoughness: 0.15, bumpMap: texBump, bumpScale: 0.04
    }),
    jalapeno: new THREE.MeshPhysicalMaterial({
        color: 0x3e6b21, roughness: 0.3, clearcoat: 0.6, transmission: 0.4, thickness: 0.2
    }),
    olive: new THREE.MeshPhysicalMaterial({
        color: 0x141013, roughness: 0.15, clearcoat: 0.9
    }),
    basil: new THREE.MeshPhysicalMaterial({
        color: 0x2e6b18, roughness: 0.3, clearcoat: 0.4, transmission: 0.35, thickness: 0.1, side: THREE.DoubleSide
    })
};

/* ==========================================================================
 * PIZZA 3D BUILDER
 * ========================================================================== */

export const pizzaGroup = new THREE.Group();
export const explosionLayers = [];
let ambientParticles;

export function buildPizza3D(scene) {
    explosionLayers.length = 0;
    while (pizzaGroup.children.length > 0) {
        pizzaGroup.remove(pizzaGroup.children[0]);
    }

    // 1. Fire-Baked Pizza Peel (Wooden Board)
    const peelGroup = new THREE.Group();
    const boardGeo = new THREE.CylinderGeometry(3.8, 3.8, 0.15, 64);
    const boardMesh = new THREE.Mesh(boardGeo, mats.peel);
    const handleGeo = new THREE.BoxGeometry(1.2, 0.12, 3.0);
    const handleMesh = new THREE.Mesh(handleGeo, mats.peel);
    handleMesh.position.set(0, 0, 4.5);
    boardMesh.castShadow = boardMesh.receiveShadow = true;
    handleMesh.castShadow = handleMesh.receiveShadow = true;
    peelGroup.add(boardMesh, handleMesh);

    // 2. Neapolitan Sourdough Crust (Authentic Displaced Cornicione)
    const crustGeo = new THREE.CylinderGeometry(3.5, 3.4, 0.15, 128, 32);
    const cPos = crustGeo.attributes.position;
    for (let i = 0; i < cPos.count; i++) {
        let x = cPos.getX(i), y = cPos.getY(i), z = cPos.getZ(i);
        const r = Math.sqrt(x * x + z * z);
        const a = Math.atan2(z, x);
        
        // Push outer edge UP to form the authentic Neapolitan rim
        if (r > 2.6 && y > 0) {
            const puffProgress = (r - 2.6) / 0.9; // 0 to 1
            let puff = Math.sin(puffProgress * Math.PI * 0.5) * 0.45;
            
            // Add organic blister noise
            const blister = (Math.sin(a * 15) * Math.cos(r * 20)) * 0.08 + (Math.random() - 0.5) * 0.04;
            puff += blister;
            
            // Taper the extreme outer edge back down smoothly
            if (r > 3.3) {
                puff -= (r - 3.3) * 1.8;
            }
            
            y += Math.max(0, puff);
        }
        cPos.setY(i, y);
    }
    crustGeo.computeVertexNormals();
    const crustMesh = new THREE.Mesh(crustGeo, mats.crust);
    crustMesh.castShadow = crustMesh.receiveShadow = true;

    // 3. San Marzano Marinara Sauce
    const sauceGeo = new THREE.CylinderGeometry(2.95, 2.95, 0.12, 64, 8);
    const sPos = sauceGeo.attributes.position;
    for (let i = 0; i < sPos.count; i++) {
        let x = sPos.getX(i), y = sPos.getY(i), z = sPos.getZ(i);
        if (y > 0) {
            y += (Math.sin(x * 6) * Math.cos(z * 6)) * 0.02; // Wavy sauce surface
            sPos.setY(i, y);
        }
    }
    sauceGeo.computeVertexNormals();
    const sauceMesh = new THREE.Mesh(sauceGeo, mats.sauce);
    sauceMesh.receiveShadow = true;

    // 4. Molten Fior di Latte Cheese Blanket
    const cheeseGeo = new THREE.CylinderGeometry(2.8, 2.8, 0.16, 64, 16);
    const chPos = cheeseGeo.attributes.position;
    for (let i = 0; i < chPos.count; i++) {
        let x = chPos.getX(i), y = chPos.getY(i), z = chPos.getZ(i);
        const r = Math.sqrt(x * x + z * z);
        if (y > 0) {
            let blob = (Math.sin(x * 5) * Math.cos(z * 5)) * 0.04;
            // Taper cheese thickness near the edges
            if (r > 2.4) blob -= (r - 2.4) * 0.1;
            chPos.setY(i, y + blob);
        }
    }
    cheeseGeo.computeVertexNormals();
    const cheeseMesh = new THREE.Mesh(cheeseGeo, mats.cheese);
    cheeseMesh.castShadow = cheeseMesh.receiveShadow = true;

    // 5. Crispy "Cup-and-Char" Pepperoni
    const pepGroup = new THREE.Group();
    // Start with a flat cylinder, heavily subdivided radially
    const pepGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.02, 32, 8);
    const ppPos = pepGeo.attributes.position;
    for (let j = 0; j < ppPos.count; j++) {
        let px = ppPos.getX(j), py = ppPos.getY(j), pz = ppPos.getZ(j);
        let pr = Math.sqrt(px * px + pz * pz);
        // Turn the flat slice into a crispy cup
        if (pr > 0.12 && py > 0) {
            let cupLift = Math.pow((pr - 0.12) / 0.23, 2) * 0.12;
            let crispEdge = (Math.random() - 0.5) * 0.02;
            ppPos.setY(j, py + cupLift + crispEdge);
        }
    }
    pepGeo.computeVertexNormals();
    
    // Distribute 18 pepperonis organically
    for (let i = 0; i < 18; i++) {
        const pep = new THREE.Mesh(pepGeo, mats.pepperoni);
        const rad = Math.sqrt(Math.random()) * 2.6;
        const ang = Math.random() * Math.PI * 2;
        pep.position.set(rad * Math.cos(ang), 0.0, rad * Math.sin(ang));
        // Rotate them randomly to nestle into the cheese
        pep.rotation.set((Math.random() - 0.5) * 0.3, Math.random() * Math.PI, (Math.random() - 0.5) * 0.3);
        pep.castShadow = true;
        pepGroup.add(pep);
    }

    // 6. Jalapeños & Kalamata Olives
    const vegGroup = new THREE.Group();
    // Olive Rings (Squashed Torus)
    const oliveGeo = new THREE.TorusGeometry(0.12, 0.05, 12, 24);
    for (let i = 0; i < 14; i++) {
        const olive = new THREE.Mesh(oliveGeo, mats.olive);
        const rad = Math.sqrt(Math.random()) * 2.7;
        const ang = Math.random() * Math.PI * 2;
        olive.position.set(rad * Math.cos(ang), 0, rad * Math.sin(ang));
        olive.rotation.set(Math.PI / 2 + (Math.random() - 0.5) * 0.5, 0, Math.random() * Math.PI);
        olive.scale.set(1.0, 0.8 + Math.random() * 0.3, 1.0); // Irregular organic slice
        olive.castShadow = true;
        vegGroup.add(olive);
    }
    // Jalapeño Rings (Flattened Tube)
    const jalGeo = new THREE.TorusGeometry(0.18, 0.07, 12, 24);
    for (let i = 0; i < 12; i++) {
        const jal = new THREE.Mesh(jalGeo, mats.jalapeno);
        const rad = Math.sqrt(Math.random()) * 2.6;
        const ang = Math.random() * Math.PI * 2;
        jal.position.set(rad * Math.cos(ang), 0.02, rad * Math.sin(ang));
        jal.rotation.set(Math.PI / 2 + (Math.random() - 0.5) * 0.3, 0, Math.random() * Math.PI);
        jal.scale.set(1.0, 1.0, 0.4); // Thin slice
        jal.castShadow = true;
        vegGroup.add(jal);
    }

    // 7. Fresh Genovese Basil
    const basilGroup = new THREE.Group();
    const basilGeo = new THREE.PlaneGeometry(0.4, 0.8, 12, 12);
    const bPos = basilGeo.attributes.position;
    for (let i = 0; i < bPos.count; i++) {
        let bx = bPos.getX(i), by = bPos.getY(i);
        // Fold leaf in the center X and curve down along Y
        let bz = Math.abs(bx) * 0.15 + Math.sin(by * Math.PI) * 0.15;
        bPos.setZ(i, -bz);
    }
    basilGeo.computeVertexNormals();
    for (let i = 0; i < 10; i++) {
        const basil = new THREE.Mesh(basilGeo, mats.basil);
        const rad = Math.sqrt(Math.random()) * 2.4;
        const ang = Math.random() * Math.PI * 2;
        basil.position.set(rad * Math.cos(ang), 0.05, rad * Math.sin(ang));
        basil.rotation.set(-Math.PI / 2 + (Math.random() - 0.5) * 0.4, 0, Math.random() * Math.PI);
        basil.castShadow = true;
        basilGroup.add(basil);
    }

    // 8. Floating Seasoning Particles (Chili Flakes & Parmesan)
    const pCount = 300;
    const pGeo = new THREE.BufferGeometry();
    const pPosArr = new Float32Array(pCount * 3);
    const pColArr = new Float32Array(pCount * 3);
    
    for (let i = 0; i < pCount; i++) {
        const rad = Math.sqrt(Math.random()) * 2.8;
        const ang = Math.random() * Math.PI * 2;
        pPosArr[i * 3] = rad * Math.cos(ang);
        pPosArr[i * 3 + 1] = (Math.random() - 0.5) * 0.5; // Rest flat when closed
        pPosArr[i * 3 + 2] = rad * Math.sin(ang);
        
        // 60% Parmesan (White/Yellowish), 40% Chili Flake (Red)
        const isChili = Math.random() > 0.6;
        const c = new THREE.Color(isChili ? 0xcc2211 : 0xfffae6);
        pColArr[i * 3] = c.r;
        pColArr[i * 3 + 1] = c.g;
        pColArr[i * 3 + 2] = c.b;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPosArr, 3));
    pGeo.setAttribute('color', new THREE.BufferAttribute(pColArr, 3));
    const pMat = new THREE.PointsMaterial({ size: 0.08, vertexColors: true, transparent: true, opacity: 0.9 });
    const seasoningPoints = new THREE.Points(pGeo, pMat);

    // Assembly & Tightly Closed Coordinates Matrix
    explosionLayers.push(
        { mesh: peelGroup,       closedY: -0.60, openY: -4.0, text: 'تخته سرو چوبی دست‌ساز و سنگ تنور', side: 'right' },
        { mesh: crustMesh,       closedY: -0.45, openY: -2.0, text: 'خمیر ترش دست‌ساز ناپلی با لبه‌های برشته', side: 'left' },
        { mesh: sauceMesh,       closedY: -0.38, openY: -0.5, text: 'سس گوجه سن‌مارزانو با سیر و اورگانو', side: 'right' },
        { mesh: cheeseMesh,      closedY: -0.30, openY:  1.0, text: 'پنیر موزارلا بوفالو و فیور دی لاته کش‌دار', side: 'left' },
        { mesh: pepGroup,        closedY: -0.15, openY:  2.8, text: 'ورقه‌های پپرونی تند کاسه‌ای با روغن پاپریکا', side: 'right' },
        { mesh: vegGroup,        closedY: -0.12, openY:  4.2, text: 'حلقه‌های زیتون کالاماتا و فلفل هالوپینو تنوری', side: 'left' },
        { mesh: basilGroup,      closedY: -0.05, openY:  5.5, text: 'برگ‌های ریحان تازه جنوا و روغن زیتون فرابکر', side: 'right' },
        { mesh: seasoningPoints, closedY:  0.05, openY:  6.8, text: 'پودر پارمزان کهنسال و پرک فلفل قرمز', side: 'left' }
    );

    explosionLayers.forEach(layer => {
        layer.mesh.position.y = layer.closedY;
        pizzaGroup.add(layer.mesh);
    });

    return { group: pizzaGroup, layers: explosionLayers };
}