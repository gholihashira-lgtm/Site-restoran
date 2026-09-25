const vendors = [
    {
        id: 'v1', name: 'فست‌فود و کافه گیم ژوبین', type: 'برگر، پیتزا، سوخاری', deliveryTime: '۳۰ تا ۴۵ دقیقه', deliveryFee: 35000, rating: 4.8, reviews: 1240,
        logo: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=200&q=80', banner: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80',
        categories: [{ id: 'all', title: 'همه' }, { id: 'burgers', title: 'برگرها' }, { id: 'appetizers', title: 'پیش‌غذا' }, { id: 'drinks', title: 'نوشیدنی' }]
    },
    {
        id: 'v2', name: 'پیتزا ساندویچ ارم', type: 'ساندویچ، پیتزا', deliveryTime: '۴۰ تا ۶۰ دقیقه', deliveryFee: 25000, rating: 4.5, reviews: 850,
        logo: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=200&q=80', banner: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=80',
        categories: [{ id: 'all', title: 'همه' }, { id: 'pizza', title: 'پیتزا تنوری' }, { id: 'sandwich', title: 'ساندویچ نوستالژی' }, { id: 'drinks', title: 'نوشیدنی' }]
    },
    {
        id: 'v3', name: 'آشکده و کترینگ عمه جون', type: 'غذای سنتی ایرانی، آش', deliveryTime: '۲۰ تا ۳۵ دقیقه', deliveryFee: 15000, rating: 4.7, reviews: 3200,
        logo: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=200&q=80', banner: 'https://images.unsplash.com/photo-1588168333986-5078d3ae3976?w=800&q=80',
        categories: [{ id: 'all', title: 'همه' }, { id: 'ash', title: 'آش و حلیم' }, { id: 'traditional', title: 'غذاهای اصیل' }]
    },
    {
        id: 'v4', name: 'کباب‌سرای سنتی توسکا', type: 'غذای سنتی ایرانی، کباب', deliveryTime: '۴۵ تا ۵۵ دقیقه', deliveryFee: 0, rating: 4.6, reviews: 2100,
        logo: 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=200&q=80', banner: 'https://images.unsplash.com/photo-1627012046423-93d39da6a8b7?w=800&q=80',
        categories: [{ id: 'all', title: 'همه' }, { id: 'kebab', title: 'کباب‌ها' }, { id: 'drinks', title: 'نوشیدنی سنتی' }]
    },
    {
        id: 'v5', name: 'کافه باقلوا سیلوا', type: 'کافه، شیرینی و دسر', deliveryTime: '۱۵ تا ۲۵ دقیقه', deliveryFee: 20000, rating: 4.1, reviews: 420,
        logo: 'https://images.unsplash.com/photo-1559553156-2e97137af16f?w=200&q=80', banner: 'https://images.unsplash.com/photo-1599598425947-33002629b5fa?w=800&q=80',
        categories: [{ id: 'all', title: 'همه' }, { id: 'sweets', title: 'شیرینی و باقلوا' }]
    },
    {
        id: 'v6', name: 'فست‌فود سهند', type: 'سوخاری، ساندویچ', deliveryTime: '۲۵ تا ۴۰ دقیقه', deliveryFee: 30000, rating: 4.4, reviews: 750,
        logo: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=200&q=80', banner: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=800&q=80',
        categories: [{ id: 'all', title: 'همه' }, { id: 'sandwich', title: 'ساندویچ و سوخاری' }, { id: 'appetizers', title: 'پیش‌غذا' }]
    },
    {
        id: 'v7', name: 'پیتزا ناپولی ایتالیانو', type: 'پیتزا، غذای ایتالیایی', deliveryTime: '۳۵ تا ۵۰ دقیقه', deliveryFee: 40000, rating: 4.9, reviews: 1850,
        logo: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=200&q=80', banner: 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=800&q=80',
        categories: [{ id: 'all', title: 'همه' }, { id: 'pizza', title: 'پیتزا ناپلی' }, { id: 'appetizers', title: 'پیش‌غذا' }]
    },
    {
        id: 'v8', name: 'رستوران سنتی نایب', type: 'غذای سنتی ایرانی، کباب', deliveryTime: '۴۰ تا ۶۰ دقیقه', deliveryFee: 0, rating: 4.9, reviews: 4200,
        logo: 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=200&q=80', banner: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80',
        categories: [{ id: 'all', title: 'همه' }, { id: 'kebab', title: 'کباب اعلا' }, { id: 'traditional', title: 'غذای اصیل' }, { id: 'drinks', title: 'نوشیدنی' }]
    },
    {
        id: 'v9', name: 'برگر زغالی هاکوپیان', type: 'برگر، فست‌فود', deliveryTime: '۳۰ تا ۴۵ دقیقه', deliveryFee: 25000, rating: 4.6, reviews: 980,
        logo: 'https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=200&q=80', banner: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=800&q=80',
        categories: [{ id: 'all', title: 'همه' }, { id: 'burgers', title: 'برگر زغالی' }]
    },
    {
        id: 'v10', name: 'خانه کیک و شیرینی الف', type: 'کافه و بیکری', deliveryTime: '۲۰ تا ۳۰ دقیقه', deliveryFee: 15000, rating: 4.8, reviews: 1350,
        logo: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=200&q=80', banner: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=800&q=80',
        categories: [{ id: 'all', title: 'همه' }, { id: 'sweets', title: 'کیک و شیرینی' }]
    },
    {
        id: 'v11', name: 'کافه لمیز', type: 'کافه و بیکری', deliveryTime: '۱۵ تا ۲۵ دقیقه', deliveryFee: 20000, rating: 4.7, reviews: 2100,
        logo: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=200&q=80', banner: 'https://images.unsplash.com/photo-1555507036-ab1f40ce88cb?w=800&q=80',
        categories: [{ id: 'all', title: 'همه' }, { id: 'drinks', title: 'قهوه و نوشیدنی' }, { id: 'sweets', title: 'بیکری' }]
    },
    {
        id: 'v12', name: 'رستوران اصیل شاندیز', type: 'غذای سنتی ایرانی، کباب', deliveryTime: '۴۵ تا ۶۵ دقیقه', deliveryFee: 0, rating: 4.9, reviews: 3100,
        logo: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=200&q=80', banner: 'https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?w=800&q=80',
        categories: [{ id: 'all', title: 'همه' }, { id: 'kebab', title: 'کباب و شیشلیک' }, { id: 'traditional', title: 'غذاهای برنجی' }]
    },
    {
        id: 'v13', name: 'ساندویچ هایدا نوستالژی', type: 'ساندویچ، فست‌فود', deliveryTime: '۲۰ تا ۳۵ دقیقه', deliveryFee: 15000, rating: 4.5, reviews: 1850,
        logo: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?w=200&q=80', banner: 'https://images.unsplash.com/photo-1619740455993-9e612b1af08a?w=800&q=80',
        categories: [{ id: 'all', title: 'همه' }, { id: 'sandwich', title: 'ساندویچ سرد' }]
    },
    {
        id: 'v14', name: 'چلوکبابی حاج مسلم', type: 'غذای سنتی ایرانی', deliveryTime: '۴۰ تا ۶۰ دقیقه', deliveryFee: 25000, rating: 4.6, reviews: 2800,
        logo: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=200&q=80', banner: 'https://images.unsplash.com/photo-1588168333986-5078d3ae3976?w=800&q=80',
        categories: [{ id: 'all', title: 'همه' }, { id: 'traditional', title: 'خورشت و پلو' }, { id: 'kebab', title: 'کباب سنتی' }]
    },
    {
        id: 'v15', name: 'آش و حلیم سید مهدی', type: 'غذای سنتی ایرانی، آش', deliveryTime: '۱۵ تا ۳۰ دقیقه', deliveryFee: 10000, rating: 4.8, reviews: 3500,
        logo: 'https://images.unsplash.com/photo-1560934057-04870f7f3ed6?w=200&q=80', banner: 'https://images.unsplash.com/photo-1627308595186-b4b3b3cbce20?w=800&q=80',
        categories: [{ id: 'all', title: 'همه' }, { id: 'ash', title: 'آش و حلیم' }, { id: 'traditional', title: 'صبحانه و عصرانه' }]
    },
    {
        id: 'v16', name: 'فست‌فود تاج طلایی', type: 'برگر، پیتزا، سوخاری', deliveryTime: '۳۰ تا ۴۵ دقیقه', deliveryFee: 30000, rating: 4.4, reviews: 950,
        logo: 'https://images.unsplash.com/photo-1615719413546-198b25453f85?w=200&q=80', banner: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=800&q=80',
        categories: [{ id: 'all', title: 'همه' }, { id: 'burgers', title: 'برگر ویژه' }, { id: 'sandwich', title: 'هات‌داگ' }]
    },
    {
        id: 'v17', name: 'مرغ بریان و پاچینی باربیکیو', type: 'سوخاری، غذای ایرانی', deliveryTime: '۳۵ تا ۵۰ دقیقه', deliveryFee: 25000, rating: 4.7, reviews: 1100,
        logo: 'https://images.unsplash.com/photo-1524114664604-cd8133cd67ad?w=200&q=80', banner: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=800&q=80',
        categories: [{ id: 'all', title: 'همه' }, { id: 'appetizers', title: 'پاچینی و بال' }, { id: 'traditional', title: 'بریان' }]
    },
    {
        id: 'v18', name: 'ریواس فود', type: 'پیتزا، ساندویچ', deliveryTime: '۳۰ تا ۴۵ دقیقه', deliveryFee: 35000, rating: 4.5, reviews: 1400,
        logo: 'https://images.unsplash.com/photo-1595854341625-f33ee10dbf94?w=200&q=80', banner: 'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=800&q=80',
        categories: [{ id: 'all', title: 'همه' }, { id: 'pizza', title: 'پیتزا مخصوص' }, { id: 'sandwich', title: 'ساندویچ ویژه' }]
    },
    {
        id: 'v19', name: 'کافه کباب مظفریه', type: 'غذای سنتی ایرانی، کباب', deliveryTime: '۴۰ تا ۵۵ دقیقه', deliveryFee: 0, rating: 4.6, reviews: 820,
        logo: 'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=200&q=80', banner: 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=800&q=80',
        categories: [{ id: 'all', title: 'همه' }, { id: 'kebab', title: 'لقمه و کباب' }]
    },
    {
        id: 'v20', name: 'سوپرمارکت شبانه‌روزی یاران دریان', type: 'سوپرمارکت', deliveryTime: '۱۰ تا ۲۰ دقیقه', deliveryFee: 15000, rating: 4.8, reviews: 4100,
        logo: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=200&q=80', banner: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800&q=80',
        categories: [{ id: 'all', title: 'همه' }, { id: 'supermarket', title: 'نوشیدنی و تنقلات' }]
    },
    {
        id: 'v_sweets', name: 'کافه باقلوا سیلوا', type: 'شیرینی، کافه', deliveryTime: '۲۵ دقیقه', deliveryFee: 20300, rating: 4.4, reviews: 500,
        logo: 'https://images.unsplash.com/photo-1559553156-2e97137af16f?w=200&q=80', banner: 'https://images.unsplash.com/photo-1559553156-2e97137af16f?w=800&q=80',
        categories: [{ id: 'all', title: 'همه' }, { id: 'sweets', title: 'شیرینی' }]
    }
];

