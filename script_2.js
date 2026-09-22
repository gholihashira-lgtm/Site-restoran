/* ============================================================
   script_2.js — Loghme Advanced 3D Engine + LoghmeYar AI Concierge
   ============================================================ */

/* ---------- Styles injection ---------- */
(function injectLoghmeYarStyles() {
    if (typeof document === 'undefined') return;
    if (document.getElementById('loghme-yar-styles')) return;

    const style = document.createElement('style');
    style.id = 'loghme-yar-styles';
    style.textContent = `
        .loghme-yar-orb {
            position: fixed;
            bottom: calc(110px + env(safe-area-inset-bottom, 0px));
            left: 16px;
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 6px 12px 6px 6px;
            background: linear-gradient(135deg, #ec4899 0%, #f43f5e 50%, #FF4747 100%);
            color: #fff;
            border: none;
            border-radius: 9999px;
            box-shadow: 0 12px 32px -8px rgba(236, 72, 153, 0.55), 0 4px 12px -4px rgba(244, 63, 94, 0.4);
            cursor: pointer;
            z-index: 35;
            font-family: 'Vazirmatn', system-ui, sans-serif;
            transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
            overflow: visible;
        }
        .loghme-yar-orb:active { transform: scale(0.94); }
        .loghme-yar-orb__aura {
            position: absolute;
            inset: -8px;
            border-radius: 9999px;
            background: radial-gradient(circle, rgba(236,72,153,0.55) 0%, rgba(236,72,153,0) 70%);
            animation: loghmeAuraPulse 2.4s ease-in-out infinite;
            pointer-events: none;
            z-index: -1;
        }
        @keyframes loghmeAuraPulse {
            0%, 100% { transform: scale(1); opacity: 0.85; }
            50% { transform: scale(1.25); opacity: 0.35; }
        }
        .loghme-yar-orb__core {
            width: 34px;
            height: 34px;
            border-radius: 9999px;
            background: rgba(255,255,255,0.22);
            backdrop-filter: blur(6px);
            -webkit-backdrop-filter: blur(6px);
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            border: 1px solid rgba(255,255,255,0.35);
        }
        .loghme-yar-orb__label {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            line-height: 1.15;
            text-align: right;
        }
        .loghme-yar-orb__title {
            font-size: 12px;
            font-weight: 900;
            letter-spacing: -0.2px;
        }
        .loghme-yar-orb__sub {
            font-size: 9px;
            opacity: 0.85;
            font-weight: 600;
        }

        #loghme-yar-modal {
            position: fixed;
            inset: 0;
            z-index: 9998;
            display: flex;
            align-items: flex-end;
            justify-content: center;
            opacity: 0;
            transition: opacity 0.28s ease;
            font-family: 'Vazirmatn', system-ui, sans-serif;
            pointer-events: none;
        }
        #loghme-yar-modal.ly-open {
            opacity: 1;
            pointer-events: auto;
        }
        .ly-backdrop {
            position: absolute;
            inset: 0;
            background: rgba(0,0,0,0.62);
            backdrop-filter: blur(4px);
            -webkit-backdrop-filter: blur(4px);
        }
        .ly-drawer {
            position: relative;
            width: 100%;
            max-width: 448px;
            height: 88vh;
            max-height: 88vh;
            background: #ffffff;
            border-radius: 24px 24px 0 0;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            transform: translateY(100%);
            transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
            box-shadow: 0 -20px 60px -10px rgba(0,0,0,0.35);
        }
        #loghme-yar-modal.ly-open .ly-drawer { transform: translateY(0); }

        .ly-header {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 14px 16px;
            border-bottom: 1px solid #f1f5f9;
            background: #ffffff;
            flex-shrink: 0;
        }
        .ly-avatar {
            position: relative;
            width: 40px;
            height: 40px;
            border-radius: 9999px;
            background: linear-gradient(135deg, #ec4899, #FF4747);
            display: flex;
            align-items: center;
            justify-content: center;
            color: #fff;
            flex-shrink: 0;
            box-shadow: 0 6px 16px -4px rgba(236,72,153,0.55);
        }
        .ly-avatar__online {
            position: absolute;
            bottom: 0;
            right: 0;
            width: 11px;
            height: 11px;
            background: #10b981;
            border: 2px solid #fff;
            border-radius: 9999px;
        }
        .ly-title-wrap { flex: 1; min-width: 0; text-align: right; }
        .ly-title {
            font-size: 13px;
            font-weight: 900;
            color: #0f172a;
            line-height: 1.2;
        }
        .ly-subtitle {
            font-size: 10px;
            color: #10b981;
            font-weight: 700;
            margin-top: 2px;
            display: flex;
            align-items: center;
            gap: 4px;
        }
        .ly-icon-btn {
            width: 32px;
            height: 32px;
            border-radius: 9999px;
            border: 1px solid #e5e7eb;
            background: #f8fafc;
            color: #475569;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            flex-shrink: 0;
            transition: background 0.15s;
        }
        .ly-icon-btn:hover { background: #e2e8f0; }

        .ly-chat {
            flex: 1;
            overflow-y: auto;
            padding: 16px;
            background: linear-gradient(180deg, #f8fafc 0%, #ffffff 100%);
            display: flex;
            flex-direction: column;
            gap: 12px;
        }
        .ly-msg-user {
            align-self: flex-end;
            max-width: 82%;
            background: linear-gradient(135deg, #ec4899, #FF4747);
            color: #fff;
            padding: 10px 14px;
            border-radius: 16px 16px 4px 16px;
            font-size: 12px;
            font-weight: 600;
            line-height: 1.6;
            box-shadow: 0 6px 16px -6px rgba(236,72,153,0.5);
            direction: rtl;
        }
        .ly-msg-bot {
            align-self: flex-start;
            max-width: 88%;
            display: flex;
            gap: 8px;
            align-items: flex-start;
            direction: rtl;
        }
        .ly-msg-bot__avatar {
            width: 28px;
            height: 28px;
            border-radius: 9999px;
            background: linear-gradient(135deg, #ec4899, #FF4747);
            color: #fff;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            font-size: 10px;
            font-weight: 900;
        }
        .ly-msg-bot__bubble {
            background: #ffffff;
            border: 1px solid #f1f5f9;
            color: #1e293b;
            padding: 10px 13px;
            border-radius: 16px 16px 16px 4px;
            font-size: 12px;
            line-height: 1.75;
            font-weight: 500;
            box-shadow: 0 2px 8px -4px rgba(0,0,0,0.06);
            flex: 1;
        }
        .ly-msg-typing {
            display: inline-flex;
            gap: 4px;
            align-items: center;
            padding: 4px 0;
        }
        .ly-msg-typing span {
            width: 5px;
            height: 5px;
            border-radius: 9999px;
            background: #ec4899;
            animation: lyTyping 1.2s infinite ease-in-out;
        }
        .ly-msg-typing span:nth-child(2) { animation-delay: 0.15s; }
        .ly-msg-typing span:nth-child(3) { animation-delay: 0.3s; }
        @keyframes lyTyping {
            0%, 60%, 100% { transform: translateY(0); opacity: 0.5; }
            30% { transform: translateY(-4px); opacity: 1; }
        }

        .ly-cards {
            display: flex;
            flex-direction: column;
            gap: 8px;
            margin-top: 4px;
            width: 100%;
        }
        .ly-card {
            display: flex;
            gap: 10px;
            padding: 10px;
            background: #ffffff;
            border: 1px solid #f1f5f9;
            border-radius: 14px;
            align-items: center;
            box-shadow: 0 2px 10px -6px rgba(0,0,0,0.08);
        }
        .ly-card__img {
            width: 56px;
            height: 56px;
            border-radius: 10px;
            object-fit: cover;
            flex-shrink: 0;
            background: #f8fafc;
        }
        .ly-card__body {
            flex: 1;
            min-width: 0;
            display: flex;
            flex-direction: column;
            gap: 3px;
            direction: rtl;
            text-align: right;
        }
        .ly-card__title {
            font-size: 11px;
            font-weight: 800;
            color: #0f172a;
            line-height: 1.3;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        .ly-card__meta {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 9px;
            color: #64748b;
            font-weight: 700;
        }
        .ly-card__rating {
            display: inline-flex;
            align-items: center;
            gap: 2px;
            color: #f59e0b;
            background: #fef3c7;
            padding: 1px 6px;
            border-radius: 6px;
        }
        .ly-card__discount {
            display: inline-flex;
            align-items: center;
            background: linear-gradient(135deg, #ec4899, #ef4444);
            color: #fff;
            font-size: 9px;
            font-weight: 900;
            padding: 1px 6px;
            border-radius: 6px;
        }
        .ly-card__price-row {
            display: flex;
            align-items: baseline;
            gap: 6px;
            direction: rtl;
        }
        .ly-card__price {
            font-size: 12px;
            font-weight: 900;
            color: #ec4899;
        }
        .ly-card__price-old {
            font-size: 9px;
            color: #94a3b8;
            text-decoration: line-through;
        }
        .ly-card__add {
            padding: 6px 10px;
            background: #fdf2f8;
            color: #ec4899;
            border: 1px solid rgba(236,72,153,0.25);
            border-radius: 10px;
            font-size: 10px;
            font-weight: 900;
            cursor: pointer;
            flex-shrink: 0;
            display: inline-flex;
            align-items: center;
            gap: 4px;
            font-family: inherit;
        }
        .ly-card__add:hover { background: #ec4899; color: #fff; }

        .ly-bundle {
            background: linear-gradient(135deg, #fdf2f8 0%, #fff1f2 100%);
            border: 1px solid rgba(236,72,153,0.18);
            border-radius: 16px;
            padding: 12px;
            display: flex;
            flex-direction: column;
            gap: 10px;
            direction: rtl;
        }
        .ly-bundle__title {
            font-size: 12px;
            font-weight: 900;
            color: #be185d;
            display: flex;
            align-items: center;
            gap: 6px;
        }
        .ly-bundle__row {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 6px 8px;
            background: rgba(255,255,255,0.8);
            border-radius: 10px;
            font-size: 10px;
            font-weight: 700;
            color: #334155;
        }
        .ly-bundle__row img {
            width: 32px;
            height: 32px;
            border-radius: 8px;
            object-fit: cover;
            flex-shrink: 0;
        }
        .ly-bundle__row .ly-bundle__name {
            flex: 1;
            min-width: 0;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        .ly-bundle__row .ly-bundle__price {
            color: #be185d;
            font-weight: 900;
            flex-shrink: 0;
        }
        .ly-bundle__total {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px 4px 0;
            border-top: 1px dashed rgba(236,72,153,0.25);
            font-size: 11px;
        }
        .ly-bundle__total b { color: #be185d; font-weight: 900; font-size: 13px; }
        .ly-bundle__cta {
            width: 100%;
            padding: 11px;
            background: linear-gradient(135deg, #ec4899, #FF4747);
            color: #fff;
            border: none;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 900;
            cursor: pointer;
            box-shadow: 0 8px 18px -6px rgba(236,72,153,0.55);
            font-family: inherit;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
        }
        .ly-bundle__cta:active { transform: scale(0.97); }

        .ly-chips {
            display: flex;
            gap: 8px;
            padding: 10px 14px;
            background: #ffffff;
            border-top: 1px solid #f1f5f9;
            overflow-x: auto;
            flex-shrink: 0;
            scrollbar-width: none;
        }
        .ly-chips::-webkit-scrollbar { display: none; }
        .ly-chip {
            white-space: nowrap;
            padding: 7px 12px;
            border-radius: 9999px;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            color: #334155;
            font-size: 11px;
            font-weight: 700;
            cursor: pointer;
            flex-shrink: 0;
            font-family: inherit;
            transition: all 0.15s;
        }
        .ly-chip:hover {
            background: #fdf2f8;
            border-color: rgba(236,72,153,0.35);
            color: #be185d;
        }

        .ly-input-row {
            display: flex;
            gap: 8px;
            padding: 10px 14px calc(14px + env(safe-area-inset-bottom, 0px));
            background: #ffffff;
            border-top: 1px solid #f1f5f9;
            flex-shrink: 0;
        }
        .ly-input-row input {
            flex: 1;
            padding: 10px 14px;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            font-size: 12px;
            font-family: inherit;
            outline: none;
            transition: border-color 0.15s;
        }
        .ly-input-row input:focus { border-color: #ec4899; background: #ffffff; }
        .ly-send {
            width: 40px;
            height: 40px;
            border-radius: 12px;
            background: linear-gradient(135deg, #ec4899, #FF4747);
            color: #fff;
            border: none;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            box-shadow: 0 6px 14px -6px rgba(236,72,153,0.55);
            flex-shrink: 0;
        }
        .ly-send:active { transform: scale(0.95); }

        @media (max-width: 640px) {
            .loghme-yar-orb {
                bottom: calc(96px + env(safe-area-inset-bottom, 0px));
                left: 12px;
                padding: 5px 10px 5px 5px;
            }
            .loghme-yar-orb__core { width: 30px; height: 30px; }
            .loghme-yar-orb__title { font-size: 11px; }
            .loghme-yar-orb__sub { font-size: 8.5px; }
        }
    `;
    document.head.appendChild(style);
})();

