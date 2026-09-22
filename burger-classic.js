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
    brioche: new THREE.MeshPhysicalMaterial({ color: 0xdf9b3a, roughness: 0.35, bumpMap: bumpTex, bumpScale: 0.015, clearcoat: 0.4 }),
    patty: new THREE.MeshPhysicalMaterial({ color: 0x3a180f, roughness: 0.65, bumpMap: bumpTex, bumpScale: 0.1, clearcoat: 0.35 }),
    cheese: new THREE.MeshPhysicalMaterial({ color: 0xffa71a, roughness: 0.18, transmission: 0.1, thickness: 0.5, clearcoat: 0.8 }),
    lettuce: new THREE.MeshPhysicalMaterial({ color: 0x4c9921, roughness: 0.3, transmission: 0.3, thickness: 0.3, clearcoat: 0.2, side: THREE.DoubleSide }),
    tomato: new THREE.MeshPhysicalMaterial({ color: 0xb51414, roughness: 0.1, transmission: 0.2, clearcoat: 1.0 }),
    sesame: new THREE.MeshPhysicalMaterial({ color: 0xf6e3c5, roughness: 0.3, clearcoat: 0.5 })
};

export function buildClassicBurger3D(scene) {
    const group = new THREE.Group();
    const layers = [];

    // 1. Heel Base
    const heelGroup = new THREE.Group();
    const hGeo = new THREE.CylinderGeometry(2.18, 1.95, 0.65, 64, 16);
    const hPos = hGeo.attributes.position;
    for (let i = 0; i < hPos.count; i++) {
        let x = hPos.getX(i), y = hPos.getY(i), z = hPos.getZ(i);
        const r = Math.sqrt(x * x + z * z);
        const nY = (y + 0.325) / 0.65;
        if (r > 0.08) { const s = 1.0 + Math.sin(nY * Math.PI) * 0.15; hPos.setX(i, x * s); hPos.setZ(i, z * s); }
        if (nY < 0.03) hPos.setY(i, -0.325);
        if (nY > 0.95 && r < 1.95) hPos.setY(i, y - (1 - r / 1.95) * 0.05);
    }
    hGeo.computeVertexNormals();
    const heel = new THREE.Mesh(hGeo, mats.brioche);
    heel.castShadow = heel.receiveShadow = true;
    heelGroup.add(heel);

    // 2. Patty
    const pGeo = new THREE.CylinderGeometry(2.25, 2.22, 0.75, 64, 12);
    const pPos = pGeo.attributes.position;
    for(let i = 0; i < pPos.count; i++){
        let x = pPos.getX(i), y = pPos.getY(i), z = pPos.getZ(i);
        if (Math.abs(y) >= 0.35) pPos.setY(i, y + Math.sin(x*4)*Math.cos(z*4)*0.012);
        else if (Math.sqrt(x*x+z*z) > 1.8) {
            const disp = 1.0 + Math.sin(Math.atan2(z,x)*9)*0.08;
            pPos.setX(i, x*disp); pPos.setZ(i, z*disp);
        }
    }
    pGeo.computeVertexNormals();
    const patty = new THREE.Mesh(pGeo, mats.patty);
    patty.castShadow = patty.receiveShadow = true;

    // 3. Cheese
    const cGeo = new THREE.BoxGeometry(3.6, 0.08, 3.6, 64, 2, 64);
    const cPos = cGeo.attributes.position;
    for (let i = 0; i < cPos.count; i++) {
        let x = cPos.getX(i), y = cPos.getY(i), z = cPos.getZ(i), d = Math.sqrt(x*x+z*z);
        if (d > 1.55) {
            const droop = Math.pow((d - 1.55)/1.15, 2.2)*0.72;
            cPos.setY(i, y - droop); cPos.setX(i, x*(1-droop*0.06)); cPos.setZ(i, z*(1-droop*0.06));
        }
        cPos.setY(i, cPos.getY(i) + Math.sin(x*4)*Math.cos(z*4)*0.015);
    }
    cGeo.computeVertexNormals();
    const cheese = new THREE.Mesh(cGeo, mats.cheese);
    cheese.rotation.y = Math.PI / 4;
    cheese.castShadow = cheese.receiveShadow = true;

    // 4. Veggies
    const vegGroup = new THREE.Group();
    const lGeo = new THREE.RingGeometry(0.4, 2.7, 64, 16); lGeo.rotateX(-Math.PI/2);
    const lPos = lGeo.attributes.position;
    for (let i = 0; i < lPos.count; i++) {
        let x = lPos.getX(i), z = lPos.getZ(i), r = Math.sqrt(x*x+z*z), a = Math.atan2(z,x);
        const f = Math.pow(Math.max(0, (r-0.4)/2.3), 1.5);
        lPos.setY(i, (Math.sin(a*8)*0.16 + Math.cos(r*8.5)*0.09)*f);
        lPos.setX(i, x*(1+Math.sin(a*9)*0.06*f)); lPos.setZ(i, z*(1+Math.sin(a*9)*0.06*f));
    }
    lGeo.computeVertexNormals();
    const lettuce = new THREE.Mesh(lGeo, mats.lettuce);
    lettuce.castShadow = lettuce.receiveShadow = true;
    vegGroup.add(lettuce);

    const tGeo = new THREE.CylinderGeometry(1.15, 1.15, 0.2, 32, 4);
    const tPos = tGeo.attributes.position;
    for(let i=0; i<tPos.count; i++){
        let x=tPos.getX(i), y=tPos.getY(i), z=tPos.getZ(i);
        if(Math.abs(y)>0.08) { const b=1-Math.pow((Math.abs(y)-0.08)/0.02,2)*0.08; tPos.setX(i,x*b); tPos.setZ(i,z*b); }
    }
    tGeo.computeVertexNormals();
    const t1 = new THREE.Mesh(tGeo, mats.tomato), t2 = new THREE.Mesh(tGeo, mats.tomato);
    t1.position.set(-0.68, 0.2, -0.22); t1.rotation.set(0.04, 0.25, -0.04);
    t2.position.set(0.68, 0.2, 0.22); t2.rotation.set(0.04, -0.35, 0.05);
    t1.castShadow = t2.castShadow = true;
    vegGroup.add(t1, t2);

    // 5. Crown
    const crownGroup = new THREE.Group();
    const topGeo = new THREE.SphereGeometry(2.22, 64, 32);
    const tpPos = topGeo.attributes.position;
    for(let i=0; i<tpPos.count; i++){
        let x=tpPos.getX(i), y=tpPos.getY(i), z=tpPos.getZ(i), a=Math.atan2(z,x);
        if(y>=0){ y*=0.58; const n=1+Math.sin(a*3)*0.02; x*=n; z*=n; }
        else { y*=0.04; x*=(1+y*0.15); z*=(1+y*0.15); }
        tpPos.setXYZ(i, x, y, z);
    }
    topGeo.computeVertexNormals();
    const crown = new THREE.Mesh(topGeo, mats.brioche);
    crown.castShadow = crown.receiveShadow = true;
    crownGroup.add(crown);

    const sGeo = new THREE.SphereGeometry(0.05, 8, 8); sGeo.scale(0.65, 0.35, 1.4);
    for(let i=0; i<50; i++){
        const seed = new THREE.Mesh(sGeo, mats.sesame);
        const phi = 0.18 + Math.sqrt(Math.random())*1.1, theta = Math.random()*Math.PI*2;
        let sx = 2.22*Math.sin(phi)*Math.cos(theta), sz = 2.22*Math.sin(phi)*Math.sin(theta), sy = (2.22*Math.cos(phi))*0.58;
        const norm = new THREE.Vector3(sx, sy/0.3364, sz).normalize();
        seed.position.set(sx+norm.x*0.015, sy+norm.y*0.015, sz+norm.z*0.015);
        seed.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0), norm);
        seed.rotateY(Math.random()*Math.PI); seed.castShadow = true; crownGroup.add(seed);
    }

    layers.push(
        { mesh: heelGroup,  closedY: -0.9, openY: -4.5, text: 'نان بریوش تست شده', side: 'right' },
        { mesh: patty,      closedY: -0.2, openY: -1.8, text: 'پتی گوشت ۱۰۰ گرمی دست‌ساز', side: 'left' },
        { mesh: cheese,     closedY:  0.1, openY:  0.5, text: 'پنیر چدار ورقه‌ای', side: 'right' },
        { mesh: vegGroup,   closedY:  0.3, openY:  2.8, text: 'کاهو پیچ و گوجه‌فرنگی محلی', side: 'left' },
        { mesh: crownGroup, closedY:  0.6, openY:  5.5, text: 'نان بریوش کنجدی', side: 'right' }
    );

    layers.forEach(l => { l.mesh.position.y = l.closedY; group.add(l.mesh); });
    return { group, layers };
}