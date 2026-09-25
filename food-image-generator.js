/* =========================================================================
 * food-image-generator.js
 * -------------------------------------------------------------------------
 * تولیدکننده تصویر یکتا برای همه محصولات به جز برگرها
 * برگرها به‌صورت خودکار به burger-image-generator.js واگذار می‌شوند
 * ========================================================================= */

const generatedImageCache = new Map();
const usedImageUrls = new Set();
const urlOwnerMap = new Map();
const urlToPhotoMap = new Map();
const photoUsageCount = new Map();
let totalRequestCount = 0;
let collisionCount = 0;
let retrySuccessCount = 0;
let retryFailCount = 0;
let categoryMissCount = 0;
let burgerDelegatedCount = 0;

/* ------------------------------------------------------------------ *
 * توابع هش
 * ------------------------------------------------------------------ */

function hashDjb2(str) {
    let hash = 5381;
    const s = String(str);
    for (let i = 0; i < s.length; i++) {
        hash = ((hash << 5) + hash) + s.charCodeAt(i);
        hash |= 0;
    }
    return Math.abs(hash);
}

function hashFnv1a(str) {
    let h = 2166136261 >>> 0;
    const s = String(str);
    for (let i = 0; i < s.length; i++) {
        h ^= s.charCodeAt(i);
        h = Math.imul(h, 16777619);
    }
    return h >>> 0;
}

function hashSdbm(str) {
    let h = 0;
    const s = String(str);
    for (let i = 0; i < s.length; i++) {
        h = s.charCodeAt(i) + (h << 6) + (h << 16) - h;
        h |= 0;
    }
    return Math.abs(h);
}

function hashMurmurLite(str) {
    let h = 0x811c9dc5;
    const s = String(str);
    for (let i = 0; i < s.length; i++) {
        h ^= s.charCodeAt(i);
        h = Math.imul(h, 0x01000193);
    }
    h ^= h >>> 16;
    h = Math.imul(h, 0x85ebca6b);
    h ^= h >>> 13;
    h = Math.imul(h, 0xc2b2ae35);
    h ^= h >>> 16;
    return h >>> 0;
}

function hashJenkins(str) {
    let h = 0;
    const s = String(str);
    for (let i = 0; i < s.length; i++) {
        h += s.charCodeAt(i);
        h += h << 10;
        h ^= h >>> 6;
    }
    h += h << 3;
    h ^= h >>> 11;
    h += h << 15;
    return h >>> 0;
}

function hashXorShift(str) {
    let h = 0xdeadbeef >>> 0;
    const s = String(str);
    for (let i = 0; i < s.length; i++) {
        h ^= s.charCodeAt(i);
        h ^= (h << 13) >>> 0;
        h ^= (h >>> 17) >>> 0;
        h ^= (h << 5) >>> 0;
        h = h >>> 0;
    }
    return h >>> 0;
}

function hashCyclic(str) {
    let h = 0;
    const s = String(str);
    for (let i = 0; i < s.length; i++) {
        h = ((h << 5) | (h >>> 27)) >>> 0;
        h = (h + s.charCodeAt(i)) >>> 0;
    }
    return h >>> 0;
}

const HASH_FNS = [hashDjb2, hashFnv1a, hashSdbm, hashMurmurLite, hashJenkins, hashXorShift, hashCyclic];
const HASH_FN_COUNT = HASH_FNS.length;

function multiHash(seed, layer) {
    const fn = HASH_FNS[layer % HASH_FN_COUNT];
    return fn(String(seed) + '::L' + layer + '::' + layer * 31);
}

function seededPick(arr, seed) {
    if (!arr || arr.length === 0) return null;
    const idx = ((seed % arr.length) + arr.length) % arr.length;
    return arr[idx];
}

/* ------------------------------------------------------------------ *
 * استخر عکس‌ها (بدون برگر — برگرها به اسکریپت جدا واگذار می‌شوند)
 * ------------------------------------------------------------------ */

