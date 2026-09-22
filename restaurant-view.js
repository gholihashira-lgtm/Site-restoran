/* ==========================================================================
 * restaurant-view.js
 * --------------------------------------------------------------------------
 * Dedicated full-screen restaurant menu view for Loghme Shop / Loghme Food.
 *
 * Features:
 *   - Large hero banner with overlapping restaurant avatar
 *   - Back button with scroll-position restore
 *   - Favorite heart with optimistic toggle
 *   - "سفارش گروهی" (Group Order) badge
 *   - Rating / reviews badge that opens a rich info modal
 *   - Delivery mode toggle (delivery vs pickup) that mutates content
 *   - Delivery metadata pills (ETA + fee)
 *   - Discounts & coupons horizontal rail
 *   - Sticky category tabs with smooth-scroll + active sync on scroll
 *   - In-menu search filtering
 *   - Grid / List layout toggle
 *   - "فود پارتی" section with live countdown timer
 *   - "خریدهای قبلی" (Recently ordered) section
 *   - "پرفروش‌ها" (Bestsellers) section
 *   - Per-category sections with item counts
 *   - Floating checkout bar visibility integration via AppAPI
 *   - Clean teardown on close
 * ========================================================================== */

/* ==========================================================================
 * MODULE STATE
 * ========================================================================== */

let activeIntervals = [];
let currentVendor = null;
let currentProducts = [];
let currentViewMode = 'list'; // 'list' | 'grid'
let currentSearchQuery = '';
let scrollObserver = null;
let originalBodyOverflow = '';
let previousScrollY = 0;
let favorites = new Set();
let partyEndTime = 0;

/* ==========================================================================
 * UTILITY HELPERS
 * ========================================================================== */

function toPersianDigits(n) {
    if (n === null || n === undefined) return '';
    const farsiDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    return n.toString().replace(/\d/g, x => farsiDigits[x]);
}

function formatPrice(amount) {
    return toPersianDigits(Math.round(amount).toLocaleString('fa-IR'));
}

function clearRestaurantIntervals() {
    activeIntervals.forEach(clearInterval);
    activeIntervals = [];
}

