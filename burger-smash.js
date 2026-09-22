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
    potatoRoll: new THREE.MeshPhysicalMaterial({ color: 0xffcc55, roughness: 0.25, bumpMap: bumpTex, bumpScale: 0.01, clearcoat: 0.8 }),
    smashPatty: new THREE.MeshPhysicalMaterial({ color: 0x1f0b05, roughness: 0.8, bumpMap: bumpTex, bumpScale: 0.15, clearcoat: 0.2 }),
    gouda: new THREE.MeshPhysicalMaterial({ color: 0xffd966, roughness: 0.2, transmission: 0.2, thickness: 0.6, clearcoat: 0.9 }),
    onionStraw: new THREE.MeshPhysicalMaterial({ color: 0xd4852c, roughness: 0.4, clearcoat: 0.6 })
};

export function buildSmashBurger3D(scene) {
    const group = new THREE.Group();
    const layers = [];

    // 1. Potato Roll Heel
    const heelGeo = new THREE.CylinderGeometry(2.1, 1.9, 0.5, 64, 16);
    const heelPos = heelGeo.attributes.position;
    for(let i=0; i<heelPos.count; i++) {
        let x=heelPos.getX(i), y=heelPos.getY(i), z=heelPos.getZ(i);
        const r=Math.sqrt(x*x+z*z), nY=(y+0.25)/0.5;
        if(r>0.1) { const s=1+Math.sin(nY*Math.PI)*0.1; heelPos.setX(i,x*s); heelPos.setZ(i,z*s); }
    }
    heelGeo.computeVertexNormals();
    const heel = new THREE.Mesh(heelGeo, mats.potatoRoll);
    heel.castShadow = heel.receiveShadow = true;

    // 2. Smash Patty Builder
    const createSmashPatty = () => {
        const pGeo = new THREE.CylinderGeometry(2.35, 2.35, 0.25, 64, 8);
        const pPos = pGeo.attributes.position;
        for(let i=0; i<pPos.count; i++){
            let x=pPos.getX(i), y=pPos.getY(i), z=pPos.getZ(i);
            const r=Math.sqrt(x*x+z*z), a=Math.atan2(z,x);
            if(r>1.5) {
                const n = Math.sin(a*14)*0.1 + Math.cos(a*25)*0.08 + (Math.random()-0.5)*0.05;
                pPos.setX(i, x*(1+n)); pPos.setZ(i, z*(1+n));
            }
            if(Math.abs(y)>0.1) pPos.setY(i, y + Math.sin(x*8)*0.01);
        }
        pGeo.computeVertexNormals();
        const mesh = new THREE.Mesh(pGeo, mats.smashPatty);
        mesh.castShadow = mesh.receiveShadow = true;
        return mesh;
    };
    const patty1 = createSmashPatty();
    const patty2 = createSmashPatty();

    // 3. Gouda Blanket
    const cheeseGeo = new THREE.BoxGeometry(3.7, 0.08, 3.7, 64, 2, 64);
    const cPos = cheeseGeo.attributes.position;
    for(let i=0; i<cPos.count; i++){
        let x=cPos.getX(i), y=cPos.getY(i), z=cPos.getZ(i), d=Math.sqrt(x*x+z*z);
        if(d>1.6) {
            const droop = Math.pow((d-1.6)/1.1, 2.5)*0.85;
            cPos.setY(i, y - droop); cPos.setX(i, x*(1-droop*0.08)); cPos.setZ(i, z*(1-droop*0.08));
        }
    }
    cheeseGeo.computeVertexNormals();
    const cheese = new THREE.Mesh(cheeseGeo, mats.gouda);
    cheese.rotation.y = Math.PI / 4;
    cheese.castShadow = cheese.receiveShadow = true;

    // 4. Onion Straws
    const onionGroup = new THREE.Group();
    for (let i = 0; i < 48; i++) {
        const rad = 0.4 + Math.sqrt(Math.random()) * 1.5;
        const phi = Math.random() * Math.PI * 2;
        const cx = rad * Math.cos(phi), cz = rad * Math.sin(phi);
        const arc = 0.3 + Math.random() * 0.3;
        const curve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(cx - arc/2, (Math.random()-0.5)*0.1, cz - arc/2),
            new THREE.Vector3(cx + (Math.random()-0.5)*0.2, 0.15, cz + (Math.random()-0.5)*0.2),
            new THREE.Vector3(cx + arc/2, (Math.random()-0.5)*0.1, cz + arc/2)
        ]);
        const strawGeo = new THREE.TubeGeometry(curve, 10, 0.03, 6, false);
        const straw = new THREE.Mesh(strawGeo, mats.onionStraw);
        straw.castShadow = true;
        onionGroup.add(straw);
    }

    // 5. Crown
    const crownGeo = new THREE.SphereGeometry(2.1, 64, 32);
    const crPos = crownGeo.attributes.position;
    for(let i=0; i<crPos.count; i++){
        let x=crPos.getX(i), y=crPos.getY(i), z=crPos.getZ(i);
        if(y>=0) y*=0.65; else { y*=0.05; x*=(1+y*0.1); z*=(1+y*0.1); }
        crPos.setXYZ(i, x, y, z);
    }
    crownGeo.computeVertexNormals();
    const crown = new THREE.Mesh(crownGeo, mats.potatoRoll);
    crown.castShadow = crown.receiveShadow = true;

    layers.push(
        { mesh: heel,       closedY: -0.80, openY: -5.0, text: 'نان پوتیتو رول نرم', side: 'right' },
        { mesh: patty1,     closedY: -0.40, openY: -2.8, text: 'پتی اول گوشت اسمش‌شده', side: 'left' },
        { mesh: cheese,     closedY: -0.22, openY: -0.8, text: 'پنیر گودا ذوب‌شده داغ', side: 'right' },
        { mesh: patty2,     closedY: -0.05, openY:  1.2, text: 'پتی دوم گوشت اسمش‌شده', side: 'left' },
        { mesh: onionGroup, closedY:  0.15, openY:  3.2, text: 'پیازداغ چیپسی و سس اسموکی', side: 'right' },
        { mesh: crown,      closedY:  0.40, openY:  5.5, text: 'نان پوتیتو رول کره‌ای', side: 'left' }
    );

    layers.forEach(l => { l.mesh.position.y = l.closedY; group.add(l.mesh); });
    return { group, layers };
}