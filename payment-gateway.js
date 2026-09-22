/* ==========================================================================
 * payment-gateway.js
 * --------------------------------------------------------------------------
 * Complete Iranian Payment Gateway Simulation (Shaparak / Saman Kish).
 * Handles Wallet, Saved Cards, Add Card, OTP, Captcha, and Receipts.
 * ========================================================================== */

const WALLET_BALANCE = 350000;

const savedCards = [
    { id: 'c1', number: '۶۰۳۷۹۹****۴۸۲۱', bank: 'بانک ملی ایران', icon: 'landmark', color: 'from-blue-700 to-blue-900', raw: '6037990000004821' },
    { id: 'c2', number: '۶۲۱۹۸۶****۱۱۰۹', bank: 'بانک سامان', icon: 'credit-card', color: 'from-sky-500 to-blue-600', raw: '6219860000001109' }
];

let currentAmount = 0;
let successCallback = null;
let activeIntervals = [];

function clearAllIntervals() {
    activeIntervals.forEach(clearInterval);
    activeIntervals = [];
}

function toPersianDigits(n) {
    if (n === null || n === undefined) return '';
    const farsiDigits = ['۰','۱','۲','۳','۴','۵','۶','۷','۸','۹'];
    return n.toString().replace(/\d/g, x => farsiDigits[x]);
}

function formatPrice(amount) {
    return toPersianDigits(Math.round(amount).toLocaleString('fa-IR'));
}

function detectBank(pan) {
    const p = pan.replace(/\D/g, '');
    if (p.startsWith('603799')) return { name: 'بانک ملی ایران', color: 'from-blue-700 to-blue-900', icon: 'landmark' };
    if (p.startsWith('621986')) return { name: 'بانک سامان', color: 'from-sky-500 to-blue-600', icon: 'credit-card' };
    if (p.startsWith('610433')) return { name: 'بانک ملت', color: 'from-red-600 to-red-800', icon: 'building' };
    if (p.startsWith('502229')) return { name: 'بانک پاسارگاد', color: 'from-yellow-500 to-amber-700', icon: 'shield' };
    if (p.startsWith('622106')) return { name: 'بانک پارسیان', color: 'from-rose-700 to-red-900', icon: 'briefcase' };
    if (p.length >= 6) return { name: 'کارت شتابی', color: 'from-gray-700 to-gray-900', icon: 'credit-card' };
    return { name: 'شماره کارت نامعتبر', color: 'from-gray-300 to-gray-400', icon: 'credit-card' };
}

function formatCardInput(e) {
    let v = e.target.value.replace(/\D/g, '');
    if (v.length > 16) v = v.substring(0, 16);
    let formatted = v.match(/.{1,4}/g)?.join('-') || v;
    e.target.value = formatted;

    const bankInfo = detectBank(v);
    const preview = document.getElementById('new-card-preview');
    if (preview) {
        preview.className = `w-full h-32 rounded-xl bg-gradient-to-r ${bankInfo.color} p-4 text-white shadow-inner flex flex-col justify-between transition-all`;
        document.getElementById('new-card-bank-name').textContent = bankInfo.name;
        document.getElementById('new-card-number-display').textContent = formatted || '---- ---- ---- ----';
    }
}

export function startPayment(amount, cartData, onSuccess) {
    currentAmount = amount;
    successCallback = onSuccess;
    showPaymentSheet();
}

function closeGateway() {
    clearAllIntervals();
    const sheet = document.getElementById('pg-sheet-overlay');
    if (sheet) {
        sheet.classList.add('opacity-0');
        const content = document.getElementById('pg-sheet-content');
        if (content) content.classList.add('translate-y-full');
        setTimeout(() => sheet.remove(), 300);
    }
    const gateway = document.getElementById('pg-shaparak-overlay');
    if (gateway) {
        gateway.classList.add('opacity-0');
        setTimeout(() => gateway.remove(), 300);
    }
    const receipt = document.getElementById('pg-receipt-overlay');
    if (receipt) {
        receipt.classList.add('opacity-0');
        setTimeout(() => receipt.remove(), 300);
    }
}

/* ==========================================================================
 * STEP 1: PAYMENT METHOD SHEET
 * ========================================================================== */