function disconnectScrollObserver() {
    if (scrollObserver) {
        scrollObserver.disconnect();
        scrollObserver = null;
    }
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

/* ==========================================================================
 * PUBLIC ENTRY POINT
 * ========================================================================== */

/**
 * Opens the dedicated full-screen menu view for a given vendor.
 * The view covers the entire app shell and integrates with the global
 * cart via `window.AppAPI`.
 *
 * @param {string} vendorId
 */
export function openRestaurantMenu(vendorId) {
    clearRestaurantIntervals();
    disconnectScrollObserver();

    const app = window.AppAPI;
    if (!app) {
        console.warn('[RestaurantView] AppAPI not available yet.');
        return;
    }

    const vendor =
        app.vendors.find(v => v.id === vendorId) || app.vendors[0];
    if (!vendor) return;

    const products = app.catalogProducts.filter(p => p.vendorId === vendor.id);

    currentVendor = vendor;
    currentProducts = products;
    currentViewMode = 'list';
    currentSearchQuery = '';
    previousScrollY = window.scrollY || 0;

    const existing = document.getElementById('restaurant-menu-view');
    if (existing) existing.remove();

    const view = document.createElement('div');
    view.id = 'restaurant-menu-view';
    view.className =
        'fixed inset-0 z-40 bg-gray-50 overflow-y-auto font-vazir text-gray-800 pb-32';
    view.style.opacity = '0';
    view.style.transition = 'opacity 0.25s ease';

    const partyItems = products.filter(p => p.discount > 0);
    const regularItems = products.filter(p => p.discount === 0);
    const bestsellers = [...products]
        .sort((a, b) => (b.rating || 0) - (a.rating || 0) || (b.reviews || 0) - (a.reviews || 0))
        .slice(0, 4);

    const categoryTabs = vendor.categories.filter(c => c.id !== 'all');

    view.innerHTML = `
        <div class="max-w-md mx-auto bg-white min-h-screen relative shadow-2xl overflow-x-hidden">

            <!-- ==========================================================
                 SECTION A: HERO HEADER
                 ========================================================== -->
            <div class="relative h-48 w-full bg-gray-900">
                <img src="${vendor.banner}" class="w-full h-full object-cover opacity-85" alt="${escapeHtml(vendor.name)}">
                <div class="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/45"></div>

                <div class="absolute top-0 inset-x-0 p-4 flex items-center justify-between z-10">
                    <button id="restaurant-back-btn" class="w-9 h-9 rounded-full bg-white/85 backdrop-blur-md flex items-center justify-center text-gray-800 hover:bg-white active:scale-95 transition-all shadow-md" aria-label="بازگشت">
                        <i data-lucide="arrow-right" class="w-5 h-5"></i>
                    </button>
                    <div class="flex items-center gap-2">
                        <button onclick="window.RestaurantAPI.openGroupOrder()" class="bg-black/45 backdrop-blur-md border border-white/20 text-white text-[11px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 active:scale-95 transition-transform">
                            <i data-lucide="users" class="w-3.5 h-3.5"></i>
                            سفارش گروهی
                        </button>
                        <button id="restaurant-fav-btn" onclick="window.RestaurantAPI.toggleFav(this)" class="w-9 h-9 rounded-full bg-white/85 backdrop-blur-md flex items-center justify-center text-gray-800 hover:bg-white active:scale-95 transition-all shadow-md" aria-label="افزودن به علاقه‌مندی‌ها">
                            <i data-lucide="heart" class="w-5 h-5"></i>
                        </button>
                    </div>
                </div>

                <div class="absolute -bottom-7 right-4 z-10">
                    <div class="w-20 h-20 rounded-2xl border-2 border-white bg-white shadow-xl overflow-hidden p-0.5">
                        <img src="${vendor.logo}" class="w-full h-full object-cover rounded-xl" alt="${escapeHtml(vendor.name)}">
                    </div>
                </div>
            </div>

            <!-- ==========================================================
                 SECTION A2: RESTAURANT IDENTITY + RATING + MODE TOGGLE
                 ========================================================== -->
            <div class="pt-9 px-4 pb-4 bg-white border-b border-gray-100">
                <div class="flex items-start justify-between gap-2 mb-2">
                    <div class="min-w-0">
                        <h1 class="font-black text-lg text-gray-900 leading-tight truncate">${escapeHtml(vendor.name)}</h1>
                        <p class="text-xs text-gray-500 mt-0.5 truncate">${escapeHtml(vendor.type)}</p>
                    </div>
                    <button onclick="window.RestaurantAPI.openInfoModal('${vendor.id}')" class="flex items-center gap-1 bg-amber-50 border border-amber-200 text-amber-600 px-2 py-1 rounded-xl text-xs font-black shrink-0 hover:bg-amber-100 transition-colors">
                        <i data-lucide="star" class="w-3.5 h-3.5 fill-amber-400 text-amber-400"></i>
                        <span>${toPersianDigits(vendor.rating)}</span>
                        <span class="text-[10px] text-gray-400 font-normal">(${toPersianDigits(vendor.reviews)})</span>
                        <i data-lucide="chevron-left" class="w-3.5 h-3.5 text-gray-400 mr-0.5"></i>
                    </button>
                </div>

                <!-- Service Mode Segmented Toggle -->
                <div class="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-xl my-3 text-xs font-bold">
                    <button onclick="window.RestaurantAPI.setDeliveryMode('delivery', this)" class="mode-tab py-2 rounded-lg bg-white text-blue-600 shadow-sm flex items-center justify-center gap-1.5 transition-all border border-blue-600">
                        <i data-lucide="bike" class="w-4 h-4"></i>
                        پیک لقمه‌فود
                    </button>
                    <button onclick="window.RestaurantAPI.setDeliveryMode('pickup', this)" class="mode-tab py-2 rounded-lg text-gray-500 hover:text-gray-800 flex items-center justify-center gap-1.5 transition-all">
                        <i data-lucide="shopping-bag" class="w-4 h-4"></i>
                        مراجعه حضوری
                    </button>
                </div>

                <!-- Delivery Metadata Pills -->
                <div id="restaurant-meta-row" class="flex items-center gap-3 text-[11px] font-bold text-gray-600 pt-1">
                    <div class="flex items-center gap-1">
                        <i data-lucide="clock" class="w-3.5 h-3.5 text-gray-400"></i>
                        <span id="restaurant-eta-pill">تحویل تا ۲۵ دقیقه</span>
                    </div>
                    <div class="w-1 h-1 bg-gray-300 rounded-full"></div>
                    <div class="flex items-center gap-1">
                        <i data-lucide="bike" class="w-3.5 h-3.5 text-gray-400"></i>
                        <span id="restaurant-fee-pill">${vendor.deliveryFee === 0 ? '<span class="text-emerald-600">ارسال رایگان (پرو)</span>' : 'ارسال: ' + formatPrice(vendor.deliveryFee) + ' تومان'}</span>
                    </div>
                </div>
            </div>

            <!-- ==========================================================
                 SECTION B: DISCOUNTS & COUPONS RAIL
                 ========================================================== -->
            <div class="px-4 py-3 bg-gray-50 border-b border-gray-100">
                <div class="flex items-center justify-between mb-2">
                    <h3 class="text-[11px] font-black text-gray-900">تخفیف‌ها و کوپن‌ها</h3>
                    <span class="text-[10px] text-snapp font-bold">همه</span>
                </div>
                <div class="flex gap-2.5 overflow-x-auto no-scrollbar">
                    <div onclick="window.RestaurantAPI.openCouponDetails('free-shipping')" class="bg-white border border-emerald-200 rounded-xl p-3 shrink-0 flex items-center gap-3 min-w-[240px] shadow-sm cursor-pointer hover:bg-emerald-50/40 transition-colors">
                        <div class="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                            <i data-lucide="truck" class="w-4 h-4"></i>
                        </div>
                        <div class="min-w-0 flex-1">
                            <div class="text-xs font-black text-emerald-700">ارسال رایگان</div>
                            <div class="text-[10px] text-gray-500 truncate mt-0.5">با خرید حداقل ۵۰۰ هزار تومان</div>
                        </div>
                    </div>
                    <div onclick="window.RestaurantAPI.openCouponDetails('food-party')" class="bg-white border border-pink-200 rounded-xl p-3 shrink-0 flex items-center gap-3 min-w-[240px] shadow-sm cursor-pointer hover:bg-pink-50/40 transition-colors">
                        <div class="w-8 h-8 rounded-lg bg-pink-50 text-snapp flex items-center justify-center shrink-0">
                            <i data-lucide="sparkles" class="w-4 h-4"></i>
                        </div>
                        <div class="min-w-0 flex-1">
                            <div class="text-xs font-black text-snapp">فود پارتی</div>
                            <div class="text-[10px] text-gray-500 truncate mt-0.5">تا ۲۵٪ تخفیف ویژه محصولات منتخب</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- ==========================================================
                 SECTION C: STICKY CATEGORY TABS + SEARCH + VIEW TOGGLE
                 ========================================================== -->
            <div class="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-100 px-4 py-2 flex items-center gap-2">
                <div id="restaurant-cat-scroll" class="flex gap-2 overflow-x-auto no-scrollbar scroll-smooth flex-1 text-xs font-bold">
                    ${partyItems.length > 0 ? `
                        <button onclick="window.RestaurantAPI.scrollToSection('section-foodparty', this)" class="menu-cat-pill px-3 py-1.5 rounded-full bg-snapp text-white shrink-0 transition-all flex items-center gap-1 shadow-sm" data-target="section-foodparty">
                            <i data-lucide="sparkles" class="w-3.5 h-3.5"></i>
                            فود پارتی
                        </button>
                    ` : ''}
                    <button onclick="window.RestaurantAPI.scrollToSection('section-previous', this)" class="menu-cat-pill px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 shrink-0 transition-all" data-target="section-previous">
                        خریدهای قبلی
                    </button>
                    <button onclick="window.RestaurantAPI.scrollToSection('section-popular', this)" class="menu-cat-pill px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 shrink-0 transition-all" data-target="section-popular">
                        پرفروش‌ها
                    </button>
                    ${categoryTabs.map(cat => `
                        <button onclick="window.RestaurantAPI.scrollToSection('section-${cat.id}', this)" class="menu-cat-pill px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 shrink-0 transition-all" data-target="section-${cat.id}">
                            ${escapeHtml(cat.title)}
                        </button>
                    `).join('')}
                </div>
                <div class="flex items-center gap-1 border-r border-gray-200 pr-2 shrink-0">
                    <button onclick="window.RestaurantAPI.toggleSearch()" class="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100" aria-label="جستجو">
                        <i data-lucide="search" class="w-4 h-4"></i>
                    </button>
                    <button onclick="window.RestaurantAPI.toggleViewMode(this)" class="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100" aria-label="تغییر نمایش">
                        <i data-lucide="layout-grid" class="w-4 h-4"></i>
                    </button>
                </div>
            </div>

            <!-- In-menu search bar (hidden by default) -->
            <div id="restaurant-search-bar" class="hidden px-4 pt-3">
                <div class="relative">
                    <input type="text" id="restaurant-search-input" oninput="window.RestaurantAPI.handleSearch(this.value)" placeholder="جستجو در منوی ${escapeHtml(vendor.name)}..."
                           class="w-full bg-gray-50 text-xs font-medium text-gray-800 placeholder-gray-400 pr-9 pl-8 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-snapp focus:bg-white focus:ring-2 focus:ring-snapp/10 transition-all">
                    <i data-lucide="search" class="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2"></i>
                    <button onclick="window.RestaurantAPI.clearSearch()" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        <i data-lucide="x" class="w-3.5 h-3.5"></i>
                    </button>
                </div>
            </div>

            <!-- ==========================================================
                 SECTION D: SECTIONED FOOD CATALOG
                 ========================================================== -->
            <div id="restaurant-catalog" class="p-4 space-y-6">

                <!-- D1. FOOD PARTY SECTION -->
                ${partyItems.length > 0 ? `
                    <section id="section-foodparty" class="scroll-mt-14" data-section="foodparty">
                        <div class="bg-gradient-to-r from-rose-600 via-pink-600 to-snapp rounded-2xl p-3.5 text-white mb-3 shadow-md shadow-pink-500/20 flex items-center justify-between relative overflow-hidden">
                            <div class="absolute -right-6 -top-6 w-24 h-24 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
                            <div class="flex items-center gap-1.5 relative z-10">
                                <i data-lucide="sparkles" class="w-4 h-4 text-yellow-300 fill-yellow-300"></i>
                                <span class="font-black text-xs">تخفیف‌های فود پارتی</span>
                                <span class="w-1.5 h-1.5 bg-yellow-300 rounded-full animate-pulse"></span>
                            </div>
                            <div class="font-mono text-xs font-black bg-black/30 backdrop-blur px-2.5 py-1 rounded-lg relative z-10" dir="ltr">
                                <span id="party-timer">۲۲ : ۴۹ : ۰۲</span>
                            </div>
                        </div>

                        <div id="foodparty-list" class="space-y-3">
                            ${partyItems.map(p => renderFoodCard(p, { badge: 'پرفروش‌ترین' })).join('')}
                        </div>
                    </section>
                ` : ''}

                <!-- D2. RECENTLY ORDERED SECTION -->
                <section id="section-previous" class="scroll-mt-14" data-section="previous">
                    <div class="flex items-center gap-2 mb-3">
                        <div class="w-1.5 h-4 bg-amber-500 rounded-full"></div>
                        <h3 class="font-black text-xs text-gray-900">خریدهای قبلی</h3>
                        <span class="text-[10px] text-gray-400 font-bold">${toPersianDigits(Math.min(3, products.length))} آیتم</span>
                    </div>
                    <div id="previous-list" class="space-y-3">
                        ${products.slice(0, 3).map(p => renderFoodCard(p)).join('')}
                    </div>
                </section>

                <!-- D3. BESTSELLERS SECTION -->
                <section id="section-popular" class="scroll-mt-14" data-section="popular">
                    <div class="flex items-center gap-2 mb-3">
                        <div class="w-1.5 h-4 bg-snapp rounded-full"></div>
                        <h3 class="font-black text-xs text-gray-900">پرفروش‌ترین غذاها</h3>
                        <span class="text-[10px] text-gray-400 font-bold">${toPersianDigits(bestsellers.length)} آیتم</span>
                    </div>
                    <div id="popular-list" class="space-y-3">
                        ${bestsellers.map(p => renderFoodCard(p, { badge: 'محبوب' })).join('')}
                    </div>
                </section>

                <!-- D4. CATEGORY SECTIONS -->
                ${categoryTabs.map(cat => {
                    const catItems = products.filter(p => p.categoryId === cat.id);
                    if (catItems.length === 0) return '';
                    return `
                        <section id="section-${cat.id}" class="scroll-mt-14" data-section="${cat.id}">
                            <div class="flex items-center gap-2 mb-3">
                                <div class="w-1.5 h-4 bg-gray-400 rounded-full"></div>
                                <h3 class="font-black text-xs text-gray-900">${escapeHtml(cat.title)}</h3>
                                <span class="text-[10px] text-gray-400 font-bold">${toPersianDigits(catItems.length)} آیتم</span>
                            </div>
                            <div id="category-${cat.id}-list" class="space-y-3">
                                ${catItems.map(p => renderFoodCard(p)).join('')}
                            </div>
                        </section>
                    `;
                }).join('')}

                <!-- Empty search result container (hidden by default) -->
                <div id="restaurant-empty-search" class="hidden text-center py-12">
                    <div class="w-16 h-16 mx-auto mb-3 bg-pink-50 rounded-full flex items-center justify-center text-snapp">
                        <i data-lucide="search-x" class="w-8 h-8"></i>
                    </div>
                    <h4 class="font-extrabold text-sm text-gray-800">کالایی با این مشخصات پیدا نشد!</h4>
                    <p class="text-xs text-gray-400 mt-1">عنوان دیگری را امتحان کنید.</p>
                </div>

            </div>
        </div>
    `;

    document.body.appendChild(view);
    if (window.lucide) lucide.createIcons();

    // Bind extra events
    bindRestaurantEvents(view);

    // Start party countdown timer
    if (partyItems.length > 0) {
        startPartyCountdown();
    }

    // Sync the sticky category pill highlight on scroll
    setupScrollSpy(view);

    // Fade in
    requestAnimationFrame(() => {
        view.style.opacity = '1';
    });

    // Ensure the global floating checkout bar stays visible
    if (typeof window.AppAPI.updateApplicationState === 'function') {
        window.AppAPI.updateApplicationState();
    }
}

/* ==========================================================================
 * RENDERERS: FOOD CARDS
 * ========================================================================== */

function renderFoodCard(item, opts = {}) {
    const qty = (window.AppAPI && window.AppAPI.cartState.items[item.id]?.quantity) || 0;
    const badge = opts.badge || (item.discount > 0 ? `٪${toPersianDigits(item.discount)}` : null);
    const isFavorite = favorites.has(item.id);

    return `
        <article class="restaurant-food-card bg-white rounded-2xl p-3.5 border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_4px_18px_-6px_rgba(0,0,0,0.10)] hover:border-gray-200 transition-all flex gap-3.5 items-start cursor-pointer"
                 data-product-id="${item.id}"
                 onclick="openProductModal(${item.id})">
            <div class="relative w-28 h-28 rounded-2xl overflow-hidden shrink-0 bg-gray-50 border border-gray-100">
                <img src="${item.image}" alt="${escapeHtml(item.title)}" class="w-full h-full object-cover">
                ${item.discount > 0 ? `<span class="discount-tag absolute top-1.5 right-1.5 shadow-sm">٪${toPersianDigits(item.discount)}</span>` : ''}
                <button onclick="event.stopPropagation(); window.RestaurantAPI.toggleFavCard(${item.id}, this)"
                        class="absolute top-1.5 left-1.5 w-7 h-7 rounded-full bg-white/85 backdrop-blur-md flex items-center justify-center text-gray-400 hover:text-red-500 shadow-sm active:scale-90 transition-all">
                    <i data-lucide="heart" class="w-4 h-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}"></i>
                </button>
            </div>
            <div class="flex-1 flex flex-col justify-between min-h-[112px]">
                <div>
                    <div class="flex items-start justify-between gap-1">
                        <h4 class="font-extrabold text-xs text-gray-900 leading-snug">${escapeHtml(item.title)}</h4>
                        <div class="flex items-center gap-0.5 text-[10px] font-bold text-amber-500 bg-amber-50 px-1.5 py-0.5 rounded-md shrink-0">
                            <i data-lucide="star" class="w-3 h-3 fill-amber-400 text-amber-400"></i>
                            <span>${toPersianDigits(item.rating)}</span>
                        </div>
                    </div>
                    <p class="text-[11px] text-gray-400 font-normal line-clamp-2 mt-1 leading-relaxed">${escapeHtml(item.desc)}</p>
                    ${badge && !item.discount ? `<div class="mt-1.5 inline-flex items-center gap-1 text-[9px] font-black text-snapp bg-snapp-light px-1.5 py-0.5 rounded-md"><i data-lucide="flame" class="w-2.5 h-2.5"></i>${escapeHtml(badge)}</div>` : ''}
                </div>
                <div class="flex items-center justify-between mt-2 pt-2 border-t border-gray-50" onclick="event.stopPropagation()">
                    <div>
                        ${item.discount > 0 ? `<span class="text-[10px] text-gray-400 line-through block">${formatPrice(item.originalPrice)}</span>` : ''}
                        <div class="text-xs font-black text-gray-900">
                            ${formatPrice(item.price)} <span class="text-[9px] font-normal text-gray-500 mr-0.5">تومان</span>
                        </div>
                    </div>
                    <div id="rest-food-actions-${item.id}">
                        ${renderQuantityControl(item.id, qty)}
                    </div>
                </div>
            </div>
        </article>
    `;
}

function renderQuantityControl(productId, qty) {
    if (qty === 0) {
        return `
            <button onclick="window.RestaurantAPI.add(${productId})" class="bg-snapp-light hover:bg-snapp hover:text-white text-snapp font-bold text-xs px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 active:scale-95 border border-snapp/20 shadow-sm">
                <i data-lucide="plus" class="w-3.5 h-3.5"></i><span>افزودن</span>
            </button>
        `;
    }
    return `
        <div class="flex items-center bg-snapp text-white rounded-xl shadow-sm p-0.5 gap-2">
            <button onclick="window.RestaurantAPI.add(${productId})" class="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-white/20 active:scale-90">
                <i data-lucide="plus" class="w-3.5 h-3.5"></i>
            </button>
            <span class="text-xs font-black min-w-4 text-center select-none">${toPersianDigits(qty)}</span>
            <button onclick="window.RestaurantAPI.dec(${productId})" class="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-white/20 active:scale-90">
                <i data-lucide="${qty === 1 ? 'trash-2' : 'minus'}" class="w-3.5 h-3.5"></i>
            </button>
        </div>
    `;
}

/* ==========================================================================
 * EVENT BINDING & SCROLL SPY
 * ========================================================================== */

function bindRestaurantEvents(view) {
    const backBtn = view.querySelector('#restaurant-back-btn');
    if (backBtn) backBtn.addEventListener('click', () => window.RestaurantAPI.close());
}

function setupScrollSpy(view) {
    const sections = view.querySelectorAll('section[data-section]');
    const pills = view.querySelectorAll('.menu-cat-pill');
    if (!sections.length || !pills.length) return;

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                const sectionId = entry.target.id;
                pills.forEach(p => {
                    if (p.dataset.target === sectionId) {
                        p.className =
                            'menu-cat-pill px-3 py-1.5 rounded-full bg-snapp text-white shrink-0 transition-all flex items-center gap-1 shadow-sm';
                    } else {
                        p.className =
                            'menu-cat-pill px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 shrink-0 transition-all';
                    }
                });
            });
        },
        {
            root: view,
            rootMargin: '-20% 0px -70% 0px',
            threshold: 0
        }
    );

    sections.forEach(s => observer.observe(s));
    scrollObserver = observer;
}