/* ---------- Utility helpers ---------- */
function lyToPersian(n) {
    if (n === null || n === undefined) return '';
    const f = ['۰','۱','۲','۳','۴','۵','۶','۷','۸','۹'];
    return n.toString().replace(/\d/g, x => f[x]);
}

function lyFormatPrice(a) {
    return lyToPersian(Math.round(a).toLocaleString('fa-IR'));
}

function lyEscape(s) {
    if (!s) return '';
    return String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function lyToast(msg) {
    const id = 'ly-toast';
    const existing = document.getElementById(id);
    if (existing) existing.remove();

    const t = document.createElement('div');
    t.id = id;
    t.style.cssText = `
        position: fixed; top: 16px; left: 50%; transform: translateX(-50%) translateY(-40px);
        background: #0f172a; color: #fff; padding: 12px 20px; border-radius: 14px;
        font-size: 12px; font-weight: 800; box-shadow: 0 20px 40px -12px rgba(0,0,0,0.4);
        z-index: 10050; opacity: 0; transition: all 0.3s cubic-bezier(0.16,1,0.3,1);
        font-family: 'Vazirmatn', system-ui, sans-serif;
        display: flex; align-items: center; gap: 8px; max-width: 90vw;
    `;
    t.innerHTML = `<span style="color:#34d399;">✓</span><span>${lyEscape(msg)}</span>`;
    document.body.appendChild(t);
    requestAnimationFrame(() => {
        t.style.transform = 'translateX(-50%) translateY(0)';
        t.style.opacity = '1';
    });
    setTimeout(() => {
        t.style.transform = 'translateX(-50%) translateY(-40px)';
        t.style.opacity = '0';
        setTimeout(() => t.remove(), 320);
    }, 2600);
}

/* ---------- Three.js readiness ---------- */
function waitForThree() {
    if (window.__THREE_READY__) return Promise.resolve();
    if (window.__THREE_ERROR__) return Promise.reject(window.__THREE_ERROR__);

    return new Promise((resolve, reject) => {
        const onReady = () => { cleanup(); resolve(); };
        const onError = () => { cleanup(); reject(window.__THREE_ERROR__); };
        const onTimeout = () => {
            cleanup();
            reject(new Error('زمان انتظار برای بارگذاری Three.js به پایان رسید.'));
        };
        const cleanup = () => {
            window.removeEventListener('three-ready', onReady);
            window.removeEventListener('three-error', onError);
            clearTimeout(timer);
        };
        window.addEventListener('three-ready', onReady);
        window.addEventListener('three-error', onError);
        const timer = setTimeout(onTimeout, 12000);
    });
}

/* ============================================================
   ExplodedViewBuilder
   ============================================================ */
export class ExplodedViewBuilder {
    constructor(product) {
        this.product = product;
        this.targetProgress = 0.18;
        this.currentProgress = 0;
        this.rafId = null;
        this.mouseX = 0;
        this.mouseY = 0;
        this.smoothMouseX = 0;
        this.smoothMouseY = 0;
        this.destroyed = false;
        this.ready = false;
        this.isFlatDish = false;
        this.responsiveBaseZ = 11;

        this.dragActive = false;
        this.dragStartY = 0;
        this.dragStartProgress = 0;
        this.dragVelocity = 0;
        this.lastDragY = 0;
        this.lastDragTime = 0;

        this.layers = [];
        this.labelEls = [];

        document.body.style.overflow = 'hidden';
        this.buildDOM();
        this.boot();
    }

    buildDOM() {
        this.container = document.createElement('div');
        this.container.className = 'exploded-overlay font-vazir';
        Object.assign(this.container.style, {
            position: 'fixed', top: '0', left: '0', width: '100vw',
            height: '100dvh',
            zIndex: '9999',
            background: 'radial-gradient(ellipse at 50% 35%, #1a1a24 0%, #0a0a0e 70%, #050508 100%)',
            overflowY: 'auto', overflowX: 'hidden',
            opacity: '0', transition: 'opacity 0.6s ease',
            WebkitOverflowScrolling: 'touch'
        });

        this.scrollTrack = document.createElement('div');
        Object.assign(this.scrollTrack.style, { position: 'relative', width: '100%', height: '320vh' });

        this.viewport = document.createElement('div');
        Object.assign(this.viewport.style, { position: 'sticky', top: '0', width: '100%', height: '100dvh', overflow: 'hidden' });

        this.canvas = document.createElement('canvas');
        Object.assign(this.canvas.style, { position: 'absolute', top: '0', left: '0', width: '100%', height: '100%', zIndex: '10', pointerEvents: 'none', display: 'block' });

        this.loadingText = document.createElement('div');
        Object.assign(this.loadingText.style, {
            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            color: 'rgba(255,255,255,0.75)', fontWeight: '700', fontSize: '12px', zIndex: '60',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px'
        });
        this.loadingText.innerHTML = `
            <div style="width:40px;height:40px;border:2px solid rgba(255,0,166,0.3);border-top-color:#FF00A6;border-radius:9999px;animation:spin 0.9s linear infinite;"></div>
            <span>در حال رندر نمای سه‌بعدی...</span>
        `;

        this.instruction = document.createElement('div');
        Object.assign(this.instruction.style, {
            position: 'absolute',
            top: 'calc(5.5rem + env(safe-area-inset-top, 0px))',
            left: '50%', transform: 'translateX(-50%)',
            background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.15)', color: '#fff', padding: '8px 16px', borderRadius: '9999px',
            fontSize: '11px', fontWeight: '700', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '8px',
            zIndex: '50', pointerEvents: 'none', opacity: '0', transition: 'opacity 0.5s ease'
        });
        this.instruction.innerHTML = `<i data-lucide="mouse-pointer-click" class="w-4 h-4"></i> با انگشت بکشید تا لایه‌ها باز شوند`;

        this.labelsContainer = document.createElement('div');
        Object.assign(this.labelsContainer.style, { position: 'absolute', inset: '0', zIndex: '40', pointerEvents: 'none' });

        this.progressIndicator = document.createElement('div');
        Object.assign(this.progressIndicator.style, {
            position: 'absolute',
            bottom: 'calc(6.5rem + env(safe-area-inset-bottom, 0px))',
            left: '50%', transform: 'translateX(-50%)',
            width: '80px', height: '3px', background: 'rgba(255,255,255,0.1)', borderRadius: '9999px',
            overflow: 'hidden', zIndex: '45', opacity: '0', transition: 'opacity 0.4s ease'
        });
        this.progressIndicator.innerHTML = `<div id="exploded-progress-fill" style="width:0%;height:100%;background:linear-gradient(90deg,#FF00A6,#FFD600);transition:width 0.1s linear;"></div>`;

        this.footer = document.createElement('div');
        Object.assign(this.footer.style, {
            position: 'absolute', bottom: '0', left: '0', width: '100%',
            padding: '18px 20px calc(24px + env(safe-area-inset-bottom, 0px))',
            background: 'linear-gradient(to top, rgba(10,10,14,0.95) 0%, rgba(10,10,14,0.5) 70%, transparent 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: '50'
        });
        this.footer.innerHTML = `
            <div class="min-w-0 flex-1 ml-3">
                <h3 class="text-white font-black text-sm mb-1 truncate">${lyEscape(this.product.title)}</h3>
                <div class="text-snapp font-black text-lg leading-none" style="color:#FF4747;">
                    ${lyFormatPrice(this.product.price)}
                    <span class="text-[10px] text-gray-400 font-normal">تومان</span>
                </div>
            </div>
            <button id="exploded-add-btn" class="bg-snapp hover:bg-snapp-hover text-white text-xs font-black px-6 py-3.5 rounded-2xl shadow-2xl shadow-pink-500/40 flex items-center gap-2 active:scale-95 transition-transform pointer-events-auto shrink-0 min-h-[44px]" style="background:#FF4747;">
                <i data-lucide="shopping-bag" class="w-4 h-4"></i>
                افزودن به سبد
            </button>
        `;

        this.closeBtn = document.createElement('button');
        Object.assign(this.closeBtn.style, {
            position: 'absolute',
            top: 'calc(1.25rem + env(safe-area-inset-top, 0px))',
            right: '1rem', width: '40px', height: '40px',
            background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.15)', borderRadius: '9999px', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: '50', cursor: 'pointer', pointerEvents: 'auto'
        });
        this.closeBtn.innerHTML = `<i data-lucide="x" class="w-5 h-5"></i>`;

        this.viewport.appendChild(this.canvas);
        this.viewport.appendChild(this.loadingText);
        this.viewport.appendChild(this.labelsContainer);
        this.viewport.appendChild(this.instruction);
        this.viewport.appendChild(this.progressIndicator);
        this.viewport.appendChild(this.closeBtn);
        this.viewport.appendChild(this.footer);
        this.scrollTrack.appendChild(this.viewport);
        this.container.appendChild(this.scrollTrack);
        document.body.appendChild(this.container);

        if (window.lucide) lucide.createIcons();
        requestAnimationFrame(() => { this.container.style.opacity = '1'; });
    }

    async boot() {
        try {
            await waitForThree();
            this.THREE = window.__THREE__;
            this.postFX = window.__POST_FX__;
            this.matMod = window.__MAT__;

            await new Promise(r => requestAnimationFrame(r));
            await new Promise(r => requestAnimationFrame(r));
            if (this.destroyed) return;

            this.setupScene();
            await this.buildModel();
            this.createLabels();
            this.bindEvents();
            this.animate();

            this.loadingText.style.display = 'none';
            this.instruction.style.opacity = '1';
            this.progressIndicator.style.opacity = '1';
            this.ready = true;
        } catch (err) {
            this.showError(err);
        }
    }

    showError(err) {
        if (!this.loadingText) return;
        this.loadingText.style.display = 'flex';
        this.loadingText.innerHTML = `
            <div style="width:44px;height:44px;border-radius:9999px;background:rgba(255,68,68,0.15);border:1px solid rgba(255,68,68,0.4);display:flex;align-items:center;justify-content:center;color:#ff4444;font-size:20px;font-weight:900;">!</div>
            <span style="color:#ff6b6b;font-weight:800;">خطا در بارگذاری نمای سه‌بعدی</span>
            <span style="color:rgba(255,255,255,0.5);font-size:10px;">${lyEscape((err && err.message) || String(err))}</span>
        `;
    }

    setupScene() {
        const THREE = this.THREE;
        const w = window.innerWidth;
        const h = window.innerHeight;
        const aspect = w / h;
        const isPortrait = aspect < 1.0;

        this.scene = new THREE.Scene();
        this.scene.background = null;

        this.camera = new THREE.PerspectiveCamera(isPortrait ? 44 : 38, aspect, 0.1, 100);

        this.responsiveBaseZ = isPortrait
            ? (this.isFlatDish ? 19 : 17.5)
            : (this.isFlatDish ? 12 : 11);
        this.camera.position.set(0, 0, this.responsiveBaseZ);
        this.camera.lookAt(0, 0, 0);

        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance'
        });
        this.renderer.setSize(w, h, false);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        this.matMod.initLighting(this.scene);

        const { EffectComposer, RenderPass, UnrealBloomPass, OutputPass } = this.postFX;

        this.composer = new EffectComposer(this.renderer);
        this.composer.setSize(w, h);
        this.composer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        this.composer.addPass(new RenderPass(this.scene, this.camera));
        this.composer.addPass(new UnrealBloomPass(new THREE.Vector2(w, h), 0.55, 0.55, 0.85));
        this.composer.addPass(new OutputPass());

        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.15;
    }

    async buildModel() {
        let mod;
        let result;
        this.isFlatDish = false;

        if (this.product.id === 4 || this.product.title.includes('بندری')) {
            mod = await import('./bandari-stack.js');
            result = mod.buildBandari3D(this.scene);
        } else if (this.product.id === 1) {
            mod = await import('./burger-classic.js');
            result = mod.buildClassicBurger3D(this.scene);
        } else if (this.product.id === 2) {
            mod = await import('./burger-smash.js');
            result = mod.buildSmashBurger3D(this.scene);
        } else if (this.product.categoryId === 'pizza' || this.product.title.includes('پیتزا')) {
            mod = await import('./pizza-stack.js');
            result = mod.buildPizza3D(this.scene);
            this.isFlatDish = true;
        } else if (this.product.categoryId === 'burgers') {
            mod = await import('./burger-mushroom.js');
            result = mod.buildMushroomBurger3D(this.scene);
        } else {
            mod = await import('./geometry-stack.js');
            this.geoMod = mod;
            mod.explosionLayers.length = 0;
            while (mod.burgerGroup.children.length > 0) mod.burgerGroup.remove(mod.burgerGroup.children[0]);
            mod.buildProduct3D(this.scene, this.product);
            result = { group: mod.burgerGroup, layers: mod.explosionLayers };
            if (['pizza', 'kebab', 'ash', 'traditional', 'appetizers'].includes(this.product.categoryId)) {
                this.isFlatDish = true;
            }
        }

        this.geoMod = mod;
        this.burgerGroup = result.group;
        this.layers = result.layers;

        if (!this.layers || this.layers.length === 0) {
            throw new Error('هیچ لایه‌ای برای این محصول ساخته نشد.');
        }

        if (this.burgerGroup.parent !== this.scene) {
            this.scene.add(this.burgerGroup);
        }

        const w = window.innerWidth;
        const h = window.innerHeight;
        const aspect = w / h;
        const isPortrait = aspect < 1.0;

        if (isPortrait) {
            this.burgerGroup.scale.setScalar(0.68);
        }

        this.camera.fov = isPortrait ? 44 : 38;
        this.responsiveBaseZ = isPortrait
            ? (this.isFlatDish ? 19 : 17.5)
            : (this.isFlatDish ? 12 : 11);
        this.camera.position.set(0, 0, this.responsiveBaseZ);
        this.camera.updateProjectionMatrix();

        this.createAmbientParticles();
    }

    createAmbientParticles() {
        const THREE = this.THREE;
        const count = 400;
        const geo = new THREE.BufferGeometry();
        const pos = new Float32Array(count * 3);
        const speeds = new Float32Array(count);

        for (let i = 0; i < count * 3; i += 3) {
            pos[i] = (Math.random() - 0.5) * 16;
            pos[i + 1] = (Math.random() - 0.5) * 16;
            pos[i + 2] = (Math.random() - 0.5) * 16;
            speeds[i / 3] = 0.2 + Math.random() * 0.7;
        }
        geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        geo.userData = { speeds };

        this.ambientParticles = new THREE.Points(geo, this.matMod.materials.frostParticleMat);
        this.scene.add(this.ambientParticles);
    }

    createLabels() {
        this.labelEls = [];

        this.layers.forEach(layer => {
            const el = document.createElement('div');
            el.className = 'exploded-label';
            el.dataset.side = layer.side || 'right';

            const text = layer.text || 'محتوا';

            if (el.dataset.side === 'left') {
                el.innerHTML = `
                    <span class="exp-text">${lyEscape(text)}</span>
                    <span class="exp-line"></span>
                    <span class="exp-dot"></span>
                `;
            } else {
                el.innerHTML = `
                    <span class="exp-dot"></span>
                    <span class="exp-line"></span>
                    <span class="exp-text">${lyEscape(text)}</span>
                `;
            }

            this.labelsContainer.appendChild(el);
            this.labelEls.push(el);
        });
    }

    bindEvents() {
        this.scrollHandler = () => {
            if (this.dragActive) return;
            const maxScroll = this.scrollTrack.scrollHeight - this.container.clientHeight;
            if (maxScroll <= 0) return;
            const p = Math.max(0, Math.min(1, this.container.scrollTop / maxScroll));
            this.targetProgress = p;

            const fill = document.getElementById('exploded-progress-fill');
            if (fill) fill.style.width = (p * 100) + '%';

            this.instruction.style.opacity = p > 0.06 ? '0' : '1';
            this.progressIndicator.style.opacity = p > 0.95 ? '0' : '1';
        };

        this.mouseHandler = (e) => {
            this.mouseX = (e.clientX / window.innerWidth) * 2 - 1;
            this.mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
        };

        this.touchHandler = (e) => {
            if (e.touches.length > 0) {
                this.mouseX = (e.touches[0].clientX / window.innerWidth) * 2 - 1;
                this.mouseY = -(e.touches[0].clientY / window.innerHeight) * 2 + 1;
            }
        };

        this.directPointerDown = (e) => {
            if (e.target.closest('#exploded-add-btn') || e.target.closest('button')) return;
            this.dragActive = true;
            this.dragStartY = e.clientY;
            this.dragStartProgress = this.targetProgress;
            this.dragVelocity = 0;
            this.lastDragY = e.clientY;
            this.lastDragTime = performance.now();
            this.container.style.overflowY = 'hidden';
        };

        this.directPointerMove = (e) => {
            if (!this.dragActive) return;
            const dy = e.clientY - this.dragStartY;
            const now = performance.now();
            const dt = Math.max(1, now - this.lastDragTime);
            const instantVy = (e.clientY - this.lastDragY) / dt;
            this.dragVelocity = instantVy;
            this.lastDragY = e.clientY;
            this.lastDragTime = now;

            const norm = -dy / (window.innerHeight * 0.55);
            const next = Math.max(0, Math.min(1, this.dragStartProgress + norm));
            this.targetProgress = next;

            const fill = document.getElementById('exploded-progress-fill');
            if (fill) fill.style.width = (next * 100) + '%';
        };

        this.directPointerUp = () => {
            if (!this.dragActive) return;
            this.dragActive = false;
            this.container.style.overflowY = 'auto';
            const inertia = -this.dragVelocity * 0.4;
            this.targetProgress = Math.max(0, Math.min(1, this.targetProgress + inertia));
        };

        this.resizeHandler = () => {
            if (!this.renderer) return;
            const w = window.innerWidth;
            const h = window.innerHeight;
            const aspect = w / h;
            const isPortrait = aspect < 1.0;

            this.camera.aspect = aspect;
            this.camera.fov = isPortrait ? 44 : 38;

            this.responsiveBaseZ = isPortrait
                ? (this.isFlatDish ? 19 : 17.5)
                : (this.isFlatDish ? 12 : 11);

            if (this.burgerGroup) {
                this.burgerGroup.scale.setScalar(isPortrait ? 0.68 : 1.0);
            }

            this.camera.updateProjectionMatrix();
            this.renderer.setSize(w, h, false);
            if (this.composer) this.composer.setSize(w, h);
        };

        this.closeHandler = () => this.destroy();
        this.addHandler = () => {
            if (window.AppAPI && typeof window.AppAPI.handleAddToCart === 'function') {
                window.AppAPI.handleAddToCart(this.product.id, []);
            }
            this.destroy();
        };

        this.container.addEventListener('scroll', this.scrollHandler, { passive: true });
        window.addEventListener('mousemove', this.mouseHandler, { passive: true });
        window.addEventListener('touchstart', this.touchHandler, { passive: true });
        window.addEventListener('touchmove', this.touchHandler, { passive: true });
        window.addEventListener('resize', this.resizeHandler);
        this.closeBtn.addEventListener('click', this.closeHandler);

        this.viewport.addEventListener('pointerdown', this.directPointerDown);
        this.viewport.addEventListener('pointermove', this.directPointerMove);
        this.viewport.addEventListener('pointerup', this.directPointerUp);
        this.viewport.addEventListener('pointercancel', this.directPointerUp);
        this.viewport.addEventListener('pointerleave', this.directPointerUp);

        const addBtn = this.footer.querySelector('#exploded-add-btn');
        if (addBtn) addBtn.addEventListener('click', this.addHandler);
    }

    animate() {
        if (!this.renderer || this.destroyed) return;

        this.currentProgress += (this.targetProgress - this.currentProgress) * 0.09;
        this.smoothMouseX += (this.mouseX - this.smoothMouseX) * 0.06;
        this.smoothMouseY += (this.mouseY - this.smoothMouseY) * 0.06;

        for (let i = 0; i < this.layers.length; i++) {
            const layer = this.layers[i];
            const y = layer.closedY + (layer.openY - layer.closedY) * this.currentProgress;
            layer.mesh.position.y = y;
        }

        const aspectNow = window.innerWidth / window.innerHeight;
        const isPortraitNow = aspectNow < 1.0;

        if (this.burgerGroup) {
            const jitterFactor = isPortraitNow ? 0.32 : 0.55;

            if (this.isFlatDish) {
                this.burgerGroup.rotation.x = (Math.PI * 0.22) + (this.smoothMouseY * jitterFactor);
                this.burgerGroup.rotation.z = -0.08;
                this.burgerGroup.rotation.y = (this.currentProgress * Math.PI * 2.0) + (this.smoothMouseX * 0.35);
            } else {
                this.burgerGroup.rotation.x = this.smoothMouseY * jitterFactor;
                this.burgerGroup.rotation.z = 0;
                this.burgerGroup.rotation.y = (this.currentProgress * Math.PI * 1.3) + (this.smoothMouseX * 0.35);
            }
        }

        if (this.ambientParticles) {
            const delta = 0.016;
            const pos = this.ambientParticles.geometry.attributes.position;
            const speeds = this.ambientParticles.geometry.userData.speeds;
            for (let i = 0; i < pos.count; i++) {
                let y = pos.getY(i) - speeds[i] * delta * 0.45;
                if (y < -8) y = 8;
                pos.setY(i, y);
            }
            pos.needsUpdate = true;
            this.ambientParticles.rotation.y += delta * 0.035;
        }

        const explodeSpreadZ = isPortraitNow ? 3.5 : 5.5;
        this.camera.position.x = this.smoothMouseX * 1.4;
        this.camera.position.y = this.smoothMouseY * (isPortraitNow ? 0.6 : 1.2);
        this.camera.position.z = this.responsiveBaseZ + (this.currentProgress * explodeSpreadZ);
        this.camera.lookAt(0, 0, 0);

        this.updateLabels();

        if (this.composer) {
            this.composer.render();
        } else {
            this.renderer.render(this.scene, this.camera);
        }

        this.rafId = requestAnimationFrame(() => this.animate());
    }

    updateLabels() {
        if (!this.labelEls || !this.layers) return;

        const w = window.innerWidth;
        const h = window.innerHeight;
        const aspect = w / h;
        const isMobile = aspect < 1.0;
        const centerX = w / 2;

        const labelOpacity = Math.max(0, Math.min(1, (this.currentProgress - 0.15) * 3));
        const v = this._tempVec || (this._tempVec = new this.THREE.Vector3());

        const sideMargin = isMobile ? 55 : 85;

        for (let i = 0; i < this.layers.length; i++) {
            const el = this.labelEls[i];
            if (!el) continue;

            const layer = this.layers[i];

            v.set(0, layer.mesh.position.y, 0);
            v.applyEuler(this.burgerGroup.rotation);
            v.project(this.camera);

            const screenY = (1 - v.y) * 0.5 * h;

            const isLeft = el.dataset.side === 'left';

            if (isLeft) {
                const anchorX = centerX - sideMargin;
                el.style.left = anchorX + 'px';
                el.style.transform = 'translate(-100%, -50%)';
            } else {
                const anchorX = centerX + sideMargin;
                el.style.left = anchorX + 'px';
                el.style.transform = 'translate(0, -50%)';
            }

            el.style.top = screenY + 'px';
            el.style.opacity = labelOpacity;
        }
    }

    destroy() {
        this.destroyed = true;
        cancelAnimationFrame(this.rafId);
        window.removeEventListener('mousemove', this.mouseHandler);
        window.removeEventListener('touchstart', this.touchHandler);
        window.removeEventListener('touchmove', this.touchHandler);
        window.removeEventListener('resize', this.resizeHandler);

        this.container.style.opacity = '0';

        setTimeout(() => {
            try {
                if (this.burgerGroup) {
                    this.burgerGroup.traverse(obj => {
                        if (obj.geometry && typeof obj.geometry.dispose === 'function') {
                            obj.geometry.dispose();
                        }
                    });
                    if (this.burgerGroup.parent) {
                        this.burgerGroup.parent.remove(this.burgerGroup);
                    }
                    while (this.burgerGroup.children.length > 0) {
                        this.burgerGroup.remove(this.burgerGroup.children[0]);
                    }
                }
                if (this.ambientParticles) {
                    this.ambientParticles.geometry.dispose();
                    this.scene.remove(this.ambientParticles);
                }
                if (this.geoMod && this.geoMod.burgerGroup) {
                    this.geoMod.burgerGroup.traverse(obj => {
                        if (obj.geometry && typeof obj.geometry.dispose === 'function') {
                            obj.geometry.dispose();
                        }
                    });
                }
            } catch (err) {
                console.warn('[ExplodedView] Dispose warning:', err);
            }

            if (this.composer && typeof this.composer.dispose === 'function') {
                this.composer.dispose();
            }
            if (this.renderer && typeof this.renderer.dispose === 'function') {
                this.renderer.dispose();
            }

            this.container.remove();
            document.body.style.overflow = '';
        }, 550);
    }
}

