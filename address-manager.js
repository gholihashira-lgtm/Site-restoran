/* ==========================================================================
 * address-manager.js
 * --------------------------------------------------------------------------
 * Advanced Multi-Step Address Management System for Loghme Shop / Loghme Food.
 * Includes Saved Addresses, Manual Entry, Real Map Picker (Leaflet + OSM),
 * Reverse Geocoding (Nominatim), and Address Details Form.
 * ========================================================================== */

let addresses = [
    {
        id: 'a1',
        province: 'تهران',
        city: 'تهران',
        text: 'تهران، سعادت‌آباد، خیابان سرو غربی، پلاک ۲۴، واحد ۳',
        pelak: '۲۴',
        unit: '۳',
        postalCode: '۱۹۹۸۷۶۵۴۳۲',
        receiver: 'سید ارمیا مفیدی',
        phone: '۰۹۳۹۱۷۷۸۱۴۴',
        tag: 'خانه',
        icon: 'home'
    },
    {
        id: 'a2',
        province: 'تهران',
        city: 'تهران',
        text: 'تهران، شهرک غرب، بلوار فرحزادی، خیابان حافظ، پلاک ۱۰',
        pelak: '۱۰',
        unit: '',
        postalCode: '۱۴۶۷۸۹۰۱۲۳',
        receiver: 'سید ارمیا مفیدی',
        phone: '۰۹۳۹۱۷۷۸۱۴۴',
        tag: 'محل کار',
        icon: 'briefcase'
    }
];

let activeAddressId = 'a1';
let newAddressCache = {}; // Temporarily holds map data before final form submission
let leafletMapInstance = null;
let leafletMarker = null;

function toPersianDigits(n) {
    if (n === null || n === undefined) return '';
    const farsiDigits = ['۰','۱','۲','۳','۴','۵','۶','۷','۸','۹'];
    return n.toString().replace(/\d/g, x => farsiDigits[x]);
}

