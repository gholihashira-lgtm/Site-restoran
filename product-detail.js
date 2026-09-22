// product-detail.js

let currentProduct = null;
let currentAddons = [];
let currentQty = 1;
let currentNote = '';
let galleryIndex = 0;

function toPersianDigits(n) {
    if (n === null || n === undefined) return '';
    const f = ['۰','۱','۲','۳','۴','۵','۶','۷','۸','۹'];
    return n.toString().replace(/\d/g, x => f[x]);
}

function formatPrice(amount) {
    return toPersianDigits(Math.round(amount).toLocaleString('fa-IR'));
}

function escapeHtml(s) {
    if (!s) return '';
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

function getProductGallery(product) {
    const base = product.image;
    const extras = [
        product.image.replace('w=500', 'w=900'),
        product.image.replace('w=500', 'w=900').replace('q=80', 'q=70&sat=20'),
        product.image.replace('w=500', 'w=900')
    ];
    return [base, ...extras].slice(0, 4);
}

function getSimilarProducts(product) {
    const api = window.AppAPI;
    if (!api) return [];
    return api.catalogProducts
        .filter(p => p.id !== product.id && (p.categoryId === product.categoryId || p.vendorId === product.vendorId))
        .slice(0, 6);
}

function calcUnitPrice() {
    if (!currentProduct) return 0;
    let total = currentProduct.price;
    currentAddons.forEach(a => { total += a.price; });
    return total;
}

function calcTotalPrice() {
    return calcUnitPrice() * currentQty;
}

const MOCK_REVIEWS = [
    { name: 'سارا کریمی', rating: 5, date: '۳ روز پیش', text: 'واقعاً عالی بود! کیفیت مواد اولیه خیلی خوبه و بسته‌بندی گرم رسید.', likes: 24 },
    { name: 'امیر حسینی', rating: 4, date: '۱ هفته پیش', text: 'طعم فوق‌العاده، فقط مقدار سس یه‌کم زیاد بود. در کل راضی‌ام.', likes: 12 },
    { name: 'مینا رضایی', rating: 5, date: '۲ هفته پیش', text: 'بهترین چیزی که تا حالا سفارش دادم. حتماً بازم می‌گیرم.', likes: 38 },
    { name: 'علی محمدی', rating: 4, date: '۳ هفته پیش', text: 'ارزش قیمتش رو داره. پیک هم خیلی سریع رسید.', likes: 8 }
];

export function openProductDetail(productId) {
    const api = window.AppAPI;
    if (!api) return;

    const product = api.catalogProducts.find(p => p.id === productId);
    if (!product) return;

    currentProduct = product;
    currentAddons = [];
    currentQty = 1;
    currentNote = '';
    galleryIndex = 0;

    const existing = document.getElementById('product-detail-view');
    if (existing) existing.remove();

    document.body.style.overflow = 'hidden';

    const view = document.createElement('div');
    view.id = 'product-detail-view';
    view.className = 'fixed inset-0 z-[70] bg-white overflow-y-auto font-vazir';
    view.style.opacity = '0';
    view.style.transition = 'opacity 0.25s ease';

    view.innerHTML = renderDetailHTML(product);
    document.body.appendChild(view);

    if (window.lucide) lucide.createIcons();

    requestAnimationFrame(() => { view.style.opacity = '1'; });

    bindDetailEvents(view);
    updatePriceBar();
}

function renderDetailHTML(product) {
    const api = window.AppAPI;
    const vendor = api.vendors.find(v => v.id === product.vendorId);
    const gallery = getProductGallery(product);
    const similar = getSimilarProducts(product);
    const hasDiscount = product.discount > 0;

    return `
        <div class="max-w-md mx-auto bg-white min-h-screen relative pb-36">

            <div class="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-4 py-3">
                <button id="pd-close-btn" class="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 hover:bg-gray-200 active:scale-95 transition-all">
                    <i data-lucide="arrow-right" class="w-4 h-4"></i>
                </button>
                <div class="flex items-center gap-1.5">
                    <button id="pd-share-btn" class="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 hover:bg-gray-200 active:scale-95 transition-all">
                        <i data-lucide="share-2" class="w-4 h-4"></i>
                    </button>
                    <button id="pd-fav-btn" class="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 hover:bg-gray-200 active:scale-95 transition-all">
                        <i data-lucide="heart" class="w-4 h-4"></i>
                    </button>
                </div>
            </div>

            <div class="relative">
                <div class="relative w-full aspect-square bg-gray-100 overflow-hidden">
                    <img id="pd-main-image" src="${gallery[0]}" class="w-full h-full object-cover transition-opacity duration-300" alt="${escapeHtml(product.title)}">
                    ${hasDiscount ? `
                        <div class="absolute top-4 right-4 bg-gradient-to-br from-rose-500 to-pink-600 text-white text-xs font-black px-3 py-1.5 rounded-xl shadow-lg shadow-rose-500/30 flex items-center gap-1">
                            <i data-lucide="flame" class="w-3.5 h-3.5 fill-white"></i>
                            ٪${toPersianDigits(product.discount)} تخفیف
                        </div>
                    ` : ''}
                    <button id="pd-3d-btn" class="absolute top-4 left-4 bg-black/70 backdrop-blur-md border border-white/20 text-white text-[11px] font-black px-3 py-2 rounded-xl flex items-center gap-1.5 active:scale-95 transition-all shadow-lg">
                        <i data-lucide="box" class="w-3.5 h-3.5"></i>
                        نمایش سه‌بعدی
                    </button>
                </div>
                ${gallery.length > 1 ? `
                    <div class="flex gap-2 px-4 mt-3 overflow-x-auto no-scrollbar">
                        ${gallery.map((img, i) => `
                            <button onclick="window.ProductDetailAPI.setGallery(${i})" class="pd-thumb shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${i === 0 ? 'border-snapp' : 'border-transparent'}" data-idx="${i}">
                                <img src="${img}" class="w-full h-full object-cover">
                            </button>
                        `).join('')}
                    </div>
                ` : ''}
            </div>

            <div class="px-4 mt-5">
                <div class="flex items-start justify-between gap-3 mb-3">
                    <h1 class="font-black text-lg text-gray-900 leading-tight flex-1">${escapeHtml(product.title)}</h1>
                    <div class="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-xl shrink-0">
                        <i data-lucide="star" class="w-3.5 h-3.5 fill-amber-400 text-amber-400"></i>
                        <span class="text-xs font-black text-amber-600">${toPersianDigits(product.rating)}</span>
                        <span class="text-[10px] text-gray-400 font-medium">(${toPersianDigits(product.reviews)})</span>
                    </div>
                </div>

                <p class="text-xs text-gray-500 leading-relaxed mb-4">${escapeHtml(product.desc)}</p>

                ${hasDiscount ? `
                    <div class="flex items-center gap-2 mb-2">
                        <span class="text-[11px] text-gray-400 line-through">${formatPrice(product.originalPrice)} تومان</span>
                        <span class="bg-rose-50 text-rose-600 text-[10px] font-black px-1.5 py-0.5 rounded-md">
                            ${formatPrice(product.originalPrice - product.price)} تومان سود
                        </span>
                    </div>
                ` : ''}

                <div class="flex items-end justify-between mb-5">
                    <div>
                        <span class="text-2xl font-black text-gray-900" id="pd-price-main">${formatPrice(product.price)}</span>
                        <span class="text-xs font-normal text-gray-500 mr-1">تومان</span>
                    </div>
                    <span class="text-[10px] text-gray-500 bg-gray-50 px-2 py-1 rounded-lg">
                        ${product.stockLeft > 0 ? `${toPersianDigits(product.stockLeft)} عدد باقی‌مانده` : 'ناموجود'}
                    </span>
                </div>
            </div>

            ${vendor ? `
                <div class="mx-4 bg-gray-50 rounded-2xl border border-gray-100 p-3.5 flex items-center gap-3">
                    <img src="${vendor.logo}" class="w-11 h-11 rounded-xl object-cover border border-white shadow-sm">
                    <div class="flex-1 min-w-0">
                        <div class="font-black text-xs text-gray-900 truncate">${escapeHtml(vendor.name)}</div>
                        <div class="text-[10px] text-gray-500 mt-0.5 flex items-center gap-2">
                            <span class="flex items-center gap-0.5"><i data-lucide="clock" class="w-3 h-3"></i>${vendor.deliveryTime}</span>
                            <span class="w-1 h-1 bg-gray-300 rounded-full"></span>
                            <span>${vendor.deliveryFee === 0 ? 'ارسال رایگان' : formatPrice(vendor.deliveryFee) + ' تومان'}</span>
                        </div>
                    </div>
                    <button onclick="window.ProductDetailAPI.goToVendor('${vendor.id}')" class="text-[10px] font-black text-snapp bg-white border border-snapp/30 px-3 py-2 rounded-xl active:scale-95 transition-all">
                        مشاهده منو
                    </button>
                </div>
            ` : ''}

            ${product.addons && product.addons.length > 0 ? `
                <div class="px-4 mt-6">
                    <div class="flex items-center gap-1.5 mb-3">
                        <div class="w-1.5 h-4 bg-snapp rounded-full"></div>
                        <h3 class="font-black text-sm text-gray-900">افزودنی‌های دلخواه</h3>
                        <span class="text-[10px] text-gray-400 font-bold mr-1">(اختیاری)</span>
                    </div>
                    <div class="space-y-2">
                        ${product.addons.map(a => `
                            <label class="pd-addon-row flex items-center justify-between p-3.5 rounded-2xl border-2 border-gray-100 bg-white hover:border-snapp/40 cursor-pointer transition-all">
                                <div class="flex items-center gap-3 flex-1 min-w-0">
                                    <div class="relative shrink-0">
                                        <input type="checkbox" class="peer appearance-none w-5 h-5 border-2 border-gray-300 rounded-md focus:outline-none checked:bg-snapp checked:border-snapp transition-colors cursor-pointer">
                                        <i data-lucide="check" class="absolute inset-0 m-auto w-3.5 h-3.5 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity"></i>
                                    </div>
                                    <span class="text-xs font-bold text-gray-800 truncate">${escapeHtml(a.title)}</span>
                                </div>
                                <span class="text-xs font-black text-snapp shrink-0 pr-2">+${formatPrice(a.price)}</span>
                                <input type="checkbox" class="hidden" onchange="window.ProductDetailAPI.toggleAddon('${a.id}', this.checked)" data-addon-id="${a.id}">
                            </label>
                        `).join('')}
                    </div>
                </div>
            ` : ''}

            <div class="px-4 mt-6">
                <div class="flex items-center gap-1.5 mb-3">
                    <div class="w-1.5 h-4 bg-snapp rounded-full"></div>
                    <h3 class="font-black text-sm text-gray-900">یادداشت برای آشپز</h3>
                    <span class="text-[10px] text-gray-400 font-bold mr-1">(اختیاری)</span>
                </div>
                <textarea id="pd-note" placeholder="مثلاً: بدون پیاز، سس اضافه، تندتر..." rows="2" class="w-full bg-gray-50 border border-gray-200 rounded-2xl px-3.5 py-3 text-xs font-medium outline-none focus:border-snapp focus:bg-white resize-none leading-relaxed"></textarea>
            </div>

            <div class="px-4 mt-6">
                <div class="flex items-center justify-between mb-4">
                    <div class="flex items-center gap-1.5">
                        <div class="w-1.5 h-4 bg-snapp rounded-full"></div>
                        <h3 class="font-black text-sm text-gray-900">نظرات مشتریان</h3>
                    </div>
                    <button class="text-[10px] font-black text-snapp">مشاهده همه</button>
                </div>

                <div class="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100 mb-4">
                    <div class="text-center">
                        <div class="text-3xl font-black text-gray-900">${toPersianDigits(product.rating)}</div>
                        <div class="flex items-center justify-center gap-0.5 mt-1">
                            ${[1,2,3,4,5].map(s => `
                                <i data-lucide="star" class="w-3 h-3 ${s <= Math.round(product.rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}"></i>
                            `).join('')}
                        </div>
                        <div class="text-[10px] text-gray-500 mt-1">${toPersianDigits(product.reviews)} نظر</div>
                    </div>
                    <div class="flex-1 space-y-1.5">
                        ${[5,4,3,2,1].map(s => {
                            const pct = s === 5 ? 72 : s === 4 ? 20 : s === 3 ? 5 : s === 2 ? 2 : 1;
                            return `
                                <div class="flex items-center gap-2 text-[10px]">
                                    <span class="w-3 text-gray-500 font-bold shrink-0">${toPersianDigits(s)}</span>
                                    <div class="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                        <div class="h-full bg-amber-400" style="width: ${pct}%"></div>
                                    </div>
                                    <span class="w-7 text-gray-500 font-bold text-left shrink-0">٪${toPersianDigits(pct)}</span>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>

                <div class="space-y-3">
                    ${MOCK_REVIEWS.map(r => `
                        <div class="bg-white rounded-2xl p-3.5 border border-gray-100">
                            <div class="flex items-center justify-between mb-2">
                                <div class="flex items-center gap-2">
                                    <div class="w-8 h-8 rounded-full bg-gradient-to-br from-pink-200 to-pink-100 flex items-center justify-center text-snapp font-black text-xs">${escapeHtml(r.name.charAt(0))}</div>
                                    <div>
                                        <div class="font-black text-[11px] text-gray-800">${r.name}</div>
                                        <div class="flex items-center gap-1 mt-0.5">
                                            ${[1,2,3,4,5].map(s => `
                                                <i data-lucide="star" class="w-2.5 h-2.5 ${s <= r.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}"></i>
                                            `).join('')}
                                            <span class="text-[9px] text-gray-400 mr-1">${r.date}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <p class="text-[11px] text-gray-600 leading-relaxed">${r.text}</p>
                            <div class="flex items-center gap-3 mt-2.5 pt-2.5 border-t border-gray-50">
                                <button class="text-[10px] font-bold text-gray-500 hover:text-snapp flex items-center gap-1">
                                    <i data-lucide="thumbs-up" class="w-3 h-3"></i>
                                    مفید بود (${toPersianDigits(r.likes)})
                                </button>
                                <button class="text-[10px] font-bold text-gray-500 hover:text-snapp flex items-center gap-1">
                                    <i data-lucide="message-circle" class="w-3 h-3"></i>
                                    پاسخ
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>

            ${similar.length > 0 ? `
                <div class="mt-6">
                    <div class="flex items-center justify-between px-4 mb-3">
                        <div class="flex items-center gap-1.5">
                            <div class="w-1.5 h-4 bg-snapp rounded-full"></div>
                            <h3 class="font-black text-sm text-gray-900">محصولات مشابه</h3>
                        </div>
                    </div>
                    <div class="flex gap-3 overflow-x-auto no-scrollbar px-4 pb-2">
                        ${similar.map(p => `
                            <div onclick="window.ProductDetailAPI.switchProduct(${p.id})" class="shrink-0 w-36 rounded-2xl border border-gray-100 bg-white overflow-hidden shadow-sm cursor-pointer active:scale-95 transition-transform">
                                <div class="relative h-24 bg-gray-100">
                                    <img src="${p.image}" class="w-full h-full object-cover">
                                    ${p.discount > 0 ? `<span class="absolute top-1.5 right-1.5 bg-rose-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md">٪${toPersianDigits(p.discount)}</span>` : ''}
                                </div>
                                <div class="p-2.5">
                                    <div class="text-[10px] font-black text-gray-900 line-clamp-2 leading-snug mb-1.5 h-8">${escapeHtml(p.title)}</div>
                                    <div class="text-xs font-black text-snapp">${formatPrice(p.price)} <span class="text-[9px] font-normal text-gray-500">تومان</span></div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}

            <div class="fixed bottom-0 inset-x-0 max-w-md mx-auto bg-white border-t border-gray-200 px-4 pt-3 pb-4 shadow-[0_-4px_14px_rgba(0,0,0,0.06)] z-50">
                <div class="flex items-center gap-3">
                    <div class="flex items-center bg-gray-100 rounded-2xl p-1 gap-2 shrink-0">
                        <button id="pd-qty-plus" class="w-9 h-9 flex items-center justify-center bg-white rounded-xl text-snapp shadow-sm active:scale-90 transition-transform">
                            <i data-lucide="plus" class="w-4 h-4"></i>
                        </button>
                        <span id="pd-qty-display" class="text-sm font-black min-w-5 text-center">${toPersianDigits(currentQty)}</span>
                        <button id="pd-qty-minus" class="w-9 h-9 flex items-center justify-center bg-white rounded-xl text-gray-600 shadow-sm active:scale-90 transition-transform">
                            <i data-lucide="minus" class="w-4 h-4"></i>
                        </button>
                    </div>
                    <button id="pd-add-btn" class="flex-1 bg-snapp hover:bg-snapp-hover text-white font-black text-xs py-4 rounded-2xl shadow-lg shadow-pink-500/30 active:scale-95 transition-all flex items-center justify-between px-4">
                        <span>افزودن به سبد</span>
                        <span class="flex items-center gap-1">
                            <span id="pd-total-price">${formatPrice(calcTotalPrice())}</span>
                            <span class="text-[10px] font-normal opacity-90">تومان</span>
                        </span>
                    </button>
                </div>
            </div>
        </div>
    `;
}

function bindDetailEvents(view) {
    view.querySelector('#pd-close-btn').onclick = () => closeProductDetail();

    view.querySelector('#pd-share-btn').onclick = () => {
        if (navigator.share) {
            navigator.share({ title: currentProduct.title, text: currentProduct.desc, url: window.location.href }).catch(() => {});
        } else {
            navigator.clipboard.writeText(window.location.href);
            showToast('لینک محصول کپی شد.');
        }
    };

    view.querySelector('#pd-fav-btn').onclick = (e) => {
        const icon = e.currentTarget.querySelector('svg');
        if (icon) icon.classList.toggle('fill-red-500');
        if (icon) icon.classList.toggle('text-red-500');
    };

    view.querySelector('#pd-3d-btn').onclick = () => {
        // Force the exploded 3D view to open instead of the product detail page.
        // We temporarily unset `window.openProductDetail` so that
        // `openProductModal` falls through to `new ExplodedViewBuilder(product)`.
        const savedOpenDetail = window.openProductDetail;
        window.openProductDetail = null;
        try {
            if (typeof window.openProductModal === 'function') {
                window.openProductModal(currentProduct.id);
            }
        } finally {
            window.openProductDetail = savedOpenDetail;
        }
    };

    view.querySelector('#pd-qty-plus').onclick = () => {
        if (currentQty < 20) {
            currentQty++;
            updateQty();
        }
    };

    view.querySelector('#pd-qty-minus').onclick = () => {
        if (currentQty > 1) {
            currentQty--;
            updateQty();
        }
    };

    view.querySelector('#pd-add-btn').onclick = () => addToCartFromDetail();

    const note = view.querySelector('#pd-note');
    if (note) note.addEventListener('input', (e) => { currentNote = e.target.value; });

    view.querySelectorAll('input[data-addon-id]').forEach(input => {
        input.addEventListener('change', (e) => {
            const row = e.target.closest('.pd-addon-row');
            if (row) {
                if (e.target.checked) {
                    row.classList.add('border-snapp', 'bg-snapp-light/30');
                    row.classList.remove('border-gray-100');
                } else {
                    row.classList.remove('border-snapp', 'bg-snapp-light/30');
                    row.classList.add('border-gray-100');
                }
            }
        });
    });
}

function updateQty() {
    const display = document.getElementById('pd-qty-display');
    if (display) display.textContent = toPersianDigits(currentQty);
    updatePriceBar();
}

function updatePriceBar() {
    const total = document.getElementById('pd-total-price');
    if (total) total.textContent = formatPrice(calcTotalPrice());
}

function addToCartFromDetail() {
    if (!currentProduct || !window.AppAPI) return;

    const selectedAddons = currentProduct.addons
        ? currentProduct.addons.filter(a => currentAddons.some(ca => ca.id === a.id))
        : [];

    for (let i = 0; i < currentQty; i++) {
        window.AppAPI.handleAddToCart(currentProduct.id, selectedAddons, currentProduct.vendorId);
    }

    showToast(`«${currentProduct.title}» به سبد خرید افزوده شد.`);
    closeProductDetail();
    setTimeout(() => {
        if (window.AppAPI && typeof window.AppAPI.toggleCartDrawer === 'function') {
            window.AppAPI.toggleCartDrawer(true);
        }
    }, 250);
}

function closeProductDetail() {
    const view = document.getElementById('product-detail-view');
    if (view) {
        view.style.opacity = '0';
        setTimeout(() => {
            view.remove();
            document.body.style.overflow = '';
        }, 220);
    }
}

function showToast(msg) {
    const existing = document.getElementById('pd-toast');
    if (existing) existing.remove();

    const t = document.createElement('div');
    t.id = 'pd-toast';
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

window.ProductDetailAPI = {
    setGallery: function(idx) {
        galleryIndex = idx;
        const gallery = getProductGallery(currentProduct);
        const mainImg = document.getElementById('pd-main-image');
        if (mainImg) {
            mainImg.style.opacity = '0';
            setTimeout(() => {
                mainImg.src = gallery[idx];
                mainImg.style.opacity = '1';
            }, 150);
        }
        document.querySelectorAll('.pd-thumb').forEach((t, i) => {
            t.className = `pd-thumb shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${i === idx ? 'border-snapp' : 'border-transparent'}`;
        });
    },

    toggleAddon: function(addonId, checked) {
        const addon = currentProduct.addons.find(a => a.id === addonId);
        if (!addon) return;
        if (checked) {
            if (!currentAddons.some(a => a.id === addonId)) currentAddons.push(addon);
        } else {
            currentAddons = currentAddons.filter(a => a.id !== addonId);
        }
        updatePriceBar();
    },

    goToVendor: function(vendorId) {
        closeProductDetail();
        setTimeout(() => {
            if (window.AppAPI && typeof window.AppAPI.selectVendor === 'function') {
                window.AppAPI.selectVendor(vendorId);
            }
        }, 220);
    },

    switchProduct: function(productId) {
        closeProductDetail();
        setTimeout(() => openProductDetail(productId), 240);
    },

    close: function() { closeProductDetail(); }
};

window.openProductDetail = openProductDetail;