// search-global.js

let searchState = {
    query: '',
    activeTab: 'all',
    debounceTimer: null,
    recentSearches: ['برگر', 'پیتزا', 'چلو کباب', 'دوغ آبعلی'],
    trendingSearches: ['پیتزا ناپلی', 'شیشلیک', 'باقلوا', 'قهوه کلد برو', 'آش رشته', 'برگر ترافل']
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

function normalize(s) {
    return (s || '').toString().trim().toLowerCase();
}

function searchProducts(q) {
    const api = window.AppAPI;
    if (!api || !q) return [];
    const nq = normalize(q);
    return api.catalogProducts.filter(p =>
        normalize(p.title).includes(nq) ||
        normalize(p.desc).includes(nq)
    ).slice(0, 20);
}

function searchVendors(q) {
    const api = window.AppAPI;
    if (!api || !q) return [];
    const nq = normalize(q);
    return api.vendors.filter(v =>
        normalize(v.name).includes(nq) ||
        normalize(v.type).includes(nq)
    ).slice(0, 10);
}

function searchCategories(q) {
    const api = window.AppAPI;
    if (!api || !q) return [];
    const nq = normalize(q);
    const all = [];
    api.vendors.forEach(v => {
        v.categories.forEach(c => {
            if (c.id !== 'all' && (normalize(c.title).includes(nq) || nq.includes(normalize(c.title)))) {
                if (!all.find(x => x.id === c.id)) all.push({ id: c.id, title: c.title });
            }
        });
    });
    return all.slice(0, 6);
}

function getSuggestions(q) {
    const nq = normalize(q);
    if (!nq) return [];
    const api = window.AppAPI;
    if (!api) return [];
    const titles = api.catalogProducts.map(p => p.title);
    const vendors = api.vendors.map(v => v.name);
    const all = [...titles, ...vendors];
    return all.filter(t => normalize(t).includes(nq) && normalize(t) !== nq).slice(0, 5);
}

export function openGlobalSearch() {
    const existing = document.getElementById('global-search-view');
    if (existing) return;

    document.body.style.overflow = 'hidden';

    const view = document.createElement('div');
    view.id = 'global-search-view';
    view.className = 'fixed inset-0 z-[75] bg-white overflow-y-auto font-vazir';
    view.style.opacity = '0';
    view.style.transition = 'opacity 0.22s ease';

    view.innerHTML = renderSearchShell();
    document.body.appendChild(view);

    if (window.lucide) lucide.createIcons();

    requestAnimationFrame(() => { view.style.opacity = '1'; });

    bindSearchEvents(view);

    const input = document.getElementById('gs-input');
    if (input) setTimeout(() => input.focus(), 250);

    renderEmptyState();
}

function renderSearchShell() {
    return `
        <div class="max-w-md mx-auto bg-white min-h-screen relative pb-24">

            <div class="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 px-4 pt-3 pb-3">
                <div class="flex items-center gap-2">
                    <button id="gs-close-btn" class="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 hover:bg-gray-200 active:scale-95 transition-all shrink-0">
                        <i data-lucide="arrow-right" class="w-4 h-4"></i>
                    </button>
                    <div class="relative flex-1">
                        <input id="gs-input" type="text" placeholder="جستجو در محصولات، رستوران‌ها و..."
                            class="w-full bg-gray-50 text-xs font-medium text-gray-800 placeholder-gray-400 pr-10 pl-9 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:border-snapp focus:bg-white focus:ring-2 focus:ring-snapp/10 transition-all">
                        <i data-lucide="search" class="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2"></i>
                        <button id="gs-clear-btn" class="hidden absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                            <i data-lucide="x" class="w-3.5 h-3.5"></i>
                        </button>
                    </div>
                </div>

                <div id="gs-tabs" class="hidden flex items-center gap-2 mt-3 overflow-x-auto no-scrollbar">
                    <button data-tab="all" class="gs-tab px-3.5 py-1.5 rounded-full text-xs font-black shrink-0 bg-snapp text-white transition-all">همه</button>
                    <button data-tab="products" class="gs-tab px-3.5 py-1.5 rounded-full text-xs font-bold shrink-0 bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all">محصولات</button>
                    <button data-tab="vendors" class="gs-tab px-3.5 py-1.5 rounded-full text-xs font-bold shrink-0 bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all">رستوران‌ها</button>
                    <button data-tab="categories" class="gs-tab px-3.5 py-1.5 rounded-full text-xs font-bold shrink-0 bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all">دسته‌بندی‌ها</button>
                </div>
            </div>

            <div id="gs-body"></div>
        </div>
    `;
}

function renderEmptyState() {
    const body = document.getElementById('gs-body');
    if (!body) return;

    body.innerHTML = `
        <div class="px-4 py-5 space-y-6">

            <div>
                <div class="flex items-center justify-between mb-3">
                    <h3 class="font-black text-xs text-gray-900 flex items-center gap-1.5">
                        <i data-lucide="clock" class="w-3.5 h-3.5 text-snapp"></i>
                        جستجوهای اخیر
                    </h3>
                    <button id="gs-clear-history" class="text-[10px] font-bold text-gray-400 hover:text-rose-500 transition-colors">پاک کردن همه</button>
                </div>
                <div class="flex flex-wrap gap-2" id="gs-recent-list">
                    ${searchState.recentSearches.map(t => `
                        <button class="gs-recent-chip bg-gray-50 border border-gray-200 hover:border-snapp hover:bg-snapp-light/30 text-gray-700 text-xs font-bold px-3 py-2 rounded-xl transition-all active:scale-95 flex items-center gap-1.5" data-q="${escapeHtml(t)}">
                            <i data-lucide="history" class="w-3 h-3 text-gray-400"></i>
                            ${escapeHtml(t)}
                        </button>
                    `).join('')}
                </div>
            </div>

            <div>
                <h3 class="font-black text-xs text-gray-900 flex items-center gap-1.5 mb-3">
                    <i data-lucide="trending-up" class="w-3.5 h-3.5 text-snapp"></i>
                    جستجوهای پرطرفدار
                </h3>
                <div class="flex flex-wrap gap-2">
                    ${searchState.trendingSearches.map((t, i) => `
                        <button class="gs-recent-chip bg-gradient-to-br from-pink-50 to-snapp-light border border-snapp/10 hover:border-snapp/30 text-gray-800 text-xs font-bold px-3 py-2 rounded-xl transition-all active:scale-95 flex items-center gap-1.5" data-q="${escapeHtml(t)}">
                            <span class="w-4 h-4 rounded-full bg-snapp text-white text-[9px] font-black flex items-center justify-center">${toPersianDigits(i + 1)}</span>
                            ${escapeHtml(t)}
                        </button>
                    `).join('')}
                </div>
            </div>

            <div>
                <h3 class="font-black text-xs text-gray-900 flex items-center gap-1.5 mb-3">
                    <i data-lucide="layout-grid" class="w-3.5 h-3.5 text-snapp"></i>
                    دسته‌بندی‌های محبوب
                </h3>
                <div class="grid grid-cols-4 gap-2.5">
                    ${getPopularCategories().map(c => `
                        <button onclick="window.SearchAPI.filterByCategory('${c.id}')" class="flex flex-col items-center gap-1.5 p-2.5 rounded-2xl bg-gray-50 border border-gray-100 hover:border-snapp/30 hover:bg-snapp-light/20 active:scale-95 transition-all">
                            <div class="w-10 h-10 rounded-xl ${c.color} flex items-center justify-center shadow-sm">
                                <i data-lucide="${c.icon}" class="w-5 h-5"></i>
                            </div>
                            <span class="text-[10px] font-extrabold text-gray-700">${c.title}</span>
                        </button>
                    `).join('')}
                </div>
            </div>

        </div>
    `;

    if (window.lucide) lucide.createIcons();
}

function getPopularCategories() {
    return [
        { id: 'burgers', title: 'برگر', icon: 'sandwich', color: 'bg-rose-50 text-rose-600' },
        { id: 'pizza', title: 'پیتزا', icon: 'pizza', color: 'bg-amber-50 text-amber-600' },
        { id: 'kebab', title: 'کباب', icon: 'beef', color: 'bg-red-50 text-red-600' },
        { id: 'sandwich', title: 'ساندویچ', icon: 'sandwich', color: 'bg-orange-50 text-orange-600' },
        { id: 'sweets', title: 'شیرینی', icon: 'cake-slice', color: 'bg-pink-50 text-snapp' },
        { id: 'drinks', title: 'نوشیدنی', icon: 'cup-soda', color: 'bg-purple-50 text-purple-600' },
        { id: 'ash', title: 'آش', icon: 'soup', color: 'bg-emerald-50 text-emerald-600' },
        { id: 'traditional', title: 'سنتی', icon: 'utensils', color: 'bg-yellow-50 text-yellow-700' }
    ];
}

function renderSuggestions(q) {
    const sugg = getSuggestions(q);
    if (sugg.length === 0) { renderEmptyState(); return; }

    const body = document.getElementById('gs-body');
    body.innerHTML = `
        <div class="px-4 py-3">
            <div class="text-[10px] font-bold text-gray-400 mb-2 uppercase tracking-wide">پیشنهادها</div>
            <div class="space-y-1">
                ${sugg.map(s => `
                    <button class="gs-recent-chip w-full text-right flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-gray-50 active:bg-gray-100 transition-colors" data-q="${escapeHtml(s)}">
                        <i data-lucide="search" class="w-4 h-4 text-gray-400 shrink-0"></i>
                        <span class="text-xs font-bold text-gray-800 flex-1 truncate">${escapeHtml(s)}</span>
                        <i data-lucide="arrow-up-left" class="w-3.5 h-3.5 text-gray-300 shrink-0"></i>
                    </button>
                `).join('')}
            </div>
        </div>
    `;
    if (window.lucide) lucide.createIcons();
}

function renderResults(q, tab) {
    const products = searchProducts(q);
    const vendors = searchVendors(q);
    const categories = searchCategories(q);

    const totalCount = products.length + vendors.length + categories.length;
    const tabsEl = document.getElementById('gs-tabs');
    if (tabsEl) tabsEl.classList.remove('hidden');

    updateTabCounts(products.length, vendors.length, categories.length);

    const body = document.getElementById('gs-body');

    if (totalCount === 0) {
        body.innerHTML = `
            <div class="px-4 py-16 text-center">
                <div class="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
                    <i data-lucide="search-x" class="w-9 h-9"></i>
                </div>
                <h3 class="font-black text-sm text-gray-900 mb-1">نتیجه‌ای پیدا نشد!</h3>
                <p class="text-xs text-gray-500 leading-relaxed">برای «${escapeHtml(q)}» چیزی پیدا نکردیم.<br>املای کلمه را بررسی کنید یا عبارت دیگری امتحان کنید.</p>
            </div>
        `;
        if (window.lucide) lucide.createIcons();
        return;
    }

    let html = `<div class="px-4 py-4 space-y-6">`;

    if ((tab === 'all' || tab === 'categories') && categories.length > 0) {
        html += `
            <div>
                <div class="flex items-center justify-between mb-3">
                    <h3 class="font-black text-xs text-gray-900 flex items-center gap-1.5">
                        <i data-lucide="layout-grid" class="w-3.5 h-3.5 text-snapp"></i>
                        دسته‌بندی‌ها
                        <span class="text-[10px] text-gray-400 font-bold">(${toPersianDigits(categories.length)})</span>
                    </h3>
                </div>
                <div class="flex flex-wrap gap-2">
                    ${categories.map(c => `
                        <button onclick="window.SearchAPI.filterByCategory('${c.id}')" class="bg-white border border-gray-200 hover:border-snapp hover:bg-snapp-light/30 text-gray-700 text-xs font-bold px-3.5 py-2 rounded-xl transition-all active:scale-95 flex items-center gap-1.5">
                            <i data-lucide="hash" class="w-3 h-3 text-snapp"></i>
                            ${escapeHtml(c.title)}
                        </button>
                    `).join('')}
                </div>
            </div>
        `;
    }

    if ((tab === 'all' || tab === 'vendors') && vendors.length > 0) {
        html += `
            <div>
                <div class="flex items-center justify-between mb-3">
                    <h3 class="font-black text-xs text-gray-900 flex items-center gap-1.5">
                        <i data-lucide="store" class="w-3.5 h-3.5 text-snapp"></i>
                        رستوران‌ها
                        <span class="text-[10px] text-gray-400 font-bold">(${toPersianDigits(vendors.length)})</span>
                    </h3>
                </div>
                <div class="space-y-2.5">
                    ${vendors.map(v => `
                        <div onclick="window.SearchAPI.goToVendor('${v.id}')" class="bg-white rounded-2xl border border-gray-100 p-3 flex items-center gap-3 hover:shadow-[0_4px_14px_-6px_rgba(0,0,0,0.1)] cursor-pointer active:scale-[0.98] transition-all">
                            <img src="${v.logo}" class="w-12 h-12 rounded-xl object-cover border border-gray-100">
                            <div class="flex-1 min-w-0">
                                <div class="font-black text-xs text-gray-900 truncate">${escapeHtml(v.name)}</div>
                                <div class="text-[10px] text-gray-500 truncate mt-0.5">${escapeHtml(v.type)}</div>
                                <div class="flex items-center gap-2 mt-1.5 text-[10px] text-gray-500 font-bold">
                                    <span class="flex items-center gap-0.5">
                                        <i data-lucide="star" class="w-3 h-3 fill-amber-400 text-amber-400"></i>
                                        ${toPersianDigits(v.rating)}
                                    </span>
                                    <span class="w-1 h-1 bg-gray-300 rounded-full"></span>
                                    <span class="flex items-center gap-0.5"><i data-lucide="clock" class="w-3 h-3"></i>${v.deliveryTime}</span>
                                </div>
                            </div>
                            <i data-lucide="chevron-left" class="w-4 h-4 text-gray-300 shrink-0"></i>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    if ((tab === 'all' || tab === 'products') && products.length > 0) {
        html += `
            <div>
                <div class="flex items-center justify-between mb-3">
                    <h3 class="font-black text-xs text-gray-900 flex items-center gap-1.5">
                        <i data-lucide="package" class="w-3.5 h-3.5 text-snapp"></i>
                        محصولات
                        <span class="text-[10px] text-gray-400 font-bold">(${toPersianDigits(products.length)})</span>
                    </h3>
                </div>
                <div class="space-y-3">
                    ${products.map(p => renderProductRow(p, q)).join('')}
                </div>
            </div>
        `;
    }

    html += `</div>`;
    body.innerHTML = html;
    if (window.lucide) lucide.createIcons();
}

function renderProductRow(p, q) {
    const api = window.AppAPI;
    const vendor = api.vendors.find(v => v.id === p.vendorId);
    const hl = highlightMatch(p.title, q);

    return `
        <div onclick="window.SearchAPI.goToProduct(${p.id})" class="bg-white rounded-2xl border border-gray-100 p-3 flex gap-3 hover:shadow-[0_4px_14px_-6px_rgba(0,0,0,0.1)] cursor-pointer active:scale-[0.98] transition-all">
            <div class="relative w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-gray-50 border border-gray-100">
                <img src="${p.image}" class="w-full h-full object-cover">
                ${p.discount > 0 ? `<span class="absolute top-1 right-1 bg-rose-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md">٪${toPersianDigits(p.discount)}</span>` : ''}
            </div>
            <div class="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                <div>
                    <h4 class="font-extrabold text-xs text-gray-900 leading-snug line-clamp-2">${hl}</h4>
                    ${vendor ? `<div class="text-[10px] text-gray-500 mt-0.5 truncate flex items-center gap-1"><i data-lucide="store" class="w-2.5 h-2.5"></i>${escapeHtml(vendor.name)}</div>` : ''}
                </div>
                <div class="flex items-center justify-between mt-2">
                    <div>
                        ${p.discount > 0 ? `<span class="text-[10px] text-gray-400 line-through block">${formatPrice(p.originalPrice)}</span>` : ''}
                        <span class="text-xs font-black text-gray-900">${formatPrice(p.price)} <span class="text-[9px] font-normal text-gray-500">تومان</span></span>
                    </div>
                    <button onclick="event.stopPropagation(); window.SearchAPI.addToCart(${p.id})" class="bg-snapp-light hover:bg-snapp hover:text-white text-snapp text-[10px] font-black px-2.5 py-1.5 rounded-lg border border-snapp/20 active:scale-95 transition-all flex items-center gap-1">
                        <i data-lucide="plus" class="w-3 h-3"></i>
                        افزودن
                    </button>
                </div>
            </div>
        </div>
    `;
}

function highlightMatch(text, q) {
    if (!q) return escapeHtml(text);
    const safeText = escapeHtml(text);
    const safeQ = escapeHtml(q);
    try {
        const escaped = safeQ.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        return safeText.replace(new RegExp(`(${escaped})`, 'gi'), '<mark class="bg-amber-200 text-gray-900 rounded px-0.5">$1</mark>');
    } catch (e) {
        return safeText;
    }
}

function updateTabCounts(pCount, vCount, cCount) {
    const tabs = document.querySelectorAll('.gs-tab');
    tabs.forEach(tab => {
        const t = tab.dataset.tab;
        const baseText = { all: 'همه', products: 'محصولات', vendors: 'رستوران‌ها', categories: 'دسته‌بندی‌ها' }[t];
        const count = t === 'all' ? (pCount + vCount + cCount) : (t === 'products' ? pCount : t === 'vendors' ? vCount : cCount);
        tab.textContent = `${baseText} (${toPersianDigits(count)})`;
    });
}

function bindSearchEvents(view) {
    const input = view.querySelector('#gs-input');
    const clearBtn = view.querySelector('#gs-clear-btn');

    view.querySelector('#gs-close-btn').onclick = () => closeGlobalSearch();

    input.addEventListener('input', (e) => {
        const val = e.target.value;
        searchState.query = val;

        if (val.trim().length > 0) {
            clearBtn.classList.remove('hidden');
        } else {
            clearBtn.classList.add('hidden');
            const tabsEl = document.getElementById('gs-tabs');
            if (tabsEl) tabsEl.classList.add('hidden');
        }

        clearTimeout(searchState.debounceTimer);
        searchState.debounceTimer = setTimeout(() => {
            const q = val.trim();
            if (!q) { renderEmptyState(); return; }
            if (q.length < 2) { renderSuggestions(q); return; }
            renderResults(q, searchState.activeTab);
        }, 220);
    });

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const q = input.value.trim();
            if (q) {
                addToRecent(q);
                renderResults(q, searchState.activeTab);
            }
        }
    });

    clearBtn.onclick = () => {
        input.value = '';
        searchState.query = '';
        clearBtn.classList.add('hidden');
        const tabsEl = document.getElementById('gs-tabs');
        if (tabsEl) tabsEl.classList.add('hidden');
        renderEmptyState();
        input.focus();
    };

    document.querySelectorAll('.gs-tab').forEach(tab => {
        tab.onclick = () => {
            searchState.activeTab = tab.dataset.tab;
            document.querySelectorAll('.gs-tab').forEach(t => {
                t.className = 'gs-tab px-3.5 py-1.5 rounded-full text-xs font-bold shrink-0 bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all';
            });
            tab.className = 'gs-tab px-3.5 py-1.5 rounded-full text-xs font-black shrink-0 bg-snapp text-white transition-all';
            if (searchState.query) renderResults(searchState.query, searchState.activeTab);
        };
    });

    view.addEventListener('click', (e) => {
        const chip = e.target.closest('.gs-recent-chip');
        if (chip) {
            const q = chip.dataset.q;
            input.value = q;
            searchState.query = q;
            clearBtn.classList.remove('hidden');
            addToRecent(q);
            renderResults(q, searchState.activeTab);
        }
        if (e.target.closest('#gs-clear-history')) {
            searchState.recentSearches = [];
            renderEmptyState();
        }
    });
}

function addToRecent(q) {
    searchState.recentSearches = [q, ...searchState.recentSearches.filter(x => x !== q)].slice(0, 8);
}

function closeGlobalSearch() {
    const view = document.getElementById('global-search-view');
    if (view) {
        view.style.opacity = '0';
        setTimeout(() => {
            view.remove();
            document.body.style.overflow = '';
        }, 220);
    }
}

window.SearchAPI = {
    goToProduct: function(productId) {
        closeGlobalSearch();
        setTimeout(() => {
            if (typeof window.openProductDetail === 'function') {
                window.openProductDetail(productId);
            } else if (typeof window.openProductModal === 'function') {
                window.openProductModal(productId);
            }
        }, 240);
    },

    goToVendor: function(vendorId) {
        closeGlobalSearch();
        setTimeout(() => {
            if (window.AppAPI && window.AppAPI.selectVendor) {
                window.AppAPI.selectVendor(vendorId);
            }
        }, 240);
    },

    filterByCategory: function(catId) {
        closeGlobalSearch();
        setTimeout(() => {
            if (typeof window.selectCategoryFromGrid === 'function') {
                window.selectCategoryFromGrid(catId);
            }
        }, 240);
    },

    addToCart: function(productId) {
        if (window.AppAPI && window.AppAPI.handleAddToCart) {
            window.AppAPI.handleAddToCart(productId);
            showSearchToast('محصول به سبد خرید افزوده شد.');
        }
    },

    close: function() { closeGlobalSearch(); }
};

function showSearchToast(msg) {
    const existing = document.getElementById('gs-toast');
    if (existing) existing.remove();

    const t = document.createElement('div');
    t.id = 'gs-toast';
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

window.openGlobalSearch = openGlobalSearch;