function showPaymentSheet() {
    const existing = document.getElementById('pg-sheet-overlay');
    if (existing) existing.remove();

    const isWalletSufficient = WALLET_BALANCE >= currentAmount;
    const walletRemaining = isWalletSufficient ? 0 : currentAmount - WALLET_BALANCE;

    const overlay = document.createElement('div');
    overlay.id = 'pg-sheet-overlay';
    overlay.className = 'fixed inset-0 z-[9999] bg-black/60 flex items-end justify-center opacity-0 transition-opacity duration-300 font-vazir';

    overlay.innerHTML = `
        <div id="pg-sheet-content" class="bg-gray-50 w-full max-w-md rounded-t-3xl overflow-hidden transform translate-y-full transition-transform duration-300 flex flex-col max-h-[90vh]">

            <div class="p-4 bg-white border-b border-gray-100 flex justify-between items-center shrink-0">
                <div class="flex items-center gap-2">
                    <div class="w-2 h-5 bg-snapp rounded-full"></div>
                    <h3 class="font-black text-sm text-gray-900">انتخاب شیوه پرداخت</h3>
                </div>
                <button id="pg-close-sheet" class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200">
                    <i data-lucide="x" class="w-4 h-4"></i>
                </button>
            </div>

            <div class="overflow-y-auto p-4 space-y-4 flex-1">
                <!-- Payable Amount -->
                <div class="bg-gradient-to-r from-snapp-light to-pink-50 rounded-2xl p-4 shadow-sm border border-snapp/10 flex justify-between items-center">
                    <span class="text-xs font-bold text-gray-600">مبلغ قابل پرداخت:</span>
                    <div class="font-black text-snapp text-lg">${formatPrice(currentAmount)} <span class="text-[10px] text-gray-400 font-normal">تومان</span></div>
                </div>

                <!-- Wallet -->
                <label class="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-3 cursor-pointer hover:border-snapp transition-colors">
                    <div class="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                        <i data-lucide="wallet" class="w-5 h-5"></i>
                    </div>
                    <div class="flex-1">
                        <div class="font-bold text-xs text-gray-900">کیف پول لقمه</div>
                        <div class="text-[10px] text-gray-500 mt-1">موجودی: ${formatPrice(WALLET_BALANCE)} تومان</div>
                    </div>
                    <input type="radio" name="pay_method" value="wallet" class="w-4 h-4 text-snapp focus:ring-snapp border-gray-300" ${isWalletSufficient ? 'checked' : ''}>
                </label>
                ${!isWalletSufficient ? `<div class="text-[10px] font-bold text-rose-500 px-2 -mt-2">کسری موجودی: ${formatPrice(walletRemaining)} تومان از درگاه پرداخت می‌شود.</div>` : ''}

                <!-- Saved Cards -->
                <h4 class="text-[11px] font-black text-gray-900 mt-4 mb-2 flex items-center gap-1.5"><i data-lucide="credit-card" class="w-3.5 h-3.5 text-snapp"></i> کارت‌های بانکی من</h4>

                ${savedCards.map((c, idx) => `
                    <label class="bg-white rounded-2xl p-3.5 shadow-sm border border-gray-100 flex items-center gap-3 cursor-pointer hover:border-snapp transition-colors">
                        <div class="w-12 h-8 rounded bg-gradient-to-r ${c.color} flex items-center justify-center text-white shrink-0 shadow-inner">
                            <i data-lucide="${c.icon}" class="w-4 h-4 opacity-50"></i>
                        </div>
                        <div class="flex-1">
                            <div class="font-bold text-xs text-gray-900" dir="ltr">${toPersianDigits(c.number)}</div>
                            <div class="text-[10px] text-gray-500 mt-1">${c.bank}</div>
                        </div>
                        <input type="radio" name="pay_method" value="${c.raw}" class="w-4 h-4 text-snapp focus:ring-snapp border-gray-300" ${!isWalletSufficient && idx === 0 ? 'checked' : ''}>
                    </label>
                `).join('')}

                <!-- Add New Card Toggle -->
                <div id="pg-add-card-btn" class="bg-gray-50 rounded-2xl p-3.5 border border-dashed border-gray-300 flex items-center justify-center gap-2 cursor-pointer hover:bg-gray-100 transition-colors text-snapp font-bold text-xs">
                    <i data-lucide="plus-circle" class="w-4 h-4"></i> افزودن کارت بانکی جدید
                </div>

                <!-- Add New Card Form (Hidden by default) -->
                <div id="pg-new-card-form" class="hidden bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
                    <div id="new-card-preview" class="w-full h-32 rounded-xl bg-gradient-to-r from-gray-700 to-gray-900 p-4 text-white shadow-inner flex flex-col justify-between transition-all mb-4">
                        <div id="new-card-bank-name" class="text-xs font-bold text-gray-300">کارت بانکی شتاب</div>
                        <div id="new-card-number-display" class="font-mono text-lg tracking-widest text-left" dir="ltr">---- ---- ---- ----</div>
                    </div>

                    <div class="space-y-3">
                        <div>
                            <label class="text-[10px] font-bold text-gray-600 mb-1 block">شماره کارت ۱۶ رقمی</label>
                            <input type="text" id="pg-input-pan" placeholder="xxxx-xxxx-xxxx-xxxx" dir="ltr" class="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono text-center focus:border-snapp focus:ring-1 focus:ring-snapp outline-none">
                        </div>
                        <div class="flex gap-2">
                            <button id="pg-save-new-card" class="flex-1 bg-gray-800 text-white font-bold text-xs py-2 rounded-lg hover:bg-gray-900">ذخیره و استفاده</button>
                            <button id="pg-cancel-new-card" class="flex-1 bg-gray-100 text-gray-600 font-bold text-xs py-2 rounded-lg hover:bg-gray-200">انصراف</button>
                        </div>
                    </div>
                </div>

            </div>

            <div class="p-4 bg-white border-t border-gray-100 shrink-0">
                <button id="pg-proceed-btn" class="w-full bg-snapp hover:bg-snapp-hover text-white font-black text-sm py-3.5 rounded-2xl shadow-lg shadow-pink-500/30 transition-all flex items-center justify-center gap-2 active:scale-95">
                    <span>پرداخت امن</span>
                    <i data-lucide="lock" class="w-4 h-4"></i>
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);
    lucide.createIcons();

    requestAnimationFrame(() => {
        overlay.classList.remove('opacity-0');
        document.getElementById('pg-sheet-content').classList.remove('translate-y-full');
    });

    // Event Listeners
    document.getElementById('pg-close-sheet').onclick = closeGateway;

    document.getElementById('pg-add-card-btn').onclick = () => {
        document.getElementById('pg-add-card-btn').classList.add('hidden');
        document.getElementById('pg-new-card-form').classList.remove('hidden');
    };

    document.getElementById('pg-cancel-new-card').onclick = () => {
        document.getElementById('pg-new-card-form').classList.add('hidden');
        document.getElementById('pg-add-card-btn').classList.remove('hidden');
        document.getElementById('pg-input-pan').value = '';
        formatCardInput({ target: { value: '' } });
    };

    document.getElementById('pg-input-pan').addEventListener('input', formatCardInput);

    document.getElementById('pg-save-new-card').onclick = () => {
        const pan = document.getElementById('pg-input-pan').value.replace(/\D/g, '');
        if (pan.length !== 16) {
            alert('شماره کارت باید ۱۶ رقم باشد.');
            return;
        }
        showShaparakGateway(pan);
    };

    document.getElementById('pg-proceed-btn').onclick = () => {
        const selected = document.querySelector('input[name="pay_method"]:checked');
        if (!selected) return;

        if (selected.value === 'wallet') {
            if (isWalletSufficient) {
                showSuccessReceipt('wallet');
            } else {
                showShaparakGateway('');
            }
        } else {
            showShaparakGateway(selected.value);
        }
    };
}

/* ==========================================================================
 * STEP 2: SHAPARAK GATEWAY SIMULATION
 * ========================================================================== */
let captchaCode = '';

function generateCaptcha() {
    const canvas = document.getElementById('pg-captcha-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    captchaCode = Math.floor(10000 + Math.random() * 90000).toString();

    // Noise lines
    for(let i=0; i<6; i++) {
        ctx.beginPath();
        ctx.moveTo(Math.random()*canvas.width, Math.random()*canvas.height);
        ctx.lineTo(Math.random()*canvas.width, Math.random()*canvas.height);
        ctx.strokeStyle = ['#cbd5e1', '#94a3b8', '#fecdd3'][Math.floor(Math.random()*3)];
        ctx.lineWidth = 1.5;
        ctx.stroke();
    }

    // Draw distorted text
    ctx.font = 'bold 26px Courier New';
    for(let i=0; i<captchaCode.length; i++) {
        ctx.save();
        ctx.translate(15 + i * 20, 28 + Math.random() * 5);
        ctx.rotate((Math.random() - 0.5) * 0.5);
        ctx.fillStyle = '#334155';
        ctx.fillText(captchaCode[i], 0, 0);
        ctx.restore();
    }
}

function requestDynamicOTP() {
    const btn = document.getElementById('pg-otp-btn');
    const input = document.getElementById('pg-otp-input');

    btn.disabled = true;
    let timer = 120;

    const interval = setInterval(() => {
        timer--;
        const m = Math.floor(timer / 60);
        const s = timer % 60;
        btn.textContent = toPersianDigits(`${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')} تا درخواست مجدد`);

        if (timer <= 0) {
            clearInterval(interval);
            btn.disabled = false;
            btn.textContent = 'دریافت رمز پویا';
        }
    }, 1000);
    activeIntervals.push(interval);

    // Auto fill mock OTP after 3 seconds
    setTimeout(() => {
        input.value = '492817';

        // Show Toast
        const toast = document.createElement('div');
        toast.className = 'fixed top-4 left-1/2 -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-2xl z-[10000] flex items-center gap-2 animate-bounce';
        toast.innerHTML = `<i data-lucide="message-square" class="w-4 h-4 text-sky-400"></i> رمز پویا: ۴۹۲۸۱۷`;
        document.body.appendChild(toast);
        lucide.createIcons();
        setTimeout(() => toast.remove(), 4000);
    }, 3000);
}