const HIGH_RES_PHOTO_POOLS = {

    coffee: [
        'photo-1461023058943-07fcbe16d735',
        'photo-1517256064527-09c73fc73e38',
        'photo-1514432324607-a09d9b4aefdd',
        'photo-1509042239860-f550ce710b93',
        'photo-1495474472287-4d71bcdd2085',
        'photo-1511920170033-f8396924c348',
        'photo-1442512595331-e89e73853f31',
        'photo-1521302080334-4bebac2763a6',
        'photo-1497935586351-b67a49e012bf',
        'photo-1521017432531-fbd92d768814',
        'photo-1559496417-e7f25cb247f3',
        'photo-1572442388796-11668a67e53d',
        'photo-1512568400610-62da28bc8a13',
        'photo-1541167760496-1628856ab772',
        'photo-1461988320302-91bde64fc8e4',
        'photo-1506372023823-741c83b836fe',
        'photo-1524350876685-274059332603',
        'photo-1518057111178-44a106bad636',
        'photo-1494314671902-399b18174975',
        'photo-1517701550927-30cf4ba1dba5',
        'photo-1512036666432-2181c1f26420',
        'photo-1523942839745-7848c8ca3d3e',
        'photo-1554118811-1e0d58224f24',
        'photo-1447933601403-0c6688de566e'
    ],

    tea_herbal: [
        'photo-1544787219-7f47ccb76574',
        'photo-1571934811356-5cc061b6821f',
        'photo-1597481499750-3e6b22637e12',
        'photo-1594631252845-29fc4cc8cde9',
        'photo-1576092768241-dec231879fc3',
        'photo-1587883012610-e3df17d41270',
        'photo-1610632380989-680fe40816c6',
        'photo-1564890369478-c89ca6d9cde9',
        'photo-1556679343-c7306c1976bc',
        'photo-1567922045116-2a00fae2ed03',
        'photo-1523920290228-4f321a939b4c',
        'photo-1587080413959-06b859fb107d',
        'photo-1627435601361-ec25f5b1d0e5',
        'photo-1597318181409-cf64d0b5d8a2'
    ],

    mint_mojito: [
        'photo-1513558161293-cdaf765ed2fd',
        'photo-1551024709-8f23befc6f87',
        'photo-1536935338788-846bb9981813',
        'photo-1556881286-fc6915169721',
        'photo-1621263764928-df1444c5e859',
        'photo-1497534446932-c925b458314e',
        'photo-1544145945-f90425340c7e',
        'photo-1609951651556-5334e2706168',
        'photo-1587223962930-cb7f31384c19',
        'photo-1622597467836-f3285f2131b7',
        'photo-1600271886742-f049cd451bba',
        'photo-1592309801938-e2b9c8c2f19f',
        'photo-1560508180-03f285f67ded',
        'photo-1551538827-9c037cb4f32a',
        'photo-1502741224143-90386d7f8c82',
        'photo-1615478503562-ec2d8aa0e24e',
        'photo-1610970881699-44a5587cabec',
        'photo-1587411768638-ec71f8e33b78'
    ],

    berry_shake: [
        'photo-1553530666-ba11a7da3888',
        'photo-1572490122747-3968b75cc699',
        'photo-1579954115545-a95591f28bfc',
        'photo-1563805042-7684c019e1cb',
        'photo-1528498033373-3c6c08e93d79',
        'photo-1541658016709-82535e94bc69',
        'photo-1587223962930-cb7f31384c19',
        'photo-1568901839119-631418a3910d',
        'photo-1502741224143-90386d7f8c82',
        'photo-1626200419139-6e50e74b9b8b',
        'photo-1600718374662-0483d2b9da44',
        'photo-1615478503562-ec2d8aa0e24e',
        'photo-1587411768638-ec71f8e33b78',
        'photo-1610970881699-44a5587cabec',
        'photo-1544145945-f90425340c7e',
        'photo-1551024709-8f23befc6f87'
    ],

    doogh_dairy: [
        'photo-1556881286-fc6915169721',
        'photo-1550583724-b2692b85b150',
        'photo-1528750997573-59b89d56f4f7',
        'photo-1563636619-e9143da7973b',
        'photo-1600788886242-5c96aabe3757',
        'photo-1626957341926-98752fc2ba90',
        'photo-1560508180-03f285f67ded',
        'photo-1571212515416-fca8b0a80748',
        'photo-1590080875515-8a3a8dc5735e',
        'photo-1517445312882-bc9910d016b7'
    ],

    citrus_juice: [
        'photo-1600271886742-f049cd451bba',
        'photo-1613478223719-2ab802602423',
        'photo-1621506289937-a8e4df240d0b',
        'photo-1622597467836-f3285f2131b7',
        'photo-1615478503562-ec2d8aa0e24e',
        'photo-1600718374662-0483d2b9da44',
        'photo-1571680322279-a226e6a4cc2a',
        'photo-1497534446932-c925b458314e',
        'photo-1621263764928-df1444c5e859',
        'photo-1560508180-03f285f67ded',
        'photo-1595475207225-428b62bda831',
        'photo-1601004890684-d8cbf643f5f2',
        'photo-1553530666-ba11a7da3888'
    ],

    cola_soda: [
        'photo-1622483767028-3f66f32aef97',
        'photo-1554866585-cd94860890b7',
        'photo-1581009146145-b5ef050c2e1e',
        'photo-1527960471264-932f39eb5846',
        'photo-1581636625402-29b2a704ef13',
        'photo-1613478223719-2ab802602423',
        'photo-1629203851122-3726ecdf080e',
        'photo-1625772299848-391b6a87d7b3',
        'photo-1594736797933-d0501ba2fe65',
        'photo-1607483298854-e7c79e3bb85a'
    ],

    tahchin_rice: [
        'photo-1588168333986-5078d3ae3976',
        'photo-1631515243349-e0cb75fb8d3a',
        'photo-1596797038530-2c107229654b',
        'photo-1546069901-ba9599a7e63c',
        'photo-1633945274405-b6c8069047b0',
        'photo-1631292784640-2b24be784d5d',
        'photo-1563379091339-03b21ab4a4f8',
        'photo-1512058564366-18510be2db19',
        'photo-1603133872878-684f208fb84b'
    ],

    cherry_rice: [
        'photo-1596797038530-2c107229654b',
        'photo-1563379091339-03b21ab4a4f8',
        'photo-1512058564366-18510be2db19',
        'photo-1546069901-ba9599a7e63c',
        'photo-1633945274405-b6c8069047b0',
        'photo-1547592180-85f173990554',
        'photo-1631292784640-2b24be784d5d',
        'photo-1603133872878-684f208fb84b'
    ],

    zereshk_polo: [
        'photo-1604908176997-125f25cc6f3d',
        'photo-1546069901-ba9599a7e63c',
        'photo-1565299585323-38d6b0865b47',
        'photo-1598515214211-89d3c73ae83b',
        'photo-1563379091339-03b21ab4a4f8',
        'photo-1631515243349-e0cb75fb8d3a',
        'photo-1633945274405-b6c8069047b0',
        'photo-1631292784640-2b24be784d5d',
        'photo-1588168333986-5078d3ae3976',
        'photo-1603133872878-684f208fb84b',
        'photo-1596797038530-2c107229654b',
        'photo-1547592180-85f173990554'
    ],

    ghormeh_sabzi: [
        'photo-1547592180-85f173990554',
        'photo-1627308595186-b4b3b3cbce20',
        'photo-1574484284002-952d92456975',
        'photo-1560934057-04870f7f3ed6',
        'photo-1604908176997-125f25cc6f3d',
        'photo-1603105037880-880cd4edfb0d',
        'photo-1631515243349-e0cb75fb8d3a',
        'photo-1596797038530-2c107229654b'
    ],

    ash_stew: [
        'photo-1547592180-85f173990554',
        'photo-1560934057-04870f7f3ed6',
        'photo-1572449043416-55f4685c9bb7',
        'photo-1627308595186-b4b3b3cbce20',
        'photo-1603105037880-880cd4edfb0d',
        'photo-1574484284002-952d92456975',
        'photo-1596797038530-2c107229654b'
    ],

    fish_dish: [
        'photo-1519708227418-c8fd9a32b7a2',
        'photo-1534422298391-e4f8c172dddb',
        'photo-1579631542720-3a87824fff86',
        'photo-1467003909585-2f8a72700288',
        'photo-1580476262798-bddd9f4b7369',
        'photo-1615141982883-c7ad0e69fd62',
        'photo-1611171711912-e3f6b536f532',
        'photo-1519984388953-d2406bc725e1',
        'photo-1580959375944-abd7e991f971'
    ],

    koobideh: [
        'photo-1627012046423-93d39da6a8b7',
        'photo-1603360946369-dc9bb6258143',
        'photo-1544025162-d76694265947',
        'photo-1558030006-450675393462',
        'photo-1555939594-58d7cb561ad1',
        'photo-1600891964092-4316c288032e',
        'photo-1600628421055-4d30de868b8f',
        'photo-1529006557810-274b9b2fc783',
        'photo-1598515214211-89d3c73ae83b',
        'photo-1615937657715-bc7b4b7962c1'
    ],

    joojeh: [
        'photo-1555939594-58d7cb561ad1',
        'photo-1599488615731-7e5c2823ff28',
        'photo-1529193591184-b1d58069ecdd',
        'photo-1600891964092-4316c288032e',
        'photo-1529692236671-f1f6cf9683ba',
        'photo-1598514211-89d3c73ae83b',
        'photo-1627012046423-93d39da6a8b7',
        'photo-1603360946369-dc9bb6258143',
        'photo-1615937657715-bc7b4b7962c1'
    ],

    shishlik: [
        'photo-1544025162-d76694265947',
        'photo-1529193591184-b1d58069ecdd',
        'photo-1558030006-450675393462',
        'photo-1603360946369-dc9bb6258143',
        'photo-1627012046423-93d39da6a8b7',
        'photo-1529006557810-274b9b2fc783',
        'photo-1615937657715-bc7b4b7962c1',
        'photo-1600891964092-4316c288032e',
        'photo-1598515214211-89d3c73ae83b'
    ],

    pizza: [
        'photo-1628840042765-356cda07504e',
        'photo-1565299624946-b28f40a0ae38',
        'photo-1593560708920-61dd98c46a4e',
        'photo-1513104890138-7c749659a591',
        'photo-1574071318508-1cdbab80d002',
        'photo-1604382354936-07c5d9983bd3',
        'photo-1565299507177-b0ac66763828',
        'photo-1595854341625-f33ee10dbf94',
        'photo-1571407970349-bc81e7e96d47',
        'photo-1585238342024-78d387f4a707',
        'photo-1594007654729-407eedc4be65',
        'photo-1590947132387-155cc02f3212',
        'photo-1571997478779-2adcbbe9ab2f',
        'photo-1600028997689-ba9caf1a38d2',
        'photo-1548369937-47519962c11a',
        'photo-1541745537411-b8046dc6d66c',
        'photo-1520201163981-8cc95007dd2a',
        'photo-1601924582970-9238bcb495d9'
    ],

    sandwich: [
        'photo-1619740455993-9e612b1af08a',
        'photo-1528735602780-2552fd46c7af',
        'photo-1590165482129-1b8b27698780',
        'photo-1509722747041-616f39b57569',
        'photo-1606755962773-d324e0a13086',
        'photo-1627308595229-7830f5c9c66e',
        'photo-1553909489-cd47e0907980',
        'photo-1539252554453-80ab65ce3586',
        'photo-1481070555726-e2fe8357725c',
        'photo-1521390188846-e2a3a97453a0',
        'photo-1567620905732-2d1ec7ab7445',
        'photo-1592415486689-125cbbfcbee2',
        'photo-1621996346565-e3dbc646d9a9',
        'photo-1619096252214-ef06c45683e3',
        'photo-1623428187969-5da2dcea5ebf',
        'photo-1607013251379-e6eecfffe234',
        'photo-1615719413546-198b25453f85'
    ],

    hotdog: [
        'photo-1612392062798-2f3a3b5b7c17',
        'photo-1619740455993-9e612b1af08a',
        'photo-1590165482129-1b8b27698780',
        'photo-1612392061787-2d078b3e573c',
        'photo-1585238342024-78d387f4a707',
        'photo-1621996346565-e3dbc646d9a9'
    ],

    fries: [
        'photo-1585109649139-366815a0d713',
        'photo-1573080496219-bb080dd4f877',
        'photo-1630384060421-cb20d0e0649d',
        'photo-1541592106381-b31e9677c0e5',
        'photo-1608039755401-742074f0548d',
        'photo-1518013431117-eb1465fa5752',
        'photo-1576107232684-1279f390859f',
        'photo-1639024471283-03518883512d'
    ],

    wings: [
        'photo-1524114664604-cd8133cd67ad',
        'photo-1562967914-608f82629710',
        'photo-1608039755401-742074f0548d',
        'photo-1567620832903-9fc6debc209f',
        'photo-1614398751058-eb2e0bf63e53',
        'photo-1600555379765-f82335a7b1b0'
    ],

    mozzarella: [
        'photo-1534080564583-6be75777b70a',
        'photo-1531749668029-2db88e4276c7',
        'photo-1608039755401-742074f0548d',
        'photo-1541544537156-7627a7a4aa1c',
        'photo-1630431341973-02e1b662ec35'
    ],

    appetizer: [
        'photo-1585109649139-366815a0d713',
        'photo-1534080564583-6be75777b70a',
        'photo-1524114664604-cd8133cd67ad',
        'photo-1562967914-608f82629710',
        'photo-1541592106381-b31e9677c0e5',
        'photo-1608039755401-742074f0548d',
        'photo-1630431341973-02e1b662ec35',
        'photo-1626082927389-6cd097cdc6ec',
        'photo-1600555379765-f82335a7b1b0',
        'photo-1573080496219-bb080dd4f877',
        'photo-1541544537156-7627a7a4aa1c',
        'photo-1606755962773-d324e0a13086',
        'photo-1593030761757-71fae45fa0e7',
        'photo-1518013431117-eb1465fa5752'
    ],

    baklava: [
        'photo-1599598425947-33002629b5fa',
        'photo-1616428784132-75d31562b772',
        'photo-1606313564200-e75d5e30476c',
        'photo-1602351447937-745cb720612f',
        'photo-1603532648955-039310d9ed75',
        'photo-1621303837174-89787a7d4729'
    ],

    cake: [
        'photo-1578985545062-69928b1d9587',
        'photo-1551024601-bec78aea704b',
        'photo-1565958011703-44f9829ba187',
        'photo-1486427944299-d1955d23e34d',
        'photo-1499636136210-6f4ee915583e',
        'photo-1519915028121-7d3463d20b13',
        'photo-1519869325930-281384150729',
        'photo-1470124182917-cc6e71b22ecc',
        'photo-1587241321921-91a834d6d191',
        'photo-1606313564200-e75d5e30476c',
        'photo-1571877227200-a0d98ea607e9',
        'photo-1535141192574-5d4897c12636'
    ],

    croissant: [
        'photo-1555507036-ab1f40ce88cb',
        'photo-1587314168485-3236d6710814',
        'photo-1509440159596-0249088772ff',
        'photo-1519915028121-7d3463d20b13',
        'photo-1558961363-fa8fdf82db35',
        'photo-1509365465985-25d11c17e812',
        'photo-1608198093002-ad4e005484ec'
    ],

    sweet: [
        'photo-1599598425947-33002629b5fa',
        'photo-1616428784132-75d31562b772',
        'photo-1578985545062-69928b1d9587',
        'photo-1551024601-bec78aea704b',
        'photo-1555507036-ab1f40ce88cb',
        'photo-1587314168485-3236d6710814',
        'photo-1565958011703-44f9829ba187',
        'photo-1486427944299-d1955d23e34d',
        'photo-1499636136210-6f4ee915583e',
        'photo-1509440159596-0249088772ff',
        'photo-1519915028121-7d3463d20b13',
        'photo-1519869325930-281384150729',
        'photo-1470124182917-cc6e71b22ecc',
        'photo-1587241321921-91a834d6d191',
        'photo-1606313564200-e75d5e30476c',
        'photo-1602351447937-745cb720612f',
        'photo-1621303837174-89787a7d4729',
        'photo-1611293388250-580b08c4a145',
        'photo-1590080875515-8a3a8dc5735e',
        'photo-1624353365286-3f8d62daad51',
        'photo-1603532648955-039310d9ed75',
        'photo-1571877227200-a0d98ea607e9',
        'photo-1535141192574-5d4897c12636'
    ],

    snacks: [
        'photo-1566478989037-eec170784d0b',
        'photo-1621939514649-280e2ee25f60',
        'photo-1560472354-b33ff0c44a43',
        'photo-1571506165871-ee72a35bc9d4',
        'photo-1600271886742-f049cd451bba',
        'photo-1599490659213-e2b9527bd087',
        'photo-1598511726623-d2e9996e9b22'
    ]
};