const baseCatalogProducts = [
    { id: 1, vendorId: 'v1', categoryId: 'burgers', title: 'برگر کلاسیک دست‌ساز ژوبین', desc: 'پتی برگر ۱۰۰ گرمی، کاهو، گوجه، خیارشور و سس مخصوص', price: 288000, originalPrice: 320000, discount: 10, stockLeft: 7, rating: 4.8, reviews: 312, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&q=80', addons: [{ id: 'a1', title: 'پنیر چدار اضافه', price: 25000 }] },
    { id: 2, vendorId: 'v1', categoryId: 'burgers', title: 'دوبل چیزبرگر اسمش گودا', desc: 'دو پتی گوشت ۱۲۰ گرمی اسمش‌شده، پنیر گودا ذوب‌شده، پیاز کاراملی', price: 385000, originalPrice: 440000, discount: 12, stockLeft: 5, rating: 4.9, reviews: 580, image: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=500&q=80', addons: [{ id: 'a2', title: 'بیکن تنوری', price: 35000 }] },
    { id: 3, vendorId: 'v9', categoryId: 'burgers', title: 'ماشروم برگر ترافل', desc: 'پتی گوشت ۱۵۰ گرمی ضخیم، قارچ تفت داده شده با سس ترافل و پنیر موزارلا', price: 340000, originalPrice: 340000, discount: 0, stockLeft: 10, rating: 4.7, reviews: 240, image: 'https://images.unsplash.com/photo-1594212699903-eca40af73ca9?w=500&q=80', addons: [] },
    { id: 4, vendorId: 'v9', categoryId: 'burgers', title: 'بیکن چیزبرگر چدار', desc: 'برگر زغالی دودی با دو لایه بیکن کریسپی، چدار ذوب شده و کاهو پیچ', price: 395000, originalPrice: 420000, discount: 6, stockLeft: 4, rating: 4.9, reviews: 620, image: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=500&q=80', addons: [] },
    { id: 5, vendorId: 'v16', categoryId: 'burgers', title: 'همبرگر زغالی اسموکی باربیکیو', desc: 'پتی کباب شده روی زغال طبیعی، سس باربیکیو دودی، پیاز سوخاری ترد', price: 275000, originalPrice: 310000, discount: 11, stockLeft: 15, rating: 4.5, reviews: 180, image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=500&q=80', addons: [] },
    { id: 6, vendorId: 'v16', categoryId: 'burgers', title: 'چیکن برگر سوخاری کریسپی', desc: 'سینه مرغ سوخاری پولکی طلایی، سس تارتار دست‌ساز، کاهو پیچ، نان مک', price: 230000, originalPrice: 230000, discount: 0, stockLeft: 8, rating: 4.6, reviews: 315, image: 'https://images.unsplash.com/photo-1615719413546-198b25453f85?w=500&q=80', addons: [] },
    { id: 7, vendorId: 'v1', categoryId: 'burgers', title: 'چیل برگر تند مکزیکی', desc: 'پتی گوشت تند مکزیکی، حلقه‌های هالوپینو، سس سالسا آتشین، پنیر فلفلی', price: 310000, originalPrice: 345000, discount: 10, stockLeft: 12, rating: 4.4, reviews: 112, image: 'https://images.unsplash.com/photo-1605333314051-7871b69d95f8?w=500&q=80', addons: [] },
    { id: 8, vendorId: 'v16', categoryId: 'burgers', title: 'مینی اسلایدر سه تایی', desc: 'سه عدد مینی برگر دست‌ساز با طعم‌های متنوع: کلاسیک، چیزبرگر و ماشروم', price: 380000, originalPrice: 400000, discount: 5, stockLeft: 6, rating: 4.8, reviews: 450, image: 'https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=500&q=80', addons: [] },
    { id: 9, vendorId: 'v2', categoryId: 'sandwich', title: 'ساندویچ سوسیس بندری تند', desc: 'سوسیس آلمانی مرغوب، پیاز داغ فراوان، رب محلی تفت‌خورده، ادویه جنوبی', price: 185000, originalPrice: 210000, discount: 12, stockLeft: 8, rating: 4.6, reviews: 850, image: 'https://images.unsplash.com/photo-1619740455993-9e612b1af08a?w=500&q=80', addons: [] },
    { id: 10, vendorId: 'v2', categoryId: 'sandwich', title: 'باگت رست بیف ویژه', desc: 'گوشت رست بیف ریش ریش طعم‌دار شده، قارچ و پنیر گودا در نان باگت کنجدی', price: 320000, originalPrice: 350000, discount: 8, stockLeft: 3, rating: 4.8, reviews: 920, image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=500&q=80', addons: [] },
    { id: 11, vendorId: 'v6', categoryId: 'sandwich', title: 'هات‌داگ تنوری پنیری', desc: 'هات داگ ۷۰ درصد گوشت تنوری، خوراک قارچ، پنیر کش‌دار موزارلا', price: 210000, originalPrice: 210000, discount: 0, stockLeft: 14, rating: 4.4, reviews: 340, image: 'https://images.unsplash.com/photo-1590165482129-1b8b27698780?w=500&q=80', addons: [] },
    { id: 12, vendorId: 'v13', categoryId: 'sandwich', title: 'ساندویچ ژامبون سرد هایدا', desc: 'ژامبون گوشت و مرغ تنوری، سس مایونز فراوان، گوجه، خیارشور و چیپس ترد', price: 175000, originalPrice: 195000, discount: 10, stockLeft: 20, rating: 4.7, reviews: 1500, image: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?w=500&q=80', addons: [] },
    { id: 13, vendorId: 'v6', categoryId: 'sandwich', title: 'ساندویچ فیله مرغ زینگر', desc: 'فیله مرغ سوخاری اسپایسی، کاهو پیچ تازه، گوجه‌فرنگی، سس تند فرانسوی', price: 225000, originalPrice: 250000, discount: 10, stockLeft: 9, rating: 4.6, reviews: 410, image: 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=500&q=80', addons: [] },
    { id: 14, vendorId: 'v18', categoryId: 'sandwich', title: 'ساندویچ مغز و زبان گوساله', desc: 'مغز و زبان گوساله تازه پخته‌شده، سس خردل، لیمو ترش، جعفری و پیاز قرمز', price: 390000, originalPrice: 390000, discount: 0, stockLeft: 4, rating: 4.8, reviews: 290, image: 'https://images.unsplash.com/photo-1627308595229-7830f5c9c66e?w=500&q=80', addons: [] },
    { id: 15, vendorId: 'v2', categoryId: 'pizza', title: 'پیتزا پپرونی تنوری', desc: 'خمیر دست‌ساز ناپلی، پپرونی ۹۰٪ کاسه‌ای، هالوپینو مکزیکی، موزارلا کش‌دار', price: 320000, originalPrice: 380000, discount: 15, stockLeft: 4, rating: 4.8, reviews: 620, image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=500&q=80', addons: [{ id: 'a3', title: 'پنیر دور خمیر', price: 45000 }] },
    { id: 16, vendorId: 'v7', categoryId: 'pizza', title: 'پیتزا روستیکا گوشت و قارچ', desc: 'گوشت چرخ‌کرده مزه‌دار شده، قارچ صدفی، فلفل دلمه‌ای، زیتون سیاه، پنیر ویژه', price: 360000, originalPrice: 400000, discount: 10, stockLeft: 6, rating: 4.5, reviews: 480, image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500&q=80', addons: [] },
    { id: 17, vendorId: 'v7', categoryId: 'pizza', title: 'پیتزا سیر و استیک اعلا', desc: 'تکه‌های راسته گوساله گریل‌شده، سس سیر رست شده، قارچ تازه، پنیر پارمزان', price: 420000, originalPrice: 420000, discount: 0, stockLeft: 5, rating: 4.9, reviews: 710, image: 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=500&q=80', addons: [] },
    { id: 18, vendorId: 'v7', categoryId: 'pizza', title: 'پیتزا کواترو فورماژی (چهار پنیر)', desc: 'پنیر گورگونزولا، موزارلا، پارمزان، چدار ذوب‌شده با پایه سس آلفردو خامه', price: 385000, originalPrice: 425000, discount: 9, stockLeft: 8, rating: 4.7, reviews: 330, image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&q=80', addons: [] },
    { id: 19, vendorId: 'v18', categoryId: 'pizza', title: 'پیتزا چیکن باربیکیو', desc: 'فیله مرغ گریل شده با ادویه مخصوص، سس باربیکیو دودی، پیاز بنفش، گشنیز', price: 340000, originalPrice: 380000, discount: 10, stockLeft: 7, rating: 4.6, reviews: 410, image: 'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=500&q=80', addons: [] },
    { id: 20, vendorId: 'v7', categoryId: 'pizza', title: 'پیتزا مارگاریتا ایتالیایی', desc: 'سس گوجه سن مارزانو، برگ‌های ریحان تازه جنوا، پنیر فیور دی لاته بوفالو', price: 250000, originalPrice: 250000, discount: 0, stockLeft: 12, rating: 4.4, reviews: 520, image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=500&q=80', addons: [] },
    { id: 21, vendorId: 'v18', categoryId: 'pizza', title: 'پیتزا مخصوص ریواس', desc: 'ترکیب کامل ژامبون، کوکتل دودی، قارچ، فلفل دلمه، پنیر کش‌دار و زیتون سیاه', price: 330000, originalPrice: 390000, discount: 15, stockLeft: 10, rating: 4.3, reviews: 680, image: 'https://images.unsplash.com/photo-1595854341625-f33ee10dbf94?w=500&q=80', addons: [] },
    { id: 22, vendorId: 'v7', categoryId: 'pizza', title: 'پیتزا دیالووا (تند)', desc: 'سالامی تند ایتالیایی برشته، پرک فلفل چیلی خشک، سس تند مارینارا، پنیر کش‌دار', price: 375000, originalPrice: 395000, discount: 5, stockLeft: 4, rating: 4.8, reviews: 290, image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=500&q=80', addons: [] },
    { id: 23, vendorId: 'v4', categoryId: 'kebab', title: 'چلو کباب کوبیده گوسفندی', desc: 'دو سیخ کوبیده ۱۲۰ گرمی مخلوط، برنج زعفرانی ایرانی، گوجه کبابی و کره محلی', price: 450000, originalPrice: 510000, discount: 11, stockLeft: 9, rating: 4.6, reviews: 2100, image: 'https://images.unsplash.com/photo-1627012046423-93d39da6a8b7?w=500&q=80', addons: [{ id: 'a4', title: 'کره محلی اضافه', price: 15000 }] },
    { id: 24, vendorId: 'v4', categoryId: 'kebab', title: 'جوجه کباب زعفرانی با استخوان', desc: 'جوجه کامل مرینیت شده در پیاز و زعفران ناب قائنات، چلو کره و گوجه کبابی', price: 390000, originalPrice: 390000, discount: 0, stockLeft: 6, rating: 4.7, reviews: 850, image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=500&q=80', addons: [] },
    { id: 25, vendorId: 'v8', categoryId: 'kebab', title: 'چلو کباب برگ ممتاز', desc: 'یک سیخ راسته گوسفندی اعلا طعم‌دار شده با پیاز و انجیر، برنج طارم درجه یک', price: 650000, originalPrice: 720000, discount: 9, stockLeft: 3, rating: 4.9, reviews: 1120, image: 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=500&q=80', addons: [] },
    { id: 26, vendorId: 'v12', categoryId: 'kebab', title: 'شیشلیک مخصوص شاندیز', desc: 'شش تکه دنده گوسفندی اصیل مرینیت شده با فلفل سیاه و پیاز، پلو زعفرانی، دورچین', price: 890000, originalPrice: 950000, discount: 6, stockLeft: 2, rating: 4.9, reviews: 2300, image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500&q=80', addons: [] },
    { id: 27, vendorId: 'v14', categoryId: 'traditional', title: 'ته چین مرغ زعفرانی', desc: 'برنج طارم دم‌کشیده، سینه مرغ ریش ریش پخته، ماست چکیده، زرشک تازه و خلال پسته', price: 280000, originalPrice: 320000, discount: 12, stockLeft: 5, rating: 4.8, reviews: 670, image: 'https://images.unsplash.com/photo-1588168333986-5078d3ae3976?w=500&q=80', addons: [] },
    { id: 28, vendorId: 'v14', categoryId: 'traditional', title: 'قورمه سبزی اصیل جاافتاده', desc: 'خورشت قورمه سبزی روغن‌انداخته با گوشت گوسفندی تازه، لیمو عمانی، برنج کته ایرانی', price: 260000, originalPrice: 260000, discount: 0, stockLeft: 10, rating: 4.6, reviews: 1400, image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=500&q=80', addons: [] },
    { id: 29, vendorId: 'v12', categoryId: 'traditional', title: 'قیمه نثار ویژه قزوین', desc: 'برنج زعفرانی، تکه‌های راسته گوسفندی، خلال بادام شیرین، پسته، زرشک اعلا و هل و گلاب', price: 340000, originalPrice: 380000, discount: 10, stockLeft: 4, rating: 4.9, reviews: 890, image: 'https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?w=500&q=80', addons: [] },
    { id: 30, vendorId: 'v19', categoryId: 'kebab', title: 'کباب چنجه گوساله پشتی', desc: 'سیخ چنجه طعم‌دار شده با ماست موسیر و فلفل سیاه، دورچین سبزی ریحان، نان داغ تنوری', price: 420000, originalPrice: 420000, discount: 0, stockLeft: 7, rating: 4.5, reviews: 340, image: 'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=500&q=80', addons: [] },
    { id: 31, vendorId: 'v3', categoryId: 'ash', title: 'آش رشته سنتی عمه جون', desc: 'آش رشته غلیظ یک کیلویی، حبوبات کامل، سبزی کوهی، کشک محلی، پیازداغ و نعناداغ فراوان', price: 155000, originalPrice: 180000, discount: 14, stockLeft: 15, rating: 4.9, reviews: 1450, image: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=500&q=80', addons: [] },
    { id: 32, vendorId: 'v15', categoryId: 'ash', title: 'حلیم گوشت گوسفندی با دارچین', desc: 'یک کیلو حلیم گندم کامل و گوشت گوسفندی کش‌دار، همراه با روغن کرمانشاهی و پودر دارچین', price: 170000, originalPrice: 190000, discount: 10, stockLeft: 12, rating: 4.8, reviews: 2100, image: 'https://images.unsplash.com/photo-1560934057-04870f7f3ed6?w=500&q=80', addons: [] },
    { id: 33, vendorId: 'v3', categoryId: 'traditional', title: 'کشک بادمجان اصیل با گردو', desc: 'بادمجان کبابی ساطوری شده، گردو خرد شده تازه، کشک غلیظ محلی، پیاز داغ ترد، نان سنگک', price: 195000, originalPrice: 195000, discount: 0, stockLeft: 6, rating: 4.7, reviews: 920, image: 'https://images.unsplash.com/photo-1588168333986-5078d3ae3976?w=500&q=80', addons: [] },
    { id: 34, vendorId: 'v15', categoryId: 'traditional', title: 'میرزاقاسمی شمالی گیلکی', desc: 'بادمجان دودی تنوری روی زغال، سیر تازه فراوان، تخم مرغ محلی، پوره گوجه فرنگی سرخ شده', price: 165000, originalPrice: 185000, discount: 10, stockLeft: 8, rating: 4.6, reviews: 540, image: 'https://images.unsplash.com/photo-1627308595186-b4b3b3cbce20?w=500&q=80', addons: [] },
    { id: 35, vendorId: 'v1', categoryId: 'appetizers', title: 'سیب‌زمینی بلژیکی با دیپ چدار', desc: 'سیب‌زمینی سرخ‌کرده ترد ادویه‌دار بلژیکی، سس چدار گرم و غلیظ، بیکن گوشت دودی خرد شده', price: 190000, originalPrice: 190000, discount: 0, stockLeft: 12, rating: 4.7, reviews: 420, image: 'https://images.unsplash.com/photo-1585109649139-366815a0d713?w=500&q=80', addons: [] },
    { id: 36, vendorId: 'v6', categoryId: 'appetizers', title: 'موزارلا استیکس سوخاری کش‌دار', desc: '۶ قطعه پنیر موزارلا سوخاری شده با آرد پانکو ژاپنی، سرو همراه با دیپ سس مارینارا دست‌ساز', price: 145000, originalPrice: 160000, discount: 9, stockLeft: 9, rating: 4.5, reviews: 310, image: 'https://images.unsplash.com/photo-1534080564583-6be75777b70a?w=500&q=80', addons: [] },
    { id: 37, vendorId: 'v17', categoryId: 'appetizers', title: 'بال و کتف بوفالو تند', desc: '۸ تکه بال و کتف کباب شده در سس تند بوفالو و سرکه، سرو شده با سس بلو چیز و کرفس', price: 210000, originalPrice: 240000, discount: 12, stockLeft: 5, rating: 4.8, reviews: 680, image: 'https://images.unsplash.com/photo-1524114664604-cd8133cd67ad?w=500&q=80', addons: [] },
    { id: 38, vendorId: 'v7', categoryId: 'appetizers', title: 'نان سیر تنوری ایتالیایی', desc: 'خمیر نازک پیتزا پخته در تنور، روغن زیتون بکر، سیر رنده شده تازه، جعفری و پنیر پارمزان', price: 110000, originalPrice: 110000, discount: 0, stockLeft: 14, rating: 4.4, reviews: 290, image: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=500&q=80', addons: [] },
    { id: 39, vendorId: 'v5', categoryId: 'sweets', title: 'باقلوا نعلی گردویی ۳ عدد', desc: 'باقلوا فرم نعلی استانبولی پخته شده با کره حیوانی، مغز گردو درجه یک، و شربت غلیظ زعفران', price: 96000, originalPrice: 120000, discount: 20, stockLeft: 5, rating: 4.1, reviews: 120, image: 'https://images.unsplash.com/photo-1599598425947-33002629b5fa?w=500&q=80', addons: [] },
    { id: 40, vendorId: 'v5', categoryId: 'sweets', title: 'باقلوا پیتزایی پسته ۳ عدد', desc: 'باقلوا با فرم برشی پیتزایی پر شده با پودر پسته اعلا سبز رفسنجان و کره حیوانی خالص', price: 157250, originalPrice: 185000, discount: 15, stockLeft: 2, rating: 4.8, reviews: 95, image: 'https://images.unsplash.com/photo-1616428784132-75d31562b772?w=500&q=80', addons: [] },
    { id: 41, vendorId: 'v10', categoryId: 'sweets', title: 'کیک شکلاتی فاج خیس', desc: 'برش کیک شکلاتی اسفنجی سه لایه با سس گاناش براق غلیظ و تکه‌های فندق برشته', price: 125000, originalPrice: 140000, discount: 10, stockLeft: 6, rating: 4.9, reviews: 540, image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&q=80', addons: [] },
    { id: 42, vendorId: 'v10', categoryId: 'sweets', title: 'شله زرد زعفرانی نذری', desc: 'یک کاسه تک نفره شله زرد پخته شده با برنج نیمدانه مرغوب طارم، زعفران خالص و خلال بادام', price: 65000, originalPrice: 65000, discount: 0, stockLeft: 12, rating: 4.6, reviews: 310, image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=500&q=80', addons: [] },
    { id: 43, vendorId: 'v11', categoryId: 'sweets', title: 'کروسان کره ای فرانسوی', desc: 'نان کروسان لایه‌ای و پوک پخته شده با کره اعلا و خمیر هزارلا، مناسب برای سرو کنار قهوه', price: 85000, originalPrice: 95000, discount: 10, stockLeft: 8, rating: 4.7, reviews: 420, image: 'https://images.unsplash.com/photo-1555507036-ab1f40ce88cb?w=500&q=80', addons: [] },
    { id: 44, vendorId: 'v10', categoryId: 'sweets', title: 'شیرینی نون خامه‌ای (رولت)', desc: 'بسته نیم کیلویی نان خامه‌ای گرد و تازه پر شده با خامه قنادی سبک و کم‌شیرین وانیلی', price: 160000, originalPrice: 160000, discount: 0, stockLeft: 4, rating: 4.8, reviews: 680, image: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?w=500&q=80', addons: [] },
    { id: 45, vendorId: 'v4', categoryId: 'drinks', title: 'دوغ محلی نعنایی آبعلی', desc: 'دوغ گازدار سنتی آبعلی شیشه‌ای خنک تگری، سرو شده همراه با پودر گلپر و سبزی نعنا خشک', price: 35000, originalPrice: 35000, discount: 0, stockLeft: 24, rating: 4.8, reviews: 810, image: 'https://images.unsplash.com/photo-1556881286-fc6915169721?w=500&q=80', addons: [] },
    { id: 46, vendorId: 'v20', categoryId: 'supermarket', title: 'نوشابه کوکاکولا قوطی خنک', desc: 'نوشابه مشکی کوکاکولا اورجینال ۳۳۰ میلی‌لیتر خنک تگری، مستقیم از یخچال سوپرمارکت', price: 25000, originalPrice: 28000, discount: 10, stockLeft: 25, rating: 4.5, reviews: 1200, image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500&q=80', addons: [] },
    { id: 47, vendorId: 'v1', categoryId: 'drinks', title: 'موهیتو دست‌ساز نعنا لیمو', desc: 'عصاره لیمو سنگی تازه کوبیده شده، برگ نعنا کوهی، شکر قهوه‌ای طبیعی و آب گازدار سودا', price: 78000, originalPrice: 95000, discount: 17, stockLeft: 8, rating: 4.8, reviews: 194, image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500&q=80', addons: [{ id: 'a5', title: 'نعنا و لیمو مضاعف', price: 10000 }] },
    { id: 48, vendorId: 'v11', categoryId: 'drinks', title: 'آیس لیموناد نعنایی گازدار', desc: 'لیموناد خنک تابستانی با طعم نعنا پاستوریزه، تکه‌های لیمو ترش اسلایس شده و یخ فراوان', price: 75000, originalPrice: 75000, discount: 0, stockLeft: 12, rating: 4.6, reviews: 240, image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500&q=80', addons: [] },
    { id: 49, vendorId: 'v11', categoryId: 'drinks', title: 'قهوه کلد برو (دم سرد)', desc: 'قهوه تخصصی عربیکا ۱۰۰٪ دم‌آوری شده قطره‌ای در آب سرد به مدت ۱۲ ساعت با اسیدیته پایین', price: 110000, originalPrice: 125000, discount: 12, stockLeft: 5, rating: 4.9, reviews: 680, image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=500&q=80', addons: [] },
    { id: 50, vendorId: 'v8', categoryId: 'drinks', title: 'شربت زعفران و تخم شربتی سنتی', desc: 'شربت اصیل خنک ایرانی با زعفران ناب قائنات، تخم شربتی لعاب‌دار، خاکشیر شسته شده و گلاب', price: 65000, originalPrice: 65000, discount: 0, stockLeft: 14, rating: 4.7, reviews: 450, image: 'https://images.unsplash.com/photo-1556881286-fc6915169721?w=500&q=80', addons: [] },
    { id: 101, vendorId: 'v_sweets', categoryId: 'sweets', title: 'باقلوا نعلی گردویی ۳ عدد', desc: 'باقلوا دست‌ساز تازه', price: 96000, originalPrice: 120000, discount: 20, stockLeft: 5, rating: 4.1, reviews: 120, image: 'https://images.unsplash.com/photo-1599598425947-33002629b5fa?w=300&q=80', addons: [] },
    { id: 102, vendorId: 'v_sweets', categoryId: 'sweets', title: 'باقلوا پیتزایی پسته ۳ عدد', desc: 'باقلوا پسته اعلا', price: 157250, originalPrice: 185000, discount: 15, stockLeft: 2, rating: 4.8, reviews: 95, image: 'https://images.unsplash.com/photo-1616428784132-75d31562b772?w=300&q=80', addons: [] }
];

const FOOD_IMAGE_POOL = {
    burgers: [
        'photo-1568901346375-23c9450c58cd',
        'photo-1586190848861-99aa4a171e90',
        'photo-1594212699903-eca40af73ca9',
        'photo-1553979459-d2229ba7433b',
        'photo-1550547660-d9450f859349',
        'photo-1615719413546-198b25453f85',
        'photo-1605333314051-7871b69d95f8',
        'photo-1551782450-a2132b4ba21d'
    ],
    pizza: [
        'photo-1628840042765-356cda07504e',
        'photo-1565299624946-b28f40a0ae38',
        'photo-1593560708920-61dd98c46a4e',
        'photo-1513104890138-7c749659a591',
        'photo-1565299507177-b0ac66763828',
        'photo-1574071318508-1cdbab80d002',
        'photo-1595854341625-f33ee10dbf94',
        'photo-1604382354936-07c5d9983bd3'
    ],
    kebab: [
        'photo-1627012046423-93d39da6a8b7',
        'photo-1555939594-58d7cb561ad1',
        'photo-1529193591184-b1d58069ecdd',
        'photo-1544025162-d76694265947',
        'photo-1603360946369-dc9bb6258143'
    ],
    traditional: [
        'photo-1519708227418-c8fd9a32b7a2',
        'photo-1534422298391-e4f8c172dddb',
        'photo-1588168333986-5078d3ae3976',
        'photo-1596797038530-2c107229654b',
        'photo-1604908176997-125f25cc6f3d',
        'photo-1631515243349-e0cb75fb8d3a',
        'photo-1627308595186-b4b3b3cbce20',
        'photo-1546069901-ba9599a7e63c',
        'photo-1563379091339-03b21ab4a4f8',
        'photo-1574484284002-952d92456975',
        'photo-1565299585323-38d6b0865b47',
        'photo-1598515214211-89d3c73ae83b'
    ],
    ash: [
        'photo-1547592180-85f173990554',
        'photo-1560934057-04870f7f3ed6',
        'photo-1627308595186-b4b3b3cbce20'
    ],
    sandwich: [
        'photo-1619740455993-9e612b1af08a',
        'photo-1528735602780-2552fd46c7af',
        'photo-1590165482129-1b8b27698780',
        'photo-1509722747041-616f39b57569',
        'photo-1606755962773-d324e0a13086',
        'photo-1627308595229-7830f5c9c66e'
    ],
    appetizers: [
        'photo-1585109649139-366815a0d713',
        'photo-1534080564583-6be75777b70a',
        'photo-1524114664604-cd8133cd67ad',
        'photo-1562967914-608f82629710'
    ],
    drinks: [
        'photo-1556881286-fc6915169721',
        'photo-1622483767028-3f66f32aef97',
        'photo-1513558161293-cdaf765ed2fd',
        'photo-1461023058943-07fcbe16d735'
    ],
    sweets: [
        'photo-1599598425947-33002629b5fa',
        'photo-1616428784132-75d31562b772',
        'photo-1578985545062-69928b1d9587',
        'photo-1551024601-bec78aea704b',
        'photo-1555507036-ab1f40ce88cb',
        'photo-1587314168485-3236d6710814'
    ],
    supermarket: [
        'photo-1622483767028-3f66f32aef97',
        'photo-1578916171728-46686eac8d58'
    ]
};

function fnvHash(str) {
    let h = 2166136261 >>> 0;
    const s = String(str);
    for (let i = 0; i < s.length; i++) {
        h ^= s.charCodeAt(i);
        h = Math.imul(h, 16777619);
    }
    return h >>> 0;
}

function seededRange(seed, min, max) {
    return min + (fnvHash(seed) % (max - min + 1));
}

function makeFoodImage(categoryId, seed) {
    const pool = FOOD_IMAGE_POOL[categoryId] || FOOD_IMAGE_POOL.burgers;
    const id = pool[fnvHash(seed) % pool.length];
    return `https://images.unsplash.com/${id}?w=500&q=80`;
}

function detectSubtypeFromTitle(title, desc, categoryId) {
    const t = ((title || '') + ' ' + (desc || '')).toLowerCase();
    const c = categoryId || 'burgers';

    if (c === 'traditional' || c === 'kebab') {
        if (/شامی/.test(t)) return 'shami';
        if (/ته\s*چین/.test(t)) return 'tahchin';
        if (/قورمه|فسنجان|خورش|آلو\s*اسفناج|کرفس|قیمه\s*بادمجان/.test(t)) return 'stew';
        if (/قیمه\s*نثار|قیمه/.test(t)) return 'rice';
        if (/کوبیده/.test(t)) return 'koobideh';
        if (/جوجه/.test(t)) return 'joojeh';
        if (/چنجه/.test(t)) return 'chenjeh';
        if (/شیشلیک/.test(t)) return 'shishlik';
        if (/برگ|راسته/.test(t)) return 'barg';
        if (/لقمه/.test(t)) return 'koobideh';
        if (/بختیاری|سلطانی|میکس|مخلوط/.test(t)) return 'kebab';
        if (/پلو|چلو|کته|زرشک/.test(t)) return 'rice';
        if (/کباب|دیس|بشقاب|پرس/.test(t)) return 'kebab';
        return c === 'kebab' ? 'kebab' : 'stew';
    }
    if (c === 'ash') {
        if (/حلیم/.test(t)) return 'halim';
        if (/رشته/.test(t)) return 'reshteh';
        if (/جو/.test(t)) return 'jo';
        if (/دوغ/.test(t)) return 'ashDoogh';
        if (/شله/.test(t)) return 'ashShole';
        return 'reshteh';
    }
    if (c === 'burgers') {
        if (/چیکن|کریسپی|سوخاری/.test(t)) return 'crispyChicken';
        if (/دوبل|دو\s*پتی|دوگانه/.test(t)) return 'doubleSmash';
        if (/وگان|گیاهی|گیاه/.test(t)) return 'vegan';
        if (/بندری/.test(t)) return 'bandari';
        if (/واگیو/.test(t)) return 'thickSirloin';
        return 'classic';
    }
    if (c === 'pizza') {
        if (/پپرونی/.test(t)) return 'pepperoni';
        if (/چهار\s*پنیر|چهارپنیر/.test(t)) return 'fourCheese';
        if (/مارگاریتا|سبزیجات|روستیکا|ریحان/.test(t)) return 'veggie';
        if (/بلوچیز/.test(t)) return 'fourCheese';
        if (/باربیکیو|پیکانته|آتشین|تند/.test(t)) return 'pepperoni';
        return 'classicPizza';
    }
    if (c === 'sandwich') {
        if (/بندری/.test(t)) return 'bndari';
        if (/هات\s*داگ|هاتداگ/.test(t)) return 'hotdog';
        if (/باگت|رست\s*بیف|بیف/.test(t)) return 'baguette';
        if (/ژامبون\s*سرد|هایدا|سرد/.test(t)) return 'coldSandwich';
        if (/فیله\s*مرغ|زینگر|مرغ\s*گریل|شنیسل/.test(t)) return 'chickenSandwich';
        if (/مغز|زبان/.test(t)) return 'baguette';
        return 'sandwich';
    }
    if (c === 'appetizers') {
        if (/سیب\s*زمینی|چیپسی|قاچی|بلژیکی|سرخ\s*کرده/.test(t)) return 'fries';
        if (/بال|پاچینی|وینگز|بوفالو/.test(t)) return 'wings';
        if (/موزارلا|استیکس|کروکت/.test(t)) return 'mozzSticks';
        if (/نان\s*سیر|پارمزان/.test(t)) return 'garlicBread';
        return 'fries';
    }
    if (c === 'drinks' || c === 'supermarket') {
        if (/نوشابه|کوکاکولا|فانتا|پپسی/.test(t)) return 'soda';
        if (/لیموناد/.test(t)) return 'lemonade';
        if (/موهیتو|نعنا/.test(t)) return 'mint';
        if (/قهوه|لاته|اسپرسو|کلد\s*برو/.test(t)) return 'coffee';
        if (/چای/.test(t)) return 'tea';
        if (/شیک|اسموتی/.test(t)) return 'shake';
        if (/آبمیوه|پرتقال|سیب\s*طبیعی|انار/.test(t)) return 'juice';
        if (/آب\s*معدنی|آب\s*خنک/.test(t)) return 'water';
        if (/دوغ/.test(t)) return 'juice';
        return 'genericDrink';
    }
    if (c === 'sweets') {
        if (/باقلوا/.test(t)) return 'baklava';
        if (/کروسان/.test(t)) return 'croissant';
        if (/چیزکیک/.test(t)) return 'cheesecake';
        if (/شکلاتی|فاج|براونی|گاناش/.test(t)) return 'chocolateCake';
        if (/وانیلی|اسفنجی/.test(t)) return 'vanillaCake';
        if (/شله|زرد/.test(t)) return 'genericSweet';
        return 'genericSweet';
    }
    return c;
}

const CATEGORY_NAME_BUILDERS = {
    burgers: {
        prefixes: ['برگر', 'چیزبرگر', 'دوبل برگر', 'همبرگر', 'چیکن برگر', 'اسلایدر', 'تاور برگر', 'بیف برگر', 'برگر گیاهی', 'برگر زغالی'],
        suffixes: [
            'گودا ممتاز', 'چدار ذوب‌شده', 'زغالی دودی', 'اسموکی BBQ', 'ماشروم ترافل',
            'کاراملی پیاز', 'اسپایسی مکزیکی', 'بیکن پنیری', 'پنیر بلوچیز', 'رویال کلاسیک',
            'شکم‌پر واگیو', 'آتشین تگزاسی', 'وگان گیاهی', 'سیر و پارمزان', 'پیکانته دودی',
            'دو پتی ویژه', 'کاراملی هانی', 'پنیر و قارچ', 'مخصوص سرآشپز', 'کنجدی چدار',
            'سس ترافل', 'چیلی آمریکایی', 'میکس پنیر', 'رویال رویال', 'سلطان برگر',
            'کاراملی هالوپینو', 'بی‌نظیر ویژه', 'طلایی سوخاری', 'چهار پنیر', 'پیکانته چیلی'
        ],
        descs: [
            'پتی دست‌ساز آبدار با نان تازه و سس مخصوص سرآشپز',
            'گوشت گریل‌شده با ادویه مخصوص و سبزیجات تازه فصل',
            'پنیر ذوب‌شده روی پتی داغ با نان کنجدی برشته',
            'طعم دودی و بی‌نظیر با سس مخصوص خانه و ادویه‌های ویژه',
            'ترکیب خاص مواد اولیه تازه و نان تست‌شده در تنور',
            'پتی ضخیم گوشت با پنیر کش‌دار و سس مخصوص سرآشپز',
            'گوشت واگیو گریل‌شده با سبزیجات کاراملی و سس ویژه'
        ],
        priceMin: 180000,
        priceRange: 250000
    },
    pizza: {
        prefixes: ['پیتزا', 'پیتزا تنوری', 'پیتزا ایتالیایی', 'پیتزا ناپلی', 'پیتزا رومی', 'پیتزا سنگ‌پز', 'پیتزا خانگی', 'پیتزا ویژه'],
        suffixes: [
            'مارگاریتا کلاسیک', 'پپرونی کاسه‌ای', 'چهار پنیر', 'روستیکا سبزیجات',
            'سیر و استیک', 'تنوری مکزیکی', 'پنیر و قارچ', 'پروشوتو رولا',
            'ناپلی سنتی', 'سیر و ریحان', 'خورشتی ایرانی', 'مرغ و ذرت',
            'سبزیجات فصل', 'پنیر بلوچیز', 'سوسیس و پنیر', 'قارچ مخصوص',
            'بیف پیکانته', 'کاربونارا', 'خانوادگی', 'پیکانته آتشین',
            'سیسیلی', 'دیترویت', 'رول ایتالیایی', 'پپرونی سیر',
            'بلوچیز و گردو', 'ریکوتا و اسفناج', 'باربیکیو مرغ', 'پنیر بزی'
        ],
        descs: [
            'خمیر دست‌ساز ناپلی با فرآورده‌های تازه و پنیر کش‌دار',
            'تاپینگ‌های متنوع روی خمیر پفکی تنوری سنگ‌پز',
            'ترکیب خاص سس و پنیر با طعم بی‌نظیر ایتالیایی',
            'پخته شده در تنور سنگی با چوب طبیعی برای طعم دودی',
            'خمیر تخمیر طبیعی ۴۸ ساعته با لبه‌های برشته و پفکی',
            'سس مخصوص خانگی با ادویه‌های تازه و گیاهان معطر'
        ],
        priceMin: 220000,
        priceRange: 220000
    },
    kebab: {
        prefixes: ['چلو کباب', 'کباب', 'دیس کباب', 'بشقاب کباب', 'کباب مخصوص', 'کباب سنتی', 'کباب اعلا', 'پرس کباب'],
        suffixes: [
            'کوبیده مخصوص', 'جوجه زعفرانی', 'برگ راسته', 'چنجه گوساله',
            'شیشلیک دنده', 'بختیاری مخلوط', 'لقمه نجفی', 'جوجه بدون استخوان',
            'ترش گیلانی', 'سلطانی دو رنگ', 'کوبیده گیاهی', 'مرغ مخصوص',
            'دنده بره', 'سولطانی ویژه', 'چرخ‌کرده سرآشپز', 'میکس گوشت',
            'گوسفندی خالص', 'بزی محلی', 'شیش ممتاز', 'رویال شاندیز'
        ],
        descs: [
            'گوشت تازه چرخ‌کرده با پیاز رنده شده و ادویه مخصوص',
            'مرینیت‌شده در زعفران ناب با کره محلی و آبلیمو',
            'کباب شده روی زغال طبیعی با عطر دودی بی‌نظیر',
            'سرو با چلوی زعفرانی ایرانی و گوجه کبابی ذغالی',
            'گوشت گوسفندی ممتاز با چربی طبیعی و طعم اصیل ایرانی',
            'دورچین کامل با برنج طارم درجه یک و کره محلی'
        ],
        priceMin: 280000,
        priceRange: 350000
    },
    traditional: {
        prefixes: ['خورش', 'پلو', 'کته', 'چلو', 'خوراک', 'بشقاب', 'دیس', 'مخصوص'],
        suffixes: [
            'ته چین زعفرانی', 'قورمه سبزی', 'قیمه نثار قزوینی', 'فسنجان',
            'باقالی پلو', 'زرشک پلو با مرغ', 'آلبالو پلو', 'عدس پلو',
            'سبزی پلو با ماهی', 'لوبیا پلو', 'کرفس مخصوص', 'بادمجان',
            'آلو اسفناج', 'کشک بادمجان', 'میرزاقاسمی', 'حلیم بادمجان',
            'کوکو سبزی', 'شامی کباب', 'دلمه برگ مو', 'آش سماق'
        ],
        descs: [
            'غذای اصیل ایرانی با برنج طارم و ادویه‌های سنتی',
            'خورشت جاافتاده با گوشت تازه و روغن حیوانی محلی',
            'پخته شده به روش سنتی با سبزیجات تازه فصل',
            'طعم خانگی اصیل با مواد اولیه درجه یک و برنج ایرانی',
            'سرو با دورچین سنتی و طعم بی‌نظیر خانه'
        ],
        priceMin: 180000,
        priceRange: 200000
    },
    ash: {
        prefixes: ['آش', 'کاسه آش', 'بشقاب آش', 'آش سنتی', 'آش مخصوص', 'حلیم'],
        suffixes: [
            'رشته', 'دوغ تبریزی', 'شله قلمکار', 'ماش', 'سیرابی',
            'گندم', 'بادمجان', 'جو', 'اوماج', 'کلم',
            'آنار', 'گوشت گوسفندی', 'سماق', 'کشک', 'غوره',
            'حبوبات کامل', 'مخصوص عمه', 'سنتی شیرازی', 'مخصوص سرآشپز', 'خانگی'
        ],
        descs: [
            'آش سنتی غلیظ با حبوبات کامل و کشک محلی',
            'طعم اصیل خانگی با نعناداغ و پیازداغ فراوان',
            'پخته شده به روش سنتی با سبزیجات کوهی و ادویه اصیل',
            'سرو گرم با کشک و روغن محلی درجه یک و نان تازه',
            'غذای اصیل ایرانی با مواد اولیه تازه و طعم خانگی'
        ],
        priceMin: 90000,
        priceRange: 110000
    },
    sandwich: {
        prefixes: ['ساندویچ', 'باگت', 'هات‌داگ', 'نان ساندویچی', 'پرس ساندویچ', 'رول'],
        suffixes: [
            'بندری تند', 'ژامبون ویژه', 'رست بیف اعلا', 'فیله مرغ',
            'پنیری داغ', 'سوسیس آلمانی', 'کالباس مخصوص', 'مغز و زبان',
            'کباب مخصوص', 'شنیسل مرغ', 'همبرگر ویژه', 'سوخاری کریسپی',
            'ژامبون سرد', 'کوکتل پنیری', 'مرغ گریل', 'بیکن و پنیر',
            'سیب‌زمینی و پنیر', 'قارچ و پنیر', 'میکس گوشت', 'رویال نوستالژی'
        ],
        descs: [
            'نان تازه با مواد اولیه باکیفیت و سس مخصوص خانه',
            'ترکیب گوشت و پنیر ذوب‌شده با طعم بی‌نظیر و تازه',
            'پخته شده به روش سنتی در تنور گرم با نان داغ',
            'مواد تازه روزانه با سس مخصوص و سبزیجات فصل',
            'ساندویچ سیرکننده با نان داغ تنوری و پنیر کش‌دار'
        ],
        priceMin: 150000,
        priceRange: 180000
    },
    appetizers: {
        prefixes: ['سیب‌زمینی', 'بال', 'استیکس', 'چیپسی', 'سوخاری', 'پیش‌غذای', 'اسنک'],
        suffixes: [
            'سرخ‌کرده ساده', 'بوفالو تند', 'موزارلا کش‌دار', 'بلژیکی ترد',
            'نان سیر و پارمزان', 'ناگت مرغ', 'رولت مرغ', 'حلقه پیاز',
            'قارچ سوخاری', 'کروکت پنیری', 'قاچی مخصوص', 'مخصوص سرآشپز',
            'پاپکورن میگو', 'سیخ پنیر', 'سیخ مرغ و پنیر', 'میکس ویژه',
            'چدار گرم', 'اسپایسی', 'دودی بی‌نظیر', 'طلایی کریسپی'
        ],
        descs: [
            'سیب‌زمینی تازه سرخ‌شده با ادویه مخصوص و سس دیپ',
            'سوخاری طلایی و ترد با سس دیپ همراه و طعم بی‌نظیر',
            'پیش‌غذای داغ با ترکیب خاص و طعم مخصوص سرآشپز',
            'مناسب برای اشتراک با دوستان با سس مخصوص و تازه',
            'غذای جانبی محبوب با سس مخصوص و طعم بی‌نظیر'
        ],
        priceMin: 90000,
        priceRange: 130000
    },
    drinks: {
        prefixes: ['نوشیدنی', 'دوغ', 'شربت', 'لیموناد', 'موهیتو', 'قهوه', 'چای', 'آبمیوه', 'اسموتی', 'شیک'],
        suffixes: [
            'نعنایی خنک', 'کوکاکولا کلاسیک', 'لیمویی گازدار', 'دست‌ساز تابستانی',
            'بیدمشک سنتی', 'بهارنارنج', 'خاکشیر نعنایی', 'کلد برو تخصصی',
            'آیس لاته', 'سیاه سنتی', 'سبز زعفرانی', 'پرتقال طبیعی',
            'سیب طبیعی', 'انار طبیعی', 'توت‌فرنگی تازه', 'انرژی‌زا',
            'شکلاتی داغ', 'وانیلی مخصوص', 'گازدار خنک', 'معدنی خنک'
        ],
        descs: [
            'نوشیدنی خنک و تازه با یخ فراوان و طعم بی‌نظیر',
            'طعم طبیعی و بدون افزودنی مصنوعی و نگهدارنده',
            'سرو در لیوان شیشه‌ای خنک با یخ و تزئین مخصوص',
            'ترکیب خاص و طعم بی‌نظیر ایرانی با عطر طبیعی',
            'نوشیدنی مناسب برای گرمای تابستان و لحظات خوش'
        ],
        priceMin: 30000,
        priceRange: 90000
    },
    sweets: {
        prefixes: ['کیک', 'باقلوا', 'کروسان', 'شله', 'نان', 'شیرینی', 'دسر', 'چیزکیک', 'ماکارون', 'براونی'],
        suffixes: [
            'شکلاتی فاج', 'وانیلی اسفنجی', 'گردویی ممتاز', 'پسته اعلا',
            'کره‌ای فرانسوی', 'زرد زعفرانی', 'خامه‌ای سنتی', 'دانمارکی',
            'هویج و گردو', 'نیویورکی', 'پروفیترول شکلاتی', 'فرانسوی رنگین',
            'فاج مخصوص', 'ردولوت مخملی', 'تیرامیسو ایتالیایی', 'پانا کوتا',
            'کارامل نرم', 'لیمویی خنک', 'پسته و زعفران', 'رویال ویژه'
        ],
        descs: [
            'شیرینی تازه پخته شده با مواد اولیه درجه یک و شکلات اعلا',
            'کیک نرم و خوش‌طعم مناسب برای پذیرایی و مهمانی',
            'دسر خوشمزه با طعم بی‌نظیر و ظاهر جذاب و تزئین ویژه',
            'پخته شده با کره حیوانی و شکلات بلژیکی اعلا',
            'طعم اصیل فرانسوی با تزئین زیبا و مواد اولیه مرغوب'
        ],
        priceMin: 60000,
        priceRange: 130000
    },
    supermarket: {
        prefixes: ['نوشابه', 'آب', 'چیپس', 'پفک', 'بیسکویت', 'شکلات', 'آدامس', 'آبمیوه', 'اسنک', 'کیک'],
        suffixes: [
            'کوکاکولا قوطی', 'فانتا پرتقالی', 'معدنی خنک', 'نمکی ترد',
            'نمکی پنیری', 'کرم‌دار وانیلی', 'تخته‌ای تلخ', 'نعنایی تازه',
            'بسته‌بندی تازه', 'انرژی‌زا مخصوص', 'خانوادگی', 'مخصوص کودکان',
            'رژیمی', 'بدون قند', 'گیاهی', 'سنتی'
        ],
        descs: [
            'محصول اصل با کیفیت تضمینی و بسته‌بندی بهداشتی',
            'بسته‌بندی بهداشتی و آماده مصرف روزانه',
            'تاریخ مصرف تازه و موجود در یخچال سوپرمارکت',
            'برند معتبر با کیفیت همیشگی و طعم بی‌نظیر',
            'مناسب برای مصرف روزانه و تنقلات خانگی'
        ],
        priceMin: 15000,
        priceRange: 40000
    }
};

const VENDOR_GENERATION_PLAN = [
    ['v1', 'burgers', 20], ['v1', 'appetizers', 6], ['v1', 'drinks', 4],
    ['v2', 'pizza', 15], ['v2', 'sandwich', 6], ['v2', 'drinks', 4],
    ['v3', 'ash', 8], ['v3', 'traditional', 7],
    ['v4', 'kebab', 15], ['v4', 'drinks', 5],
    ['v5', 'sweets', 15],
    ['v6', 'sandwich', 12], ['v6', 'appetizers', 8],
    ['v7', 'pizza', 18], ['v7', 'appetizers', 7],
    ['v8', 'kebab', 10], ['v8', 'traditional', 3], ['v8', 'drinks', 2],
    ['v9', 'burgers', 15],
    ['v10', 'sweets', 15],
    ['v11', 'drinks', 12], ['v11', 'sweets', 8],
    ['v12', 'kebab', 12], ['v12', 'traditional', 8],
    ['v13', 'sandwich', 15],
    ['v14', 'traditional', 10], ['v14', 'kebab', 8],
    ['v15', 'ash', 8], ['v15', 'traditional', 7],
    ['v16', 'burgers', 12], ['v16', 'sandwich', 6],
    ['v17', 'appetizers', 7], ['v17', 'traditional', 5],
    ['v18', 'pizza', 9], ['v18', 'sandwich', 6],
    ['v19', 'kebab', 10],
    ['v20', 'supermarket', 10]
];

function buildExtraCatalog() {
    const extra = [];
    let nextId = 1000;

    VENDOR_GENERATION_PLAN.forEach(plan => {
        const [vendorId, categoryId, count] = plan;
        const builder = CATEGORY_NAME_BUILDERS[categoryId];
        if (!builder) return;

        const usedTitles = new Set();

        for (let i = 0; i < count; i++) {
            const id = nextId++;
            const seedBase = `${vendorId}-${categoryId}-${id}`;

            let title = '';
            let attempt = 0;
            while (attempt < 20) {
                const prefixSeed = seedBase + '-pre-' + attempt;
                const suffixSeed = seedBase + '-suf-' + attempt;
                const prefix = builder.prefixes[fnvHash(prefixSeed) % builder.prefixes.length];
                const suffix = builder.suffixes[fnvHash(suffixSeed) % builder.suffixes.length];
                const candidate = `${prefix} ${suffix}`;
                if (!usedTitles.has(candidate)) {
                    title = candidate;
                    usedTitles.add(candidate);
                    break;
                }
                attempt++;
            }
            if (!title) {
                title = `${builder.prefixes[0]} ${builder.suffixes[i % builder.suffixes.length]} ${(i + 1)}`;
            }

            const desc = builder.descs[fnvHash(seedBase + '-desc') % builder.descs.length];

            const price = seededRange(seedBase + '-price', builder.priceMin, builder.priceMin + builder.priceRange);
            const discount = (id % 5 === 0) ? 0 : ((id % 4) * 5);
            const originalPrice = discount > 0 ? Math.round(price / (1 - discount / 100)) : price;

            const rating = 3.8 + ((fnvHash(seedBase + '-rating') % 12) / 10);
            const reviews = 40 + (fnvHash(seedBase + '-reviews') % 950);
            const stockLeft = 2 + (fnvHash(seedBase + '-stock') % 22);

            const image = makeFoodImage(categoryId, seedBase + '-img-' + i);
            const subtype = detectSubtypeFromTitle(title, desc, categoryId);

            extra.push({
                id,
                vendorId,
                categoryId,
                subtype,
                title,
                desc,
                price,
                originalPrice,
                discount,
                stockLeft,
                rating: Math.round(rating * 10) / 10,
                reviews,
                image,
                addons: []
            });
        }
    });

    return extra;
}

function tagBaseProductsWithSubtype(products) {
    return products.map(p => {
        if (p.subtype) return p;
        return Object.assign({}, p, {
            subtype: detectSubtypeFromTitle(p.title, p.desc, p.categoryId)
        });
    });
}

function buildFullCatalog() {
    const baseTagged = tagBaseProductsWithSubtype(baseCatalogProducts);
    const extra = buildExtraCatalog();
    return [...baseTagged, ...extra];
}

const catalogProducts = buildFullCatalog();

let __generatorModule = null;
let __generatorLoading = null;

async function loadGenerator() {
    if (__generatorModule) return __generatorModule;
    if (__generatorLoading) return __generatorLoading;
    __generatorLoading = import('./procedural-food-generator.js').then(mod => {
        __generatorModule = mod;
        __generatorLoading = null;
        return mod;
    }).catch(err => {
        __generatorLoading = null;
        throw err;
    });
    return __generatorLoading;
}

function estimateCaloriesFallback(product) {
    const category = product.categoryId || 'burgers';
    const baseMap = {
        burgers: 650,
        pizza: 780,
        kebab: 720,
        traditional: 620,
        ash: 380,
        sandwich: 540,
        appetizers: 420,
        drinks: 120,
        sweets: 460,
        supermarket: 180
    };
    const base = baseMap[category] || 500;
    const priceFactor = Math.min(1.4, Math.max(0.7, product.price / 300000));
    return Math.round(base * priceFactor);
}

function estimateCalories(product) {
    if (__generatorModule && typeof __generatorModule.estimateCalories === 'function') {
        try {
            return __generatorModule.estimateCalories(product);
        } catch (e) {
            return estimateCaloriesFallback(product);
        }
    }
    loadGenerator().catch(() => {});
    return estimateCaloriesFallback(product);
}

const CATALOG_PAGE_SIZE = 8;
let catalogDisplayLimit = CATALOG_PAGE_SIZE;

function resetCatalogLimit() {
    catalogDisplayLimit = CATALOG_PAGE_SIZE;
}

function loadMoreCatalogItems() {
    catalogDisplayLimit += CATALOG_PAGE_SIZE;
    renderCatalog();
    if (window.lucide) lucide.createIcons();
}
window.loadMoreCatalogItems = loadMoreCatalogItems;

const storiesData = [
    { id: 1, title: 'حراج ویژه',      icon: '⚡', desc: 'تخفیف‌های استثنایی تا ۵۰٪ روی کالاهای منتخب', image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&q=80' },
    { id: 2, title: 'ارسال اکسپرس',   icon: '🚀', desc: 'تحویل فوری کمتر از ۲۰ دقیقه با تضمین کیفیت', image: 'https://images.unsplash.com/photo-1526367790999-0150786686a2?w=200&q=80' },
    { id: 3, title: 'کالابرگ',         icon: '💳', desc: 'خرید مستقیم با اعتبار یارانه کالابرگ الکترونیکی', image: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=200&q=80' },
    { id: 4, title: 'کدهای تخفیف',    icon: '🎁', desc: 'کد هدیه ۳۰ هزار تومانی ویژه اعضای لقمه کلاب', image: 'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=200&q=80' },
    { id: 5, title: 'پرفروش‌ترین‌ها',  icon: '🔥', desc: 'لیست پرطرفدارترین سفارش‌های برگر هفته جاری', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&q=80' }
];

const serviceCategories = [
    { id: 'restaurant', title: 'رستوران',     icon: 'utensils',       color: 'bg-rose-50 text-rose-600',     badge: '٪۳۰' },
    { id: 'supermarket', title: 'سوپرمارکت',  icon: 'shopping-cart',  color: 'bg-emerald-50 text-emerald-600', badge: 'جدید' },
    { id: 'cafe',        title: 'کافه',        icon: 'coffee',         color: 'bg-amber-50 text-amber-600',    badge: null },
    { id: 'sweets',      title: 'شیرینی',      icon: 'cake-slice',     color: 'bg-pink-50 text-snapp',         badge: '٪۱۵' },
    { id: 'protein',     title: 'پروتئینی',   icon: 'beef',           color: 'bg-red-50 text-red-600',        badge: null },
    { id: 'produce',     title: 'میوه',        icon: 'apple',          color: 'bg-green-50 text-green-600',    badge: null },
    { id: 'pharmacy',    title: 'داروخانه',   icon: 'pill',           color: 'bg-sky-50 text-sky-600',        badge: 'فوری' },
    { id: 'drinks',      title: 'نوشیدنی',     icon: 'cup-soda',       color: 'bg-purple-50 text-purple-600',  badge: null }
];

const promoBanners = [
    {
        id: 'b1',
        title: 'ارسال رایگان با لقمه پرو',
        subtitle: 'برای همه رستوران‌های شهر، تا پایان ماه',
        cta: 'فعال‌سازی',
        bg: 'from-purple-700 via-indigo-700 to-indigo-900',
        icon: 'crown'
    },
    {
        id: 'b2',
        title: 'فود پارتی هفتگی',
        subtitle: 'تا ۲۵٪ تخفیف روی منتخب رستوران‌ها',
        cta: 'مشاهده',
        bg: 'from-rose-600 via-pink-600 to-snapp',
        icon: 'sparkles'
    },
    {
        id: 'b3',
        title: 'کد تخفیف اولین سفارش',
        subtitle: '۳۰٪ تخفیف تا سقف ۵۰ هزار تومان',
        cta: 'کپی کد',
        bg: 'from-amber-500 via-orange-500 to-rose-500',
        icon: 'gift'
    }
];

let selectedVendorId   = 'v1';
let cartState          = { vendorId: null, items: {} };
let wishlistState      = [];
let selectedCategory   = 'all';
let currentSort        = 'all';
let searchQuery        = '';
let appliedCouponRate  = 0;
let activeStoryIndex   = 0;
let storyTimer         = null;

let promoDragState = {
    bound: false,
    dragging: false,
    moved: false,
    startX: 0,
    startY: 0,
    startScroll: 0,
    pointerId: null
};

function toPersianDigits(n) {
    if (n === null || n === undefined) return '';
    const f = ['۰','۱','۲','۳','۴','۵','۶','۷','۸','۹'];
    return n.toString().replace(/\d/g, x => f[x]);
}

function formatPrice(a) {
    const n = Math.round(a);
    const s = String(n);
    let out = '';
    let counter = 0;
    for (let i = s.length - 1; i >= 0; i--) {
        out = s[i] + out;
        counter++;
        if (counter === 3 && i > 0) {
            out = ',' + out;
            counter = 0;
        }
    }
    return toPersianDigits(out);
}

function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

window.AppAPI = {
    catalogProducts,
    cartState,
    vendors,
    storiesData,
    serviceCategories,
    promoBanners,
    formatPrice,
    toPersianDigits,
    estimateCalories,
    switchNavTab,
    selectVendor,
    handleAddToCart,
    toggleCartDrawer,
    updateApplicationState,
    clearCart: () => {
        cartState.items = {};
        cartState.vendorId = null;
    }
};

function injectHomeWidgets() {
    injectSnappProPill();
    injectServiceCategoryGrid();
    injectPromoBanners();
    injectLoghmeYarOrb();
}

function injectSnappProPill() {
    if (document.getElementById('home-pro-pill')) return;
    const header = document.querySelector('header');
    if (!header || !header.parentElement) return;

    const pill = document.createElement('div');
    pill.id = 'home-pro-pill';
    pill.className = 'mx-4 mt-3 rounded-2xl p-3.5 bg-gradient-to-r from-purple-700 via-indigo-700 to-indigo-900 text-white shadow-lg shadow-indigo-900/20 relative overflow-hidden cursor-pointer hover:scale-[1.01] transition-transform';
    pill.innerHTML = `
        <div class="absolute -right-6 -top-6 w-24 h-24 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
        <div class="flex items-center justify-between relative z-10">
            <div class="flex items-center gap-2.5">
                <div class="w-10 h-10 rounded-xl bg-amber-400 flex items-center justify-center shrink-0 shadow-md">
                    <i data-lucide="crown" class="w-5 h-5 text-purple-950"></i>
                </div>
                <div class="text-right">
                    <div class="font-black text-xs mb-0.5">لقمه پرو فعال دارید</div>
                    <div class="text-[10px] text-indigo-100">
                        <span class="text-amber-300 font-black">${formatPrice(3200941)}</span> تومان سود تا این لحظه
                    </div>
                </div>
            </div>
            <div class="flex items-center gap-1 text-[10px] font-bold bg-white/15 backdrop-blur-md px-2.5 py-1 rounded-lg">
                <span>مدیریت</span>
                <i data-lucide="chevron-left" class="w-3 h-3"></i>
            </div>
        </div>
    `;
    pill.addEventListener('click', () => {
        if (window.PI_API && typeof window.PI_API.openProDetails === 'function') {
            window.PI_API.openProDetails();
        } else {
            alert('لقمه پرو فعال است. ۹۳ روز مانده تا پایان اشتراک.');
        }
    });

    header.parentElement.insertBefore(pill, header.nextSibling);
    if (window.lucide) lucide.createIcons();
}

function injectServiceCategoryGrid() {
    if (document.getElementById('home-service-grid')) return;
    const vendorGrid = document.getElementById('quick-category-grid');
    if (!vendorGrid) return;

    const section = document.createElement('section');
    section.id = 'home-service-grid';
    section.className = 'mt-4 px-4';
    section.innerHTML = `
        <div class="flex items-center justify-between mb-2.5">
            <h3 class="font-extrabold text-xs text-gray-900 flex items-center gap-1.5">
                <i data-lucide="layout-grid" class="w-4 h-4 text-snapp"></i>
                سرویس‌های لقمه
            </h3>
            <span class="text-[10px] font-bold text-snapp cursor-pointer" onclick="window.HomeWidgets.openAll()">همه</span>
        </div>
        <div class="grid grid-cols-4 gap-2.5">
            ${serviceCategories.map(cat => `
                <div onclick="window.HomeWidgets.openService('${cat.id}')" class="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-gray-50 border border-gray-100 hover:bg-pink-50 cursor-pointer active:scale-95 transition-all text-center relative">
                    ${cat.badge ? `
                        <span class="absolute -top-1.5 -right-1 left-1/2 -translate-x-1/2 bg-rose-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full shadow-md">${cat.badge}</span>
                    ` : ''}
                    <div class="w-10 h-10 rounded-xl ${cat.color} flex items-center justify-center mb-1.5 shadow-sm">
                        <i data-lucide="${cat.icon}" class="w-5 h-5"></i>
                    </div>
                    <span class="text-[10px] font-extrabold text-gray-700">${cat.title}</span>
                </div>
            `).join('')}
        </div>
    `;

    vendorGrid.parentElement.parentElement.insertBefore(section, vendorGrid.parentElement);
    if (window.lucide) lucide.createIcons();
}

function injectPromoBanners() {
    if (document.getElementById('home-promo-banners')) return;
    const storiesSection = document.getElementById('stories-container');
    if (!storiesSection) return;

    const section = document.createElement('section');
    section.id = 'home-promo-banners';
    section.className = 'mt-4';
    section.innerHTML = `
        <div id="promo-banners-track"
             class="flex gap-3 overflow-x-auto no-scrollbar py-1 px-4"
             style="scroll-behavior: smooth; -webkit-overflow-scrolling: touch; touch-action: pan-y !important; cursor: grab; user-select: none; -webkit-user-select: none;">
            ${promoBanners.map(banner => `
                <div onclick="window.HomeWidgets.openBanner('${banner.id}')" class="promo-banner-card shrink-0 w-[320px] h-32 rounded-2xl bg-gradient-to-br ${banner.bg} text-white relative overflow-hidden shadow-lg cursor-pointer active:scale-[0.98] transition-transform" draggable="false">
                    <div class="absolute -right-8 -top-8 w-32 h-32 bg-white/15 rounded-full blur-3xl pointer-events-none"></div>
                    <div class="absolute -left-6 -bottom-6 w-24 h-24 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>

                    <div class="relative z-10 p-4 h-full flex flex-col justify-between pointer-events-none">
                        <div class="flex items-start justify-between">
                            <div class="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
                                <i data-lucide="${banner.icon}" class="w-5 h-5"></i>
                            </div>
                            <button class="bg-white text-gray-900 text-[10px] font-black px-3 py-1.5 rounded-full shadow-md">
                                ${banner.cta}
                            </button>
                        </div>
                        <div class="text-right">
                            <div class="font-black text-sm mb-0.5">${banner.title}</div>
                            <div class="text-[10px] opacity-90">${banner.subtitle}</div>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;

    storiesSection.parentElement.parentElement.insertBefore(section, storiesSection.parentElement.nextSibling);
    if (window.lucide) lucide.createIcons();

    bindPromoBannerDrag();
}

function injectLoghmeYarOrb() {
    if (document.getElementById('loghme-yar-orb')) return;
    const header = document.querySelector('header');
    if (!header || !header.parentElement) return;

    const orb = document.createElement('button');
    orb.id = 'loghme-yar-orb';
    orb.setAttribute('aria-label', 'لقمه‌یار');
    orb.className = 'loghme-yar-orb';
    orb.innerHTML = `
        <span class="loghme-yar-orb__aura"></span>
        <span class="loghme-yar-orb__core">
            <i data-lucide="sparkles" class="w-5 h-5"></i>
        </span>
        <span class="loghme-yar-orb__label">
            <span class="loghme-yar-orb__title">لقمه‌یار</span>
            <span class="loghme-yar-orb__sub">پیشنهاد هوشمند غذا</span>
        </span>
    `;
    orb.addEventListener('click', () => {
        if (window.LoghmeYarAI && typeof window.LoghmeYarAI.open === 'function') {
            window.LoghmeYarAI.open();
        } else {
            import('./script_2.js').then(mod => {
                if (mod && mod.LoghmeYarAI && typeof mod.LoghmeYarAI.open === 'function') {
                    mod.LoghmeYarAI.open();
                }
            }).catch(err => console.warn('[LoghmeYar] load failed:', err));
        }
    });

    document.body.appendChild(orb);
    if (window.lucide) lucide.createIcons();
}

function bindPromoBannerDrag() {
    if (promoDragState.bound) return;

    const track = document.getElementById('promo-banners-track');
    if (!track) return;

    promoDragState.bound = true;

    track.addEventListener('dragstart', (e) => e.preventDefault());

    track.addEventListener('pointerdown', (e) => {
        if (e.pointerType === 'mouse' && e.button !== 0) return;
        if (e.target.closest('button')) return;

        promoDragState.dragging = true;
        promoDragState.moved = false;
        promoDragState.startX = e.clientX;
        promoDragState.startY = e.clientY;
        promoDragState.startScroll = track.scrollLeft;
        promoDragState.pointerId = e.pointerId;

        track.style.cursor = 'grabbing';
        track.style.scrollBehavior = 'auto';
    });

    track.addEventListener('pointermove', (e) => {
        if (!promoDragState.dragging) return;
        if (e.pointerId !== promoDragState.pointerId) return;

        const dx = e.clientX - promoDragState.startX;
        const dy = e.clientY - promoDragState.startY;
        const adx = Math.abs(dx);
        const ady = Math.abs(dy);

        if (!promoDragState.moved) {
            if (ady > adx && ady > 6) {
                promoDragState.dragging = false;
                promoDragState.pointerId = null;
                track.style.cursor = 'grab';
                track.style.scrollBehavior = 'smooth';
                return;
            }
            if (adx > ady && adx > 6) {
                promoDragState.moved = true;
                try { track.setPointerCapture(e.pointerId); } catch (err) {}
            }
        }

        if (!promoDragState.moved) return;

        track.scrollLeft = promoDragState.startScroll - dx;
    });

    const endPromoDrag = (e) => {
        if (!promoDragState.dragging) return;
        if (e && promoDragState.pointerId !== null && e.pointerId !== undefined && e.pointerId !== promoDragState.pointerId) return;

        const wasMoved = promoDragState.moved;
        promoDragState.dragging = false;
        promoDragState.pointerId = null;
        promoDragState.moved = false;

        track.style.cursor = 'grab';
        track.style.scrollBehavior = 'smooth';

        if (wasMoved) {
            const preventClick = (ev) => {
                ev.stopPropagation();
                ev.preventDefault();
            };
            track.addEventListener('click', preventClick, { capture: true, once: true });
            setTimeout(() => track.removeEventListener('click', preventClick, { capture: true }), 0);
        }
    };

    track.addEventListener('pointerup', endPromoDrag);
    track.addEventListener('pointercancel', endPromoDrag);
    track.addEventListener('pointerleave', endPromoDrag);
}

window.HomeWidgets = {
    openAll: function () {
        alert('نمایش همه سرویس‌های لقمه.');
    },
    openService: function (serviceId) {
        if (serviceId === 'restaurant') {
            const firstVendor = vendors.find(v => v.id !== 'v_sweets');
            if (firstVendor) selectVendor(firstVendor.id);
        } else {
            alert(`سرویس «${serviceId}» به‌زودی در دسترس خواهد بود.`);
        }
    },
    openBanner: function (bannerId) {
        if (bannerId === 'b1' && window.PI_API && typeof window.PI_API.openProDetails === 'function') {
            window.PI_API.openProDetails();
        } else if (bannerId === 'b2') {
            const dealsTab = document.querySelector('.nav-tab[onclick*="deals"]');
            if (dealsTab) dealsTab.click();
        } else if (bannerId === 'b3') {
            alert('کد تخفیف «FIRST30» کپی شد. آن را در سبد خرید اعمال کنید.');
        }
    }
};

function renderStories() {
    const container = document.getElementById('stories-container');
    if (!container) return;

    container.innerHTML = storiesData.map((story, index) => `
        <div onclick="openStoryModal(${index})"
             class="flex flex-col items-center gap-1.5 cursor-pointer active:scale-95 transition-transform shrink-0">
            <div class="w-16 h-16 rounded-full p-[2.5px] story-active-ring flex items-center justify-center">
                <div class="w-full h-full rounded-full border-2 border-white overflow-hidden bg-gray-100">
                    <img src="${story.image}" alt="${story.title}" class="w-full h-full object-cover">
                </div>
            </div>
            <span class="text-[11px] font-bold text-gray-700 tracking-tight">${story.title}</span>
        </div>
    `).join('');

    if (window.lucide) lucide.createIcons();
}

function renderVendorSwitcher() {
    const grid = document.getElementById('quick-category-grid');
    if (!grid) return;

    grid.innerHTML = vendors.filter(v => v.id !== 'v_sweets').map(vendor => {
        const active = selectedVendorId === vendor.id;
        return `
            <div onclick="selectVendor('${vendor.id}')"
                 class="flex flex-col items-center justify-center p-2.5 rounded-2xl ${active ? 'vendor-active-ring' : 'bg-gray-50 border border-gray-100 hover:bg-pink-50'} cursor-pointer active:scale-95 transition-all text-center">
                <div class="w-11 h-11 rounded-full overflow-hidden mb-1.5 shadow-sm border-2 ${active ? 'border-snapp' : 'border-white'}">
                    <img src="${vendor.logo}" class="w-full h-full object-cover" alt="${vendor.name}">
                </div>
                <span class="text-[9px] font-extrabold text-gray-800 line-clamp-1 w-full leading-tight">${vendor.name}</span>
            </div>
        `;
    }).join('');

    if (window.lucide) lucide.createIcons();
}

async function selectVendor(vendorId) {
    selectedVendorId = vendorId;
    resetCatalogLimit();
    try {
        const restMod = await import('./restaurant-view.js');
        if (restMod && typeof restMod.openRestaurantMenu === 'function') {
            restMod.openRestaurantMenu(vendorId);
            return;
        }
    } catch (e) {
        console.warn('[selectVendor] restaurant-view.js not available, falling back to inline catalog.');
    }

    selectedCategory = 'all';
    searchQuery = '';
    const searchInput = document.getElementById('search-input');
    if (searchInput) searchInput.value = '';

    renderVendorSwitcher();
    renderCategoryTabs();
    renderFlashDeal();
    renderCatalog();
    window.scrollTo({ top: 350, behavior: 'smooth' });
}

function renderCategoryTabs() {
    const container = document.getElementById('category-pills');
    if (!container) return;
    const vendor = vendors.find(v => v.id === selectedVendorId);
    if (!vendor) return;

    container.innerHTML = vendor.categories.map(cat => {
        const active = cat.id === selectedCategory;
        return `
            <button onclick="setCategoryTab('${cat.id}')"
                    class="px-3.5 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all ${active ? 'bg-snapp text-white shadow-sm shadow-pink-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}">
                ${cat.title}
            </button>
        `;
    }).join('');
}

function renderVendorHeader() {
    const vendor = vendors.find(v => v.id === selectedVendorId);
    if (!vendor) return '';

    return `
        <div class="bg-white rounded-2xl shadow-[0_2px_14px_-6px_rgba(0,0,0,0.08)] border border-gray-100 overflow-hidden mb-4 relative">
            <div class="h-28 w-full relative">
                <img src="${vendor.banner}" class="w-full h-full object-cover">
                <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                <div class="absolute bottom-3 right-3 text-white">
                    <h2 class="font-black text-sm mb-0.5 shadow-sm drop-shadow-md">${vendor.name}</h2>
                    <span class="text-[10px] font-medium opacity-90">${vendor.type}</span>
                </div>
                <div class="absolute bottom-3 left-3 vendor-badge text-white bg-white/20">
                    <span class="text-xs font-bold text-white">${toPersianDigits(vendor.rating)}</span>
                    <i data-lucide="star" class="w-3 h-3 fill-amber-400 text-amber-400"></i>
                </div>
            </div>
            <div class="p-3 flex items-center justify-between bg-gray-50/50 border-t border-gray-50">
                <div class="flex items-center gap-3 text-[10px] text-gray-600 font-bold">
                    <div class="delivery-time-indicator">
                        <i data-lucide="clock" class="w-3.5 h-3.5 text-gray-400"></i>
                        <span>${vendor.deliveryTime}</span>
                    </div>
                    <div class="w-1 h-1 bg-gray-300 rounded-full"></div>
                    <div class="delivery-time-indicator">
                        <i data-lucide="bike" class="w-3.5 h-3.5 text-gray-400"></i>
                        <span>${vendor.deliveryFee === 0 ? '<span class="text-emerald-600">ارسال رایگان (پرو)</span>' : formatPrice(vendor.deliveryFee) + ' تومان'}</span>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderFlashDeal() {
    if (window.FlashDealsAPI && typeof window.FlashDealsAPI.refresh === 'function') {
        window.FlashDealsAPI.refresh();
    }
}

function renderCatalog() {
    const container = document.getElementById('catalog-container');
    const emptyNotice = document.getElementById('empty-catalog');
    if (!container || container.dataset.customView === 'true') return;

    let html = renderVendorHeader();
    let items = catalogProducts.filter(p => p.vendorId === selectedVendorId);

    if (searchQuery.trim().length > 0) {
        items = items.filter(p => p.title.includes(searchQuery) || p.desc.includes(searchQuery));
    }
    if (selectedCategory !== 'all') {
        items = items.filter(p => p.categoryId === selectedCategory);
    }

    if (currentSort === 'discount') items.sort((a, b) => b.discount - a.discount);
    else if (currentSort === 'price-asc') items.sort((a, b) => a.price - b.price);
    else if (currentSort === 'price-desc') items.sort((a, b) => b.price - a.price);
    else if (currentSort === 'rating') items.sort((a, b) => b.rating - a.rating);

    if (items.length === 0) {
        container.innerHTML = html;
        if (emptyNotice) emptyNotice.classList.remove('hidden');
        if (window.lucide) lucide.createIcons();
        return;
    }
    if (emptyNotice) emptyNotice.classList.add('hidden');

    const totalCount = items.length;
    const visibleItems = items.slice(0, catalogDisplayLimit);
    const hasMore = totalCount > catalogDisplayLimit;

    const cards = visibleItems.map(item => {
        const qty = cartState.items[item.id]?.quantity || 0;
        const isFavorite = wishlistState.includes(item.id);
        const isBestseller = item.rating >= 4.7;

        return `
            <article class="bg-white rounded-2xl p-3.5 border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_4px_20px_-6px_rgba(0,0,0,0.10)] hover:border-gray-200 transition-all flex gap-3.5 items-start cursor-pointer" onclick="openProductModal(${item.id})">
                <div class="relative w-28 h-28 rounded-2xl overflow-hidden shrink-0 bg-gray-50 border border-gray-100">
                    <img src="${item.image}" alt="${item.title}" class="w-full h-full object-cover">
                    ${item.discount > 0 ? `<span class="discount-tag absolute top-1.5 right-1.5 shadow-sm">٪${toPersianDigits(item.discount)}</span>` : ''}
                    ${isBestseller ? `<span class="absolute top-1.5 left-1.5 bg-amber-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-md shadow-sm flex items-center gap-0.5"><i data-lucide="flame" class="w-2.5 h-2.5"></i>پرفروش</span>` : ''}
                    <button onclick="event.stopPropagation(); toggleWishlist(${item.id})" class="absolute bottom-1.5 left-1.5 w-7 h-7 rounded-full bg-white/85 backdrop-blur-md flex items-center justify-center text-gray-400 hover:text-red-500 shadow-sm active:scale-90 transition-all">
                        <i data-lucide="heart" class="w-4 h-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}"></i>
                    </button>
                </div>
                <div class="flex-1 flex flex-col justify-between min-h-[112px]">
                    <div>
                        <div class="flex items-start justify-between gap-1">
                            <h4 class="font-extrabold text-xs text-gray-900 leading-snug">${item.title}</h4>
                            <div class="vendor-badge bg-amber-50 text-amber-500 shrink-0 border-0 shadow-none px-1.5 py-0.5">
                                <i data-lucide="star" class="w-3 h-3 fill-amber-400 text-amber-400"></i><span>${toPersianDigits(item.rating)}</span>
                            </div>
                        </div>
                        <p class="text-[11px] text-gray-400 font-normal line-clamp-2 mt-1 leading-relaxed">${item.desc}</p>
                    </div>
                    <div class="flex items-center justify-between mt-2 pt-2 border-t border-gray-50" onclick="event.stopPropagation()">
                        <div>
                            ${item.discount > 0 ? `<span class="text-[10px] text-gray-400 line-through block">${formatPrice(item.originalPrice)}</span>` : ''}
                            <div class="text-xs font-black text-gray-900">${formatPrice(item.price)} <span class="text-[9px] font-normal text-gray-500 mr-0.5">تومان</span></div>
                        </div>
                        <div>
                            ${qty === 0 ? `
                                <button onclick="handleAddToCart(${item.id})" class="bg-snapp-light hover:bg-snapp hover:text-white text-snapp font-bold text-xs px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 active:scale-95 border border-snapp/20 shadow-sm">
                                    <i data-lucide="plus" class="w-3.5 h-3.5"></i><span>افزودن</span>
                                </button>
                            ` : `
                                <div class="flex items-center bg-snapp text-white rounded-xl shadow-sm p-0.5 gap-2">
                                    <button onclick="handleAddToCart(${item.id})" class="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-white/20 active:scale-90"><i data-lucide="plus" class="w-3.5 h-3.5"></i></button>
                                    <span class="text-xs font-black min-w-4 text-center select-none">${toPersianDigits(qty)}</span>
                                    <button onclick="handleDecrementCart(${item.id})" class="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-white/20 active:scale-90"><i data-lucide="${qty === 1 ? 'trash-2' : 'minus'}" class="w-3.5 h-3.5"></i></button>
                                </div>
                            `}
                        </div>
                    </div>
                </div>
            </article>
        `;
    }).join('');

    html += `<div class="space-y-4 pb-4">${cards}</div>`;

    if (hasMore) {
        const remaining = totalCount - catalogDisplayLimit;
        html += `
            <div class="flex justify-center pb-6 pt-2">
                <button onclick="window.loadMoreCatalogItems()" class="bg-white border-2 border-snapp text-snapp hover:bg-snapp hover:text-white font-black text-xs py-3.5 px-8 rounded-2xl transition-all active:scale-95 shadow-md shadow-pink-500/10 flex items-center gap-2">
                    <i data-lucide="chevron-down" class="w-4 h-4"></i>
                    <span>مشاهده ${toPersianDigits(Math.min(CATALOG_PAGE_SIZE, remaining))} آیتم بیشتر</span>
                    <span class="bg-snapp-light text-snapp text-[10px] font-black px-2 py-0.5 rounded-full">${toPersianDigits(remaining)} مانده</span>
                </button>
            </div>
        `;
    } else if (totalCount > CATALOG_PAGE_SIZE) {
        html += `
            <div class="text-center py-6 text-[10px] font-bold text-gray-400">
                ✓ همه ${toPersianDigits(totalCount)} آیتم این فروشگاه نمایش داده شد
            </div>
        `;
    }

    container.innerHTML = html;
    if (window.lucide) lucide.createIcons();
}

function getCartTotalItems() {
    return Object.values(cartState.items).reduce((acc, cur) => acc + cur.quantity, 0);
}

/* ============================================================
 * Floating bottom "View Cart" snack-bar prompt
 * ============================================================ */
let __cartPromptTimer = null;
let __cartPromptHideTimer = null;

function dismissCartPrompt() {
    if (__cartPromptTimer) {
        clearTimeout(__cartPromptTimer);
        __cartPromptTimer = null;
    }
    if (__cartPromptHideTimer) {
        clearTimeout(__cartPromptHideTimer);
        __cartPromptHideTimer = null;
    }

    const banner = document.getElementById('cart-add-prompt');
    if (!banner) return;

    banner.classList.remove('translate-y-0', 'opacity-100');
    banner.classList.add('translate-y-10', 'opacity-0');
    __cartPromptHideTimer = setTimeout(() => {
        if (banner && banner.parentNode) banner.remove();
        __cartPromptHideTimer = null;
    }, 300);
}

function showAddToCartPrompt(product) {
    if (!product) return;

    if (__cartPromptTimer) {
        clearTimeout(__cartPromptTimer);
        __cartPromptTimer = null;
    }
    if (__cartPromptHideTimer) {
        clearTimeout(__cartPromptHideTimer);
        __cartPromptHideTimer = null;
    }

    let banner = document.getElementById('cart-add-prompt');
    const isNewBanner = !banner;

    if (isNewBanner) {
        banner = document.createElement('div');
        banner.id = 'cart-add-prompt';
        banner.className = 'fixed bottom-20 left-1/2 -translate-x-1/2 z-[9999] w-[92%] max-w-sm bg-gray-900 text-white p-3 rounded-2xl shadow-2xl flex items-center justify-between gap-3 border border-white/10 font-vazir transition-all duration-300 transform translate-y-10 opacity-0';
        document.body.appendChild(banner);
    }

    banner.innerHTML = `
        <div class="flex items-center gap-2.5 min-w-0 flex-1">
            <img src="${product.image}" class="w-11 h-11 rounded-xl object-cover border border-white/20 shrink-0">
            <div class="min-w-0 flex-1">
                <div class="text-[11px] font-black truncate">${escapeHtml(product.title)}</div>
                <div class="text-[9px] text-emerald-400 font-bold mt-0.5 flex items-center gap-1">
                    <i data-lucide="check-circle-2" class="w-3 h-3"></i>
                    <span>به سبد خرید اضافه شد</span>
                </div>
            </div>
        </div>
        <button id="cart-add-prompt-view-btn"
                class="bg-snapp hover:bg-snapp-hover active:scale-95 text-white text-[11px] font-black px-3.5 py-2.5 rounded-xl shrink-0 shadow-md shadow-pink-500/30 transition-all flex items-center gap-1.5">
            <span>مشاهده سبد خرید</span>
            <i data-lucide="arrow-left" class="w-3.5 h-3.5"></i>
        </button>
    `;

    if (window.lucide) lucide.createIcons();

    const viewBtn = banner.querySelector('#cart-add-prompt-view-btn');
    if (viewBtn) {
        viewBtn.onclick = (e) => {
            e.stopPropagation();
            dismissCartPrompt();
            toggleCartDrawer(true);
        };
    }

    if (isNewBanner) {
        requestAnimationFrame(() => {
            banner.classList.remove('translate-y-10', 'opacity-0');
            banner.classList.add('translate-y-0', 'opacity-100');
        });
    } else {
        banner.classList.remove('translate-y-10', 'opacity-0');
        banner.classList.add('translate-y-0', 'opacity-100');
    }

    __cartPromptTimer = setTimeout(() => {
        __cartPromptTimer = null;
        dismissCartPrompt();
    }, 5000);
}

function handleAddToCart(productId, customAddons = [], overrideVendorId = null) {
    const numId = Number(productId);
    const product = catalogProducts.find(p => Number(p.id) === numId);
    if (!product) return;

    const vendorTarget = overrideVendorId || product.vendorId;

    const cartHasItems = getCartTotalItems() > 0;
    const isDifferentVendor = cartState.vendorId && cartState.vendorId !== vendorTarget;

    if (cartHasItems && isDifferentVendor) {
        cartState.items = {};
        cartState.vendorId = null;
    }

    executeAddToCart(numId, customAddons, vendorTarget);
}

function executeAddToCart(productId, addons, vendorId) {
    const numId = Number(productId);
    cartState.vendorId = vendorId;

    if (!cartState.items[numId]) {
        cartState.items[numId] = { quantity: 1, addons: addons };
    } else {
        cartState.items[numId].quantity += 1;
        if (addons && addons.length > 0) cartState.items[numId].addons = addons;
    }

    updateApplicationState();

    const product = catalogProducts.find(p => Number(p.id) === numId);
    if (product) {
        showAddToCartPrompt(product);
    }
}

function handleDecrementCart(productId) {
    const numId = Number(productId);
    if (!cartState.items[numId]) return;
    if (cartState.items[numId].quantity <= 1) {
        delete cartState.items[numId];
        if (getCartTotalItems() === 0) cartState.vendorId = null;
    } else {
        cartState.items[numId].quantity -= 1;
    }
    updateApplicationState();
}

function updateApplicationState() {
    renderCatalog();
    renderFlashDeal();
    updateCartSummary();
    renderDrawerItems();
}

function updateCartSummary() {
    let totalCount = 0;
    let subtotal = 0;
    let totalSavings = 0;

    for (const [id, state] of Object.entries(cartState.items)) {
        const product = catalogProducts.find(p => Number(p.id) === Number(id));
        if (!product) continue;
        totalCount += state.quantity;
        let unitPrice = product.price;
        if (state.addons && state.addons.length > 0) {
            state.addons.forEach(addon => unitPrice += addon.price);
        }
        subtotal += unitPrice * state.quantity;
        if (product.discount > 0) {
            totalSavings += (product.originalPrice - product.price) * state.quantity;
        }
    }

    const topBadge = document.getElementById('top-cart-badge');
    if (topBadge) {
        if (totalCount > 0) {
            topBadge.textContent = toPersianDigits(totalCount);
            topBadge.classList.remove('hidden');
        } else {
            topBadge.classList.add('hidden');
        }
    }

    const floatingBar = document.getElementById('floating-checkout-bar');
    if (floatingBar) {
        const floatingCount = document.getElementById('floating-cart-count');
        const floatingPrice = document.getElementById('floating-total-price');
        if (totalCount > 0) {
            floatingCount.textContent = toPersianDigits(totalCount);
            floatingPrice.textContent = formatPrice(subtotal);
            floatingBar.classList.remove('translate-y-28', 'opacity-0');
        } else {
            floatingBar.classList.add('translate-y-28', 'opacity-0');
            toggleCartDrawer(false);
        }
    }

    const cartVendor = vendors.find(v => v.id === cartState.vendorId);
    let deliveryFee = 0;
    if (totalCount > 0 && cartVendor) deliveryFee = cartVendor.deliveryFee;

    const couponDiscountAmount = subtotal * appliedCouponRate;
    const grandTotal = Math.max(0, subtotal - couponDiscountAmount + deliveryFee);

    const elCount = document.getElementById('drawer-items-count');
    if (elCount) elCount.textContent = `(${toPersianDigits(totalCount)} کالا)`;

    const elSubtotal = document.getElementById('drawer-subtotal');
    if (elSubtotal) elSubtotal.textContent = formatPrice(subtotal);

    const elDeliveryFee = document.getElementById('drawer-delivery-fee');
    if (elDeliveryFee) {
        elDeliveryFee.innerHTML = deliveryFee === 0 ? '<span class="text-emerald-600">رایگان (پرو)</span>' : `${formatPrice(deliveryFee)} تومان`;
    }

    const discountRow = document.getElementById('drawer-discount-row');
    if (discountRow) {
        const totalDiscountSum = totalSavings + couponDiscountAmount;
        if (totalDiscountSum > 0) {
            discountRow.classList.remove('hidden');
            document.getElementById('drawer-discount').textContent = formatPrice(totalDiscountSum);
        } else {
            discountRow.classList.add('hidden');
        }
    }

    const elGrand = document.getElementById('drawer-grand-total');
    if (elGrand) elGrand.textContent = formatPrice(grandTotal);

    if (window.lucide) lucide.createIcons();
}

function renderDrawerItems() {
    const container = document.getElementById('drawer-items-list');
    if (!container) return;

    const items = Object.entries(cartState.items);
    if (items.length === 0) {
        container.innerHTML = `
            <div class="text-center py-16 text-gray-400 font-vazir">
                <i data-lucide="shopping-bag" class="w-12 h-12 mx-auto mb-2 opacity-30 text-gray-400"></i>
                <p class="text-xs font-bold">سبد خرید شما در حال حاضر خالی است</p>
            </div>
        `;
        if (window.lucide) lucide.createIcons();
        return;
    }

    container.innerHTML = items.map(([id, state]) => {
        const item = catalogProducts.find(p => Number(p.id) === Number(id));
        if (!item) return '';
        let rowPrice = item.price;
        if (state.addons && state.addons.length > 0) {
            state.addons.forEach(addon => rowPrice += addon.price);
        }

        return `
            <div class="py-3.5 flex items-center justify-between gap-3 font-vazir">
                <img src="${item.image}" alt="${item.title}" class="w-12 h-12 rounded-xl object-cover border border-gray-100 shrink-0">
                <div class="min-w-0 flex-1">
                    <h5 class="font-bold text-xs text-gray-900 truncate">${item.title}</h5>
                    ${state.addons && state.addons.length > 0 ? `<div class="text-[10px] text-snapp truncate mt-0.5">+ ${state.addons.map(a => a.title).join('، ')}</div>` : ''}
                    <div class="text-xs font-black text-gray-700 mt-1">
                        ${formatPrice(rowPrice * state.quantity)}
                        <span class="text-[9px] font-normal text-gray-400 mr-0.5">تومان</span>
                    </div>
                </div>
                <div class="flex items-center bg-gray-100 rounded-xl p-1 gap-2 shrink-0">
                    <button onclick="handleAddToCart(${item.id})" class="w-6 h-6 flex items-center justify-center bg-white rounded-lg text-gray-800 shadow-sm active:scale-90"><i data-lucide="plus" class="w-3.5 h-3.5"></i></button>
                    <span class="text-xs font-black min-w-4 text-center">${toPersianDigits(state.quantity)}</span>
                    <button onclick="handleDecrementCart(${item.id})" class="w-6 h-6 flex items-center justify-center bg-white rounded-lg text-gray-800 shadow-sm active:scale-90"><i data-lucide="${state.quantity === 1 ? 'trash-2' : 'minus'}" class="w-3.5 h-3.5 text-rose-600"></i></button>
                </div>
            </div>
        `;
    }).join('');

    if (window.lucide) lucide.createIcons();
}

function toggleCartDrawer(open) {
    const backdrop = document.getElementById('cart-drawer-backdrop');
    const drawer = document.getElementById('cart-drawer');
    if (!backdrop || !drawer) return;

    if (open) {
        renderDrawerItems();
        updateCartSummary();
        backdrop.classList.remove('pointer-events-none', 'opacity-0');
        backdrop.classList.add('opacity-100');
        drawer.classList.remove('translate-y-full');
    } else {
        backdrop.classList.add('opacity-0', 'pointer-events-none');
        backdrop.classList.remove('opacity-100');
        drawer.classList.add('translate-y-full');
    }
}

function applyCoupon() {
    const input = document.getElementById('coupon-input');
    const msg = document.getElementById('coupon-message');
    if (!input || !msg) return;

    const code = input.value.trim().toUpperCase();

    if (code === 'SNAPP30') {
        appliedCouponRate = 0.30;
        msg.textContent = 'کد تخفیف ۳۰٪ با موفقیت اعمال شد.';
        msg.className = 'text-[11px] font-bold text-emerald-600 block';
    } else if (code === '') {
        appliedCouponRate = 0;
        msg.textContent = 'لطفاً کد تخفیف را وارد کنید.';
        msg.className = 'text-[11px] font-bold text-rose-500 block';
    } else {
        appliedCouponRate = 0;
        msg.textContent = 'کد تخفیف وارد شده نامعتبر است.';
        msg.className = 'text-[11px] font-bold text-rose-500 block';
    }
    updateCartSummary();
}

async function executeCheckout() {
    let subtotal = 0;
    for (const [id, state] of Object.entries(cartState.items)) {
        const product = catalogProducts.find(p => Number(p.id) === Number(id));
        if (!product) continue;
        let unitPrice = product.price;
        if (state.addons && state.addons.length > 0) {
            state.addons.forEach(addon => unitPrice += addon.price);
        }
        subtotal += unitPrice * state.quantity;
    }

    const cartVendor = vendors.find(v => v.id === cartState.vendorId);
    let deliveryFee = cartVendor ? cartVendor.deliveryFee : 0;
    const couponDiscountAmount = subtotal * appliedCouponRate;
    const grandTotal = Math.max(0, subtotal - couponDiscountAmount + deliveryFee);

    if (grandTotal === 0) return;

    try {
        const pg = await import('./payment-gateway.js');
        pg.startPayment(grandTotal, cartState, async () => {
            cartState = { vendorId: null, items: {} };
            appliedCouponRate = 0;
            const ci = document.getElementById('coupon-input');
            if (ci) ci.value = '';
            const cm = document.getElementById('coupon-message');
            if (cm) cm.classList.add('hidden');
            toggleCartDrawer(false);
            updateApplicationState();

            if (window.NotificationsAPI && window.NotificationsAPI.push) {
                window.NotificationsAPI.push({
                    type: 'order',
                    title: 'سفارش شما ثبت شد',
                    body: 'پرداخت شما با موفقیت انجام شد و سفارش در حال آماده‌سازی است.',
                    icon: 'package-check',
                    color: 'emerald'
                });
            }

            try {
                const tracking = await import('./order-tracking.js');
                if (tracking && typeof tracking.openOrderTracking === 'function') {
                    tracking.openOrderTracking();
                    return;
                }
            } catch (e) {
                console.warn('[Checkout] order-tracking.js not available, falling back to orders tab.');
            }

            const orderTabBtn = document.querySelector('.nav-tab[onclick*="orders"]');
            if (orderTabBtn) {
                switchNavTab(orderTabBtn, 'orders');
            }
        });
    } catch (error) {
        console.error("Failed to load the payment gateway module:", error);
        alert("خطا در اتصال به درگاه پرداخت. لطفاً دوباره تلاش کنید.");
    }
}

async function openProductModal(productId) {
    const numId = Number(productId);
    if (typeof window.openProductDetail === 'function') {
        window.openProductDetail(numId);
        return;
    }
    try {
        const mod = await import('./script_2.js');
        if (mod && mod.ExplodedViewBuilder) {
            const product = catalogProducts.find(p => Number(p.id) === numId);
            if (product) new mod.ExplodedViewBuilder(product);
        }
    } catch (err) {
        console.warn('[openProductModal] script_2.js load failed:', err);
    }
}

function toggleWishlist(productId) {
    const numId = Number(productId);
    const idx = wishlistState.indexOf(numId);
    if (idx > -1) wishlistState.splice(idx, 1);
    else wishlistState.push(numId);
    updateWishlistBadge();
    renderCatalog();
}

function updateWishlistBadge() {
    const badge = document.getElementById('wishlist-badge');
    if (!badge) return;
    if (wishlistState.length > 0) {
        badge.textContent = toPersianDigits(wishlistState.length);
        badge.classList.remove('hidden');
    } else {
        badge.classList.add('hidden');
    }
}

function openWishlistModal() {
    if (window.WishlistPageAPI && typeof window.WishlistPageAPI.open === 'function') {
        window.WishlistPageAPI.open();
        return;
    }

    const list = document.getElementById('wishlist-items-list');
    if (!list) return;

    if (wishlistState.length === 0) {
        list.innerHTML = '<p class="text-center py-8 text-xs text-gray-400 font-bold font-vazir">هنوز کالایی به علاقه‌مندی‌ها اضافه نکرده‌اید.</p>';
    } else {
        list.innerHTML = wishlistState.map(id => {
            const product = catalogProducts.find(p => Number(p.id) === Number(id));
            if (!product) return '';
            return `
                <div class="py-2.5 flex items-center justify-between font-vazir">
                    <div class="flex items-center gap-2">
                        <img src="${product.image}" class="w-10 h-10 rounded-lg object-cover">
                        <div>
                            <h5 class="text-xs font-bold text-gray-900">${product.title}</h5>
                            <span class="text-[11px] font-black text-snapp">${formatPrice(product.price)} تومان</span>
                        </div>
                    </div>
                    <button onclick="handleAddToCart(${product.id}); closeWishlistModal();"
                            class="text-xs bg-snapp text-white px-3 py-1.5 rounded-lg font-bold">
                        خرید
                    </button>
                </div>
            `;
        }).join('');
    }

    const modal = document.getElementById('wishlist-modal');
    if (!modal) return;
    modal.classList.remove('pointer-events-none', 'opacity-0');
    modal.classList.add('opacity-100');
    if (window.lucide) lucide.createIcons();
}

function closeWishlistModal(event) {
    if (event && event.target !== event.currentTarget && event.currentTarget.id !== 'wishlist-modal') return;
    const modal = document.getElementById('wishlist-modal');
    if (modal) modal.classList.add('opacity-0', 'pointer-events-none');
}

function openStoryModal(index) {
    activeStoryIndex = index;
    const story = storiesData[index];
    const modal = document.getElementById('story-modal');
    if (!modal || !story) return;

    const bars = document.getElementById('story-progress-bars');
    if (bars) {
        bars.innerHTML = storiesData.map((_, i) => `
            <div class="h-1 flex-1 bg-white/30 rounded-full overflow-hidden">
                <div class="h-full bg-white transition-all duration-3000"
                     id="story-bar-${i}"
                     style="width: ${i < index ? '100%' : '0%'}"></div>
            </div>
        `).join('');
    }

    const avatar = document.getElementById('story-avatar');
    if (avatar) avatar.src = story.image;
    const title = document.getElementById('story-title');
    if (title) title.textContent = story.title;
    const iconBox = document.getElementById('story-icon-box');
    if (iconBox) iconBox.textContent = story.icon;
    const heading = document.getElementById('story-heading');
    if (heading) heading.textContent = story.title;
    const desc = document.getElementById('story-description');
    if (desc) desc.textContent = story.desc;

    modal.classList.remove('hidden');
    modal.classList.add('flex');

    setTimeout(() => {
        const currentBar = document.getElementById(`story-bar-${index}`);
        if (currentBar) currentBar.style.width = '100%';
    }, 50);

    clearTimeout(storyTimer);
    storyTimer = setTimeout(() => {
        if (activeStoryIndex < storiesData.length - 1) {
            openStoryModal(activeStoryIndex + 1);
        } else {
            closeStoryModal();
        }
    }, 3000);
}

function closeStoryModal() {
    clearTimeout(storyTimer);
    const modal = document.getElementById('story-modal');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
}

function handleStoryAction() {
    closeStoryModal();
    selectCategoryFromGrid('burgers');
}

function handleSearch(value) {
    searchQuery = value;
    resetCatalogLimit();
    const clearBtn = document.getElementById('search-clear');
    if (clearBtn) {
        if (searchQuery.length > 0) clearBtn.classList.remove('hidden');
        else clearBtn.classList.add('hidden');
    }
    renderCatalog();
}

function clearSearch() {
    const input = document.getElementById('search-input');
    if (input) input.value = '';
    searchQuery = '';
    resetCatalogLimit();
    const clearBtn = document.getElementById('search-clear');
    if (clearBtn) clearBtn.classList.add('hidden');
    renderCatalog();
}

function setCategoryTab(categoryId) {
    selectedCategory = categoryId;
    resetCatalogLimit();
    renderCategoryTabs();
    renderCatalog();
}

function selectCategoryFromGrid(categoryId) {
    resetCatalogLimit();
    const vendor = vendors.find(v => v.id === selectedVendorId);
    if (vendor && vendor.categories.some(c => c.id === categoryId)) {
        selectedCategory = categoryId;
    } else {
        const fallback = vendors.find(v => v.categories.some(c => c.id === categoryId));
        if (fallback) {
            selectedVendorId = fallback.id;
            selectedCategory = categoryId;
            renderVendorSwitcher();
        }
    }
    renderCategoryTabs();
    renderCatalog();
    window.scrollTo({ top: 400, behavior: 'smooth' });
}

function applySort(type) {
    currentSort = type;
    resetCatalogLimit();
    document.querySelectorAll('.sort-chip').forEach(btn => {
        if (btn.dataset.sort === type) {
            btn.className = 'sort-chip px-3 py-1.5 rounded-full border border-snapp bg-snapp text-white transition-all shrink-0 active:scale-95 flex items-center gap-1';
        } else {
            btn.className = 'sort-chip px-3 py-1.5 rounded-full border border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300 transition-all shrink-0 active:scale-95 flex items-center gap-1';
        }
    });
    renderCatalog();
}

function toggleHomeSections(show) {
    const elements = [
        document.querySelector('header'),
        ...document.querySelectorAll('section'),
        document.getElementById('category-pills')?.parentElement,
        document.getElementById('empty-catalog')
    ];
    elements.forEach(el => {
        if (el) el.style.display = show ? '' : 'none';
    });
}

async function switchNavTab(button, tabId) {
    document.querySelectorAll('.nav-tab').forEach(b => {
        b.className = 'nav-tab flex flex-col items-center gap-1 text-gray-400 hover:text-gray-600';
    });
    if (button) {
        button.className = 'nav-tab flex flex-col items-center gap-1 text-snapp';
    }

    const catalog = document.getElementById('catalog-container');
    const appViews = await import('./interactive-views.js');

    if (tabId === 'home' || tabId === 'categories') {
        toggleHomeSections(true);
        if (catalog && catalog.dataset.customView) {
            catalog.dataset.customView = '';
            renderCatalog();
        }
        if (tabId === 'categories') window.scrollTo({ top: 120, behavior: 'smooth' });
        else window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
        toggleHomeSections(false);
        if (catalog) catalog.dataset.customView = 'true';

        if (tabId === 'deals') {
            appViews.renderDealsView(catalog);
        } else if (tabId === 'orders') {
            appViews.renderOrdersView(catalog);
        } else if (tabId === 'profile') {
            appViews.renderProfileView(catalog);
        }
        window.scrollTo({ top: 0, behavior: 'instant' });
    }
}
window.switchNavTab = switchNavTab;

async function openLocationModal() {
    try {
        const addressModule = await import('./address-manager.js');
        addressModule.openAddressManager();
    } catch (err) {
        console.error("Failed to load the Address Management System:", err);
        const newAddress = prompt(
            'نشانی تحویل جدید را وارد فرمایید:',
            'تهران، سعادت‌آباد، خیابان سرو غربی، پلاک ۲۴'
        );
        if (newAddress && newAddress.trim().length > 0) {
            const el = document.getElementById('header-address-text');
            if (el) el.textContent = newAddress.trim();
        }
    }
}
window.openLocationModal = openLocationModal;

function startFlashCountdown() {
    let totalSeconds = 5 * 3600 + 29 * 60 + 48;
    setInterval(() => {
        if (totalSeconds <= 0) return;
        totalSeconds--;
        const h = Math.floor(totalSeconds / 3600);
        const m = Math.floor((totalSeconds % 3600) / 60);
        const s = totalSeconds % 60;

        const hourEl = document.getElementById('flash-hour');
        if (hourEl) hourEl.textContent = toPersianDigits(h.toString().padStart(2, '0'));
        const minEl = document.getElementById('flash-min');
        if (minEl) minEl.textContent = toPersianDigits(m.toString().padStart(2, '0'));
        const secEl = document.getElementById('flash-sec');
        if (secEl) secEl.textContent = toPersianDigits(s.toString().padStart(2, '0'));
    }, 1000);
}

async function initApp() {
    loadGenerator().catch(() => {});

    try {
        const fig = await import('./food-image-generator.js');
        if (fig && typeof fig.refreshAllCatalogImages === 'function') {
            fig.refreshAllCatalogImages(catalogProducts);
        }
    } catch (e) {
        console.warn('[Bootstrap] food-image-generator.js not available');
    }

    let storiesHandledByModule = false;
    try {
        const sm = await import('./stories-manager.js');
        if (sm && typeof sm.renderStoryRail === 'function') {
            sm.renderStoryRail();
            storiesHandledByModule = true;
        }
    } catch (e) {
        console.warn('[Bootstrap] stories-manager.js not available, using inline renderStories()');
    }
    if (!storiesHandledByModule && typeof renderStories === 'function') {
        renderStories();
    }

    try {
        const vc = await import('./vendor-carousel.js');
        if (vc && typeof vc.injectVendorCarousel === 'function') {
            vc.injectVendorCarousel();
        }
    } catch (e) {
        console.warn('[Bootstrap] vendor-carousel.js not available');
    }

    try {
        await import('./product-detail.js');
    } catch (e) {
        console.warn('[Bootstrap] product-detail.js not available');
    }

    try {
        await import('./search-global.js');
    } catch (e) {
        console.warn('[Bootstrap] search-global.js not available');
    }

    try {
        const notif = await import('./notifications.js');
        if (notif && typeof notif.updateNotificationBadge === 'function') {
            notif.updateNotificationBadge();
        }
    } catch (e) {
        console.warn('[Bootstrap] notifications.js not available');
    }

    try {
        await import('./wishlist-page.js');
    } catch (e) {
        console.warn('[Bootstrap] wishlist-page.js not available');
    }

    try {
        await import('./order-tracking.js');
    } catch (e) {
        console.warn('[Bootstrap] order-tracking.js not available');
    }

    try {
        const fdm = await import('./filters-advanced.js');
        if (fdm && typeof fdm.initDarkMode === 'function') {
            fdm.initDarkMode();
        }
        if (fdm && typeof fdm.shouldShowOnboarding === 'function') {
            if (fdm.shouldShowOnboarding()) {
                setTimeout(() => {
                    if (typeof fdm.openOnboarding === 'function') fdm.openOnboarding();
                }, 400);
            }
        }
    } catch (e) {
        console.warn('[Bootstrap] filters-advanced.js not available');
    }

    try {
        const flash = await import('./flash-deals.js');
        if (flash && typeof flash.initFlashDeals === 'function') {
            flash.initFlashDeals();
        }
    } catch (e) {
        console.warn('[Bootstrap] flash-deals.js not available');
    }

    try {
        await import('./script_2.js');
    } catch (e) {
        console.warn('[Bootstrap] script_2.js not available');
    }

    renderVendorSwitcher();
    renderCategoryTabs();
    renderCatalog();
    updateCartSummary();
    startFlashCountdown();

    injectHomeWidgets();

    if (window.lucide) lucide.createIcons();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}