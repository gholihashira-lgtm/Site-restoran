import * as THREE from 'three';

function createBumpMap() {
    const canvas = document.createElement('canvas');
    canvas.width = 256; canvas.height = 256;
    const ctx = canvas.getContext('2d');
    const imgData = ctx.createImageData(256, 256);
    for (let i = 0; i < imgData.data.length; i += 4) {
        const v = Math.floor(Math.random() * 255);
        imgData.data[i] = imgData.data[i + 1] = imgData.data[i + 2] = v;
        imgData.data[i + 3] = 255;
    }
    ctx.putImageData(imgData, 0, 0);
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    return tex;
}

const bumpTex = createBumpMap();

const mats = {
    baguette: new THREE.MeshPhysicalMaterial({ color: 0xcca152, roughness: 0.6, bumpMap: bumpTex, bumpScale: 0.02, clearcoat: 0.1 }),
    baguetteCrust: new THREE.MeshPhysicalMaterial({ color: 0x8a4b1c, roughness: 0.5, bumpMap: bumpTex, bumpScale: 0.04, clearcoat: 0.2 }),
    pickle: new THREE.MeshPhysicalMaterial({ color: 0x4a6b2f, roughness: 0.3, clearcoat: 0.8 }),
    parsley: new THREE.MeshPhysicalMaterial({ color: 0x2e6b18, roughness: 0.7, side: THREE.DoubleSide }),
    sausage: new THREE.MeshPhysicalMaterial({ color: 0x992211, roughness: 0.3, bumpMap: bumpTex, bumpScale: 0.03, clearcoat: 0.9 }),
    sauce: new THREE.MeshPhysicalMaterial({ color: 0xbb2200, roughness: 0.2, clearcoat: 1.0, transmission: 0.2, thickness: 0.5 }),
    sesame: new THREE.MeshPhysicalMaterial({ color: 0xf5deb3, roughness: 0.4 })
};