const STRICT_CATEGORY_POOLS = {
    coffee: 'coffee',
    tea_herbal: 'tea_herbal',
    mint_mojito: 'mint_mojito',
    berry_shake: 'berry_shake',
    doogh_dairy: 'doogh_dairy',
    citrus_juice: 'citrus_juice',
    cola_soda: 'cola_soda',
    tahchin_rice: 'tahchin_rice',
    cherry_rice: 'cherry_rice',
    zereshk_polo: 'zereshk_polo',
    ghormeh_sabzi: 'ghormeh_sabzi',
    ash_stew: 'ash_stew',
    fish_dish: 'fish_dish',
    koobideh: 'koobideh',
    joojeh: 'joojeh',
    shishlik: 'shishlik',
    pizza: 'pizza',
    sandwich: 'sandwich',
    hotdog: 'hotdog',
    fries: 'fries',
    wings: 'wings',
    mozzarella: 'mozzarella',
    appetizer: 'appetizer',
    baklava: 'baklava',
    cake: 'cake',
    croissant: 'croissant',
    sweet: 'sweet',
    snacks: 'snacks'
};

/* ------------------------------------------------------------------ *
 * پارامترهای URL
 * ------------------------------------------------------------------ */

const CROP_VARIANTS = [
    'entropy',
    'center',
    'top',
    'bottom',
    'left',
    'right',
    'faces,center',
    'entropy,center',
    'top,left',
    'top,right',
    'bottom,left',
    'bottom,right'
];

