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

const catalogProducts = [
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
    { id: 38, vendorId: 'v7', categoryId: 'appetizers', title: 'نان سیر تنوری ایتالیایی', desc: 'خمیر نازک پیتزا پخته در تنور، روغن زیتون بکر، سیر رنده شده تازه، جعفری و پنیر پارمزان', price: 110000, originalPrice: 110000, discount: 0, stockLeft: 14, rating: 4.4, reviews: 290, image: 'https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?w=500&q=80', addons: [] },
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
let pendingCartAction  = null;
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
    return toPersianDigits(Math.round(a).toLocaleString('fa-IR'));
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

function waitForThree() {
    if (window.__THREE_READY__) return Promise.resolve();
    if (window.__THREE_ERROR__) return Promise.reject(window.__THREE_ERROR__);

    return new Promise((resolve, reject) => {
        const onReady = () => { cleanup(); resolve(); };
        const onError = () => { cleanup(); reject(window.__THREE_ERROR__); };
        const onTimeout = () => {
            cleanup();
            reject(new Error('زمان انتظار برای بارگذاری Three.js به پایان رسید.'));
        };
        const cleanup = () => {
            window.removeEventListener('three-ready', onReady);
            window.removeEventListener('three-error', onError);
            clearTimeout(timer);
        };
        window.addEventListener('three-ready', onReady);
        window.addEventListener('three-error', onError);
        const timer = setTimeout(onTimeout, 12000);
    });
}

function injectHomeWidgets() {
    injectSnappProPill();
    injectServiceCategoryGrid();
    injectPromoBanners();
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

    const cards = items.map(item => {
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
    container.innerHTML = html;
    if (window.lucide) lucide.createIcons();
}

function getCartTotalItems() {
    return Object.values(cartState.items).reduce((acc, cur) => acc + cur.quantity, 0);
}

function showCartClearConfirm() {
    let modal = document.getElementById('cart-confirm-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'cart-confirm-modal';
        modal.className = 'fixed inset-0 z-[60] bg-black/60 flex items-center justify-center p-4 opacity-0 pointer-events-none transition-opacity duration-300';
        modal.innerHTML = `
            <div class="bg-white rounded-2xl w-full max-w-[320px] p-5 cart-confirm-modal shadow-2xl font-vazir">
                <div class="w-12 h-12 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                </div>
                <h3 class="text-sm font-black text-center text-gray-900 mb-2">شروع سفارش جدید؟</h3>
                <p class="text-xs text-gray-500 text-center leading-relaxed mb-6">سبد خرید شما حاوی آیتم‌هایی از رستوران دیگری است. آیا مایلید سبد قبلی پاک شود؟</p>
                <div class="flex gap-3">
                    <button onclick="cancelCartClear()" class="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-xs font-bold active:scale-95 transition-all">خیر، انصراف</button>
                    <button onclick="confirmCartClear()" class="flex-1 py-2.5 rounded-xl bg-snapp text-white text-xs font-bold active:scale-95 transition-all shadow-md shadow-pink-500/20">بله، پاک شود</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    modal.classList.remove('opacity-0', 'pointer-events-none');
    modal.classList.add('opacity-100');
}

function cancelCartClear() {
    pendingCartAction = null;
    const modal = document.getElementById('cart-confirm-modal');
    if (modal) {
        modal.classList.remove('opacity-100');
        modal.classList.add('opacity-0', 'pointer-events-none');
    }
}

function confirmCartClear() {
    if (pendingCartAction) {
        cartState.items = {};
        executeAddToCart(pendingCartAction.productId, pendingCartAction.customAddons, pendingCartAction.newVendorId);
        pendingCartAction = null;
    }
    cancelCartClear();
}

function handleAddToCart(productId, customAddons = [], overrideVendorId = null) {
    const product = catalogProducts.find(p => p.id === productId);
    if (!product) return;

    const vendorTarget = overrideVendorId || product.vendorId;

    if (cartState.vendorId && cartState.vendorId !== vendorTarget && getCartTotalItems() > 0) {
        pendingCartAction = { productId, customAddons, newVendorId: vendorTarget };
        showCartClearConfirm();
        return;
    }
    executeAddToCart(productId, customAddons, vendorTarget);
}

function executeAddToCart(productId, addons, vendorId) {
    cartState.vendorId = vendorId;
    if (!cartState.items[productId]) {
        cartState.items[productId] = { quantity: 1, addons: addons };
    } else {
        cartState.items[productId].quantity += 1;
        if (addons && addons.length > 0) cartState.items[productId].addons = addons;
    }
    updateApplicationState();
}

function handleDecrementCart(productId) {
    if (!cartState.items[productId]) return;
    if (cartState.items[productId].quantity <= 1) {
        delete cartState.items[productId];
        if (getCartTotalItems() === 0) cartState.vendorId = null;
    } else {
        cartState.items[productId].quantity -= 1;
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
        const product = catalogProducts.find(p => p.id == id);
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
        const item = catalogProducts.find(p => p.id == id);
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
        const product = catalogProducts.find(p => p.id == id);
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

function openProductModal(productId) {
    if (typeof window.openProductDetail === 'function') {
        window.openProductDetail(productId);
        return;
    }
    const product = catalogProducts.find(p => p.id === productId);
    if (!product) return;
    new ExplodedViewBuilder(product);
}

class ExplodedViewBuilder {
    constructor(product) {
        this.product = product;
        this.targetProgress = 0.18;
        this.currentProgress = 0;
        this.rafId = null;
        this.mouseX = 0;
        this.mouseY = 0;
        this.smoothMouseX = 0;
        this.smoothMouseY = 0;
        this.destroyed = false;
        this.ready = false;
        this.isFlatDish = false;
        this.responsiveBaseZ = 11;

        this.dragActive = false;
        this.dragStartY = 0;
        this.dragStartProgress = 0;
        this.dragVelocity = 0;
        this.lastDragY = 0;
        this.lastDragTime = 0;

        this.layers = [];
        this.labelEls = [];

        document.body.style.overflow = 'hidden';
        this.buildDOM();
        this.boot();
    }

    buildDOM() {
        this.container = document.createElement('div');
        this.container.className = 'exploded-overlay font-vazir';
        Object.assign(this.container.style, {
            position: 'fixed', top: '0', left: '0', width: '100vw',
            height: '100dvh',
            zIndex: '9999',
            background: 'radial-gradient(ellipse at 50% 35%, #1a1a24 0%, #0a0a0e 70%, #050508 100%)',
            overflowY: 'auto', overflowX: 'hidden',
            opacity: '0', transition: 'opacity 0.6s ease',
            WebkitOverflowScrolling: 'touch'
        });

        this.scrollTrack = document.createElement('div');
        Object.assign(this.scrollTrack.style, { position: 'relative', width: '100%', height: '320vh' });

        this.viewport = document.createElement('div');
        Object.assign(this.viewport.style, { position: 'sticky', top: '0', width: '100%', height: '100dvh', overflow: 'hidden' });

        this.canvas = document.createElement('canvas');
        Object.assign(this.canvas.style, { position: 'absolute', top: '0', left: '0', width: '100%', height: '100%', zIndex: '10', pointerEvents: 'none', display: 'block' });

        this.loadingText = document.createElement('div');
        Object.assign(this.loadingText.style, {
            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            color: 'rgba(255,255,255,0.75)', fontWeight: '700', fontSize: '12px', zIndex: '60',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px'
        });
        this.loadingText.innerHTML = `
            <div style="width:40px;height:40px;border:2px solid rgba(255,0,166,0.3);border-top-color:#FF00A6;border-radius:9999px;animation:spin 0.9s linear infinite;"></div>
            <span>در حال رندر نمای سه‌بعدی...</span>
        `;

        this.instruction = document.createElement('div');
        Object.assign(this.instruction.style, {
            position: 'absolute',
            top: 'calc(5.5rem + env(safe-area-inset-top, 0px))',
            left: '50%', transform: 'translateX(-50%)',
            background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.15)', color: '#fff', padding: '8px 16px', borderRadius: '9999px',
            fontSize: '11px', fontWeight: '700', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '8px',
            zIndex: '50', pointerEvents: 'none', opacity: '0', transition: 'opacity 0.5s ease'
        });
        this.instruction.innerHTML = `<i data-lucide="mouse-pointer-click" class="w-4 h-4"></i> با انگشت بکشید تا لایه‌ها باز شوند`;

        this.labelsContainer = document.createElement('div');
        Object.assign(this.labelsContainer.style, { position: 'absolute', inset: '0', zIndex: '40', pointerEvents: 'none' });

        this.progressIndicator = document.createElement('div');
        Object.assign(this.progressIndicator.style, {
            position: 'absolute',
            bottom: 'calc(6.5rem + env(safe-area-inset-bottom, 0px))',
            left: '50%', transform: 'translateX(-50%)',
            width: '80px', height: '3px', background: 'rgba(255,255,255,0.1)', borderRadius: '9999px',
            overflow: 'hidden', zIndex: '45', opacity: '0', transition: 'opacity 0.4s ease'
        });
        this.progressIndicator.innerHTML = `<div id="exploded-progress-fill" style="width:0%;height:100%;background:linear-gradient(90deg,#FF00A6,#FFD600);transition:width 0.1s linear;"></div>`;

        this.footer = document.createElement('div');
        Object.assign(this.footer.style, {
            position: 'absolute', bottom: '0', left: '0', width: '100%',
            padding: '18px 20px calc(24px + env(safe-area-inset-bottom, 0px))',
            background: 'linear-gradient(to top, rgba(10,10,14,0.95) 0%, rgba(10,10,14,0.5) 70%, transparent 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: '50'
        });
        this.footer.innerHTML = `
            <div class="min-w-0 flex-1 ml-3">
                <h3 class="text-white font-black text-sm mb-1 truncate">${this.product.title}</h3>
                <div class="text-snapp font-black text-lg leading-none">
                    ${formatPrice(this.product.price)}
                    <span class="text-[10px] text-gray-400 font-normal">تومان</span>
                </div>
            </div>
            <button id="exploded-add-btn" class="bg-snapp hover:bg-snapp-hover text-white text-xs font-black px-6 py-3.5 rounded-2xl shadow-2xl shadow-pink-500/40 flex items-center gap-2 active:scale-95 transition-transform pointer-events-auto shrink-0 min-h-[44px]">
                <i data-lucide="shopping-bag" class="w-4 h-4"></i>
                افزودن به سبد
            </button>
        `;

        this.closeBtn = document.createElement('button');
        Object.assign(this.closeBtn.style, {
            position: 'absolute',
            top: 'calc(1.25rem + env(safe-area-inset-top, 0px))',
            right: '1rem', width: '40px', height: '40px',
            background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.15)', borderRadius: '9999px', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: '50', cursor: 'pointer', pointerEvents: 'auto'
        });
        this.closeBtn.innerHTML = `<i data-lucide="x" class="w-5 h-5"></i>`;
        this.closeBtn.addEventListener('mouseenter', () => { this.closeBtn.style.background = 'rgba(255,255,255,0.15)'; });
        this.closeBtn.addEventListener('mouseleave', () => { this.closeBtn.style.background = 'rgba(255,255,255,0.08)'; });

        this.viewport.appendChild(this.canvas);
        this.viewport.appendChild(this.loadingText);
        this.viewport.appendChild(this.labelsContainer);
        this.viewport.appendChild(this.instruction);
        this.viewport.appendChild(this.progressIndicator);
        this.viewport.appendChild(this.closeBtn);
        this.viewport.appendChild(this.footer);
        this.scrollTrack.appendChild(this.viewport);
        this.container.appendChild(this.scrollTrack);
        document.body.appendChild(this.container);

        if (window.lucide) lucide.createIcons();
        requestAnimationFrame(() => { this.container.style.opacity = '1'; });
    }

    async boot() {
        try {
            await waitForThree();
            this.THREE = window.__THREE__;
            this.postFX = window.__POST_FX__;
            this.matMod = window.__MAT__;

            await new Promise(r => requestAnimationFrame(r));
            await new Promise(r => requestAnimationFrame(r));
            if (this.destroyed) return;

            this.setupScene();
            await this.buildModel();
            this.createLabels();
            this.bindEvents();
            this.animate();

            this.loadingText.style.display = 'none';
            this.instruction.style.opacity = '1';
            this.progressIndicator.style.opacity = '1';
            this.ready = true;
        } catch (err) {
            this.showError(err);
        }
    }

    showError(err) {
        if (!this.loadingText) return;
        this.loadingText.style.display = 'flex';
        this.loadingText.innerHTML = `
            <div style="width:44px;height:44px;border-radius:9999px;background:rgba(255,68,68,0.15);border:1px solid rgba(255,68,68,0.4);display:flex;align-items:center;justify-content:center;color:#ff4444;font-size:20px;font-weight:900;">!</div>
            <span style="color:#ff6b6b;font-weight:800;">خطا در بارگذاری نمای سه‌بعدی</span>
            <span style="color:rgba(255,255,255,0.5);font-size:10px;">${(err && err.message) || err}</span>
        `;
    }

    setupScene() {
        const THREE = this.THREE;
        const w = window.innerWidth;
        const h = window.innerHeight;
        const aspect = w / h;
        const isPortrait = aspect < 1.0;

        this.scene = new THREE.Scene();
        this.scene.background = null;

        this.camera = new THREE.PerspectiveCamera(isPortrait ? 44 : 38, aspect, 0.1, 100);

        this.responsiveBaseZ = isPortrait
            ? (this.isFlatDish ? 19 : 17.5)
            : (this.isFlatDish ? 12 : 11);
        this.camera.position.set(0, 0, this.responsiveBaseZ);
        this.camera.lookAt(0, 0, 0);

        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance'
        });
        this.renderer.setSize(w, h, false);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        this.matMod.initLighting(this.scene);

        const { EffectComposer, RenderPass, UnrealBloomPass, OutputPass } = this.postFX;

        this.composer = new EffectComposer(this.renderer);
        this.composer.setSize(w, h);
        this.composer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        this.composer.addPass(new RenderPass(this.scene, this.camera));
        this.composer.addPass(new UnrealBloomPass(new THREE.Vector2(w, h), 0.55, 0.55, 0.85));
        this.composer.addPass(new OutputPass());

        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.15;
    }

    async buildModel() {
        let mod;
        let result;
        this.isFlatDish = false;

        if (this.product.id === 4 || this.product.title.includes('بندری')) {
            mod = await import('./bandari-stack.js');
            result = mod.buildBandari3D(this.scene);
        } else if (this.product.id === 1) {
            mod = await import('./burger-classic.js');
            result = mod.buildClassicBurger3D(this.scene);
        } else if (this.product.id === 2) {
            mod = await import('./burger-smash.js');
            result = mod.buildSmashBurger3D(this.scene);
        } else if (this.product.categoryId === 'pizza' || this.product.title.includes('پیتزا')) {
            mod = await import('./pizza-stack.js');
            result = mod.buildPizza3D(this.scene);
            this.isFlatDish = true;
        } else if (this.product.categoryId === 'burgers') {
            mod = await import('./burger-mushroom.js');
            result = mod.buildMushroomBurger3D(this.scene);
        } else {
            mod = await import('./geometry-stack.js');
            this.geoMod = mod;
            mod.explosionLayers.length = 0;
            while (mod.burgerGroup.children.length > 0) mod.burgerGroup.remove(mod.burgerGroup.children[0]);
            mod.buildProduct3D(this.scene, this.product);
            result = { group: mod.burgerGroup, layers: mod.explosionLayers };
            if (['pizza', 'kebab', 'ash', 'traditional', 'appetizers'].includes(this.product.categoryId)) {
                this.isFlatDish = true;
            }
        }

        this.geoMod = mod;
        this.burgerGroup = result.group;
        this.layers = result.layers;

        if (!this.layers || this.layers.length === 0) {
            throw new Error('هیچ لایه‌ای برای این محصول ساخته نشد.');
        }

        if (this.burgerGroup.parent !== this.scene) {
            this.scene.add(this.burgerGroup);
        }

        const w = window.innerWidth;
        const h = window.innerHeight;
        const aspect = w / h;
        const isPortrait = aspect < 1.0;

        if (isPortrait) {
            this.burgerGroup.scale.setScalar(0.68);
        }

        this.camera.fov = isPortrait ? 44 : 38;
        this.responsiveBaseZ = isPortrait
            ? (this.isFlatDish ? 19 : 17.5)
            : (this.isFlatDish ? 12 : 11);
        this.camera.position.set(0, 0, this.responsiveBaseZ);
        this.camera.updateProjectionMatrix();

        this.createAmbientParticles();
    }

    createAmbientParticles() {
        const THREE = this.THREE;
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

        this.ambientParticles = new THREE.Points(geo, this.matMod.materials.frostParticleMat);
        this.scene.add(this.ambientParticles);
    }

    createLabels() {
        this.labelEls = [];

        this.layers.forEach(layer => {
            const el = document.createElement('div');
            el.className = 'exploded-label';
            el.dataset.side = layer.side || 'right';

            const text = layer.text || 'محتوا';

            if (el.dataset.side === 'left') {
                el.innerHTML = `
                    <span class="exp-text">${text}</span>
                    <span class="exp-line"></span>
                    <span class="exp-dot"></span>
                `;
            } else {
                el.innerHTML = `
                    <span class="exp-dot"></span>
                    <span class="exp-line"></span>
                    <span class="exp-text">${text}</span>
                `;
            }

            this.labelsContainer.appendChild(el);
            this.labelEls.push(el);
        });
    }

    bindEvents() {
        this.scrollHandler = () => {
            if (this.dragActive) return;
            const maxScroll = this.scrollTrack.scrollHeight - this.container.clientHeight;
            if (maxScroll <= 0) return;
            const p = Math.max(0, Math.min(1, this.container.scrollTop / maxScroll));
            this.targetProgress = p;

            const fill = document.getElementById('exploded-progress-fill');
            if (fill) fill.style.width = (p * 100) + '%';

            this.instruction.style.opacity = p > 0.06 ? '0' : '1';
            this.progressIndicator.style.opacity = p > 0.95 ? '0' : '1';
        };

        this.mouseHandler = (e) => {
            this.mouseX = (e.clientX / window.innerWidth) * 2 - 1;
            this.mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
        };

        this.touchHandler = (e) => {
            if (e.touches.length > 0) {
                this.mouseX = (e.touches[0].clientX / window.innerWidth) * 2 - 1;
                this.mouseY = -(e.touches[0].clientY / window.innerHeight) * 2 + 1;
            }
        };

        this.directPointerDown = (e) => {
            if (e.target.closest('#exploded-add-btn') || e.target.closest('button')) return;
            this.dragActive = true;
            this.dragStartY = e.clientY;
            this.dragStartProgress = this.targetProgress;
            this.dragVelocity = 0;
            this.lastDragY = e.clientY;
            this.lastDragTime = performance.now();
            this.container.style.overflowY = 'hidden';
        };

        this.directPointerMove = (e) => {
            if (!this.dragActive) return;
            const dy = e.clientY - this.dragStartY;
            const now = performance.now();
            const dt = Math.max(1, now - this.lastDragTime);
            const instantVy = (e.clientY - this.lastDragY) / dt;
            this.dragVelocity = instantVy;
            this.lastDragY = e.clientY;
            this.lastDragTime = now;

            const norm = -dy / (window.innerHeight * 0.55);
            const next = Math.max(0, Math.min(1, this.dragStartProgress + norm));
            this.targetProgress = next;

            const fill = document.getElementById('exploded-progress-fill');
            if (fill) fill.style.width = (next * 100) + '%';
        };

        this.directPointerUp = () => {
            if (!this.dragActive) return;
            this.dragActive = false;
            this.container.style.overflowY = 'auto';
            const inertia = -this.dragVelocity * 0.4;
            this.targetProgress = Math.max(0, Math.min(1, this.targetProgress + inertia));
        };

        this.resizeHandler = () => {
            if (!this.renderer) return;
            const w = window.innerWidth;
            const h = window.innerHeight;
            const aspect = w / h;
            const isPortrait = aspect < 1.0;

            this.camera.aspect = aspect;
            this.camera.fov = isPortrait ? 44 : 38;

            this.responsiveBaseZ = isPortrait
                ? (this.isFlatDish ? 19 : 17.5)
                : (this.isFlatDish ? 12 : 11);

            if (this.burgerGroup) {
                this.burgerGroup.scale.setScalar(isPortrait ? 0.68 : 1.0);
            }

            this.camera.updateProjectionMatrix();
            this.renderer.setSize(w, h, false);
            if (this.composer) this.composer.setSize(w, h);
        };

        this.closeHandler = () => this.destroy();
        this.addHandler = () => {
            handleAddToCart(this.product.id, []);
            this.destroy();
        };

        this.container.addEventListener('scroll', this.scrollHandler, { passive: true });
        window.addEventListener('mousemove', this.mouseHandler, { passive: true });
        window.addEventListener('touchstart', this.touchHandler, { passive: true });
        window.addEventListener('touchmove', this.touchHandler, { passive: true });
        window.addEventListener('resize', this.resizeHandler);
        this.closeBtn.addEventListener('click', this.closeHandler);

        this.viewport.addEventListener('pointerdown', this.directPointerDown);
        this.viewport.addEventListener('pointermove', this.directPointerMove);
        this.viewport.addEventListener('pointerup', this.directPointerUp);
        this.viewport.addEventListener('pointercancel', this.directPointerUp);
        this.viewport.addEventListener('pointerleave', this.directPointerUp);

        const addBtn = this.footer.querySelector('#exploded-add-btn');
        if (addBtn) addBtn.addEventListener('click', this.addHandler);
    }

    animate() {
        if (!this.renderer || this.destroyed) return;

        this.currentProgress += (this.targetProgress - this.currentProgress) * 0.09;
        this.smoothMouseX += (this.mouseX - this.smoothMouseX) * 0.06;
        this.smoothMouseY += (this.mouseY - this.smoothMouseY) * 0.06;

        for (let i = 0; i < this.layers.length; i++) {
            const layer = this.layers[i];
            const y = layer.closedY + (layer.openY - layer.closedY) * this.currentProgress;
            layer.mesh.position.y = y;
        }

        const aspectNow = window.innerWidth / window.innerHeight;
        const isPortraitNow = aspectNow < 1.0;

        if (this.burgerGroup) {
            const jitterFactor = isPortraitNow ? 0.32 : 0.55;

            if (this.isFlatDish) {
                this.burgerGroup.rotation.x = (Math.PI * 0.22) + (this.smoothMouseY * jitterFactor);
                this.burgerGroup.rotation.z = -0.08;
                this.burgerGroup.rotation.y = (this.currentProgress * Math.PI * 2.0) + (this.smoothMouseX * 0.35);
            } else {
                this.burgerGroup.rotation.x = this.smoothMouseY * jitterFactor;
                this.burgerGroup.rotation.z = 0;
                this.burgerGroup.rotation.y = (this.currentProgress * Math.PI * 1.3) + (this.smoothMouseX * 0.35);
            }
        }

        if (this.ambientParticles) {
            const delta = 0.016;
            const pos = this.ambientParticles.geometry.attributes.position;
            const speeds = this.ambientParticles.geometry.userData.speeds;
            for (let i = 0; i < pos.count; i++) {
                let y = pos.getY(i) - speeds[i] * delta * 0.45;
                if (y < -8) y = 8;
                pos.setY(i, y);
            }
            pos.needsUpdate = true;
            this.ambientParticles.rotation.y += delta * 0.035;
        }

        const explodeSpreadZ = isPortraitNow ? 3.5 : 5.5;
        this.camera.position.x = this.smoothMouseX * 1.4;
        this.camera.position.y = this.smoothMouseY * (isPortraitNow ? 0.6 : 1.2);
        this.camera.position.z = this.responsiveBaseZ + (this.currentProgress * explodeSpreadZ);
        this.camera.lookAt(0, 0, 0);

        this.updateLabels();

        if (this.composer) {
            this.composer.render();
        } else {
            this.renderer.render(this.scene, this.camera);
        }

        this.rafId = requestAnimationFrame(() => this.animate());
    }

    updateLabels() {
        if (!this.labelEls || !this.layers) return;

        const w = window.innerWidth;
        const h = window.innerHeight;
        const aspect = w / h;
        const isMobile = aspect < 1.0;
        const centerX = w / 2;

        const labelOpacity = Math.max(0, Math.min(1, (this.currentProgress - 0.15) * 3));

        const v = this._tempVec || (this._tempVec = new this.THREE.Vector3());

        const sideMargin = isMobile ? 55 : 85;

        for (let i = 0; i < this.layers.length; i++) {
            const el = this.labelEls[i];
            if (!el) continue;

            const layer = this.layers[i];

            v.set(0, layer.mesh.position.y, 0);
            v.applyEuler(this.burgerGroup.rotation);
            v.project(this.camera);

            const screenY = (1 - v.y) * 0.5 * h;

            const isLeft = el.dataset.side === 'left';

            if (isLeft) {
                const anchorX = centerX - sideMargin;
                el.style.left = anchorX + 'px';
                el.style.transform = 'translate(-100%, -50%)';
            } else {
                const anchorX = centerX + sideMargin;
                el.style.left = anchorX + 'px';
                el.style.transform = 'translate(0, -50%)';
            }

            el.style.top = screenY + 'px';
            el.style.opacity = labelOpacity;
        }
    }

    destroy() {
        this.destroyed = true;
        cancelAnimationFrame(this.rafId);
        window.removeEventListener('mousemove', this.mouseHandler);
        window.removeEventListener('touchstart', this.touchHandler);
        window.removeEventListener('touchmove', this.touchHandler);
        window.removeEventListener('resize', this.resizeHandler);

        this.container.style.opacity = '0';

        setTimeout(() => {
            try {
                if (this.burgerGroup) {
                    this.burgerGroup.traverse(obj => {
                        if (obj.geometry && typeof obj.geometry.dispose === 'function') {
                            obj.geometry.dispose();
                        }
                    });
                    if (this.burgerGroup.parent) {
                        this.burgerGroup.parent.remove(this.burgerGroup);
                    }
                    while (this.burgerGroup.children.length > 0) {
                        this.burgerGroup.remove(this.burgerGroup.children[0]);
                    }
                }
                if (this.ambientParticles) {
                    this.ambientParticles.geometry.dispose();
                    this.scene.remove(this.ambientParticles);
                }
                if (this.geoMod && this.geoMod.burgerGroup) {
                    this.geoMod.burgerGroup.traverse(obj => {
                        if (obj.geometry && typeof obj.geometry.dispose === 'function') {
                            obj.geometry.dispose();
                        }
                    });
                }
            } catch (err) {
                console.warn('[ExplodedView] Dispose warning:', err);
            }

            if (this.composer && typeof this.composer.dispose === 'function') {
                this.composer.dispose();
            }
            if (this.renderer && typeof this.renderer.dispose === 'function') {
                this.renderer.dispose();
            }

            this.container.remove();
            document.body.style.overflow = '';
        }, 550);
    }
}

function toggleWishlist(productId) {
    const idx = wishlistState.indexOf(productId);
    if (idx > -1) wishlistState.splice(idx, 1);
    else wishlistState.push(productId);
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
            const product = catalogProducts.find(p => p.id === id);
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
    const clearBtn = document.getElementById('search-clear');
    if (clearBtn) clearBtn.classList.add('hidden');
    renderCatalog();
}

function setCategoryTab(categoryId) {
    selectedCategory = categoryId;
    renderCategoryTabs();
    renderCatalog();
}

function selectCategoryFromGrid(categoryId) {
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