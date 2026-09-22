// filters-advanced.js

/* ==========================================================================
 * بخش ۱ — فیلترهای پیشرفته
 * ========================================================================== */

let advancedFilters = {
    minPrice: 0,
    maxPrice: 1000000,
    minRating: 0,
    maxDeliveryTime: 90,
    onlyDiscounted: false,
    onlyFreeShipping: false,
    categories: new Set(),
    sortBy: 'relevance'
};

let activeCategoryList = ['burgers', 'pizza', 'sandwich', 'kebab', 'traditional', 'ash', 'sweets', 'drinks', 'appetizers', 'supermarket'];

function fd_toPersianDigits(n) {
    if (n === null || n === undefined) return '';
    const f = ['۰','۱','۲','۳','۴','۵','۶','۷','۸','۹'];
    return n.toString().replace(/\d/g, x => f[x]);
}

function fd_formatPrice(a) {
    return fd_toPersianDigits(Math.round(a).toLocaleString('fa-IR'));
}

function fd_getCategoryLabel(id) {
    const map = {
        burgers: 'برگر', pizza: 'پیتزا', sandwich: 'ساندویچ', kebab: 'کباب',
        traditional: 'سنتی', ash: 'آش', sweets: 'شیرینی', drinks: 'نوشیدنی',
        appetizers: 'پیش‌غذا', supermarket: 'سوپرمارکت'
    };
    return map[id] || id;
}

function fd_countActiveFilters() {
    let n = 0;
    if (advancedFilters.minPrice > 0) n++;
    if (advancedFilters.maxPrice < 1000000) n++;
    if (advancedFilters.minRating > 0) n++;
    if (advancedFilters.maxDeliveryTime < 90) n++;
    if (advancedFilters.onlyDiscounted) n++;
    if (advancedFilters.onlyFreeShipping) n++;
    n += advancedFilters.categories.size;
    return n;
}

export function openAdvancedFilters() {
    const existing = document.getElementById('filters-advanced-modal');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'filters-advanced-modal';
    overlay.className = 'fixed inset-0 z-[90] bg-black/60 flex items-end justify-center opacity-0 transition-opacity duration-300 font-vazir';
    overlay.innerHTML = fd_renderFiltersSheet();

    document.body.appendChild(overlay);
    if (window.lucide) lucide.createIcons();

    requestAnimationFrame(() => {
        overlay.classList.remove('opacity-0');
        const content = document.getElementById('filters-sheet-content');
        if (content) content.classList.remove('translate-y-full');
    });

    fd_bindFiltersEvents(overlay);
    fd_updatePriceDisplay();
    fd_updateDeliveryDisplay();
}