const FIT_VARIANTS = ['crop', 'clip', 'fill', 'scale'];

const SAT_VARIANTS = [0, 4, -4, 8, -8, 12, -12, 16, -16, 20, -20, 25, -25, 30, -30];
const BRI_VARIANTS = [0, 3, -3, 6, -6, 10, -10, 14, -14, 18, -18];
const CON_VARIANTS = [0, 3, -3, 6, -6, 10, -10, 14, -14, 18, -18];
const HUE_VARIANTS = [0, 4, -4, 8, -8, 12, -12, 16, -16, 20, -20, 25, -25];
const VIB_VARIANTS = [0, 6, 12, 18, 24, 30, 36, -6, -12, -18, -24];
const EXP_VARIANTS = [0, 3, -3, 6, -6, 10, -10, 14, -14];
const SHARPEN_VARIANTS = [0, 10, 20, 30, 40, 50, 60];
const BLUR_VARIANTS = [0, 1, 2, 3];
const GAMMA_VARIANTS = [0, 3, -3, 6, -6, 10, -10];
const TINT_VARIANTS = [0, 5, -5, 10, -10, 15, -15];
const TEMP_VARIANTS = [0, 5, -5, 10, -10, 15, -15, 20, -20];
const HIGHLIGHT_VARIANTS = [0, 5, -5, 10, -10, 15, -15];
const SHADOW_VARIANTS = [0, 5, -5, 10, -10, 15, -15];
const CLARITY_VARIANTS = [0, 5, -5, 10, -10, 15, -15];
const VIGNETTE_VARIANTS = [0, 5, 10, 15, 20, 25, 30];
const GRAIN_VARIANTS = [0, 5, 10, 15, 20, 25, 30];