function showToast(message) {
    const existing = document.getElementById('am-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'am-toast';
    toast.className = 'fixed top-4 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-5 py-3 rounded-xl text-xs font-bold shadow-2xl z-[10005] transition-all duration-300 transform -translate-y-10 opacity-0 flex items-center gap-2 w-max max-w-[90vw]';
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

/* ==========================================================================
 * LEAFLET DYNAMIC LOADER
 * ========================================================================== */
async function loadLeaflet() {
    if (window.L) return window.L;

    // Load CSS once
    if (!document.querySelector('link[href*="leaflet"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
    }

    // Load JS
    if (!window.L) {
        await new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    return window.L;
}

/* ==========================================================================
 * REVERSE GEOCODING (Nominatim - OpenStreetMap)
 * ========================================================================== */
async function reverseGeocode(lat, lon) {
    try {
        const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&accept-language=fa`;
        const res = await fetch(url, {
            headers: {
                'User-Agent': 'LoghmeApp/1.0 (demo)'
            }
        });
        if (!res.ok) throw new Error('geocode failed');
        const data = await res.json();
        return data.display_name || null;
    } catch (err) {
        console.warn('[ReverseGeocode] Failed:', err);
        return null;
    }
}

/* ==========================================================================
 * GLOBAL API FOR INLINE EVENT HANDLERS
 * ========================================================================== */
window.AM_API = {
    closeAll: function() {
        ['am-overlay-step1', 'am-overlay-step-choice', 'am-overlay-step2', 'am-overlay-step3', 'am-overlay-confirm'].forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.classList.add('opacity-0');
                const content = el.querySelector('.am-content-panel');
                if (content) content.classList.add('translate-y-full');
                setTimeout(() => el.remove(), 300);
            }
        });

        // Clean up Leaflet
        if (leafletMapInstance) {
            try { leafletMapInstance.remove(); } catch (e) {}
            leafletMapInstance = null;
            leafletMarker = null;
        }
    },

    setActiveAddress: function(id, isNew = false) {
        const address = addresses.find(a => a.id === id);
        if (address) {
            activeAddressId = id;
            const headerEl = document.getElementById('header-address-text');
            if (headerEl) headerEl.textContent = address.text;
            window.AM_API.closeAll();
            showToast(isNew ? 'نشانی جدید با موفقیت انتخاب و ذخیره شد.' : 'نشانی تحویل با موفقیت تغییر یافت.');
        }
    },

    deleteAddress: function(id) {
        if (confirm('آیا از حذف این نشانی اطمینان دارید؟')) {
            addresses = addresses.filter(a => a.id !== id);
            if (activeAddressId === id) {
                activeAddressId = addresses.length > 0 ? addresses[0].id : null;
                const headerEl = document.getElementById('header-address-text');
                if (headerEl) headerEl.textContent = activeAddressId ? addresses[0].text : 'نشانی تحویل را انتخاب کنید';
            }
            openAddressManager();
        }
    },

    /* --------------------------------------------------------------------
     * CHOICE SCREEN — pick between manual entry or map
     * -------------------------------------------------------------------- */
    openChoiceScreen: function() {
        const step1 = document.getElementById('am-overlay-step1');
        if (step1) {
            step1.classList.add('opacity-0');
            setTimeout(() => step1.remove(), 300);
        }
        renderChoiceScreen();
    },

    chooseManualEntry: function() {
        newAddressCache = { mode: 'manual' };
        const choice = document.getElementById('am-overlay-step-choice');
        if (choice) {
            choice.classList.add('opacity-0');
            setTimeout(() => choice.remove(), 300);
        }
        renderDetailsForm();
    },

    chooseMapEntry: async function() {
        newAddressCache = { mode: 'map' };
        const choice = document.getElementById('am-overlay-step-choice');
        if (choice) {
            choice.classList.add('opacity-0');
            setTimeout(() => choice.remove(), 300);
        }
        await renderMapPicker();
    },

    /* --------------------------------------------------------------------
     * MAP PICKER ACTIONS
     * -------------------------------------------------------------------- */
    panToGPS: function() {
        if (!navigator.geolocation) {
            showToast('مرورگر شما از موقعیت‌یابی پشتیبانی نمی‌کند.');
            return;
        }

        const btn = document.getElementById('am-gps-btn');
        if (btn) btn.innerHTML = `<div class="w-5 h-5 border-2 border-gray-300 border-t-snapp rounded-full" style="animation: spin 0.8s linear infinite;"></div>`;

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const { latitude, longitude } = pos.coords;
                if (leafletMapInstance) {
                    leafletMapInstance.setView([latitude, longitude], 16);
                }
                window.AM_API.updateMapCenter(latitude, longitude);
                if (btn) btn.innerHTML = `<i data-lucide="navigation" class="w-5 h-5"></i>`;
                if (window.lucide) lucide.createIcons();
                showToast('موقعیت فعلی شما پیدا شد.');
            },
            (err) => {
                if (btn) btn.innerHTML = `<i data-lucide="navigation" class="w-5 h-5"></i>`;
                if (window.lucide) lucide.createIcons();
                showToast('دسترسی به موقعیت مکانی رد شد.');
            },
            { enableHighAccuracy: true, timeout: 8000 }
        );
    },

    updateMapCenter: function(lat, lon) {
        // Called when map is moved OR GPS is used — updates preview + reverse geocode
        newAddressCache.lat = lat;
        newAddressCache.lon = lon;

        const previewEl = document.getElementById('am-map-address-preview');
        if (previewEl) {
            previewEl.textContent = 'در حال یافتن آدرس...';
        }

        // Debounced reverse geocode
        clearTimeout(window.__amGeocodeTimer);
        window.__amGeocodeTimer = setTimeout(async () => {
            const addr = await reverseGeocode(lat, lon);
            if (addr) {
                newAddressCache.detectedText = addr;
                newAddressCache.province = 'تهران'; // (mock)
                newAddressCache.city = 'تهران';
                if (previewEl) previewEl.textContent = addr;
            } else {
                newAddressCache.detectedText = 'موقعیت انتخابی روی نقشه';
                newAddressCache.province = 'تهران';
                newAddressCache.city = 'تهران';
                if (previewEl) previewEl.textContent = 'موقعیت انتخابی روی نقشه (بدون جزئیات)';
            }
        }, 500);
    },

    confirmMapSelection: function() {
        if (!newAddressCache.lat || !newAddressCache.lon) {
            showToast('لطفاً ابتدا موقعیت را روی نقشه انتخاب کنید.');
            return;
        }

        const mapOverlay = document.getElementById('am-overlay-step2');
        if (mapOverlay) {
            mapOverlay.classList.add('opacity-0');
            setTimeout(() => mapOverlay.remove(), 300);
        }

        // Clean up Leaflet
        if (leafletMapInstance) {
            try { leafletMapInstance.remove(); } catch (e) {}
            leafletMapInstance = null;
            leafletMarker = null;
        }

        renderConfirmDialog();
    },

    /* --------------------------------------------------------------------
     * CONFIRM DIALOG
     * -------------------------------------------------------------------- */
    acceptDetectedLocation: function() {
        const confirmModal = document.getElementById('am-overlay-confirm');
        if (confirmModal) {
            confirmModal.classList.add('opacity-0');
            setTimeout(() => confirmModal.remove(), 300);
        }
        renderDetailsForm();
    },

    rejectDetectedLocation: function() {
        // Go back to map picker
        const confirmModal = document.getElementById('am-overlay-confirm');
        if (confirmModal) {
            confirmModal.classList.add('opacity-0');
            setTimeout(() => confirmModal.remove(), 300);
        }
        setTimeout(() => renderMapPicker(), 320);
    },

    /* --------------------------------------------------------------------
     * DETAILS FORM ACTIONS
     * -------------------------------------------------------------------- */
    toggleMeReceiver: function(checked) {
        const nameEl = document.getElementById('am-receiver-name');
        const phoneEl = document.getElementById('am-receiver-phone');
        if (checked) {
            nameEl.value = 'سید ارمیا مفیدی';
            phoneEl.value = '۰۹۳۹۱۷۷۸۱۴۴';
        } else {
            nameEl.value = '';
            phoneEl.value = '';
        }
    },

    setTag: function(tag) {
        newAddressCache.tag = tag;
        ['خانه', 'محل کار', 'سایر'].forEach(t => {
            const btn = document.getElementById('am-tag-' + t);
            if (!btn) return;
            if (t === tag) {
                btn.className = 'flex-1 bg-snapp text-white border border-snapp font-bold text-xs py-2 rounded-xl transition-all shadow-md shadow-pink-500/20';
            } else {
                btn.className = 'flex-1 bg-white border border-gray-200 text-gray-600 font-bold text-xs py-2 rounded-xl transition-all hover:bg-gray-50';
            }
        });

        if (tag === 'خانه') newAddressCache.icon = 'home';
        else if (tag === 'محل کار') newAddressCache.icon = 'briefcase';
        else newAddressCache.icon = 'map-pin';
    },

    validatePostal: function(input) {
        input.value = input.value.replace(/\D/g, '').substring(0, 10);
    },

    submitForm: function() {
        const text = document.getElementById('am-address-text').value.trim();
        const pelak = document.getElementById('am-pelak').value.trim();
        const unit = document.getElementById('am-unit').value.trim();
        const postal = document.getElementById('am-postal').value.trim();
        const rName = document.getElementById('am-receiver-name').value.trim();
        const rPhone = document.getElementById('am-receiver-phone').value.trim();

        if (!text || !pelak || !rName || !rPhone) {
            alert('لطفاً فیلدهای الزامی (نشانی، پلاک، گیرنده و شماره تماس) را تکمیل نمایید.');
            return;
        }

        if (postal && postal.length !== 10) {
            alert('کد پستی باید دقیقاً ۱۰ رقم باشد.');
            return;
        }

        const province = newAddressCache.province || 'تهران';
        const city = newAddressCache.city || 'تهران';
        const fullText = `${province}، ${city}، ${text}، پلاک ${pelak}` + (unit ? `، واحد ${unit}` : '');

        const newAddr = {
            id: 'a' + Date.now(),
            province,
            city,
            text: fullText,
            pelak,
            unit,
            postalCode: toPersianDigits(postal),
            receiver: rName,
            phone: toPersianDigits(rPhone),
            tag: newAddressCache.tag || 'سایر',
            icon: newAddressCache.icon || 'map-pin',
            lat: newAddressCache.lat || null,
            lon: newAddressCache.lon || null
        };

        addresses.push(newAddr);
        window.AM_API.setActiveAddress(newAddr.id, true);
    }
};

/* ==========================================================================
 * STEP 1: SAVED ADDRESSES BOTTOM SHEET
 * ========================================================================== */
export function openAddressManager() {
    window.AM_API.closeAll();

    const overlay = document.createElement('div');
    overlay.id = 'am-overlay-step1';
    overlay.className = 'fixed inset-0 z-[10000] bg-black/60 flex items-end justify-center opacity-0 transition-opacity duration-300 font-vazir';

    let cardsHtml = addresses.map(addr => {
        const isActive = activeAddressId === addr.id;
        return `
            <div class="bg-white rounded-2xl border ${isActive ? 'border-snapp shadow-sm shadow-pink-500/10' : 'border-gray-100 shadow-sm'} p-4 mb-3 transition-colors cursor-pointer" onclick="window.AM_API.setActiveAddress('${addr.id}')">
                <div class="flex items-start gap-3">
                    <div class="w-5 h-5 mt-0.5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${isActive ? 'border-snapp' : 'border-gray-300'}">
                        ${isActive ? '<div class="w-2.5 h-2.5 bg-snapp rounded-full"></div>' : ''}
                    </div>
                    <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2 mb-1.5">
                            <i data-lucide="${addr.icon}" class="w-4 h-4 text-gray-500"></i>
                            <span class="text-xs font-black text-gray-900">${addr.tag}</span>
                        </div>
                        <p class="text-[11px] font-medium text-gray-600 leading-relaxed mb-3 pr-6 text-justify">${addr.text}</p>

                        <div class="flex items-center gap-4 text-[10px] text-gray-500 pr-6 border-t border-gray-50 pt-2">
                            <span class="flex items-center gap-1"><i data-lucide="user" class="w-3 h-3"></i> ${addr.receiver}</span>
                            <span class="flex items-center gap-1" dir="ltr"><i data-lucide="phone" class="w-3 h-3"></i> ${addr.phone}</span>
                        </div>
                    </div>
                    <div class="flex flex-col gap-3 shrink-0" onclick="event.stopPropagation()">
                        <button class="text-gray-400 hover:text-gray-600 transition-colors" title="ویرایش"><i data-lucide="edit-3" class="w-4 h-4"></i></button>
                        <button onclick="window.AM_API.deleteAddress('${addr.id}')" class="text-gray-400 hover:text-rose-500 transition-colors" title="حذف"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    if (addresses.length === 0) {
        cardsHtml = `
            <div class="text-center py-10 px-4">
                <div class="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mx-auto mb-3">
                    <i data-lucide="map" class="w-6 h-6"></i>
                </div>
                <h4 class="text-sm font-bold text-gray-800">هنوز آدرسی ثبت نکرده‌اید!</h4>
                <p class="text-xs text-gray-400 mt-1">برای ثبت سفارش ابتدا یک نشانی وارد کنید.</p>
            </div>
        `;
    }

    overlay.innerHTML = `
        <div class="am-content-panel bg-gray-50 w-full max-w-md rounded-t-3xl overflow-hidden transform translate-y-full transition-transform duration-300 flex flex-col max-h-[85vh]">
            <div class="p-4 bg-white border-b border-gray-100 flex justify-between items-center shrink-0">
                <h3 class="font-black text-sm text-gray-900">انتخاب آدرس تحویل</h3>
                <button onclick="window.AM_API.closeAll()" class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors">
                    <i data-lucide="x" class="w-4 h-4"></i>
                </button>
            </div>

            <div class="overflow-y-auto p-4 flex-1">
                ${cardsHtml}
            </div>

            <div class="p-4 bg-white border-t border-gray-100 shrink-0">
                <button onclick="window.AM_API.openChoiceScreen()" class="w-full bg-white border-2 border-snapp text-snapp hover:bg-snapp-light font-black text-sm py-3.5 rounded-2xl transition-all flex items-center justify-center gap-2 active:scale-95 shadow-sm">
                    <i data-lucide="plus-circle" class="w-5 h-5"></i>
                    <span>افزودن نشانی جدید</span>
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);
    if (window.lucide) lucide.createIcons();

    requestAnimationFrame(() => {
        overlay.classList.remove('opacity-0');
        overlay.querySelector('.am-content-panel').classList.remove('translate-y-full');
    });
}

/* ==========================================================================
 * STEP 1.5: CHOICE SCREEN — Manual vs Map
 * ========================================================================== */
function renderChoiceScreen() {
    const overlay = document.createElement('div');
    overlay.id = 'am-overlay-step-choice';
    overlay.className = 'fixed inset-0 z-[10001] bg-black/60 flex items-end justify-center opacity-0 transition-opacity duration-300 font-vazir';

    overlay.innerHTML = `
        <div class="am-content-panel bg-gray-50 w-full max-w-md rounded-t-3xl overflow-hidden transform translate-y-full transition-transform duration-300 flex flex-col">
            <div class="p-4 bg-white border-b border-gray-100 flex justify-between items-center shrink-0">
                <div class="flex items-center gap-2">
                    <div class="w-2 h-5 bg-snapp rounded-full"></div>
                    <h3 class="font-black text-sm text-gray-900">افزودن نشانی جدید</h3>
                </div>
                <button onclick="window.AM_API.closeAll()" class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors">
                    <i data-lucide="x" class="w-4 h-4"></i>
                </button>
            </div>

            <div class="p-5 space-y-3">
                <p class="text-[11px] text-gray-500 mb-2 leading-relaxed">چطور می‌خواهید نشانی خود را وارد کنید؟</p>

                <!-- Manual Entry Option -->
                <button onclick="window.AM_API.chooseManualEntry()" class="w-full bg-white border border-gray-200 hover:border-snapp hover:bg-snapp-light/30 rounded-2xl p-4 flex items-center gap-4 transition-all active:scale-[0.98] text-right group">
                    <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-100 to-snapp-light flex items-center justify-center text-snapp shrink-0 shadow-sm group-hover:scale-110 transition-transform">
                        <i data-lucide="pencil-line" class="w-6 h-6"></i>
                    </div>
                    <div class="flex-1 min-w-0">
                        <div class="font-black text-sm text-gray-900 mb-1">ورود دستی آدرس</div>
                        <div class="text-[11px] text-gray-500 leading-relaxed">استان، شهر، خیابان و پلاک را خودتان تایپ کنید</div>
                    </div>
                    <i data-lucide="chevron-left" class="w-5 h-5 text-gray-300 shrink-0"></i>
                </button>

                <!-- Map Option -->
                <button onclick="window.AM_API.chooseMapEntry()" class="w-full bg-white border border-gray-200 hover:border-snapp hover:bg-snapp-light/30 rounded-2xl p-4 flex items-center gap-4 transition-all active:scale-[0.98] text-right group">
                    <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-100 to-blue-50 flex items-center justify-center text-sky-600 shrink-0 shadow-sm group-hover:scale-110 transition-transform relative">
                        <i data-lucide="map-pin" class="w-6 h-6"></i>
                        <span class="absolute -top-1 -right-1 bg-emerald-500 text-white text-[8px] font-black px-1 py-0.5 rounded-full">جدید</span>
                    </div>
                    <div class="flex-1 min-w-0">
                        <div class="font-black text-sm text-gray-900 mb-1">انتخاب روی نقشه</div>
                        <div class="text-[11px] text-gray-500 leading-relaxed">موقعیت خود را روی نقشه مشخص کنید تا آدرس خودکار پر شود</div>
                    </div>
                    <i data-lucide="chevron-left" class="w-5 h-5 text-gray-300 shrink-0"></i>
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);
    if (window.lucide) lucide.createIcons();

    requestAnimationFrame(() => {
        overlay.classList.remove('opacity-0');
        overlay.querySelector('.am-content-panel').classList.remove('translate-y-full');
    });
}

/* ==========================================================================
 * STEP 2B: REAL MAP PICKER (Leaflet + OpenStreetMap)
 * ========================================================================== */
async function renderMapPicker() {
    // Reset only map data, keep mode
    const wasMode = newAddressCache.mode;
    newAddressCache = { mode: wasMode || 'map' };

    const overlay = document.createElement('div');
    overlay.id = 'am-overlay-step2';
    overlay.className = 'fixed inset-0 z-[10002] bg-gray-100 opacity-0 transition-opacity duration-300 font-vazir flex flex-col';
    overlay.innerHTML = `
        <!-- Top Header -->
        <div class="bg-white shadow-sm border-b border-gray-200 px-4 py-3 flex items-center gap-2 shrink-0 relative z-[1000]">
            <button onclick="window.AM_API.closeAll()" class="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 hover:bg-gray-200 active:scale-95 transition-all shrink-0">
                <i data-lucide="arrow-right" class="w-5 h-5"></i>
            </button>
            <div class="flex-1 min-w-0">
                <h3 class="font-black text-sm text-gray-900">انتخاب موقعیت روی نقشه</h3>
                <p class="text-[10px] text-gray-500 mt-0.5">نقشه را حرکت دهید تا پین روی موقعیت دلخواه قرار گیرد</p>
            </div>
        </div>

        <!-- Map Container -->
        <div class="flex-1 relative">
            <div id="am-leaflet-map" class="absolute inset-0" style="background: #e5e7eb;"></div>

            <!-- Centered Pin -->
            <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full pointer-events-none z-[500] flex flex-col items-center">
                <div class="bg-gray-900 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg shadow-xl mb-2 relative whitespace-nowrap">
                    مرسوله به این موقعیت ارسال می‌شود
                    <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                </div>
                <div style="filter: drop-shadow(0 10px 8px rgba(255,0,166,0.35));" class="animate-bounce">
                    <svg width="44" height="44" viewBox="0 0 24 24" fill="#FF00A6" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                        <circle cx="12" cy="10" r="3" fill="#fff"></circle>
                    </svg>
                </div>
            </div>

            <!-- Loading state -->
            <div id="am-map-loading" class="absolute inset-0 bg-gray-100 flex items-center justify-center z-[400]">
                <div class="flex flex-col items-center gap-3">
                    <div class="w-10 h-10 border-2 border-gray-300 border-t-snapp rounded-full" style="animation: spin 0.9s linear infinite;"></div>
                    <span class="text-xs font-bold text-gray-500">در حال بارگذاری نقشه...</span>
                </div>
            </div>

            <!-- GPS Button -->
            <button id="am-gps-btn" onclick="window.AM_API.panToGPS()" class="absolute bottom-4 right-4 w-12 h-12 rounded-full bg-white shadow-lg border border-gray-100 flex items-center justify-center text-gray-700 hover:text-snapp active:scale-95 transition-all z-[500]">
                <i data-lucide="navigation" class="w-5 h-5"></i>
            </button>
        </div>

        <!-- Bottom Confirm Panel -->
        <div class="bg-white rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] p-5 shrink-0 relative z-[1000]">
            <div class="flex items-start gap-3 mb-4 border-b border-gray-100 pb-4">
                <div class="w-9 h-9 rounded-full bg-snapp-light flex items-center justify-center text-snapp shrink-0 mt-0.5">
                    <i data-lucide="map-pin" class="w-4 h-4"></i>
                </div>
                <div class="flex-1 min-w-0">
                    <div class="text-[10px] font-bold text-gray-500 mb-1">موقعیت انتخاب شده:</div>
                    <p id="am-map-address-preview" class="text-[11px] font-bold text-gray-800 leading-relaxed line-clamp-3">
                        در حال یافتن آدرس...
                    </p>
                </div>
            </div>
            <button onclick="window.AM_API.confirmMapSelection()" class="w-full bg-snapp hover:bg-snapp-hover text-white font-black text-sm py-4 rounded-2xl shadow-lg shadow-pink-500/30 transition-all flex items-center justify-center gap-2 active:scale-95">
                <span>تایید موقعیت و ادامه</span>
                <i data-lucide="check-circle" class="w-5 h-5"></i>
            </button>
        </div>
    `;

    document.body.appendChild(overlay);
    if (window.lucide) lucide.createIcons();

    requestAnimationFrame(() => overlay.classList.remove('opacity-0'));

    // Initialize Leaflet
    try {
        const L = await loadLeaflet();

        // Default: Tehran, Saadatabad
        const defaultLat = 35.7860;
        const defaultLon = 51.3740;

        const mapContainer = document.getElementById('am-leaflet-map');
        if (!mapContainer) return;

        leafletMapInstance = L.map(mapContainer, {
            center: [defaultLat, defaultLon],
            zoom: 16,
            zoomControl: false,
            attributionControl: false
        });

        // Tile layer (OpenStreetMap)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap'
        }).addTo(leafletMapInstance);

        // Hide loading
        const loading = document.getElementById('am-map-loading');
        if (loading) loading.style.display = 'none';

        // Update on map move
        const onMoveEnd = () => {
            const center = leafletMapInstance.getCenter();
            window.AM_API.updateMapCenter(center.lat, center.lng);
        };

        leafletMapInstance.on('moveend', onMoveEnd);

        // Initial reverse geocode
        window.AM_API.updateMapCenter(defaultLat, defaultLon);

        // Ensure map renders properly
        setTimeout(() => {
            if (leafletMapInstance) leafletMapInstance.invalidateSize();
        }, 250);

    } catch (err) {
        console.error('[MapPicker] Leaflet failed:', err);
        const loading = document.getElementById('am-map-loading');
        if (loading) {
            loading.innerHTML = `
                <div class="flex flex-col items-center gap-3 px-6 text-center">
                    <div class="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center text-rose-500">
                        <i data-lucide="alert-circle" class="w-6 h-6"></i>
                    </div>
                    <span class="text-xs font-bold text-gray-700">بارگذاری نقشه ممکن نشد</span>
                    <span class="text-[10px] text-gray-500">لطفاً اتصال اینترنت خود را بررسی کنید یا از ورود دستی آدرس استفاده نمایید.</span>
                </div>
            `;
            if (window.lucide) lucide.createIcons();
        }
    }
}

/* ==========================================================================
 * STEP 2C: CONFIRM DETECTED LOCATION DIALOG
 * ========================================================================== */
function renderConfirmDialog() {
    const overlay = document.createElement('div');
    overlay.id = 'am-overlay-confirm';
    overlay.className = 'fixed inset-0 z-[10003] bg-black/60 flex items-center justify-center p-4 opacity-0 transition-opacity duration-300 font-vazir';

    const detected = newAddressCache.detectedText || 'موقعیت انتخابی روی نقشه';

    overlay.innerHTML = `
        <div class="am-content-panel bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl transform scale-95 transition-transform duration-300" style="opacity: 1; transform: none;">
            <div class="h-1.5 bg-gradient-to-l from-snapp via-pink-500 to-rose-500"></div>

            <div class="p-6 text-center">
                <div class="w-16 h-16 rounded-full bg-snapp-light flex items-center justify-center text-snapp mx-auto mb-4 shadow-inner">
                    <i data-lucide="map-pinned" class="w-8 h-8"></i>
                </div>

                <h3 class="font-black text-sm text-gray-900 mb-2">آیا این موقعیت صحیح است؟</h3>
                <p class="text-[11px] text-gray-500 leading-relaxed mb-5">آدرس تشخیص داده‌شده توسط سیستم را بررسی کنید. اگر درست است ادامه دهید، در غیر این صورت موقعیت را دوباره انتخاب کنید.</p>

                <div class="bg-gray-50 rounded-2xl p-3.5 border border-gray-100 text-right mb-5">
                    <div class="flex items-start gap-2">
                        <i data-lucide="navigation" class="w-4 h-4 text-gray-400 shrink-0 mt-0.5"></i>
                        <p class="text-[11px] font-bold text-gray-800 leading-relaxed">${detected}</p>
                    </div>
                </div>

                <div class="flex gap-3">
                    <button onclick="window.AM_API.rejectDetectedLocation()" class="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs py-3.5 rounded-2xl transition-colors active:scale-95 flex items-center justify-center gap-1.5">
                        <i data-lucide="rotate-ccw" class="w-3.5 h-3.5"></i>
                        دوباره انتخاب می‌کنم
                    </button>
                    <button onclick="window.AM_API.acceptDetectedLocation()" class="flex-1 bg-snapp hover:bg-snapp-hover text-white font-bold text-xs py-3.5 rounded-2xl shadow-md shadow-pink-500/25 active:scale-95 transition-all flex items-center justify-center gap-1.5">
                        <i data-lucide="check" class="w-3.5 h-3.5"></i>
                        بله، درسته
                    </button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);
    if (window.lucide) lucide.createIcons();

    requestAnimationFrame(() => overlay.classList.remove('opacity-0'));
}

/* ==========================================================================
 * STEP 3: ADDRESS DETAILS FORM
 * ========================================================================== */
function renderDetailsForm() {
    // Prefill from map detection if available
    const detectedText = newAddressCache.detectedText || '';
    // Trim the country prefix if it exists
    const cleanedDetected = detectedText
        .replace(/^ایران[،,\s]*/i, '')
        .replace(/^استان\s+تهران[،,\s]*/i, '')
        .trim();

    const prefillText = cleanedDetected || '';

    window.AM_API.setTag('خانه');

    const overlay = document.createElement('div');
    overlay.id = 'am-overlay-step3';
    overlay.className = 'fixed inset-0 z-[10004] bg-white opacity-0 transition-opacity duration-300 font-vazir overflow-y-auto pb-24';

    overlay.innerHTML = `
        <div class="max-w-md mx-auto min-h-screen relative">
            <!-- Header -->
            <div class="sticky top-0 z-40 bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100 flex items-center justify-between p-4">
                <div class="flex items-center gap-2">
                    <div class="w-2 h-5 bg-snapp rounded-full"></div>
                    <h2 class="font-black text-sm text-gray-900">جزئیات آدرس</h2>
                </div>
                <button onclick="window.AM_API.closeAll()" class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors">
                    <i data-lucide="arrow-right" class="w-4 h-4"></i>
                </button>
            </div>

            <div class="p-4 space-y-5">

                <!-- Province & City -->
                <div class="flex gap-3">
                    <div class="flex-1">
                        <label class="block text-[10px] font-bold text-gray-500 mb-1.5 px-1">استان</label>
                        <select class="w-full bg-gray-50 border border-gray-200 text-xs font-bold text-gray-800 rounded-xl px-3 py-3 focus:outline-none focus:border-snapp appearance-none">
                            <option value="تهران" selected>تهران</option>
                            <option value="البرز">البرز</option>
                            <option value="اصفهان">اصفهان</option>
                        </select>
                    </div>
                    <div class="flex-1">
                        <label class="block text-[10px] font-bold text-gray-500 mb-1.5 px-1">شهر</label>
                        <select class="w-full bg-gray-50 border border-gray-200 text-xs font-bold text-gray-800 rounded-xl px-3 py-3 focus:outline-none focus:border-snapp appearance-none">
                            <option value="تهران" selected>تهران</option>
                            <option value="پردیس">پردیس</option>
                            <option value="بومهن">بومهن</option>
                        </select>
                    </div>
                </div>

                <!-- Full Address -->
                <div>
                    <label class="block text-[10px] font-bold text-gray-500 mb-1.5 px-1 flex items-center justify-between">
                        <span>نشانی دقیق پستی</span>
                        ${detectedText ? '<span class="text-emerald-600 text-[9px] font-black flex items-center gap-0.5"><i data-lucide="wand-2" class="w-2.5 h-2.5"></i> تشخیص خودکار</span>' : ''}
                    </label>
                    <textarea id="am-address-text" rows="3" class="w-full bg-gray-50 border border-gray-200 text-xs font-bold text-gray-800 rounded-xl p-3 focus:outline-none focus:border-snapp resize-none leading-relaxed">${prefillText || 'محله سعادت‌آباد، خیابان سرو شرقی، کوچه مجد'}</textarea>
                </div>

                <!-- Pelak & Unit -->
                <div class="flex gap-3">
                    <div class="w-1/2">
                        <label class="block text-[10px] font-bold text-gray-500 mb-1.5 px-1">پلاک</label>
                        <input type="text" id="am-pelak" class="w-full bg-gray-50 border border-gray-200 text-sm font-black text-center text-gray-800 rounded-xl px-3 py-2.5 focus:outline-none focus:border-snapp" dir="ltr" placeholder="مثال: ۲۴">
                    </div>
                    <div class="w-1/2">
                        <label class="block text-[10px] font-bold text-gray-500 mb-1.5 px-1">واحد (اختیاری)</label>
                        <input type="text" id="am-unit" class="w-full bg-gray-50 border border-gray-200 text-sm font-black text-center text-gray-800 rounded-xl px-3 py-2.5 focus:outline-none focus:border-snapp" dir="ltr" placeholder="مثال: ۳">
                    </div>
                </div>

                <!-- Postal Code -->
                <div>
                    <label class="block text-[10px] font-bold text-gray-500 mb-1.5 px-1">کد پستی ۱۰ رقمی (اختیاری)</label>
                    <input type="text" id="am-postal" oninput="window.AM_API.validatePostal(this)" class="w-full bg-gray-50 border border-gray-200 text-sm font-mono tracking-widest text-center text-gray-800 rounded-xl px-3 py-2.5 focus:outline-none focus:border-snapp" dir="ltr" placeholder="----------" maxlength="10">
                </div>

                <!-- Divider -->
                <div class="h-px bg-gray-100 my-2"></div>

                <!-- Recipient Info -->
                <div>
                    <div class="flex items-center justify-between mb-4">
                        <label class="text-[11px] font-black text-gray-900">تحویل‌گیرنده سفارش</label>
                        <label class="flex items-center gap-2 cursor-pointer group">
                            <span class="text-[10px] font-bold text-gray-500 group-hover:text-snapp transition-colors">تحویل‌گیرنده خودم هستم</span>
                            <div class="relative flex items-center justify-center w-5 h-5">
                                <input type="checkbox" onchange="window.AM_API.toggleMeReceiver(this.checked)" class="peer appearance-none w-5 h-5 border-2 border-gray-300 rounded focus:outline-none checked:bg-snapp checked:border-snapp transition-colors cursor-pointer">
                                <i data-lucide="check" class="absolute w-3.5 h-3.5 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity"></i>
                            </div>
                        </label>
                    </div>

                    <div class="space-y-3">
                        <input type="text" id="am-receiver-name" placeholder="نام و نام خانوادگی تحویل‌گیرنده" class="w-full bg-gray-50 border border-gray-200 text-xs font-bold text-gray-800 rounded-xl px-3 py-3 focus:outline-none focus:border-snapp">
                        <input type="tel" id="am-receiver-phone" placeholder="شماره موبایل (مثال: ۰۹۱۲۳۴۵۶۷۸۹)" dir="ltr" class="w-full bg-gray-50 border border-gray-200 text-sm font-mono text-center text-gray-800 rounded-xl px-3 py-3 focus:outline-none focus:border-snapp" maxlength="11">
                    </div>
                </div>

                <!-- Address Tag -->
                <div>
                    <label class="block text-[11px] font-black text-gray-900 mb-3">برچسب آدرس</label>
                    <div class="flex gap-2">
                        <button id="am-tag-خانه" onclick="window.AM_API.setTag('خانه')" class="flex-1 bg-white border border-gray-200 text-gray-600 font-bold text-xs py-2 rounded-xl transition-all hover:bg-gray-50">
                            <i data-lucide="home" class="w-4 h-4 mx-auto mb-1 opacity-60"></i>خانه
                        </button>
                        <button id="am-tag-محل کار" onclick="window.AM_API.setTag('محل کار')" class="flex-1 bg-white border border-gray-200 text-gray-600 font-bold text-xs py-2 rounded-xl transition-all hover:bg-gray-50">
                            <i data-lucide="briefcase" class="w-4 h-4 mx-auto mb-1 opacity-60"></i>محل کار
                        </button>
                        <button id="am-tag-سایر" onclick="window.AM_API.setTag('سایر')" class="flex-1 bg-white border border-gray-200 text-gray-600 font-bold text-xs py-2 rounded-xl transition-all hover:bg-gray-50">
                            <i data-lucide="map-pin" class="w-4 h-4 mx-auto mb-1 opacity-60"></i>سایر
                        </button>
                    </div>
                </div>

            </div>

            <!-- Fixed Submit Footer -->
            <div class="fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 p-4 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] z-50">
                <button onclick="window.AM_API.submitForm()" class="w-full max-w-md mx-auto bg-snapp hover:bg-snapp-hover text-white font-black text-sm py-4 rounded-2xl shadow-lg shadow-pink-500/30 transition-all flex items-center justify-center gap-2 active:scale-95">
                    <span>ثبت و ارسال به این نشانی</span>
                    <i data-lucide="check-circle" class="w-5 h-5"></i>
                </button>
            </div>

        </div>
    `;

    document.body.appendChild(overlay);
    if (window.lucide) lucide.createIcons();

    // Trigger default tag styling
    window.AM_API.setTag('خانه');

    requestAnimationFrame(() => {
        overlay.classList.remove('opacity-0');
    });
}