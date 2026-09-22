/* ==========================================================================
 * app-views.js
 * --------------------------------------------------------------------------
 * Modular View Management System for Loghme Shop / Loghme Food.
 * Generates the Hot Deals, Order History, and Profile views dynamically.
 * ========================================================================== */

// --- Shared Helpers ---
function toPersianDigits(n) {
    if (n === null || n === undefined) return '';
    const farsiDigits = ['۰','۱','۲','۳','۴','۵','۶','۷','۸','۹'];
    return n.toString().replace(/\d/g, x => farsiDigits[x]);
}

function formatPrice(amount) {
    return toPersianDigits(Math.round(amount).toLocaleString('fa-IR'));
}

let activeIntervals = [];
function clearViewIntervals() {
    activeIntervals.forEach(clearInterval);
    activeIntervals = [];
}

/* ==========================================================================
 * 1. HOT DEALS VIEW ("تخفیف داغ")
 * ========================================================================== */
export function renderDealsView(container) {
    clearViewIntervals();

    const html = `
        <div class="-mx-4 -mt-3 bg-white min-h-screen pb-24 font-vazir relative">
            
            <!-- Sticky Header -->
            <div class="sticky top-0 z-40 bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100 flex items-center justify-between p-4">
                <div class="flex items-center gap-2">
                    <span class="text-xl">🎉</span>
                    <h2 class="font-black text-sm text-gray-900">خرید خونه با تخفیف</h2>
                </div>
                <button onclick="document.querySelector('.nav-tab').click()" class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors">
                    <i data-lucide="arrow-left" class="w-4 h-4"></i>
                </button>
            </div>

            <!-- Countdown Banner -->
            <div class="mx-4 mt-4 p-3.5 bg-rose-50 rounded-xl border border-rose-100 flex justify-between items-center shadow-sm relative overflow-hidden">
                <span class="text-rose-600 font-bold text-xs flex items-center gap-1.5">
                    <span class="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                    تا پایان تخفیف‌ها
                </span>
                <div class="flex items-center gap-1 font-mono text-sm font-black text-rose-700 bg-white px-2.5 py-1 rounded-lg shadow-sm border border-rose-100/50" dir="ltr">
                    <span id="deal-hr">۰۵</span> : <span id="deal-min">۵۳</span> : <span id="deal-sec">۴۲</span>
                </div>
            </div>

            <!-- Trending Vendors Carousel -->
            <div class="mt-6 px-4">
                <h3 class="text-xs font-black text-gray-900 mb-3 flex items-center gap-1.5">
                    <i data-lucide="trending-up" class="w-4 h-4 text-snapp"></i>
                    فروشگاه‌های پرطرفدار
                </h3>
                <div class="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                    ${['کباب‌سرای توسکا', 'فست‌فود سهند', 'خانه کیک', 'فست‌فود شاد'].map((name, i) => `
                        <div class="flex flex-col items-center gap-2 shrink-0 cursor-pointer">
                            <div class="w-14 h-14 rounded-full border border-gray-200 p-0.5 bg-white shadow-sm">
                                <img src="https://picsum.photos/100/100?random=${i + 10}" class="w-full h-full rounded-full object-cover">
                            </div>
                            <span class="text-[9px] font-bold text-gray-700">${name}</span>
                        </div>
                    `).join('')}
                </div>
            </div>

            <!-- Deals Grid -->
            <div class="mt-4 px-4 grid grid-cols-1 gap-4">
                <!-- Deal Card 1 -->
                <div class="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_4px_18px_-6px_rgba(0,0,0,0.10)] p-3 cursor-pointer transition-all">
                    <div class="flex items-center justify-between mb-3 pb-2 border-b border-gray-50">
                        <div class="flex items-center gap-2">
                            <img src="https://picsum.photos/50/50?random=20" class="w-6 h-6 rounded-md">
                            <span class="text-[10px] font-bold text-gray-700">کافه باقلوا سیلوا</span>
                        </div>
                        <div class="flex items-center gap-2 text-[9px] font-bold text-gray-500 bg-gray-50 px-2 py-1 rounded-md">
                            <span class="flex items-center gap-0.5"><i data-lucide="clock" class="w-3 h-3 text-gray-400"></i> ۲۵ دقیقه</span>
                            <div class="w-1 h-1 bg-gray-300 rounded-full"></div>
                            <span class="flex items-center gap-0.5"><i data-lucide="bike" class="w-3 h-3 text-gray-400"></i> ۲۰,۳۰۰ تومان</span>
                        </div>
                    </div>
                    <div class="flex gap-3">
                        <div class="relative w-24 h-24 rounded-xl overflow-hidden shrink-0">
                            <img src="https://images.unsplash.com/photo-1599598425947-33002629b5fa?w=300&q=80" class="w-full h-full object-cover">
                            <span class="absolute bottom-1.5 left-1.5 bg-white/90 backdrop-blur text-gray-800 text-[10px] font-black px-1.5 py-0.5 rounded-md shadow-sm">۵ عدد</span>
                        </div>
                        <div class="flex-1 flex flex-col justify-between py-1">
                            <div>
                                <div class="flex justify-between items-start gap-1">
                                    <h4 class="font-extrabold text-xs text-gray-900 leading-snug">باقلوا نعلی گردویی ۳ عدد</h4>
                                    <div class="flex items-center gap-0.5 text-[9px] font-bold text-amber-500 bg-amber-50 px-1.5 py-0.5 rounded-md shrink-0">
                                        <i data-lucide="star" class="w-2.5 h-2.5 fill-amber-400 text-amber-400"></i> ۴.۱
                                    </div>
                                </div>
                            </div>
                            <div class="flex items-center justify-between mt-2">
                                <span class="bg-rose-600 text-white font-black text-[10px] px-1.5 py-0.5 rounded-md shadow-sm">٪۲۰</span>
                                <div class="text-left">
                                    <div class="text-[10px] text-gray-400 line-through mb-0.5">${formatPrice(120000)}</div>
                                    <div class="text-xs font-black text-gray-900">${formatPrice(96000)} <span class="text-[9px] font-normal text-gray-500">تومان</span></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Deal Card 2 -->
                <div class="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_4px_18px_-6px_rgba(0,0,0,0.10)] p-3 cursor-pointer transition-all">
                    <div class="flex items-center justify-between mb-3 pb-2 border-b border-gray-50">
                        <div class="flex items-center gap-2">
                            <img src="https://picsum.photos/50/50?random=21" class="w-6 h-6 rounded-md">
                            <span class="text-[10px] font-bold text-gray-700">کافه باقلوا سیلوا</span>
                        </div>
                        <div class="flex items-center gap-2 text-[9px] font-bold text-gray-500 bg-gray-50 px-2 py-1 rounded-md">
                            <span class="flex items-center gap-0.5"><i data-lucide="clock" class="w-3 h-3 text-gray-400"></i> ۲۵ دقیقه</span>
                            <div class="w-1 h-1 bg-gray-300 rounded-full"></div>
                            <span class="flex items-center gap-0.5"><i data-lucide="bike" class="w-3 h-3 text-gray-400"></i> ۲۰,۳۰۰ تومان</span>
                        </div>
                    </div>
                    <div class="flex gap-3">
                        <div class="relative w-24 h-24 rounded-xl overflow-hidden shrink-0">
                            <img src="https://images.unsplash.com/photo-1616428784132-75d31562b772?w=300&q=80" class="w-full h-full object-cover">
                            <span class="absolute bottom-1.5 left-1.5 bg-white/90 backdrop-blur text-gray-800 text-[10px] font-black px-1.5 py-0.5 rounded-md shadow-sm">۲ عدد</span>
                        </div>
                        <div class="flex-1 flex flex-col justify-between py-1">
                            <div>
                                <div class="flex justify-between items-start gap-1">
                                    <h4 class="font-extrabold text-xs text-gray-900 leading-snug">باقلوا پیتزایی ۳ عدد</h4>
                                    <div class="flex items-center gap-0.5 text-[9px] font-bold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-md shrink-0">
                                        <i data-lucide="star" class="w-2.5 h-2.5 fill-gray-400 text-gray-400"></i> ۲.۸
                                    </div>
                                </div>
                            </div>
                            <div class="flex items-center justify-between mt-2">
                                <span class="bg-rose-600 text-white font-black text-[10px] px-1.5 py-0.5 rounded-md shadow-sm">٪۱۵</span>
                                <div class="text-left">
                                    <div class="text-[10px] text-gray-400 line-through mb-0.5">${formatPrice(185000)}</div>
                                    <div class="text-xs font-black text-gray-900">${formatPrice(157250)} <span class="text-[9px] font-normal text-gray-500">تومان</span></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    `;

    container.innerHTML = html;
    if (window.lucide) lucide.createIcons();

    // Setup Animated Countdown
    let totalSeconds = 5 * 3600 + 53 * 60 + 42;
    const intervalId = setInterval(() => {
        if (totalSeconds <= 0) return;
        totalSeconds--;
        const h = Math.floor(totalSeconds / 3600);
        const m = Math.floor((totalSeconds % 3600) / 60);
        const s = totalSeconds % 60;
        
        const hEl = document.getElementById('deal-hr');
        const mEl = document.getElementById('deal-min');
        const sEl = document.getElementById('deal-sec');
        
        if (hEl) hEl.textContent = toPersianDigits(h.toString().padStart(2, '0'));
        if (mEl) mEl.textContent = toPersianDigits(m.toString().padStart(2, '0'));
        if (sEl) sEl.textContent = toPersianDigits(s.toString().padStart(2, '0'));
    }, 1000);
    activeIntervals.push(intervalId);
}