function fd_renderFiltersSheet() {
    return `
        <div id="filters-sheet-content" class="bg-white w-full max-w-md rounded-t-3xl overflow-hidden transform translate-y-full transition-transform duration-300 flex flex-col max-h-[90vh]">
            <div class="p-4 bg-white border-b border-gray-100 flex justify-between items-center shrink-0">
                <div class="flex items-center gap-2">
                    <div class="w-2 h-5 bg-snapp rounded-full"></div>
                    <div>
                        <h3 class="font-black text-sm text-gray-900">فیلترهای پیشرفته</h3>
                        <p class="text-[10px] text-gray-500 mt-0.5" id="filter-count-text">هیچ فیلتری فعال نیست</p>
                    </div>
                </div>
                <div class="flex items-center gap-2">
                    <button id="filter-reset-btn" class="text-[10px] font-black text-rose-500 hover:bg-rose-50 px-3 py-2 rounded-xl transition-colors">بازنشانی</button>
                    <button id="filter-close-btn" class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200">
                        <i data-lucide="x" class="w-4 h-4"></i>
                    </button>
                </div>
            </div>

            <div class="overflow-y-auto p-4 space-y-5 flex-1">
                <div>
                    <div class="flex items-center justify-between mb-3">
                        <label class="text-xs font-black text-gray-900 flex items-center gap-1.5">
                            <i data-lucide="wallet" class="w-3.5 h-3.5 text-snapp"></i>
                            محدوده قیمت
                        </label>
                        <div class="text-[11px] font-bold text-gray-600 bg-gray-50 px-2 py-1 rounded-lg" dir="rtl">
                            <span id="price-min-label">۰</span>
                            <span class="text-gray-400 mx-1">تا</span>
                            <span id="price-max-label">۱,۰۰۰,۰۰۰</span>
                            <span class="text-gray-400 text-[10px] mr-1">تومان</span>
                        </div>
                    </div>
                    <div class="space-y-3">
                        <div>
                            <div class="flex justify-between text-[10px] font-bold text-gray-500 mb-1.5">
                                <span>حداقل</span>
                                <span id="price-min-display">۰ تومان</span>
                            </div>
                            <input type="range" id="filter-min-price" min="0" max="1000000" step="50000" value="${advancedFilters.minPrice}" class="w-full accent-snapp">
                        </div>
                        <div>
                            <div class="flex justify-between text-[10px] font-bold text-gray-500 mb-1.5">
                                <span>حداکثر</span>
                                <span id="price-max-display">۱,۰۰۰,۰۰۰ تومان</span>
                            </div>
                            <input type="range" id="filter-max-price" min="0" max="1000000" step="50000" value="${advancedFilters.maxPrice}" class="w-full accent-snapp">
                        </div>
                    </div>
                </div>

                <div class="h-px bg-gray-100"></div>

                <div>
                    <label class="text-xs font-black text-gray-900 flex items-center gap-1.5 mb-3">
                        <i data-lucide="star" class="w-3.5 h-3.5 text-snapp"></i>
                        حداقل امتیاز
                    </label>
                    <div class="flex gap-2">
                        ${[0, 3, 3.5, 4, 4.5].map(r => `
                            <button class="filter-rating-btn flex-1 py-2.5 rounded-xl border text-xs font-black transition-all ${advancedFilters.minRating === r ? 'bg-amber-50 border-amber-300 text-amber-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}" data-rating="${r}">
                                ${r === 0 ? 'همه' : `
                                    <div class="flex items-center justify-center gap-0.5">
                                        <span>${fd_toPersianDigits(r)}</span>
                                        <i data-lucide="star" class="w-3 h-3 fill-current"></i>
                                    </div>
                                `}
                            </button>
                        `).join('')}
                    </div>
                </div>

                <div class="h-px bg-gray-100"></div>

                <div>
                    <div class="flex items-center justify-between mb-3">
                        <label class="text-xs font-black text-gray-900 flex items-center gap-1.5">
                            <i data-lucide="clock" class="w-3.5 h-3.5 text-snapp"></i>
                            حداکثر زمان ارسال
                        </label>
                        <span class="text-[11px] font-bold text-snapp bg-snapp-light px-2 py-1 rounded-lg" id="delivery-time-display">۹۰ دقیقه</span>
                    </div>
                    <input type="range" id="filter-delivery-time" min="15" max="90" step="5" value="${advancedFilters.maxDeliveryTime}" class="w-full accent-snapp">
                    <div class="flex justify-between text-[9px] text-gray-400 font-bold mt-1">
                        <span>۱۵ دقیقه</span>
                        <span>۹۰ دقیقه</span>
                    </div>
                </div>

                <div class="h-px bg-gray-100"></div>

                <div>
                    <label class="text-xs font-black text-gray-900 flex items-center gap-1.5 mb-3">
                        <i data-lucide="layout-grid" class="w-3.5 h-3.5 text-snapp"></i>
                        دسته‌بندی‌ها
                    </label>
                    <div class="flex flex-wrap gap-2">
                        ${activeCategoryList.map(c => `
                            <button class="filter-cat-chip px-3 py-2 rounded-xl border text-[11px] font-bold transition-all ${advancedFilters.categories.has(c) ? 'bg-snapp text-white border-snapp shadow-sm shadow-pink-500/20' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}" data-cat="${c}">
                                ${fd_getCategoryLabel(c)}
                            </button>
                        `).join('')}
                    </div>
                </div>

                <div class="h-px bg-gray-100"></div>

                <div>
                    <label class="text-xs font-black text-gray-900 flex items-center gap-1.5 mb-3">
                        <i data-lucide="sliders-horizontal" class="w-3.5 h-3.5 text-snapp"></i>
                        گزینه‌های ویژه
                    </label>
                    <div class="space-y-2.5">
                        <label class="filter-toggle-row flex items-center justify-between p-3.5 rounded-2xl border ${advancedFilters.onlyDiscounted ? 'border-rose-300 bg-rose-50/50' : 'border-gray-200 bg-white hover:bg-gray-50'} cursor-pointer transition-all">
                            <div class="flex items-center gap-3">
                                <div class="w-9 h-9 rounded-xl bg-rose-50 flex items-center justify-center text-rose-500">
                                    <i data-lucide="percent" class="w-4 h-4"></i>
                                </div>
                                <div>
                                    <div class="text-xs font-black text-gray-900">فقط تخفیف‌دارها</div>
                                    <div class="text-[10px] text-gray-500 mt-0.5">نمایش محصولات دارای تخفیف فعال</div>
                                </div>
                            </div>
                            <input type="checkbox" id="filter-only-discounted" class="hidden" ${advancedFilters.onlyDiscounted ? 'checked' : ''}>
                            <div class="toggle-switch w-11 h-6 ${advancedFilters.onlyDiscounted ? 'bg-rose-500' : 'bg-gray-300'} rounded-full p-1 transition-colors relative flex items-center shrink-0">
                                <div class="w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${advancedFilters.onlyDiscounted ? 'translate-x-0' : '-translate-x-5'}"></div>
                            </div>
                        </label>

                        <label class="filter-toggle-row flex items-center justify-between p-3.5 rounded-2xl border ${advancedFilters.onlyFreeShipping ? 'border-emerald-300 bg-emerald-50/50' : 'border-gray-200 bg-white hover:bg-gray-50'} cursor-pointer transition-all">
                            <div class="flex items-center gap-3">
                                <div class="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500">
                                    <i data-lucide="truck" class="w-4 h-4"></i>
                                </div>
                                <div>
                                    <div class="text-xs font-black text-gray-900">ارسال رایگان</div>
                                    <div class="text-[10px] text-gray-500 mt-0.5">رستوران‌ها و فروشگاه‌های با ارسال رایگان</div>
                                </div>
                            </div>
                            <input type="checkbox" id="filter-only-free-shipping" class="hidden" ${advancedFilters.onlyFreeShipping ? 'checked' : ''}>
                            <div class="toggle-switch w-11 h-6 ${advancedFilters.onlyFreeShipping ? 'bg-emerald-500' : 'bg-gray-300'} rounded-full p-1 transition-colors relative flex items-center shrink-0">
                                <div class="w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${advancedFilters.onlyFreeShipping ? 'translate-x-0' : '-translate-x-5'}"></div>
                            </div>
                        </label>
                    </div>
                </div>

                <div class="h-px bg-gray-100"></div>

                <div>
                    <label class="text-xs font-black text-gray-900 flex items-center gap-1.5 mb-3">
                        <i data-lucide="arrow-up-down" class="w-3.5 h-3.5 text-snapp"></i>
                        مرتب‌سازی نتایج
                    </label>
                    <div class="grid grid-cols-2 gap-2">
                        ${[
                            { id: 'relevance', label: 'مرتبط‌ترین', icon: 'sparkles' },
                            { id: 'price-asc', label: 'ارزان‌ترین', icon: 'arrow-down' },
                            { id: 'price-desc', label: 'گران‌ترین', icon: 'arrow-up' },
                            { id: 'rating', label: 'بیشترین امتیاز', icon: 'star' },
                            { id: 'discount', label: 'بیشترین تخفیف', icon: 'percent' },
                            { id: 'fastest', label: 'سریع‌ترین', icon: 'zap' }
                        ].map(s => `
                            <button class="filter-sort-btn flex items-center gap-2 px-3 py-2.5 rounded-xl border text-[11px] font-bold transition-all ${advancedFilters.sortBy === s.id ? 'bg-snapp-light border-snapp/30 text-snapp' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}" data-sort="${s.id}">
                                <i data-lucide="${s.icon}" class="w-3.5 h-3.5"></i>
                                ${s.label}
                            </button>
                        `).join('')}
                    </div>
                </div>
            </div>

            <div class="p-4 bg-white border-t border-gray-100 shrink-0 flex gap-2">
                <button id="filter-cancel-btn" class="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs py-3.5 rounded-2xl transition-colors active:scale-95">انصراف</button>
                <button id="filter-apply-btn" class="flex-1 bg-snapp hover:bg-snapp-hover text-white font-black text-xs py-3.5 rounded-2xl shadow-lg shadow-pink-500/30 active:scale-95 transition-all flex items-center justify-center gap-1.5">
                    <i data-lucide="check" class="w-4 h-4"></i>
                    اعمال فیلترها
                </button>
            </div>
        </div>
    `;
}

