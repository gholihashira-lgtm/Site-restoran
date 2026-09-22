/* ==========================================================================
 * stories-manager.js
 * --------------------------------------------------------------------------
 * High-Performance Instagram/LoghmeFood Story Management System.
 * Features:
 *   - Seen / Unseen ring state management.
 *   - Multi-slide progression with pause/resume on hold.
 *   - Unified pointer handling: Tap (left/right zones) + Horizontal Swipe.
 *   - Interactive stickers: 1-click coupon copy with confetti particle FX.
 *   - Reaction heart floating particle generator.
 *   - Seamless routing to Vendors, Deals, and Categories via AppAPI.
 * ========================================================================== */

/* ==========================================================================
 * DATA MODEL: 5 Stories with Multi-Slide Rich Media & Widgets
 * ========================================================================== */
const storiesData = [
    {
        id: 's1',
        title: 'حراج ویژه',
        thumbnail: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&q=80',
        seen: false,
        slides: [
            {
                type: 'promo',
                media: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=900&q=80',
                headline: 'تا ۵۰٪ تخفیف برگرهای دست‌ساز',
                subtitle: 'فست‌فود ژوبین · انواع برگرهای ذغالی و اسمش همراه با سس ترافل',
                sticker: { type: 'coupon', code: 'BURGER50', discount: '٪۵۰ تخفیف' },
                cta: { label: 'سفارش سریع از فست‌فود ژوبین', action: 'vendor', targetId: 'v1' }
            },
            {
                type: 'promo',
                media: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=900&q=80',
                headline: 'دوبل چیزبرگر اسمش اعلا',
                subtitle: 'دو پتی گوشت گرم ۱۲۰ گرمی به همراه پنیر گودای کش‌دار محلی',
                sticker: { type: 'timer', text: 'فقط تا ۱۲ امشب' },
                cta: { label: 'مشاهده منوی برگرها', action: 'vendor', targetId: 'v1' }
            }
        ]
    },
    {
        id: 's2',
        title: 'ارسال اکسپرس',
        thumbnail: 'https://images.unsplash.com/photo-1526367790999-0150786686a2?w=200&q=80',
        seen: false,
        slides: [
            {
                type: 'promo',
                media: 'https://images.unsplash.com/photo-1526367790999-0150786686a2?w=900&q=80',
                headline: 'تحویل فوری کمتر از ۲۰ دقیقه',
                subtitle: 'با ناوگان اختصاصی لقمه‌باکس بدون معطلی در ساعت اوج شلوغی',
                sticker: { type: 'coupon', code: 'EXPRESS', discount: 'ارسال رایگان' },
                cta: { label: 'مشاهده سوپرمارکت‌های فوری', action: 'vendor', targetId: 'v20' }
            },
            {
                type: 'promo',
                media: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=900&q=80',
                headline: 'تضمین سلامت اقلام پروتئینی و سرد',
                subtitle: 'بسته‌بندی در باکس‌های عایق حرارتی ویژه کالاهای فاسدشدنی',
                sticker: { type: 'timer', text: 'ضمانت بازگشت وجه' },
                cta: { label: 'خرید از سوپرمارکت دریان', action: 'vendor', targetId: 'v20' }
            }
        ]
    },
    {
        id: 's3',
        title: 'کالابرگ',
        thumbnail: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=200&q=80',
        seen: false,
        slides: [
            {
                type: 'promo',
                media: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=900&q=80',
                headline: 'خرید مستقیم با اعتبار یارانه کالابرگ',
                subtitle: 'آشکده و کترینگ عمه جون · استفاده از اعتبار دولتی برای غذای گرم',
                sticker: { type: 'coupon', code: 'KALABARG', discount: 'اعتبار فعال' },
                cta: { label: 'سفارش آش و غذای سنتی', action: 'vendor', targetId: 'v3' }
            },
            {
                type: 'promo',
                media: 'https://images.unsplash.com/photo-1588168333986-5078d3ae3976?w=900&q=80',
                headline: 'کشک بادمجان و غذاهای اصیل خانگی',
                subtitle: 'پخت روزانه با مواد اولیه تازه و امکان تسویه با کارت یارانه',
                sticker: { type: 'timer', text: 'سهمیه ماه جاری' },
                cta: { label: 'مشاهده منوی کترینگ عمه جون', action: 'vendor', targetId: 'v3' }
            }
        ]
    },
    {
        id: 's4',
        title: 'کدهای تخفیف',
        thumbnail: 'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=200&q=80',
        seen: false,
        slides: [
            {
                type: 'promo',
                media: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=900&q=80',
                headline: 'تخفیف ۳۰٪ روی کل منوی پیتزا ارم',
                subtitle: 'پیتزا پپرونی تنوری ناپلی با خمیر دست‌ساز و پنیر موزارلا',
                sticker: { type: 'coupon', code: 'SNAPP30', discount: '٪۳۰ تخفیف' },
                cta: { label: 'سفارش از پیتزا ساندویچ ارم', action: 'vendor', targetId: 'v2' }
            },
            {
                type: 'promo',
                media: 'https://images.unsplash.com/photo-1619740455993-9e612b1af08a?w=900&q=80',
                headline: 'ساندویچ‌های بندری تند و نوستالژی',
                subtitle: 'سوسیس آلمانی مرغوب با پیازداغ عسلی و سس فلفل تند بندری',
                sticker: { type: 'coupon', code: 'ERAM20', discount: '٪۲۰ هدیه' },
                cta: { label: 'سفارش ساندویچ بندری', action: 'vendor', targetId: 'v2' }
            }
        ]
    },
    {
        id: 's5',
        title: 'پرفروش‌های هفته',
        thumbnail: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&q=80',
        seen: false,
        slides: [
            {
                type: 'promo',
                media: 'https://images.unsplash.com/photo-1627012046423-93d39da6a8b7?w=900&q=80',
                headline: 'چلو کباب کوبیده گوسفندی توسکا',
                subtitle: 'رتبه اول محبوب‌ترین غذای ایرانی با بیش از ۲,۱۰۰ نظر مثبت',
                sticker: { type: 'timer', text: '★ ۴.۹ ستاره' },
                cta: { label: 'سفارش چلو کباب اعلا', action: 'vendor', targetId: 'v4' }
            },
            {
                type: 'promo',
                media: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=900&q=80',
                headline: 'جوجه کباب زعفرانی با استخوان',
                subtitle: 'مرینیت شده با زعفران قائنات، آبلیموی طبیعی و کره محلی',
                sticker: { type: 'coupon', code: 'TOSKA15', discount: '٪۱۵ تخفیف' },
                cta: { label: 'مشاهده منوی کباب‌سرای توسکا', action: 'vendor', targetId: 'v4' }
            }
        ]
    }
];