/* ============================================================
   LoghmeYar AI — «لقمه‌یار»
   ============================================================ */
const LoghmeYarState = {
    modalEl: null,
    chatEl: null,
    inputEl: null,
    isOpen: false,
    history: []
};

const LY_PROMPTS = [
    { icon: '🍕', text: 'امروز چی بخورم؟', key: 'random' },
    { icon: '🥗', text: 'غذای رژیمی و کم‌کالری', key: 'healthy' },
    { icon: '💰', text: 'پک اقتصادی زیر ۲۰۰ هزار تومن', key: 'budget' },
    { icon: '🌶️', text: 'تند و پرانرژی', key: 'spicy' },
    { icon: '👥', text: 'پک دونفره با بیشترین تخفیف', key: 'pair' }
];

const LY_KEYWORDS = {
    healthy: /رژیم|سالاد|کم\s*کالری|سبک|بدون\s*چربی|کم\s*چرب|گریل|بخار|آبپز|مفید/i,
    budget: /ارزان|اقتصاد|بودجه|جیب|کم\s*خرج|زیر\s*\d|تومن\s*کم|هزینه\s*کم/i,
    spicy: /تند|اسپایس|هالوپینو|زینگر|بندری|آتشین|مکزیکی|چیلی|چیل|فلفل/i,
    pizza: /پیتزا|پپرونی|مارگاریتا|ناپل|پنیر\s*پیتزا/i,
    burger: /برگر|چیزبرگر|همبرگر|اسلایدر|بیکن/i,
    kebab: /کباب|شیشلیک|کوبیده|چنجه|جوجه|بریان/i,
    sandwich: /ساندویچ|باگت|هات\s*داگ|هایدا|زینگر/i,
    sweet: /شیرین|دسر|کیک|باقلوا|کروسان|شله|کروسان/i,
    drink: /دوغ|نوشابه|شربت|لیموناد|موهیتو|قهوه|آیس|ماءالشعیر|چای/i,
    pair: /دونفر|دو\s*نفر|زوج|با\s*دوست|دو\s*تا/i,
    discount: /تخفیف|حراج|شگفت|ارزان\s*ترین|تخفیف\s*دار/i,
    random: /چی\s*بخورم|نمیدونم|هوس|پیشنهاد|رندوم|شانسی|مشکل\s*انتخاب/i
};