const RATIO_VARIANTS = [
    [450, 450],
    [460, 460],
    [470, 470],
    [480, 480],
    [490, 490],
    [500, 500],
    [510, 510],
    [520, 520],
    [530, 530],
    [540, 540]
];

const QUALITY_VARIANTS = [72, 75, 78, 80, 82, 84];

const FORMAT_VARIANTS = ['jpg', 'webp'];

const AUTO_VARIANTS = ['format', 'compress', 'format,compress'];

const IXLIB_VARIANTS = ['rb-4.0.3', 'rb-4.0.2', 'rb-4.0.1', 'rb-4.0.4'];

const FPX_VARIANTS = [0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5, 0.55, 0.6, 0.65, 0.7, 0.75, 0.8, 0.85];
const FPY_VARIANTS = [0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5, 0.55, 0.6, 0.65, 0.7, 0.75, 0.8];
const FPZ_VARIANTS = [1, 1.5, 2, 2.5, 3];

/* ------------------------------------------------------------------ *
 * تشخیص دسته — برگرها اینجا رد می‌شوند
 * ------------------------------------------------------------------ */

function isBurger(product) {
    if (!product) return false;
    if ((product.categoryId || '').toLowerCase() === 'burgers') return true;
    const t = ((product.title || '') + ' ' + (product.desc || '')).toLowerCase();
    return /برگر|همبرگر|اسلایدر|چیزبرگر/.test(t);
}