/* ==========================================================================
 * 2. ORDER HISTORY VIEW ("سفارش‌ها")
 * ========================================================================== */
export function renderOrdersView(container) {
    clearViewIntervals();

    const html = `
        <div class="-mx-4 -mt-3 bg-gray-50 min-h-screen pb-24 font-vazir relative">
            
            <!-- Sticky Filter Pills -->
            <div class="sticky top-0 z-40 bg-white shadow-sm border-b border-gray-100 flex gap-2 p-3 overflow-x-auto no-scrollbar">
                <button class="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shrink-0 transition-colors hover:bg-gray-200">
                    <i data-lucide="sliders-horizontal" class="w-3.5 h-3.5"></i> فیلترها
                </button>
                <button class="bg-snapp text-white px-4 py-1.5 rounded-full text-xs font-bold shrink-0 shadow-md shadow-pink-500/20">رستوران</button>
                <button class="bg-white border border-gray-200 text-gray-600 px-4 py-1.5 rounded-full text-xs font-bold shrink-0 hover:bg-gray-50">کافه</button>
                <button class="bg-white border border-gray-200 text-gray-600 px-4 py-1.5 rounded-full text-xs font-bold shrink-0 hover:bg-gray-50">شیرینی</button>
                <button class="bg-white border border-gray-200 text-gray-600 px-4 py-1.5 rounded-full text-xs font-bold shrink-0 hover:bg-gray-50">سوپرمارکت</button>
            </div>

            <!-- Orders List -->
            <div class="p-4 space-y-4">
                
                <!-- Order Card 1 -->
                <div class="bg-white rounded-2xl p-4 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-100 hover:shadow-[0_4px_18px_-6px_rgba(0,0,0,0.10)] transition-all">
                    <div class="flex justify-between items-center mb-3">
                        <span class="bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-md text-[10px] font-bold flex items-center gap-1 border border-emerald-100/50">
                            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            تحویل شده
                        </span>
                        <i data-lucide="chevron-left" class="w-4 h-4 text-gray-400"></i>
                    </div>
                    
                    <div class="flex items-center gap-3 mb-3">
                        <div class="w-10 h-10 rounded-full border border-gray-100 p-0.5 shrink-0">
                            <img src="https://picsum.photos/100/100?random=30" class="w-full h-full rounded-full object-cover">
                        </div>
                        <div>
                            <h4 class="font-extrabold text-xs text-gray-900">ریواس فود</h4>
                            <div class="text-[10px] text-gray-400 font-medium mt-1">جمعه ۲۷ شهریور · ۲۰:۱۹</div>
                        </div>
                    </div>
                    
                    <div class="text-[10px] font-medium text-gray-500 mb-3 border-b border-gray-50 pb-3 truncate">
                        تحویل به عدالت ۱۰۷ مجتمع ۱۰۷ زنگ ۳
                    </div>
                    
                    <div class="flex gap-2 mb-4">
                        <div class="relative w-12 h-12 rounded-lg bg-gray-50 border border-gray-100 shrink-0">
                            <img src="https://images.unsplash.com/photo-1513104890138-7c749659a591?w=200&q=80" class="w-full h-full object-cover rounded-lg">
                            <span class="absolute -top-1.5 -right-1.5 bg-gray-800 text-white min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center text-[9px] font-black border-2 border-white">۱</span>
                        </div>
                        <div class="relative w-12 h-12 rounded-lg bg-gray-50 border border-gray-100 shrink-0">
                            <img src="https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?w=200&q=80" class="w-full h-full object-cover rounded-lg">
                            <span class="absolute -top-1.5 -right-1.5 bg-gray-800 text-white min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center text-[9px] font-black border-2 border-white">۲</span>
                        </div>
                    </div>
                    
                    <div class="flex justify-between items-center mb-4 bg-gray-50 p-2.5 rounded-xl border border-gray-100/50">
                        <span class="text-[11px] font-bold text-gray-500">مبلغ کل:</span>
                        <span class="font-black text-sm text-gray-900">${formatPrice(1573000)} <span class="text-[10px] font-normal text-gray-500">تومان</span></span>
                    </div>
                    
                    <div class="flex gap-2">
                        <button class="flex-1 bg-snapp-light hover:bg-snapp hover:text-white text-snapp font-bold text-xs py-3 rounded-xl transition-all border border-snapp/20 active:scale-95 shadow-sm flex items-center justify-center gap-1.5">
                            <i data-lucide="rotate-ccw" class="w-3.5 h-3.5"></i>
                            سفارش مجدد
                        </button>
                        <button class="flex-1 bg-white hover:bg-gray-50 text-gray-700 font-bold text-xs py-3 rounded-xl border border-gray-200 transition-colors active:scale-95 shadow-sm">مشاهده فاکتور</button>
                    </div>
                    
                    <div class="mt-4 pt-3 border-t border-gray-50 flex justify-between items-center bg-amber-50/30 -mx-4 -mb-4 px-4 pb-4 rounded-b-2xl">
                        <span class="text-[11px] font-bold text-gray-600">به این سفارش امتیاز دهید.</span>
                        <button class="text-amber-600 bg-white shadow-sm hover:bg-amber-50 text-[11px] font-bold border border-amber-200 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors active:scale-95">
                            <i data-lucide="star" class="w-3 h-3 fill-amber-500 text-amber-500"></i> ثبت امتیاز
                        </button>
                    </div>
                </div>

                <!-- Order Card 2 -->
                <div class="bg-white rounded-2xl p-4 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-100 hover:shadow-[0_4px_18px_-6px_rgba(0,0,0,0.10)] transition-all">
                    <div class="flex justify-between items-center mb-3">
                        <span class="bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-md text-[10px] font-bold flex items-center gap-1 border border-emerald-100/50">
                            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            تحویل شده
                        </span>
                        <i data-lucide="chevron-left" class="w-4 h-4 text-gray-400"></i>
                    </div>
                    
                    <div class="flex items-center gap-3 mb-3">
                        <div class="w-10 h-10 rounded-full border border-gray-100 p-0.5 shrink-0">
                            <img src="https://picsum.photos/100/100?random=31" class="w-full h-full rounded-full object-cover">
                        </div>
                        <div>
                            <h4 class="font-extrabold text-xs text-gray-900">فست فود تاج</h4>
                            <div class="text-[10px] text-gray-400 font-medium mt-1">سه‌شنبه ۲ شهریور · ۱۳:۴۵</div>
                        </div>
                    </div>
                    
                    <div class="text-[10px] font-medium text-gray-500 mb-3 border-b border-gray-50 pb-3 truncate">
                        تحویل به میدان کاج، خیابان سرو شرقی
                    </div>
                    
                    <div class="flex gap-2 mb-4">
                        <div class="relative w-12 h-12 rounded-lg bg-gray-50 border border-gray-100 shrink-0">
                            <img src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&q=80" class="w-full h-full object-cover rounded-lg">
                            <span class="absolute -top-1.5 -right-1.5 bg-gray-800 text-white min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center text-[9px] font-black border-2 border-white">۱</span>
                        </div>
                    </div>
                    
                    <div class="flex justify-between items-center mb-4 bg-gray-50 p-2.5 rounded-xl border border-gray-100/50">
                        <span class="text-[11px] font-bold text-gray-500">مبلغ کل:</span>
                        <span class="font-black text-sm text-gray-900">${formatPrice(326200)} <span class="text-[10px] font-normal text-gray-500">تومان</span></span>
                    </div>
                    
                    <div class="flex gap-2">
                        <button class="flex-1 bg-snapp-light hover:bg-snapp hover:text-white text-snapp font-bold text-xs py-3 rounded-xl transition-all border border-snapp/20 active:scale-95 shadow-sm flex items-center justify-center gap-1.5">
                            <i data-lucide="rotate-ccw" class="w-3.5 h-3.5"></i>
                            سفارش مجدد
                        </button>
                        <button class="flex-1 bg-white hover:bg-gray-50 text-gray-700 font-bold text-xs py-3 rounded-xl border border-gray-200 transition-colors active:scale-95 shadow-sm">مشاهده فاکتور</button>
                    </div>
                </div>

            </div>
        </div>
    `;

    container.innerHTML = html;
    if (window.lucide) lucide.createIcons();
}