function lyParseIntent(query) {
    const q = (query || '').toString();
    const clean = q.replace(/\u200c/g, ' ').toLowerCase();

    const intents = {
        healthy: false, budget: false, spicy: false,
        pizza: false, burger: false, kebab: false, sandwich: false,
        sweet: false, drink: false, pair: false, discount: false, random: false,
        budgetMax: null,
        raw: q
    };

    Object.keys(LY_KEYWORDS).forEach(k => {
        if (LY_KEYWORDS[k].test(clean)) intents[k] = true;
    });

    const budgetMatch = clean.match(/(\d+)\s*(هزار|تومان|تومن|k)?/i);
    if (budgetMatch) {
        let n = parseInt(budgetMatch[1], 10);
        if (budgetMatch[2] === 'هزار' || budgetMatch[2] === 'k') n *= 1000;
        if (!isNaN(n) && n >= 20000) intents.budgetMax = n;
    }

    if (!intents.healthy && !intents.budget && !intents.spicy && !intents.pizza && !intents.burger
        && !intents.kebab && !intents.sandwich && !intents.sweet && !intents.drink
        && !intents.pair && !intents.discount && !intents.random) {
        intents.random = true;
    }

    return intents;
}

function lyScoreProduct(p, intents) {
    let score = 0;
    const haystack = ((p.title || '') + ' ' + (p.desc || '')).toLowerCase();

    if (intents.healthy) {
        if (/سالاد|گریل|سبزی|بدون\s*چربی|کم\s*چرب|مرغ|ماهی|بخار/.test(haystack)) score += 40;
        if (/سرخ|بیکن|چدار|کره|پنیر\s*چرب|روغن|فوندانت/.test(haystack)) score -= 25;
        if (p.categoryId === 'appetizers') score += 8;
        if (p.categoryId === 'sweets') score -= 30;
    }

    if (intents.spicy) {
        if (/تند|هالوپینو|اسپایس|آتشین|مکزیکی|زینگر|بندری|چیلی|چیل/.test(haystack)) score += 45;
        if (p.categoryId === 'burgers' || p.categoryId === 'sandwich') score += 6;
    }

    if (intents.pizza && p.categoryId === 'pizza') score += 55;
    if (intents.burger && p.categoryId === 'burgers') score += 55;
    if (intents.kebab && p.categoryId === 'kebab') score += 55;
    if (intents.sandwich && p.categoryId === 'sandwich') score += 55;
    if (intents.sweet && p.categoryId === 'sweets') score += 55;
    if (intents.drink && p.categoryId === 'drinks') score += 55;
    if (intents.drink && p.categoryId === 'supermarket') score += 35;

    if (intents.budget) {
        if (p.price < 200000) score += 30;
        else if (p.price < 300000) score += 12;
        else if (p.price > 450000) score -= 25;
    }

    if (intents.budgetMax) {
        if (p.price <= intents.budgetMax) score += 30;
        else score -= 100;
    }

    if (intents.discount) score += (p.discount || 0) * 3.5;

    if (intents.random) score += Math.random() * 35;

    score += (p.rating || 0) * 3;
    score += (p.discount || 0) * 0.4;

    if (p.stockLeft !== undefined && p.stockLeft <= 0) score -= 200;

    return score;
}

