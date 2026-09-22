// wishlist-page.js

let wishlistProducts = [
    { id: 1, addedAt: Date.now() - 1000 * 60 * 30 },
    { id: 15, addedAt: Date.now() - 1000 * 60 * 60 * 5 },
    { id: 23, addedAt: Date.now() - 1000 * 60 * 60 * 24 },
    { id: 41, addedAt: Date.now() - 1000 * 60 * 60 * 24 * 3 },
    { id: 47, addedAt: Date.now() - 1000 * 60 * 60 * 24 * 5 }
];

let wishlistVendors = [
    { id: 'v1', addedAt: Date.now() - 1000 * 60 * 60 * 2 },
    { id: 'v4', addedAt: Date.now() - 1000 * 60 * 60 * 24 }
];

let wishlistState = {
    activeTab: 'all',
    sortBy: 'recent',
    selectionMode: false,
    selectedItems: new Set()
};

function toPersianDigits(n) {
    if (n === null || n === undefined) return '';
    const f = ['۰','۱','۲','۳','۴','۵','۶','۷','۸','۹'];
    return n.toString().replace(/\d/g, x => f[x]);
}

function formatPrice(a) {
    return toPersianDigits(Math.round(a).toLocaleString('fa-IR'));
}

function escapeHtml(s) {
    if (!s) return '';
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

function getProductsFull() {
    const api = window.AppAPI;
    if (!api) return [];
    return wishlistProducts
        .map(w => {
            const p = api.catalogProducts.find(x => x.id === w.id);
            return p ? { ...p, addedAt: w.addedAt } : null;
        })
        .filter(Boolean);
}

function getVendorsFull() {
    const api = window.AppAPI;
    if (!api) return [];
    return wishlistVendors
        .map(w => {
            const v = api.vendors.find(x => x.id === w.id);
            return v ? { ...v, addedAt: w.addedAt } : null;
        })
        .filter(Boolean);
}

function sortProducts(list) {
    const s = wishlistState.sortBy;
    if (s === 'price-asc') return [...list].sort((a, b) => a.price - b.price);
    if (s === 'price-desc') return [...list].sort((a, b) => b.price - a.price);
    if (s === 'rating') return [...list].sort((a, b) => (b.rating || 0) - (a.rating || 0));
    if (s === 'discount') return [...list].sort((a, b) => (b.discount || 0) - (a.discount || 0));
    return [...list].sort((a, b) => b.addedAt - a.addedAt);
}

export function openWishlistPage() {
    const existing = document.getElementById('wishlist-page-view');
    if (existing) existing.remove();

    document.body.style.overflow = 'hidden';

    const view = document.createElement('div');
    view.id = 'wishlist-page-view';
    view.className = 'fixed inset-0 z-[75] bg-gray-50 overflow-y-auto font-vazir';
    view.style.opacity = '0';
    view.style.transition = 'opacity 0.22s ease';

    view.innerHTML = renderWishlistShell();
    document.body.appendChild(view);

    if (window.lucide) lucide.createIcons();

    requestAnimationFrame(() => { view.style.opacity = '1'; });

    bindWishlistEvents(view);
    renderWishlistBody();
    updateWishlistCountBadge();
}

function renderWishlistShell() {
    return `
        <div class="max-w-md mx-auto bg-gray-50 min-h-screen relative pb-28">

            <div class="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100">
                <div class="px-4 py-3 flex items-center justify-between">
                    <div class="flex items-center gap-2">
                        <button id="wl-close-btn" class="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 hover:bg-gray-200 active:scale-95 transition-all">
                            <i data-lucide="arrow-right" class="w-4 h-4"></i>
                        </button>
                        <div>
                            <h2 class="font-black text-sm text-gray-900 flex items-center gap-1.5">
                                <i data-lucide="heart" class="w-4 h-4 text-rose-500 fill-rose-500"></i>
                                علاقه‌مندی‌ها
                            </h2>
                            <p id="wl-count-text" class="text-[10px] text-gray-500 mt-0.5">در حال بارگذاری...</p>
                        </div>
                    </div>
                    <button id="wl-select-mode-btn" class="text-[10px] font-black text-snapp flex items-center gap-1 px-3 py-2 rounded-xl hover:bg-snapp-light transition-colors">
                        <i data-lucide="check-square" class="w-3.5 h-3.5"></i>
                        انتخاب گروهی
                    </button>
                </div>

                <div class="px-4 pb-3 flex items-center gap-2 overflow-x-auto no-scrollbar">
                    <button data-wl-tab="all" class="wl-tab px-3.5 py-1.5 rounded-full text-xs font-black shrink-0 bg-snapp text-white transition-all">
                        همه
                    </button>
                    <button data-wl-tab="products" class="wl-tab px-3.5 py-1.5 rounded-full text-xs font-bold shrink-0 bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all">
                        محصولات
                    </button>
                    <button data-wl-tab="vendors" class="wl-tab px-3.5 py-1.5 rounded-full text-xs font-bold shrink-0 bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all">
                        رستوران‌ها
                    </button>
                </div>

                <div id="wl-sort-bar" class="px-4 pb-3 flex items-center gap-2 overflow-x-auto no-scrollbar border-t border-gray-50 pt-3">
                    <span class="text-[10px] font-bold text-gray-400 shrink-0 flex items-center gap-1">
                        <i data-lucide="arrow-up-down" class="w-3 h-3"></i>
                        مرتب‌سازی:
                    </span>
                    <button data-wl-sort="recent" class="wl-sort-chip px-3 py-1.5 rounded-lg text-[10px] font-bold shrink-0 bg-snapp-light text-snapp border border-snapp/20 transition-all">جدیدترین</button>
                    <button data-wl-sort="price-asc" class="wl-sort-chip px-3 py-1.5 rounded-lg text-[10px] font-bold shrink-0 bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100 transition-all">ارزان‌ترین</button>
                    <button data-wl-sort="price-desc" class="wl-sort-chip px-3 py-1.5 rounded-lg text-[10px] font-bold shrink-0 bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100 transition-all">گران‌ترین</button>
                    <button data-wl-sort="rating" class="wl-sort-chip px-3 py-1.5 rounded-lg text-[10px] font-bold shrink-0 bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100 transition-all">بیشترین امتیاز</button>
                    <button data-wl-sort="discount" class="wl-sort-chip px-3 py-1.5 rounded-lg text-[10px] font-bold shrink-0 bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100 transition-all">بیشترین تخفیف</button>
                </div>
            </div>

            <div id="wl-body"></div>

            <div id="wl-bulk-bar" class="fixed bottom-0 inset-x-0 max-w-md mx-auto bg-white border-t border-gray-200 px-4 pt-3 pb-4 shadow-[0_-4px_14px_rgba(0,0,0,0.06)] z-50 hidden">
                <div class="flex items-center gap-3 mb-2.5">
                    <div class="flex items-center gap-1.5 text-[11px] font-bold text-gray-700">
                        <span id="wl-selected-count" class="bg-snapp text-white text-[10px] font-black px-2 py-0.5 rounded-full">۰</span>
                        انتخاب شده
                    </div>
                    <button id="wl-select-all-btn" class="text-[10px] font-black text-snapp ml-auto">انتخاب همه</button>
                </div>
                <div class="flex gap-2">
                    <button id="wl-bulk-add-btn" class="flex-1 bg-snapp hover:bg-snapp-hover text-white font-black text-xs py-3.5 rounded-2xl shadow-md shadow-pink-500/25 active:scale-95 transition-all flex items-center justify-center gap-1.5">
                        <i data-lucide="shopping-bag" class="w-4 h-4"></i>
                        افزودن به سبد
                    </button>
                    <button id="wl-bulk-remove-btn" class="bg-rose-50 hover:bg-rose-100 text-rose-600 font-black text-xs py-3.5 px-4 rounded-2xl border border-rose-200 active:scale-95 transition-all flex items-center justify-center gap-1.5">
                        <i data-lucide="trash-2" class="w-4 h-4"></i>
                        حذف
                    </button>
                </div>
            </div>
        </div>
    `;
}

function updateWishlistCountBadge() {
    const text = document.getElementById('wl-count-text');
    if (!text) return;
    const total = wishlistProducts.length + wishlistVendors.length;
    if (total === 0) {
        text.textContent = 'لیست خالی است';
    } else {
        text.textContent = `${toPersianDigits(wishlistProducts.length)} محصول · ${toPersianDigits(wishlistVendors.length)} رستوران`;
    }
}

function renderWishlistBody() {
    const body = document.getElementById('wl-body');
    if (!body) return;

    const tab = wishlistState.activeTab;
    let html = '<div class="px-4 py-4 space-y-5">';

    const products = getProductsFull();
    const vendors = getVendorsFull();

    const showProducts = (tab === 'all' || tab === 'products') && products.length > 0;
    const showVendors = (tab === 'all' || tab === 'vendors') && vendors.length > 0;

    if (!showProducts && !showVendors) {
        body.innerHTML = renderEmptyState(tab);
        if (window.lucide) lucide.createIcons();
        return;
    }

    if (showVendors) {
        html += `
            <div>
                <div class="flex items-center justify-between mb-3">
                    <h3 class="font-black text-xs text-gray-900 flex items-center gap-1.5">
                        <i data-lucide="store" class="w-3.5 h-3.5 text-snapp"></i>
                        رستوران‌های مورد علاقه
                        <span class="text-[10px] text-gray-400 font-bold">(${toPersianDigits(vendors.length)})</span>
                    </h3>
                </div>
                <div class="space-y-2.5">
                    ${vendors.map(v => renderVendorCard(v)).join('')}
                </div>
            </div>
        `;
    }

    if (showProducts) {
        const sorted = sortProducts(products);
        html += `
            <div>
                <div class="flex items-center justify-between mb-3">
                    <h3 class="font-black text-xs text-gray-900 flex items-center gap-1.5">
                        <i data-lucide="package" class="w-3.5 h-3.5 text-snapp"></i>
                        محصولات مورد علاقه
                        <span class="text-[10px] text-gray-400 font-bold">(${toPersianDigits(products.length)})</span>
                    </h3>
                </div>
                <div class="space-y-3">
                    ${sorted.map(p => renderProductCard(p)).join('')}
                </div>
            </div>
        `;
    }

    html += '</div>';
    body.innerHTML = html;
    if (window.lucide) lucide.createIcons();
    updateBulkBar();
}

function renderEmptyState(tab) {
    const config = {
        all: { icon: 'heart-off', title: 'لیست علاقه‌مندی‌ها خالی است', body: 'محصولات و رستوران‌های موردعلاقه‌تان را با ضربه روی آیکون قلب ذخیره کنید.' },
        products: { icon: 'package-x', title: 'هیچ محصولی ذخیره نکرده‌اید', body: 'روی آیکون قلب روی کارت هر محصول بزنید تا اینجا ذخیره شود.' },
        vendors: { icon: 'store', title: 'هیچ رستورانی ذخیره نکرده‌اید', body: 'رستوران‌های موردعلاقه‌تان را برای دسترسی سریع ذخیره کنید.' }
    }[tab] || { icon: 'heart-off', title: 'لیست خالی است', body: '' };

    return `
        <div class="px-4 py-20 text-center">
            <div class="w-24 h-24 mx-auto mb-5 bg-gradient-to-br from-pink-50 to-rose-50 rounded-full flex items-center justify-center text-rose-400 border border-rose-100">
                <i data-lucide="${config.icon}" class="w-11 h-11"></i>
            </div>
            <h3 class="font-black text-sm text-gray-900 mb-1.5">${config.title}</h3>
            <p class="text-xs text-gray-500 leading-relaxed max-w-xs mx-auto">${config.body}</p>
            <button onclick="window.WishlistPageAPI.close()" class="mt-6 bg-snapp hover:bg-snapp-hover text-white font-black text-xs px-6 py-3 rounded-2xl shadow-md shadow-pink-500/25 active:scale-95 transition-all">
                شروع خرید
            </button>
        </div>
    `;
}

function renderProductCard(p) {
    const api = window.AppAPI;
    const vendor = api ? api.vendors.find(v => v.id === p.vendorId) : null;
    const selected = wishlistState.selectedItems.has('p_' + p.id);
    const hasDiscount = p.discount > 0;
    const inCart = api && api.cartState.items[p.id]?.quantity > 0;

    return `
        <div class="wl-product-card bg-white rounded-2xl border ${selected ? 'border-snapp shadow-sm shadow-pink-500/10' : 'border-gray-100'} overflow-hidden transition-all hover:shadow-[0_4px_14px_-6px_rgba(0,0,0,0.1)]" data-product-id="${p.id}">
            <div class="flex gap-3 p-3">
                ${wishlistState.selectionMode ? `
                    <div class="flex items-center shrink-0">
                        <button class="wl-select-btn w-6 h-6 rounded-lg border-2 ${selected ? 'border-snapp bg-snapp' : 'border-gray-300 bg-white'} flex items-center justify-center transition-all" data-select-key="p_${p.id}">
                            ${selected ? '<i data-lucide="check" class="w-3.5 h-3.5 text-white"></i>' : ''}
                        </button>
                    </div>
                ` : ''}
                <div class="relative w-24 h-24 rounded-xl overflow-hidden shrink-0 bg-gray-50 border border-gray-100 cursor-pointer" onclick="window.WishlistPageAPI.openProduct(${p.id})">
                    <img src="${p.image}" class="w-full h-full object-cover">
                    ${hasDiscount ? `<span class="absolute top-1.5 right-1.5 bg-rose-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md shadow-sm">٪${toPersianDigits(p.discount)}</span>` : ''}
                </div>
                <div class="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                    <div>
                        <div class="flex items-start justify-between gap-2 mb-1">
                            <h4 class="font-extrabold text-xs text-gray-900 leading-snug line-clamp-2 cursor-pointer flex-1" onclick="window.WishlistPageAPI.openProduct(${p.id})">${escapeHtml(p.title)}</h4>
                            ${!wishlistState.selectionMode ? `
                                <button class="wl-remove-btn text-gray-300 hover:text-rose-500 shrink-0 active:scale-90 transition-all" data-remove-product="${p.id}">
                                    <i data-lucide="x" class="w-4 h-4"></i>
                                </button>
                            ` : ''}
                        </div>
                        ${vendor ? `
                            <div class="text-[10px] text-gray-500 flex items-center gap-1 mb-1.5">
                                <i data-lucide="store" class="w-2.5 h-2.5"></i>
                                <span class="truncate">${escapeHtml(vendor.name)}</span>
                            </div>
                        ` : ''}
                        <div class="flex items-center gap-1">
                            <i data-lucide="star" class="w-3 h-3 fill-amber-400 text-amber-400"></i>
                            <span class="text-[10px] font-black text-amber-600">${toPersianDigits(p.rating)}</span>
                            <span class="text-[9px] text-gray-400">(${toPersianDigits(p.reviews)})</span>
                        </div>
                    </div>
                    <div class="flex items-end justify-between mt-2 pt-2 border-t border-gray-50">
                        <div>
                            ${hasDiscount ? `<span class="text-[10px] text-gray-400 line-through block">${formatPrice(p.originalPrice)}</span>` : ''}
                            <span class="text-xs font-black text-gray-900">${formatPrice(p.price)} <span class="text-[9px] font-normal text-gray-500">تومان</span></span>
                        </div>
                        ${wishlistState.selectionMode ? '' : (inCart ? `
                            <button onclick="event.stopPropagation(); window.WishlistPageAPI.openCart()" class="bg-emerald-50 text-emerald-600 text-[10px] font-black px-2.5 py-1.5 rounded-lg border border-emerald-200 active:scale-95 transition-all flex items-center gap-1">
                                <i data-lucide="check-circle-2" class="w-3 h-3"></i>
                                در سبد
                            </button>
                        ` : `
                            <button class="wl-add-btn bg-snapp-light hover:bg-snapp hover:text-white text-snapp text-[10px] font-black px-2.5 py-1.5 rounded-lg border border-snapp/20 active:scale-95 transition-all flex items-center gap-1" data-add-product="${p.id}">
                                <i data-lucide="plus" class="w-3 h-3"></i>
                                افزودن
                            </button>
                        `)}
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderVendorCard(v) {
    const selected = wishlistState.selectedItems.has('v_' + v.id);
    const isFree = v.deliveryFee === 0;

    return `
        <div class="wl-vendor-card bg-white rounded-2xl border ${selected ? 'border-snapp shadow-sm shadow-pink-500/10' : 'border-gray-100'} overflow-hidden transition-all hover:shadow-[0_4px_14px_-6px_rgba(0,0,0,0.1)]" data-vendor-id="${v.id}">
            <div class="flex items-stretch gap-3 p-3">
                ${wishlistState.selectionMode ? `
                    <div class="flex items-center shrink-0">
                        <button class="wl-select-btn w-6 h-6 rounded-lg border-2 ${selected ? 'border-snapp bg-snapp' : 'border-gray-300 bg-white'} flex items-center justify-center transition-all" data-select-key="v_${v.id}">
                            ${selected ? '<i data-lucide="check" class="w-3.5 h-3.5 text-white"></i>' : ''}
                        </button>
                    </div>
                ` : ''}
                <div class="relative w-20 h-20 rounded-xl overflow-hidden shrink-0 border border-gray-100 cursor-pointer" onclick="window.WishlistPageAPI.openVendor('${v.id}')">
                    <img src="${v.banner}" class="w-full h-full object-cover">
                    <div class="absolute -bottom-1 -right-1 w-8 h-8 rounded-lg border-2 border-white bg-white overflow-hidden">
                        <img src="${v.logo}" class="w-full h-full object-cover">
                    </div>
                </div>
                <div class="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                    <div class="flex items-start justify-between gap-2">
                        <div class="min-w-0 flex-1">
                            <h4 class="font-extrabold text-xs text-gray-900 truncate cursor-pointer" onclick="window.WishlistPageAPI.openVendor('${v.id}')">${escapeHtml(v.name)}</h4>
                            <p class="text-[10px] text-gray-500 truncate mt-0.5">${escapeHtml(v.type)}</p>
                        </div>
                        ${!wishlistState.selectionMode ? `
                            <button class="wl-remove-btn text-gray-300 hover:text-rose-500 shrink-0 active:scale-90 transition-all" data-remove-vendor="${v.id}">
                                <i data-lucide="x" class="w-4 h-4"></i>
                            </button>
                        ` : ''}
                    </div>
                    <div class="flex items-center gap-2 mt-1.5 text-[10px] font-bold text-gray-600">
                        <span class="flex items-center gap-0.5">
                            <i data-lucide="star" class="w-3 h-3 fill-amber-400 text-amber-400"></i>
                            <span class="text-amber-600">${toPersianDigits(v.rating)}</span>
                        </span>
                        <span class="w-1 h-1 bg-gray-300 rounded-full"></span>
                        <span class="flex items-center gap-0.5"><i data-lucide="clock" class="w-3 h-3 text-gray-400"></i>${v.deliveryTime}</span>
                        <span class="w-1 h-1 bg-gray-300 rounded-full"></span>
                        <span class="${isFree ? 'text-emerald-600' : ''} flex items-center gap-0.5">
                            <i data-lucide="bike" class="w-3 h-3 text-gray-400"></i>
                            ${isFree ? 'رایگان' : formatPrice(v.deliveryFee) + ' تومان'}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function bindWishlistEvents(view) {
    view.querySelector('#wl-close-btn').onclick = () => closeWishlistPage();

    view.querySelectorAll('.wl-tab').forEach(tab => {
        tab.onclick = () => {
            wishlistState.activeTab = tab.dataset.wlTab;
            view.querySelectorAll('.wl-tab').forEach(t => {
                t.className = 'wl-tab px-3.5 py-1.5 rounded-full text-xs font-bold shrink-0 bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all';
            });
            tab.className = 'wl-tab px-3.5 py-1.5 rounded-full text-xs font-black shrink-0 bg-snapp text-white transition-all';
            renderWishlistBody();
        };
    });

    view.querySelectorAll('.wl-sort-chip').forEach(chip => {
        chip.onclick = () => {
            wishlistState.sortBy = chip.dataset.wlSort;
            view.querySelectorAll('.wl-sort-chip').forEach(c => {
                c.className = 'wl-sort-chip px-3 py-1.5 rounded-lg text-[10px] font-bold shrink-0 bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100 transition-all';
            });
            chip.className = 'wl-sort-chip px-3 py-1.5 rounded-lg text-[10px] font-bold shrink-0 bg-snapp-light text-snapp border border-snapp/20 transition-all';
            renderWishlistBody();
        };
    });

    view.querySelector('#wl-select-mode-btn').onclick = () => {
        wishlistState.selectionMode = !wishlistState.selectionMode;
        wishlistState.selectedItems.clear();
        const btn = view.querySelector('#wl-select-mode-btn');
        if (wishlistState.selectionMode) {
            btn.innerHTML = `<i data-lucide="x" class="w-3.5 h-3.5"></i> انصراف`;
            btn.className = 'text-[10px] font-black text-gray-600 flex items-center gap-1 px-3 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors';
        } else {
            btn.innerHTML = `<i data-lucide="check-square" class="w-3.5 h-3.5"></i> انتخاب گروهی`;
            btn.className = 'text-[10px] font-black text-snapp flex items-center gap-1 px-3 py-2 rounded-xl hover:bg-snapp-light transition-colors';
        }
        if (window.lucide) lucide.createIcons();
        renderWishlistBody();
    };

    view.addEventListener('click', (e) => {
        const selectBtn = e.target.closest('[data-select-key]');
        if (selectBtn) {
            e.stopPropagation();
            const key = selectBtn.dataset.selectKey;
            if (wishlistState.selectedItems.has(key)) wishlistState.selectedItems.delete(key);
            else wishlistState.selectedItems.add(key);
            renderWishlistBody();
            return;
        }

        const removeProduct = e.target.closest('[data-remove-product]');
        if (removeProduct) {
            e.stopPropagation();
            const pid = parseInt(removeProduct.dataset.removeProduct, 10);
            removeProductFromWishlist(pid);
            return;
        }

        const removeVendor = e.target.closest('[data-remove-vendor]');
        if (removeVendor) {
            e.stopPropagation();
            const vid = removeVendor.dataset.removeVendor;
            removeVendorFromWishlist(vid);
            return;
        }

        const addBtn = e.target.closest('[data-add-product]');
        if (addBtn) {
            e.stopPropagation();
            const pid = parseInt(addBtn.dataset.addProduct, 10);
            if (window.AppAPI && window.AppAPI.handleAddToCart) {
                window.AppAPI.handleAddToCart(pid);
                showWishlistToast('محصول به سبد خرید اضافه شد.');
                renderWishlistBody();
            }
            return;
        }
    });

    view.querySelector('#wl-select-all-btn').onclick = () => {
        const allProducts = getProductsFull().map(p => 'p_' + p.id);
        const allVendors = getVendorsFull().map(v => 'v_' + v.id);
        const all = [...allProducts, ...allVendors];
        const allSelected = all.every(k => wishlistState.selectedItems.has(k));
        if (allSelected) wishlistState.selectedItems.clear();
        else wishlistState.selectedItems = new Set(all);
        renderWishlistBody();
    };

    view.querySelector('#wl-bulk-add-btn').onclick = () => {
        const selected = Array.from(wishlistState.selectedItems);
        const products = selected.filter(k => k.startsWith('p_')).map(k => parseInt(k.slice(2), 10));
        if (products.length === 0) {
            showWishlistToast('هیچ محصولی برای افزودن انتخاب نشده.');
            return;
        }
        if (!window.AppAPI || !window.AppAPI.handleAddToCart) return;
        products.forEach(id => window.AppAPI.handleAddToCart(id));
        showWishlistToast(`${toPersianDigits(products.length)} محصول به سبد اضافه شد.`);
        wishlistState.selectedItems.clear();
        wishlistState.selectionMode = false;
        const btn = view.querySelector('#wl-select-mode-btn');
        btn.innerHTML = `<i data-lucide="check-square" class="w-3.5 h-3.5"></i> انتخاب گروهی`;
        btn.className = 'text-[10px] font-black text-snapp flex items-center gap-1 px-3 py-2 rounded-xl hover:bg-snapp-light transition-colors';
        if (window.lucide) lucide.createIcons();
        renderWishlistBody();
    };

    view.querySelector('#wl-bulk-remove-btn').onclick = () => {
        const selected = Array.from(wishlistState.selectedItems);
        if (selected.length === 0) {
            showWishlistToast('هیچ آیتمی انتخاب نشده.');
            return;
        }
        if (!confirm(`آیا از حذف ${toPersianDigits(selected.length)} آیتم از علاقه‌مندی‌ها اطمینان دارید؟`)) return;
        selected.forEach(k => {
            if (k.startsWith('p_')) {
                const id = parseInt(k.slice(2), 10);
                wishlistProducts = wishlistProducts.filter(w => w.id !== id);
                syncLegacyWishlist();
            } else if (k.startsWith('v_')) {
                const id = k.slice(2);
                wishlistVendors = wishlistVendors.filter(w => w.id !== id);
            }
        });
        wishlistState.selectedItems.clear();
        wishlistState.selectionMode = false;
        const btn = view.querySelector('#wl-select-mode-btn');
        btn.innerHTML = `<i data-lucide="check-square" class="w-3.5 h-3.5"></i> انتخاب گروهی`;
        btn.className = 'text-[10px] font-black text-snapp flex items-center gap-1 px-3 py-2 rounded-xl hover:bg-snapp-light transition-colors';
        if (window.lucide) lucide.createIcons();
        showWishlistToast('آیتم‌های انتخاب شده حذف شدند.');
        updateWishlistCountBadge();
        renderWishlistBody();
    };
}

function updateBulkBar() {
    const bar = document.getElementById('wl-bulk-bar');
    if (!bar) return;

    const activeTab = wishlistState.activeTab;
    const hasVendorsOnly = activeTab === 'vendors';

    if (wishlistState.selectionMode) {
        bar.classList.remove('hidden');
        const count = wishlistState.selectedItems.size;
        const countEl = document.getElementById('wl-selected-count');
        if (countEl) countEl.textContent = toPersianDigits(count);

        const addBtn = document.getElementById('wl-bulk-add-btn');
        if (addBtn) {
            if (hasVendorsOnly) addBtn.style.display = 'none';
            else addBtn.style.display = '';
        }
    } else {
        bar.classList.add('hidden');
    }
}

function removeProductFromWishlist(pid) {
    wishlistProducts = wishlistProducts.filter(w => w.id !== pid);
    syncLegacyWishlist();
    updateWishlistCountBadge();
    renderWishlistBody();
    showWishlistToast('محصول از علاقه‌مندی‌ها حذف شد.');
}

function removeVendorFromWishlist(vid) {
    wishlistVendors = wishlistVendors.filter(w => w.id !== vid);
    updateWishlistCountBadge();
    renderWishlistBody();
    showWishlistToast('رستوران از علاقه‌مندی‌ها حذف شد.');
}

function syncLegacyWishlist() {
    if (typeof window !== 'undefined' && window.AppAPI) {
        try {
            const legacy = window.wishlistState;
            if (Array.isArray(legacy)) {
                legacy.length = 0;
                wishlistProducts.forEach(w => legacy.push(w.id));
                if (typeof window.updateWishlistBadge === 'function') {
                    window.updateWishlistBadge();
                }
            }
        } catch (e) {}
    }
}

function closeWishlistPage() {
    const view = document.getElementById('wishlist-page-view');
    if (view) {
        view.style.opacity = '0';
        setTimeout(() => {
            view.remove();
            document.body.style.overflow = '';
        }, 220);
    }
}

function showWishlistToast(msg) {
    const existing = document.getElementById('wl-toast');
    if (existing) existing.remove();

    const t = document.createElement('div');
    t.id = 'wl-toast';
    t.className = 'fixed top-4 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-5 py-3 rounded-xl text-xs font-bold shadow-2xl z-[10010] transition-all duration-300 transform -translate-y-10 opacity-0 flex items-center gap-2 w-max max-w-[90vw] font-vazir';
    t.innerHTML = `<i data-lucide="check-circle-2" class="w-4 h-4 text-emerald-400"></i> <span>${msg}</span>`;
    document.body.appendChild(t);
    if (window.lucide) lucide.createIcons();

    requestAnimationFrame(() => {
        t.classList.remove('-translate-y-10', 'opacity-0');
        t.classList.add('translate-y-0', 'opacity-100');
    });

    setTimeout(() => {
        t.classList.remove('translate-y-0', 'opacity-100');
        t.classList.add('-translate-y-10', 'opacity-0');
        setTimeout(() => t.remove(), 300);
    }, 2400);
}

window.WishlistPageAPI = {
    open: function() { openWishlistPage(); },
    close: function() { closeWishlistPage(); },
    openProduct: function(id) {
        closeWishlistPage();
        setTimeout(() => {
            if (typeof window.openProductDetail === 'function') {
                window.openProductDetail(id);
            } else if (typeof window.openProductModal === 'function') {
                window.openProductModal(id);
            }
        }, 240);
    },
    openVendor: function(id) {
        closeWishlistPage();
        setTimeout(() => {
            if (window.AppAPI && window.AppAPI.selectVendor) {
                window.AppAPI.selectVendor(id);
            }
        }, 240);
    },
    openCart: function() {
        closeWishlistPage();
        setTimeout(() => {
            if (window.AppAPI && window.AppAPI.toggleCartDrawer) {
                window.AppAPI.toggleCartDrawer(true);
            }
        }, 240);
    },
    add: function(productId) {
        const existing = wishlistProducts.find(w => w.id === productId);
        if (existing) return;
        wishlistProducts.push({ id: productId, addedAt: Date.now() });
        syncLegacyWishlist();
        updateWishlistCountBadge();
        showWishlistToast('به علاقه‌مندی‌ها اضافه شد.');
    },
    remove: function(productId) {
        removeProductFromWishlist(productId);
    },
    getCount: function() {
        return wishlistProducts.length + wishlistVendors.length;
    }
};

window.openWishlistPage = openWishlistPage;