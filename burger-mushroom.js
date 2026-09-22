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
    pretzel: new THREE.MeshPhysicalMaterial({ color: 0x4a2311, roughness: 0.4, bumpMap: bumpTex, bumpScale: 0.02, clearcoat: 0.3 }),
    thickPatty: new THREE.MeshPhysicalMaterial({ color: 0x2b1107, roughness: 0.75, bumpMap: bumpTex, bumpScale: 0.12, clearcoat: 0.4 }),
    swiss: new THREE.MeshPhysicalMaterial({ color: 0xfffcf0, roughness: 0.2, transmission: 0.3, thickness: 0.5, clearcoat: 0.7 }),
    mushroom: new THREE.MeshPhysicalMaterial({ color: 0x6e523f, roughness: 0.3, clearcoat: 0.8 }),
    aioli: new THREE.MeshPhysicalMaterial({ color: 0xfffdf5, roughness: 0.1, clearcoat: 1.0, transmission: 0.1, thickness: 0.4 }),
    salt: new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.1, transmission: 0.8, clearcoat: 0.9 })
};

export function buildMushroomBurger3D(scene) {
    const group = new THREE.Group();
    const layers = [];

    // 1. Pretzel Heel
    const heelGeo = new THREE.CylinderGeometry(2.1, 1.9, 0.6, 64, 16);
    const heelPos = heelGeo.attributes.position;
    for(let i=0; i<heelPos.count; i++) {
        let x=heelPos.getX(i), y=heelPos.getY(i), z=heelPos.getZ(i);
        const r=Math.sqrt(x*x+z*z), nY=(y+0.3)/0.6;
        if(r>0.1) { const s=1+Math.sin(nY*Math.PI)*0.12; heelPos.setX(i,x*s); heelPos.setZ(i,z*s); }
    }
    heelGeo.computeVertexNormals();
    const heel = new THREE.Mesh(heelGeo, mats.pretzel);
    heel.castShadow = heel.receiveShadow = true;

    // 2. Thick Patty
    const pGeo = new THREE.CylinderGeometry(2.2, 2.15, 0.9, 64, 12);
    const pPos = pGeo.attributes.position;
    for(let i=0; i<pPos.count; i++){
        let x=pPos.getX(i), y=pPos.getY(i), z=pPos.getZ(i), a=Math.atan2(z,x);
        if(Math.sqrt(x*x+z*z)>1.8){
            const n = Math.sin(a*12)*0.06 + Math.cos(a*20)*0.04;
            pPos.setX(i, x*(1+n)); pPos.setZ(i, z*(1+n));
        }
    }
    pGeo.computeVertexNormals();
    const patty = new THREE.Mesh(pGeo, mats.thickPatty);
    patty.castShadow = patty.receiveShadow = true;

    // 3. Swiss Cheese
    const cheeseGeo = new THREE.BoxGeometry(3.5, 0.1, 3.5, 64, 2, 64);
    const cPos = cheeseGeo.attributes.position;
    for(let i=0; i<cPos.count; i++){
        let x=cPos.getX(i), y=cPos.getY(i), z=cPos.getZ(i), d=Math.sqrt(x*x+z*z);
        if(d>1.5) {
            const droop = Math.pow((d-1.5)/1.1, 2.0)*0.75;
            cPos.setY(i, y-droop); cPos.setX(i, x*(1-droop*0.05)); cPos.setZ(i, z*(1-droop*0.05));
        }
    }
    cheeseGeo.computeVertexNormals();
    const cheese = new THREE.Mesh(cheeseGeo, mats.swiss);
    cheese.rotation.y = Math.PI / 6;
    cheese.castShadow = cheese.receiveShadow = true;

    // 4. Sautéed Mushrooms
    const shroomGroup = new THREE.Group();
    const capGeo = new THREE.CylinderGeometry(0.3, 0.1, 0.15, 16);
    const stemGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.2, 8);
    for(let i=0; i<18; i++){
        const shroom = new THREE.Group();
        const cap = new THREE.Mesh(capGeo, mats.mushroom); cap.position.y = 0.1;
        const stem = new THREE.Mesh(stemGeo, mats.mushroom);
        shroom.add(cap, stem);
        const rad = Math.sqrt(Math.random())*1.8, ang = Math.random()*Math.PI*2;
        shroom.position.set(rad*Math.cos(ang), 0, rad*Math.sin(ang));
        shroom.rotation.set((Math.random()-0.5)*0.8, Math.random()*Math.PI, (Math.random()-0.5)*0.8);
        shroomGroup.add(shroom);
    }

    // 5. Truffle Aioli
    const aioliGroup = new THREE.Group();
    const aGeo = new THREE.CylinderGeometry(1.8, 1.9, 0.08, 64);
    const aPos = aGeo.attributes.position;
    for(let i=0; i<aPos.count; i++){
        let x=aPos.getX(i), y=aPos.getY(i), z=aPos.getZ(i), a=Math.atan2(z,x);
        if(y>0) aPos.setY(i, y + Math.cos(a*5)*0.02 + Math.sin(x*10)*0.02);
        aPos.setX(i, x*(1+Math.sin(a*7)*0.04)); aPos.setZ(i, z*(1+Math.sin(a*7)*0.04));
    }
    aGeo.computeVertexNormals();
    const aioli = new THREE.Mesh(aGeo, mats.aioli);
    aioli.castShadow = true;
    aioliGroup.add(aioli);

    // 6. Pretzel Crown
    const crownGroup = new THREE.Group();
    const crGeo = new THREE.SphereGeometry(2.15, 64, 32);
    const crPos = crGeo.attributes.position;
    for(let i=0; i<crPos.count; i++){
        let x=crPos.getX(i), y=crPos.getY(i), z=crPos.getZ(i);
        if(y>=0) y*=0.6; else { y*=0.05; x*=(1+y*0.1); z*=(1+y*0.1); }
        crPos.setXYZ(i, x, y, z);
    }
    crGeo.computeVertexNormals();
    const crown = new THREE.Mesh(crGeo, mats.pretzel);
    crown.castShadow = crown.receiveShadow = true;
    crownGroup.add(crown);

    const saltGeo = new THREE.BoxGeometry(0.08, 0.08, 0.08);
    for(let i=0; i<40; i++){
        const salt = new THREE.Mesh(saltGeo, mats.salt);
        const phi = 0.2 + Math.random()*1.0, theta = Math.random()*Math.PI*2;
        let sx = 2.15*Math.sin(phi)*Math.cos(theta), sz = 2.15*Math.sin(phi)*Math.sin(theta), sy = (2.15*Math.cos(phi))*0.6;
        const norm = new THREE.Vector3(sx, sy/0.36, sz).normalize();
        salt.position.set(sx+norm.x*0.03, sy+norm.y*0.03, sz+norm.z*0.03);
        salt.rotation.set(Math.random()*Math.PI, Math.random()*Math.PI, Math.random()*Math.PI);
        salt.castShadow = true;
        crownGroup.add(salt);
    }

    layers.push(
        { mesh: heel,        closedY: -1.05, openY: -5.5, text: 'بیس نان تست تیره', side: 'right' },
        { mesh: patty,       closedY: -0.30, openY: -2.8, text: 'پتی گوشت ضخیم آبدار', side: 'left' },
        { mesh: cheese,      closedY:  0.18, openY: -0.5, text: 'پنیر سوئیسی آب‌شده', side: 'right' },
        { mesh: shroomGroup, closedY:  0.35, openY:  1.5, text: 'خوراک قارچ تفت‌داده با کره و خامه', side: 'left' },
        { mesh: aioliGroup,  closedY:  0.50, openY:  3.5, text: 'سس آیولی ترافل و سیر', side: 'right' },
        { mesh: crownGroup,  closedY:  0.75, openY:  6.0, text: 'نان تاج برشته با بلور نمک', side: 'left' }
    );

    layers.forEach(l => { l.mesh.position.y = l.closedY; group.add(l.mesh); });
    return { group, layers };
}