function fd_bindFiltersEvents(overlay) {
    const minSlider = overlay.querySelector('#filter-min-price');
    const maxSlider = overlay.querySelector('#filter-max-price');
    const timeSlider = overlay.querySelector('#filter-delivery-time');

    minSlider.addEventListener('input', () => {
        advancedFilters.minPrice = parseInt(minSlider.value, 10);
        if (advancedFilters.minPrice > advancedFilters.maxPrice) {
            advancedFilters.maxPrice = advancedFilters.minPrice;
            maxSlider.value = advancedFilters.maxPrice;
        }
        fd_updatePriceDisplay();
    });

    maxSlider.addEventListener('input', () => {
        advancedFilters.maxPrice = parseInt(maxSlider.value, 10);
        if (advancedFilters.maxPrice < advancedFilters.minPrice) {
            advancedFilters.minPrice = advancedFilters.maxPrice;
            minSlider.value = advancedFilters.minPrice;
        }
        fd_updatePriceDisplay();
    });

    timeSlider.addEventListener('input', () => {
        advancedFilters.maxDeliveryTime = parseInt(timeSlider.value, 10);
        fd_updateDeliveryDisplay();
    });

    overlay.querySelectorAll('.filter-rating-btn').forEach(btn => {
        btn.onclick = () => {
            advancedFilters.minRating = parseFloat(btn.dataset.rating);
            overlay.querySelectorAll('.filter-rating-btn').forEach(b => {
                const r = parseFloat(b.dataset.rating);
                if (r === advancedFilters.minRating) {
                    b.className = 'filter-rating-btn flex-1 py-2.5 rounded-xl border text-xs font-black transition-all bg-amber-50 border-amber-300 text-amber-700';
                } else {
                    b.className = 'filter-rating-btn flex-1 py-2.5 rounded-xl border text-xs font-black transition-all bg-white border-gray-200 text-gray-600 hover:bg-gray-50';
                }
            });
        };
    });

    overlay.querySelectorAll('.filter-cat-chip').forEach(chip => {
        chip.onclick = () => {
            const cat = chip.dataset.cat;
            if (advancedFilters.categories.has(cat)) {
                advancedFilters.categories.delete(cat);
                chip.className = 'filter-cat-chip px-3 py-2 rounded-xl border text-[11px] font-bold transition-all bg-white border-gray-200 text-gray-600 hover:bg-gray-50';
            } else {
                advancedFilters.categories.add(cat);
                chip.className = 'filter-cat-chip px-3 py-2 rounded-xl border text-[11px] font-bold transition-all bg-snapp text-white border-snapp shadow-sm shadow-pink-500/20';
            }
            fd_updateFilterCount();
        };
    });

    overlay.querySelectorAll('.filter-sort-btn').forEach(btn => {
        btn.onclick = () => {
            advancedFilters.sortBy = btn.dataset.sort;
            overlay.querySelectorAll('.filter-sort-btn').forEach(b => {
                if (b.dataset.sort === advancedFilters.sortBy) {
                    b.className = 'filter-sort-btn flex items-center gap-2 px-3 py-2.5 rounded-xl border text-[11px] font-bold transition-all bg-snapp-light border-snapp/30 text-snapp';
                } else {
                    b.className = 'filter-sort-btn flex items-center gap-2 px-3 py-2.5 rounded-xl border text-[11px] font-bold transition-all bg-white border-gray-200 text-gray-600 hover:bg-gray-50';
                }
            });
        };
    });

    overlay.querySelector('#filter-only-discounted').parentElement.addEventListener('click', (e) => {
        if (e.target.closest('input')) return;
        e.preventDefault();
        fd_toggleDiscountFilter(overlay);
    });

    overlay.querySelector('#filter-only-free-shipping').parentElement.addEventListener('click', (e) => {
        if (e.target.closest('input')) return;
        e.preventDefault();
        fd_toggleFreeShippingFilter(overlay);
    });

    overlay.querySelector('#filter-close-btn').onclick = fd_closeFilters;
    overlay.querySelector('#filter-cancel-btn').onclick = fd_closeFilters;
    overlay.querySelector('#filter-reset-btn').onclick = () => fd_resetFilters(overlay);
    overlay.querySelector('#filter-apply-btn').onclick = () => fd_applyFilters();
}

function fd_toggleDiscountFilter(overlay) {
    advancedFilters.onlyDiscounted = !advancedFilters.onlyDiscounted;
    const row = overlay.querySelector('#filter-only-discounted').parentElement;
    const sw = row.querySelector('.toggle-switch');
    const knob = sw.querySelector('div');
    if (advancedFilters.onlyDiscounted) {
        row.classList.add('border-rose-300', 'bg-rose-50/50');
        row.classList.remove('border-gray-200', 'bg-white', 'hover:bg-gray-50');
        sw.classList.remove('bg-gray-300');
        sw.classList.add('bg-rose-500');
        knob.classList.remove('-translate-x-5');
        knob.classList.add('translate-x-0');
    } else {
        row.classList.remove('border-rose-300', 'bg-rose-50/50');
        row.classList.add('border-gray-200', 'bg-white', 'hover:bg-gray-50');
        sw.classList.remove('bg-rose-500');
        sw.classList.add('bg-gray-300');
        knob.classList.remove('translate-x-0');
        knob.classList.add('-translate-x-5');
    }
    fd_updateFilterCount();
}

function fd_toggleFreeShippingFilter(overlay) {
    advancedFilters.onlyFreeShipping = !advancedFilters.onlyFreeShipping;
    const row = overlay.querySelector('#filter-only-free-shipping').parentElement;
    const sw = row.querySelector('.toggle-switch');
    const knob = sw.querySelector('div');
    if (advancedFilters.onlyFreeShipping) {
        row.classList.add('border-emerald-300', 'bg-emerald-50/50');
        row.classList.remove('border-gray-200', 'bg-white', 'hover:bg-gray-50');
        sw.classList.remove('bg-gray-300');
        sw.classList.add('bg-emerald-500');
        knob.classList.remove('-translate-x-5');
        knob.classList.add('translate-x-0');
    } else {
        row.classList.remove('border-emerald-300', 'bg-emerald-50/50');
        row.classList.add('border-gray-200', 'bg-white', 'hover:bg-gray-50');
        sw.classList.remove('bg-emerald-500');
        sw.classList.add('bg-gray-300');
        knob.classList.remove('translate-x-0');
        knob.classList.add('-translate-x-5');
    }
    fd_updateFilterCount();
}

function fd_updatePriceDisplay() {
    const minEl = document.getElementById('price-min-display');
    const maxEl = document.getElementById('price-max-display');
    const minLabel = document.getElementById('price-min-label');
    const maxLabel = document.getElementById('price-max-label');
    if (minEl) minEl.textContent = fd_formatPrice(advancedFilters.minPrice) + ' تومان';
    if (maxEl) maxEl.textContent = fd_formatPrice(advancedFilters.maxPrice) + ' تومان';
    if (minLabel) minLabel.textContent = fd_formatPrice(advancedFilters.minPrice);
    if (maxLabel) maxLabel.textContent = fd_formatPrice(advancedFilters.maxPrice);
    fd_updateFilterCount();
}

