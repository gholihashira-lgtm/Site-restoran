let fdState = {
    index: 0,
    items: [],
    dragging: false,
    startX: 0,
    startY: 0,
    offsetX: 0,
    startIndex: 0,
    autoplayTimer: null,
    width: 0,
    pointerId: null,
    moved: false,
    bound: false,
    resizeTimer: null
};

function fdToPersian(n) {
    if (n === null || n === undefined) return '';
    const f = ['۰','۱','۲','۳','۴','۵','۶','۷','۸','۹'];
    return n.toString().replace(/\d/g, x => f[x]);
}

function fdFormatPrice(a) {
    return fdToPersian(Math.round(a).toLocaleString('fa-IR'));
}

function fdEscape(s) {
    if (!s) return '';
    return String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function fdGetItems() {
    const api = window.AppAPI;
    if (!api || !Array.isArray(api.catalogProducts)) return [];
    const vendorId = window.selectedVendorId || 'v1';
    let list = api.catalogProducts.filter(p => p.vendorId === vendorId && p.discount > 0);
    if (list.length < 2) list = api.catalogProducts.filter(p => p.discount > 0);
    if (list.length < 2) list = api.catalogProducts.slice(0, 8);
    return list.slice(0, 8);
}

function fdRenderCard(item) {
    const api = window.AppAPI;
    const qty = (api && api.cartState.items[item.id]?.quantity) || 0;
    const hasDiscount = item.discount > 0;
    const stockPct = Math.min(100, Math.max(10, (item.stockLeft / 20) * 100));

    return `
<div class="fd-card" data-fd-id="${item.id}" style="flex:0 0 100%;width:100%;min-width:100%;max-width:100%;box-sizing:border-box;padding:0 2px;">
<div style="background:#fff;color:#1f2937;border-radius:12px;padding:12px;display:flex;gap:12px;align-items:center;box-shadow:0 2px 8px rgba(0,0,0,0.06);min-height:120px;box-sizing:border-box;">
<div class="fd-img-box" data-fd-open="${item.id}" style="position:relative;width:96px;height:96px;border-radius:12px;overflow:hidden;flex-shrink:0;background:#f9fafb;border:1px solid #f3f4f6;cursor:pointer;">
<img src="${item.image}" alt="${fdEscape(item.title)}" draggable="false" style="width:100%;height:100%;object-fit:cover;display:block;pointer-events:none;user-select:none;">
${hasDiscount ? `<span style="position:absolute;top:4px;right:4px;background:linear-gradient(135deg,#FF00A6,#EF4444);color:#fff;font-weight:900;font-size:10px;padding:2px 6px;border-radius:6px;line-height:1;">٪${fdToPersian(item.discount)}</span>` : ''}
</div>
<div style="flex:1 1 auto;min-width:0;display:flex;flex-direction:column;justify-content:space-between;gap:6px;">
<div class="fd-title" data-fd-open="${item.id}" style="font-weight:800;font-size:12px;color:#111827;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;cursor:pointer;line-height:1.4;">${fdEscape(item.title)}</div>
<div>
<div style="font-size:10px;color:#dc2626;font-weight:700;margin-bottom:4px;">تنها ${fdToPersian(item.stockLeft)} عدد در انبار</div>
<div style="width:100%;height:6px;background:#fee2e2;border-radius:9999px;overflow:hidden;">
<div style="height:100%;width:${stockPct}%;background:linear-gradient(90deg,#e11d48,#ec4899);border-radius:9999px;"></div>
</div>
</div>
<div style="display:flex;align-items:center;justify-content:space-between;gap:6px;">
<div style="min-width:0;">
${hasDiscount ? `<div style="font-size:10px;color:#9ca3af;text-decoration:line-through;line-height:1.2;">${fdFormatPrice(item.originalPrice)}</div>` : ''}
<div style="font-size:12px;font-weight:900;color:#FF00A6;line-height:1.3;white-space:nowrap;">${fdFormatPrice(item.price)} <span style="font-size:9px;font-weight:400;color:#6b7280;">تومان</span></div>
</div>
${qty === 0 ? `
<button class="fd-add-btn" data-fd-add="${item.id}" style="background:#FF00A6;color:#fff;border:none;font-size:12px;font-weight:700;padding:6px 12px;border-radius:12px;display:inline-flex;align-items:center;gap:4px;cursor:pointer;font-family:inherit;flex-shrink:0;">
<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="pointer-events:none;"><path d="M12 5v14M5 12h14"/></svg>
<span style="pointer-events:none;">خرید</span>
</button>
` : `
<div style="display:flex;align-items:center;background:#FF00A6;color:#fff;border-radius:12px;padding:2px;gap:8px;flex-shrink:0;">
<button class="fd-add-btn" data-fd-add="${item.id}" style="width:24px;height:24px;display:flex;align-items:center;justify-content:center;border:none;background:transparent;color:#fff;border-radius:8px;cursor:pointer;font-family:inherit;padding:0;">
<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="pointer-events:none;"><path d="M12 5v14M5 12h14"/></svg>
</button>
<span style="font-size:12px;font-weight:900;min-width:12px;text-align:center;">${fdToPersian(qty)}</span>
<button class="fd-dec-btn" data-fd-dec="${item.id}" style="width:24px;height:24px;display:flex;align-items:center;justify-content:center;border:none;background:transparent;color:#fff;border-radius:8px;cursor:pointer;font-family:inherit;padding:0;">
${qty === 1
    ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="pointer-events:none;"><path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/></svg>`
    : `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="pointer-events:none;"><path d="M5 12h14"/></svg>`
}
</button>
</div>
`}
</div>
</div>
</div>
</div>`;
}

function fdRenderDots() {
    const dots = document.getElementById('flash-deals-dots');
    if (!dots) return;
    if (fdState.items.length <= 1) {
        dots.innerHTML = '';
        return;
    }
    dots.innerHTML = fdState.items.map((_, i) => `
        <button class="fd-dot" data-fd-dot="${i}" style="height:6px;width:${i === fdState.index ? '24px' : '6px'};border-radius:9999px;background:${i === fdState.index ? '#ffffff' : 'rgba(255,255,255,0.4)'};border:none;padding:0;cursor:pointer;transition:all 0.3s;"></button>
    `).join('');
}

function fdUpdateTransform(withTransition) {
    const inner = document.getElementById('flash-deals-inner');
    if (!inner) return;
    const w = fdState.width || inner.parentElement.clientWidth || 300;
    let offset = -fdState.index * w;
    if (fdState.dragging) offset += fdState.offsetX;
    inner.style.transition = withTransition === false ? 'none' : 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
    inner.style.transform = `translate3d(${offset}px, 0, 0)`;
}

function fdGoTo(index, animate) {
    if (index < 0) index = 0;
    if (index >= fdState.items.length) index = fdState.items.length - 1;
    fdState.index = index;
    fdState.offsetX = 0;
    fdUpdateTransform(animate !== false);
    fdRenderDots();
    fdRestartAutoplay();
}

function fdNext() {
    fdGoTo(fdState.index < fdState.items.length - 1 ? fdState.index + 1 : 0, true);
}

function fdPrev() {
    fdGoTo(fdState.index > 0 ? fdState.index - 1 : fdState.items.length - 1, true);
}

function fdStartAutoplay() {
    fdStopAutoplay();
    if (fdState.items.length <= 1) return;
    fdState.autoplayTimer = setInterval(() => {
        if (fdState.dragging) return;
        fdNext();
    }, 5000);
}

function fdStopAutoplay() {
    if (fdState.autoplayTimer) {
        clearInterval(fdState.autoplayTimer);
        fdState.autoplayTimer = null;
    }
}

function fdRestartAutoplay() {
    fdStopAutoplay();
    fdStartAutoplay();
}

function fdOnPointerDown(e) {
    if (fdState.items.length <= 1) return;
    const target = e.target;
    if (target.closest('[data-fd-add]') || target.closest('[data-fd-dec]') || target.closest('[data-fd-dot]')) return;
    if (e.pointerType === 'mouse' && e.button !== 0) return;

    fdState.dragging = true;
    fdState.moved = false;
    fdState.startX = e.clientX;
    fdState.startY = e.clientY;
    fdState.offsetX = 0;
    fdState.startIndex = fdState.index;
    fdState.pointerId = e.pointerId;
    fdStopAutoplay();

    const wrapper = document.getElementById('flash-deals-wrap');
    if (wrapper) wrapper.style.cursor = 'grabbing';

    document.addEventListener('pointermove', fdOnPointerMove, { passive: true });
    document.addEventListener('pointerup', fdOnPointerUp);
    document.addEventListener('pointercancel', fdOnPointerCancel);
}

function fdOnPointerMove(e) {
    if (!fdState.dragging) return;
    if (e.pointerId !== fdState.pointerId) return;

    const dx = e.clientX - fdState.startX;
    const dy = e.clientY - fdState.startY;

    if (!fdState.moved) {
        if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 6) {
            fdState.dragging = false;
            fdState.pointerId = null;
            document.removeEventListener('pointermove', fdOnPointerMove);
            document.removeEventListener('pointerup', fdOnPointerUp);
            document.removeEventListener('pointercancel', fdOnPointerCancel);
            const wrapper = document.getElementById('flash-deals-wrap');
            if (wrapper) wrapper.style.cursor = 'grab';
            fdUpdateTransform(true);
            fdRestartAutoplay();
            return;
        }
        if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 10) {
            fdState.moved = true;
        }
    }

    if (!fdState.moved) return;
    fdState.offsetX = dx;

    let visualOffset = dx;
    const maxOffset = fdState.width * 0.4;
    if (visualOffset > maxOffset) visualOffset = maxOffset + (visualOffset - maxOffset) * 0.3;
    if (visualOffset < -maxOffset) visualOffset = -maxOffset + (visualOffset + maxOffset) * 0.3;

    const inner = document.getElementById('flash-deals-inner');
    if (inner) {
        const w = fdState.width || inner.parentElement.clientWidth || 300;
        inner.style.transition = 'none';
        inner.style.transform = `translate3d(${-fdState.startIndex * w + visualOffset}px, 0, 0)`;
    }
}

function fdOnPointerUp(e) {
    if (!fdState.dragging) {
        document.removeEventListener('pointermove', fdOnPointerMove);
        document.removeEventListener('pointerup', fdOnPointerUp);
        document.removeEventListener('pointercancel', fdOnPointerCancel);
        return;
    }
    if (fdState.pointerId !== null && e.pointerId !== undefined && e.pointerId !== fdState.pointerId) {
        return;
    }

    fdState.dragging = false;
    fdState.pointerId = null;

    document.removeEventListener('pointermove', fdOnPointerMove);
    document.removeEventListener('pointerup', fdOnPointerUp);
    document.removeEventListener('pointercancel', fdOnPointerCancel);

    const wrapper = document.getElementById('flash-deals-wrap');
    if (wrapper) wrapper.style.cursor = 'grab';

    const dx = fdState.offsetX;
    const w = fdState.width || 300;
    const threshold = Math.max(40, w * 0.15);
    let newIndex = fdState.startIndex;

    if (dx < -threshold && fdState.startIndex < fdState.items.length - 1) {
        newIndex = fdState.startIndex + 1;
    } else if (dx > threshold && fdState.startIndex > 0) {
        newIndex = fdState.startIndex - 1;
    } else if (Math.abs(dx) < 8 && !fdState.moved) {
        fdState.offsetX = 0;
        fdState.moved = false;
        fdUpdateTransform(true);
        fdRestartAutoplay();
        return;
    }

    fdState.offsetX = 0;
    fdState.moved = false;
    fdGoTo(newIndex, true);
}

function fdOnPointerCancel() {
    fdState.dragging = false;
    fdState.pointerId = null;
    fdState.offsetX = 0;
    fdState.moved = false;

    document.removeEventListener('pointermove', fdOnPointerMove);
    document.removeEventListener('pointerup', fdOnPointerUp);
    document.removeEventListener('pointercancel', fdOnPointerCancel);

    const wrapper = document.getElementById('flash-deals-wrap');
    if (wrapper) wrapper.style.cursor = 'grab';

    fdUpdateTransform(true);
    fdRestartAutoplay();
}

function fdBindEvents() {
    if (fdState.bound) return;
    const wrapper = document.getElementById('flash-deals-wrap');
    if (!wrapper) return;
    fdState.bound = true;

    wrapper.style.touchAction = 'pan-y';

    wrapper.addEventListener('pointerdown', fdOnPointerDown, { passive: true });

    wrapper.addEventListener('click', (e) => {
        const addBtn = e.target.closest('[data-fd-add]');
        if (addBtn) {
            e.preventDefault(); e.stopPropagation();
            const id = parseInt(addBtn.dataset.fdAdd, 10);
            if (window.AppAPI && window.AppAPI.handleAddToCart) {
                window.AppAPI.handleAddToCart(id);
                setTimeout(() => window.FlashDealsAPI.refresh(), 50);
            }
            return;
        }
        const decBtn = e.target.closest('[data-fd-dec]');
        if (decBtn) {
            e.preventDefault(); e.stopPropagation();
            const id = parseInt(decBtn.dataset.fdDec, 10);
            if (window.AppAPI && window.AppAPI.handleDecrementCart) {
                window.AppAPI.handleDecrementCart(id);
                setTimeout(() => window.FlashDealsAPI.refresh(), 50);
            }
            return;
        }
        const dot = e.target.closest('[data-fd-dot]');
        if (dot) {
            e.preventDefault(); e.stopPropagation();
            fdGoTo(parseInt(dot.dataset.fdDot, 10), true);
            return;
        }
        const openEl = e.target.closest('[data-fd-open]');
        if (openEl && !fdState.moved) {
            e.preventDefault(); e.stopPropagation();
            const id = parseInt(openEl.dataset.fdOpen, 10);
            if (typeof window.openProductDetail === 'function') window.openProductDetail(id);
            else if (typeof window.openProductModal === 'function') window.openProductModal(id);
        }
    }, true);

    wrapper.addEventListener('dragstart', (e) => e.preventDefault());
    wrapper.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') { e.preventDefault(); fdPrev(); }
        else if (e.key === 'ArrowRight') { e.preventDefault(); fdNext(); }
    });

    window.addEventListener('resize', () => {
        clearTimeout(fdState.resizeTimer);
        fdState.resizeTimer = setTimeout(() => {
            const inner = document.getElementById('flash-deals-inner');
            if (inner) {
                fdState.width = inner.parentElement.clientWidth;
                fdUpdateTransform(false);
                setTimeout(() => fdUpdateTransform(true), 20);
            }
        }, 150);
    });
}

function fdRenderAll() {
    const wrap = document.getElementById('flash-deals-wrap');
    const inner = document.getElementById('flash-deals-inner');
    const dots = document.getElementById('flash-deals-dots');

    if (!wrap || !inner) {
        console.warn('[FlashDeals] Container missing');
        return;
    }

    wrap.style.touchAction = 'pan-y';
    inner.style.touchAction = 'pan-y';

    fdState.items = fdGetItems();
    fdState.index = 0;
    fdState.offsetX = 0;
    fdState.moved = false;
    fdState.dragging = false;

    if (fdState.items.length === 0) {
        inner.innerHTML = '';
        if (dots) dots.innerHTML = '';
        return;
    }

    inner.innerHTML = fdState.items.map(item => fdRenderCard(item)).join('');

    fdState.width = inner.parentElement.clientWidth || wrap.clientWidth || 300;

    inner.style.transition = 'none';
    inner.style.transform = 'translate3d(0, 0, 0)';
    requestAnimationFrame(() => {
        inner.style.transition = 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
    });

    fdRenderDots();
    fdBindEvents();
    fdStartAutoplay();
}

export function initFlashDeals() {
    const wrap = document.getElementById('flash-deals-wrap');
    const inner = document.getElementById('flash-deals-inner');
    if (!wrap || !inner) {
        console.warn('[FlashDeals] Structure missing.');
        return;
    }
    fdRenderAll();
}

export function refreshFlashDeals() {
    fdRenderAll();
}

window.FlashDealsAPI = {
    init: initFlashDeals,
    refresh: refreshFlashDeals,
    goTo: (i) => fdGoTo(i, true),
    next: fdNext,
    prev: fdPrev,
    start: fdStartAutoplay,
    stop: fdStopAutoplay
};