function lyRankProducts(intents, limit) {
    const api = window.AppAPI;
    if (!api || !Array.isArray(api.catalogProducts)) return [];
    const scored = api.catalogProducts
        .map(p => ({ p, s: lyScoreProduct(p, intents) }))
        .filter(x => x.s > 0)
        .sort((a, b) => b.s - a.s);
    return scored.slice(0, limit || 4).map(x => x.p);
}

function lyBuildSmartBasket() {
    const api = window.AppAPI;
    if (!api || !Array.isArray(api.catalogProducts)) return null;

    const products = api.catalogProducts;
    const vendorIds = [...new Set(products.map(p => p.vendorId))];

    const mainsCategories = ['burgers', 'pizza', 'kebab', 'sandwich', 'traditional', 'ash'];
    const drinkCategories = ['drinks', 'supermarket'];
    const appCategories = ['appetizers'];

    const pickBest = arr => arr.reduce((best, cur) => {
        const s = (cur.discount || 0) * 3 + (cur.rating || 0) * 2 + (cur.price < 250000 ? 5 : 0);
        const bs = best ? ((best.discount || 0) * 3 + (best.rating || 0) * 2 + (best.price < 250000 ? 5 : 0)) : -Infinity;
        return s > bs ? cur : best;
    }, null);

    let bestBundle = null;
    let bestScore = -Infinity;

    vendorIds.forEach(vid => {
        const vp = products.filter(p => p.vendorId === vid && (p.stockLeft === undefined || p.stockLeft > 0));
        const mains = vp.filter(p => mainsCategories.includes(p.categoryId));
        if (mains.length === 0) return;

        const drinks = vp.filter(p => drinkCategories.includes(p.categoryId));
        const apps = vp.filter(p => appCategories.includes(p.categoryId));

        const main = pickBest(mains);
        const drink = drinks.length ? pickBest(drinks) : null;
        const app = apps.length ? pickBest(apps) : null;

        let score = (main ? (main.discount || 0) * 3 + (main.rating || 0) : 0);
        if (drink) score += (drink.discount || 0) * 2 + 6;
        if (app) score += (app.discount || 0) * 2 + 6;

        if (score > bestScore) {
            bestScore = score;
            bestBundle = { vendorId: vid, main, drink, app };
        }
    });

    return bestBundle;
}

