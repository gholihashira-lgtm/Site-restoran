/* ==========================================================================
 * interactive-views.js
 * --------------------------------------------------------------------------
 * Fully Interactive View Management System for Loghme Shop / Loghme Food.
 * Implements Deals, Orders, Profile, Modals, and Cart Integrations.
 * ========================================================================== */

let activeIntervals = [];

// Clean up any running timers when switching views
function clearViewIntervals() {
    activeIntervals.forEach(clearInterval);
    activeIntervals = [];
}

/* ==========================================================================
 * MOCK DATASETS FOR VIEWS (IDs synced with catalog in script.js)
 * ========================================================================== */

const pastOrders = [
    {
        id: 8849201,
        categoryId: 'kebab',
        categoryName: 'رستوران',
        vendorId: 'v4',
        vendorName: 'کباب‌سرای سنتی توسکا',
        logo: 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=200&q=80',
        date: 'جمعه ۲۷ شهریور · ۲۰:۱۹',
        address: 'سعادت‌آباد، خیابان سرو غربی، پلاک ۲۴',
        status: 'تحویل شده',
        deliveryFee: 0,
        discount: 0,
        totalPaid: 935000,
        rated: false,
        items: [
            { id: 23, name: 'چلو کباب کوبیده گوسفندی', qty: 2, price: 450000, image: 'https://images.unsplash.com/photo-1627012046423-93d39da6a8b7?w=200&q=80' },
            { id: 45, name: 'دوغ محلی نعنایی آبعلی', qty: 1, price: 35000, image: 'https://images.unsplash.com/photo-1556881286-fc6915169721?w=200&q=80' }
        ]
    },
    {
        id: 7738192,
        categoryId: 'pizza',
        categoryName: 'فست‌فود',
        vendorId: 'v2',
        vendorName: 'پیتزا ساندویچ ارم',
        logo: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=200&q=80',
        date: 'سه‌شنبه ۲ شهریور · ۱۳:۴۵',
        address: 'سعادت‌آباد، خیابان سرو غربی، پلاک ۲۴',
        status: 'تحویل شده',
        deliveryFee: 25000,
        discount: 48000,
        totalPaid: 297000,
        rated: true,
        ratingValue: 5,
        items: [
            { id: 15, name: 'پیتزا پپرونی تنوری', qty: 1, price: 320000, image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=200&q=80' }
        ]
    },
    {
        id: 6627381,
        categoryId: 'burgers',
        categoryName: 'کافه',
        vendorId: 'v1',
        vendorName: 'فست‌فود و کافه گیم ژوبین',
        logo: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=200&q=80',
        date: 'دوشنبه ۱ شهریور · ۱۸:۳۰',
        address: 'سعادت‌آباد، خیابان سرو غربی، پلاک ۲۴',
        status: 'تحویل شده',
        deliveryFee: 35000,
        discount: 0,
        totalPaid: 611000,
        rated: false,
        items: [
            { id: 1, name: 'برگر کلاسیک دست‌ساز ژوبین', qty: 2, price: 288000, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&q=80' }
        ]
    }
];

const hotDeals = [
    {
        id: 101,
        vendorId: 'v_sweets',
        vendorName: 'کافه باقلوا سیلوا',
        vendorLogo: 'https://images.unsplash.com/photo-1559553156-2e97137af16f?w=100&q=80',
        deliveryTime: '۲۵ دقیقه',
        deliveryFee: 20300,
        title: 'باقلوا نعلی گردویی ۳ عدد',
        rating: 4.1,
        originalPrice: 120000,
        price: 96000,
        discount: 20,
        stockLabel: '۵ عدد',
        image: 'https://images.unsplash.com/photo-1599598425947-33002629b5fa?w=300&q=80'
    },
    {
        id: 102,
        vendorId: 'v_sweets',
        vendorName: 'کافه باقلوا سیلوا',
        vendorLogo: 'https://images.unsplash.com/photo-1559553156-2e97137af16f?w=100&q=80',
        deliveryTime: '۲۵ دقیقه',
        deliveryFee: 20300,
        title: 'باقلوا پیتزایی پسته ۳ عدد',
        rating: 4.8,
        originalPrice: 185000,
        price: 157250,
        discount: 15,
        stockLabel: '۲ عدد',
        image: 'https://images.unsplash.com/photo-1616428784132-75d31562b772?w=300&q=80'
    }
];

const trendingVendors = [
    { id: 'v4', name: 'کباب‌سرای توسکا', logo: 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=100&q=80' },
    { id: 'v2', name: 'پیتزا ارم', logo: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=100&q=80' },
    { id: 'v1', name: 'فست‌فود ژوبین', logo: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=100&q=80' },
    { id: 'v3', name: 'عمه جون', logo: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=100&q=80' }
];

/* ==========================================================================
 * GLOBAL INTERACTIVE API
 * ========================================================================== */

window.IV_API = {
    setOrderFilter: function(category) {
        window.IV_STATE.currentOrderFilter = category;
        const container = document.getElementById('orders-list-container');
        if (container) container.innerHTML = generateOrderCardsHTML();

        document.querySelectorAll('.order-filter-pill').forEach(pill => {
            if (pill.dataset.cat === category) {
                pill.className = 'order-filter-pill bg-snapp text-white px-4 py-1.5 rounded-full text-xs font-bold shrink-0 shadow-md shadow-pink-500/20 transition-all';
            } else {
                pill.className = 'order-filter-pill bg-white border border-gray-200 text-gray-600 px-4 py-1.5 rounded-full text-xs font-bold shrink-0 hover:bg-gray-50 transition-all cursor-pointer';
            }
        });
        if (window.lucide) lucide.createIcons();
    },

    openInvoice: function(orderId) {
        const order = pastOrders.find(o => Number(o.id) === Number(orderId));
        if (!order) return;

        const existing = document.getElementById('invoice-modal');
        if (existing) existing.remove();

        const modal = document.createElement('div');
        modal.id = 'invoice-modal';
        modal.className = 'fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4 opacity-0 transition-opacity duration-300 backdrop-blur-sm font-vazir';

        const itemsHtml = order.items.map(item => `
            <div class="flex justify-between items-center text-xs py-2 border-b border-gray-100 border-dashed">
                <div class="flex items-center gap-2">
                    <span class="bg-gray-100 text-gray-700 font-bold px-1.5 py-0.5 rounded">${window.AppAPI.toPersianDigits(item.qty)}x</span>
                    <span class="text-gray-800 font-medium truncate max-w-[150px]">${item.name}</span>
                </div>
                <span class="font-bold text-gray-900">${window.AppAPI.formatPrice(item.price * item.qty)} <span class="text-[9px] font-normal text-gray-500">تومان</span></span>
            </div>
        `).join('');

        modal.innerHTML = `
            <div class="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl transform scale-95 transition-transform duration-300" id="invoice-content">
                <div class="h-1.5 bg-gradient-to-l from-snapp via-pink-500 to-rose-500"></div>
                <div class="bg-gray-50 p-4 border-b border-gray-200 flex justify-between items-center">
                    <div>
                        <h3 class="font-black text-sm text-gray-900">فاکتور سفارش</h3>
                        <div class="text-[10px] text-gray-500 mt-1">کد پیگیری: Snapp-${order.id}</div>
                    </div>
                    <button onclick="window.IV_API.closeInvoice()" class="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors">
                        <i data-lucide="x" class="w-4 h-4"></i>
                    </button>
                </div>

                <div class="p-4 space-y-4">
                    <div class="flex items-center gap-3">
                        <img src="${order.logo}" class="w-10 h-10 rounded-full border border-gray-100">
                        <div>
                            <div class="font-bold text-xs text-gray-900">${order.vendorName}</div>
                            <div class="text-[10px] text-gray-500 mt-0.5">${order.date}</div>
                        </div>
                    </div>

                    <div class="bg-gray-50 rounded-xl p-3 border border-gray-100">
                        ${itemsHtml}
                        <div class="pt-2 space-y-2 text-[11px]">
                            <div class="flex justify-between text-gray-600">
                                <span>هزینه ارسال:</span>
                                <span>${order.deliveryFee === 0 ? 'رایگان' : window.AppAPI.formatPrice(order.deliveryFee) + ' تومان'}</span>
                            </div>
                            <div class="flex justify-between text-rose-600 font-bold">
                                <span>تخفیف:</span>
                                <span>${order.discount === 0 ? '۰' : '-' + window.AppAPI.formatPrice(order.discount)} تومان</span>
                            </div>
                        </div>
                    </div>

                    <div class="flex justify-between items-center border-t border-gray-200 pt-3">
                        <span class="font-black text-sm text-gray-900">مبلغ نهایی:</span>
                        <span class="font-black text-snapp text-lg">${window.AppAPI.formatPrice(order.totalPaid)} <span class="text-[10px] text-gray-500 font-normal">تومان</span></span>
                    </div>

                    <div class="text-[10px] text-gray-500 bg-gray-50 p-2 rounded-lg flex items-start gap-1.5 border border-gray-100">
                        <i data-lucide="map-pin" class="w-3.5 h-3.5 shrink-0 mt-0.5"></i>
                        <span>${order.address}</span>
                    </div>
                </div>

                <div class="p-4 bg-gray-50 border-t border-gray-100 flex gap-3">
                    <button onclick="window.print()" class="flex-1 bg-white border border-gray-200 text-gray-700 font-bold text-xs py-3 rounded-xl hover:bg-gray-100 transition-colors flex items-center justify-center gap-2">
                        <i data-lucide="printer" class="w-4 h-4"></i> چاپ فاکتور
                    </button>
                    <button onclick="window.IV_API.closeInvoice()" class="flex-1 bg-gray-800 text-white font-bold text-xs py-3 rounded-xl hover:bg-gray-900 transition-colors">
                        بستن
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        if (window.lucide) lucide.createIcons();

        requestAnimationFrame(() => {
            modal.classList.remove('opacity-0');
            document.getElementById('invoice-content').classList.remove('scale-95');
        });
    },

    closeInvoice: function() {
        const modal = document.getElementById('invoice-modal');
        if (modal) {
            modal.classList.add('opacity-0');
            document.getElementById('invoice-content').classList.add('scale-95');
            setTimeout(() => modal.remove(), 300);
        }
    },

    reorder: function(orderId) {
        const order = pastOrders.find(o => Number(o.id) === Number(orderId));
        if (!order) return;

        window.AppAPI.clearCart();
        order.items.forEach(item => {
            for (let i = 0; i < item.qty; i++) {
                window.AppAPI.handleAddToCart(Number(item.id), [], order.vendorId);
            }
        });

        window.AppAPI.updateApplicationState();
        window.AppAPI.toggleCartDrawer(true);
        window.IV_API.showToast('اقلام سفارش با موفقیت به سبد خرید شما افزوده شد.');
    },

    openRating: function(orderId) {
        const order = pastOrders.find(o => Number(o.id) === Number(orderId));
        if (!order || order.rated) return;

        window.IV_STATE.activeRatingOrderId = orderId;
        window.IV_STATE.currentRatingValue = 0;

        const existing = document.getElementById('rating-modal');
        if (existing) existing.remove();

        const modal = document.createElement('div');
        modal.id = 'rating-modal';
        modal.className = 'fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4 opacity-0 transition-opacity duration-300 backdrop-blur-sm font-vazir';

        modal.innerHTML = `
            <div class="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl transform scale-95 transition-transform duration-300" id="rating-content">
                <div class="p-5 text-center">
                    <h3 class="font-black text-sm text-gray-900 mb-1">ثبت امتیاز برای ${order.vendorName}</h3>
                    <p class="text-xs text-gray-500 mb-6">آیا از کیفیت سفارش خود راضی بودید؟</p>

                    <div class="flex justify-center gap-2 mb-6" id="rating-stars-container" onmouseleave="window.IV_API.hoverStar(0)">
                        ${[1, 2, 3, 4, 5].map(star => `
                            <button onmouseenter="window.IV_API.hoverStar(${star})" onclick="window.IV_API.lockStar(${star})" class="transition-transform hover:scale-110">
                                <i data-lucide="star" id="star-${star}" class="w-8 h-8 text-gray-300 transition-colors"></i>
                            </button>
                        `).join('')}
                    </div>

                    <div class="flex flex-wrap justify-center gap-2 mb-5">
                        ${['کیفیت عالی غذا', 'بسته‌بندی مناسب', 'تحویل سریع و گرم', 'برخورد مناسب پیک'].map(tag => `
                            <button onclick="this.classList.toggle('bg-emerald-50'); this.classList.toggle('border-emerald-500'); this.classList.toggle('text-emerald-700')" 
                                    class="border border-gray-200 text-gray-500 text-[10px] font-bold px-3 py-1.5 rounded-full transition-colors">
                                ${tag}
                            </button>
                        `).join('')}
                    </div>

                    <textarea placeholder="توضیحات بیشتر (اختیاری)" class="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs focus:outline-none focus:border-snapp mb-5 resize-none h-20"></textarea>

                    <div class="flex gap-3">
                        <button onclick="window.IV_API.closeRating()" class="flex-1 bg-gray-100 text-gray-600 font-bold text-xs py-3.5 rounded-xl hover:bg-gray-200 transition-colors">انصراف</button>
                        <button onclick="window.IV_API.submitRating()" class="flex-1 bg-snapp text-white font-bold text-xs py-3.5 rounded-xl hover:bg-snapp-hover active:scale-95 transition-all shadow-md shadow-pink-500/30">ثبت نظر</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        if (window.lucide) lucide.createIcons();

        requestAnimationFrame(() => {
            modal.classList.remove('opacity-0');
            document.getElementById('rating-content').classList.remove('scale-95');
        });
    },

    hoverStar: function(value) {
        const locked = window.IV_STATE.currentRatingValue;
        const target = value === 0 ? locked : value;
        for (let i = 1; i <= 5; i++) {
            const star = document.getElementById(`star-${i}`);
            if (!star) continue;
            if (i <= target) {
                star.classList.remove('text-gray-300');
                star.classList.add('text-amber-400', 'fill-amber-400');
            } else {
                star.classList.remove('text-amber-400', 'fill-amber-400');
                star.classList.add('text-gray-300');
            }
        }
    },

    lockStar: function(value) {
        window.IV_STATE.currentRatingValue = value;
        window.IV_API.hoverStar(value);
    },

    closeRating: function() {
        const modal = document.getElementById('rating-modal');
        if (modal) {
            modal.classList.add('opacity-0');
            document.getElementById('rating-content').classList.add('scale-95');
            setTimeout(() => modal.remove(), 300);
        }
    },

    submitRating: function() {
        const orderId = window.IV_STATE.activeRatingOrderId;
        const rating = window.IV_STATE.currentRatingValue;
        if (rating === 0) {
            window.IV_API.showToast('لطفاً ابتدا یک امتیاز (ستاره) انتخاب کنید.');
            return;
        }

        const order = pastOrders.find(o => Number(o.id) === Number(orderId));
        if (order) {
            order.rated = true;
            order.ratingValue = rating;
        }

        window.IV_API.closeRating();
        window.IV_API.showToast('امتیاز و نظر شما با موفقیت ثبت شد.');

        const container = document.getElementById('orders-list-container');
        if (container) container.innerHTML = generateOrderCardsHTML();
    },

    hopToVendor: function(vendorId) {
        window.AppAPI.selectVendor(vendorId);
        const homeTab = document.querySelector('[onclick*="\'home\'"]');
        if (homeTab) {
            window.AppAPI.switchNavTab(homeTab, 'home');
        }
    },

    addDealToCart: function(dealId) {
        const numId = Number(dealId);
        const deal = hotDeals.find(d => Number(d.id) === numId);
        if (!deal) return;

        if (!window.AppAPI.catalogProducts.find(p => Number(p.id) === numId)) {
            window.AppAPI.catalogProducts.push({
                id: deal.id,
                vendorId: deal.vendorId,
                categoryId: 'sweets',
                title: deal.title, 
                desc: 'شیرینی و باقلوا ویژه',
                price: deal.price,
                originalPrice: deal.originalPrice, 
                discount: deal.discount,
                stockLeft: 5,
                rating: deal.rating,
                reviews: 100, 
                image: deal.image,
                addons: []
            });
        }

        window.AppAPI.handleAddToCart(numId, [], deal.vendorId);
        window.IV_API.showToast(`«${deal.title}» به سبد خرید افزوده شد.`);
    },

    goBackHome: function() {
        const homeTab = document.querySelector('[onclick*="\'home\'"]');
        if (homeTab) {
            window.AppAPI.switchNavTab(homeTab, 'home');
        }
    },

    showToast: function(message) {
        const existing = document.getElementById('iv-toast');
        if (existing) existing.remove();

        const toast = document.createElement('div');
        toast.id = 'iv-toast';
        toast.className = 'fixed top-4 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-5 py-3 rounded-xl text-xs font-bold shadow-2xl z-[10010] transition-all duration-300 transform -translate-y-10 opacity-0 flex items-center gap-2 w-max max-w-[90vw] font-vazir';
        toast.innerHTML = `<i data-lucide="check-circle-2" class="w-4 h-4 text-emerald-400"></i> <span>${message}</span>`;

        document.body.appendChild(toast);
        if (window.lucide) lucide.createIcons();

        requestAnimationFrame(() => {
            toast.classList.remove('-translate-y-10', 'opacity-0');
            toast.classList.add('translate-y-0', 'opacity-100');
        });

        setTimeout(() => {
            toast.classList.remove('translate-y-0', 'opacity-100');
            toast.classList.add('-translate-y-10', 'opacity-0');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
};

window.IV_STATE = {
    currentOrderFilter: 'all',
    activeRatingOrderId: null,
    currentRatingValue: 0
};

/* ==========================================================================
 * 1. HOT DEALS VIEW ("تخفیف داغ")
 * ========================================================================== */

export function renderDealsView(container) {
    clearViewIntervals();

    let html = `
        <div class="-mx-4 -mt-3 bg-white min-h-screen pb-24 font-vazir relative">
            <div class="sticky top-0 z-40 bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100 flex items-center justify-between p-4">
                <div class="flex items-center gap-2">
                    <span class="text-xl">🎉</span>
                    <h2 class="font-black text-sm text-gray-900">خرید خونه با تخفیف</h2>
                </div>
                <button onclick="window.IV_API.goBackHome()" class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors">
                    <i data-lucide="arrow-left" class="w-4 h-4"></i>
                </button>
            </div>

            <div class="mx-4 mt-4 p-3.5 bg-rose-50 rounded-xl border border-rose-100 flex justify-between items-center shadow-sm relative overflow-hidden">
                <span class="text-rose-600 font-bold text-xs flex items-center gap-1.5">
                    <span class="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                    تا پایان تخفیف‌ها
                </span>
                <div class="flex items-center gap-1 font-mono text-sm font-black text-rose-700 bg-white px-2.5 py-1 rounded-lg shadow-sm border border-rose-100/50" dir="ltr">
                    <span id="deal-hr">۰۵</span> : <span id="deal-min">۵۳</span> : <span id="deal-sec">۴۲</span>
                </div>
            </div>

            <div class="mt-6 px-4">
                <h3 class="text-xs font-black text-gray-900 mb-3 flex items-center gap-1.5">
                    <i data-lucide="trending-up" class="w-4 h-4 text-snapp"></i>
                    فروشگاه‌های پرطرفدار
                </h3>
                <div class="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                    ${trendingVendors.map(v => `
                        <div onclick="window.IV_API.hopToVendor('${v.id}')" class="flex flex-col items-center gap-2 shrink-0 cursor-pointer hover:scale-105 transition-transform">
                            <div class="w-14 h-14 rounded-full border border-gray-200 p-0.5 bg-white shadow-sm">
                                <img src="${v.logo}" class="w-full h-full rounded-full object-cover">
                            </div>
                            <span class="text-[9px] font-bold text-gray-700">${v.name}</span>
                        </div>
                    `).join('')}
                </div>
            </div>

            <div class="mt-4 px-4 grid grid-cols-1 gap-4">
                ${hotDeals.map(deal => `
                    <div class="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_4px_18px_-6px_rgba(0,0,0,0.10)] p-3 hover:border-snapp/30 transition-all">
                        <div class="flex items-center justify-between mb-3 pb-2 border-b border-gray-50">
                            <div class="flex items-center gap-2">
                                <img src="${deal.vendorLogo}" class="w-6 h-6 rounded-md object-cover border border-gray-100">
                                <span class="text-[10px] font-bold text-gray-700">${deal.vendorName}</span>
                            </div>
                            <div class="flex items-center gap-2 text-[9px] font-bold text-gray-500 bg-gray-50 px-2 py-1 rounded-md">
                                <span class="flex items-center gap-0.5"><i data-lucide="clock" class="w-3 h-3 text-gray-400"></i> ${deal.deliveryTime}</span>
                                <div class="w-1 h-1 bg-gray-300 rounded-full"></div>
                                <span class="flex items-center gap-0.5"><i data-lucide="bike" class="w-3 h-3 text-gray-400"></i> ${window.AppAPI.formatPrice(deal.deliveryFee)} تومان</span>
                            </div>
                        </div>
                        <div class="flex gap-3">
                            <div class="relative w-24 h-24 rounded-xl overflow-hidden shrink-0 border border-gray-100 bg-gray-50">
                                <img src="${deal.image}" class="w-full h-full object-cover">
                                <span class="absolute bottom-1.5 left-1.5 bg-white/90 backdrop-blur text-gray-800 text-[10px] font-black px-1.5 py-0.5 rounded-md shadow-sm">${deal.stockLabel}</span>
                            </div>
                            <div class="flex-1 flex flex-col justify-between py-1">
                                <div>
                                    <div class="flex justify-between items-start gap-1">
                                        <h4 class="font-extrabold text-xs text-gray-900 leading-snug">${deal.title}</h4>
                                        <div class="flex items-center gap-0.5 text-[9px] font-bold text-amber-500 bg-amber-50 px-1.5 py-0.5 rounded-md shrink-0">
                                            <i data-lucide="star" class="w-2.5 h-2.5 fill-amber-400 text-amber-400"></i> ${window.AppAPI.toPersianDigits(deal.rating)}
                                        </div>
                                    </div>
                                </div>
                                <div class="flex items-center justify-between mt-2">
                                    <span class="bg-rose-600 text-white font-black text-[10px] px-1.5 py-0.5 rounded-md shadow-sm">٪${window.AppAPI.toPersianDigits(deal.discount)}</span>
                                    <div class="text-left flex-1 pl-2">
                                        <div class="text-[10px] text-gray-400 line-through mb-0.5">${window.AppAPI.formatPrice(deal.originalPrice)}</div>
                                        <div class="text-xs font-black text-gray-900">${window.AppAPI.formatPrice(deal.price)} <span class="text-[9px] font-normal text-gray-500">تومان</span></div>
                                    </div>
                                    <button onclick="window.IV_API.addDealToCart(${deal.id})" class="bg-snapp-light hover:bg-snapp hover:text-white text-snapp font-bold text-xs px-2.5 py-1.5 rounded-lg active:scale-95 transition-all flex items-center gap-1 shadow-sm shrink-0 border border-snapp/20">
                                        <i data-lucide="plus" class="w-3.5 h-3.5"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;

    container.innerHTML = html;
    if (window.lucide) lucide.createIcons();

    let totalSeconds = 5 * 3600 + 53 * 60 + 42;
    const intervalId = setInterval(() => {
        if (totalSeconds <= 0) return;
        totalSeconds--;
        const h = Math.floor(totalSeconds / 3600);
        const m = Math.floor((totalSeconds % 3600) / 60);
        const s = totalSeconds % 60;

        const hEl = document.getElementById('deal-hr');
        const mEl = document.getElementById('deal-min');
        const sEl = document.getElementById('deal-sec');

        if (hEl) hEl.textContent = window.AppAPI.toPersianDigits(h.toString().padStart(2, '0'));
        if (mEl) mEl.textContent = window.AppAPI.toPersianDigits(m.toString().padStart(2, '0'));
        if (sEl) sEl.textContent = window.AppAPI.toPersianDigits(s.toString().padStart(2, '0'));
    }, 1000);
    activeIntervals.push(intervalId);
}

/* ==========================================================================
 * 2. ORDER HISTORY VIEW ("سفارش‌ها")
 * ========================================================================== */

function generateOrderCardsHTML() {
    const filter = window.IV_STATE.currentOrderFilter;
    const filteredOrders = filter === 'all' ? pastOrders : pastOrders.filter(o => o.categoryName === filter);

    if (filteredOrders.length === 0) {
        return `
            <div class="text-center py-16 px-4">
                <div class="w-16 h-16 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
                    <i data-lucide="receipt" class="w-8 h-8"></i>
                </div>
                <h4 class="font-extrabold text-sm text-gray-800">سفارشی یافت نشد!</h4>
                <p class="text-xs text-gray-400 mt-1">تا کنون در این دسته‌بندی سفارشی ثبت نکرده‌اید.</p>
            </div>
        `;
    }

    return filteredOrders.map(order => `
        <div class="bg-white rounded-2xl p-4 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-100 hover:shadow-[0_4px_18px_-6px_rgba(0,0,0,0.10)] transition-all">
            <div class="flex justify-between items-center mb-3">
                <span class="bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-md text-[10px] font-bold shadow-sm border border-emerald-100/50 flex items-center gap-1">
                    <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    ${order.status}
                </span>
                <i data-lucide="chevron-left" class="w-4 h-4 text-gray-400"></i>
            </div>

            <div class="flex items-center gap-3 mb-3 cursor-pointer" onclick="window.IV_API.hopToVendor('${order.vendorId}')">
                <div class="w-10 h-10 rounded-full border border-gray-100 p-0.5 shrink-0 bg-white">
                    <img src="${order.logo}" class="w-full h-full rounded-full object-cover">
                </div>
                <div>
                    <h4 class="font-extrabold text-xs text-gray-900 hover:text-snapp transition-colors">${order.vendorName}</h4>
                    <div class="text-[10px] text-gray-400 font-medium mt-1">${order.date}</div>
                </div>
            </div>

            <div class="text-[10px] font-medium text-gray-500 mb-3 border-b border-gray-50 pb-3 truncate flex items-center gap-1.5">
                <i data-lucide="map-pin" class="w-3 h-3 text-gray-400 shrink-0"></i>
                تحویل به ${order.address}
            </div>

            <div class="flex gap-2 mb-4 overflow-x-auto no-scrollbar">
                ${order.items.map(item => `
                    <div class="relative w-12 h-12 rounded-lg bg-gray-50 border border-gray-100 shrink-0">
                        <img src="${item.image}" class="w-full h-full object-cover rounded-lg">
                        <span class="absolute -top-1.5 -right-1.5 bg-gray-800 text-white min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center text-[9px] font-black border-2 border-white shadow-sm">${window.AppAPI.toPersianDigits(item.qty)}</span>
                    </div>
                `).join('')}
            </div>

            <div class="flex justify-between items-center mb-4 bg-gray-50 p-2.5 rounded-xl border border-gray-100/50">
                <span class="text-[11px] font-bold text-gray-500">مبلغ نهایی:</span>
                <span class="font-black text-sm text-gray-900">${window.AppAPI.formatPrice(order.totalPaid)} <span class="text-[10px] font-normal text-gray-500">تومان</span></span>
            </div>

            <div class="flex gap-2">
                <button onclick="window.IV_API.reorder(${order.id})" class="flex-1 bg-snapp-light hover:bg-snapp hover:text-white text-snapp font-bold text-xs py-3 rounded-xl transition-all border border-snapp/20 active:scale-95 shadow-sm flex items-center justify-center gap-1.5">
                    <i data-lucide="rotate-ccw" class="w-3.5 h-3.5"></i> سفارش مجدد
                </button>
                <button onclick="window.IV_API.openInvoice(${order.id})" class="flex-1 bg-white hover:bg-gray-50 text-gray-700 font-bold text-xs py-3 rounded-xl border border-gray-200 transition-colors active:scale-95 shadow-sm">مشاهده فاکتور</button>
            </div>

            ${order.rated ? `
                <div class="mt-4 pt-3 border-t border-gray-50 flex justify-between items-center bg-emerald-50/50 -mx-4 -mb-4 px-4 pb-4 rounded-b-2xl">
                    <span class="text-[11px] font-bold text-emerald-700 flex items-center gap-1.5"><i data-lucide="check-circle-2" class="w-3.5 h-3.5"></i> امتیاز ثبت گردید (★ ${window.AppAPI.toPersianDigits(order.ratingValue)})</span>
                </div>
            ` : `
                <div class="mt-4 pt-3 border-t border-gray-50 flex justify-between items-center bg-amber-50/30 -mx-4 -mb-4 px-4 pb-4 rounded-b-2xl">
                    <span class="text-[11px] font-bold text-gray-600">به این سفارش امتیاز دهید.</span>
                    <button onclick="window.IV_API.openRating(${order.id})" class="text-amber-600 bg-white shadow-sm hover:bg-amber-50 text-[11px] font-bold border border-amber-200 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors active:scale-95">
                        <i data-lucide="star" class="w-3 h-3 fill-amber-500 text-amber-500"></i> ثبت امتیاز
                    </button>
                </div>
            `}
        </div>
    `).join('');
}

export function renderOrdersView(container) {
    clearViewIntervals();
    window.IV_STATE.currentOrderFilter = 'all';

    const pills = [
        { id: 'all', text: 'همه', icon: 'list' },
        { id: 'رستوران', text: 'رستوران', icon: 'utensils' },
        { id: 'فست‌فود', text: 'فست‌فود', icon: 'sandwich' },
        { id: 'کافه', text: 'کافه', icon: 'coffee' },
        { id: 'شیرینی', text: 'شیرینی', icon: 'cake' }
    ];

    let html = `
        <div class="-mx-4 -mt-3 bg-gray-50 min-h-screen pb-24 font-vazir relative">
            <div class="sticky top-0 z-40 bg-white/95 backdrop-blur shadow-sm border-b border-gray-100 flex gap-2 p-3 overflow-x-auto no-scrollbar">
                <div class="bg-gray-100 text-gray-400 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shrink-0 select-none">
                    <i data-lucide="sliders-horizontal" class="w-3.5 h-3.5"></i> فیلترها
                </div>
                ${pills.map((p, i) => `
                    <button data-cat="${p.id}" onclick="window.IV_API.setOrderFilter('${p.id}')" 
                            class="order-filter-pill ${i === 0 ? 'bg-snapp text-white shadow-md shadow-pink-500/20' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'} px-4 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all flex items-center gap-1.5">
                        <i data-lucide="${p.icon}" class="w-3.5 h-3.5"></i> ${p.text}
                    </button>
                `).join('')}
            </div>

            <div class="p-4 space-y-4" id="orders-list-container">
                ${generateOrderCardsHTML()}
            </div>
        </div>
    `;

    container.innerHTML = html;
    if (window.lucide) lucide.createIcons();
}

/* ==========================================================================
 * 3. USER PROFILE VIEW ("حساب من")
 * ========================================================================== */

export async function renderProfileView(container) {
    clearViewIntervals();

    // Ensure the interactive module is loaded
    await import('./profile-interactions.js');

    const html = `
        <div class="-mx-4 -mt-3 bg-gray-50 min-h-screen pb-24 font-vazir relative">

            <!-- Profile Header -->
            <div class="p-5 bg-white flex justify-between items-center shadow-sm border-b border-gray-100">
                <div class="flex items-center gap-3">
                    <div class="w-12 h-12 bg-gradient-to-br from-snapp-light to-pink-100 rounded-full flex items-center justify-center text-snapp border border-snapp/20 shadow-inner">
                        <i data-lucide="user" class="w-6 h-6"></i>
                    </div>
                    <div>
                        <h2 class="profile-user-name font-black text-lg text-gray-900">سید ارمیا مفیدی</h2>
                        <div class="text-[11px] font-medium text-gray-500 mt-1 flex items-center gap-1" dir="ltr">
                            <i data-lucide="smartphone" class="w-3 h-3"></i> ۰۹۳۹۱۷۷۸۱۴۴
                        </div>
                    </div>
                </div>
                <button onclick="window.PI_API.openEditProfile()" class="text-[10px] text-snapp font-bold flex items-center gap-0.5 hover:bg-snapp-light px-2.5 py-2 rounded-xl border border-snapp/20 transition-all active:scale-95 shadow-sm">
                    ویرایش <i data-lucide="edit-2" class="w-3 h-3"></i>
                </button>
            </div>

            <!-- Loghme Pro VIP Card -->
            <div onclick="window.PI_API.openProDetails()" class="mx-4 mt-5 rounded-2xl p-4 bg-gradient-to-r from-purple-800 to-indigo-900 text-white shadow-xl shadow-indigo-900/20 relative overflow-hidden cursor-pointer hover:scale-[1.01] transition-transform">
                <div class="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                <div class="absolute -left-4 -bottom-8 w-24 h-24 bg-amber-400/20 rounded-full blur-xl"></div>

                <div class="flex justify-between items-center mb-5 relative z-10">
                    <span class="bg-amber-400 text-purple-950 text-[10px] font-black px-2.5 py-1 rounded-md tracking-widest uppercase shadow-sm flex items-center gap-1"><i data-lucide="crown" class="w-3 h-3"></i> Pro</span>
                    <span class="text-[11px] font-bold text-indigo-50 bg-white/10 px-2.5 py-1 rounded-lg border border-white/10 backdrop-blur-sm">${window.AppAPI.toPersianDigits(93)} روز مانده تا پایان اشتراک</span>
                </div>

                <div class="flex justify-between items-center relative z-10 bg-white/10 rounded-xl p-3.5 backdrop-blur-sm border border-white/10 shadow-inner">
                    <div class="flex-1 text-center">
                        <div class="text-[9px] font-bold text-indigo-200 mb-1.5">سفارش‌های پرو</div>
                        <div class="font-black text-sm text-white">${window.AppAPI.toPersianDigits(39)} عدد</div>
                    </div>
                    <div class="w-px h-8 bg-white/20"></div>
                    <div class="flex-1 text-center">
                        <div class="text-[9px] font-bold text-indigo-200 mb-1.5">مجموع سود پرو</div>
                        <div class="font-black text-sm text-amber-400">${window.AppAPI.formatPrice(3200941)} <span class="text-[9px] font-normal text-indigo-100">تومان</span> 🎉</div>
                    </div>
                </div>
            </div>

            <!-- Account Actions List -->
            <div class="mt-6 bg-white border-y border-gray-100 divide-y divide-gray-50 shadow-sm">

                <div onclick="window.PI_API.openOneClickPay()" class="p-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer transition-colors group">
                    <div class="flex items-center gap-3.5">
                        <div class="w-9 h-9 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-500 group-hover:text-snapp group-hover:bg-snapp-light group-hover:border-snapp/20 transition-all shadow-sm">
                            <i data-lucide="zap" class="w-4 h-4"></i>
                        </div>
                        <div>
                            <div class="font-extrabold text-xs text-gray-800">پرداخت سریع (با یک کلیک)</div>
                            <div class="text-[10px] text-amber-500 font-bold mt-1">خطا در ارائه دهنده سرویس</div>
                        </div>
                    </div>
                    <i data-lucide="chevron-left" class="w-4 h-4 text-gray-300"></i>
                </div>

                <div onclick="window.PI_API.openWallet()" class="p-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer transition-colors group">
                    <div class="flex items-center gap-3.5">
                        <div class="w-9 h-9 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-500 group-hover:text-snapp group-hover:bg-snapp-light group-hover:border-snapp/20 transition-all shadow-sm">
                            <i data-lucide="wallet" class="w-4 h-4"></i>
                        </div>
                        <div>
                            <div class="font-extrabold text-xs text-gray-800">تراکنش‌ها و کیف پول</div>
                            <div class="text-[10px] text-gray-400 font-medium mt-1">موجودی: ${window.AppAPI.formatPrice(1250000)} تومان</div>
                        </div>
                    </div>
                    <i data-lucide="chevron-left" class="w-4 h-4 text-gray-300"></i>
                </div>

                <div onclick="window.PI_API.openClub()" class="p-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer transition-colors group">
                    <div class="flex items-center gap-3.5">
                        <div class="w-9 h-9 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-500 group-hover:text-snapp group-hover:bg-snapp-light group-hover:border-snapp/20 transition-all shadow-sm">
                            <i data-lucide="award" class="w-4 h-4"></i>
                        </div>
                        <div>
                            <div class="font-extrabold text-xs text-gray-800">لقمه! کلاب</div>
                            <div class="text-[10px] text-amber-500 font-bold mt-1">خطا در دریافت امتیاز</div>
                        </div>
                    </div>
                    <i data-lucide="chevron-left" class="w-4 h-4 text-gray-300"></i>
                </div>

                <div onclick="window.PI_API.openVouchers()" class="p-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer transition-colors group">
                    <div class="flex items-center gap-3.5">
                        <div class="w-9 h-9 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-500 group-hover:text-snapp group-hover:bg-snapp-light group-hover:border-snapp/20 transition-all shadow-sm">
                            <i data-lucide="tag" class="w-4 h-4"></i>
                        </div>
                        <div>
                            <div class="font-extrabold text-xs text-gray-800">تخفیف‌ها و جایزه‌ها</div>
                        </div>
                    </div>
                    <i data-lucide="chevron-left" class="w-4 h-4 text-gray-300"></i>
                </div>

                <div onclick="window.PI_API.openInvite()" class="p-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer transition-colors group">
                    <div class="flex items-center gap-3.5">
                        <div class="w-9 h-9 rounded-full bg-snapp-light border border-snapp/20 flex items-center justify-center text-snapp shadow-sm">
                            <i data-lucide="users" class="w-4 h-4"></i>
                        </div>
                        <div>
                            <div class="font-extrabold text-xs text-gray-800">دعوت از دوستان</div>
                        </div>
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="bg-snapp text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-sm">+${window.AppAPI.formatPrice(300000)} تومان</span>
                        <i data-lucide="chevron-left" class="w-4 h-4 text-gray-300"></i>
                    </div>
                </div>

                <div onclick="window.PI_API.openSupport()" class="p-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer transition-colors group">
                    <div class="flex items-center gap-3.5">
                        <div class="w-9 h-9 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-500 group-hover:text-snapp group-hover:bg-snapp-light group-hover:border-snapp/20 transition-all shadow-sm">
                            <i data-lucide="headphones" class="w-4 h-4"></i>
                        </div>
                        <div>
                            <div class="font-extrabold text-xs text-gray-800">پشتیبانی</div>
                        </div>
                    </div>
                    <i data-lucide="chevron-left" class="w-4 h-4 text-gray-300"></i>
                </div>
            </div>

            <!-- Version Footer -->
            <div class="text-center mt-8 text-gray-400 text-[10px] font-bold tracking-widest" dir="ltr">
                LoghmeShop v7.14.0
            </div>

        </div>
    `;

    container.innerHTML = html;
    if (window.lucide) lucide.createIcons();
}