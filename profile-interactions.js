/* ==========================================================================
 * profile-interactions.js
 * --------------------------------------------------------------------------
 * Complete Interactive System for the User Profile ("حساب من") Screen.
 * Implements Edit Profile, Loghme Pro VIP, 1-Click Pay, Wallet & Top-Up,
 * Loghme Club Lucky Wheel, Vouchers, Referral System, and AI Chat Support.
 * ========================================================================== */

// --- Global State ---
let userProfile = {
    name: 'سید ارمیا مفیدی',
    phone: '۰۹۳۹۱۷۷۸۱۴۴',
    email: 'ermia.mofidi@gmail.com',
    birthYear: '۱۳۸۰',
    birthMonth: '۰۳',
    birthDay: '۲۲',
    walletBalance: 1250000,
    clubPoints: 3450,
    proAutoRenew: true,
    oneClickEnabled: false,
    oneClickLimit: 500000,
    oneClickCard: 'بانک سامان (۶۲۱۹۸۶****۱۱۰۹)'
};

const userVouchers = [
    { code: 'SNAPP30', title: '۳۰٪ تخفیف سوپرمارکت و فست‌فود', desc: 'حداکثر تخفیف ۵۰,۰۰۰ تومان بدون محدودیت سفارش اول', minOrder: 150000, expire: '۵ روز مانده' },
    { code: 'PROFREE', title: 'ارسال کاملاً رایگان لقمه پرو', desc: 'ارسال اکسپرس رایگان برای تمامی رستوران‌های شهر', minOrder: 0, expire: '۹۳ روز مانده' },
    { code: 'BURGER50', title: '۵۰,۰۰۰ تومان تخفیف برگر ویژه', desc: 'مخصوص سفارش انواع برگر و ساندویچ بالای ۲۵۰ هزار تومان', minOrder: 250000, expire: '۱۲ روز مانده' }
];

const walletTransactions = [
    { id: 'TX-98214', title: 'سفارش کباب‌سرای توسکا (#۸۸۴۹۲۰۱)', date: '۲۷ شهریور ۱۴۰۵ · ۲۰:۱۹', amount: -450000, type: 'payment' },
    { id: 'TX-97812', title: 'شارژ آنلاین کیف پول از درگاه سامان', date: '۲۵ شهریور ۱۴۰۵ · ۱۶:۱۰', amount: 500000, type: 'deposit' },
    { id: 'TX-96540', title: 'پاداش دعوت از دوستان (کاربر جدید)', date: '۱۸ شهریور ۱۴۰۵ · ۱۱:۴۵', amount: 100000, type: 'deposit' },
    { id: 'TX-95123', title: 'سفارش پیتزا ساندویچ ارم (#۷۷۳۸۱۹۲)', date: '۲ شهریور ۱۴۰۵ · ۱۳:۴۵', amount: -297000, type: 'payment' },
    { id: 'TX-94109', title: 'سفارش فست‌فود ژوبین (#۶۶۲۷۳۸۱)', date: '۱ شهریور ۱۴۰۵ · ۱۸:۳۰', amount: -611000, type: 'payment' }
];

// --- Helpers ---
function toPersianDigits(n) {
    if (n === null || n === undefined) return '';
    const farsiDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    return n.toString().replace(/\d/g, x => farsiDigits[x]);
}

function formatPrice(amount) {
    return toPersianDigits(Math.round(amount).toLocaleString('fa-IR'));
}