function lyRenderCardHtml(p) {
    const hasDiscount = (p.discount || 0) > 0;
    const vendor = (window.AppAPI && Array.isArray(window.AppAPI.vendors))
        ? window.AppAPI.vendors.find(v => v.id === p.vendorId)
        : null;
    const vendorName = vendor ? vendor.name : '';

    return `
        <div class="ly-card" data-ly-card="${p.id}">
            <img src="${lyEscape(p.image)}" alt="${lyEscape(p.title)}" class="ly-card__img" draggable="false">
            <div class="ly-card__body">
                <div class="ly-card__title">${lyEscape(p.title)}</div>
                <div class="ly-card__meta">
                    <span class="ly-card__rating">
                        <i data-lucide="star" style="width:10px;height:10px;fill:#f59e0b;"></i>
                        ${lyToPersian(p.rating || 0)}
                    </span>
                    ${hasDiscount ? `<span class="ly-card__discount">٪${lyToPersian(p.discount)}</span>` : ''}
                    ${vendorName ? `<span style="opacity:0.75;">${lyEscape(vendorName)}</span>` : ''}
                </div>
                <div class="ly-card__price-row">
                    <span class="ly-card__price">${lyFormatPrice(p.price)}</span>
                    ${hasDiscount ? `<span class="ly-card__price-old">${lyFormatPrice(p.originalPrice)}</span>` : ''}
                    <span style="font-size:9px;color:#94a3b8;">تومان</span>
                </div>
            </div>
            <button class="ly-card__add" data-ly-add="${p.id}">
                <i data-lucide="plus" style="width:12px;height:12px;"></i>
                افزودن
            </button>
        </div>
    `;
}

function lyRenderBundleHtml(bundle) {
    if (!bundle || !bundle.main) return '';

    const parts = [bundle.main, bundle.drink, bundle.app].filter(Boolean);
    const totalRaw = parts.reduce((s, p) => s + (p.price || 0), 0);
    const totalOriginal = parts.reduce((s, p) => s + (p.originalPrice || p.price || 0), 0);
    const savings = Math.max(0, totalOriginal - totalRaw);

    const rowsHtml = parts.map(p => `
        <div class="ly-bundle__row">
            <img src="${lyEscape(p.image)}" alt="" draggable="false">
            <span class="ly-bundle__name">${lyEscape(p.title)}</span>
            <span class="ly-bundle__price">${lyFormatPrice(p.price)}</span>
        </div>
    `).join('');

    return `
        <div class="ly-bundle" data-ly-bundle="${bundle.vendorId}">
            <div class="ly-bundle__title">
                <i data-lucide="sparkles" style="width:14px;height:14px;"></i>
                پک پیشنهادی لقمه‌یار
            </div>
            ${rowsHtml}
            <div class="ly-bundle__total">
                <span>مجموع با تخفیف:</span>
                <span><b>${lyFormatPrice(totalRaw)}</b> تومان</span>
            </div>
            ${savings > 0 ? `<div style="font-size:10px;color:#10b981;font-weight:800;text-align:center;">🎉 ${lyFormatPrice(savings)} تومان سود شما در این پک</div>` : ''}
            <button class="ly-bundle__cta" data-ly-bundle-add="${bundle.vendorId}">
                <i data-lucide="shopping-bag" style="width:14px;height:14px;"></i>
                افزودن کل پک به سبد خرید
            </button>
        </div>
    `;
}

function lyAppendUserMessage(text) {
    const wrap = document.createElement('div');
    wrap.className = 'ly-msg-user';
    wrap.textContent = text;
    LoghmeYarState.chatEl.appendChild(wrap);
    LoghmeYarState.chatEl.scrollTop = LoghmeYarState.chatEl.scrollHeight;
}

function lyAppendTyping() {
    const wrap = document.createElement('div');
    wrap.className = 'ly-msg-bot';
    wrap.id = 'ly-typing';
    wrap.innerHTML = `
        <div class="ly-msg-bot__avatar">AI</div>
        <div class="ly-msg-bot__bubble">
            <div class="ly-msg-typing"><span></span><span></span><span></span></div>
        </div>
    `;
    LoghmeYarState.chatEl.appendChild(wrap);
    LoghmeYarState.chatEl.scrollTop = LoghmeYarState.chatEl.scrollHeight;
}

function lyRemoveTyping() {
    const t = document.getElementById('ly-typing');
    if (t) t.remove();
}

function lyAppendBotMessage(html) {
    lyRemoveTyping();
    const wrap = document.createElement('div');
    wrap.className = 'ly-msg-bot';
    wrap.innerHTML = `
        <div class="ly-msg-bot__avatar">AI</div>
        <div class="ly-msg-bot__bubble">${html}</div>
    `;
    LoghmeYarState.chatEl.appendChild(wrap);
    LoghmeYarState.chatEl.scrollTop = LoghmeYarState.chatEl.scrollHeight;
}

function lyAppendRecommendations(products, introText) {
    lyRemoveTyping();
    const wrap = document.createElement('div');
    wrap.className = 'ly-msg-bot';
    const cardsHtml = products.map(lyRenderCardHtml).join('');
    wrap.innerHTML = `
        <div class="ly-msg-bot__avatar">AI</div>
        <div class="ly-msg-bot__bubble" style="width:100%;">
            <div style="margin-bottom:8px;">${introText}</div>
            <div class="ly-cards">${cardsHtml}</div>
        </div>
    `;
    LoghmeYarState.chatEl.appendChild(wrap);
    LoghmeYarState.chatEl.scrollTop = LoghmeYarState.chatEl.scrollHeight;
    if (window.lucide) lucide.createIcons();
}

function lyAppendBundle(bundle) {
    lyRemoveTyping();
    const wrap = document.createElement('div');
    wrap.className = 'ly-msg-bot';
    wrap.innerHTML = `
        <div class="ly-msg-bot__avatar">AI</div>
        <div class="ly-msg-bot__bubble" style="width:100%;">
            <div style="margin-bottom:8px;">این پک هوشمند رو برات آماده کردم — با بیشترین تخفیف ممکن از یک فروشگاه:</div>
            ${lyRenderBundleHtml(bundle)}
        </div>
    `;
    LoghmeYarState.chatEl.appendChild(wrap);
    LoghmeYarState.chatEl.scrollTop = LoghmeYarState.chatEl.scrollHeight;
    if (window.lucide) lucide.createIcons();
}

function lyRespondToQuery(query) {
    const intents = lyParseIntent(query);
    const products = lyRankProducts(intents, 4);

    if (products.length === 0) {
        lyAppendBotMessage('متأسفانه موردی مطابق سلیقه‌ات پیدا نکردم. یک عبارت دیگه امتحان کن یا از چیپ‌های پایین استفاده کن 🙏');
        return;
    }

    let intro = 'این پیشنهادها رو برات چیدم:';
    if (intents.healthy) intro = '🥗 چند گزینه‌ی سبک، کم‌کالری و مفید برات انتخاب کردم:';
    else if (intents.budget) intro = `💰 چند گزینه‌ی اقتصادی ${intents.budgetMax ? `زیر ${lyFormatPrice(intents.budgetMax)} تومان` : 'با قیمت مناسب'} برات پیدا کردم:`;
    else if (intents.spicy) intro = '🌶️ اینا تند و پرانرژی‌ان، دقیقاً همون چیزی که خواستی:';
    else if (intents.pizza) intro = '🍕 بهترین پیتزاهای موجود رو برات گلچین کردم:';
    else if (intents.burger) intro = '🍔 این برگرها این روزها خیلی محبوبن:';
    else if (intents.kebab) intro = '🍢 چند پیشنهاد کبابی اعلا برات آماده کردم:';
    else if (intents.sandwich) intro = '🥪 این ساندویچ‌ها انتخاب خوبی برای یک وعده‌ی سریع هستن:';
    else if (intents.sweet) intro = '🍰 چند دسر و شیرینی خوشمزه پیشنهاد می‌کنم:';
    else if (intents.drink) intro = '🥤 این نوشیدنی‌ها خنک و باکیفیتن:';
    else if (intents.discount) intro = '🔥 بیشترین تخفیف‌های امروز رو برات چیدم:';
    else if (intents.random) intro = '🎲 پیشنهاد شانسی امروز لقمه‌یار برات ایناست:';

    lyAppendRecommendations(products, intro);
}

function lySendMessage() {
    const input = LoghmeYarState.inputEl;
    if (!input) return;
    const text = input.value.trim();
    if (!text) return;
    input.value = '';

    lyAppendUserMessage(text);
    lyAppendTyping();

    setTimeout(() => {
        if (text === 'پک دونفره' || /دونفر|دو\s*نفر/.test(text)) {
            const bundle = lyBuildSmartBasket();
            if (bundle) lyAppendBundle(bundle);
            else lyAppendBotMessage('نتونستم پک مناسب بسازم. دوباره تلاش کن 🙏');
            return;
        }
        lyRespondToQuery(text);
    }, 900);
}

function lyHandleAddToCart(productId, btnEl) {
    if (!window.AppAPI || typeof window.AppAPI.handleAddToCart !== 'function') return;
    window.AppAPI.handleAddToCart(productId, []);
    lyToast('به سبد خرید اضافه شد 🛒');
    if (btnEl) {
        btnEl.innerHTML = `<i data-lucide="check" style="width:12px;height:12px;"></i> اضافه شد`;
        btnEl.style.background = '#10b981';
        btnEl.style.color = '#fff';
        btnEl.style.borderColor = '#10b981';
        if (window.lucide) lucide.createIcons();
        setTimeout(() => {
            btnEl.innerHTML = `<i data-lucide="plus" style="width:12px;height:12px;"></i> افزودن`;
            btnEl.style.background = '';
            btnEl.style.color = '';
            btnEl.style.borderColor = '';
            if (window.lucide) lucide.createIcons();
        }, 1500);
    }
}

function lyHandleBundleAdd(vendorId, btnEl) {
    const api = window.AppAPI;
    if (!api || !Array.isArray(api.catalogProducts)) return;

    const bundle = lyBuildSmartBasket();
    if (!bundle || bundle.vendorId !== vendorId) return;

    const parts = [bundle.main, bundle.drink, bundle.app].filter(Boolean);
    parts.forEach(p => api.handleAddToCart(p.id, [], bundle.vendorId));

    lyToast(`پک ${lyToPersian(parts.length)} آیتمی به سبد اضافه شد 🎉`);
    if (btnEl) {
        btnEl.innerHTML = `<i data-lucide="check" style="width:14px;height:14px;"></i> پک اضافه شد`;
        btnEl.style.background = '#10b981';
        if (window.lucide) lucide.createIcons();
    }
}

function lyResetChat() {
    if (!LoghmeYarState.chatEl) return;
    LoghmeYarState.chatEl.innerHTML = '';
    lyInitialGreeting();
}

function lyInitialGreeting() {
    lyAppendBotMessage('سلام 👋 من <b>لقمه‌یار</b> هستم، دستیار هوشمند سفارش غذا.<br>بگو چی هوس کردی یا از چیپ‌های زیر انتخاب کن تا بهترین پیشنهاد رو برات بیارم.');
}

function lyBuildModal() {
    const modal = document.createElement('div');
    modal.id = 'loghme-yar-modal';

    modal.innerHTML = `
        <div class="ly-backdrop" data-ly-close></div>
        <div class="ly-drawer" role="dialog" aria-label="لقمه‌یار">
            <div class="ly-header">
                <div class="ly-avatar">
                    <i data-lucide="sparkles" style="width:18px;height:18px;"></i>
                    <span class="ly-avatar__online"></span>
                </div>
                <div class="ly-title-wrap">
                    <div class="ly-title">دستیار هوشمند لقمه‌یار</div>
                    <div class="ly-subtitle">
                        <span style="display:inline-block;width:6px;height:6px;border-radius:9999px;background:#10b981;"></span>
                        آنلاین · آماده کمک
                    </div>
                </div>
                <button class="ly-icon-btn" data-ly-reset title="شروع دوباره">
                    <i data-lucide="rotate-ccw" style="width:15px;height:15px;"></i>
                </button>
                <button class="ly-icon-btn" data-ly-close title="بستن">
                    <i data-lucide="x" style="width:15px;height:15px;"></i>
                </button>
            </div>

            <div class="ly-chat" id="ly-chat"></div>

            <div class="ly-chips">
                ${LY_PROMPTS.map(p => `
                    <button class="ly-chip" data-ly-prompt="${p.key}">
                        ${p.icon} ${p.text}
                    </button>
                `).join('')}
            </div>

            <div class="ly-input-row">
                <input id="ly-input" type="text" placeholder="مثلاً: یه شام سبک با دوغ، پیتزای پپرونی تند، کباب با تخفیف...">
                <button class="ly-send" data-ly-send>
                    <i data-lucide="send" style="width:16px;height:16px;transform:rotate(180deg);"></i>
                </button>
            </div>
        </div>
    `;

    return modal;
}

function lyHandlePrompt(key) {
    const map = {
        random: 'امروز چی بخورم؟ یه پیشنهاد شانسی بده',
        healthy: 'غذای رژیمی و کم‌کالری پیشنهاد بده',
        budget: 'یه پک اقتصادی زیر ۲۰۰ هزار تومن می‌خوام',
        spicy: 'یه چیز تند و پرانرژی می‌خوام',
        pair: 'پک دونفره با بیشترین تخفیف بچین'
    };
    const text = map[key] || 'پیشنهاد بده';
    lyAppendUserMessage(text);
    lyAppendTyping();

    setTimeout(() => {
        if (key === 'pair') {
            const bundle = lyBuildSmartBasket();
            if (bundle) lyAppendBundle(bundle);
            else lyAppendBotMessage('نتونستم پک دونفره بسازم. دوباره تلاش کن 🙏');
            return;
        }
        const intents = lyParseIntent(text);
        if (key === 'random') intents.random = true;
        if (key === 'healthy') intents.healthy = true;
        if (key === 'budget') { intents.budget = true; intents.budgetMax = 200000; }
        if (key === 'spicy') intents.spicy = true;

        const products = lyRankProducts(intents, 4);
        if (products.length === 0) {
            lyAppendBotMessage('چیزی پیدا نکردم. یک عبارت دیگه امتحان کن 🙏');
            return;
        }

        let intro = 'این پیشنهادها رو برات چیدم:';
        if (key === 'healthy') intro = '🥗 چند گزینه‌ی سبک و کم‌کالری:';
        if (key === 'budget') intro = '💰 چند پک اقتصادی زیر ۲۰۰ هزار تومان:';
        if (key === 'spicy') intro = '🌶️ اینا تند و پرانرژی‌ان:';
        if (key === 'random') intro = '🎲 پیشنهاد شانسی امروز:';

        lyAppendRecommendations(products, intro);
    }, 900);
}

function lyBindModalEvents() {
    const modal = LoghmeYarState.modalEl;
    if (!modal) return;

    modal.addEventListener('click', (e) => {
        const t = e.target;
        if (t.closest('[data-ly-close]')) {
            LoghmeYarAI.close();
            return;
        }
        if (t.closest('[data-ly-reset]')) {
            lyResetChat();
            return;
        }
        if (t.closest('[data-ly-send]')) {
            lySendMessage();
            return;
        }
        const chip = t.closest('[data-ly-prompt]');
        if (chip) {
            lyHandlePrompt(chip.dataset.lyPrompt);
            return;
        }
        const addBtn = t.closest('[data-ly-add]');
        if (addBtn) {
            e.stopPropagation();
            lyHandleAddToCart(parseInt(addBtn.dataset.lyAdd, 10), addBtn);
            return;
        }
        const bundleBtn = t.closest('[data-ly-bundle-add]');
        if (bundleBtn) {
            e.stopPropagation();
            lyHandleBundleAdd(bundleBtn.dataset.lyBundleAdd, bundleBtn);
            return;
        }
    });

    modal.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            LoghmeYarAI.close();
        } else if (e.key === 'Enter' && e.target && e.target.id === 'ly-input') {
            e.preventDefault();
            lySendMessage();
        }
    });
}

/* ============================================================
   Public API — LoghmeYarAI
   ============================================================ */
export const LoghmeYarAI = {
    open() {
        if (LoghmeYarState.isOpen) return;

        if (!LoghmeYarState.modalEl) {
            LoghmeYarState.modalEl = lyBuildModal();
            document.body.appendChild(LoghmeYarState.modalEl);
            LoghmeYarState.chatEl = LoghmeYarState.modalEl.querySelector('#ly-chat');
            LoghmeYarState.inputEl = LoghmeYarState.modalEl.querySelector('#ly-input');
            lyBindModalEvents();
            lyInitialGreeting();
            if (window.lucide) lucide.createIcons();
        }

        LoghmeYarState.modalEl.style.display = 'flex';
        requestAnimationFrame(() => {
            LoghmeYarState.modalEl.classList.add('ly-open');
        });
        LoghmeYarState.isOpen = true;

        setTimeout(() => {
            if (LoghmeYarState.inputEl) LoghmeYarState.inputEl.focus();
        }, 350);
    },

    close() {
        if (!LoghmeYarState.modalEl) return;
        LoghmeYarState.modalEl.classList.remove('ly-open');
        LoghmeYarState.isOpen = false;
        setTimeout(() => {
            if (LoghmeYarState.modalEl) LoghmeYarState.modalEl.style.display = 'none';
        }, 320);
    },

    toggle() {
        if (LoghmeYarState.isOpen) LoghmeYarAI.close();
        else LoghmeYarAI.open();
    },

    reset() {
        lyResetChat();
    },

    ask(text) {
        if (!text) return;
        if (!LoghmeYarState.isOpen) LoghmeYarAI.open();
        setTimeout(() => {
            LoghmeYarState.inputEl.value = text;
            lySendMessage();
        }, 380);
    },

    buildBasket() {
        const bundle = lyBuildSmartBasket();
        if (!bundle) {
            lyToast('نتونستم پک بسازم');
            return;
        }
        if (!LoghmeYarState.isOpen) LoghmeYarAI.open();
        setTimeout(() => lyAppendBundle(bundle), 380);
    }
};

if (typeof window !== 'undefined') {
    window.LoghmeYarAI = LoghmeYarAI;
    window.openLoghmeYar = () => LoghmeYarAI.open();
    window.openExplodedProduct = (product) => new ExplodedViewBuilder(product);
    window.ExplodedViewBuilder = ExplodedViewBuilder;
}

export default { ExplodedViewBuilder, LoghmeYarAI };