function detectCategoryKey(title, categoryId, desc) {
    const t = ((title || '') + ' ' + (desc || '')).toLowerCase();
    const c = (categoryId || '').toLowerCase();

    if (/باقلوا/.test(t)) return 'baklava';
    if (/کروسان/.test(t)) return 'croissant';
    if (/چیزکیک|براونی|فاج|رولت|ماکارون|تیرامیسو|کیک\s*شکلاتی|کیک\s*وانیلی|کیک\s*هویج/.test(t)) return 'cake';
    if (/کیک|شیرینی|دسر|شله|نون\s*خامه|پروفیترول/.test(t)) return 'sweet';

    if (/موهیتو|نعنا\s*لیمو|نعنا\s*لیمو\s*گازدار/.test(t)) return 'mint_mojito';
    if (/توت\s*فرنگی|شیک|اسموتی|بلوبری|انار\s*شیک/.test(t)) return 'berry_shake';
    if (/دوغ/.test(t)) return 'doogh_dairy';
    if (/قهوه|اسپرسو|لاته|موکا|کلد\s*برو|کاپوچینو|فراپه/.test(t)) return 'coffee';
    if (/چای|دمنوش|چای\s*سبز|چای\s*زعفران/.test(t)) return 'tea_herbal';
    if (/کولا|نوشابه|پپسی|فانتا|کوکاکولا|ماءالشعیر|اسپرایت|سودا|قوطی/.test(t)) return 'cola_soda';
    if (/پرتقال|آبمیوه|لیمو\s*تازه|سیب\s*طبیعی|میوه\s*طبیعی|نوشیدنی/.test(t)) return 'citrus_juice';

    if (/ماهی|قزل|سالمون|سبزی\s*پلو\s*ماهی|تن\s*ماهی/.test(t)) return 'fish_dish';
    if (/ته\s*چین/.test(t)) return 'tahchin_rice';
    if (/آلبالو\s*پلو/.test(t)) return 'cherry_rice';
    if (/زرشک|مرغ\s*پلو|باقالی\s*پلو|عدس\s*پلو|لوبیا\s*پلو|سبزی\s*پلو/.test(t)) return 'zereshk_polo';
    if (/قورمه\s*سبزی|کرفس|فسنجان|آلو\s*اسفناج|قیمه\s*بادمجان|خورشت/.test(t)) return 'ghormeh_sabzi';
    if (/آش|حلیم|سوپ|شله\s*قلمکار|کشک\s*بادمجان|میرزاقاسمی|حلیم\s*بادمجان/.test(t)) return 'ash_stew';
    if (/قیمه\s*نثار|چلو\s*پلو|پلو|چلو|کته/.test(t)) return 'zereshk_polo';

    if (/کوبیده|لقمه\s*نجفی|لقمه/.test(t)) return 'koobideh';
    if (/جوجه/.test(t)) return 'joojeh';
    if (/شیشلیک|برگ|چنجه|دنده\s*بره|راسته/.test(t)) return 'shishlik';
    if (/کباب|سلطانی|بختیاری|میکس|مخلوط|دیس\s*کباب|پرس\s*کباب/.test(t)) return 'shishlik';

    if (/پیتزا/.test(t)) return 'pizza';
    if (/هات\s*داگ|هاتداگ/.test(t)) return 'hotdog';
    if (/ساندویچ|باگت|بندری|ژامبون|شنیسل|زینگر|رست\s*بیف|مغز\s*و\s*زبان/.test(t)) return 'sandwich';

    if (/سیب\s*زمینی|چیپسی|قاچی|بلژیکی|سرخ\s*کرده/.test(t)) return 'fries';
    if (/بال|پاچینی|وینگز|بوفالو|کتف/.test(t)) return 'wings';
    if (/موزارلا|استیکس|کروکت\s*پنیری/.test(t)) return 'mozzarella';
    if (/ناگت|پیاز\s*حلقه|قارچ\s*سوخاری|اسنک|پیش\s*غذا|پیش\s*غذای/.test(t)) return 'appetizer';

    if (/چیپس|پفک|بیسکویت|شکلات|آدامس|تنقلات|اسنک\s*بسته/.test(t)) return 'snacks';

    if (c === 'drinks') {
        if (/نوشابه|کولا|قوطی/.test(t)) return 'cola_soda';
        if (/قهوه|اسپرسو|لاته/.test(t)) return 'coffee';
        if (/چای|دمنوش/.test(t)) return 'tea_herbal';
        if (/دوغ/.test(t)) return 'doogh_dairy';
        if (/موهیتو|نعنا/.test(t)) return 'mint_mojito';
        if (/شیک|اسموتی/.test(t)) return 'berry_shake';
        return 'citrus_juice';
    }
    if (c === 'supermarket') return 'snacks';
    if (c === 'pizza') return 'pizza';
    if (c === 'sandwich') return 'sandwich';
    if (c === 'kebab') return 'shishlik';
    if (c === 'traditional') return 'zereshk_polo';
    if (c === 'ash') return 'ash_stew';
    if (c === 'appetizers') return 'appetizer';
    if (c === 'sweets') return 'sweet';

    return 'zereshk_polo';
}

function getStrictPool(categoryKey) {
    const poolKey = STRICT_CATEGORY_POOLS[categoryKey];
    if (poolKey && HIGH_RES_PHOTO_POOLS[poolKey]) {
        return HIGH_RES_PHOTO_POOLS[poolKey];
    }
    return HIGH_RES_PHOTO_POOLS.pizza;
}

/* ------------------------------------------------------------------ *
 * ساخت URL
 * ------------------------------------------------------------------ */

function buildImageUrl(photoId, params) {
    const parts = [];
    parts.push('w=' + params.w);
    parts.push('h=' + params.h);
    parts.push('q=' + params.q);
    parts.push('auto=' + params.auto);
    parts.push('fm=' + params.fm);
    parts.push('fit=' + params.fit);
    parts.push('crop=' + params.crop);

    if (params.crop === 'focalpoint' && params.fpX !== null) {
        parts.push('fp-x=' + params.fpX);
        parts.push('fp-y=' + params.fpY);
        parts.push('fp-z=' + params.fpZ);
    }

    if (params.sat !== 0) parts.push('sat=' + params.sat);
    if (params.bri !== 0) parts.push('bri=' + params.bri);
    if (params.con !== 0) parts.push('con=' + params.con);
    if (params.hue !== 0) parts.push('hue=' + params.hue);
    if (params.vib !== 0) parts.push('vib=' + params.vib);
    if (params.exp !== 0) parts.push('exp=' + params.exp);
    if (params.sharpen !== 0) parts.push('sharp=' + params.sharpen);
    if (params.blur !== 0) parts.push('blur=' + params.blur);
    if (params.gamma !== 0) parts.push('gam=' + params.gamma);
    if (params.tint !== 0) parts.push('tint=' + params.tint);
    if (params.temp !== 0) parts.push('temp=' + params.temp);
    if (params.highlight !== 0) parts.push('high=' + params.highlight);
    if (params.shadow !== 0) parts.push('shad=' + params.shadow);
    if (params.clarity !== 0) parts.push('clarity=' + params.clarity);
    if (params.vignette !== 0) parts.push('vignette=' + params.vignette);
    if (params.grain !== 0) parts.push('grain=' + params.grain);

    parts.push('ixlib=' + params.ixlib);

    return 'https://images.unsplash.com/' + photoId + '?' + parts.join('&');
}