function showShaparakGateway(prefillCard) {
    const existingSheet = document.getElementById('pg-sheet-overlay');
    if (existingSheet) {
        existingSheet.classList.add('opacity-0');
        setTimeout(() => existingSheet.remove(), 300);
    }

    const payAmount = WALLET_BALANCE < currentAmount && document.querySelector('input[name="pay_method"]:checked')?.value === 'wallet'
                      ? currentAmount - WALLET_BALANCE
                      : currentAmount;

    const overlay = document.createElement('div');
    overlay.id = 'pg-shaparak-overlay';
    overlay.className = 'fixed inset-0 z-[9999] bg-gray-100 opacity-0 transition-opacity duration-300 font-vazir overflow-y-auto';

    overlay.innerHTML = `
        <!-- Shaparak Header -->
        <div class="bg-white shadow-sm border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
            <div class="flex items-center gap-2">
                <div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white relative">
                    <i data-lucide="shield-check" class="w-5 h-5"></i>
                    <span class="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 border-2 border-white rounded-full animate-pulse"></span>
                </div>
                <div>
                    <div class="text-[11px] font-black text-blue-900 flex items-center gap-1">
                        پرداخت الکترونیک سامان کیش
                        <span class="bg-emerald-50 text-emerald-700 text-[8px] font-bold px-1 py-0.5 rounded border border-emerald-200 flex items-center gap-0.5">
                            <i data-lucide="lock" class="w-2 h-2"></i>SSL امن
                        </span>
                    </div>
                    <div class="text-[9px] text-gray-500 mt-0.5">شبکه الکترونیکی پرداخت کارت (شاپرک)</div>
                </div>
            </div>
            <div class="text-left font-mono text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded border border-rose-100" id="shaparak-timer">
                ۱۰:۰۰
            </div>
        </div>

        <div class="max-w-md mx-auto p-4 space-y-4 pb-24">

            <!-- Merchant Info -->
            <div class="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
                <div class="flex justify-between items-center mb-3 pb-3 border-b border-gray-100">
                    <span class="text-[10px] text-gray-500 font-bold">نام پذیرنده:</span>
                    <span class="text-xs font-black text-gray-900">لقمه‌شاپ / شرکت ایده گزین</span>
                </div>
                <div class="flex justify-between items-center mb-3 pb-3 border-b border-gray-100">
                    <span class="text-[10px] text-gray-500 font-bold">شماره پایانه / پذیرنده:</span>
                    <span class="text-[11px] font-mono text-gray-700" dir="ltr">21489035 / 18392</span>
                </div>
                <div class="flex justify-between items-center bg-sky-50 rounded-xl p-3 border border-sky-100">
                    <span class="text-xs font-bold text-sky-900">مبلغ پرداخت:</span>
                    <div class="text-left">
                        <div class="font-black text-sky-700 text-lg">${formatPrice(payAmount)} <span class="text-[10px] font-normal text-sky-600">تومان</span></div>
                        <div class="text-[10px] text-sky-500 mt-0.5">${formatPrice(payAmount * 10)} ریال</div>
                    </div>
                </div>
            </div>

            <!-- Card Inputs -->
            <div class="bg-white rounded-2xl p-4 shadow-sm border border-gray-200 space-y-4">

                <div>
                    <label class="text-[10px] font-bold text-gray-600 mb-1.5 block">شماره کارت</label>
                    <div class="relative">
                        <input type="text" id="pg-card-pan" value="${prefillCard.match(/.{1,4}/g)?.join('-') || ''}" placeholder="xxxx-xxxx-xxxx-xxxx" dir="ltr" class="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2.5 text-sm font-mono text-center focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors">
                        <i data-lucide="credit-card" class="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2"></i>
                    </div>
                </div>

                <div class="flex gap-3">
                    <div class="flex-1">
                        <label class="text-[10px] font-bold text-gray-600 mb-1.5 block">شماره شناسایی دوم (CVV2)</label>
                        <div class="relative">
                            <input type="password" id="pg-card-cvv" placeholder="***" dir="ltr" class="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2.5 text-sm font-mono text-center focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors" maxlength="4">
                            <button type="button" onclick="window.PG_API.toggleCvvVisibility(this)" class="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                <i data-lucide="eye" class="w-4 h-4"></i>
                            </button>
                        </div>
                    </div>
                    <div class="flex-1">
                        <label class="text-[10px] font-bold text-gray-600 mb-1.5 block">تاریخ انقضا</label>
                        <div class="flex gap-1 items-center bg-gray-50 border border-gray-300 rounded-xl px-2 py-2 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-colors" dir="ltr">
                            <input type="text" id="pg-card-yy" placeholder="YY" class="w-full bg-transparent text-sm font-mono text-center outline-none" maxlength="2">
                            <span class="text-gray-400">/</span>
                            <input type="text" id="pg-card-mm" placeholder="MM" class="w-full bg-transparent text-sm font-mono text-center outline-none" maxlength="2">
                        </div>
                    </div>
                </div>

                <div>
                    <label class="text-[10px] font-bold text-gray-600 mb-1.5 block">کد امنیتی</label>
                    <div class="flex gap-2 h-11">
                        <input type="text" id="pg-captcha-in" placeholder="کد تصویر" dir="ltr" class="flex-1 bg-gray-50 border border-gray-300 rounded-xl px-3 text-sm font-mono text-center focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors" maxlength="5">
                        <div class="w-24 bg-gray-100 rounded-xl border border-gray-300 overflow-hidden relative">
                            <canvas id="pg-captcha-canvas" width="94" height="42" class="w-full h-full"></canvas>
                        </div>
                        <button onclick="window.PG_API.refreshCaptcha()" class="w-11 bg-gray-100 border border-gray-300 rounded-xl flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors">
                            <i data-lucide="refresh-cw" class="w-4 h-4"></i>
                        </button>
                    </div>
                </div>

                <div>
                    <label class="text-[10px] font-bold text-gray-600 mb-1.5 block">رمز اینترنتی (پویا)</label>
                    <div class="flex gap-2 h-11">
                        <input type="password" id="pg-otp-input" placeholder="رمز ۶ رقمی" dir="ltr" class="w-1/2 bg-gray-50 border border-gray-300 rounded-xl px-3 text-sm font-mono text-center focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors" maxlength="8">
                        <button id="pg-otp-btn" onclick="window.PG_API.requestOTP()" class="w-1/2 bg-gray-100 border border-gray-300 rounded-xl text-[10px] font-bold text-gray-700 hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                            دریافت رمز پویا
                        </button>
                    </div>
                </div>
            </div>

            <!-- Warning -->
            <div class="text-[9px] text-gray-500 font-medium text-justify leading-relaxed bg-gray-200/50 p-3 rounded-xl border border-gray-200">
                <i data-lucide="info" class="w-3 h-3 inline-block mb-0.5 ml-0.5 text-gray-400"></i>
                لطفاً پیش از انجام تراکنش، از تطابق آدرس مرورگر با دامنه شاپرک (shaparak.ir) اطمینان حاصل فرمایید. از صفحه کلید ایمن برای ورود رمز استفاده کنید.
            </div>

        </div>

        <!-- Action Footer -->
        <div class="fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 p-4 flex gap-3 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] z-20">
            <button onclick="window.PG_API.cancelPayment()" class="flex-1 bg-gray-100 text-gray-600 font-bold text-xs py-3.5 rounded-xl border border-gray-200 hover:bg-gray-200 transition-colors active:scale-95">انصراف</button>
            <button onclick="window.PG_API.processPayment()" id="pg-final-pay-btn" class="flex-1 bg-emerald-500 text-white font-black text-xs py-3.5 rounded-xl shadow-lg shadow-emerald-500/30 hover:bg-emerald-600 transition-colors active:scale-95 flex items-center justify-center gap-2">
                پرداخت
            </button>
        </div>
    `;

    document.body.appendChild(overlay);
    lucide.createIcons();

    // Start Timers & Captcha
    generateCaptcha();

    let shTimer = 600;
    const shInterval = setInterval(() => {
        shTimer--;
        const m = Math.floor(shTimer / 60);
        const s = shTimer % 60;
        const el = document.getElementById('shaparak-timer');
        if (el) el.textContent = toPersianDigits(`${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);

        if (shTimer <= 0) {
            clearInterval(shInterval);
            alert('زمان نشست پرداخت منقضی شد.');
            closeGateway();
        }
    }, 1000);
    activeIntervals.push(shInterval);

    requestAnimationFrame(() => overlay.classList.remove('opacity-0'));
}

/* ==========================================================================
 * STEP 3: SUCCESS RECEIPT
 * ========================================================================== */
function showSuccessReceipt(method) {
    const gateway = document.getElementById('pg-shaparak-overlay');
    if (gateway) {
        gateway.classList.add('opacity-0');
        setTimeout(() => gateway.remove(), 300);
    }

    const overlay = document.createElement('div');
    overlay.id = 'pg-receipt-overlay';
    overlay.className = 'fixed inset-0 z-[9999] bg-gray-50 flex flex-col opacity-0 transition-opacity duration-300 font-vazir overflow-y-auto pb-24';

    const rrn = Math.floor(100000000000 + Math.random() * 900000000000).toString();
    const track = Math.floor(1000000000 + Math.random() * 9000000000).toString();
    const date = new Date().toLocaleDateString('fa-IR', { year: 'numeric', month: 'long', day: 'numeric' });
    const time = new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });

    let cardStr = 'کیف پول لقمه';
    if (method !== 'wallet') {
        const pan = document.getElementById('pg-card-pan')?.value || '6037-****-****-4821';
        cardStr = pan.substring(0, 4) + '-****-****-' + pan.substring(pan.length - 4);
    }

    overlay.innerHTML = `
        <div class="bg-gradient-to-b from-emerald-500 to-emerald-600 h-48 w-full absolute top-0 left-0 rounded-b-[40px] shadow-sm"></div>

        <div class="max-w-md mx-auto px-4 pt-16 relative z-10">

            <div class="bg-white rounded-3xl p-6 shadow-xl border border-gray-100 text-center relative mt-6">

                <div class="w-20 h-20 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full border-4 border-white shadow-lg flex items-center justify-center text-white absolute -top-10 left-1/2 -translate-x-1/2">
                    <i data-lucide="check" class="w-10 h-10"></i>
                </div>

                <h2 class="font-black text-gray-900 text-lg mt-10 mb-1">پرداخت با موفقیت انجام شد</h2>
                <p class="text-xs text-gray-500 mb-6">سفارش شما ثبت و در حال آماده‌سازی است.</p>

                <div class="bg-gray-50 rounded-2xl p-4 border border-gray-100 space-y-3 text-right">
                    <div class="flex justify-between items-center border-b border-gray-200 border-dashed pb-2">
                        <span class="text-[10px] font-bold text-gray-500">پذیرنده:</span>
                        <span class="text-xs font-black text-gray-900">لقمه‌فود / لقمه‌شاپ</span>
                    </div>
                    <div class="flex justify-between items-center border-b border-gray-200 border-dashed pb-2">
                        <span class="text-[10px] font-bold text-gray-500">تاریخ و زمان:</span>
                        <span class="text-[11px] font-bold text-gray-800">${date} - ${time}</span>
                    </div>
                    <div class="flex justify-between items-center border-b border-gray-200 border-dashed pb-2">
                        <span class="text-[10px] font-bold text-gray-500">مبدا پرداخت:</span>
                        <span class="text-[11px] font-mono text-gray-800" dir="ltr">${toPersianDigits(cardStr)}</span>
                    </div>
                    <div class="flex justify-between items-center border-b border-gray-200 border-dashed pb-2">
                        <span class="text-[10px] font-bold text-gray-500">کد پیگیری:</span>
                        <span class="text-[11px] font-mono font-bold text-gray-800">${toPersianDigits(track)}</span>
                    </div>
                    <div class="flex justify-between items-center border-b border-gray-200 border-dashed pb-2">
                        <span class="text-[10px] font-bold text-gray-500">شماره ارجاع (RRN):</span>
                        <span class="text-[11px] font-mono text-gray-800">${toPersianDigits(rrn)}</span>
                    </div>
                    <div class="flex justify-between items-center pt-1">
                        <span class="text-[11px] font-black text-gray-900">مبلغ پرداخت شده:</span>
                        <span class="text-sm font-black text-emerald-600">${formatPrice(currentAmount)} <span class="text-[9px] font-normal text-gray-500">تومان</span></span>
                    </div>
                </div>

            </div>

            <button onclick="window.PG_API.finalizeAndRedirect()" class="w-full mt-6 bg-gray-900 hover:bg-black text-white font-black text-xs py-4 rounded-2xl shadow-lg shadow-gray-900/30 transition-colors active:scale-95 flex items-center justify-center gap-2">
                بازگشت به برنامه و مشاهده سفارش <i data-lucide="arrow-left" class="w-4 h-4"></i>
            </button>

        </div>
    `;

    document.body.appendChild(overlay);
    lucide.createIcons();
    requestAnimationFrame(() => overlay.classList.remove('opacity-0'));
}

/* ==========================================================================
 * EXPOSE GLOBAL API FOR INLINE HANDLERS
 * ========================================================================== */
window.PG_API = {
    refreshCaptcha: generateCaptcha,
    requestOTP: requestDynamicOTP,
    cancelPayment: closeGateway,
    toggleCvvVisibility: function(btn) {
        const input = document.getElementById('pg-card-cvv');
        if (!input) return;
        const isHidden = input.type === 'password';
        input.type = isHidden ? 'text' : 'password';
        btn.innerHTML = isHidden
            ? `<i data-lucide="eye-off" class="w-4 h-4"></i>`
            : `<i data-lucide="eye" class="w-4 h-4"></i>`;
        if (window.lucide) lucide.createIcons();
    },
    processPayment: function() {
        const pan = document.getElementById('pg-card-pan').value;
        const cvv = document.getElementById('pg-card-cvv').value;
        const mm = document.getElementById('pg-card-mm').value;
        const yy = document.getElementById('pg-card-yy').value;
        const cap = document.getElementById('pg-captcha-in').value;
        const otp = document.getElementById('pg-otp-input').value;

        if (pan.length < 16 || cvv.length < 3 || mm.length !== 2 || yy.length !== 2 || cap.length !== 5 || otp.length < 5) {
            alert('لطفاً تمامی فیلدها را به درستی تکمیل نمایید.');
            return;
        }

        if (cap !== captchaCode) {
            alert('کد امنیتی اشتباه است.');
            generateCaptcha();
            document.getElementById('pg-captcha-in').value = '';
            return;
        }

        const btn = document.getElementById('pg-final-pay-btn');
        btn.innerHTML = `<div style="width:20px;height:20px;border:2px solid rgba(255,255,255,0.3);border-top-color:#fff;border-radius:50%;animation:spin 1s linear infinite;"></div> در حال ارتباط با بانک...`;
        btn.disabled = true;

        setTimeout(() => {
            showSuccessReceipt('gateway');
        }, 1500);
    },
    finalizeAndRedirect: function() {
        closeGateway();
        if (typeof successCallback === 'function') {
            successCallback();
        }
    }
};