// order-tracking.js

let trackingIntervals = [];
let trackingMap = null;
let courierMarker = null;
let destMarker = null;
let routeLine = null;
let currentOrder = null;
let courierProgress = 0;

function toPersianDigits(n) {
    if (n === null || n === undefined) return '';
    const f = ['۰','۱','۲','۳','۴','۵','۶','۷','۸','۹'];
    return n.toString().replace(/\d/g, x => f[x]);
}

function formatPrice(amount) {
    return toPersianDigits(Math.round(amount).toLocaleString('fa-IR'));
}

function clearTrackingIntervals() {
    trackingIntervals.forEach(clearInterval);
    trackingIntervals = [];
}

async function loadLeaflet() {
    if (window.L) return window.L;
    if (!document.querySelector('link[href*="leaflet"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
    }
    if (!window.L) {
        await new Promise((resolve, reject) => {
            const s = document.createElement('script');
            s.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
            s.onload = resolve;
            s.onerror = reject;
            document.head.appendChild(s);
        });
    }
    return window.L;
}

const STAGES = [
    { id: 'confirmed', label: 'سفارش تایید شد', icon: 'check-circle-2', desc: 'پرداخت با موفقیت انجام شد' },
    { id: 'preparing', label: 'در حال آماده‌سازی', icon: 'chef-hat', desc: 'آشپزخانه در حال پخت سفارش شماست' },
    { id: 'picked', label: 'پیک سفارش را برداشت', icon: 'package-check', desc: 'پیک در مسیر شما قرار گرفت' },
    { id: 'on_the_way', label: 'در مسیر تحویل', icon: 'bike', desc: 'پیک در حال رسیدن به شماست' },
    { id: 'delivered', label: 'تحویل داده شد', icon: 'home', desc: 'سفارش با موفقیت به دست شما رسید' }
];

export async function openOrderTracking(orderData) {
    clearTrackingIntervals();

    currentOrder = orderData || {
        id: '8849201',
        vendorName: 'کباب‌سرای سنتی توسکا',
        vendorLogo: 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=200&q=80',
        items: [
            { name: 'چلو کباب کوبیده مخصوص', qty: 2, price: 450000 },
            { name: 'دوغ آبعلی شیشه‌ای', qty: 1, price: 35000 }
        ],
        totalPaid: 935000,
        address: 'سعادت‌آباد، خیابان سرو غربی، پلاک ۲۴، واحد ۳',
        etaMinutes: 32,
        courier: {
            name: 'رضا محمدی',
            photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80',
            rating: 4.9,
            vehicle: 'موتور سیکلت',
            plate: '۱۲ ب ۳۴۵ ایران ۲۲'
        },
        destination: { lat: 35.7860, lon: 51.3740 },
        vendor: { lat: 35.7920, lon: 51.3680 }
    };

    courierProgress = 0;
    const existing = document.getElementById('order-tracking-view');
    if (existing) existing.remove();

    const view = document.createElement('div');
    view.id = 'order-tracking-view';
    view.className = 'fixed inset-0 z-[80] bg-gray-50 overflow-y-auto font-vazir';
    view.style.opacity = '0';
    view.style.transition = 'opacity 0.25s ease';

    view.innerHTML = renderTrackingHTML();
    document.body.appendChild(view);

    if (window.lucide) lucide.createIcons();

    requestAnimationFrame(() => view.style.opacity = '1');

    await initTrackingMap();
    startCourierSimulation();
    startETACountdown();
    bindTrackingEvents(view);
}

function renderTrackingHTML() {
    const o = currentOrder;
    return `
        <div class="max-w-md mx-auto bg-white min-h-screen relative pb-32">

            <div class="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-4 py-3">
                <button id="tracking-close-btn" class="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 hover:bg-gray-200 active:scale-95 transition-all">
                    <i data-lucide="arrow-right" class="w-4 h-4"></i>
                </button>
                <div class="text-center">
                    <h2 class="font-black text-xs text-gray-900">پیگیری سفارش</h2>
                    <p class="text-[10px] text-gray-500 mt-0.5">کد: Loghme-${toPersianDigits(o.id)}</p>
                </div>
                <button id="tracking-help-btn" class="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 hover:bg-gray-200 active:scale-95 transition-all">
                    <i data-lucide="help-circle" class="w-4 h-4"></i>
                </button>
            </div>

            <div class="px-4 pt-5">
                <div class="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-5 text-white shadow-lg shadow-emerald-500/20 relative overflow-hidden">
                    <div class="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
                    <div class="relative z-10 flex items-center justify-between">
                        <div>
                            <div class="flex items-center gap-1.5 mb-2">
                                <span class="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                                <span class="text-[10px] font-black tracking-wider">در حال انجام</span>
                            </div>
                            <div class="text-2xl font-black tracking-tight" id="tracking-eta">${toPersianDigits(o.etaMinutes)}</div>
                            <div class="text-[11px] opacity-90 mt-0.5">دقیقه تا رسیدن پیک</div>
                        </div>
                        <div class="w-14 h-14 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                            <i data-lucide="bike" class="w-7 h-7"></i>
                        </div>
                    </div>
                </div>
            </div>

            <div class="px-4 mt-4">
                <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div id="tracking-map" class="w-full h-44 bg-gray-100 relative"></div>
                    <div class="px-4 py-3 flex items-center gap-2 border-t border-gray-50 bg-gray-50/50">
                        <i data-lucide="navigation" class="w-4 h-4 text-snapp" style="animation: spin 6s linear infinite;"></i>
                        <span class="text-[11px] font-bold text-gray-700">پیک در حال حرکت به سمت شماست</span>
                    </div>
                </div>
            </div>

            <div class="px-4 mt-4">
                <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
                    <div class="relative shrink-0">
                        <div class="w-14 h-14 rounded-full overflow-hidden border-2 border-snapp/20 p-0.5 bg-white">
                            <img src="${o.courier.photo}" class="w-full h-full rounded-full object-cover" alt="پیک">
                        </div>
                        <span class="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"></span>
                    </div>
                    <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-1.5 mb-0.5">
                            <span class="font-black text-xs text-gray-900">${o.courier.name}</span>
                            <div class="flex items-center gap-0.5 text-[10px] font-bold text-amber-500 bg-amber-50 px-1.5 py-0.5 rounded-md">
                                <i data-lucide="star" class="w-2.5 h-2.5 fill-amber-400 text-amber-400"></i>
                                ${toPersianDigits(o.courier.rating)}
                            </div>
                        </div>
                        <div class="text-[10px] text-gray-500 flex items-center gap-2 mt-1">
                            <span class="flex items-center gap-1"><i data-lucide="bike" class="w-3 h-3"></i>${o.courier.vehicle}</span>
                            <span class="w-1 h-1 bg-gray-300 rounded-full"></span>
                            <span dir="ltr">${o.courier.plate}</span>
                        </div>
                    </div>
                    <div class="flex gap-1.5 shrink-0">
                        <button id="tracking-chat-courier" class="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-700 active:scale-95 transition-all">
                            <i data-lucide="message-square" class="w-4 h-4"></i>
                        </button>
                        <button id="tracking-call-courier" class="w-10 h-10 rounded-xl bg-emerald-500 hover:bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/30 active:scale-95 transition-all">
                            <i data-lucide="phone" class="w-4 h-4"></i>
                        </button>
                    </div>
                </div>
            </div>

            <div class="px-4 mt-4">
                <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                    <h3 class="font-black text-xs text-gray-900 mb-4 flex items-center gap-1.5">
                        <i data-lucide="activity" class="w-3.5 h-3.5 text-snapp"></i>
                        وضعیت سفارش
                    </h3>
                    <div id="tracking-timeline" class="space-y-0"></div>
                </div>
            </div>

            <div class="px-4 mt-4">
                <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                    <div class="flex items-center gap-3 mb-3 pb-3 border-b border-gray-50">
                        <img src="${o.vendorLogo}" class="w-10 h-10 rounded-xl object-cover border border-gray-100">
                        <div class="flex-1 min-w-0">
                            <div class="font-black text-xs text-gray-900 truncate">${o.vendorName}</div>
                            <div class="text-[10px] text-gray-500 mt-0.5">${toPersianDigits(o.items.length)} قلم کالا</div>
                        </div>
                    </div>
                    <div class="space-y-2 mb-3">
                        ${o.items.map(it => `
                            <div class="flex justify-between items-center text-[11px]">
                                <span class="text-gray-600 flex items-center gap-1.5">
                                    <span class="bg-gray-100 text-gray-700 font-bold px-1.5 py-0.5 rounded text-[10px]">${toPersianDigits(it.qty)}×</span>
                                    ${it.name}
                                </span>
                                <span class="font-bold text-gray-800">${formatPrice(it.price * it.qty)}</span>
                            </div>
                        `).join('')}
                    </div>
                    <div class="flex justify-between items-center border-t border-gray-100 pt-3">
                        <span class="text-[11px] font-black text-gray-900">مبلغ پرداخت‌شده:</span>
                        <span class="font-black text-sm text-snapp">${formatPrice(o.totalPaid)} <span class="text-[10px] font-normal text-gray-500">تومان</span></span>
                    </div>
                </div>
            </div>

            <div class="px-4 mt-4">
                <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-start gap-3">
                    <div class="w-9 h-9 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 shrink-0">
                        <i data-lucide="map-pin" class="w-4 h-4"></i>
                    </div>
                    <div class="flex-1 min-w-0">
                        <div class="text-[10px] font-bold text-gray-500 mb-1">آدرس تحویل:</div>
                        <p class="text-[11px] font-bold text-gray-800 leading-relaxed">${o.address}</p>
                    </div>
                </div>
            </div>

            <div class="fixed bottom-0 inset-x-0 max-w-md mx-auto bg-white border-t border-gray-200 p-4 flex gap-2 shadow-[0_-4px_14px_rgba(0,0,0,0.06)] z-40">
                <button id="tracking-tip-btn" class="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-black text-xs py-3.5 rounded-2xl shadow-md shadow-amber-500/30 active:scale-95 transition-all flex items-center justify-center gap-1.5">
                    <i data-lucide="gift" class="w-4 h-4"></i>
                    انعام به پیک
                </button>
                <button id="tracking-support-btn" class="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs py-3.5 rounded-2xl active:scale-95 transition-all flex items-center justify-center gap-1.5">
                    <i data-lucide="headphones" class="w-4 h-4"></i>
                    پشتیبانی
                </button>
            </div>
        </div>
    `;
}

function renderTimelineHTML(activeIdx) {
    return STAGES.map((s, i) => {
        const done = i < activeIdx;
        const active = i === activeIdx;
        const pending = i > activeIdx;
        return `
            <div class="flex gap-3 pb-4 relative">
                ${i < STAGES.length - 1 ? `<div class="absolute top-8 right-3.5 w-0.5 h-full ${done ? 'bg-emerald-400' : 'bg-gray-200'}" style="transform: translateX(50%)"></div>` : ''}
                <div class="relative z-10 shrink-0">
                    <div class="w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                        done ? 'bg-emerald-500 text-white' :
                        active ? 'bg-snapp text-white shadow-md shadow-pink-500/40' :
                        'bg-gray-100 text-gray-400'
                    }">
                        ${done
                            ? `<i data-lucide="check" class="w-3.5 h-3.5"></i>`
                            : `<i data-lucide="${s.icon}" class="w-3.5 h-3.5 ${active ? 'animate-pulse' : ''}"></i>`
                        }
                    </div>
                </div>
                <div class="flex-1 min-w-0 pb-1">
                    <div class="font-black text-[11px] ${pending ? 'text-gray-400' : 'text-gray-900'} mb-0.5">${s.label}</div>
                    <div class="text-[10px] ${pending ? 'text-gray-400' : 'text-gray-500'} leading-relaxed">${s.desc}</div>
                </div>
            </div>
        `;
    }).join('');
}

async function initTrackingMap() {
    const mapEl = document.getElementById('tracking-map');
    if (!mapEl) return;

    try {
        const L = await loadLeaflet();
        if (!L) return;

        trackingMap = L.map(mapEl, {
            zoomControl: false,
            attributionControl: false
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19
        }).addTo(trackingMap);

        const destIcon = L.divIcon({
            className: 'tracking-marker-dest',
            html: '<div style="width:14px;height:14px;border-radius:50%;background:#FF00A6;border:3px solid white;box-shadow:0 0 0 4px rgba(255,0,166,0.25);"></div>',
            iconSize: [14, 14],
            iconAnchor: [7, 7]
        });

        const courierIcon = L.divIcon({
            className: 'tracking-marker-courier',
            html: '<div style="width:32px;height:32px;border-radius:50%;background:#10B981;border:3px solid white;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 10px rgba(16,185,129,0.5);"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="18.5" cy="17.5" r="3.5"/><path d="M15 6h4l3 5v4h-7z"/><path d="M12 17.5V6H8.5L5.5 17.5"/></svg></div>',
            iconSize: [32, 32],
            iconAnchor: [16, 16]
        });

        destMarker = L.marker([currentOrder.destination.lat, currentOrder.destination.lon], { icon: destIcon }).addTo(trackingMap);
        courierMarker = L.marker([currentOrder.vendor.lat, currentOrder.vendor.lon], { icon: courierIcon }).addTo(trackingMap);

        const latlngs = [
            [currentOrder.vendor.lat, currentOrder.vendor.lon],
            [currentOrder.destination.lat, currentOrder.destination.lon]
        ];

        routeLine = L.polyline(latlngs, {
            color: '#FF00A6',
            weight: 3,
            opacity: 0.6,
            dashArray: '8 6'
        }).addTo(trackingMap);

        trackingMap.fitBounds(L.latLngBounds(latlngs), { padding: [40, 40] });

        setTimeout(() => trackingMap && trackingMap.invalidateSize(), 250);

    } catch (err) {
        console.warn('[TrackingMap] Failed:', err);
        mapEl.innerHTML = `
            <div class="absolute inset-0 flex items-center justify-center bg-gray-100">
                <div class="text-center px-4">
                    <div class="w-10 h-10 mx-auto mb-2 rounded-full bg-gray-200 flex items-center justify-center text-gray-400">
                        <i data-lucide="map" class="w-5 h-5"></i>
                    </div>
                    <span class="text-[10px] font-bold text-gray-500">نمایش نقشه در دسترس نیست</span>
                </div>
            </div>
        `;
        if (window.lucide) lucide.createIcons();
    }
}

function startCourierSimulation() {
    const totalDuration = 30000;
    const stepInterval = 800;
    const totalSteps = totalDuration / stepInterval;
    let step = 0;

    const iv = setInterval(() => {
        step++;
        courierProgress = Math.min(1, step / totalSteps);

        if (courierMarker && trackingMap) {
            const v = currentOrder.vendor;
            const d = currentOrder.destination;
            const lat = v.lat + (d.lat - v.lat) * courierProgress;
            const lon = v.lon + (d.lon - v.lon) * courierProgress;
            courierMarker.setLatLng([lat, lon]);
        }

        const activeIdx = getActiveStageIndex();
        const timeline = document.getElementById('tracking-timeline');
        if (timeline) {
            const prevActive = parseInt(timeline.dataset.activeIdx || '-1', 10);
            if (prevActive !== activeIdx) {
                timeline.dataset.activeIdx = activeIdx;
                timeline.innerHTML = renderTimelineHTML(activeIdx);
                if (window.lucide) lucide.createIcons();
            }
        }

        if (courierProgress >= 1) {
            clearInterval(iv);
        }
    }, stepInterval);

    trackingIntervals.push(iv);

    const timeline = document.getElementById('tracking-timeline');
    if (timeline) {
        timeline.dataset.activeIdx = '0';
        timeline.innerHTML = renderTimelineHTML(0);
        if (window.lucide) lucide.createIcons();
    }
}

function getActiveStageIndex() {
    if (courierProgress < 0.1) return 1;
    if (courierProgress < 0.25) return 2;
    if (courierProgress < 0.95) return 3;
    return 4;
}

function startETACountdown() {
    let seconds = currentOrder.etaMinutes * 60;

    const iv = setInterval(() => {
        seconds = Math.max(0, seconds - 1);
        const mins = Math.ceil(seconds / 60);
        const el = document.getElementById('tracking-eta');
        if (el) el.textContent = toPersianDigits(mins);

        if (seconds <= 0) clearInterval(iv);
    }, 1000);

    trackingIntervals.push(iv);
}

function bindTrackingEvents(view) {
    const closeBtn = view.querySelector('#tracking-close-btn');
    if (closeBtn) closeBtn.addEventListener('click', () => closeOrderTracking());

    const callBtn = view.querySelector('#tracking-call-courier');
    if (callBtn) callBtn.addEventListener('click', () => {
        showTrackingToast('در حال برقراری تماس با پیک...');
    });

    const chatBtn = view.querySelector('#tracking-chat-courier');
    if (chatBtn) chatBtn.addEventListener('click', () => {
        showTrackingToast('چت با پیک به‌زودی در دسترس خواهد بود.');
    });

    const helpBtn = view.querySelector('#tracking-help-btn');
    if (helpBtn) helpBtn.addEventListener('click', () => {
        showTrackingToast('برای کمک، با پشتیبانی تماس بگیرید.');
    });

    const supportBtn = view.querySelector('#tracking-support-btn');
    if (supportBtn) supportBtn.addEventListener('click', () => {
        if (window.PI_API && window.PI_API.openSupport) {
            closeOrderTracking();
            window.PI_API.openSupport();
        }
    });

    const tipBtn = view.querySelector('#tracking-tip-btn');
    if (tipBtn) tipBtn.addEventListener('click', () => openTipSheet());
}

function showTrackingToast(msg) {
    const existing = document.getElementById('tracking-toast');
    if (existing) existing.remove();

    const t = document.createElement('div');
    t.id = 'tracking-toast';
    t.className = 'fixed top-4 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-5 py-3 rounded-xl text-xs font-bold shadow-2xl z-[10010] transition-all duration-300 transform -translate-y-10 opacity-0 flex items-center gap-2 w-max max-w-[90vw] font-vazir';
    t.innerHTML = `<i data-lucide="info" class="w-4 h-4 text-sky-400"></i> <span>${msg}</span>`;
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

function openTipSheet() {
    const existing = document.getElementById('tracking-tip-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'tracking-tip-modal';
    modal.className = 'fixed inset-0 z-[100] bg-black/60 flex items-end justify-center opacity-0 transition-opacity duration-300 font-vazir';
    modal.innerHTML = `
        <div id="tracking-tip-content" class="bg-white w-full max-w-md rounded-t-3xl p-5 transform translate-y-full transition-transform duration-300">
            <div class="flex items-center justify-between mb-4">
                <div class="flex items-center gap-2">
                    <div class="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                        <i data-lucide="gift" class="w-5 h-5"></i>
                    </div>
                    <div>
                        <h3 class="font-black text-sm text-gray-900">انعام به پیک</h3>
                        <p class="text-[10px] text-gray-500 mt-0.5">قدردانی از تلاش پیک در سریع رساندن سفارش</p>
                    </div>
                </div>
                <button id="tip-close" class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                    <i data-lucide="x" class="w-4 h-4"></i>
                </button>
            </div>
            <div class="grid grid-cols-3 gap-2 mb-4">
                ${[5000, 10000, 15000, 20000, 30000, 50000].map(a => `
                    <button onclick="window.OrderTrackingAPI.pickTip(${a}, this)" class="tip-option py-3 rounded-2xl border-2 border-gray-200 bg-white text-xs font-black text-gray-700 hover:border-amber-400 hover:bg-amber-50 transition-all" data-amount="${a}">
                        ${formatPrice(a)}
                    </button>
                `).join('')}
            </div>
            <input type="number" id="tip-custom" placeholder="مبلغ دلخواه (تومان)" class="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-3 text-xs font-bold text-center outline-none focus:border-amber-400 mb-3" dir="ltr">
            <button id="tip-submit" onclick="window.OrderTrackingAPI.submitTip()" class="w-full bg-amber-500 hover:bg-amber-600 text-white font-black text-sm py-3.5 rounded-2xl shadow-md shadow-amber-500/30 active:scale-95 transition-all">
                ثبت انعام
            </button>
        </div>
    `;
    document.body.appendChild(modal);
    if (window.lucide) lucide.createIcons();

    requestAnimationFrame(() => {
        modal.classList.remove('opacity-0');
        document.getElementById('tracking-tip-content').classList.remove('translate-y-full');
    });

    document.getElementById('tip-close').onclick = () => {
        modal.classList.add('opacity-0');
        document.getElementById('tracking-tip-content').classList.add('translate-y-full');
        setTimeout(() => modal.remove(), 300);
    };
}

function closeOrderTracking() {
    clearTrackingIntervals();
    if (trackingMap) {
        try { trackingMap.remove(); } catch (e) {}
        trackingMap = null;
        courierMarker = null;
        destMarker = null;
        routeLine = null;
    }
    const view = document.getElementById('order-tracking-view');
    if (view) {
        view.style.opacity = '0';
        setTimeout(() => view.remove(), 220);
    }
}

window.OrderTrackingAPI = {
    pickTip: function(amount, btn) {
        document.querySelectorAll('.tip-option').forEach(b => {
            b.className = 'tip-option py-3 rounded-2xl border-2 border-gray-200 bg-white text-xs font-black text-gray-700 hover:border-amber-400 hover:bg-amber-50 transition-all';
        });
        btn.className = 'tip-option py-3 rounded-2xl border-2 border-amber-500 bg-amber-50 text-xs font-black text-amber-700 transition-all';
        document.getElementById('tip-custom').value = amount;
    },
    submitTip: function() {
        const val = parseInt(document.getElementById('tip-custom').value, 10);
        if (!val || val < 1000) {
            alert('حداقل مبلغ انعام ۱,۰۰۰ تومان است.');
            return;
        }
        const modal = document.getElementById('tracking-tip-modal');
        if (modal) {
            modal.classList.add('opacity-0');
            document.getElementById('tracking-tip-content').classList.add('translate-y-full');
            setTimeout(() => modal.remove(), 300);
        }
        showTrackingToast(`انعام ${formatPrice(val)} تومانی با موفقیت ثبت شد.`);
    }
};

export function closeOrderTrackingView() {
    closeOrderTracking();
}