function showToast(message) {
    const existing = document.getElementById('pi-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'pi-toast';
    toast.className = 'fixed top-4 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-5 py-3 rounded-xl text-xs font-bold shadow-2xl z-[10010] transition-all duration-300 transform -translate-y-10 opacity-0 flex items-center gap-2 w-max max-w-[90vw]';
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

function createModalContainer(id) {
    const existing = document.getElementById(id);
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = id;
    modal.className = 'fixed inset-0 z-[10000] bg-black/60 flex items-center justify-center p-4 opacity-0 transition-opacity duration-300 font-vazir backdrop-blur-sm';
    return modal;
}

function closeModal(modalId, contentId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('opacity-0');
        const content = document.getElementById(contentId);
        if (content) content.classList.add('scale-95');
        setTimeout(() => modal.remove(), 300);
    }
}

// --- Wheel Animation State ---
let isSpinning = false;
let wheelRotation = 0;

/* ==========================================================================
 * EXPOSED GLOBAL API
 * ========================================================================== */
window.PI_API = {

    /* ---------------------------------------------------------------------
     * 1. EDIT PROFILE MODAL
     * --------------------------------------------------------------------- */
    openEditProfile: function() {
        const modal = createModalContainer('pi-edit-profile-modal');
        modal.innerHTML = `
            <div id="pi-edit-profile-content" class="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl transform scale-95 transition-transform duration-300">
                <div class="h-1.5 bg-gradient-to-l from-snapp via-pink-500 to-rose-500"></div>
                <div class="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                    <h3 class="font-black text-sm text-gray-900">ویرایش اطلاعات کاربری</h3>
                    <button onclick="window.PI_API.closeModal('pi-edit-profile-modal', 'pi-edit-profile-content')" class="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-100">
                        <i data-lucide="x" class="w-4 h-4"></i>
                    </button>
                </div>
                <div class="p-5 space-y-4">
                    <div>
                        <label class="text-[11px] font-bold text-gray-600 mb-1.5 block">نام و نام خانوادگی</label>
                        <input type="text" id="pi-name-input" value="${userProfile.name}" class="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-bold text-gray-800 focus:outline-none focus:border-snapp focus:bg-white transition-colors">
                    </div>
                    <div>
                        <label class="text-[11px] font-bold text-gray-600 mb-1.5 block">شماره تلفن همراه</label>
                        <div class="relative">
                            <input type="text" value="${userProfile.phone}" disabled class="w-full bg-gray-100 border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-mono text-gray-500 text-left pl-8 cursor-not-allowed">
                            <span class="absolute left-2.5 top-1/2 -translate-y-1/2 text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded text-[9px] font-bold">تایید شده</span>
                        </div>
                    </div>
                    <div>
                        <label class="text-[11px] font-bold text-gray-600 mb-1.5 block">آدرس ایمیل</label>
                        <input type="email" id="pi-email-input" value="${userProfile.email}" dir="ltr" class="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-medium text-gray-800 text-left focus:outline-none focus:border-snapp focus:bg-white transition-colors">
                    </div>
                    <div>
                        <label class="text-[11px] font-bold text-gray-600 mb-1.5 block">تاریخ تولد (روز / ماه / سال)</label>
                        <div class="flex gap-2" dir="ltr">
                            <input type="text" id="pi-birth-year" value="${userProfile.birthYear}" placeholder="سال" class="w-1/2 bg-gray-50 border border-gray-200 rounded-xl py-2 text-center text-xs font-bold focus:border-snapp outline-none">
                            <input type="text" id="pi-birth-month" value="${userProfile.birthMonth}" placeholder="ماه" class="w-1/4 bg-gray-50 border border-gray-200 rounded-xl py-2 text-center text-xs font-bold focus:border-snapp outline-none">
                            <input type="text" id="pi-birth-day" value="${userProfile.birthDay}" placeholder="روز" class="w-1/4 bg-gray-50 border border-gray-200 rounded-xl py-2 text-center text-xs font-bold focus:border-snapp outline-none">
                        </div>
                    </div>
                </div>
                <div class="p-4 bg-gray-50 border-t border-gray-100 flex gap-2">
                    <button onclick="window.PI_API.closeModal('pi-edit-profile-modal', 'pi-edit-profile-content')" class="flex-1 py-3 rounded-xl bg-white border border-gray-200 text-gray-700 font-bold text-xs hover:bg-gray-100">انصراف</button>
                    <button onclick="window.PI_API.saveProfile()" class="flex-1 py-3 rounded-xl bg-snapp text-white font-bold text-xs hover:bg-snapp-hover shadow-lg shadow-pink-500/20 active:scale-95 transition-all">ذخیره تغییرات</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        if (window.lucide) lucide.createIcons();

        requestAnimationFrame(() => {
            modal.classList.remove('opacity-0');
            document.getElementById('pi-edit-profile-content').classList.remove('scale-95');
        });
    },

    saveProfile: function() {
        const name = document.getElementById('pi-name-input').value.trim();
        const email = document.getElementById('pi-email-input').value.trim();
        const year = document.getElementById('pi-birth-year').value.trim();
        const month = document.getElementById('pi-birth-month').value.trim();
        const day = document.getElementById('pi-birth-day').value.trim();

        if (!name || !email) {
            alert('لطفاً نام و آدرس ایمیل را به درستی وارد کنید.');
            return;
        }

        userProfile.name = name;
        userProfile.email = email;
        userProfile.birthYear = year;
        userProfile.birthMonth = month;
        userProfile.birthDay = day;

        const headerName = document.querySelector('.profile-user-name');
        if (headerName) headerName.textContent = name;

        window.PI_API.closeModal('pi-edit-profile-modal', 'pi-edit-profile-content');
        showToast('اطلاعات کاربری با موفقیت به‌روزرسانی شد.');
    },

    /* ---------------------------------------------------------------------
     * 2. LOGHME PRO VIP DETAILS MODAL
     * --------------------------------------------------------------------- */
    openProDetails: function() {
        const modal = createModalContainer('pi-pro-modal');
        modal.innerHTML = `
            <div id="pi-pro-content" class="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl transform scale-95 transition-transform duration-300">
                <div class="p-5 bg-gradient-to-r from-purple-800 to-indigo-900 text-white relative">
                    <button onclick="window.PI_API.closeModal('pi-pro-modal', 'pi-pro-content')" class="absolute top-4 left-4 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30">
                        <i data-lucide="x" class="w-4 h-4"></i>
                    </button>
                    <div class="flex items-center gap-2 mb-2">
                        <span class="bg-amber-400 text-purple-950 text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider flex items-center gap-1"><i data-lucide="crown" class="w-2.5 h-2.5"></i>Pro VIP</span>
                        <span class="text-xs font-bold text-indigo-100">اشتراک ویژه فعال</span>
                    </div>
                    <h3 class="font-black text-lg">باشگاه اعضای لقمه پرو</h3>
                    <p class="text-[11px] text-indigo-200 mt-1">${toPersianDigits(93)} روز مانده تا انقضای اشتراک دوره جاری</p>
                </div>
                <div class="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
                    <h4 class="font-black text-xs text-gray-900">مزایای اختصاصی شما:</h4>
                    <div class="space-y-2.5 text-xs text-gray-700">
                        <div class="flex items-start gap-2.5 p-2 rounded-xl bg-purple-50/60 border border-purple-100/60">
                            <i data-lucide="truck" class="w-4 h-4 text-purple-700 shrink-0 mt-0.5"></i>
                            <span>ارسال اکسپرس کاملاً رایگان برای تمام سفارش‌های بالای ۱۵۰ هزار تومان</span>
                        </div>
                        <div class="flex items-start gap-2.5 p-2 rounded-xl bg-purple-50/60 border border-purple-100/60">
                            <i data-lucide="badge-percent" class="w-4 h-4 text-purple-700 shrink-0 mt-0.5"></i>
                            <span>۵٪ تخفیف مازاد هفتگی در روزهای دوشنبه پرو</span>
                        </div>
                        <div class="flex items-start gap-2.5 p-2 rounded-xl bg-purple-50/60 border border-purple-100/60">
                            <i data-lucide="phone-call" class="w-4 h-4 text-purple-700 shrink-0 mt-0.5"></i>
                            <span>خط تلفن پشتیبانی VIP بدون نیاز به ماندن در صف انتظار</span>
                        </div>
                    </div>
                    <div class="border-t border-gray-100 pt-3">
                        <h4 class="font-black text-xs text-gray-900 mb-2">گزارش مالی صرفه‌جویی پرو:</h4>
                        <div class="bg-gray-50 rounded-2xl p-3 text-xs space-y-2 border border-gray-100">
                            <div class="flex justify-between text-gray-600">
                                <span>سود تخفیف ارسال رایگان:</span>
                                <span class="font-bold text-gray-900">${formatPrice(2450000)} تومان</span>
                            </div>
                            <div class="flex justify-between text-gray-600">
                                <span>تخفیف‌های هفتگی پرو:</span>
                                <span class="font-bold text-gray-900">${formatPrice(750941)} تومان</span>
                            </div>
                            <div class="flex justify-between text-snapp font-black pt-1 border-t border-gray-200">
                                <span>مجموع صرفه‌جویی کل:</span>
                                <span>${formatPrice(3200941)} تومان 🎉</span>
                            </div>
                        </div>
                    </div>
                    <div class="flex items-center justify-between p-3 rounded-2xl border border-gray-200">
                        <div>
                            <div class="text-xs font-bold text-gray-800">تمدید خودکار اشتراک</div>
                            <div class="text-[10px] text-gray-400">کسر خودکار از کیف پول در زمان تمدید</div>
                        </div>
                        <button onclick="window.PI_API.toggleProAutoRenew(this)" class="w-11 h-6 bg-snapp rounded-full p-1 transition-colors relative flex items-center">
                            <div id="pi-pro-toggle-knob" class="w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${userProfile.proAutoRenew ? 'translate-x-0' : '-translate-x-5'}"></div>
                        </button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        if (window.lucide) lucide.createIcons();

        requestAnimationFrame(() => {
            modal.classList.remove('opacity-0');
            document.getElementById('pi-pro-content').classList.remove('scale-95');
        });
    },

    toggleProAutoRenew: function(btn) {
        userProfile.proAutoRenew = !userProfile.proAutoRenew;
        const knob = document.getElementById('pi-pro-toggle-knob');
        if (userProfile.proAutoRenew) {
            btn.className = 'w-11 h-6 bg-snapp rounded-full p-1 transition-colors relative flex items-center';
            knob.className = 'w-4 h-4 bg-white rounded-full shadow-md transform transition-transform translate-x-0';
            showToast('تمدید خودکار پرو فعال شد.');
        } else {
            btn.className = 'w-11 h-6 bg-gray-300 rounded-full p-1 transition-colors relative flex items-center';
            knob.className = 'w-4 h-4 bg-white rounded-full shadow-md transform transition-transform -translate-x-5';
            showToast('تمدید خودکار پرو غیرفعال گردید.');
        }
    },

    /* ---------------------------------------------------------------------
     * 3. QUICK 1-CLICK PAY MODAL
     * --------------------------------------------------------------------- */
    openOneClickPay: function() {
        const modal = createModalContainer('pi-oneclick-modal');
        modal.innerHTML = `
            <div id="pi-oneclick-content" class="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl transform scale-95 transition-transform duration-300">
                <div class="h-1.5 bg-gradient-to-l from-snapp via-pink-500 to-rose-500"></div>
                <div class="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                    <h3 class="font-black text-sm text-gray-900">پرداخت سریع (با یک کلیک)</h3>
                    <button onclick="window.PI_API.closeModal('pi-oneclick-modal', 'pi-oneclick-content')" class="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-100">
                        <i data-lucide="x" class="w-4 h-4"></i>
                    </button>
                </div>
                <div class="p-5 space-y-4">
                    <div class="flex items-center justify-between p-3.5 bg-gray-50 rounded-2xl border border-gray-200">
                        <div>
                            <div class="text-xs font-bold text-gray-900">فعال‌سازی پرداخت با یک کلیک</div>
                            <div class="text-[10px] text-gray-500 mt-0.5">تسویه بدون معطلی و دریافت رمز دوم</div>
                        </div>
                        <button onclick="window.PI_API.toggleOneClick(this)" class="w-11 h-6 ${userProfile.oneClickEnabled ? 'bg-snapp' : 'bg-gray-300'} rounded-full p-1 transition-colors relative flex items-center">
                            <div id="pi-oneclick-knob" class="w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${userProfile.oneClickEnabled ? 'translate-x-0' : '-translate-x-5'}"></div>
                        </button>
                    </div>
                    <div>
                        <div class="flex justify-between items-center mb-1.5">
                            <label class="text-[11px] font-bold text-gray-700">سقف مجاز تراکنش روزانه بدون رمز:</label>
                            <span id="pi-limit-val" class="font-black text-xs text-snapp">${formatPrice(userProfile.oneClickLimit)} تومان</span>
                        </div>
                        <input type="range" min="100000" max="1000000" step="50000" value="${userProfile.oneClickLimit}" oninput="window.PI_API.updateLimitSlider(this.value)" class="w-full accent-snapp">
                    </div>
                    <div>
                        <label class="text-[11px] font-bold text-gray-700 mb-1.5 block">کارت پیش‌فرض اتصال به سرویس:</label>
                        <select class="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs font-bold text-gray-800 focus:outline-none focus:border-snapp">
                            <option selected>بانک سامان (۶۲۱۹۸۶****۱۱۰۹)</option>
                            <option>بانک ملی ایران (۶۰۳۷۹۹****۴۸۲۱)</option>
                        </select>
                    </div>
                    <div class="text-[10px] text-gray-500 bg-amber-50 border border-amber-200 p-3 rounded-xl leading-relaxed">
                        <i data-lucide="shield" class="w-3.5 h-3.5 inline-block text-amber-600 ml-1"></i>
                        تمامی تراکنش‌های زیر سقف تعیین شده با استاندارد رمزنگاری امن شاپرک و بدون نیاز به ورود OTP انجام می‌شوند.
                    </div>
                </div>
                <div class="p-4 bg-gray-50 border-t border-gray-100 flex gap-2">
                    <button onclick="window.PI_API.saveOneClick()" class="w-full py-3.5 rounded-xl bg-snapp text-white font-bold text-xs hover:bg-snapp-hover shadow-lg shadow-pink-500/20 active:scale-95 transition-all">
                        تایید و ذخیره تنظیمات
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        if (window.lucide) lucide.createIcons();

        requestAnimationFrame(() => {
            modal.classList.remove('opacity-0');
            document.getElementById('pi-oneclick-content').classList.remove('scale-95');
        });
    },

    toggleOneClick: function(btn) {
        userProfile.oneClickEnabled = !userProfile.oneClickEnabled;
        const knob = document.getElementById('pi-oneclick-knob');
        if (userProfile.oneClickEnabled) {
            btn.className = 'w-11 h-6 bg-snapp rounded-full p-1 transition-colors relative flex items-center';
            knob.className = 'w-4 h-4 bg-white rounded-full shadow-md transform transition-transform translate-x-0';
        } else {
            btn.className = 'w-11 h-6 bg-gray-300 rounded-full p-1 transition-colors relative flex items-center';
            knob.className = 'w-4 h-4 bg-white rounded-full shadow-md transform transition-transform -translate-x-5';
        }
    },

    updateLimitSlider: function(val) {
        userProfile.oneClickLimit = parseInt(val, 10);
        const label = document.getElementById('pi-limit-val');
        if (label) label.textContent = `${formatPrice(val)} تومان`;
    },

    saveOneClick: function() {
        window.PI_API.closeModal('pi-oneclick-modal', 'pi-oneclick-content');
        showToast(userProfile.oneClickEnabled ? 'پرداخت سریع با سقف انتخابی فعال شد.' : 'پرداخت سریع غیرفعال گردید.');
    },

    /* ---------------------------------------------------------------------
     * 4. WALLET & TRANSACTIONS MODAL
     * --------------------------------------------------------------------- */
    openWallet: function() {
        const modal = createModalContainer('pi-wallet-modal');
        modal.innerHTML = `
            <div id="pi-wallet-content" class="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl transform scale-95 transition-transform duration-300 max-h-[85vh] flex flex-col">
                <div class="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center shrink-0">
                    <h3 class="font-black text-sm text-gray-900">تراکنش‌ها و کیف پول</h3>
                    <button onclick="window.PI_API.closeModal('pi-wallet-modal', 'pi-wallet-content')" class="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-100">
                        <i data-lucide="x" class="w-4 h-4"></i>
                    </button>
                </div>

                <div class="p-5 overflow-y-auto flex-1 space-y-4">
                    <!-- Balance Card -->
                    <div class="p-5 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-800 text-white shadow-lg shadow-teal-700/20 relative overflow-hidden">
                        <div class="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
                        <div class="absolute -left-6 -bottom-6 w-24 h-24 bg-emerald-300/20 rounded-full blur-2xl pointer-events-none"></div>
                        <div class="flex justify-between items-center mb-3 relative z-10">
                            <span class="text-xs text-emerald-100">موجودی کیف پول</span>
                            <div class="w-9 h-9 rounded-xl bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                                <i data-lucide="wallet" class="w-4 h-4 text-emerald-50"></i>
                            </div>
                        </div>
                        <div class="font-black text-2xl mb-4 tracking-tight relative z-10" id="pi-wallet-balance-num">
                            ${formatPrice(userProfile.walletBalance)} <span class="text-xs font-normal text-emerald-100">تومان</span>
                        </div>
                        <button onclick="window.PI_API.toggleTopupSheet(true)" class="w-full bg-white text-emerald-800 font-black text-xs py-2.5 rounded-xl hover:bg-emerald-50 active:scale-95 transition-all shadow-md flex items-center justify-center gap-1.5 relative z-10">
                            <i data-lucide="plus" class="w-4 h-4"></i> افزایش موجودی آنلاین
                        </button>
                    </div>

                    <!-- Top-up Sheet Drawer -->
                    <div id="pi-topup-sheet" class="hidden p-4 rounded-2xl border border-gray-200 bg-gray-50 space-y-3">
                        <div class="text-xs font-bold text-gray-800">مبلغ شارژ را انتخاب یا وارد کنید:</div>
                        <div class="grid grid-cols-2 gap-2">
                            ${[50000, 100000, 200000, 500000].map(amt => `
                                <button onclick="window.PI_API.selectTopupAmount(${amt})" class="py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:border-snapp hover:text-snapp transition-colors">
                                    + ${formatPrice(amt)} تومان
                                </button>
                            `).join('')}
                        </div>
                        <input type="number" id="pi-custom-topup" placeholder="مبلغ دلخواه به تومان" class="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-snapp text-left" dir="ltr">
                        <button onclick="window.PI_API.executeTopup()" class="w-full py-2.5 bg-snapp text-white font-bold text-xs rounded-xl hover:bg-snapp-hover active:scale-95 transition-all shadow-md shadow-pink-500/20">
                            انتقال به درگاه شاپرک
                        </button>
                    </div>

                    <!-- Ledger Tabs -->
                    <div>
                        <div class="flex gap-2 border-b border-gray-100 pb-2 mb-3">
                            <button onclick="window.PI_API.filterTransactions('all', this)" class="pi-tx-tab text-xs font-black text-snapp pb-1 border-b-2 border-snapp">همه</button>
                            <button onclick="window.PI_API.filterTransactions('deposit', this)" class="pi-tx-tab text-xs font-bold text-gray-400 pb-1 hover:text-gray-600">واریزها</button>
                            <button onclick="window.PI_API.filterTransactions('payment', this)" class="pi-tx-tab text-xs font-bold text-gray-400 pb-1 hover:text-gray-600">پرداخت‌ها</button>
                        </div>
                        <div id="pi-tx-list" class="space-y-2.5">
                            ${window.PI_API.renderTxRows('all')}
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        if (window.lucide) lucide.createIcons();

        requestAnimationFrame(() => {
            modal.classList.remove('opacity-0');
            document.getElementById('pi-wallet-content').classList.remove('scale-95');
        });
    },

    toggleTopupSheet: function(show) {
        const sheet = document.getElementById('pi-topup-sheet');
        if (sheet) sheet.classList.toggle('hidden', !show);
    },

    selectTopupAmount: function(amt) {
        const input = document.getElementById('pi-custom-topup');
        if (input) input.value = amt;
    },

    executeTopup: function() {
        const val = parseInt(document.getElementById('pi-custom-topup').value, 10);
        if (!val || val < 10000) {
            alert('حداقل مبلغ شارژ ۱۰,۰۰۰ تومان می‌باشد.');
            return;
        }

        userProfile.walletBalance += val;
        walletTransactions.unshift({
            id: `TX-${Math.floor(10000 + Math.random() * 90000)}`,
            title: 'شارژ آنلاین کیف پول از درگاه شاپرک',
            date: 'هم‌اکنون',
            amount: val,
            type: 'deposit'
        });

        const num = document.getElementById('pi-wallet-balance-num');
        if (num) num.innerHTML = `${formatPrice(userProfile.walletBalance)} <span class="text-xs font-normal text-emerald-100">تومان</span>`;

        const txList = document.getElementById('pi-tx-list');
        if (txList) txList.innerHTML = window.PI_API.renderTxRows('all');

        window.PI_API.toggleTopupSheet(false);
        showToast(`مبلغ ${formatPrice(val)} تومان با موفقیت به کیف پول اضافه شد.`);
    },

    filterTransactions: function(type, tabBtn) {
        document.querySelectorAll('.pi-tx-tab').forEach(b => {
            b.className = 'pi-tx-tab text-xs font-bold text-gray-400 pb-1 hover:text-gray-600';
        });
        tabBtn.className = 'pi-tx-tab text-xs font-black text-snapp pb-1 border-b-2 border-snapp';
        const txList = document.getElementById('pi-tx-list');
        if (txList) txList.innerHTML = window.PI_API.renderTxRows(type);
    },

    renderTxRows: function(type) {
        const list = type === 'all' ? walletTransactions : walletTransactions.filter(t => t.type === type);
        if (list.length === 0) {
            return `
                <div class="text-center py-8">
                    <div class="w-12 h-12 mx-auto mb-2 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
                        <i data-lucide="receipt" class="w-5 h-5"></i>
                    </div>
                    <p class="text-xs text-gray-400 font-bold">تراکنشی یافت نشد.</p>
                </div>
            `;
        }

        return list.map(t => `
            <div class="p-3 bg-gray-50 rounded-2xl border border-gray-100 flex justify-between items-center hover:border-gray-200 transition-colors">
                <div class="min-w-0 flex-1">
                    <div class="font-bold text-xs text-gray-800 truncate">${t.title}</div>
                    <div class="text-[10px] text-gray-400 mt-0.5">${t.date}</div>
                </div>
                <div class="font-black text-xs ${t.amount > 0 ? 'text-emerald-600' : 'text-rose-600'} shrink-0 mr-2">
                    ${t.amount > 0 ? '+' : ''}${formatPrice(t.amount)} تومان
                </div>
            </div>
        `).join('');
    },

    /* ---------------------------------------------------------------------
     * 5. LOGHME CLUB & LUCKY WHEEL MODAL
     * --------------------------------------------------------------------- */
    openClub: function() {
        const modal = createModalContainer('pi-club-modal');
        modal.innerHTML = `
            <div id="pi-club-content" class="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl transform scale-95 transition-transform duration-300 max-h-[85vh] flex flex-col">
                <div class="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center shrink-0">
                    <div class="flex items-center gap-1.5">
                        <span class="text-amber-500 font-black text-base">★</span>
                        <h3 class="font-black text-sm text-gray-900">لقمه! کلاب</h3>
                    </div>
                    <button onclick="window.PI_API.closeModal('pi-club-modal', 'pi-club-content')" class="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-100">
                        <i data-lucide="x" class="w-4 h-4"></i>
                    </button>
                </div>

                <div class="p-5 overflow-y-auto flex-1 space-y-5 text-center">
                    <!-- Points Banner -->
                    <div class="p-4 bg-amber-50 rounded-2xl border border-amber-200 flex justify-between items-center">
                        <div class="text-right">
                            <span class="text-[10px] text-amber-800 font-bold block">امتیاز کلاب شما:</span>
                            <span id="pi-club-pts" class="font-black text-lg text-amber-700">${toPersianDigits(userProfile.clubPoints)} امتیاز</span>
                        </div>
                        <div class="w-10 h-10 rounded-full bg-gradient-to-br from-amber-300 to-amber-500 flex items-center justify-center text-white shadow-md">
                            <i data-lucide="sparkles" class="w-5 h-5"></i>
                        </div>
                    </div>

                    <!-- Lucky Wheel -->
                    <div>
                        <h4 class="font-black text-xs text-gray-900 mb-2">گردونه جوایز شانس</h4>
                        <div class="relative w-56 h-56 mx-auto my-3 flex items-center justify-center">
                            <div class="absolute -top-3 z-20 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[16px] border-t-snapp drop-shadow-md"></div>
                            <div id="pi-lucky-wheel" class="w-52 h-52 rounded-full border-4 border-amber-400 relative overflow-hidden shadow-xl transition-transform duration-[3500ms] ease-out" style="background: conic-gradient(#f43f5e 0deg 60deg, #3b82f6 60deg 120deg, #10b981 120deg 180deg, #f59e0b 180deg 240deg, #8b5cf6 240deg 300deg, #64748b 300deg 360deg);">
                                <div class="absolute inset-0 flex items-center justify-center text-white font-black text-[9px]">
                                    <span class="absolute top-4">۴۰٪ تخفیف</span>
                                    <span class="absolute bottom-4">ارسال رایگان</span>
                                    <span class="absolute right-3">۵۰K شارژ</span>
                                    <span class="absolute left-3">پوچ</span>
                                </div>
                            </div>
                            <button id="pi-spin-btn" onclick="window.PI_API.spinWheel()" class="absolute w-14 h-14 rounded-full bg-white shadow-2xl border-2 border-snapp font-black text-snapp text-[10px] flex items-center justify-center z-10 active:scale-90 transition-transform">
                                چرخش
                            </button>
                        </div>
                        <span class="text-[10px] text-gray-400">هزینه هر چرخش: ۵۰ امتیاز</span>
                    </div>

                    <!-- Club Rewards -->
                    <div class="text-right border-t border-gray-100 pt-4 space-y-2">
                        <h4 class="font-black text-xs text-gray-900 mb-2">کدهای جایزه قابل دریافت:</h4>
                        <div class="p-3 bg-gray-50 rounded-xl border border-gray-100 flex justify-between items-center">
                            <div>
                                <div class="font-bold text-xs text-gray-800">تخفیف ۳۵,۰۰۰ تومانی رستوران</div>
                                <div class="text-[10px] text-amber-600 font-bold mt-0.5">۳۰۰ امتیاز</div>
                            </div>
                            <button onclick="window.PI_API.redeemReward(300, 'کد تخفیف ۳۵ هزار تومانی')" class="bg-snapp text-white text-[10px] font-bold px-3 py-1.5 rounded-lg active:scale-95 shadow-sm">دریافت</button>
                        </div>
                        <div class="p-3 bg-gray-50 rounded-xl border border-gray-100 flex justify-between items-center">
                            <div>
                                <div class="font-bold text-xs text-gray-800">تخفیف ۵۰,۰۰۰ تومانی سوپرمارکت</div>
                                <div class="text-[10px] text-amber-600 font-bold mt-0.5">۵۰۰ امتیاز</div>
                            </div>
                            <button onclick="window.PI_API.redeemReward(500, 'کد تخفیف ۵۰ هزار تومانی')" class="bg-snapp text-white text-[10px] font-bold px-3 py-1.5 rounded-lg active:scale-95 shadow-sm">دریافت</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        if (window.lucide) lucide.createIcons();

        requestAnimationFrame(() => {
            modal.classList.remove('opacity-0');
            document.getElementById('pi-club-content').classList.remove('scale-95');
        });
    },

    spinWheel: function() {
        if (isSpinning) return;
        if (userProfile.clubPoints < 50) {
            alert('امتیاز کافی برای چرخش گردونه ندارید.');
            return;
        }

        userProfile.clubPoints -= 50;
        document.getElementById('pi-club-pts').textContent = `${toPersianDigits(userProfile.clubPoints)} امتیاز`;

        isSpinning = true;
        const wheel = document.getElementById('pi-lucky-wheel');
        const randomSpins = 5 + Math.floor(Math.random() * 4);
        const randomDegree = Math.floor(Math.random() * 360);
        wheelRotation += randomSpins * 360 + randomDegree;

        wheel.style.transform = `rotate(${wheelRotation}deg)`;

        setTimeout(() => {
            isSpinning = false;
            showToast('تبریک! برنده کد تخفیف ۴۰٪ شدید که به جوایز شما اضافه شد.');
        }, 3600);
    },

    redeemReward: function(cost, rewardTitle) {
        if (userProfile.clubPoints < cost) {
            alert('امتیاز کلاب شما برای دریافت این جایزه کافی نیست.');
            return;
        }

        userProfile.clubPoints -= cost;
        document.getElementById('pi-club-pts').textContent = `${toPersianDigits(userProfile.clubPoints)} امتیاز`;
        showToast(`«${rewardTitle}» با موفقیت دریافت و در حساب شما ثبت شد.`);
    },

    /* ---------------------------------------------------------------------
     * 6. VOUCHERS & DISCOUNTS MODAL
     * --------------------------------------------------------------------- */
    openVouchers: function() {
        const modal = createModalContainer('pi-vouchers-modal');
        modal.innerHTML = `
            <div id="pi-vouchers-content" class="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl transform scale-95 transition-transform duration-300 max-h-[80vh] flex flex-col">
                <div class="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center shrink-0">
                    <h3 class="font-black text-sm text-gray-900">تخفیف‌ها و جایزه‌ها</h3>
                    <button onclick="window.PI_API.closeModal('pi-vouchers-modal', 'pi-vouchers-content')" class="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-100">
                        <i data-lucide="x" class="w-4 h-4"></i>
                    </button>
                </div>
                <div class="p-5 space-y-3 overflow-y-auto flex-1">
                    ${userVouchers.map(v => `
                        <div class="p-4 rounded-2xl border border-gray-200 bg-gray-50/50 space-y-2 hover:border-snapp transition-colors">
                            <div class="flex justify-between items-center">
                                <span class="font-black text-xs text-gray-900">${v.title}</span>
                                <span class="text-[10px] text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded-md">${v.expire}</span>
                            </div>
                            <p class="text-[11px] text-gray-500 leading-relaxed">${v.desc}</p>
                            <div class="flex justify-between items-center pt-2 border-t border-gray-200/60">
                                <span class="font-mono font-bold text-xs bg-white border border-dashed border-gray-300 px-3 py-1 rounded-lg select-all" dir="ltr">${v.code}</span>
                                <div class="flex gap-2">
                                    <button onclick="window.PI_API.copyVoucher('${v.code}')" class="text-xs bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1 rounded-lg font-bold transition-colors">کپی</button>
                                    <button onclick="window.PI_API.applyVoucherDirectly('${v.code}')" class="text-xs bg-snapp text-white px-3 py-1 rounded-lg font-bold hover:bg-snapp-hover active:scale-95 transition-all shadow-sm">اعمال</button>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        if (window.lucide) lucide.createIcons();

        requestAnimationFrame(() => {
            modal.classList.remove('opacity-0');
            document.getElementById('pi-vouchers-content').classList.remove('scale-95');
        });
    },

    copyVoucher: function(code) {
        navigator.clipboard.writeText(code);
        showToast(`کد «${code}» با موفقیت در کلیپ‌بورد کپی شد.`);
    },

    applyVoucherDirectly: function(code) {
        window.PI_API.closeModal('pi-vouchers-modal', 'pi-vouchers-content');
        const input = document.getElementById('coupon-input');
        if (input) input.value = code;
        if (typeof applyCoupon === 'function') applyCoupon();
        if (window.AppAPI && typeof window.AppAPI.toggleCartDrawer === 'function') {
            window.AppAPI.toggleCartDrawer(true);
        }
        showToast(`کد تخفیف «${code}» بر روی سبد خرید فعال گردید.`);
    },

    /* ---------------------------------------------------------------------
     * 7. INVITE FRIENDS MODAL
     * --------------------------------------------------------------------- */
    openInvite: function() {
        const modal = createModalContainer('pi-invite-modal');
        modal.innerHTML = `
            <div id="pi-invite-content" class="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl transform scale-95 transition-transform duration-300">
                <div class="p-5 bg-gradient-to-r from-pink-600 to-snapp text-white relative text-center">
                    <button onclick="window.PI_API.closeModal('pi-invite-modal', 'pi-invite-content')" class="absolute top-4 left-4 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30">
                        <i data-lucide="x" class="w-4 h-4"></i>
                    </button>
                    <div class="w-14 h-14 rounded-full bg-white/20 mx-auto flex items-center justify-center mb-2 shadow-inner">
                        <i data-lucide="gift" class="w-7 h-7 text-white"></i>
                    </div>
                    <h3 class="font-black text-lg">دعوت از دوستان و دریافت پاداش</h3>
                    <p class="text-xs text-pink-100 mt-1">با معرفی هر دوست، ۱۰۰,۰۰۰ تومان اعتبار خرید هدیه بگیرید!</p>
                </div>
                <div class="p-5 space-y-4">
                    <div class="bg-pink-50 border border-pink-100 rounded-2xl p-3.5 text-center">
                        <span class="text-[10px] font-bold text-gray-500 block mb-1">کد اختصاصی دعوت شما:</span>
                        <div class="font-mono font-black text-lg text-snapp tracking-wider my-1 select-all" dir="ltr">ERMIA-SHOP</div>
                        <button onclick="window.PI_API.copyVoucher('ERMIA-SHOP')" class="mt-2 text-xs bg-white border border-snapp text-snapp font-bold px-4 py-1.5 rounded-xl hover:bg-snapp hover:text-white transition-colors">
                            کپی کد دعوت
                        </button>
                    </div>
                    <div class="space-y-2 text-xs text-gray-600">
                        <div class="flex items-center gap-2">
                            <span class="w-5 h-5 rounded-full bg-snapp-light text-snapp font-bold text-[10px] flex items-center justify-center">۱</span>
                            <span>لینک یا کد دعوت خود را برای دوستانتان بفرستید.</span>
                        </div>
                        <div class="flex items-center gap-2">
                            <span class="w-5 h-5 rounded-full bg-snapp-light text-snapp font-bold text-[10px] flex items-center justify-center">۲</span>
                            <span>دوستتان اولین سفارش خود را در لقمه‌فود یا لقمه‌شاپ ثبت کند.</span>
                        </div>
                        <div class="flex items-center gap-2">
                            <span class="w-5 h-5 rounded-full bg-snapp-light text-snapp font-bold text-[10px] flex items-center justify-center">۳</span>
                            <span>۱۰۰ هزار تومان هدیه به کیف پول شما و دوستتان واریز می‌شود!</span>
                        </div>
                    </div>
                    <button onclick="window.PI_API.shareInviteLink()" class="w-full bg-snapp hover:bg-snapp-hover text-white font-bold text-xs py-3.5 rounded-2xl shadow-lg shadow-pink-500/25 active:scale-95 transition-all flex items-center justify-center gap-2">
                        <i data-lucide="share-2" class="w-4 h-4"></i> اشتراک‌گذاری لینک دعوت
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        if (window.lucide) lucide.createIcons();

        requestAnimationFrame(() => {
            modal.classList.remove('opacity-0');
            document.getElementById('pi-invite-content').classList.remove('scale-95');
        });
    },

    shareInviteLink: function() {
        const link = 'https://loghme.app/invite?code=ERMIA-SHOP';
        navigator.clipboard.writeText(link);
        showToast('لینک دعوت با موفقیت کپی شد.');
    },

    /* ---------------------------------------------------------------------
     * 8. SUPPORT SIMULATOR & LIVE CHAT MODAL
     * --------------------------------------------------------------------- */
    openSupport: function() {
        const modal = createModalContainer('pi-support-modal');
        modal.innerHTML = `
            <div id="pi-support-content" class="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl transform scale-95 transition-transform duration-300 max-h-[85vh] flex flex-col">
                <div class="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center shrink-0">
                    <h3 class="font-black text-sm text-gray-900">پشتیبانی ۲۴ ساعته لقمه</h3>
                    <button onclick="window.PI_API.closeModal('pi-support-modal', 'pi-support-content')" class="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-100">
                        <i data-lucide="x" class="w-4 h-4"></i>
                    </button>
                </div>

                <div class="p-5 space-y-4 overflow-y-auto flex-1">
                    <!-- Call Section -->
                    <div class="p-4 bg-gray-50 rounded-2xl border border-gray-200 text-center">
                        <div class="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-2">
                            <i data-lucide="phone-call" class="w-5 h-5"></i>
                        </div>
                        <div class="font-bold text-xs text-gray-800">تماس تلفنی با مرکز پاسخگویی</div>
                        <div class="font-mono font-bold text-sm text-gray-700 my-1.5" dir="ltr">021 - 96612</div>
                        <a href="tel:02196612" class="inline-block bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2 rounded-xl active:scale-95 transition-all">
                            برقراری تماس مستقیم
                        </a>
                    </div>

                    <!-- Online Chat Simulator Trigger -->
                    <div class="p-4 bg-pink-50 rounded-2xl border border-pink-100 text-center">
                        <div class="w-10 h-10 rounded-full bg-snapp text-white flex items-center justify-center mx-auto mb-2 shadow-md shadow-pink-500/30">
                            <i data-lucide="message-square" class="w-5 h-5"></i>
                        </div>
                        <div class="font-bold text-xs text-gray-900">گفتگوی آنلاین با دستیار هوشمند</div>
                        <p class="text-[11px] text-gray-500 my-1">پاسخ فوری به سوالات، پیگیری سفارش‌ها و مشکلات مالی</p>
                        <button onclick="window.PI_API.openChatDrawer()" class="mt-2 bg-snapp hover:bg-snapp-hover text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md shadow-pink-500/25 active:scale-95 transition-all">
                            شروع چت آنلاین
                        </button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        if (window.lucide) lucide.createIcons();

        requestAnimationFrame(() => {
            modal.classList.remove('opacity-0');
            document.getElementById('pi-support-content').classList.remove('scale-95');
        });
    },

    openChatDrawer: function() {
        window.PI_API.closeModal('pi-support-modal', 'pi-support-content');

        const modal = createModalContainer('pi-chat-modal');
        modal.innerHTML = `
            <div id="pi-chat-content" class="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl transform scale-95 transition-transform duration-300 h-[80vh] flex flex-col">
                <div class="p-3.5 bg-gray-50 border-b border-gray-200 flex justify-between items-center shrink-0">
                    <div class="flex items-center gap-2">
                        <div class="relative">
                            <div class="w-8 h-8 rounded-full bg-gradient-to-br from-snapp to-pink-600 flex items-center justify-center text-white font-bold text-xs">AI</div>
                            <span class="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full animate-pulse"></span>
                        </div>
                        <div>
                            <div class="font-black text-xs text-gray-900">دستیار هوشمند پشتیبانی</div>
                            <div class="text-[9px] text-emerald-600 font-bold flex items-center gap-1">
                                <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                پاسخگوی آنلاین
                            </div>
                        </div>
                    </div>
                    <button onclick="window.PI_API.closeModal('pi-chat-modal', 'pi-chat-content')" class="w-7 h-7 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-100">
                        <i data-lucide="x" class="w-3.5 h-3.5"></i>
                    </button>
                </div>

                <div id="pi-chat-messages" class="p-4 flex-1 overflow-y-auto space-y-3">
                    <div class="flex gap-2 items-start">
                        <div class="w-6 h-6 rounded-full bg-snapp text-white text-[10px] font-bold flex items-center justify-center shrink-0">AI</div>
                        <div class="bg-gray-100 text-gray-800 text-xs p-3 rounded-2xl rounded-tr-none leading-relaxed max-w-[80%]">
                            سلام ارمیا عزیز! من دستیار هوشمند لقمه هستم. برای راهنمایی سریع‌تر یکی از موضوعات زیر را انتخاب کنید یا پیام خود را بنویسید:
                        </div>
                    </div>
                </div>

                <!-- Quick Action Chips -->
                <div class="px-3 py-2 bg-gray-50 border-t border-gray-100 flex gap-1.5 overflow-x-auto no-scrollbar shrink-0">
                    ${['پیگیری سفارش جاری', 'مشکل در پرداخت یا کیف پول', 'تغییر آدرس تحویل'].map(q => `
                        <button onclick="window.PI_API.sendQuickQuestion('${q}')" class="bg-white border border-gray-200 hover:border-snapp text-gray-700 hover:text-snapp text-[10px] font-bold px-3 py-1.5 rounded-full shrink-0 transition-colors shadow-sm">
                            ${q}
                        </button>
                    `).join('')}
                </div>

                <!-- Chat Input -->
                <div class="p-3 bg-white border-t border-gray-100 flex gap-2 shrink-0">
                    <input type="text" id="pi-chat-input" placeholder="پیام خود را بنویسید..." onkeydown="if(event.key==='Enter') window.PI_API.sendChatMessage()" class="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-medium outline-none focus:border-snapp">
                    <button onclick="window.PI_API.sendChatMessage()" class="w-9 h-9 bg-snapp hover:bg-snapp-hover text-white rounded-xl flex items-center justify-center shrink-0 shadow-sm active:scale-95">
                        <i data-lucide="send" class="w-4 h-4 rotate-180"></i>
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        if (window.lucide) lucide.createIcons();

        requestAnimationFrame(() => {
            modal.classList.remove('opacity-0');
            document.getElementById('pi-chat-content').classList.remove('scale-95');
        });
    },

    sendQuickQuestion: function(text) {
        window.PI_API.appendUserMessage(text);
        window.PI_API.simulateBotResponse(text);
    },

    sendChatMessage: function() {
        const input = document.getElementById('pi-chat-input');
        const text = input.value.trim();
        if (!text) return;
        input.value = '';
        window.PI_API.appendUserMessage(text);
        window.PI_API.simulateBotResponse(text);
    },

    appendUserMessage: function(text) {
        const box = document.getElementById('pi-chat-messages');
        const msg = document.createElement('div');
        msg.className = 'flex justify-end';
        msg.innerHTML = `
            <div class="bg-snapp text-white text-xs p-3 rounded-2xl rounded-tl-none leading-relaxed max-w-[80%] shadow-sm">
                ${text}
            </div>
        `;
        box.appendChild(msg);
        box.scrollTop = box.scrollHeight;
    },

    simulateBotResponse: function(promptText) {
        const box = document.getElementById('pi-chat-messages');

        // Typing indicator
        const typing = document.createElement('div');
        typing.id = 'pi-typing-indicator';
        typing.className = 'flex gap-2 items-center text-[10px] text-gray-400';
        typing.innerHTML = `<span class="w-2 h-2 rounded-full bg-snapp animate-ping"></span> در حال بررسی...`;
        box.appendChild(typing);
        box.scrollTop = box.scrollHeight;

        let reply = 'درخواست شما دریافت شد. همکاران پشتیبانی ما در سریع‌ترین زمان ممکن پاسخگوی شما خواهند بود.';
        if (promptText.includes('پیگیری سفارش')) {
            reply = 'آخرین سفارش شما (#۸۸۴۹۲۰۱) با موفقیت تحویل داده شده است. در صورت نیاز به پیگیری زنده پیک، شماره آن در جزئیات فاکتور موجود است.';
        } else if (promptText.includes('پرداخت') || promptText.includes('کیف پول')) {
            reply = 'در صورت کسر وجه ناموفق از حساب بانکی، طبق قوانین شاپرک مبلغ حداکثر ظرف ۷۲ ساعت کاری به کارت شما عودت داده می‌شود.';
        } else if (promptText.includes('تغییر آدرس')) {
            reply = 'جهت تغییر نشانی تحویل، می‌توانید از منوی انتخاب آدرس در بالای صفحه اصلی اپلیکیشن اقدام نمایید.';
        }

        setTimeout(() => {
            typing.remove();
            const botMsg = document.createElement('div');
            botMsg.className = 'flex gap-2 items-start';
            botMsg.innerHTML = `
                <div class="w-6 h-6 rounded-full bg-snapp text-white text-[10px] font-bold flex items-center justify-center shrink-0">AI</div>
                <div class="bg-gray-100 text-gray-800 text-xs p-3 rounded-2xl rounded-tr-none leading-relaxed max-w-[80%]">
                    ${reply}
                </div>
            `;
            box.appendChild(botMsg);
            box.scrollTop = box.scrollHeight;
        }, 1200);
    },

    closeModal: closeModal
};