function fd_updateDeliveryDisplay() {
    const el = document.getElementById('delivery-time-display');
    if (el) el.textContent = fd_toPersianDigits(advancedFilters.maxDeliveryTime) + ' دقیقه';
    fd_updateFilterCount();
}

function fd_updateFilterCount() {
    const text = document.getElementById('filter-count-text');
    if (text) {
        const n = fd_countActiveFilters();
        text.textContent = n === 0 ? 'هیچ فیلتری فعال نیست' : `${fd_toPersianDigits(n)} فیلتر فعال`;
    }
    const badge = document.getElementById('filter-badge');
    if (badge) {
        const n = fd_countActiveFilters();
        if (n > 0) {
            badge.textContent = fd_toPersianDigits(n);
            badge.classList.remove('hidden');
        } else {
            badge.classList.add('hidden');
        }
    }
}

function fd_resetFilters(overlay) {
    advancedFilters = {
        minPrice: 0,
        maxPrice: 1000000,
        minRating: 0,
        maxDeliveryTime: 90,
        onlyDiscounted: false,
        onlyFreeShipping: false,
        categories: new Set(),
        sortBy: 'relevance'
    };
    fd_closeFilters();
    setTimeout(() => openAdvancedFilters(), 250);
    fd_showToast('فیلترها بازنشانی شد.', 'filter-toast');
}

function fd_applyFilters() {
    fd_closeFilters();

    const api = window.AppAPI;
    if (!api) return;

    let filtered = [...api.catalogProducts];

    filtered = filtered.filter(p => p.price >= advancedFilters.minPrice && p.price <= advancedFilters.maxPrice);

    if (advancedFilters.minRating > 0) {
        filtered = filtered.filter(p => p.rating >= advancedFilters.minRating);
    }

    if (advancedFilters.onlyDiscounted) {
        filtered = filtered.filter(p => p.discount > 0);
    }

    if (advancedFilters.categories.size > 0) {
        filtered = filtered.filter(p => advancedFilters.categories.has(p.categoryId));
    }

    if (advancedFilters.onlyFreeShipping) {
        filtered = filtered.filter(p => {
            const v = api.vendors.find(x => x.id === p.vendorId);
            return v && v.deliveryFee === 0;
        });
    }

    const s = advancedFilters.sortBy;
    if (s === 'price-asc') filtered.sort((a, b) => a.price - b.price);
    else if (s === 'price-desc') filtered.sort((a, b) => b.price - a.price);
    else if (s === 'rating') filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    else if (s === 'discount') filtered.sort((a, b) => (b.discount || 0) - (a.discount || 0));
    else if (s === 'fastest') {
        filtered.sort((a, b) => {
            const va = api.vendors.find(x => x.id === a.vendorId);
            const vb = api.vendors.find(x => x.id === b.vendorId);
            return (va?.deliveryFee || 0) - (vb?.deliveryFee || 0);
        });
    }

    fd_showFilteredResults(filtered);
    fd_showToast(`${fd_toPersianDigits(filtered.length)} نتیجه یافت شد.`, 'filter-toast');
}

function fd_showFilteredResults(list) {
    const catalog = document.getElementById('catalog-container');
    if (!catalog) return;

    document.querySelectorAll('section').forEach(s => { s.style.display = 'none'; });
    catalog.dataset.customView = 'true';

    if (list.length === 0) {
        catalog.innerHTML = `
            <div class="text-center py-16 px-4">
                <div class="w-20 h-20 mx-auto mb-4 bg-pink-50 rounded-full flex items-center justify-center text-snapp">
                    <i data-lucide="search-x" class="w-9 h-9"></i>
                </div>
                <h4 class="font-extrabold text-sm text-gray-800 mb-1">نتیجه‌ای یافت نشد!</h4>
                <p class="text-xs text-gray-500 leading-relaxed mb-5">فیلترهای دیگری را امتحان کنید یا آن‌ها را بازنشانی کنید.</p>
                <button onclick="window.AdvancedFiltersAPI.open()" class="bg-snapp hover:bg-snapp-hover text-white font-black text-xs px-6 py-3 rounded-2xl shadow-md shadow-pink-500/25 active:scale-95 transition-all">
                    ویرایش فیلترها
                </button>
            </div>
        `;
        if (window.lucide) lucide.createIcons();
        return;
    }

    catalog.innerHTML = `
        <div class="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-100 px-4 py-3 mb-3 -mx-4 -mt-3 flex items-center justify-between">
            <div class="flex items-center gap-2">
                <i data-lucide="filter" class="w-4 h-4 text-snapp"></i>
                <span class="font-black text-xs text-gray-900">${fd_toPersianDigits(list.length)} نتیجه</span>
                <span class="bg-snapp text-white text-[10px] font-black px-2 py-0.5 rounded-full">${fd_toPersianDigits(fd_countActiveFilters())} فیلتر</span>
            </div>
            <button onclick="window.AdvancedFiltersAPI.clear()" class="text-[10px] font-black text-rose-500 hover:bg-rose-50 px-2.5 py-1.5 rounded-lg transition-colors">
                پاک کردن
            </button>
        </div>
        <div class="space-y-3 pb-4">
            ${list.map(p => fd_renderFilteredProductCard(p)).join('')}
        </div>
    `;
    if (window.lucide) lucide.createIcons();
}