/* ==========================================================================
 * 3. USER PROFILE & PRO MEMBERSHIP VIEW ("حساب من")
 * ========================================================================== */
export function renderProfileView(container) {
    clearViewIntervals();

    const html = `
        <div class="-mx-4 -mt-3 bg-gray-50 min-h-screen pb-24 font-vazir relative">
            
            <!-- Profile Header -->
            <div class="p-5 bg-white flex justify-between items-center shadow-sm border-b border-gray-100">
                <div class="flex items-center gap-3">
                    <div class="w-12 h-12 bg-gradient-to-br from-snapp-light to-pink-100 rounded-full flex items-center justify-center text-snapp border border-snapp/20 shadow-inner">
                        <i data-lucide="user" class="w-6 h-6"></i>
                    </div>
                    <div>
                        <h2 class="font-black text-lg text-gray-900">سید ارمیا مفیدی</h2>
                        <div class="text-[11px] font-medium text-gray-500 mt-1 flex items-center gap-1" dir="ltr">
                            <i data-lucide="smartphone" class="w-3 h-3"></i> ۰۹۳۹۱۷۷۸۱۴۴
                        </div>
                    </div>
                </div>
                <button class="text-[10px] text-snapp font-bold flex items-center gap-0.5 hover:bg-snapp-light px-2.5 py-2 rounded-xl border border-snapp/20 transition-all active:scale-95 shadow-sm">
                    اطلاعات کاربری <i data-lucide="chevron-left" class="w-3 h-3"></i>
                </button>
            </div>

            <!-- Loghme Pro VIP Card -->
            <div class="mx-4 mt-5 rounded-2xl p-4 bg-gradient-to-r from-purple-800 to-indigo-900 text-white shadow-xl shadow-indigo-900/20 relative overflow-hidden cursor-pointer hover:scale-[1.01] transition-transform">
                <!-- Decorative Glows -->
                <div class="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                <div class="absolute -left-4 -bottom-8 w-24 h-24 bg-amber-400/20 rounded-full blur-xl"></div>
                
                <div class="flex justify-between items-center mb-5 relative z-10">
                    <span class="bg-amber-400 text-purple-950 text-[10px] font-black px-2.5 py-1 rounded-md tracking-widest uppercase shadow-sm flex items-center gap-1">
                        <i data-lucide="crown" class="w-3 h-3"></i>
                        Pro
                    </span>
                    <span class="text-[11px] font-bold text-indigo-50 bg-white/10 px-2.5 py-1 rounded-lg border border-white/10 backdrop-blur-sm">۹۳ روز مانده تا پایان اشتراک پرو</span>
                </div>
                
                <div class="flex justify-between items-center relative z-10 bg-white/10 rounded-xl p-3.5 backdrop-blur-sm border border-white/10 shadow-inner">
                    <div class="flex-1 text-center">
                        <div class="text-[9px] font-bold text-indigo-200 mb-1.5">سفارش‌های پرو</div>
                        <div class="font-black text-sm text-white">۳۹</div>
                    </div>
                    <div class="w-px h-8 bg-white/20"></div>
                    <div class="flex-1 text-center">
                        <div class="text-[9px] font-bold text-indigo-200 mb-1.5">مجموع سود پرو</div>
                        <div class="font-black text-sm text-amber-400">${formatPrice(3200941)} <span class="text-[9px] font-normal text-indigo-100">تومان</span> 🎉</div>
                    </div>
                </div>
            </div>

            <!-- Account Actions List -->
            <div class="mt-6 bg-white border-y border-gray-100 divide-y divide-gray-50 shadow-sm">
                
                <div class="p-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer transition-colors group">
                    <div class="flex items-center gap-3.5">
                        <div class="w-9 h-9 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-500 group-hover:text-snapp group-hover:bg-snapp-light group-hover:border-snapp/20 transition-all shadow-sm">
                            <i data-lucide="zap" class="w-4 h-4"></i>
                        </div>
                        <div>
                            <div class="font-extrabold text-xs text-gray-800">پرداخت سریع (با یک کلیک)</div>
                            <div class="text-[10px] text-amber-500 font-bold mt-1">خطا در ارائه دهنده سرویس</div>
                        </div>
                    </div>
                    <i data-lucide="chevron-left" class="w-4 h-4 text-gray-300"></i>
                </div>

                <div class="p-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer transition-colors group">
                    <div class="flex items-center gap-3.5">
                        <div class="w-9 h-9 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-500 group-hover:text-snapp group-hover:bg-snapp-light group-hover:border-snapp/20 transition-all shadow-sm">
                            <i data-lucide="wallet" class="w-4 h-4"></i>
                        </div>
                        <div>
                            <div class="font-extrabold text-xs text-gray-800">تراکنش‌ها و کیف پول</div>
                            <div class="text-[10px] text-gray-400 font-medium mt-1">لیست همه کیف پول‌ها</div>
                        </div>
                    </div>
                    <i data-lucide="chevron-left" class="w-4 h-4 text-gray-300"></i>
                </div>

                <div class="p-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer transition-colors group">
                    <div class="flex items-center gap-3.5">
                        <div class="w-9 h-9 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-500 group-hover:text-snapp group-hover:bg-snapp-light group-hover:border-snapp/20 transition-all shadow-sm">
                            <i data-lucide="award" class="w-4 h-4"></i>
                        </div>
                        <div>
                            <div class="font-extrabold text-xs text-gray-800">لقمه! کلاب</div>
                            <div class="text-[10px] text-amber-500 font-bold mt-1">خطا در دریافت امتیاز</div>
                        </div>
                    </div>
                    <i data-lucide="chevron-left" class="w-4 h-4 text-gray-300"></i>
                </div>

                <div class="p-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer transition-colors group">
                    <div class="flex items-center gap-3.5">
                        <div class="w-9 h-9 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-500 group-hover:text-snapp group-hover:bg-snapp-light group-hover:border-snapp/20 transition-all shadow-sm">
                            <i data-lucide="tag" class="w-4 h-4"></i>
                        </div>
                        <div>
                            <div class="font-extrabold text-xs text-gray-800">تخفیف‌ها و جایزه‌ها</div>
                        </div>
                    </div>
                    <i data-lucide="chevron-left" class="w-4 h-4 text-gray-300"></i>
                </div>

                <div class="p-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer transition-colors group">
                    <div class="flex items-center gap-3.5">
                        <div class="w-9 h-9 rounded-full bg-snapp-light border border-snapp/20 flex items-center justify-center text-snapp">
                            <i data-lucide="users" class="w-4 h-4"></i>
                        </div>
                        <div>
                            <div class="font-extrabold text-xs text-gray-800">دعوت از دوستان</div>
                        </div>
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="bg-snapp text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-sm">+${formatPrice(300000)} تومان</span>
                        <i data-lucide="chevron-left" class="w-4 h-4 text-gray-300"></i>
                    </div>
                </div>

                <div class="p-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer transition-colors group">
                    <div class="flex items-center gap-3.5">
                        <div class="w-9 h-9 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-500 group-hover:text-snapp group-hover:bg-snapp-light group-hover:border-snapp/20 transition-all shadow-sm">
                            <i data-lucide="headphones" class="w-4 h-4"></i>
                        </div>
                        <div>
                            <div class="font-extrabold text-xs text-gray-800">پشتیبانی</div>
                        </div>
                    </div>
                    <i data-lucide="chevron-left" class="w-4 h-4 text-gray-300"></i>
                </div>
            </div>

            <!-- Version Footer -->
            <div class="text-center mt-6 text-gray-400 text-[10px] font-medium" dir="ltr">
                LoghmeFood Version 7.14.0
            </div>

        </div>
    `;

    container.innerHTML = html;
    if (window.lucide) lucide.createIcons();
}