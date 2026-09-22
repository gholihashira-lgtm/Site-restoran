// notifications.js

let notificationsData = [
    {
        id: 'n1',
        type: 'order',
        title: 'سفارش شما تحویل داده شد',
        body: 'سفارش #۸۸۴۹۲۰۱ از کباب‌سرای توسکا با موفقیت تحویل داده شد. امتیاز خود را ثبت کنید.',
        time: Date.now() - 1000 * 60 * 15,
        read: false,
        icon: 'package-check',
        color: 'emerald',
        action: { type: 'order', targetId: 8849201, label: 'ثبت امتیاز' }
    },
    {
        id: 'n2',
        type: 'promo',
        title: 'کد تخفیف ویژه ۴۰٪',
        body: 'کد BURGER50 روی همه برگرها فعال شد. تا پایان امشب فرصت دارید.',
        time: Date.now() - 1000 * 60 * 60 * 2,
        read: false,
        icon: 'badge-percent',
        color: 'rose',
        action: { type: 'deals', label: 'مشاهده تخفیف‌ها' }
    },
    {
        id: 'n3',
        type: 'support',
        title: 'پاسخ پشتیبانی',
        body: 'تیکت شما در مورد فاکتور سفارش #۷۷۳۸۱۹۲ پاسخ داده شد. لطفاً بررسی کنید.',
        time: Date.now() - 1000 * 60 * 60 * 5,
        read: false,
        icon: 'headphones',
        color: 'sky',
        action: { type: 'support', label: 'مشاهده تیکت' }
    },
    {
        id: 'n4',
        type: 'wallet',
        title: 'واریز به کیف پول',
        body: 'مبلغ ۱۰۰,۰۰۰ تومان بابت دعوت از دوستان به کیف پول شما اضافه شد.',
        time: Date.now() - 1000 * 60 * 60 * 24,
        read: true,
        icon: 'wallet',
        color: 'emerald',
        action: { type: 'wallet', label: 'مشاهده کیف پول' }
    },
    {
        id: 'n5',
        type: 'order',
        title: 'سفارش در حال آماده‌سازی',
        body: 'سفارش #۷۷۳۸۱۹۲ از پیتزا ارم در حال آماده‌سازی است. زمان تحویل: ۴۵ دقیقه.',
        time: Date.now() - 1000 * 60 * 60 * 24 * 2,
        read: true,
        icon: 'chef-hat',
        color: 'amber',
        action: { type: 'tracking', targetId: 7738192, label: 'پیگیری سفارش' }
    },
    {
        id: 'n6',
        type: 'promo',
        title: 'لقمه پرو شما فعال شد',
        body: 'اشتراک لقمه پرو با موفقیت فعال شد. ۹۳ روز ارسال رایگان در انتظار شماست.',
        time: Date.now() - 1000 * 60 * 60 * 24 * 3,
        read: true,
        icon: 'crown',
        color: 'purple',
        action: { type: 'pro', label: 'مشاهده اشتراک' }
    }
];

function toPersianDigits(n) {
    if (n === null || n === undefined) return '';
    const f = ['۰','۱','۲','۳','۴','۵','۶','۷','۸','۹'];
    return n.toString().replace(/\d/g, x => f[x]);
}

function escapeHtml(s) {
    if (!s) return '';
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

function timeAgo(ts) {
    const diff = Math.floor((Date.now() - ts) / 1000);
    if (diff < 60) return 'همین حالا';
    if (diff < 3600) return `${toPersianDigits(Math.floor(diff / 60))} دقیقه پیش`;
    if (diff < 86400) return `${toPersianDigits(Math.floor(diff / 3600))} ساعت پیش`;
    if (diff < 86400 * 7) return `${toPersianDigits(Math.floor(diff / 86400))} روز پیش`;
    return `${toPersianDigits(Math.floor(diff / (86400 * 7)))} هفته پیش`;
}

function getUnreadCount() {
    return notificationsData.filter(n => !n.read).length;
}

function groupNotifications(list) {
    const now = Date.now();
    const groups = { today: [], yesterday: [], week: [], older: [] };
    list.forEach(n => {
        const days = Math.floor((now - n.time) / 86400000);
        if (days < 1) groups.today.push(n);
        else if (days < 2) groups.yesterday.push(n);
        else if (days < 7) groups.week.push(n);
        else groups.older.push(n);
    });
    return groups;
}

const COLOR_MAP = {
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    rose: 'bg-rose-50 text-rose-600 border-rose-100',
    sky: 'bg-sky-50 text-sky-600 border-sky-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
    gray: 'bg-gray-50 text-gray-500 border-gray-100'
};

export function updateNotificationBadge() {
    const badge = document.getElementById('notification-badge');
    if (!badge) return;
    const count = getUnreadCount();
    if (count > 0) {
        badge.textContent = toPersianDigits(count);
        badge.classList.remove('hidden');
    } else {
        badge.classList.add('hidden');
    }
}

export function openNotifications() {
    const existing = document.getElementById('notifications-view');
    if (existing) existing.remove();

    document.body.style.overflow = 'hidden';

    const view = document.createElement('div');
    view.id = 'notifications-view';
    view.className = 'fixed inset-0 z-[75] bg-gray-50 overflow-y-auto font-vazir';
    view.style.opacity = '0';
    view.style.transition = 'opacity 0.22s ease';

    view.innerHTML = renderNotificationsShell();
    document.body.appendChild(view);

    if (window.lucide) lucide.createIcons();

    requestAnimationFrame(() => { view.style.opacity = '1'; });

    bindNotificationEvents(view);
    renderNotificationsList('all');
}

function renderNotificationsShell() {
    const unread = getUnreadCount();
    return `
        <div class="max-w-md mx-auto bg-white min-h-screen relative pb-24">

            <div class="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 px-4 py-3">
                <div class="flex items-center justify-between mb-3">
                    <div class="flex items-center gap-2">
                        <button id="notif-close-btn" class="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 hover:bg-gray-200 active:scale-95 transition-all">
                            <i data-lucide="arrow-right" class="w-4 h-4"></i>
                        </button>
                        <div>
                            <h2 class="font-black text-sm text-gray-900">اعلان‌ها</h2>
                            <p class="text-[10px] text-gray-500 mt-0.5">
                                ${unread > 0 ? `${toPersianDigits(unread)} اعلان خوانده‌نشده` : 'همه را خوانده‌اید'}
                            </p>
                        </div>
                    </div>
                    <button id="notif-mark-all-btn" class="text-[10px] font-black text-snapp flex items-center gap-1 px-3 py-2 rounded-xl hover:bg-snapp-light transition-colors">
                        <i data-lucide="check-check" class="w-3.5 h-3.5"></i>
                        خواندن همه
                    </button>
                </div>

                <div class="flex items-center gap-2 overflow-x-auto no-scrollbar">
                    <button data-tab="all" class="notif-tab px-3.5 py-1.5 rounded-full text-xs font-black shrink-0 bg-snapp text-white transition-all">همه</button>
                    <button data-tab="unread" class="notif-tab px-3.5 py-1.5 rounded-full text-xs font-bold shrink-0 bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all">خوانده‌نشده</button>
                    <button data-tab="order" class="notif-tab px-3.5 py-1.5 rounded-full text-xs font-bold shrink-0 bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all">سفارش‌ها</button>
                    <button data-tab="promo" class="notif-tab px-3.5 py-1.5 rounded-full text-xs font-bold shrink-0 bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all">تخفیف‌ها</button>
                    <button data-tab="support" class="notif-tab px-3.5 py-1.5 rounded-full text-xs font-bold shrink-0 bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all">پشتیبانی</button>
                </div>
            </div>

            <div id="notif-body"></div>
        </div>
    `;
}

function renderNotificationsList(tab) {
    const body = document.getElementById('notif-body');
    if (!body) return;

    let list = [...notificationsData];
    if (tab === 'unread') list = list.filter(n => !n.read);
    else if (tab !== 'all') list = list.filter(n => n.type === tab);

    list.sort((a, b) => b.time - a.time);

    if (list.length === 0) {
        body.innerHTML = `
            <div class="px-4 py-16 text-center">
                <div class="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
                    <i data-lucide="bell-off" class="w-9 h-9"></i>
                </div>
                <h3 class="font-black text-sm text-gray-900 mb-1">اعلانی وجود ندارد</h3>
                <p class="text-xs text-gray-500">هر اتفاقی برای سفارش‌ها و تخفیف‌ها بیفته، اینجا خبردار می‌شوید.</p>
            </div>
        `;
        if (window.lucide) lucide.createIcons();
        return;
    }

    const groups = groupNotifications(list);

    let html = '<div class="px-4 py-4 space-y-6">';

    const groupLabels = {
        today: { title: 'امروز', icon: 'sun' },
        yesterday: { title: 'دیروز', icon: 'moon' },
        week: { title: 'این هفته', icon: 'calendar-days' },
        older: { title: 'قدیمی‌تر', icon: 'archive' }
    };

    Object.keys(groups).forEach(key => {
        const items = groups[key];
        if (items.length === 0) return;

        html += `
            <div>
                <div class="flex items-center gap-1.5 mb-3">
                    <i data-lucide="${groupLabels[key].icon}" class="w-3.5 h-3.5 text-gray-400"></i>
                    <span class="text-[10px] font-black text-gray-400 uppercase tracking-wider">${groupLabels[key].title}</span>
                    <span class="text-[10px] font-bold text-gray-400">(${toPersianDigits(items.length)})</span>
                </div>
                <div class="space-y-2">
                    ${items.map(n => renderNotificationCard(n)).join('')}
                </div>
            </div>
        `;
    });

    html += '</div>';
    body.innerHTML = html;
    if (window.lucide) lucide.createIcons();
}

function renderNotificationCard(n) {
    const colorCls = COLOR_MAP[n.color] || COLOR_MAP.gray;
    return `
        <div class="notif-card bg-white rounded-2xl border ${n.read ? 'border-gray-100' : 'border-snapp/25 shadow-sm shadow-pink-500/5'} overflow-hidden transition-all hover:shadow-[0_4px_14px_-6px_rgba(0,0,0,0.1)]" data-notif-id="${n.id}">
            <div class="p-3.5 flex gap-3 cursor-pointer" data-notif-click="${n.id}">
                <div class="w-11 h-11 rounded-2xl ${colorCls} border flex items-center justify-center shrink-0 relative">
                    <i data-lucide="${n.icon}" class="w-5 h-5"></i>
                    ${!n.read ? `<span class="absolute -top-1 -right-1 w-3 h-3 bg-snapp rounded-full border-2 border-white"></span>` : ''}
                </div>
                <div class="flex-1 min-w-0">
                    <div class="flex items-start justify-between gap-2 mb-1">
                        <h4 class="font-black text-xs text-gray-900 leading-snug flex-1 ${!n.read ? '' : 'font-bold text-gray-700'}">${escapeHtml(n.title)}</h4>
                        <span class="text-[9px] text-gray-400 font-bold shrink-0 whitespace-nowrap">${timeAgo(n.time)}</span>
                    </div>
                    <p class="text-[11px] text-gray-500 leading-relaxed line-clamp-2">${escapeHtml(n.body)}</p>
                    ${n.action ? `
                        <button class="mt-2.5 text-[10px] font-black text-snapp bg-snapp-light/60 border border-snapp/20 px-2.5 py-1.5 rounded-lg active:scale-95 transition-all flex items-center gap-1" data-notif-action="${n.id}">
                            ${escapeHtml(n.action.label)}
                            <i data-lucide="arrow-left" class="w-3 h-3"></i>
                        </button>
                    ` : ''}
                </div>
            </div>
        </div>
    `;
}

function bindNotificationEvents(view) {
    view.querySelector('#notif-close-btn').onclick = () => closeNotifications();

    view.querySelector('#notif-mark-all-btn').onclick = () => {
        notificationsData = notificationsData.map(n => ({ ...n, read: true }));
        updateNotificationBadge();
        renderNotificationsList(getActiveTab());
        showNotifToast('همه اعلان‌ها به‌عنوان خوانده‌شده علامت‌گذاری شدند.');
    };

    view.querySelectorAll('.notif-tab').forEach(tab => {
        tab.onclick = () => {
            const t = tab.dataset.tab;
            view.querySelectorAll('.notif-tab').forEach(x => {
                x.className = 'notif-tab px-3.5 py-1.5 rounded-full text-xs font-bold shrink-0 bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all';
            });
            tab.className = 'notif-tab px-3.5 py-1.5 rounded-full text-xs font-black shrink-0 bg-snapp text-white transition-all';
            renderNotificationsList(t);
        };
    });

    view.addEventListener('click', (e) => {
        const card = e.target.closest('[data-notif-click]');
        if (card) {
            const id = card.dataset.notifClick;
            handleNotificationClick(id);
            return;
        }

        const actionBtn = e.target.closest('[data-notif-action]');
        if (actionBtn) {
            e.stopPropagation();
            const id = actionBtn.dataset.notifAction;
            const notif = notificationsData.find(n => n.id === id);
            if (notif && !notif.read) {
                notif.read = true;
                updateNotificationBadge();
                renderNotificationsList(getActiveTab());
            }
            handleNotificationAction(id);
        }
    });
}

function getActiveTab() {
    const active = document.querySelector('.notif-tab.bg-snapp');
    return active ? active.dataset.tab : 'all';
}

function handleNotificationClick(id) {
    const n = notificationsData.find(x => x.id === id);
    if (!n) return;

    if (!n.read) {
        n.read = true;
        updateNotificationBadge();
        renderNotificationsList(getActiveTab());
    }
}

function handleNotificationAction(id) {
    const n = notificationsData.find(x => x.id === id);
    if (!n || !n.action) return;

    closeNotifications();

    setTimeout(() => {
        if (n.action.type === 'order') {
            if (window.IV_API && typeof window.IV_API.openRating === 'function') {
                window.IV_API.openRating(n.action.targetId);
            }
        } else if (n.action.type === 'tracking') {
            if (window.OrderTrackingAPI) {
                import('./order-tracking.js').then(m => m.openOrderTracking({ id: n.action.targetId }));
            }
        } else if (n.action.type === 'deals') {
            const dealsTab = document.querySelector('.nav-tab[onclick*="deals"]');
            if (dealsTab) dealsTab.click();
        } else if (n.action.type === 'support') {
            if (window.PI_API && window.PI_API.openSupport) window.PI_API.openSupport();
        } else if (n.action.type === 'wallet') {
            if (window.PI_API && window.PI_API.openWallet) window.PI_API.openWallet();
        } else if (n.action.type === 'pro') {
            if (window.PI_API && window.PI_API.openProDetails) window.PI_API.openProDetails();
        }
    }, 240);
}

function closeNotifications() {
    const view = document.getElementById('notifications-view');
    if (view) {
        view.style.opacity = '0';
        setTimeout(() => {
            view.remove();
            document.body.style.overflow = '';
        }, 220);
    }
}

export function pushNotification(notif) {
    const newNotif = {
        id: 'n' + Date.now(),
        time: Date.now(),
        read: false,
        icon: notif.icon || 'bell',
        color: notif.color || 'gray',
        type: notif.type || 'system',
        title: notif.title || 'اعلان جدید',
        body: notif.body || '',
        action: notif.action || null
    };
    notificationsData.unshift(newNotif);
    updateNotificationBadge();
    if (notif.toast !== false) {
        showInAppToast(newNotif);
    }
}

function showInAppToast(notif) {
    const existing = document.getElementById('notif-inapp-toast');
    if (existing) existing.remove();

    const colorCls = COLOR_MAP[notif.color] || COLOR_MAP.gray;

    const t = document.createElement('div');
    t.id = 'notif-inapp-toast';
    t.className = 'fixed top-4 left-1/2 -translate-x-1/2 z-[10010] w-max max-w-[90vw] transition-all duration-300 transform -translate-y-16 opacity-0 font-vazir';
    t.innerHTML = `
        <div class="bg-white rounded-2xl shadow-2xl border border-gray-100 p-3 flex items-center gap-3 min-w-[280px] cursor-pointer" onclick="window.NotificationsAPI.openFromToast('${notif.id}')">
            <div class="w-9 h-9 rounded-xl ${colorCls} border flex items-center justify-center shrink-0">
                <i data-lucide="${notif.icon}" class="w-4 h-4"></i>
            </div>
            <div class="flex-1 min-w-0">
                <div class="font-black text-[11px] text-gray-900 truncate">${escapeHtml(notif.title)}</div>
                <div class="text-[10px] text-gray-500 truncate mt-0.5">${escapeHtml(notif.body)}</div>
            </div>
            <i data-lucide="x" class="w-3.5 h-3.5 text-gray-300 shrink-0 hover:text-gray-500 cursor-pointer" onclick="event.stopPropagation(); this.parentElement.parentElement.remove()"></i>
        </div>
    `;
    document.body.appendChild(t);
    if (window.lucide) lucide.createIcons();

    requestAnimationFrame(() => {
        t.classList.remove('-translate-y-16', 'opacity-0');
        t.classList.add('translate-y-0', 'opacity-100');
    });

    setTimeout(() => {
        if (t.parentElement) {
            t.classList.remove('translate-y-0', 'opacity-100');
            t.classList.add('-translate-y-16', 'opacity-0');
            setTimeout(() => t.remove(), 300);
        }
    }, 4000);
}

function showNotifToast(msg) {
    const existing = document.getElementById('notif-toast');
    if (existing) existing.remove();

    const t = document.createElement('div');
    t.id = 'notif-toast';
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

window.NotificationsAPI = {
    open: function() { openNotifications(); },
    close: function() { closeNotifications(); },
    markAllRead: function() {
        notificationsData = notificationsData.map(n => ({ ...n, read: true }));
        updateNotificationBadge();
    },
    push: function(notif) { pushNotification(notif); },
    openFromToast: function(id) {
        const toast = document.getElementById('notif-inapp-toast');
        if (toast) toast.remove();
        openNotifications();
        setTimeout(() => {
            const n = notificationsData.find(x => x.id === id);
            if (n && n.action) handleNotificationAction(id);
            else if (n) handleNotificationClick(id);
        }, 350);
    }
};

window.openNotifications = openNotifications;