/* ==========================================================================
 * PARTY COUNTDOWN TIMER
 * ========================================================================== */

function startPartyCountdown() {
    partyEndTime = Date.now() + (22 * 3600 + 49 * 60 + 2) * 1000;

    const tick = () => {
        const el = document.getElementById('party-timer');
        if (!el) return;
        let remaining = Math.max(0, Math.floor((partyEndTime - Date.now()) / 1000));
        const h = Math.floor(remaining / 3600);
        const m = Math.floor((remaining % 3600) / 60);
        const s = remaining % 60;
        el.textContent = `${toPersianDigits(h.toString().padStart(2, '0'))} : ${toPersianDigits(m.toString().padStart(2, '0'))} : ${toPersianDigits(s.toString().padStart(2, '0'))}`;
    };

    tick();
    const interval = setInterval(tick, 1000);
    activeIntervals.push(interval);
}

/* ==========================================================================
 * GLOBAL API (INLINE HANDLERS)
 * ========================================================================== */

window.RestaurantAPI = {

    /* ------------------------------------------------------------------
     * CLOSE VIEW
     * ------------------------------------------------------------------ */
    close: function () {
        clearRestaurantIntervals();
        disconnectScrollObserver();
        const view = document.getElementById('restaurant-menu-view');
        if (!view) return;

        view.style.opacity = '0';
        setTimeout(() => {
            view.remove();
            // Restore scroll position on the home page
            try {
                window.scrollTo({ top: previousScrollY, behavior: 'instant' });
            } catch (e) {
                window.scrollTo(0, previousScrollY);
            }
            // Ensure the global cart bar is visible again
            if (window.AppAPI && typeof window.AppAPI.updateApplicationState === 'function') {
                window.AppAPI.updateApplicationState();
            }
        }, 220);
    },

    /* ------------------------------------------------------------------
     * FAVORITE TOGGLE
     * ------------------------------------------------------------------ */
    toggleFav: function (btn) {
        const icon = btn.querySelector('svg');
        if (icon) {
            icon.classList.toggle('fill-red-500');
            icon.classList.toggle('text-red-500');
        }
        if (window.IV_API && typeof window.IV_API.showToast === 'function') {
            window.IV_API.showToast('علاقه‌مندی‌های شما به‌روزرسانی شد.');
        }
    },

    toggleFavCard: function (productId, btn) {
        if (favorites.has(productId)) favorites.delete(productId);
        else favorites.add(productId);
        const icon = btn.querySelector('svg');
        if (icon) {
            icon.classList.toggle('fill-red-500');
            icon.classList.toggle('text-red-500');
        }
    },

    /* ------------------------------------------------------------------
     * GROUP ORDER PLACEHOLDER
     * ------------------------------------------------------------------ */
    openGroupOrder: function () {
        if (window.IV_API && typeof window.IV_API.showToast === 'function') {
            window.IV_API.showToast('لینک سفارش گروهی برای دوستان شما کپی شد.');
        } else {
            alert('سفارش گروهی: لینک دعوت کپی شد.');
        }
    },

    /* ------------------------------------------------------------------
     * COUPON DETAILS DRAWER
     * ------------------------------------------------------------------ */
    openCouponDetails: function (kind) {
        const isFreeShipping = kind === 'free-shipping';
        const title = isFreeShipping ? 'ارسال رایگان' : 'فود پارتی';
        const desc = isFreeShipping
            ? 'با خرید بالای ۵۰۰ هزار تومان، هزینه ارسال این رستوران به‌صورت خودکار حذف می‌شود.'
            : 'بین ۲۰٪ تا ۲۵٪ تخفیف روی محصولات منتخب این بخش، تا پایان امروز فعال است.';

        const existing = document.getElementById('restaurant-coupon-modal');
        if (existing) existing.remove();

        const modal = document.createElement('div');
        modal.id = 'restaurant-coupon-modal';
        modal.className = 'fixed inset-0 z-[60] bg-black/60 flex items-center justify-center p-4 font-vazir transition-opacity duration-300';
        modal.innerHTML = `
            <div class="bg-white rounded-3xl p-5 w-full max-w-sm overflow-hidden shadow-2xl space-y-4">
                <div class="flex justify-between items-center border-b border-gray-100 pb-3">
                    <h3 class="font-black text-sm text-gray-900">${title}</h3>
                    <button onclick="document.getElementById('restaurant-coupon-modal').remove()" class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                        <i data-lucide="x" class="w-4 h-4"></i>
                    </button>
                </div>
                <p class="text-xs text-gray-600 leading-relaxed">${desc}</p>
                <button onclick="document.getElementById('restaurant-coupon-modal').remove()" class="w-full bg-snapp hover:bg-snapp-hover text-white font-bold text-xs py-3 rounded-2xl active:scale-95 transition-all">
                    متوجه شدم
                </button>
            </div>
        `;
        document.body.appendChild(modal);
        if (window.lucide) lucide.createIcons();
    },

    /* ------------------------------------------------------------------
     * DELIVERY / PICKUP MODE
     * ------------------------------------------------------------------ */
    setDeliveryMode: function (mode, btn) {
        document.querySelectorAll('.mode-tab').forEach(b => {
            b.className = 'mode-tab py-2 rounded-lg text-gray-500 hover:text-gray-800 flex items-center justify-center gap-1.5 transition-all';
        });
        btn.className = 'mode-tab py-2 rounded-lg bg-white text-blue-600 shadow-sm flex items-center justify-center gap-1.5 transition-all border border-blue-600';

        const etaPill = document.getElementById('restaurant-eta-pill');
        const feePill = document.getElementById('restaurant-fee-pill');

        if (mode === 'pickup') {
            if (etaPill) etaPill.textContent = 'آماده‌سازی تا ۲۰ دقیقه';
            if (feePill) feePill.innerHTML = '<span class="text-emerald-600">بدون هزینه ارسال (حضوری)</span>';
        } else {
            const fee = (currentVendor && currentVendor.deliveryFee) || 0;
            if (etaPill) etaPill.textContent = 'تحویل تا ۲۵ دقیقه';
            if (feePill) {
                feePill.innerHTML = fee === 0
                    ? '<span class="text-emerald-600">ارسال رایگان (پرو)</span>'
                    : 'ارسال: ' + formatPrice(fee) + ' تومان';
            }
        }
    },

    /* ------------------------------------------------------------------
     * SMOOTH SCROLL TO SECTION
     * ------------------------------------------------------------------ */
    scrollToSection: function (sectionId, btn) {
        document.querySelectorAll('.menu-cat-pill').forEach(b => {
            b.className = 'menu-cat-pill px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 shrink-0 transition-all';
        });
        btn.className = 'menu-cat-pill px-3 py-1.5 rounded-full bg-snapp text-white shrink-0 transition-all flex items-center gap-1 shadow-sm';

        const sec = document.getElementById(sectionId);
        if (sec) sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
    },

    /* ------------------------------------------------------------------
     * SEARCH BAR TOGGLE & HANDLERS
     * ------------------------------------------------------------------ */
    toggleSearch: function () {
        const bar = document.getElementById('restaurant-search-bar');
        if (!bar) return;
        const isHidden = bar.classList.contains('hidden');
        if (isHidden) {
            bar.classList.remove('hidden');
            const input = document.getElementById('restaurant-search-input');
            if (input) input.focus();
        } else {
            bar.classList.add('hidden');
            window.RestaurantAPI.clearSearch();
        }
    },

    handleSearch: function (value) {
        currentSearchQuery = (value || '').trim();
        const container = document.getElementById('restaurant-catalog');
        const empty = document.getElementById('restaurant-empty-search');
        if (!container) return;

        if (currentSearchQuery.length === 0) {
            // Show all cards
            container.querySelectorAll('.restaurant-food-card').forEach(c => c.parentElement.style.display = '');
            container.querySelectorAll('section[data-section]').forEach(s => s.style.display = '');
            if (empty) empty.classList.add('hidden');
            return;
        }

        let anyVisible = false;
        container.querySelectorAll('section[data-section]').forEach(section => {
            const cards = section.querySelectorAll('.restaurant-food-card');
            let visibleInSection = 0;
            cards.forEach(card => {
                const id = Number(card.dataset.productId);
                const p = currentProducts.find(x => x.id === id);
                if (!p) return;
                const match =
                    p.title.includes(currentSearchQuery) ||
                    p.desc.includes(currentSearchQuery);
                if (match) {
                    card.parentElement.style.display = '';
                    visibleInSection++;
                    anyVisible = true;
                } else {
                    card.parentElement.style.display = 'none';
                }
            });
            section.style.display = visibleInSection > 0 ? '' : 'none';
        });

        if (empty) empty.classList.toggle('hidden', anyVisible);
    },

    clearSearch: function () {
        const input = document.getElementById('restaurant-search-input');
        if (input) input.value = '';
        window.RestaurantAPI.handleSearch('');
    },

    /* ------------------------------------------------------------------
     * VIEW MODE (LIST / GRID)
     * ------------------------------------------------------------------ */
    toggleViewMode: function (btn) {
        currentViewMode = currentViewMode === 'list' ? 'grid' : 'list';
        const icon = btn.querySelector('svg') || btn.querySelector('i');
        if (icon) {
            icon.setAttribute('data-lucide', currentViewMode === 'list' ? 'layout-grid' : 'list');
        }
        const catalog = document.getElementById('restaurant-catalog');
        if (!catalog) return;

        catalog.querySelectorAll('section[data-section] > div:last-child').forEach(list => {
            if (!list) return;
            if (currentViewMode === 'grid') {
                list.className = 'grid grid-cols-2 gap-3';
            } else {
                list.className = 'space-y-3';
            }
        });

        if (window.lucide) lucide.createIcons();
    },

    /* ------------------------------------------------------------------
     * CART INTEGRATION
     * ------------------------------------------------------------------ */
    add: function (productId) {
        if (!window.AppAPI) return;
        window.AppAPI.handleAddToCart(productId);
        window.RestaurantAPI.refreshCards();
    },

    dec: function (productId) {
        if (!window.AppAPI) return;
        const items = window.AppAPI.cartState.items;
        if (!items[productId]) return;
        if (items[productId].quantity <= 1) {
            delete items[productId];
            if (Object.keys(items).length === 0) {
                window.AppAPI.cartState.vendorId = null;
            }
        } else {
            items[productId].quantity -= 1;
        }
        window.AppAPI.updateApplicationState();
        window.RestaurantAPI.refreshCards();
    },

    refreshCards: function () {
        if (!window.AppAPI) return;
        const all = window.AppAPI.catalogProducts;
        all.forEach(item => {
            const container = document.getElementById(`rest-food-actions-${item.id}`);
            if (!container) return;
            const qty = window.AppAPI.cartState.items[item.id]?.quantity || 0;
            container.innerHTML = renderQuantityControl(item.id, qty);
        });
        if (window.lucide) lucide.createIcons();
    },

    /* ------------------------------------------------------------------
     * RESTAURANT INFO / REVIEWS MODAL
     * ------------------------------------------------------------------ */
    openInfoModal: function (vendorId) {
        const vendor =
            (window.AppAPI && window.AppAPI.vendors.find(v => v.id === vendorId)) ||
            currentVendor;
        if (!vendor) return;

        const existing = document.getElementById('vendor-info-modal');
        if (existing) existing.remove();

        const modal = document.createElement('div');
        modal.id = 'vendor-info-modal';
        modal.className = 'fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 opacity-0 transition-opacity duration-300 font-vazir';
        modal.innerHTML = `
            <div class="bg-white rounded-3xl p-5 w-full max-w-sm overflow-hidden shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
                <div class="flex justify-between items-center border-b border-gray-100 pb-3 shrink-0">
                    <h3 class="font-black text-sm text-gray-900">${escapeHtml(vendor.name)}</h3>
                    <button onclick="document.getElementById('vendor-info-modal').remove()" class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                        <i data-lucide="x" class="w-4 h-4"></i>
                    </button>
                </div>

                <div class="overflow-y-auto flex-1 space-y-4">
                    <div class="space-y-3 text-xs text-gray-600">
                        <div class="flex items-center gap-2">
                            <i data-lucide="star" class="w-4 h-4 text-amber-500 fill-amber-400"></i>
                            <span>امتیاز کلی: ${toPersianDigits(vendor.rating)} از ۵ (${toPersianDigits(vendor.reviews)} نظر ثبت‌شده)</span>
                        </div>
                        <div class="flex items-center gap-2">
                            <i data-lucide="map-pin" class="w-4 h-4 text-gray-400"></i>
                            <span>تهران، سعادت‌آباد، سرو غربی، نبش خیابان بیست و پنجم</span>
                        </div>
                        <div class="flex items-center gap-2">
                            <i data-lucide="clock" class="w-4 h-4 text-gray-400"></i>
                            <span>ساعت کاری: همه روزه از ساعت ۱۱:۳۰ الی ۲۳:۴۵</span>
                        </div>
                        <div class="flex items-center gap-2">
                            <i data-lucide="bike" class="w-4 h-4 text-gray-400"></i>
                            <span>هزینه ارسال: ${vendor.deliveryFee === 0 ? 'رایگان (پرو)' : formatPrice(vendor.deliveryFee) + ' تومان'}</span>
                        </div>
                    </div>

                    <!-- Rating bars -->
                    <div class="bg-gray-50 p-3 rounded-2xl border border-gray-100 space-y-2">
                        <div class="font-black text-xs text-gray-800 mb-1">توزیع امتیاز کاربران</div>
                        ${[5, 4, 3, 2, 1].map(star => {
                            const percent = star === 5 ? 72 : star === 4 ? 20 : star === 3 ? 5 : star === 2 ? 2 : 1;
                            return `
                                <div class="flex items-center gap-2 text-[10px]">
                                    <span class="w-6 text-gray-500 font-bold shrink-0">${toPersianDigits(star)}★</span>
                                    <div class="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                        <div class="h-full bg-amber-400" style="width: ${percent}%"></div>
                                    </div>
                                    <span class="w-8 text-gray-500 font-bold text-right">${toPersianDigits(percent)}٪</span>
                                </div>
                            `;
                        }).join('')}
                    </div>

                    <!-- Reviews list -->
                    <div class="bg-gray-50 p-3 rounded-2xl border border-gray-100">
                        <div class="font-black text-xs text-gray-800 mb-2">نظرات اخیر مشتریان</div>
                        <div class="space-y-3">
                            ${[
                                { name: 'سارا ک.', rating: 5, text: 'کیفیت عالی و بسته‌بندی کاملاً گرم به دستم رسید. ممنون از لقمه‌فود.' },
                                { name: 'امیر ح.', rating: 4, text: 'ساندویچ‌ها حجم بسیار بالایی داشتند و پرسنل تحویل بسیار محترم بودند.' },
                                { name: 'مینا ر.', rating: 5, text: 'طعم واقعاً فوق‌العاده بود، قطعاً دوباره سفارش می‌دم.' }
                            ].map(r => `
                                <div class="bg-white rounded-xl p-3 border border-gray-100">
                                    <div class="flex items-center justify-between mb-1">
                                        <span class="font-bold text-[11px] text-gray-800">${r.name}</span>
                                        <span class="text-amber-400 text-[10px]">${'★'.repeat(r.rating)}</span>
                                    </div>
                                    <p class="text-[11px] text-gray-500 leading-relaxed">${r.text}</p>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>

                <button onclick="document.getElementById('vendor-info-modal').remove()" class="w-full bg-snapp hover:bg-snapp-hover text-white font-bold text-xs py-3 rounded-2xl active:scale-95 transition-all shrink-0">
                    بستن
                </button>
            </div>
        `;
        document.body.appendChild(modal);
        if (window.lucide) lucide.createIcons();

        requestAnimationFrame(() => modal.classList.remove('opacity-0'));
    }
};

/* ==========================================================================
 * DEFAULT EXPORT ALIAS (FOR FLEXIBLE IMPORTS)
 * ========================================================================== */

export default { openRestaurantMenu };