import { PrismaClient, ProTier, UserRole, CouponType, AddressTag } from '@prisma/client';

const prisma = new PrismaClient();

/* ============================================================
   داده‌های اولیه
   ============================================================ */

const SERVICE_CATEGORIES = [
  { title: 'رستوران', slug: 'restaurant', icon: 'utensils', color: 'bg-rose-50 text-rose-600', badge: '٪۳۰', sortOrder: 1 },
  { title: 'سوپرمارکت', slug: 'supermarket', icon: 'shopping-cart', color: 'bg-emerald-50 text-emerald-600', badge: 'جدید', sortOrder: 2 },
  { title: 'کافه', slug: 'cafe', icon: 'coffee', color: 'bg-amber-50 text-amber-600', badge: null, sortOrder: 3 },
  { title: 'شیرینی', slug: 'sweets', icon: 'cake-slice', color: 'bg-pink-50 text-pink-500', badge: '٪۱۵', sortOrder: 4 },
  { title: 'پروتئینی', slug: 'protein', icon: 'beef', color: 'bg-red-50 text-red-600', badge: null, sortOrder: 5 },
  { title: 'میوه', slug: 'produce', icon: 'apple', color: 'bg-green-50 text-green-600', badge: null, sortOrder: 6 },
  { title: 'داروخانه', slug: 'pharmacy', icon: 'pill', color: 'bg-sky-50 text-sky-600', badge: 'فوری', sortOrder: 7 },
  { title: 'نوشیدنی', slug: 'drinks', icon: 'cup-soda', color: 'bg-purple-50 text-purple-600', badge: null, sortOrder: 8 },
];

const PROMO_BANNERS = [
  { title: 'ارسال رایگان با لقمه پرو', subtitle: 'برای همه رستوران‌های شهر، تا پایان ماه', cta: 'فعال‌سازی', bg: 'from-purple-700 via-indigo-700 to-indigo-900', icon: 'crown', sortOrder: 1 },
  { title: 'فود پارتی هفتگی', subtitle: 'تا ۲۵٪ تخفیف روی منتخب رستوران‌ها', cta: 'مشاهده', bg: 'from-rose-600 via-pink-600 to-rose-500', icon: 'sparkles', sortOrder: 2 },
  { title: 'کد تخفیف اولین سفارش', subtitle: '۳۰٪ تخفیف تا سقف ۵۰ هزار تومان', cta: 'کپی کد', bg: 'from-amber-500 via-orange-500 to-rose-500', icon: 'gift', sortOrder: 3 },
];

const STORIES = [
  {
    title: 'حراج ویژه',
    thumbnail: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&q=80',
    sortOrder: 1,
    slides: [
      {
        type: 'promo',
        media: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=900&q=80',
        headline: 'تا ۵۰٪ تخفیف برگرهای دست‌ساز',
        subtitle: 'فست‌فود ژوبین · انواع برگرهای ذغالی همراه با سس ترافل',
        sticker: { type: 'coupon', code: 'BURGER50', discount: '٪۵۰ تخفیف' },
        cta: { label: 'سفارش سریع از فست‌فود ژوبین', action: 'vendor', targetId: 'v1' },
        sortOrder: 0,
      },
    ],
  },
  {
    title: 'ارسال اکسپرس',
    thumbnail: 'https://images.unsplash.com/photo-1526367790999-0150786686a2?w=200&q=80',
    sortOrder: 2,
    slides: [
      {
        type: 'promo',
        media: 'https://images.unsplash.com/photo-1526367790999-0150786686a2?w=900&q=80',
        headline: 'تحویل فوری کمتر از ۲۰ دقیقه',
        subtitle: 'با ناوگان اختصاصی لقمه‌باکس بدون معطلی در ساعت اوج شلوغی',
        sticker: { type: 'coupon', code: 'EXPRESS', discount: 'ارسال رایگان' },
        cta: { label: 'مشاهده سوپرمارکت‌های فوری', action: 'vendor', targetId: 'v20' },
        sortOrder: 0,
      },
    ],
  },
];

