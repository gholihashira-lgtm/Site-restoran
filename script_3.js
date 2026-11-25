/* ============================================================
   deepseek-chat.js — Unified LoghmeYar (لقمه‌یار) AI Assistant
   - Communicates exclusively with backend POST /api/ai/chat
   - Owner-managed API key only (zero frontend keys/prompts/localStorage)
   - Real catalog search, strict Toman price filtering, validated clickable cards
   - Preserves existing chat interface design (without API-key button)
   ============================================================ */
(function (global) {
  'use strict';

  // Prevent duplicate chat instances if multiple scripts are loaded
  if (global.__LOGHMEYAR_UNIFIED_LOADED__) return;
  global.__LOGHMEYAR_UNIFIED_LOADED__ = true;

  // Clean up any legacy API key previously stored by older frontend versions
  try {
    if (global.localStorage) {
      global.localStorage.removeItem('loghme_gemini_api_key');
    }
  } catch (_) {}

  // ============================================================
  // CONFIG
  // ============================================================
  const API_ENDPOINT = '/api/ai/chat';
  const MAX_HISTORY = 20;
  const UI_THROTTLE_MS = 45;

  // ============================================================
  // STATE
  // ============================================================
  let chatHistory = [];
  let lastRecommendations = [];
  let isOpen = false;
  let isLoading = false;

  // ============================================================
  // PERSIAN & NUMBER UTILITIES
  // ============================================================
  function normalizeDigits(str) {
    if (!str) return '';
    const persian = '۰۱۲۳۴۵۶۷۸۹';
    const arabic = '٠١٢٣٤٥٦٧٨٩';
    return String(str)
      .replace(/[۰-۹]/g, (d) => String(persian.indexOf(d)))
      .replace(/[٠-٩]/g, (d) => String(arabic.indexOf(d)))
      .replace(/[٬,،]/g, '')
      .replace(/\u200c/g, ' ');
  }

  function toPersianDigits(n) {
    if (n === null || n === undefined) return '';
    const f = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    return String(n).replace(/\d/g, (d) => f[d]);
  }

  function formatPrice(amount) {
    if (global.AppAPI && typeof global.AppAPI.formatPrice === 'function') {
      return global.AppAPI.formatPrice(amount);
    }
    const n = Math.round(Number(amount) || 0);
    return toPersianDigits(n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','));
  }

  function escapeHtml(s) {
    return String(s || '').replace(/[&<>"']/g, (c) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    }[c]));
  }

  /**
   * Parse a strict maximum price in Tomans from Persian/English user messages.
   * Examples:
   *  - "غذای زیر 200 تومن" -> 200000
   *  - "زیر ۲۰۰ هزار تومن" -> 200000
   *  - "تا 150000 تومان" -> 150000
   *  - "حداکثر ۳۵۰ تومن" -> 350000
   *  - "ارزونتر از 180 تومن" -> 180000
   */
  function parseStrictMaxPrice(message) {
    const clean = normalizeDigits(message).toLowerCase();

    if (/(زیر|تا|حداکثر|کمتر\s*از|نهایت|بودجه|سقف)\s*(نیم|نصف)\s*میلیون/.test(clean)) {
      return 500000;
    }

    const millionMatch = clean.match(
      /(?:زیر|تا|حداکثر|کمتر\s*از|نهایت|ارزون\s*تر\s*از|ارزان\s*تر\s*از|بودجه|سقف)\s*(\d+(?:\.\d+)?)\s*میلیون/
    );
    if (millionMatch) {
      const val = Math.round(parseFloat(millionMatch[1]) * 1000000);
      if (Number.isFinite(val) && val > 0) return val;
    }

    const explicitBound = clean.match(
      /(?:زیر|تا|حداکثر|کمتر\s*از|نهایت|نهایتا|ارزون\s*تر\s*از|ارزان\s*تر\s*از|بودجه(?:م|ام)?|سقف)\s*(?:حدود\s*)?(\d+)\s*(هزار\s*توم[ا]?ن|هزار|توم[ا]?ن|k|ت)?/i
    );
    if (explicitBound) {
      let num = parseInt(explicitBound[1], 10);
      const unit = (explicitBound[2] || '').trim().toLowerCase();
      if (!Number.isNaN(num) && num > 0) {
        if (unit.includes('هزار') || unit === 'k') {
          num *= 1000;
        } else if (num < 2000) {
          // Food-ordering shorthand: "200 تومن" -> 200,000 Tomans
          num *= 1000;
        }
        return num;
      }
    }

    const budgetWith = clean.match(/با\s*(\d+)\s*(هزار\s*توم[ا]?ن|هزار|توم[ا]?ن|k)/i);
    if (budgetWith) {
      let num = parseInt(budgetWith[1], 10);
      const unit = (budgetWith[2] || '').trim().toLowerCase();
      if (!Number.isNaN(num) && num > 0) {
        if (unit.includes('هزار') || unit === 'k' || num < 2000) {
          num *= 1000;
        }
        return num;
      }
    }

    return null;
  }

  // ============================================================
  // REAL CATALOG ACCESS & STRICT FILTERING
  // ============================================================
  function getCatalogProducts() {
    if (global.AppAPI && Array.isArray(global.AppAPI.catalogProducts)) {
      return global.AppAPI.catalogProducts;
    }
    return [];
  }

  function getVendors() {
    if (global.AppAPI && Array.isArray(global.AppAPI.vendors)) {
      return global.AppAPI.vendors;
    }
    return [];
  }

  function getVendorMap() {
    const map = new Map();
    for (const v of getVendors()) {
      map.set(v.id, v);
    }
    return map;
  }

  function isProductAvailable(p) {
    if (!p) return false;
    if (typeof p.stockLeft === 'number' && p.stockLeft <= 0) return false;
    return true;
  }

  function toCompactProduct(p, vendorMap) {
    const vendor = vendorMap.get(p.vendorId);
    const hasRealDiscount = Number(p.discount) > 0 && Number(p.originalPrice) > Number(p.price);
    return {
      id: p.id,
      vendorId: p.vendorId,
      vendorName: vendor ? vendor.name : '',
      categoryId: p.categoryId,
      title: p.title,
      desc: p.desc || '',
      price: Number(p.price),
      originalPrice: hasRealDiscount ? Number(p.originalPrice) : Number(p.price),
      discount: hasRealDiscount ? Number(p.discount) : 0,
      stockLeft: typeof p.stockLeft === 'number' ? p.stockLeft : 1,
      rating: Number(p.rating) || 0,
      reviews: Number(p.reviews) || 0
    };
  }

  const CATEGORY_PATTERNS = [
    { id: 'pizza', re: /پیتزا|پپرونی|مارگاریتا|ناپل|پیتزایی/i },
    { id: 'burgers', re: /برگر|چیزبرگر|همبرگر|اسلایدر|اسمش|بیکن/i },
    { id: 'kebab', re: /کباب|کوبیده|جوجه|شیشلیک|برگ|چنجه|بختیاری|سلطانی/i },
    { id: 'traditional', re: /سنتی|خورش|خورشت|قورمه|قیمه|ته\s*چین|پلو|چلو|کشک\s*بادمجان|میرزا\s*قاسمی|فسنجان|ایرانی/i },
    { id: 'ash', re: /آش|حلیم|رشته/i },
    { id: 'sandwich', re: /ساندویچ|باگت|هات\s*داگ|بندری|ژامبون|هایدا|زینگر|رست\s*بیف/i },
    { id: 'appetizers', re: /پیش\s*غذا|سیب\s*زمینی|بال|کتف|پاچینی|موزارلا|نان\s*سیر|سوخاری/i },
    { id: 'sweets', re: /شیرینی|دسر|کیک|باقلوا|کروسان|شله\s*زرد|رولت|نان\s*خامه/i },
    { id: 'drinks', re: /نوشیدنی|دوغ|نوشابه|موهیتو|لیموناد|قهوه|شربت|چای|کلد\s*برو/i },
    { id: 'supermarket', re: /سوپرمارکت|چیپس|پفک|تنقلات/i }
  ];

  function buildCatalogContext(userMessage) {
    const clean = normalizeDigits(userMessage).toLowerCase();
    const vendorMap = getVendorMap();
    const allAvailable = getCatalogProducts().filter(isProductAvailable);

    let strictMaxPrice = parseStrictMaxPrice(userMessage);

    // Detect requested categories
    const matchedCategories = CATEGORY_PATTERNS
      .filter((c) => c.re.test(clean))
      .map((c) => c.id);

    const wantsCheaperFollowup =
      strictMaxPrice === null &&
      lastRecommendations.length > 0 &&
      /(ارزون\s*تر|ارزان\s*تر|گرون|گران)/.test(clean);

    if (wantsCheaperFollowup) {
      const prevMin = Math.min(...lastRecommendations.map((r) => Number(r.price)).filter((n) => n > 0));
      if (Number.isFinite(prevMin) && prevMin > 0) {
        strictMaxPrice = prevMin - 1;
      }
    }

    let pool = strictMaxPrice !== null
      ? allAvailable.filter((p) => Number(p.price) <= strictMaxPrice)
      : allAvailable.slice();

    const wantsCheapest = /ارزان|ارزون|اقتصاد|کم\s*خرج|مقرون|سیر\s*کننده/.test(clean);
    const wantsDiscount = /تخفیف|حراج|آفر|شگفت/.test(clean);
    const wantsBest = /بهترین|عالی|خوب|محبوب|پرفروش|امتیاز|خوشمزه/.test(clean);
    const wantsVendorCompare = /کدوم\s*رستوران|کدام\s*رستوران|رستوران\s*ارزان|رستوران\s*ارزون|فروشگاه/.test(clean);
    const wantsSpicy = /تند|اسپایس|هالوپینو|چیلی|آتشین|مکزیکی|بندری/.test(clean);
    const wantsMainMeal = /غذا|شام|ناهار|سیر|دونفره|دو\s*نفره/.test(clean) && matchedCategories.length === 0;

    if (matchedCategories.length > 0) {
      const catPool = pool.filter((p) => matchedCategories.includes(p.categoryId));
      if (catPool.length > 0) pool = catPool;
    } else if (wantsCheaperFollowup) {
      const prevCats = new Set(lastRecommendations.map((r) => r.categoryId).filter(Boolean));
      const sameCatPool = pool.filter((p) => prevCats.has(p.categoryId));
      if (sameCatPool.length > 0) pool = sameCatPool;
    } else if (wantsMainMeal && (strictMaxPrice !== null || wantsCheapest)) {
      const mealCats = new Set(['burgers', 'pizza', 'kebab', 'traditional', 'ash', 'sandwich', 'appetizers']);
      const mealPool = pool.filter((p) => mealCats.has(p.categoryId));
      if (mealPool.length > 0) pool = mealPool;
    }

    if (wantsSpicy) {
      const spicyPool = pool.filter((p) =>
        /تند|هالوپینو|اسپایس|چیلی|آتشین|مکزیکی|بندری|زینگر|دیالووا/.test(`${p.title} ${p.desc}`)
      );
      if (spicyPool.length > 0) pool = spicyPool;
    }

    pool.sort((a, b) => {
      if (wantsDiscount && !wantsCheapest) {
        return (b.discount - a.discount) || (b.rating - a.rating) || (a.price - b.price);
      }
      if (wantsCheapest) {
        return (a.price - b.price) || (b.rating - a.rating);
      }
      if (wantsBest) {
        return (b.rating - a.rating) || (b.reviews - a.reviews) || (b.discount - a.discount);
      }
      if (strictMaxPrice !== null) {
        const scoreA = (a.rating * 20) + (a.discount * 1.5) - (a.price / 50000);
        const scoreB = (b.rating * 20) + (b.discount * 1.5) - (b.price / 50000);
        return scoreB - scoreA;
      }
      return (b.rating - a.rating) || (b.discount - a.discount);
    });

    const seenTitles = new Set();
    const selected = [];
    for (const p of pool) {
      if (seenTitles.has(p.title)) continue;
      seenTitles.add(p.title);
      selected.push(toCompactProduct(p, vendorMap));
      if (selected.length >= 20) break;
    }

    let cheapestByVendor = [];
    if (wantsVendorCompare || wantsCheapest) {
      const byVendor = new Map();
      for (const p of allAvailable) {
        if (!byVendor.has(p.vendorId)) byVendor.set(p.vendorId, []);
        byVendor.get(p.vendorId).push(p);
      }
      cheapestByVendor = Array.from(byVendor.entries())
        .map(([vid, list]) => {
          const v = vendorMap.get(vid);
          if (!v || v.id === 'v_sweets') return null;
          const sorted = list.slice().sort((a, b) => a.price - b.price);
          const avg = Math.round(list.reduce((sum, x) => sum + x.price, 0) / list.length);
          return {
            id: v.id,
            name: v.name,
            rating: v.rating,
            cheapestTitle: sorted[0].title,
            cheapestPrice: sorted[0].price,
            avgPrice: avg
          };
        })
        .filter(Boolean)
        .sort((a, b) => a.cheapestPrice - b.cheapestPrice)
        .slice(0, 12);
    }

    return {
      strictMaxPrice,
      matchedProducts: selected,
      cheapestByVendor,
      vendors: getVendors()
        .filter((v) => v.id !== 'v_sweets')
        .map((v) => ({ id: v.id, name: v.name, type: v.type, rating: v.rating }))
    };
  }

  // ============================================================
  // RESPONSE TAG PARSING & VALIDATION
  // ============================================================
  function stripMetaBlocks(text) {
    if (!text) return '';
    let out = String(text);
    out = out.replace(/<<<(?:PRODUCTS|ACTION):[\s\S]*?(?:>>>|$)/g, '');
    return out.trim();
  }

  function extractProductIds(rawText) {
    if (!rawText) return [];
    const m = rawText.match(/<<<PRODUCTS:(\[[\s\S]*?\])>>>/);
    if (!m) return [];
    try {
      const arr = JSON.parse(m[1]);
      if (!Array.isArray(arr)) return [];
      return arr.map((id) => Number(id)).filter((id) => Number.isFinite(id));
    } catch (_) {
      return [];
    }
  }

  function extractAction(rawText) {
    if (!rawText) return null;
    const m = rawText.match(/<<<ACTION:(\{[\s\S]*?\})>>>/);
    if (!m) return null;
    try {
      const parsed = JSON.parse(m[1]);
      return parsed && typeof parsed.type === 'string' ? parsed : null;
    } catch (_) {
      return null;
    }
  }

  function validateProducts(ids, strictMaxPrice) {
    if (!Array.isArray(ids) || ids.length === 0) return [];
    const catalog = getCatalogProducts();
    const byId = new Map(catalog.map((p) => [Number(p.id), p]));
    const seen = new Set();
    const validated = [];

    for (const rawId of ids) {
      const id = Number(rawId);
      if (seen.has(id)) continue;
      const product = byId.get(id);
      if (!product || !isProductAvailable(product)) continue;
      if (strictMaxPrice !== null && Number(product.price) > strictMaxPrice) continue;
      seen.add(id);
      validated.push(product);
      if (validated.length >= 6) break;
    }

    return validated;
  }

  function executeSiteAction(action) {
    if (!action || !action.type) return { executed: false };
    try {
      switch (action.type) {
        case 'ADD_TO_CART': {
          const pid = Number(action.id);
          const product = getCatalogProducts().find((p) => Number(p.id) === pid);
          if (!product || !isProductAvailable(product)) {
            return { executed: false, reason: 'PRODUCT_UNAVAILABLE' };
          }
          if (global.AppAPI && typeof global.AppAPI.handleAddToCart === 'function') {
            global.AppAPI.handleAddToCart(pid, []);
            return { executed: true, product };
          }
          return { executed: false, reason: 'CART_API_MISSING' };
        }
        case 'OPEN_VENDOR': {
          const vid = String(action.id || '');
          const vendorExists = getVendors().some((v) => v.id === vid);
          if (!vendorExists) return { executed: false, reason: 'VENDOR_NOT_FOUND' };
          closeChat();
          if (global.AppAPI && typeof global.AppAPI.selectVendor === 'function') {
            global.AppAPI.selectVendor(vid);
            return { executed: true };
          }
          return { executed: false };
        }
        case 'OPEN_CART': {
          closeChat();
          if (global.AppAPI && typeof global.AppAPI.toggleCartDrawer === 'function') {
            global.AppAPI.toggleCartDrawer(true);
            return { executed: true };
          }
          return { executed: false };
        }
        default:
          return { executed: false };
      }
    } catch (e) {
      console.warn('[LoghmeYar] Action execution failed:', e);
      return { executed: false };
    }
  }

  // ============================================================
  // SAFE MARKDOWN RENDERER (No raw AI HTML injection)
  // ============================================================
  function renderMarkdown(text) {
    if (!text) return '';
    let html = escapeHtml(text);

    html = html.replace(/```([\s\S]*?)```/g, (_, code) =>
      '<pre class="ly-pre"><code>' + code.replace(/^\n+/, '') + '</code></pre>'
    );
    html = html.replace(/`([^`\n]+)`/g, '<code class="ly-code">$1</code>');
    html = html.replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/(^|[^*])\*([^*\n]+)\*(?!\*)/g, '$1<em>$2</em>');
    html = html.replace(
      /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer" class="ly-link">$1</a>'
    );
    html = html.replace(/^### (.+)$/gm, '<div class="ly-h3">$1</div>');
    html = html.replace(/^## (.+)$/gm, '<div class="ly-h2">$1</div>');
    html = html.replace(/^# (.+)$/gm, '<div class="ly-h1">$1</div>');
    html = html.replace(/^[-*] (.+)$/gm, '• $1');
    html = html.replace(/\n/g, '<br>');

    return html;
  }

  // ============================================================
  // RELIABLE SSE PARSER & BACKEND CLIENT
  // ============================================================
  function parseSseBuffer(buffer, onEvent, flushAll) {
    const normalized = buffer.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    const blocks = normalized.split('\n\n');
    const remainder = flushAll ? '' : (blocks.pop() || '');

    for (const block of blocks) {
      if (!block.trim()) continue;
      const dataLines = [];
      for (const line of block.split('\n')) {
        if (line.startsWith('data:')) {
          dataLines.push(line.slice(5).trimStart());
        }
      }
      if (dataLines.length > 0) {
        onEvent(dataLines.join('\n').trim());
      }
    }

    return remainder;
  }

  async function requestChatFromBackend(userMessage, catalogContext, onChunk) {
    let response;
    try {
      response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'text/event-stream, application/json'
        },
        body: JSON.stringify({
          message: userMessage,
          history: chatHistory.slice(-MAX_HISTORY),
          catalogContext,
          lastRecommendations,
          stream: true
        })
      });
    } catch (_) {
      const netErr = new Error('خطا در اتصال به سرور. لطفاً اتصال اینترنت خود را بررسی کنید.');
      netErr.code = 'CONNECTION_ERROR';
      throw netErr;
    }

    const contentType = (response.headers.get('content-type') || '').toLowerCase();

    if (!response.ok) {
      let errPayload = null;
      try {
        errPayload = await response.json();
      } catch (_) {
        errPayload = null;
      }
      const err = new Error(
        (errPayload && errPayload.message) ||
          (response.status === 404
            ? 'مسیر سرور هوش مصنوعی (/api/ai/chat) یافت نشد.'
            : response.status === 429
            ? 'تعداد درخواست‌ها زیاد شده است. لطفاً کمی بعد دوباره تلاش کنید.'
            : 'خطا در ارتباط با سرور هوش مصنوعی.')
      );
      err.code = (errPayload && errPayload.error) || `HTTP_${response.status}`;
      throw err;
    }

    if (contentType.includes('application/json')) {
      const data = await response.json();
      const reply = typeof data.reply === 'string' ? data.reply : '';
      if (!reply.trim()) {
        const emptyErr = new Error('پاسخی از هوش مصنوعی دریافت نشد. لطفاً دوباره تلاش کنید.');
        emptyErr.code = 'EMPTY_RESPONSE';
        throw emptyErr;
      }
      onChunk(reply);
      return reply;
    }

    if (!response.body || typeof response.body.getReader !== 'function') {
      const text = await response.text();
      let full = '';
      parseSseBuffer(
        text,
        (raw) => {
          try {
            const evt = JSON.parse(raw);
            if (evt.error) throw new Error(evt.message || 'خطا در دریافت پاسخ.');
            if (evt.delta) full += evt.delta;
          } catch (e) {
            if (e && e.message && !e.message.includes('JSON')) throw e;
          }
        },
        true
      );
      if (!full.trim()) {
        throw new Error('پاسخی از هوش مصنوعی دریافت نشد. لطفاً دوباره تلاش کنید.');
      }
      onChunk(full);
      return full;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';
    let full = '';
    let lastEmit = 0;
    let streamError = null;

    const handleEvent = (raw) => {
      if (!raw || raw === '[DONE]') return;
      let evt;
      try {
        evt = JSON.parse(raw);
      } catch (_) {
        return;
      }
      if (evt.error) {
        streamError = new Error(evt.message || 'پاسخی از هوش مصنوعی دریافت نشد.');
        streamError.code = evt.error;
        return;
      }
      if (typeof evt.delta === 'string' && evt.delta.length > 0) {
        full += evt.delta;
        const now = Date.now();
        if (now - lastEmit >= UI_THROTTLE_MS) {
          lastEmit = now;
          onChunk(full);
        }
      }
    };

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      buffer = parseSseBuffer(buffer, handleEvent, false);
      if (streamError) throw streamError;
    }

    buffer += decoder.decode();
    if (buffer.trim()) {
      parseSseBuffer(buffer, handleEvent, true);
    }
    if (streamError) throw streamError;

    if (!full.trim()) {
      const emptyErr = new Error('پاسخی از هوش مصنوعی دریافت نشد. لطفاً دوباره تلاش کنید.');
      emptyErr.code = 'EMPTY_RESPONSE';
      throw emptyErr;
    }

    onChunk(full);
    return full;
  }

  // ============================================================
  // VALIDATED PRODUCT CARDS UI
  // ============================================================
  function buildProductCardsElement(products) {
    const vendorMap = getVendorMap();
    const container = document.createElement('div');
    container.className = 'ly-rec-list';

    for (const p of products) {
      const vendor = vendorMap.get(p.vendorId);
      const vendorName = vendor ? vendor.name : '';
      const hasDiscount = Number(p.discount) > 0 && Number(p.originalPrice) > Number(p.price);

      const card = document.createElement('div');
      card.className = 'ly-rec-card';

      const img = document.createElement('img');
      img.className = 'ly-rec-img';
      img.src = p.image || '';
      img.alt = p.title || '';
      img.loading = 'lazy';
      img.onclick = () => openProductDetailsFromChat(p.id);

      const info = document.createElement('div');
      info.className = 'ly-rec-info';

      const titleEl = document.createElement('div');
      titleEl.className = 'ly-rec-title';
      titleEl.textContent = p.title || '';
      titleEl.onclick = () => openProductDetailsFromChat(p.id);

      const metaEl = document.createElement('div');
      metaEl.className = 'ly-rec-meta';

      if (vendorName) {
        const vSpan = document.createElement('span');
        vSpan.className = 'ly-rec-vendor';
        vSpan.textContent = vendorName;
        metaEl.appendChild(vSpan);
      }

      if (Number(p.rating) > 0) {
        const rSpan = document.createElement('span');
        rSpan.className = 'ly-rec-rating';
        rSpan.textContent = `★ ${toPersianDigits(p.rating)}`;
        metaEl.appendChild(rSpan);
      }

      if (hasDiscount) {
        const dSpan = document.createElement('span');
        dSpan.className = 'ly-rec-discount';
        dSpan.textContent = `٪${toPersianDigits(p.discount)}`;
        metaEl.appendChild(dSpan);
      }

      const priceRow = document.createElement('div');
      priceRow.className = 'ly-rec-price-row';

      const priceEl = document.createElement('span');
      priceEl.className = 'ly-rec-price';
      priceEl.textContent = `${formatPrice(p.price)} تومان`;
      priceRow.appendChild(priceEl);

      if (hasDiscount) {
        const oldPriceEl = document.createElement('span');
        oldPriceEl.className = 'ly-rec-old-price';
        oldPriceEl.textContent = formatPrice(p.originalPrice);
        priceRow.appendChild(oldPriceEl);
      }

      const actionsRow = document.createElement('div');
      actionsRow.className = 'ly-rec-actions';

      const detailsBtn = document.createElement('button');
      detailsBtn.type = 'button';
      detailsBtn.className = 'ly-rec-btn ly-rec-btn--details';
      detailsBtn.textContent = 'مشاهده جزئیات';
      detailsBtn.onclick = () => openProductDetailsFromChat(p.id);

      const addBtn = document.createElement('button');
      addBtn.type = 'button';
      addBtn.className = 'ly-rec-btn ly-rec-btn--add';
      addBtn.textContent = '+ افزودن به سبد';
      addBtn.onclick = () => {
        if (global.AppAPI && typeof global.AppAPI.handleAddToCart === 'function') {
          global.AppAPI.handleAddToCart(Number(p.id), []);
          addBtn.textContent = '✓ اضافه شد';
          addBtn.classList.add('ly-rec-btn--added');
          setTimeout(() => {
            addBtn.textContent = '+ افزودن به سبد';
            addBtn.classList.remove('ly-rec-btn--added');
          }, 1600);
        }
      };

      actionsRow.appendChild(detailsBtn);
      actionsRow.appendChild(addBtn);

      info.appendChild(titleEl);
      info.appendChild(metaEl);
      info.appendChild(priceRow);
      info.appendChild(actionsRow);

      card.appendChild(img);
      card.appendChild(info);
      container.appendChild(card);
    }

    return container;
  }

  function openProductDetailsFromChat(productId) {
    const pid = Number(productId);
    const exists = getCatalogProducts().some((p) => Number(p.id) === pid);
    if (!exists) return;

    // Close chat first because #dynamic-product-modal has z-index: 60 (below #ds-chat-modal's 10050)
    closeChat();
    if (typeof global.openProductModal === 'function') {
      global.openProductModal(pid);
    }
  }

  // ============================================================
  // UI (Preserves exact existing appearance, removes API-key button)
  // ============================================================
  function injectStyles() {
    if (document.getElementById('ly-styles')) return;
    const s = document.createElement('style');
    s.id = 'ly-styles';
    s.textContent = `
      #loghme-yar-orb { display: none !important; }
      #ds-messages .ly-code { background:#f1f5f9;padding:1px 6px;border-radius:4px;font-family:monospace;font-size:11px;direction:ltr;display:inline-block; }
      #ds-messages .ly-pre { background:#0f172a;color:#e5e7eb;padding:10px 12px;border-radius:8px;overflow-x:auto;font-family:monospace;font-size:11px;direction:ltr;text-align:left;margin:6px 0;white-space:pre; }
      #ds-messages .ly-link { color:#1a73e8;text-decoration:underline; }
      #ds-messages .ly-h1 { font-weight:900;font-size:14px;margin:8px 0 4px; }
      #ds-messages .ly-h2 { font-weight:800;font-size:13px;margin:6px 0 3px; }
      #ds-messages .ly-h3 { font-weight:700;font-size:12px;margin:4px 0 2px; }
      @keyframes lyT { 0%,60%,100%{opacity:.3;} 30%{opacity:1;} }
      .ly-dot { display:inline-block;width:5px;height:5px;border-radius:50%;background:#94a3b8;margin:0 1.5px;animation:lyT 1.2s infinite; }
      .ly-dot:nth-child(2){animation-delay:.2s;} .ly-dot:nth-child(3){animation-delay:.4s;}
      .ly-rec-list { display:flex;flex-direction:column;gap:8px;margin-top:10px;width:100%; }
      .ly-rec-card { display:flex;gap:10px;padding:8px;border:1px solid #e2e8f0;border-radius:12px;background:#f8fafc;align-items:flex-start;direction:rtl; }
      .ly-rec-img { width:62px;height:62px;border-radius:10px;object-fit:cover;flex-shrink:0;cursor:pointer;background:#e2e8f0; }
      .ly-rec-info { flex:1;min-width:0;display:flex;flex-direction:column;gap:4px; }
      .ly-rec-title { font-size:11.5px;font-weight:800;color:#0f172a;line-height:1.4;cursor:pointer; }
      .ly-rec-title:hover { color:#1a73e8; }
      .ly-rec-meta { display:flex;flex-wrap:wrap;align-items:center;gap:5px;font-size:10px;color:#64748b; }
      .ly-rec-vendor { font-weight:600; }
      .ly-rec-rating { background:#fef3c7;color:#d97706;padding:1px 5px;border-radius:6px;font-weight:800; }
      .ly-rec-discount { background:#ef4444;color:#fff;padding:1px 5px;border-radius:6px;font-weight:800; }
      .ly-rec-price-row { display:flex;align-items:baseline;gap:6px; }
      .ly-rec-price { font-size:11.5px;font-weight:900;color:#1a73e8; }
      .ly-rec-old-price { font-size:10px;color:#94a3b8;text-decoration:line-through; }
      .ly-rec-actions { display:flex;gap:6px;margin-top:2px; }
      .ly-rec-btn { border:none;border-radius:8px;padding:5px 9px;font-size:10px;font-weight:800;cursor:pointer;font-family:inherit;transition:opacity .15s,background .15s; }
      .ly-rec-btn--details { background:#e2e8f0;color:#1e293b; }
      .ly-rec-btn--details:hover { background:#cbd5e1; }
      .ly-rec-btn--add { background:#1a73e8;color:#fff; }
      .ly-rec-btn--add:hover { opacity:.9; }
      .ly-rec-btn--added { background:#10b981 !important;color:#fff !important; }
    `;
    document.head.appendChild(s);
  }

  function createUI() {
    if (document.getElementById('ds-chat-orb')) return;
    injectStyles();

    const orb = document.createElement('button');
    orb.id = 'ds-chat-orb';
    orb.style.cssText = 'position:fixed;bottom:85px;left:16px;z-index:9990;background:linear-gradient(135deg,#1a73e8,#4285f4);color:#fff;border:none;border-radius:999px;padding:10px 16px;font-size:12px;font-weight:800;box-shadow:0 10px 25px -5px rgba(26,115,232,0.5);cursor:pointer;display:flex;align-items:center;gap:6px;font-family:inherit;';
    orb.innerHTML = '<span>✨</span><span>لقمه‌یار</span>';
    orb.onclick = toggleModal;
    document.body.appendChild(orb);

    const modal = document.createElement('div');
    modal.id = 'ds-chat-modal';
    modal.style.cssText = 'position:fixed;inset:0;z-index:10050;background:rgba(0,0,0,0.55);display:none;align-items:flex-end;justify-content:center;backdrop-filter:blur(3px);';
    modal.innerHTML = `
      <div style="width:100%;max-width:448px;height:85vh;background:#fff;border-radius:24px 24px 0 0;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 -10px 40px rgba(0,0,0,0.25);">
        <div style="padding:14px 16px;border-bottom:1px solid #f1f5f9;display:flex;align-items:center;justify-content:space-between;background:#fff;">
          <div style="display:flex;align-items:center;gap:8px;">
            <span style="font-size:20px;">✨</span>
            <div>
              <div style="font-size:13px;font-weight:900;color:#0f172a;">لقمه‌یار</div>
              <div style="font-size:10px;color:#10b981;font-weight:700;display:flex;align-items:center;gap:4px;">
                <span style="width:5px;height:5px;border-radius:50%;background:#10b981;display:inline-block;"></span>
                آنلاین
              </div>
            </div>
          </div>
          <div style="display:flex;gap:6px;">
            <button id="ds-clear-btn" title="پاک کردن" style="background:#f1f5f9;border:none;border-radius:10px;padding:6px 10px;font-size:11px;cursor:pointer;">🗑️</button>
            <button id="ds-close-btn" title="بستن" style="background:#f1f5f9;border:none;border-radius:50%;width:30px;height:30px;font-size:16px;cursor:pointer;">×</button>
          </div>
        </div>

        <div id="ds-messages" style="flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:10px;background:#f8fafc;font-size:12px;line-height:1.9;color:#1e293b;">
          <div style="background:#fff;border:1px solid #e2e8f0;padding:10px 14px;border-radius:16px 16px 16px 4px;align-self:flex-start;max-width:88%;">
            سلام! 👋 من لقمه‌یار هستم. هر سوالی داری بپرس یا بگو چه غذایی دوست داری تا از منوی واقعی سایت برات پیدا کنم.
          </div>
        </div>

        <div style="padding:10px 14px;border-top:1px solid #f1f5f9;background:#fff;display:flex;gap:8px;">
          <input id="ds-input" type="text" placeholder="سوال یا دستورت رو بنویس..." style="flex:1;background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:10px 12px;font-size:12px;outline:none;font-family:inherit;">
          <button id="ds-send-btn" style="background:#1a73e8;color:#fff;border:none;border-radius:12px;padding:0 16px;font-size:12px;font-weight:800;cursor:pointer;font-family:inherit;">ارسال</button>
        </div>
      </div>`;
    document.body.appendChild(modal);

    document.getElementById('ds-close-btn').onclick = toggleModal;
    modal.onclick = (e) => { if (e.target === modal) toggleModal(); };

    document.getElementById('ds-clear-btn').onclick = resetChat;

    const sendBtn = document.getElementById('ds-send-btn');
    const inputEl = document.getElementById('ds-input');

    const handleSend = async () => {
      if (isLoading) return;
      const text = inputEl.value.trim();
      if (!text) return;

      inputEl.value = '';
      appendMessage('user', text);

      isLoading = true;
      sendBtn.disabled = true;
      sendBtn.style.opacity = '0.6';

      const msgId = appendMessage(
        'bot',
        '<span class="ly-dot"></span><span class="ly-dot"></span><span class="ly-dot"></span>',
        true
      );

      try {
        const catalogContext = buildCatalogContext(text);

        const fullRaw = await requestChatFromBackend(text, catalogContext, (partial) => {
          const visible = stripMetaBlocks(partial);
          if (visible) updateMessage(msgId, visible);
        });

        const cleanText = stripMetaBlocks(fullRaw);
        const recIds = extractProductIds(fullRaw);
        const action = extractAction(fullRaw);

        const validatedProducts = validateProducts(recIds, catalogContext.strictMaxPrice);
        const actionResult = executeSiteAction(action);

        if (!cleanText && validatedProducts.length === 0 && !actionResult.executed) {
          throw new Error('پاسخ معتبری از هوش مصنوعی دریافت نشد. لطفاً دوباره تلاش کنید.');
        }

        const displayText =
          cleanText ||
          (actionResult.executed && actionResult.product
            ? `«${actionResult.product.title}» به سبد خرید شما اضافه شد.`
            : 'پیشنهادهای زیر مطابق درخواست شما از منوی سایت انتخاب شدند:');

        updateMessage(msgId, displayText);

        if (validatedProducts.length > 0) {
          const msgEl = document.getElementById(msgId);
          if (msgEl) {
            msgEl.appendChild(buildProductCardsElement(validatedProducts));
            const box = document.getElementById('ds-messages');
            if (box) box.scrollTop = box.scrollHeight;
          }
          const vendorMap = getVendorMap();
          lastRecommendations = validatedProducts.map((p) => toCompactProduct(p, vendorMap));
        }

        const historySummary =
          validatedProducts.length > 0
            ? `${displayText}\n[محصولات نمایش داده‌شده: ${validatedProducts.map((p) => `ID:${p.id} ${p.title} (${p.price} تومان، تخفیف ${p.discount}%)`).join(' | ')}]`
            : displayText;

        chatHistory.push({ role: 'user', content: text });
        chatHistory.push({ role: 'assistant', content: historySummary });
        if (chatHistory.length > MAX_HISTORY * 2) {
          chatHistory = chatHistory.slice(-MAX_HISTORY * 2);
        }
      } catch (err) {
        console.error('[LoghmeYar]', err);
        const errMsg =
          (err && err.message) || 'خطا در ارتباط با سرور هوش مصنوعی. لطفاً دوباره تلاش کنید.';
        updateMessage(msgId, `❌ ${errMsg}`);
      } finally {
        isLoading = false;
        sendBtn.disabled = false;
        sendBtn.style.opacity = '1';
        inputEl.focus();
      }
    };

    sendBtn.onclick = handleSend;
    inputEl.onkeydown = (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    };
  }

  function resetChat() {
    if (!confirm('گفتگو پاک شود؟')) return;
    chatHistory = [];
    lastRecommendations = [];
    const box = document.getElementById('ds-messages');
    if (box) {
      box.innerHTML =
        '<div style="background:#fff;border:1px solid #e2e8f0;padding:10px 14px;border-radius:16px 16px 16px 4px;align-self:flex-start;max-width:88%;">گفتگو پاک شد. چطور می‌تونم کمکت کنم؟</div>';
    }
  }

  function appendMessage(role, text, isHtml) {
    const box = document.getElementById('ds-messages');
    const msg = document.createElement('div');
    const id = 'msg-' + Date.now() + Math.random().toString(36).slice(2, 6);
    msg.id = id;

    if (role === 'user') {
      msg.style.cssText = 'background:#1a73e8;color:#fff;padding:10px 14px;border-radius:16px 16px 4px 16px;align-self:flex-end;max-width:88%;font-weight:600;white-space:pre-wrap;word-break:break-word;';
      msg.textContent = text;
    } else {
      msg.style.cssText = 'background:#fff;border:1px solid #e2e8f0;color:#1e293b;padding:10px 14px;border-radius:16px 16px 16px 4px;align-self:flex-start;max-width:88%;word-break:break-word;';
      if (isHtml) msg.innerHTML = text;
      else msg.textContent = text;
    }

    box.appendChild(msg);
    box.scrollTop = box.scrollHeight;
    return id;
  }

  function updateMessage(id, text) {
    const el = document.getElementById(id);
    if (el) el.innerHTML = renderMarkdown(text);
    const box = document.getElementById('ds-messages');
    if (box) box.scrollTop = box.scrollHeight;
  }

  function openChat() {
    createUI();
    const modal = document.getElementById('ds-chat-modal');
    if (!modal) return;
    isOpen = true;
    modal.style.display = 'flex';
    setTimeout(() => document.getElementById('ds-input')?.focus(), 100);
  }

  function closeChat() {
    const modal = document.getElementById('ds-chat-modal');
    if (!modal) return;
    isOpen = false;
    modal.style.display = 'none';
  }

  function toggleModal() {
    if (isOpen) closeChat();
    else openChat();
  }

  // Unify global LoghmeYarAI entry points so only ONE chat UI is ever opened
  global.LoghmeYarAI = {
    open: openChat,
    close: closeChat,
    toggle: toggleModal,
    reset: resetChat
  };
  global.openLoghmeYar = openChat;

  // Expose pure helpers for automated verification
  global.__LoghmeYarInternals = {
    normalizeDigits,
    parseStrictMaxPrice,
    buildCatalogContext,
    validateProducts,
    stripMetaBlocks,
    extractProductIds,
    extractAction,
    parseSseBuffer,
    renderMarkdown
  };

  // ============================================================
  // INIT
  // ============================================================
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => setTimeout(createUI, 300));
    } else {
      setTimeout(createUI, 300);
    }
  }
})(typeof window !== 'undefined' ? window : globalThis);