/* ==========================================================================
 * STATE VARIABLES & CONTROLLERS
 * ========================================================================== */
const SLIDE_DURATION = 4000; // 4 seconds per slide
let currentStoryIdx = 0;
let currentSlideIdx = 0;
let isPaused = false;
let slideStartTime = 0;
let elapsedBeforePause = 0;
let animationFrameId = null;

/* ==========================================================================
 * HOME RAIL RENDERING
 * ========================================================================== */
export function renderStoryRail(containerSelector = '#stories-container') {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    container.innerHTML = storiesData.map((story, idx) => {
        const ringClasses = story.seen
            ? 'border-2 border-gray-300 p-0.5'
            : 'p-[2.5px] story-active-ring';

        return `
            <div onclick="window.StoriesAPI.openStory(${idx})" class="flex flex-col items-center gap-1.5 cursor-pointer active:scale-95 transition-transform shrink-0">
                <div class="w-16 h-16 rounded-full ${ringClasses} flex items-center justify-center transition-all duration-300">
                    <div class="w-full h-full rounded-full border-2 border-white overflow-hidden bg-gray-100 shadow-inner">
                        <img src="${story.thumbnail}" alt="${story.title}" class="w-full h-full object-cover">
                    </div>
                </div>
                <span class="text-[11px] font-bold ${story.seen ? 'text-gray-400' : 'text-gray-800'} tracking-tight">${story.title}</span>
            </div>
        `;
    }).join('');

    if (window.lucide) lucide.createIcons();
}

/* ==========================================================================
 * FULLSCREEN STORY VIEWER
 * ========================================================================== */
export function openStoryViewer(storyIndex = 0) {
    currentStoryIdx = Math.max(0, Math.min(storyIndex, storiesData.length - 1));
    currentSlideIdx = 0;
    elapsedBeforePause = 0;
    isPaused = false;

    buildViewerDOM();
    loadSlide(currentStoryIdx, currentSlideIdx);
}

function buildViewerDOM() {
    const existing = document.getElementById('stories-viewer-modal');
    if (existing) existing.remove();

    const viewer = document.createElement('div');
    viewer.id = 'stories-viewer-modal';
    viewer.className = 'fixed inset-0 z-[10000] bg-black flex flex-col justify-between max-w-md mx-auto overflow-hidden font-vazir select-none touch-pan-y';

    viewer.innerHTML = `
        <!-- Top Overlay Shadow -->
        <div class="absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-black/80 via-black/40 to-transparent pointer-events-none z-20"></div>

        <!-- Bottom Overlay Shadow -->
        <div class="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black/90 via-black/50 to-transparent pointer-events-none z-20"></div>

        <!-- Top Progress Bars Container -->
        <div class="relative z-30 pt-3 px-3 flex gap-1 pointer-events-none" id="story-progress-segments"></div>

        <!-- Top Bar (Author & Close) -->
        <div id="story-header-bar" class="relative z-30 flex items-center justify-between px-4 pt-2.5 text-white transition-opacity duration-200">
            <div class="flex items-center gap-2.5">
                <div class="w-9 h-9 rounded-full border-2 border-white/80 overflow-hidden shadow-md">
                    <img id="story-author-avatar" src="" class="w-full h-full object-cover" alt="Author">
                </div>
                <div>
                    <span id="story-author-title" class="text-xs font-black drop-shadow-md block"></span>
                    <span class="text-[9px] text-gray-300 font-medium opacity-80 flex items-center gap-1">
                        <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> همین حالا
                    </span>
                </div>
            </div>
            <button onclick="window.StoriesAPI.closeViewer()" class="w-9 h-9 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white/90 hover:bg-black/60 active:scale-90 transition-all border border-white/10">
                <i data-lucide="x" class="w-4 h-4"></i>
            </button>
        </div>

        <!-- Media Background Layer -->
        <div class="absolute inset-0 z-10 flex items-center justify-center overflow-hidden bg-black pointer-events-none">
            <img id="story-media-image" src="" class="w-full h-full object-cover transition-opacity duration-300 opacity-0" alt="Story Slide">
        </div>

        <!-- Interactive Center & Bottom Content Area -->
        <div id="story-content-layer" class="relative z-30 p-5 space-y-4 transition-opacity duration-200 pointer-events-none">
            <!-- Dynamic Widget Sticker Placeholder -->
            <div id="story-sticker-container" class="flex justify-start pointer-events-auto"></div>

            <!-- Headline & Subtitle -->
            <div class="space-y-1.5 text-right">
                <h2 id="story-slide-headline" class="text-lg font-black text-white leading-tight drop-shadow-md"></h2>
                <p id="story-slide-subtitle" class="text-xs text-gray-200 leading-relaxed drop-shadow opacity-90 max-w-sm"></p>
            </div>

            <!-- Action CTA & Heart Reaction -->
            <div class="flex items-center gap-2.5 pt-2 pointer-events-auto">
                <button id="story-cta-button" class="flex-1 bg-snapp hover:bg-snapp-hover active:scale-[0.98] text-white font-black text-xs py-3.5 rounded-2xl shadow-xl shadow-pink-600/40 flex items-center justify-center gap-2 transition-all">
                    <span id="story-cta-label">مشاهده و سفارش سریع</span>
                    <i data-lucide="arrow-left" class="w-4 h-4"></i>
                </button>
                <button onclick="window.StoriesAPI.triggerHeart(event)" class="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center text-white active:scale-125 transition-transform shrink-0 shadow-lg">
                    <i data-lucide="heart" class="w-6 h-6 fill-rose-500 text-rose-500"></i>
                </button>
            </div>
        </div>

        <!-- Floating Particles Emitter Container -->
        <div id="story-particles-container" class="absolute inset-0 pointer-events-none z-50 overflow-hidden"></div>
    `;

    document.body.appendChild(viewer);
    if (window.lucide) lucide.createIcons();

    bindViewerEvents(viewer);
}

/* ==========================================================================
 * UNIFIED POINTER HANDLING (Tap + Swipe + Hold-to-Pause)
 * ========================================================================== */
function bindViewerEvents(viewer) {
    let pointerActive = false;
    let startX = 0;
    let startY = 0;
    let startTime = 0;
    let moved = false;
    let holdTimer = null;
    let holdTriggered = false;

    const HOLD_DELAY = 180;    // ms to consider it a "hold"
    const MOVE_THRESHOLD = 10;  // px to consider it a "drag"
    const SWIPE_THRESHOLD = 45; // px to consider it a "swipe"

    const getPoint = (e) => {
        if (e.touches && e.touches.length > 0) return { x: e.touches[0].clientX, y: e.touches[0].clientY };
        if (e.changedTouches && e.changedTouches.length > 0) return { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY };
        return { x: e.clientX, y: e.clientY };
    };

    const isInteractiveTarget = (target) => {
        return !!(
            target.closest('#story-header-bar') ||
            target.closest('#story-cta-button') ||
            target.closest('#story-sticker-container') ||
            target.closest('button')
        );
    };

    const onPointerDown = (e) => {
        if (isInteractiveTarget(e.target)) return;

        const p = getPoint(e);
        startX = p.x;
        startY = p.y;
        startTime = Date.now();
        moved = false;
        holdTriggered = false;
        pointerActive = true;

        holdTimer = setTimeout(() => {
            if (!moved) {
                holdTriggered = true;
                pauseSlideTimer();
                dimViewerChrome(true);
            }
        }, HOLD_DELAY);
    };

    const onPointerMove = (e) => {
        if (!pointerActive) return;
        const p = getPoint(e);
        const dx = Math.abs(p.x - startX);
        const dy = Math.abs(p.y - startY);

        if (dx > MOVE_THRESHOLD || dy > MOVE_THRESHOLD) {
            moved = true;
            if (holdTimer) {
                clearTimeout(holdTimer);
                holdTimer = null;
            }
            // If we already started a hold-pause, resume it now that user is dragging
            if (holdTriggered) {
                holdTriggered = false;
                resumeSlideTimer();
                dimViewerChrome(false);
            }
        }
    };

    const onPointerUp = (e) => {
        if (!pointerActive) return;
        pointerActive = false;

        if (holdTimer) {
            clearTimeout(holdTimer);
            holdTimer = null;
        }

        // Case 1: Hold-to-pause was active → just resume
        if (holdTriggered) {
            holdTriggered = false;
            resumeSlideTimer();
            dimViewerChrome(false);
            return;
        }

        const p = getPoint(e);
        const dx = p.x - startX;
        const dy = p.y - startY;
        const absDx = Math.abs(dx);
        const absDy = Math.abs(dy);
        const elapsed = Date.now() - startTime;

        // Case 2: Horizontal swipe detected → navigate
        if (absDx > SWIPE_THRESHOLD && absDx > absDy * 1.4) {
            if (dx < 0) {
                goToNextSlide(); // swipe left → next
            } else {
                goToPrevSlide(); // swipe right → prev
            }
            return;
        }

        // Case 3: Quick tap → decide by position
        if (elapsed < 300 && !moved) {
            const rect = viewer.getBoundingClientRect();
            const relX = (p.x - rect.left) / rect.width;

            if (relX < 0.33) {
                goToPrevSlide();
            } else if (relX > 0.55) {
                goToNextSlide();
            } else {
                // Middle band: pause-on-tap (optional, treat as next)
                goToNextSlide();
            }
        }
    };

    const onPointerCancel = () => {
        if (holdTimer) {
            clearTimeout(holdTimer);
            holdTimer = null;
        }
        if (holdTriggered) {
            holdTriggered = false;
            resumeSlideTimer();
            dimViewerChrome(false);
        }
        pointerActive = false;
    };

    // Mouse
    viewer.addEventListener('mousedown', onPointerDown);
    viewer.addEventListener('mousemove', onPointerMove);
    viewer.addEventListener('mouseup', onPointerUp);
    viewer.addEventListener('mouseleave', onPointerCancel);

    // Touch
    viewer.addEventListener('touchstart', onPointerDown, { passive: true });
    viewer.addEventListener('touchmove', onPointerMove, { passive: true });
    viewer.addEventListener('touchend', onPointerUp, { passive: true });
    viewer.addEventListener('touchcancel', onPointerCancel, { passive: true });

    // Keyboard
    const handleKeyDown = (e) => {
        if (!document.getElementById('stories-viewer-modal')) return;
        if (e.key === 'Escape') closeStoryViewer();
        if (e.key === 'ArrowRight' || e.key === ' ') {
            e.preventDefault();
            goToNextSlide();
        }
        if (e.key === 'ArrowLeft') {
            e.preventDefault();
            goToPrevSlide();
        }
    };
    window.addEventListener('keydown', handleKeyDown);
}

function dimViewerChrome(dim) {
    const header = document.getElementById('story-header-bar');
    const content = document.getElementById('story-content-layer');
    if (header) header.style.opacity = dim ? '0.1' : '1';
    if (content) content.style.opacity = dim ? '0.1' : '1';
}

/* ==========================================================================
 * SLIDE LOADING & PROGRESS TIMER ENGINE
 * ========================================================================== */
function loadSlide(storyIdx, slideIdx) {
    cancelAnimationFrame(animationFrameId);
    isPaused = false;
    elapsedBeforePause = 0;

    const story = storiesData[storyIdx];
    if (!story) return closeStoryViewer();

    const slide = story.slides[slideIdx];
    if (!slide) return closeStoryViewer();

    // Mark current story as seen
    story.seen = true;

    // Render Progress Segments
    const segmentsContainer = document.getElementById('story-progress-segments');
    if (segmentsContainer) {
        segmentsContainer.innerHTML = story.slides.map((_, i) => `
            <div class="h-1 flex-1 bg-white/25 rounded-full overflow-hidden">
                <div class="h-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.6)] transition-none" id="story-progress-fill-${i}" style="width: ${i < slideIdx ? '100%' : '0%'}"></div>
            </div>
        `).join('');
    }

    // Set Header
    const avatar = document.getElementById('story-author-avatar');
    const title = document.getElementById('story-author-title');
    if (avatar) avatar.src = story.thumbnail;
    if (title) title.textContent = story.title;

    // Set Media with crossfade
    const mediaImg = document.getElementById('story-media-image');
    if (mediaImg) {
        mediaImg.style.opacity = '0';
        mediaImg.src = slide.media;
        mediaImg.onload = () => {
            mediaImg.style.opacity = '1';
        };
    }

    // Set Text Content
    const headline = document.getElementById('story-slide-headline');
    const subtitle = document.getElementById('story-slide-subtitle');
    if (headline) headline.textContent = slide.headline;
    if (subtitle) subtitle.textContent = slide.subtitle;

    // Render Dynamic Sticker Widget
    const stickerBox = document.getElementById('story-sticker-container');
    if (stickerBox) {
        if (slide.sticker && slide.sticker.type === 'coupon') {
            stickerBox.innerHTML = `
                <div onclick="window.StoriesAPI.copyStickerCode('${slide.sticker.code}', event)" class="bg-white/95 backdrop-blur-md border-2 border-dashed border-snapp px-3.5 py-1.5 rounded-2xl shadow-xl flex items-center gap-2 cursor-pointer active:scale-95 transition-transform">
                    <i data-lucide="scissors" class="w-4 h-4 text-snapp rotate-90"></i>
                    <div class="text-right">
                        <span class="text-[9px] font-black text-snapp block">${slide.sticker.discount}</span>
                        <span class="font-mono font-black text-xs text-gray-900 tracking-wider" dir="ltr">${slide.sticker.code}</span>
                    </div>
                    <span class="text-[9px] font-bold bg-snapp-light text-snapp px-2 py-0.5 rounded-lg mr-1">کپی کد</span>
                </div>
            `;
        } else if (slide.sticker && slide.sticker.type === 'timer') {
            stickerBox.innerHTML = `
                <div class="bg-rose-600/90 text-white backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black flex items-center gap-1.5 shadow-lg border border-white/20">
                    <i data-lucide="flame" class="w-3.5 h-3.5 text-yellow-300 fill-yellow-300"></i>
                    <span>${slide.sticker.text}</span>
                </div>
            `;
        } else {
            stickerBox.innerHTML = '';
        }
    }

    // Bind CTA Action
    const ctaBtn = document.getElementById('story-cta-button');
    const ctaLabel = document.getElementById('story-cta-label');
    if (ctaBtn && ctaLabel) {
        ctaLabel.textContent = slide.cta.label;
        ctaBtn.onclick = (ev) => {
            ev.stopPropagation();
            handleCtaClick(slide.cta);
        };
    }

    if (window.lucide) lucide.createIcons();

    // Start Slide Progress Timer
    slideStartTime = performance.now();
    startProgressLoop();
}

function startProgressLoop() {
    cancelAnimationFrame(animationFrameId);

    function step(timestamp) {
        if (!isPaused) {
            const elapsed = (timestamp - slideStartTime) + elapsedBeforePause;
            const progress = Math.min(1, elapsed / SLIDE_DURATION);

            const activeFill = document.getElementById(`story-progress-fill-${currentSlideIdx}`);
            if (activeFill) {
                activeFill.style.width = `${progress * 100}%`;
            }

            if (progress >= 1) {
                goToNextSlide();
                return;
            }
        }
        animationFrameId = requestAnimationFrame(step);
    }

    animationFrameId = requestAnimationFrame(step);
}

function pauseSlideTimer() {
    if (isPaused) return;
    isPaused = true;
    elapsedBeforePause += performance.now() - slideStartTime;
    cancelAnimationFrame(animationFrameId);
}

function resumeSlideTimer() {
    if (!isPaused) return;
    isPaused = false;
    slideStartTime = performance.now();
    startProgressLoop();
}

/* ==========================================================================
 * NAVIGATION: NEXT / PREVIOUS / AUTO-ADVANCE
 * ========================================================================== */
function goToNextSlide() {
    const story = storiesData[currentStoryIdx];
    if (!story) return closeStoryViewer();

    if (currentSlideIdx < story.slides.length - 1) {
        currentSlideIdx++;
        loadSlide(currentStoryIdx, currentSlideIdx);
    } else {
        // Advance to next story
        if (currentStoryIdx < storiesData.length - 1) {
            currentStoryIdx++;
            currentSlideIdx = 0;
            loadSlide(currentStoryIdx, currentSlideIdx);
        } else {
            // End of all stories
            closeStoryViewer();
        }
    }
}

function goToPrevSlide() {
    if (currentSlideIdx > 0) {
        currentSlideIdx--;
        loadSlide(currentStoryIdx, currentSlideIdx);
    } else {
        if (currentStoryIdx > 0) {
            currentStoryIdx--;
            currentSlideIdx = storiesData[currentStoryIdx].slides.length - 1;
            loadSlide(currentStoryIdx, currentSlideIdx);
        } else {
            // Restart first slide
            loadSlide(0, 0);
        }
    }
}

/* ==========================================================================
 * INTERACTIVE WIDGETS: STICKER CONFETTI & REACTION HEARTS
 * ========================================================================== */
function copyStickerCode(code, event) {
    if (event) event.stopPropagation();
    navigator.clipboard.writeText(code);

    // Confetti Sparkles Particle burst around sticker
    const rect = event.currentTarget.getBoundingClientRect();
    spawnConfetti(rect.left + rect.width / 2, rect.top + rect.height / 2);

    if (window.IV_API && typeof window.IV_API.showToast === 'function') {
        window.IV_API.showToast(`کد تخفیف «${code}» کپی شد!`);
    } else {
        alert(`کد تخفیف ${code} کپی شد.`);
    }
}