const COUPONS = [
  { code: 'SNAPP30', title: '۳۰٪ تخفیف سوپرمارکت و فست‌فود', type: CouponType.PERCENT, value: 30, min: 150000, max: 60000, days: 30 },
  { code: 'BURGER50', title: 'تخفیف ۵۰ هزار تومانی برگر', type: CouponType.FIXED, value: 50000, min: 250000, max: null, days: 12 },
  { code: 'PROFREE', title: 'ارسال رایگان لقمه پرو', type: CouponType.PERCENT, value: 100, min: 0, max: 40000, days: 93 },
  { code: 'FIRST30', title: 'کد تخفیف اولین سفارش', type: CouponType.PERCENT, value: 30, min: 100000, max: 50000, days: 90 },
  { code: 'LOGHME2026', title: 'جشنواره طلایی لقمه', type: CouponType.PERCENT, value: 40, min: 200000, max: 100000, days: 180 },
  { code: 'ERAM20', title: '۲۰٪ هدیه پیتزا ارم', type: CouponType.PERCENT, value: 20, min: 180000, max: 70000, days: 15 },
];

/* ============================================================
   ۲۰ فروشگاه
   ============================================================ */

const VENDORS_DATA = [
  {
    slug: 'v1', name: 'فست‌فود و کافه گیم ژوبین', type: 'برگر، پیتزا، سوخاری',
    dtMin: 30, dtMax: 45, fee: 35000, rating: 4.8, reviews: 1240, featured: true,
    logo: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=200&q=80',
    banner: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80',
    cats: [['همه', 'all'], ['برگرها', 'burgers'], ['پیش‌غذا', 'appetizers'], ['نوشیدنی', 'drinks']],
  },
  {
    slug: 'v2', name: 'پیتزا ساندویچ ارم', type: 'ساندویچ، پیتزا',
    dtMin: 40, dtMax: 60, fee: 25000, rating: 4.5, reviews: 850, featured: true,
    logo: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=200&q=80',
    banner: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=80',
    cats: [['همه', 'all'], ['پیتزا تنوری', 'pizza'], ['ساندویچ', 'sandwich'], ['نوشیدنی', 'drinks']],
  },
  {
    slug: 'v3', name: 'آشکده و کترینگ عمه جون', type: 'غذای سنتی، آش',
    dtMin: 20, dtMax: 35, fee: 15000, rating: 4.7, reviews: 3200, featured: false,
    logo: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=200&q=80',
    banner: 'https://images.unsplash.com/photo-1588168333986-5078d3ae3976?w=800&q=80',
    cats: [['همه', 'all'], ['آش و حلیم', 'ash'], ['غذای اصیل', 'traditional']],
  },
  {
    slug: 'v4', name: 'کباب‌سرای سنتی توسکا', type: 'غذای سنتی، کباب',
    dtMin: 45, dtMax: 55, fee: 0, rating: 4.6, reviews: 2100, featured: true,
    logo: 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=200&q=80',
    banner: 'https://images.unsplash.com/photo-1627012046423-93d39da6a8b7?w=800&q=80',
    cats: [['همه', 'all'], ['کباب', 'kebab'], ['نوشیدنی', 'drinks']],
  },
  {
    slug: 'v5', name: 'کافه باقلوا سیلوا', type: 'کافه، شیرینی',
    dtMin: 15, dtMax: 25, fee: 20000, rating: 4.1, reviews: 420, featured: false,
    logo: 'https://images.unsplash.com/photo-1559553156-2e97137af16f?w=200&q=80',
    banner: 'https://images.unsplash.com/photo-1599598425947-33002629b5fa?w=800&q=80',
    cats: [['همه', 'all'], ['شیرینی', 'sweets']],
  },
  {
    slug: 'v6', name: 'فست‌فود سهند', type: 'سوخاری، ساندویچ',
    dtMin: 25, dtMax: 40, fee: 30000, rating: 4.4, reviews: 750, featured: false,
    logo: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=200&q=80',
    banner: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=800&q=80',
    cats: [['همه', 'all'], ['ساندویچ', 'sandwich'], ['پیش‌غذا', 'appetizers']],
  },
  {
    slug: 'v7', name: 'پیتزا ناپولی ایتالیانو', type: 'پیتزا، ایتالیایی',
    dtMin: 35, dtMax: 50, fee: 40000, rating: 4.9, reviews: 1850, featured: true,
    logo: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=200&q=80',
    banner: 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=800&q=80',
    cats: [['همه', 'all'], ['پیتزا', 'pizza'], ['پیش‌غذا', 'appetizers']],
  },
  {
    slug: 'v8', name: 'رستوران سنتی نایب', type: 'غذای سنتی، کباب',
    dtMin: 40, dtMax: 60, fee: 0, rating: 4.9, reviews: 4200, featured: true,
    logo: 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=200&q=80',
    banner: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80',
    cats: [['همه', 'all'], ['کباب', 'kebab'], ['غذای اصیل', 'traditional']],
  },
  {
    slug: 'v9', name: 'برگر زغالی هاکوپیان', type: 'برگر',
    dtMin: 30, dtMax: 45, fee: 25000, rating: 4.6, reviews: 980, featured: false,
    logo: 'https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=200&q=80',
    banner: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=800&q=80',
    cats: [['همه', 'all'], ['برگر', 'burgers']],
  },
  {
    slug: 'v10', name: 'خانه کیک و شیرینی الف', type: 'کافه و بیکری',
    dtMin: 20, dtMax: 30, fee: 15000, rating: 4.8, reviews: 1350, featured: false,
    logo: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=200&q=80',
    banner: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=800&q=80',
    cats: [['همه', 'all'], ['کیک و شیرینی', 'sweets']],
  },
  {
    slug: 'v11', name: 'کافه لمیز', type: 'کافه و بیکری',
    dtMin: 15, dtMax: 25, fee: 20000, rating: 4.7, reviews: 2100, featured: false,
    logo: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=200&q=80',
    banner: 'https://images.unsplash.com/photo-1555507036-ab1f40ce88cb?w=800&q=80',
    cats: [['همه', 'all'], ['قهوه و نوشیدنی', 'drinks'], ['بیکری', 'sweets']],
  },
  {
    slug: 'v12', name: 'رستوران اصیل شاندیز', type: 'غذای سنتی، کباب',
    dtMin: 45, dtMax: 65, fee: 0, rating: 4.9, reviews: 3100, featured: true,
    logo: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=200&q=80',
    banner: 'https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?w=800&q=80',
    cats: [['همه', 'all'], ['کباب و شیشلیک', 'kebab'], ['غذای برنجی', 'traditional']],
  },
  {
    slug: 'v13', name: 'ساندویچ هایدا نوستالژی', type: 'ساندویچ',
    dtMin: 20, dtMax: 35, fee: 15000, rating: 4.5, reviews: 1850, featured: false,
    logo: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?w=200&q=80',
    banner: 'https://images.unsplash.com/photo-1619740455993-9e612b1af08a?w=800&q=80',
    cats: [['همه', 'all'], ['ساندویچ سرد', 'sandwich']],
  },
  {
    slug: 'v14', name: 'چلوکبابی حاج مسلم', type: 'غذای سنتی',
    dtMin: 40, dtMax: 60, fee: 25000, rating: 4.6, reviews: 2800, featured: false,
    logo: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=200&q=80',
    banner: 'https://images.unsplash.com/photo-1588168333986-5078d3ae3976?w=800&q=80',
    cats: [['همه', 'all'], ['خورشت و پلو', 'traditional'], ['کباب', 'kebab']],
  },
  {
    slug: 'v15', name: 'آش و حلیم سید مهدی', type: 'آش',
    dtMin: 15, dtMax: 30, fee: 10000, rating: 4.8, reviews: 3500, featured: false,
    logo: 'https://images.unsplash.com/photo-1560934057-04870f7f3ed6?w=200&q=80',
    banner: 'https://images.unsplash.com/photo-1627308595186-b4b3b3cbce20?w=800&q=80',
    cats: [['همه', 'all'], ['آش و حلیم', 'ash'], ['سنتی', 'traditional']],
  },
  {
    slug: 'v16', name: 'فست‌فود تاج طلایی', type: 'برگر، پیتزا',
    dtMin: 30, dtMax: 45, fee: 30000, rating: 4.4, reviews: 950, featured: false,
    logo: 'https://images.unsplash.com/photo-1615719413546-198b25453f85?w=200&q=80',
    banner: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=800&q=80',
    cats: [['همه', 'all'], ['برگر', 'burgers'], ['ساندویچ', 'sandwich']],
  },
  {
    slug: 'v17', name: 'مرغ بریان و پاچینی باربیکیو', type: 'سوخاری',
    dtMin: 35, dtMax: 50, fee: 25000, rating: 4.7, reviews: 1100, featured: false,
    logo: 'https://images.unsplash.com/photo-1524114664604-cd8133cd67ad?w=200&q=80',
    banner: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=800&q=80',
    cats: [['همه', 'all'], ['پیش‌غذا', 'appetizers'], ['بریان', 'traditional']],
  },
  {
    slug: 'v18', name: 'ریواس فود', type: 'پیتزا، ساندویچ',
    dtMin: 30, dtMax: 45, fee: 35000, rating: 4.5, reviews: 1400, featured: false,
    logo: 'https://images.unsplash.com/photo-1595854341625-f33ee10dbf94?w=200&q=80',
    banner: 'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=800&q=80',
    cats: [['همه', 'all'], ['پیتزا', 'pizza'], ['ساندویچ', 'sandwich']],
  },
  {
    slug: 'v19', name: 'کافه کباب مظفریه', type: 'کباب',
    dtMin: 40, dtMax: 55, fee: 0, rating: 4.6, reviews: 820, featured: false,
    logo: 'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=200&q=80',
    banner: 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=800&q=80',
    cats: [['همه', 'all'], ['لقمه و کباب', 'kebab']],
  },
  {
    slug: 'v20', name: 'سوپرمارکت شبانه‌روزی یاران دریان', type: 'سوپرمارکت',
    dtMin: 10, dtMax: 20, fee: 15000, rating: 4.8, reviews: 4100, featured: false,
    logo: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=200&q=80',
    banner: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800&q=80',
    cats: [['همه', 'all'], ['نوشیدنی', 'supermarket']],
  },
];