function deriveParams(seed, attempt, pool) {
    const paramSeed = String(seed) + '::attempt::' + attempt + '::v9';

    const h1 = multiHash(paramSeed, 0);
    const h2 = multiHash(paramSeed, 1);
    const h3 = multiHash(paramSeed, 2);
    const h4 = multiHash(paramSeed, 3);
    const h5 = multiHash(paramSeed, 4);
    const h6 = multiHash(paramSeed, 5);
    const h7 = multiHash(paramSeed, 6);
    const h8 = multiHash(paramSeed, 7);
    const h9 = multiHash(paramSeed, 8);
    const h10 = multiHash(paramSeed, 9);
    const h11 = multiHash(paramSeed, 10);
    const h12 = multiHash(paramSeed, 11);
    const h13 = multiHash(paramSeed, 12);
    const h14 = multiHash(paramSeed, 13);
    const h15 = multiHash(paramSeed, 14);
    const h16 = multiHash(paramSeed, 15);
    const h17 = multiHash(paramSeed, 16);
    const h18 = multiHash(paramSeed, 17);
    const h19 = multiHash(paramSeed, 18);
    const h20 = multiHash(paramSeed, 19);
    const h21 = multiHash(paramSeed, 20);
    const h22 = multiHash(paramSeed, 21);
    const h23 = multiHash(paramSeed, 22);
    const h24 = multiHash(paramSeed, 23);
    const h25 = multiHash(paramSeed, 24);
    const h26 = multiHash(paramSeed, 25);
    const h27 = multiHash(paramSeed, 26);

    const photoIndex = (h1 + attempt) % pool.length;
    const photoId = pool[photoIndex];

    const crop = seededPick(CROP_VARIANTS, h2);
    const fit = seededPick(FIT_VARIANTS, h3);
    const ratio = seededPick(RATIO_VARIANTS, h4);
    const q = seededPick(QUALITY_VARIANTS, h5);
    const fm = seededPick(FORMAT_VARIANTS, h6);
    const auto = seededPick(AUTO_VARIANTS, h7);

    let fpX = null;
    let fpY = null;
    let fpZ = null;
    if (crop === 'focalpoint') {
        fpX = seededPick(FPX_VARIANTS, h8);
        fpY = seededPick(FPY_VARIANTS, h9);
        fpZ = seededPick(FPZ_VARIANTS, h10);
    }

    const sat = seededPick(SAT_VARIANTS, h11);
    const bri = seededPick(BRI_VARIANTS, h12);
    const con = seededPick(CON_VARIANTS, h13);
    const hue = seededPick(HUE_VARIANTS, h14);
    const vib = seededPick(VIB_VARIANTS, h15);
    const exp = seededPick(EXP_VARIANTS, h16);
    const sharpen = seededPick(SHARPEN_VARIANTS, h17);
    const blur = seededPick(BLUR_VARIANTS, h18);
    const gamma = seededPick(GAMMA_VARIANTS, h19);
    const tint = seededPick(TINT_VARIANTS, h20);
    const temp = seededPick(TEMP_VARIANTS, h21);
    const highlight = seededPick(HIGHLIGHT_VARIANTS, h22);
    const shadow = seededPick(SHADOW_VARIANTS, h23);
    const clarity = seededPick(CLARITY_VARIANTS, h24);
    const vignette = seededPick(VIGNETTE_VARIANTS, h25);
    const grain = seededPick(GRAIN_VARIANTS, h26);

    const ixlib = seededPick(IXLIB_VARIANTS, h27);

    return {
        photoId: photoId,
        photoIndex: photoIndex,
        w: ratio[0],
        h: ratio[1],
        q: q,
        fm: fm,
        auto: auto,
        fit: fit,
        crop: crop,
        fpX: fpX,
        fpY: fpY,
        fpZ: fpZ,
        sat: sat,
        bri: bri,
        con: con,
        hue: hue,
        vib: vib,
        exp: exp,
        sharpen: sharpen,
        blur: blur,
        gamma: gamma,
        tint: tint,
        temp: temp,
        highlight: highlight,
        shadow: shadow,
        clarity: clarity,
        vignette: vignette,
        grain: grain,
        ixlib: ixlib
    };
}

const MAX_RETRY = 5000;

/* ------------------------------------------------------------------ *
 * API اصلی
 * ------------------------------------------------------------------ */

export function getDistinctFoodImage(product) {
    if (!product) {
        return 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=480&h=480&q=78&auto=format&fit=crop';
    }

    /* برگرها به اسکریپت اختصاصی واگذار می‌شوند */
    if (isBurger(product)) {
        burgerDelegatedCount++;
        if (typeof window !== 'undefined' && window.BurgerImages && typeof window.BurgerImages.getImage === 'function') {
            return window.BurgerImages.getImage(product);
        }
        return 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&h=500&q=80&auto=format&fit=crop';
    }

    totalRequestCount++;

    const cacheKey = 'img_' + product.id + '_' + (product.title || '');
    if (generatedImageCache.has(cacheKey)) {
        return generatedImageCache.get(cacheKey);
    }

    const categoryKey = detectCategoryKey(product.title, product.categoryId, product.desc);
    const pool = getStrictPool(categoryKey);

    if (!STRICT_CATEGORY_POOLS[categoryKey]) {
        categoryMissCount++;
    }

    const baseSeed = String(product.id) + '::' + (product.title || '') + '::' + (product.categoryId || '') + '::' + categoryKey;

    let url = null;
    let matchedPhotoId = null;

    for (let attempt = 0; attempt < MAX_RETRY; attempt++) {
        const params = deriveParams(baseSeed, attempt, pool);
        const candidate = buildImageUrl(params.photoId, params);

        if (!usedImageUrls.has(candidate)) {
            url = candidate;
            matchedPhotoId = params.photoId;
            if (attempt > 0) {
                retrySuccessCount++;
                collisionCount += attempt;
            }
            break;
        }
    }

    if (url === null) {
        retryFailCount++;
        const emergencySeed = baseSeed + '::emergency::' + Date.now() + '::' + Math.random();
        const params = deriveParams(emergencySeed, MAX_RETRY + 1, pool);
        url = buildImageUrl(params.photoId, params) + '&sig=' + hashDjb2(emergencySeed).toString(36);
        matchedPhotoId = params.photoId;
    }

    usedImageUrls.add(url);
    urlOwnerMap.set(url, baseSeed);
    urlToPhotoMap.set(url, matchedPhotoId);

    if (!photoUsageCount.has(matchedPhotoId)) {
        photoUsageCount.set(matchedPhotoId, 0);
    }
    photoUsageCount.set(matchedPhotoId, photoUsageCount.get(matchedPhotoId) + 1);

    generatedImageCache.set(cacheKey, url);

    return url;
}