export function buildBandari3D(scene) {
    const group = new THREE.Group();
    const layers = [];

    // 1. Bottom Baguette Heel
    const bottomGroup = new THREE.Group();
    const bGeo = new THREE.CylinderGeometry(1.6, 1.6, 5.0, 64, 16);
    bGeo.rotateZ(Math.PI / 2);
    const bPos = bGeo.attributes.position;
    for (let i = 0; i < bPos.count; i++) {
        let x = bPos.getX(i), y = bPos.getY(i), z = bPos.getZ(i);
        const taper = 1.0 - Math.pow(x / 2.5, 4) * 0.4;
        y *= taper; z *= taper;
        y *= 0.5; z *= 0.8;
        if (y > 0.1) y = 0.1;
        bPos.setXYZ(i, x, y, z);
    }
    bGeo.computeVertexNormals();
    const bottomMesh = new THREE.Mesh(bGeo, mats.baguetteCrust);
    bottomMesh.castShadow = bottomMesh.receiveShadow = true;
    bottomGroup.add(bottomMesh);

    // 2. Pickles & Parsley
    const greenGroup = new THREE.Group();
    const pGeo = new THREE.CylinderGeometry(0.25, 0.25, 0.05, 32);
    for (let i = 0; i < 18; i++) {
        const pickle = new THREE.Mesh(pGeo, mats.pickle);
        pickle.position.set((Math.random() - 0.5) * 4.0, 0, (Math.random() - 0.5) * 1.0);
        pickle.rotation.set((Math.random() - 0.5) * 0.2, Math.random() * Math.PI, (Math.random() - 0.5) * 0.2);
        pickle.castShadow = true;
        greenGroup.add(pickle);
    }
    const parsGeo = new THREE.PlaneGeometry(0.15, 0.15);
    for (let i = 0; i < 40; i++) {
        const parsley = new THREE.Mesh(parsGeo, mats.parsley);
        parsley.position.set((Math.random() - 0.5) * 4.2, 0.05, (Math.random() - 0.5) * 1.2);
        parsley.rotation.set(-Math.PI / 2, 0, Math.random() * Math.PI);
        greenGroup.add(parsley);
    }

    // 3. Sautéed Sausage Discs
    const sausageGroup = new THREE.Group();
    const sGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.15, 32);
    for (let i = 0; i < 22; i++) {
        const sausage = new THREE.Mesh(sGeo, mats.sausage);
        sausage.position.set((Math.random() - 0.5) * 4.4, (Math.random() - 0.5) * 0.1, (Math.random() - 0.5) * 1.1);
        sausage.rotation.set(Math.random() * 0.5, Math.random() * Math.PI, Math.random() * 0.5);
        sausage.castShadow = sausage.receiveShadow = true;
        sausageGroup.add(sausage);
    }

    // 4. Onions & Tomato Sauce
    const sauceGroup = new THREE.Group();
    const sauceGeo = new THREE.BoxGeometry(4.6, 0.2, 1.4, 64, 4, 16);
    const saucePos = sauceGeo.attributes.position;
    for (let i = 0; i < saucePos.count; i++) {
        let x = saucePos.getX(i), y = saucePos.getY(i), z = saucePos.getZ(i);
        const taper = 1.0 - Math.pow(x / 2.3, 4) * 0.5;
        z *= taper;
        y += Math.sin(x * 8) * Math.cos(z * 8) * 0.1;
        saucePos.setXYZ(i, x, y, z);
    }
    sauceGeo.computeVertexNormals();
    const sauceMesh = new THREE.Mesh(sauceGeo, mats.sauce);
    sauceMesh.castShadow = true;
    sauceGroup.add(sauceMesh);

    // 5. Baguette Crown
    const topGroup = new THREE.Group();
    const tGeo = new THREE.CylinderGeometry(1.6, 1.6, 5.0, 64, 16);
    tGeo.rotateZ(Math.PI / 2);
    const tPos = tGeo.attributes.position;
    for (let i = 0; i < tPos.count; i++) {
        let x = tPos.getX(i), y = tPos.getY(i), z = tPos.getZ(i);
        const taper = 1.0 - Math.pow(x / 2.5, 4) * 0.4;
        y *= taper; z *= taper;
        y *= 0.6; z *= 0.8;
        if (y < -0.1) y = -0.1;
        if (y > 0 && Math.abs(z) < 0.15 && Math.abs(x) < 2.0) {
            y -= (0.15 - Math.abs(z)) * 1.5;
        }
        tPos.setXYZ(i, x, y, z);
    }
    tGeo.computeVertexNormals();
    const topMesh = new THREE.Mesh(tGeo, mats.baguetteCrust);
    topMesh.castShadow = topMesh.receiveShadow = true;
    topGroup.add(topMesh);

    layers.push(
        { id: 'b-baguette-bottom', mesh: bottomGroup,  closedY: -0.8, openY: -4.0, text: 'نان باگت فرانسوی تست‌شده', side: 'right' },
        { id: 'b-pickles', mesh: greenGroup,   closedY: -0.3, openY: -1.5, text: 'خیارشور ترد و جعفری تازه ساطوری', side: 'left' },
        { id: 'b-sausage', mesh: sausageGroup, closedY:  0.0, openY:  1.0, text: 'سوسیس بندری تفت‌خورده در رب و روغن', side: 'right' },
        { id: 'b-onion-sauce', mesh: sauceGroup,   closedY:  0.3, openY:  3.5, text: 'پیازداغ عسلی و سس تند بندری', side: 'left' },
        { id: 'b-baguette-top', mesh: topGroup,     closedY:  0.8, openY:  6.0, text: 'نان باگت کنجدی برشته', side: 'right' }
    );

    layers.forEach(l => { l.mesh.position.y = l.closedY; group.add(l.mesh); });
    return { group, layers };
}