/* ============================================================
   آیتم‌های پایه برای تولید محصولات
   ============================================================ */

const BASE_ITEMS: Record<string, Array<{ title: string; price: number; discount: number; calories: number; subtype: string }>> = {
  burgers: [
    { title: 'همبرگر کلاسیک زغالی', price: 235000, discount: 10, calories: 680, subtype: 'classic' },
    { title: 'چیزبرگر دوبل با پنیر گودا', price: 310000, discount: 15, calories: 920, subtype: 'doubleSmash' },
    { title: 'ماشروم برگر ترافل', price: 285000, discount: 0, calories: 780, subtype: 'thickSirloin' },
    { title: 'چیکن برگر کریسپی', price: 245000, discount: 12, calories: 620, subtype: 'crispyChicken' },
    { title: 'برگر وگان گیاهی', price: 225000, discount: 8, calories: 520, subtype: 'vegan' },
  ],
  pizza: [
    { title: 'پیتزا پپرونی کاسه‌ای', price: 295000, discount: 12, calories: 1100, subtype: 'pepperoni' },
    { title: 'پیتزا چهار پنیر', price: 340000, discount: 15, calories: 1180, subtype: 'fourCheese' },
    { title: 'پیتزا مارگاریتا ناپلی', price: 250000, discount: 0, calories: 980, subtype: 'veggie' },
    { title: 'پیتزا استیک و قارچ', price: 390000, discount: 20, calories: 1220, subtype: 'pepperoni' },
  ],
  kebab: [
    { title: 'چلو کباب کوبیده دو سیخ', price: 360000, discount: 10, calories: 890, subtype: 'koobideh' },
    { title: 'چلو جوجه کباب زعفرانی', price: 320000, discount: 5, calories: 750, subtype: 'joojeh' },
    { title: 'چلو کباب برگ ممتاز', price: 580000, discount: 15, calories: 780, subtype: 'barg' },
    { title: 'کباب شیشلیک شاندیز', price: 690000, discount: 20, calories: 950, subtype: 'shishlik' },
  ],
  traditional: [
    { title: 'خورش قورمه سبزی با چلو', price: 245000, discount: 15, calories: 790, subtype: 'stew' },
    { title: 'قیمه نثار قزوینی', price: 290000, discount: 10, calories: 840, subtype: 'rice' },
    { title: 'ته چین مرغ زعفرانی', price: 280000, discount: 12, calories: 850, subtype: 'tahchin' },
    { title: 'شامی کباب خانگی', price: 260000, discount: 0, calories: 720, subtype: 'shami' },
  ],
  ash: [
    { title: 'آش رشته تهرانی', price: 110000, discount: 0, calories: 480, subtype: 'reshteh' },
    { title: 'حلیم گندم و گوشت', price: 135000, discount: 10, calories: 540, subtype: 'halim' },
    { title: 'آش شله قلمکار', price: 120000, discount: 8, calories: 510, subtype: 'ashShole' },
  ],
  sandwich: [
    { title: 'ساندویچ سوسیس بندری', price: 185000, discount: 12, calories: 620, subtype: 'bndari' },
    { title: 'باگت رست بیف', price: 320000, discount: 8, calories: 780, subtype: 'baguette' },
    { title: 'هات داگ تنوری چدار', price: 210000, discount: 0, calories: 680, subtype: 'hotdog' },
    { title: 'ساندویچ ژامبون سرد', price: 175000, discount: 10, calories: 590, subtype: 'coldSandwich' },
    { title: 'فیله مرغ زینگر', price: 225000, discount: 10, calories: 650, subtype: 'chickenSandwich' },
  ],
  appetizers: [
    { title: 'سیب زمینی بلژیکی', price: 145000, discount: 0, calories: 480, subtype: 'fries' },
    { title: 'بال بوفالو تند', price: 210000, discount: 12, calories: 650, subtype: 'wings' },
    { title: 'موزارلا استیکس', price: 165000, discount: 9, calories: 540, subtype: 'mozzSticks' },
    { title: 'نان سیر تنوری', price: 110000, discount: 0, calories: 410, subtype: 'garlicBread' },
  ],
  drinks: [
    { title: 'دوغ آبعلی شیشه‌ای', price: 35000, discount: 0, calories: 95, subtype: 'juice' },
    { title: 'لیموناد نعنا', price: 65000, discount: 10, calories: 120, subtype: 'lemonade' },
    { title: 'موهیتو دست ساز', price: 72000, discount: 15, calories: 140, subtype: 'mint' },
    { title: 'قهوه کلد برو', price: 110000, discount: 12, calories: 80, subtype: 'coffee' },
    { title: 'نوشابه قوطی', price: 25000, discount: 0, calories: 150, subtype: 'soda' },
  ],
  sweets: [
    { title: 'باقلوا پسته‌ای', price: 180000, discount: 10, calories: 580, subtype: 'baklava' },
    { title: 'کروسان کره‌ای فرانسوی', price: 85000, discount: 10, calories: 420, subtype: 'croissant' },
    { title: 'چیزکیک نیویورکی', price: 165000, discount: 0, calories: 510, subtype: 'cheesecake' },
    { title: 'کیک شکلاتی فاج', price: 125000, discount: 10, calories: 480, subtype: 'chocolateCake' },
  ],
  supermarket: [
    { title: 'نوشابه قوطی خنک', price: 25000, discount: 10, calories: 150, subtype: 'soda' },
    { title: 'چیپس نمکی', price: 35000, discount: 5, calories: 280, subtype: 'genericDrink' },
    { title: 'بیسکویت کرم‌دار', price: 22000, discount: 0, calories: 220, subtype: 'genericDrink' },
  ],
};