export async function refreshAllCatalogImages(catalog) {
    if (!Array.isArray(catalog)) return;

    /* اطمینان از بارگذاری اسکریپت برگر */
    if (typeof window !== 'undefined' && !window.BurgerImages) {
        try {
            await import('./burger-image-generator.js');
        } catch (e) {
            console.warn('[FoodImageGenerator] burger script not loaded:', e);
        }
    }

    usedImageUrls.clear();
    urlOwnerMap.clear();
    urlToPhotoMap.clear();
    photoUsageCount.clear();
    generatedImageCache.clear();
    collisionCount = 0;
    retrySuccessCount = 0;
    retryFailCount = 0;
    totalRequestCount = 0;
    categoryMissCount = 0;
    burgerDelegatedCount = 0;

    /* ابتدا برگرها را با اسکریپت اختصاصی رفرش کن */
    if (typeof window !== 'undefined' && window.BurgerImages && typeof window.BurgerImages.refresh === 'function') {
        window.BurgerImages.refresh(catalog);
    }

    /* سپس بقیه محصولات */
    for (let i = 0; i < catalog.length; i++) {
        const p = catalog[i];
        if (isBurger(p)) {
            if (!p.image) {
                p.image = getDistinctFoodImage(p);
            }
            continue;
        }
        p.image = getDistinctFoodImage(p);
    }
}

export function verifyCategoryMatch(product) {
    if (!product) return { match: false, key: null, poolSize: 0, isBurger: false };
    if (isBurger(product)) {
        return { match: true, key: 'burger', poolSize: 0, isBurger: true, delegated: true };
    }
    const key = detectCategoryKey(product.title, product.categoryId, product.desc);
    const pool = getStrictPool(key);
    return {
        match: !!STRICT_CATEGORY_POOLS[key],
        key: key,
        poolSize: pool.length,
        hasStrictPool: !!STRICT_CATEGORY_POOLS[key],
        isBurger: false
    };
}

export function getImageStats() {
    const poolStats = {};
    Object.keys(HIGH_RES_PHOTO_POOLS).forEach(function (k) {
        poolStats[k] = HIGH_RES_PHOTO_POOLS[k].length;
    });

    const topPhotos = [];
    photoUsageCount.forEach(function (count, photoId) {
        topPhotos.push({ photoId: photoId, count: count });
    });
    topPhotos.sort(function (a, b) { return b.count - a.count; });

    return {
        totalRequests: totalRequestCount,
        cached: generatedImageCache.size,
        uniqueUrls: usedImageUrls.size,
        owners: urlOwnerMap.size,
        uniquePhotosUsed: photoUsageCount.size,
        totalCollisions: collisionCount,
        retrySuccess: retrySuccessCount,
        retryFail: retryFailCount,
        categoryMisses: categoryMissCount,
        burgerDelegated: burgerDelegatedCount,
        poolSizes: poolStats,
        topUsedPhotos: topPhotos.slice(0, 20)
    };
}

export function clearImageCache() {
    generatedImageCache.clear();
    usedImageUrls.clear();
    urlOwnerMap.clear();
    urlToPhotoMap.clear();
    photoUsageCount.clear();
    collisionCount = 0;
    retrySuccessCount = 0;
    retryFailCount = 0;
    totalRequestCount = 0;
    categoryMissCount = 0;
    burgerDelegatedCount = 0;
}

export function isUrlUsed(url) {
    return usedImageUrls.has(url);
}

export function getUrlOwner(url) {
    return urlOwnerMap.get(url) || null;
}

export function getUrlPhoto(url) {
    return urlToPhotoMap.get(url) || null;
}

export function getCategoryPhotoPool(title, categoryId, desc) {
    const key = detectCategoryKey(title, categoryId, desc);
    return getStrictPool(key);
}

export function getCategoryKeyFor(title, categoryId, desc) {
    return detectCategoryKey(title, categoryId, desc);
}

export function getAllCategoryKeys() {
    return Object.keys(STRICT_CATEGORY_POOLS);
}

export function getCategoryKeyForProduct(product) {
    if (!product) return null;
    if (isBurger(product)) return 'burger';
    return detectCategoryKey(product.title, product.categoryId, product.desc);
}

export function isBurgerProduct(product) {
    return isBurger(product);
}

if (typeof window !== 'undefined') {
    window.FoodImageGenerator = {
        getImage: getDistinctFoodImage,
        refreshCatalog: refreshAllCatalogImages,
        getStats: getImageStats,
        clear: clearImageCache,
        isUrlUsed: isUrlUsed,
        getUrlOwner: getUrlOwner,
        getUrlPhoto: getUrlPhoto,
        getPool: getCategoryPhotoPool,
        getKey: getCategoryKeyFor,
        getKeyForProduct: getCategoryKeyForProduct,
        verify: verifyCategoryMatch,
        allKeys: getAllCategoryKeys,
        isBurger: isBurgerProduct
    };
}

export default {
    getDistinctFoodImage,
    refreshAllCatalogImages,
    getImageStats,
    clearImageCache,
    isUrlUsed,
    getUrlOwner,
    getUrlPhoto,
    getCategoryPhotoPool,
    getCategoryKeyFor,
    getCategoryKeyForProduct,
    verifyCategoryMatch,
    getAllCategoryKeys,
    isBurgerProduct
};