function fd_renderFilteredProductCard(p) {
    const api = window.AppAPI;
    const vendor = api.vendors.find(v => v.id === p.vendorId);
    const qty = api.cartState.items[p.id]?.quantity || 0;
    const hasDiscount = p.discount > 0;

    return `
        <div class="bg-white rounded-2xl border border-gray-100 p-3.5 flex gap-3.5 items-start hover:shadow-[0_4px_14px_-6px_rgba(0,0,0,0.1)] cursor-pointer transition-all" onclick="window.openProductDetail ? window.openProductDetail(${p.id}) : window.openProductModal(${p.id})">
            <div class="relative w-24 h-24 rounded-xl overflow-hidden shrink-0 bg-gray-50 border border-gray-100">
                <img src="${p.image}" class="w-full h-full object-cover">
                ${hasDiscount ? `<span class="absolute top-1.5 right-1.5 bg-gradient-to-br from-rose-500 to-pink-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md shadow-sm">٪${fd_toPersianDigits(p.discount)}</span>` : ''}
            </div>
            <div class="flex-1 min-w-0 flex flex-col justify-between min-h-[96px]">
                <div>
                    <div class="flex items-start justify-between gap-1">
                        <h4 class="font-extrabold text-xs text-gray-900 leading-snug line-clamp-2">${p.title}</h4>
                        <div class="flex items-center gap-0.5 text-[10px] font-bold text-amber-500 bg-amber-50 px-1.5 py-0.5 rounded-md shrink-0">
                            <i data-lucide="star" class="w-2.5 h-2.5 fill-amber-400 text-amber-400"></i>
                            ${fd_toPersianDigits(p.rating)}
                        </div>
                    </div>
                    ${vendor ? `<div class="text-[10px] text-gray-500 mt-1 flex items-center gap-1 truncate"><i data-lucide="store" class="w-2.5 h-2.5"></i>${vendor.name}</div>` : ''}
                </div>
                <div class="flex items-center justify-between mt-2 pt-2 border-t border-gray-50" onclick="event.stopPropagation()">
                    <div>
                        ${hasDiscount ? `<span class="text-[10px] text-gray-400 line-through block">${fd_formatPrice(p.originalPrice)}</span>` : ''}
                        <span class="text-xs font-black text-gray-900">${fd_formatPrice(p.price)} <span class="text-[9px] font-normal text-gray-500">تومان</span></span>
                    </div>
                    ${qty === 0 ? `
                        <button onclick="window.AppAPI.handleAddToCart(${p.id})" class="bg-snapp-light hover:bg-snapp hover:text-white text-snapp font-bold text-xs px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 active:scale-95 border border-snapp/20 shadow-sm">
                            <i data-lucide="plus" class="w-3.5 h-3.5"></i>افزودن
                        </button>
                    ` : `
                        <div class="flex items-center bg-snapp text-white rounded-xl shadow-sm p-0.5 gap-2">
                            <button onclick="window.AppAPI.handleAddToCart(${p.id})" class="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-white/20"><i data-lucide="plus" class="w-3.5 h-3.5"></i></button>
                            <span class="text-xs font-black min-w-4 text-center">${fd_toPersianDigits(qty)}</span>
                            <button onclick="window.AppAPI.handleDecrementCart ? window.AppAPI.handleDecrementCart(${p.id}) : null" class="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-white/20"><i data-lucide="minus" class="w-3.5 h-3.5"></i></button>
                        </div>
                    `}
                </div>
            </div>
        </div>
    `;
}

function fd_closeFilters() {
    const modal = document.getElementById('filters-advanced-modal');
    if (modal) {
        modal.classList.add('opacity-0');
        const content = document.getElementById('filters-sheet-content');
        if (content) content.classList.add('translate-y-full');
        setTimeout(() => modal.remove(), 300);
    }
}

/* ==========================================================================
 * بخش ۲ — دارک مود
 * ========================================================================== */

const DARK_STORAGE_KEY = 'loghme_dark_mode';
let darkModeState = { enabled: false };
const DARK_STYLE_ID = 'dark-mode-styles';

function dm_injectDarkStyles() {
    if (document.getElementById(DARK_STYLE_ID)) return;

    const style = document.createElement('style');
    style.id = DARK_STYLE_ID;
    style.textContent = `
        html.dark { color-scheme: dark; }
        html.dark body { background: #0a0a0e !important; color: #e5e7eb !important; }
        html.dark .max-w-md { background: #0f0f14 !important; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7) !important; }
        html.dark .bg-white, html.dark .bg-white\\/95, html.dark .bg-white\\/85 { background-color: #17171f !important; }
        html.dark .bg-gray-50, html.dark .bg-gray-100 { background-color: #1c1c26 !important; }
        html.dark .bg-gray-200 { background-color: #262633 !important; }
        html.dark .bg-emerald-50, html.dark .bg-emerald-50\\/80 { background-color: rgba(16, 185, 129, 0.1) !important; }
        html.dark .bg-rose-50, html.dark .bg-rose-50\\/30 { background-color: rgba(244, 63, 94, 0.1) !important; }
        html.dark .bg-pink-50, html.dark .bg-snapp-light { background-color: rgba(255, 0, 166, 0.1) !important; }
        html.dark .bg-amber-50, html.dark .bg-amber-50\\/30, html.dark .bg-amber-50\\/60 { background-color: rgba(245, 158, 11, 0.1) !important; }
        html.dark .bg-sky-50 { background-color: rgba(14, 165, 233, 0.1) !important; }
        html.dark .bg-purple-50, html.dark .bg-purple-50\\/60 { background-color: rgba(168, 85, 247, 0.1) !important; }
        html.dark .text-gray-900 { color: #f3f4f6 !important; }
        html.dark .text-gray-800 { color: #e5e7eb !important; }
        html.dark .text-gray-700 { color: #d1d5db !important; }
        html.dark .text-gray-600 { color: #b8bcc6 !important; }
        html.dark .text-gray-500 { color: #9ca3af !important; }
        html.dark .text-gray-400 { color: #6b7280 !important; }
        html.dark .border-gray-100 { border-color: #262633 !important; }
        html.dark .border-gray-200 { border-color: #333341 !important; }
        html.dark .border-gray-300 { border-color: #3f3f4e !important; }
        html.dark .divide-gray-50 > * + * { border-color: #262633 !important; }
        html.dark .divide-gray-100 > * + * { border-color: #262633 !important; }
        html.dark input, html.dark textarea, html.dark select { background-color: #1c1c26 !important; color: #e5e7eb !important; border-color: #333341 !important; }
        html.dark input::placeholder, html.dark textarea::placeholder { color: #6b7280 !important; }
        html.dark input:focus, html.dark textarea:focus, html.dark select:focus { background-color: #17171f !important; border-color: #FF00A6 !important; }
        html.dark .bg-gray-900 { background-color: #050508 !important; }
        html.dark .hover\\:bg-gray-50:hover, html.dark .hover\\:bg-gray-100:hover, html.dark .hover\\:bg-gray-200:hover { background-color: #262633 !important; }
        html.dark .backdrop-blur-md, html.dark .backdrop-blur-sm { background-color: rgba(15, 15, 20, 0.85) !important; }
        html.dark img { filter: brightness(0.92); }
        html.dark .leaflet-tile-pane { filter: invert(1) hue-rotate(180deg) brightness(0.9) contrast(0.9); }
        .dm-toggle-active { background: linear-gradient(135deg, #a855f7, #6366f1) !important; }
    `;
    document.head.appendChild(style);
}

function dm_apply(enabled, skipSave) {
    darkModeState.enabled = enabled;
    dm_injectDarkStyles();

    if (enabled) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');

    if (!skipSave) {
        try { localStorage.setItem(DARK_STORAGE_KEY, enabled ? '1' : '0'); } catch (e) {}
    }

    dm_updateAllToggles();
    window.dispatchEvent(new CustomEvent('darkmode-change', { detail: { enabled } }));
}

function dm_updateAllToggles() {
    document.querySelectorAll('.dm-toggle').forEach(el => {
        if (darkModeState.enabled) {
            el.classList.add('dm-toggle-active');
            el.classList.remove('bg-gray-200');
        } else {
            el.classList.remove('dm-toggle-active');
            el.classList.add('bg-gray-200');
        }
        const knob = el.querySelector('.dm-knob');
        if (knob) {
            if (darkModeState.enabled) {
                knob.classList.remove('-translate-x-5');
                knob.classList.add('translate-x-0');
            } else {
                knob.classList.remove('translate-x-0');
                knob.classList.add('-translate-x-5');
            }
        }
    });

    const headerBtn = document.getElementById('dm-header-toggle');
    if (headerBtn) {
        const moon = headerBtn.querySelector('.dm-icon-moon');
        const sun = headerBtn.querySelector('.dm-icon-sun');
        if (moon && sun) {
            if (darkModeState.enabled) {
                moon.classList.add('hidden');
                sun.classList.remove('hidden');
            } else {
                sun.classList.add('hidden');
                moon.classList.remove('hidden');
            }
        }
    }
}

export function initDarkMode() {
    let stored = null;
    try { stored = localStorage.getItem(DARK_STORAGE_KEY); } catch (e) {}

    let initial;
    if (stored === '1') initial = true;
    else if (stored === '0') initial = false;
    else initial = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

    dm_apply(initial, true);
    dm_injectHeaderToggle();
}

function dm_injectHeaderToggle() {
    if (document.getElementById('dm-header-toggle')) return;

    const headerActions = document.querySelector('header .flex.items-center.gap-1\\.5');
    if (!headerActions) {
        setTimeout(dm_injectHeaderToggle, 400);
        return;
    }

    const btn = document.createElement('button');
    btn.id = 'dm-header-toggle';
    btn.className = 'relative p-2 rounded-full hover:bg-gray-100 active:scale-95 transition-all text-gray-700';
    btn.setAttribute('aria-label', 'حالت تاریک');
    btn.innerHTML = `
        <i data-lucide="moon" class="w-5 h-5 dm-icon-moon ${darkModeState.enabled ? 'hidden' : ''}"></i>
        <i data-lucide="sun" class="w-5 h-5 dm-icon-sun ${darkModeState.enabled ? '' : 'hidden'}"></i>
    `;
    btn.onclick = () => dm_apply(!darkModeState.enabled);

    headerActions.insertBefore(btn, headerActions.firstChild);
    if (window.lucide) lucide.createIcons();
}

export function openDarkModePanel() {
    const existing = document.getElementById('dm-panel-modal');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'dm-panel-modal';
    overlay.className = 'fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4 opacity-0 transition-opacity duration-300 font-vazir';
    overlay.innerHTML = `
        <div class="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl transform scale-95 transition-transform duration-300" id="dm-panel-content">
            <div class="p-5 text-center">
                <div class="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white shadow-lg">
                    <i data-lucide="moon-star" class="w-8 h-8"></i>
                </div>
                <h3 class="font-black text-sm text-gray-900 mb-1">حالت تاریک</h3>
                <p class="text-[11px] text-gray-500 leading-relaxed mb-5">با فعال‌سازی حالت تاریک، چشمان شما در شب کمتر خسته می‌شود و مصرف باتری کاهش می‌یابد.</p>

                <div class="flex items-center justify-between p-3.5 rounded-2xl border border-gray-200 bg-gray-50 mb-4">
                    <div class="flex items-center gap-2.5">
                        <i data-lucide="${darkModeState.enabled ? 'sun' : 'moon'}" class="w-4 h-4 ${darkModeState.enabled ? 'text-amber-500' : 'text-indigo-500'}"></i>
                        <span class="text-xs font-black text-gray-800">${darkModeState.enabled ? 'روشن' : 'تاریک'}</span>
                    </div>
                    <button class="dm-toggle w-11 h-6 ${darkModeState.enabled ? 'dm-toggle-active' : 'bg-gray-200'} rounded-full p-1 transition-colors relative flex items-center">
                        <div class="dm-knob w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${darkModeState.enabled ? 'translate-x-0' : '-translate-x-5'}"></div>
                    </button>
                </div>

                <div class="text-[10px] text-gray-400 flex items-center justify-center gap-1">
                    <i data-lucide="info" class="w-3 h-3"></i>
                    تنظیمات در دستگاه شما ذخیره می‌شود
                </div>
            </div>
            <div class="p-4 bg-gray-50 border-t border-gray-100">
                <button onclick="document.getElementById('dm-panel-modal').remove()" class="w-full bg-gray-900 hover:bg-black text-white font-black text-xs py-3.5 rounded-2xl active:scale-95 transition-all">
                    بستن
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);
    if (window.lucide) lucide.createIcons();

    requestAnimationFrame(() => {
        overlay.classList.remove('opacity-0');
        document.getElementById('dm-panel-content').classList.remove('scale-95');
    });

    const toggle = overlay.querySelector('.dm-toggle');
    toggle.onclick = () => {
        dm_apply(!darkModeState.enabled);
        const txt = overlay.querySelector('span.text-xs.font-black');
        const iconBox = overlay.querySelector('i');
        if (darkModeState.enabled) {
            txt.textContent = 'روشن';
            iconBox.setAttribute('data-lucide', 'sun');
            iconBox.className = 'w-4 h-4 text-amber-500';
        } else {
            txt.textContent = 'تاریک';
            iconBox.setAttribute('data-lucide', 'moon');
            iconBox.className = 'w-4 h-4 text-indigo-500';
        }
        if (window.lucide) lucide.createIcons();
    };
}

/* ==========================================================================
 * بخش ۳ — آنبوردینگ
 * ========================================================================== */

const ONBOARDING_KEY = 'loghme_onboarding_done';

const ONBOARDING_SLIDES = [
    { icon: 'sparkles', bg: 'from-pink-500 via-rose-500 to-snapp', title: 'به لقمه خوش آمدید', subtitle: 'سوپراپلیکیشن سفارش غذا، سوپرمارکت و شیرینی', body: 'سفارش از بهترین رستوران‌ها و فروشگاه‌های شهر، فقط با چند کلیک ساده', illustration: '🍔' },
    { icon: 'rocket', bg: 'from-amber-500 via-orange-500 to-rose-500', title: 'ارسال فوق سریع', subtitle: 'تحویل کمتر از ۳۰ دقیقه', body: 'با ناوگان اختصاصی پیک، سفارش شما همیشه گرم و تازه به دستتان می‌رسد', illustration: '🛵' },
    { icon: 'crown', bg: 'from-purple-700 via-indigo-700 to-indigo-900', title: 'لقمه پرو', subtitle: 'ارسال رایگان برای همه سفارش‌ها', body: 'عضو باشگاه ویژه شوید و از تخفیف‌های انحصاری، ارسال رایگان و پشتیبانی VIP لذت ببرید', illustration: '👑' },
    { icon: 'map-pin', bg: 'from-emerald-500 via-teal-500 to-cyan-600', title: 'شهر خود را انتخاب کنید', subtitle: 'برای مشاهده رستوران‌های اطراف شما', body: 'مکان تحویل خود را مشخص کنید تا بهترین پیشنهادات را ببینید', illustration: '📍', isCityPicker: true }
];

const OB_CITIES = [
    { id: 'tehran', name: 'تهران', icon: 'building-2', hint: 'پایتخت' },
    { id: 'mashhad', name: 'مشهد', icon: 'moon', hint: 'خراسان رضوی' },
    { id: 'isfahan', name: 'اصفهان', icon: 'sun', hint: 'نصف جهان' },
    { id: 'shiraz', name: 'شیراز', icon: 'flower-2', hint: 'فارس' },
    { id: 'tabriz', name: 'تبریز', icon: 'mountain', hint: 'آذربایجان شرقی' },
    { id: 'karaj', name: 'کرج', icon: 'building', hint: 'البرز' },
    { id: 'qom', name: 'قم', icon: 'landmark', hint: 'قم' },
    { id: 'ahvaz', name: 'اهواز', icon: 'thermometer-sun', hint: 'خوزستان' }
];

let ob_currentSlide = 0;
let ob_selectedCity = null;

export function shouldShowOnboarding() {
    try { return localStorage.getItem(ONBOARDING_KEY) !== '1'; }
    catch (e) { return true; }
}

function ob_markDone(cityId) {
    try {
        localStorage.setItem(ONBOARDING_KEY, '1');
        if (cityId) localStorage.setItem('loghme_city', cityId);
    } catch (e) {}
}

export function openOnboarding() {
    if (document.getElementById('onboarding-overlay')) return;

    ob_currentSlide = 0;
    ob_selectedCity = null;

    document.body.style.overflow = 'hidden';

    const overlay = document.createElement('div');
    overlay.id = 'onboarding-overlay';
    overlay.className = 'fixed inset-0 z-[200] bg-white overflow-hidden font-vazir';
    overlay.style.opacity = '0';
    overlay.style.transition = 'opacity 0.35s ease';

    overlay.innerHTML = ob_renderShell();
    document.body.appendChild(overlay);

    if (window.lucide) lucide.createIcons();

    requestAnimationFrame(() => { overlay.style.opacity = '1'; });

    ob_renderSlide(0);
    ob_bindEvents(overlay);
}

function ob_renderShell() {
    return `
        <div class="w-full h-full relative flex flex-col max-w-md mx-auto bg-white">
            <button id="ob-skip-btn" class="absolute top-5 left-5 z-30 text-xs font-bold text-gray-500 bg-white/80 backdrop-blur-md px-3.5 py-2 rounded-full hover:bg-white active:scale-95 transition-all shadow-sm border border-gray-100">
                رد کردن
            </button>

            <div id="ob-slide-bg" class="absolute inset-0 bg-gradient-to-br from-pink-500 via-rose-500 to-snapp transition-all duration-500"></div>

            <div class="relative z-10 flex-1 flex flex-col items-center justify-center px-8 text-center text-white">
                <div id="ob-illustration" class="text-7xl mb-8 transition-all duration-500"></div>

                <div id="ob-icon-badge" class="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-5 border border-white/30 shadow-lg transition-all duration-300">
                    <i data-lucide="sparkles" class="w-7 h-7"></i>
                </div>

                <h1 id="ob-title" class="font-black text-2xl mb-2 leading-tight drop-shadow-md transition-all duration-300"></h1>
                <p id="ob-subtitle" class="text-sm font-bold text-white/90 mb-4 transition-all duration-300"></p>
                <p id="ob-body" class="text-xs text-white/80 leading-relaxed max-w-xs transition-all duration-300"></p>

                <div id="ob-city-picker" class="hidden mt-6 w-full max-w-xs">
                    <div class="text-[11px] font-black text-white mb-3 text-center">شهر خود را انتخاب کنید</div>
                    <div class="grid grid-cols-2 gap-2">
                        ${OB_CITIES.map(c => `
                            <button class="ob-city-btn flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/15 backdrop-blur-md border border-white/20 hover:bg-white/25 active:scale-95 transition-all text-right" data-city="${c.id}">
                                <div class="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                                    <i data-lucide="${c.icon}" class="w-4 h-4"></i>
                                </div>
                                <div class="min-w-0 flex-1">
                                    <div class="text-[11px] font-black text-white truncate">${c.name}</div>
                                    <div class="text-[9px] text-white/70 truncate">${c.hint}</div>
                                </div>
                            </button>
                        `).join('')}
                    </div>
                </div>
            </div>

            <div class="relative z-10 p-6 pb-8 bg-gradient-to-t from-black/20 to-transparent">
                <div class="flex items-center justify-center gap-2 mb-6" id="ob-dots">
                    ${ONBOARDING_SLIDES.map((_, i) => `
                        <div class="ob-dot h-1.5 rounded-full transition-all duration-300 ${i === 0 ? 'w-6 bg-white' : 'w-1.5 bg-white/40'}"></div>
                    `).join('')}
                </div>

                <div class="flex items-center gap-3">
                    <button id="ob-back-btn" class="hidden w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white active:scale-95 transition-all">
                        <i data-lucide="arrow-right" class="w-5 h-5"></i>
                    </button>
                    <button id="ob-next-btn" class="flex-1 bg-white text-gray-900 font-black text-sm py-4 rounded-2xl shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2">
                        <span id="ob-next-label">بعدی</span>
                        <i data-lucide="arrow-left" class="w-4 h-4"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
}

function ob_renderSlide(index) {
    const slide = ONBOARDING_SLIDES[index];
    if (!slide) return;

    const bg = document.getElementById('ob-slide-bg');
    const ill = document.getElementById('ob-illustration');
    const title = document.getElementById('ob-title');
    const subtitle = document.getElementById('ob-subtitle');
    const body = document.getElementById('ob-body');
    const badge = document.getElementById('ob-icon-badge');
    const cityPicker = document.getElementById('ob-city-picker');
    const backBtn = document.getElementById('ob-back-btn');
    const nextLabel = document.getElementById('ob-next-label');
    const skipBtn = document.getElementById('ob-skip-btn');

    bg.className = `absolute inset-0 bg-gradient-to-br ${slide.bg} transition-all duration-500`;

    ill.style.opacity = '0';
    ill.style.transform = 'translateY(20px) scale(0.9)';
    setTimeout(() => {
        ill.textContent = slide.illustration;
        ill.style.opacity = '1';
        ill.style.transform = 'translateY(0) scale(1)';
    }, 120);

    badge.style.transform = 'scale(0.8) rotate(-10deg)';
    setTimeout(() => { badge.style.transform = 'scale(1) rotate(0)'; }, 150);

    title.style.opacity = '0';
    subtitle.style.opacity = '0';
    body.style.opacity = '0';

    setTimeout(() => {
        title.textContent = slide.title;
        subtitle.textContent = slide.subtitle;
        body.textContent = slide.body;
        title.style.opacity = '1';
        subtitle.style.opacity = '1';
        body.style.opacity = '1';
    }, 100);

    badge.innerHTML = `<i data-lucide="${slide.icon}" class="w-7 h-7"></i>`;

    if (slide.isCityPicker) cityPicker.classList.remove('hidden');
    else cityPicker.classList.add('hidden');

    if (index === 0) backBtn.classList.add('hidden');
    else backBtn.classList.remove('hidden');

    if (index === ONBOARDING_SLIDES.length - 1) {
        nextLabel.textContent = 'شروع خرید';
        skipBtn.classList.add('hidden');
    } else {
        nextLabel.textContent = 'بعدی';
        skipBtn.classList.remove('hidden');
    }

    document.querySelectorAll('.ob-dot').forEach((dot, i) => {
        dot.className = `ob-dot h-1.5 rounded-full transition-all duration-300 ${i === index ? 'w-6 bg-white' : 'w-1.5 bg-white/40'}`;
    });

    if (window.lucide) lucide.createIcons();
}

function ob_bindEvents(overlay) {
    overlay.querySelector('#ob-skip-btn').onclick = () => ob_finish();
    overlay.querySelector('#ob-back-btn').onclick = () => {
        if (ob_currentSlide > 0) {
            ob_currentSlide--;
            ob_renderSlide(ob_currentSlide);
        }
    };
    overlay.querySelector('#ob-next-btn').onclick = () => {
        const slide = ONBOARDING_SLIDES[ob_currentSlide];
        if (slide.isCityPicker && !ob_selectedCity) {
            fd_showToast('لطفاً شهر خود را انتخاب کنید.', 'ob-toast', 210);
            return;
        }
        if (ob_currentSlide < ONBOARDING_SLIDES.length - 1) {
            ob_currentSlide++;
            ob_renderSlide(ob_currentSlide);
        } else {
            ob_finish(ob_selectedCity);
        }
    };

    overlay.querySelectorAll('.ob-city-btn').forEach(btn => {
        btn.onclick = () => {
            ob_selectedCity = btn.dataset.city;
            overlay.querySelectorAll('.ob-city-btn').forEach(b => {
                b.className = 'ob-city-btn flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/15 backdrop-blur-md border border-white/20 hover:bg-white/25 active:scale-95 transition-all text-right';
            });
            btn.className = 'ob-city-btn flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white text-gray-900 border-2 border-white shadow-lg active:scale-95 transition-all text-right';
            const cityName = OB_CITIES.find(c => c.id === ob_selectedCity)?.name || '';
            fd_showToast(`شهر ${cityName} انتخاب شد.`, 'ob-toast', 210);
        };
    });

    let tStartX = 0, tStartY = 0;
    overlay.addEventListener('touchstart', (e) => {
        tStartX = e.touches[0].clientX;
        tStartY = e.touches[0].clientY;
    }, { passive: true });
    overlay.addEventListener('touchend', (e) => {
        const dx = e.changedTouches[0].clientX - tStartX;
        const dy = e.changedTouches[0].clientY - tStartY;
        if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) {
            if (dx < 0 && ob_currentSlide < ONBOARDING_SLIDES.length - 1) {
                ob_currentSlide++;
                ob_renderSlide(ob_currentSlide);
            } else if (dx > 0 && ob_currentSlide > 0) {
                ob_currentSlide--;
                ob_renderSlide(ob_currentSlide);
            }
        }
    }, { passive: true });
}

function ob_finish(cityId) {
    ob_markDone(cityId);
    const overlay = document.getElementById('onboarding-overlay');
    if (overlay) {
        overlay.style.opacity = '0';
        setTimeout(() => {
            overlay.remove();
            document.body.style.overflow = '';
        }, 350);
    }
    if (cityId) {
        setTimeout(() => fd_showToast(`خوش آمدید به لقمه ${OB_CITIES.find(c => c.id === cityId)?.name}`, 'ob-toast', 210), 400);
    }
}

/* ==========================================================================
 * Helper مشترک — toast
 * ========================================================================== */

function fd_showToast(msg, idSuffix, zIndex) {
    const id = idSuffix || 'fd-toast';
    const existing = document.getElementById(id);
    if (existing) existing.remove();
    const t = document.createElement('div');
    t.id = id;
    t.className = 'fixed top-4 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-5 py-3 rounded-xl text-xs font-bold shadow-2xl transition-all duration-300 transform -translate-y-10 opacity-0 flex items-center gap-2 w-max max-w-[90vw] font-vazir';
    t.style.zIndex = String(zIndex || 10010);
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

/* ==========================================================================
 * Expose Global APIs
 * ========================================================================== */

window.AdvancedFiltersAPI = {
    open: openAdvancedFilters,
    close: fd_closeFilters,
    clear: function() {
        advancedFilters = {
            minPrice: 0, maxPrice: 1000000, minRating: 0, maxDeliveryTime: 90,
            onlyDiscounted: false, onlyFreeShipping: false,
            categories: new Set(), sortBy: 'relevance'
        };
        const catalog = document.getElementById('catalog-container');
        if (catalog) catalog.dataset.customView = '';
        const homeTab = document.querySelector('.nav-tab[onclick*="home"]');
        if (homeTab) homeTab.click();
        fd_showToast('فیلترها پاک شدند.', 'filter-toast');
    },
    getActiveCount: fd_countActiveFilters
};

window.DarkModeAPI = {
    init: initDarkMode,
    toggle: function() { dm_apply(!darkModeState.enabled); },
    enable: function() { dm_apply(true); },
    disable: function() { dm_apply(false); },
    isEnabled: function() { return darkModeState.enabled; },
    openPanel: openDarkModePanel
};

window.OnboardingAPI = {
    open: openOnboarding,
    reset: function() {
        try { localStorage.removeItem(ONBOARDING_KEY); } catch (e) {}
        openOnboarding();
    },
    shouldShow: shouldShowOnboarding
};

window.openAdvancedFilters = openAdvancedFilters;
window.openOnboarding = openOnboarding;
window.initDarkMode = initDarkMode;