/* ============================================================
   main
   ============================================================ */

async function main() {
  console.log('🌱 شروع seed دیتابیس...\n');

  // 1) Service Categories
  for (const s of SERVICE_CATEGORIES) {
    await prisma.serviceCategory.upsert({
      where: { slug: s.slug },
      update: { title: s.title, icon: s.icon, color: s.color, badge: s.badge ?? undefined, sortOrder: s.sortOrder, isActive: true },
      create: { title: s.title, slug: s.slug, icon: s.icon, color: s.color, badge: s.badge ?? undefined, sortOrder: s.sortOrder, isActive: true },
    });
  }
  console.log(`✅ ${SERVICE_CATEGORIES.length} سرویس ساخته شد`);

  // 2) Promo Banners
  for (const b of PROMO_BANNERS) {
    await prisma.promoBanner.create({
      data: { title: b.title, subtitle: b.subtitle, cta: b.cta, bg: b.bg, icon: b.icon, sortOrder: b.sortOrder, isActive: true },
    });
  }
  console.log(`✅ ${PROMO_BANNERS.length} بنر ساخته شد`);

  // 3) Stories
  for (const st of STORIES) {
    await prisma.story.create({
      data: {
        title: st.title,
        thumbnail: st.thumbnail,
        sortOrder: st.sortOrder,
        isActive: true,
        slides: {
          create: st.slides.map(sl => ({
            type: sl.type,
            media: sl.media,
            headline: sl.headline,
            subtitle: sl.subtitle,
            sticker: sl.sticker ?? undefined,
            cta: sl.cta ?? undefined,
            sortOrder: sl.sortOrder,
          })),
        },
      },
    });
  }
  console.log(`✅ ${STORIES.length} استوری ساخته شد`);

  // 4) Default user + wallet + membership + addresses
  const user = await prisma.user.upsert({
    where: { phone: '09123456789' },
    update: {
      fullName: 'سید ارمیا مفیدی',
      email: 'ermia.mofidi@gmail.com',
      isPhoneVerified: true,
    },
    create: {
      phone: '09123456789',
      fullName: 'سید ارمیا مفیدی',
      email: 'ermia.mofidi@gmail.com',
      role: UserRole.CUSTOMER,
      isPhoneVerified: true,
      birthDay: '22',
      birthMonth: '03',
      birthYear: '1380',
      wallet: { create: { balance: BigInt(1250000) } },
      membership: { create: { tier: ProTier.PRO, proAutoRenew: true, expiresAt: new Date('2027-01-01') } },
      addresses: {
        create: [
          {
            province: 'تهران', city: 'تهران',
            text: 'تهران، سعادت‌آباد، خیابان سرو غربی، پلاک ۲۴',
            pelak: '24', unit: '3', postalCode: '1998765432',
            receiverName: 'سید ارمیا مفیدی',
            receiverPhone: '09123456789',
            tag: AddressTag.HOME,
            icon: 'home',
            isDefault: true,
            latitude: 35.786, longitude: 51.374,
          },
          {
            province: 'تهران', city: 'تهران',
            text: 'تهران، میدان ونک، خیابان ملاصدرا، پلاک ۸۲',
            receiverName: 'سید ارمیا مفیدی',
            receiverPhone: '09123456789',
            tag: AddressTag.WORK,
            icon: 'briefcase',
            isDefault: false,
            latitude: 35.757, longitude: 51.409,
          },
        ],
      },
    },
  });
  console.log(`✅ کاربر پیش‌فرض: ${user.phone} (id: ${user.id})`);

  // 5) Courier user
  const courier = await prisma.user.upsert({
    where: { phone: '09399999999' },
    update: { fullName: 'رضا محمدی' },
    create: {
      phone: '09399999999',
      fullName: 'رضا محمدی',
      role: UserRole.COURIER,
      isPhoneVerified: true,
      wallet: { create: { balance: BigInt(0) } },
      membership: { create: { tier: ProTier.FREE, proAutoRenew: false } },
      courier: {
        create: {
          vehicle: 'موتور سیکلت',
          plate: '۱۲ ب ۳۴۵ ایران ۲۲',
          currentLat: 35.7920,
          currentLon: 51.3680,
          isAvailable: true,
        },
      },
    },
  });
  console.log(`✅ کاربر پیک: ${courier.phone}`);

  // 6) Coupons
  for (const cp of COUPONS) {
    const expiresAt = new Date(Date.now() + cp.days * 86400_000);
    await prisma.coupon.upsert({
      where: { code: cp.code },
      update: {
        value: cp.value,
        minOrderValue: BigInt(cp.min),
        maxDiscount: cp.max ? BigInt(cp.max) : null,
        expiresAt,
      },
      create: {
        code: cp.code,
        title: cp.title,
        type: cp.type,
        value: cp.value,
        minOrderValue: BigInt(cp.min),
        maxDiscount: cp.max ? BigInt(cp.max) : null,
        isActive: true,
        expiresAt,
      },
    });
  }
  console.log(`✅ ${COUPONS.length} کوپن ساخته شد`);

  // 7) Vendors + categories + products
  let totalProducts = 0;
  for (const v of VENDORS_DATA) {
    const vendor = await prisma.vendor.create({
      data: {
        name: v.name,
        slug: v.slug,
        type: v.type,
        logoUrl: v.logo,
        bannerUrl: v.banner,
        status: 'ACTIVE',
        isFeatured: v.featured,
        rating: v.rating,
        reviews: v.reviews,
        deliveryFee: BigInt(v.fee),
        deliveryTimeMin: v.dtMin,
        deliveryTimeMax: v.dtMax,
        latitude: 35.7860 + (Math.random() - 0.5) * 0.05,
        longitude: 51.3740 + (Math.random() - 0.5) * 0.05,
      },
    });

    const categoryMap = new Map<string, string>();
    for (let i = 0; i < v.cats.length; i++) {
      const [title, slug] = v.cats[i];
      const cat = await prisma.vendorCategory.create({
        data: { vendorId: vendor.id, title, slug, sortOrder: i },
      });
      categoryMap.set(slug, cat.id);
    }

    // Generate 6-10 products per vendor
    const catSlugs = v.cats.map(c => c[1]).filter(s => s !== 'all');
    let productCount = 0;
    for (const catSlug of catSlugs) {
      const items = BASE_ITEMS[catSlug] || BASE_ITEMS.burgers;
      for (const item of items) {
        const originalPrice = item.discount > 0
          ? Math.round(item.price / (1 - item.discount / 100))
          : item.price;

        await prisma.product.create({
          data: {
            vendorId: vendor.id,
            categoryId: categoryMap.get(catSlug) || null,
            title: item.title,
            description: `تهیه شده با مواد اولیه درجه یک در ${v.name}`,
            imageUrl: `https://picsum.photos/seed/${v.slug}-${productCount}/600/400`,
            price: BigInt(item.price),
            originalPrice: BigInt(originalPrice),
            discountPct: item.discount,
            stockLeft: 20,
            rating: 4.7,
            reviews: 45,
            isActive: true,
            subtype: item.subtype,
            calories: item.calories,
            threeDMeta: {
              create: {
                modelUrl: `/models/${item.subtype}.glb`,
                metaJson: { layers: 5, color: '#FF4747' },
              },
            },
          },
        });
        productCount++;
        totalProducts++;
      }
    }
  }
  console.log(`✅ ${VENDORS_DATA.length} فروشگاه و ${totalProducts} محصول ساخته شد`);

  console.log('\n🎉 Seed کامل شد!');
}

main()
  .catch((e) => {
    console.error('❌ خطا در seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });