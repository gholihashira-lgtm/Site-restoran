const HIDDEN_VENDOR_IDS = new Set(['v_sweets']);

let vcState = {
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
    const farsiDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    return n.toString().replace(/\d/g, x => farsiDigits[x]);
}

function formatPrice(amount) {
    return toPersianDigits(Math.round(amount).toLocaleString('fa-IR'));
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

function getVisibleVendors() {
    const api = window.AppAPI;
    if (!api || !Array.isArray(api.vendors)) return [];
    return api.vendors.filter(v => !HIDDEN_VENDOR_IDS.has(v.id));
}

function hasAnyDiscountedProduct(vendorId) {
    const api = window.AppAPI;
    if (!api || !Array.isArray(api.catalogProducts)) return false;
    return api.catalogProducts.some(p => p.vendorId === vendorId && p.discount > 0);
}

function getVendorDiscountPercent(vendorId) {
    const api = window.AppAPI;
    if (!api || !Array.isArray(api.catalogProducts)) return 0;
    const items = api.catalogProducts.filter(p => p.vendorId === vendorId && p.discount > 0);
    if (items.length === 0) return 0;
    return Math.max(...items.map(p => p.discount));
}

function renderVendorCard(vendor, isActive) {
    const showDiscountBadge = hasAnyDiscountedProduct(vendor.id);
    const discountPercent = getVendorDiscountPercent(vendor.id);
    const isFreeDelivery = vendor.deliveryFee === 0;

    return `
        <div onclick="window.VendorCarousel.select('${vendor.id}')"
             class="vendor-carousel-card snap-start shrink-0 w-[220px] rounded-2xl bg-white border ${isActive ? 'border-snapp shadow-md shadow-pink-500/10' : 'border-gray-100 shadow-sm'} overflow-hidden cursor-pointer active:scale-[0.98] transition-all"
             data-vendor-id="${vendor.id}">

            <div class="relative h-28 w-full overflow-hidden">
                <img src="${vendor.banner}" alt="${escapeHtml(vendor.name)}" class="w-full h-full object-cover pointer-events-none" draggable="false">
                <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none"></div>

                ${showDiscountBadge ? `
                    <span class="absolute top-2 right-2 bg-rose-600 text-white text-[10px] font-black px-2 py-0.5 rounded-lg shadow-md pointer-events-none">
                        تا ٪${toPersianDigits(discountPercent)}
                    </span>
                ` : ''}

                ${isFreeDelivery ? `
                    <span class="absolute top-2 left-2 bg-emerald-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md shadow-md pointer-events-none">
                        ارسال رایگان
                    </span>
                ` : ''}

                <div class="absolute bottom-2 right-2 flex items-center gap-1 bg-black/50 backdrop-blur-md border border-white/10 px-1.5 py-0.5 rounded-md pointer-events-none">
                    <i data-lucide="star" class="w-3 h-3 fill-amber-400 text-amber-400"></i>
                    <span class="text-[10px] font-black text-white">${toPersianDigits(vendor.rating)}</span>
                </div>
            </div>

            <div class="p-3 pointer-events-none">
                <div class="flex items-center gap-2 mb-2">
                    <div class="w-9 h-9 rounded-full overflow-hidden border-2 ${isActive ? 'border-snapp' : 'border-gray-100'} shrink-0 -mt-6 bg-white">
                        <img src="${vendor.logo}" alt="${escapeHtml(vendor.name)}" class="w-full h-full object-cover">
                    </div>
                    <div class="min-w-0 flex-1">
                        <h4 class="font-black text-[11px] text-gray-900 truncate">${escapeHtml(vendor.name)}</h4>
                        <p class="text-[9px] text-gray-400 truncate">${escapeHtml(vendor.type)}</p>
                    </div>
                </div>

                <div class="flex items-center justify-between text-[10px] font-bold text-gray-500">
                    <div class="flex items-center gap-1">
                        <i data-lucide="clock" class="w-3 h-3 text-gray-400"></i>
                        <span>${vendor.deliveryTime}</span>
                    </div>
                    <div class="flex items-center gap-1">
                        <i data-lucide="bike" class="w-3 h-3 text-gray-400"></i>
                        <span class="${isFreeDelivery ? 'text-emerald-600' : ''}">
                            ${isFreeDelivery ? 'رایگان' : formatPrice(vendor.deliveryFee) + ' تومان'}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    `;
}

export function renderVendorCarousel(containerSelector = '#vendor-carousel-container') {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    const vendors = getVisibleVendors();
    if (vendors.length === 0) return;

    const currentVendorId =
        (window.AppAPI && window.AppAPI.cartState && window.AppAPI.cartState.vendorId) || null;

    const trackId = 'vendor-carousel-track';

    container.innerHTML = `
        <div class="flex items-center justify-between mb-2.5 px-4">
            <h3 class="font-extrabold text-xs text-gray-900 flex items-center gap-1.5">
                <i data-lucide="store" class="w-4 h-4 text-snapp"></i>
                رستوران‌ها و فروشگاه‌ها
                <span class="text-[10px] font-black text-snapp bg-snapp-light px-2 py-0.5 rounded-full">
                    ${toPersianDigits(vendors.length)}
                </span>
            </h3>
            <div class="flex items-center gap-1">
                <button onclick="window.VendorCarousel.scrollPrev()"
                        class="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 active:scale-90 transition-all flex items-center justify-center text-gray-600"
                        aria-label="قبلی">
                    <i data-lucide="chevron-right" class="w-4 h-4"></i>
                </button>
                <button onclick="window.VendorCarousel.scrollNext()"
                        class="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 active:scale-90 transition-all flex items-center justify-center text-gray-600"
                        aria-label="بعدی">
                    <i data-lucide="chevron-left" class="w-4 h-4"></i>
                </button>
            </div>
        </div>

        <div id="${trackId}"
             class="flex gap-3 overflow-x-auto no-scrollbar px-4 pb-2"
             style="scroll-behavior: smooth; -webkit-overflow-scrolling: touch; touch-action: pan-x; cursor: grab; user-select: none; -webkit-user-select: none;">
            ${vendors.map(v => renderVendorCard(v, v.id === currentVendorId)).join('')}
        </div>
    `;

    if (window.lucide) lucide.createIcons();

    bindCarouselDrag();
}

function bindCarouselDrag() {
    const track = document.getElementById('vendor-carousel-track');
    if (!track) return;

    track.addEventListener('dragstart', (e) => e.preventDefault());

    track.addEventListener('pointerdown', (e) => {
        if (e.pointerType === 'mouse' && e.button !== 0) return;
        if (e.target.closest('button')) return;

        vcState.dragging = true;
        vcState.moved = false;
        vcState.startX = e.clientX;
        vcState.startY = e.clientY;
        vcState.startScroll = track.scrollLeft;
        vcState.pointerId = e.pointerId;

        track.style.cursor = 'grabbing';
        track.style.scrollBehavior = 'auto';

        try { track.setPointerCapture(e.pointerId); } catch (err) {}
    });

    track.addEventListener('pointermove', (e) => {
        if (!vcState.dragging) return;
        if (e.pointerId !== vcState.pointerId) return;

        const dx = e.clientX - vcState.startX;
        const dy = e.clientY - vcState.startY;

        if (!vcState.moved) {
            if (Math.abs(dx) > 6 && Math.abs(dx) > Math.abs(dy)) {
                vcState.moved = true;
            } else if (Math.abs(dy) > 10) {
                vcState.dragging = false;
                vcState.pointerId = null;
                track.style.cursor = 'grab';
                track.style.scrollBehavior = '';
                return;
            }
        }

        if (!vcState.moved) return;

        track.scrollLeft = vcState.startScroll - dx;

        if (Math.abs(dx) > 8) {
            try { e.preventDefault(); } catch (err) {}
        }
    });

    const endDrag = (e) => {
        if (!vcState.dragging) return;
        if (e && vcState.pointerId !== null && e.pointerId !== undefined && e.pointerId !== vcState.pointerId) return;

        const wasMoved = vcState.moved;
        vcState.dragging = false;
        vcState.pointerId = null;
        vcState.moved = false;

        track.style.cursor = 'grab';
        track.style.scrollBehavior = '';

        if (wasMoved) {
            const preventClick = (ev) => {
                ev.stopPropagation();
                ev.preventDefault();
            };
            track.addEventListener('click', preventClick, { capture: true, once: true });
            setTimeout(() => track.removeEventListener('click', preventClick, { capture: true }), 0);
        }
    };

    track.addEventListener('pointerup', endDrag);
    track.addEventListener('pointercancel', endDrag);
    track.addEventListener('pointerleave', endDrag);
}

export function injectVendorCarousel() {
    if (document.getElementById('vendor-carousel-container')) {
        renderVendorCarousel();
        return;
    }

    const container = document.createElement('section');
    container.id = 'vendor-carousel-container';
    container.className = 'mt-4';

    const storiesContainer = document.getElementById('stories-container');
    const quickGrid = document.getElementById('quick-category-grid');
    const header = document.querySelector('header');

    let inserted = false;

    if (storiesContainer) {
        const storiesSection = storiesContainer.closest('section');
        if (storiesSection && storiesSection.parentElement) {
            storiesSection.parentElement.insertBefore(container, storiesSection.nextSibling);
            inserted = true;
        }
    }

    if (!inserted && quickGrid) {
        const vendorSection = quickGrid.closest('section');
        if (vendorSection && vendorSection.parentElement) {
            vendorSection.parentElement.insertBefore(container, vendorSection);
            inserted = true;
        }
    }

    if (!inserted && header && header.parentElement) {
        header.parentElement.insertBefore(container, header.nextSibling);
        inserted = true;
    }

    if (!inserted) {
        console.warn('[VendorCarousel] Could not find an insertion point.');
        return;
    }

    renderVendorCarousel();
}

window.VendorCarousel = {

    select: function (vendorId) {
        if (window.AppAPI && typeof window.AppAPI.selectVendor === 'function') {
            window.AppAPI.selectVendor(vendorId);
        }

        document.querySelectorAll('.vendor-carousel-card').forEach(card => {
            const id = card.dataset.vendorId;
            if (id === vendorId) {
                card.classList.add('border-snapp', 'shadow-md', 'shadow-pink-500/10');
                card.classList.remove('border-gray-100', 'shadow-sm');
            } else {
                card.classList.remove('border-snapp', 'shadow-md', 'shadow-pink-500/10');
                card.classList.add('border-gray-100', 'shadow-sm');
            }
        });
    },

    scrollNext: function () {
        const track = document.getElementById('vendor-carousel-track');
        if (!track) return;
        track.style.scrollBehavior = 'smooth';
        track.scrollBy({ left: -220, behavior: 'smooth' });
    },

    scrollPrev: function () {
        const track = document.getElementById('vendor-carousel-track');
        if (!track) return;
        track.style.scrollBehavior = 'smooth';
        track.scrollBy({ left: 220, behavior: 'smooth' });
    },

    refresh: function () {
        renderVendorCarousel();
    },

    inject: function () {
        injectVendorCarousel();
    }
};

export default { renderVendorCarousel, injectVendorCarousel };