function spawnConfetti(originX, originY) {
    const container = document.getElementById('story-particles-container');
    if (!container) return;

    const colors = ['#FF00A6', '#FFD600', '#00E5FF', '#10B981', '#FFFFFF'];
    for (let i = 0; i < 16; i++) {
        const p = document.createElement('div');
        const color = colors[Math.floor(Math.random() * colors.length)];
        const size = 4 + Math.random() * 6;
        const angle = Math.random() * Math.PI * 2;
        const distance = 40 + Math.random() * 60;

        p.className = 'absolute rounded-full pointer-events-none transition-all duration-700 ease-out';
        p.style.width = `${size}px`;
        p.style.height = `${size}px`;
        p.style.backgroundColor = color;
        p.style.left = `${originX}px`;
        p.style.top = `${originY}px`;
        p.style.transform = 'translate(-50%, -50%) scale(1)';
        p.style.opacity = '1';

        container.appendChild(p);

        requestAnimationFrame(() => {
            const destX = Math.cos(angle) * distance;
            const destY = Math.sin(angle) * distance;
            p.style.transform = `translate(calc(-50% + ${destX}px), calc(-50% + ${destY}px)) scale(0)`;
            p.style.opacity = '0';
        });

        setTimeout(() => p.remove(), 750);
    }
}

function triggerHeart(event) {
    if (event) event.stopPropagation();
    const container = document.getElementById('story-particles-container');
    if (!container) return;

    const heart = document.createElement('div');
    const startX = window.innerWidth * 0.18 + (Math.random() - 0.5) * 40;
    const startY = window.innerHeight - 85;

    heart.className = 'absolute pointer-events-none text-rose-500 transition-all duration-1000 ease-out z-50';
    heart.style.left = `${startX}px`;
    heart.style.top = `${startY}px`;
    heart.style.transform = 'translate(-50%, -50%) scale(0.6) rotate(0deg)';
    heart.style.opacity = '1';
    heart.innerHTML = `<svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`;

    container.appendChild(heart);

    requestAnimationFrame(() => {
        const driftX = (Math.random() - 0.5) * 80;
        const driftY = -180 - Math.random() * 100;
        const rot = (Math.random() - 0.5) * 40;
        heart.style.transform = `translate(calc(-50% + ${driftX}px), calc(-50% + ${driftY}px)) scale(1.4) rotate(${rot}deg)`;
        heart.style.opacity = '0';
    });

    setTimeout(() => heart.remove(), 1100);
}

/* ==========================================================================
 * CTA ACTION ROUTING & CLEANUP
 * ========================================================================== */
function handleCtaClick(cta) {
    closeStoryViewer();

    if (cta.action === 'vendor' && window.AppAPI) {
        window.AppAPI.selectVendor(cta.targetId);
        const homeTab = document.querySelector('.nav-tab[onclick*="home"]');
        if (homeTab) window.AppAPI.switchNavTab(homeTab, 'home');
    } else if (cta.action === 'deals' && window.AppAPI) {
        const dealsTab = document.querySelector('.nav-tab[onclick*="deals"]');
        if (dealsTab) window.AppAPI.switchNavTab(dealsTab, 'deals');
    }
}

export function closeStoryViewer() {
    cancelAnimationFrame(animationFrameId);

    const viewer = document.getElementById('stories-viewer-modal');
    if (viewer) {
        viewer.classList.add('opacity-0');
        setTimeout(() => {
            viewer.remove();
            // Re-render home rail so seen rings update
            renderStoryRail();
        }, 200);
    }
}

/* ==========================================================================
 * EXPOSE TO GLOBAL API
 * ========================================================================== */
window.StoriesAPI = {
    initStories: () => renderStoryRail(),
    openStory: (idx) => openStoryViewer(idx),
    closeViewer: () => closeStoryViewer(),
    copyStickerCode: (code, e) => copyStickerCode(code, e),
    triggerHeart: (e) => triggerHeart(e)
};