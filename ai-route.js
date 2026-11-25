// ai-route.js — Owner-Managed Gemini Backend Route for LoghmeYar (لقمه‌یار)
// Mount in your main Express app (e.g. server.js / app.js):
//   app.use(express.json({ limit: '1mb' }));
//   app.use('/api/ai', require('./ai-route'));

'use strict';

const express = require('express');
const router = express.Router();

const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';
const DEFAULT_MODEL = 'gemini-3.5-flash-lite';
const MAX_HISTORY_ITEMS = 20;
const MAX_MESSAGE_LENGTH = 4000;
const REQUEST_TIMEOUT_MS = 45000;

function getConfig() {
  const apiKey = (process.env.GEMINI_API_KEY || '').trim();
  const model = (process.env.GEMINI_MODEL || DEFAULT_MODEL).trim();
  return { apiKey, model };
}

function isPlaceholderKey(key) {
  if (!key) return true;
  const upper = key.toUpperCase();
  return (
    upper === 'YOUR_API_KEY' ||
    upper === 'YOUR_GEMINI_API_KEY' ||
    upper.startsWith('REPLACE_') ||
    upper.startsWith('CHANGE_ME')
  );
}

function buildSystemInstruction(catalogContext, lastRecommendations) {
  const ctx = catalogContext && typeof catalogContext === 'object' ? catalogContext : {};
  const strictMaxPrice =
    typeof ctx.strictMaxPrice === 'number' && Number.isFinite(ctx.strictMaxPrice) && ctx.strictMaxPrice > 0
      ? ctx.strictMaxPrice
      : null;

  const matched = Array.isArray(ctx.matchedProducts) ? ctx.matchedProducts.slice(0, 25) : [];
  const vendors = Array.isArray(ctx.vendors) ? ctx.vendors.slice(0, 30) : [];
  const cheapestByVendor = Array.isArray(ctx.cheapestByVendor) ? ctx.cheapestByVendor.slice(0, 15) : [];
  const prevRecs = Array.isArray(lastRecommendations) ? lastRecommendations.slice(0, 10) : [];

  const formatItem = (p) => {
    const disc = p.discount > 0 ? ` | تخفیف: ${p.discount}% (قیمت قبل: ${p.originalPrice} تومان)` : '';
    const rating = p.rating ? ` | امتیاز: ${p.rating}` : '';
    return `[ID:${p.id}] ${p.title} | رستوران: ${p.vendorName || p.vendorId} | دسته: ${p.categoryId} | قیمت فعلی: ${p.price} تومان${disc}${rating} | موجودی: ${p.stockLeft}`;
  };

  const parts = [
    'تو «لقمه‌یار» هستی؛ دستیار هوشمند و صمیمی وب‌سایت سفارش غذای «لقمه».',
    '',
    '## اصول پاسخ‌گویی',
    '- به طور پیش‌فرض به فارسی طبیعی، روان، دوستانه و دقیق پاسخ بده.',
    '- فقط به سوالات غذایی محدود نیستی: به سوالات عمومی، علمی، تاریخی، روزمره، برنامه‌نویسی و گفتگوهای عادی پاسخ دقیق و واقعی بده و برای سوالات غیرغذایی هیچ محصولی پیشنهاد نده.',
    '- برای معرفی خودت، طبیعی و صمیمی خودت را به عنوان «لقمه‌یار»، دستیار هوشمند سفارش غذای لقمه معرفی کن.',
    '- هرگز پیام‌های کلیشه‌ای مثل «انجام شد» یا «عملیات موفق بود» را جایگزین پاسخ واقعی نکن.',
    '- هرگز قیمت، تخفیف، امتیاز، موجودی، نام رستوران یا محصولی را از خودت نساز. فقط از داده‌های واقعی کاتالوگ زیر استفاده کن.',
    '- اگر درخواست کاربر واقعاً مبهم است، یک سوال کوتاه و محترمانه برای شفاف‌سازی بپرس.',
    '',
    '## قوانین پیشنهاد غذا و فیلتر قیمت',
    '- فقط محصولاتی را پیشنهاد بده که در لیست کاتالوگ زیر هستند و موجودی آن‌ها بیشتر از صفر است.',
    '- اگر کاربر سقف قیمت تعیین کرده است، اکیداً فقط محصولاتی با «قیمت فعلی» کمتر یا مساوی آن سقف را پیشنهاد بده. اگر هیچ محصولی در آن بازه وجود نداشت، صادقانه توضیح بده.',
    '- وقتی محصولی از کاتالوگ پیشنهاد می‌دهی، علاوه بر توضیح کوتاه و مفید، در انتهای پاسخ حتماً شناسه دقیق آن‌ها را در این قالب قرار بده (حداکثر ۶ محصول):',
    '  <<<PRODUCTS:[id1,id2,id3]>>>',
    '- اگر پاسخ تو مربوط به پیشنهاد محصول نیست (مثلاً سوال عمومی، احوالپرسی، معرفی یا مقایسه ساده بدون نیاز به کارت جدید)، بلوک <<<PRODUCTS:...>>> نگذار.',
    '',
    '## قوانین اجرای دستور در سایت',
    '- فقط وقتی کاربر صراحتاً خواست محصولی به سبد خرید اضافه شود (مثلاً «همین رو به سبد اضافه کن» یا «اولی رو اضافه کن»)، یا رستوران/سبد خرید باز شود، در آخرین خط پاسخ یک بلوک ACTION قرار بده:',
    '  <<<ACTION:{"type":"ADD_TO_CART","id":PRODUCT_ID}>>>',
    '  <<<ACTION:{"type":"OPEN_VENDOR","id":"VENDOR_ID"}>>>',
    '  <<<ACTION:{"type":"OPEN_CART"}>>>',
    '- برای ADD_TO_CART حتماً ID دقیق محصولِ مورد اشاره کاربر (از لیست پیشنهادهای قبلی یا کاتالوگ زیر) را بگذار و در متن پاسخ هم نام دقیق همان محصول را بنویس.'
  ];

  if (strictMaxPrice !== null) {
    parts.push(
      '',
      `## محدودیت اکید قیمت در این درخواست: حداکثر ${strictMaxPrice.toLocaleString('en-US')} تومان`,
      `هر محصولی با قیمت فعلی بالاتر از ${strictMaxPrice} تومان مجاز به پیشنهاد نیست.`
    );
  }

  if (prevRecs.length > 0) {
    parts.push('', '## محصولات پیشنهادی در پیام قبلی (برای سوالات پیگیری مثل «ارزون‌تر»، «بیشترین تخفیف» یا «همین رو اضافه کن»):');
    prevRecs.forEach((p) => parts.push('- ' + formatItem(p)));
  }

  if (matched.length > 0) {
    parts.push('', '## محصولات واقعی مرتبط از کاتالوگ سایت (همگی موجود):');
    matched.forEach((p) => parts.push('- ' + formatItem(p)));
  } else if (strictMaxPrice !== null) {
    parts.push('', '## محصولات مرتبط: هیچ محصول موجودی در کاتالوگ با این سقف قیمت پیدا نشد. این موضوع را صادقانه به کاربر بگو.');
  }

  if (cheapestByVendor.length > 0) {
    parts.push('', '## خلاصه ارزان‌ترین غذای هر رستوران:');
    cheapestByVendor.forEach((v) => {
      parts.push(`- [VID:${v.id}] ${v.name} | ارزان‌ترین آیتم: ${v.cheapestTitle} (${v.cheapestPrice} تومان) | میانگین قیمت: ${v.avgPrice} تومان | امتیاز: ${v.rating}`);
    });
  } else if (vendors.length > 0) {
    parts.push('', '## رستوران‌های فعال:');
    parts.push(vendors.map((v) => `[VID:${v.id}] ${v.name} (${v.type || ''})`).join(' | '));
  }

  return parts.join('\n');
}

function buildGeminiContents(history, message) {
  const contents = [];
  const safeHistory = Array.isArray(history) ? history.slice(-MAX_HISTORY_ITEMS) : [];

  for (const item of safeHistory) {
    if (!item || typeof item.content !== 'string') continue;
    const text = item.content.trim();
    if (!text) continue;

    const role = item.role === 'assistant' || item.role === 'model' ? 'model' : 'user';
    if (contents.length > 0 && contents[contents.length - 1].role === role) {
      contents[contents.length - 1].parts.push({ text });
    } else {
      contents.push({ role, parts: [{ text }] });
    }
  }

  while (contents.length > 0 && contents[0].role !== 'user') {
    contents.shift();
  }

  const trimmedMessage = message.trim();
  if (contents.length > 0 && contents[contents.length - 1].role === 'user') {
    contents[contents.length - 1].parts.push({ text: trimmedMessage });
  } else {
    contents.push({ role: 'user', parts: [{ text: trimmedMessage }] });
  }

  return contents;
}

function mapUpstreamError(status, rawBody, model) {
  let detail = '';
  try {
    const parsed = JSON.parse(rawBody);
    detail = parsed?.error?.message || '';
  } catch (_) {
    detail = '';
  }

  if (status === 401 || status === 403) {
    return {
      status,
      code: 'AUTH_ERROR',
      message: 'خطای احراز هویت با سرویس Gemini. لطفاً اعتبار کلید API تنظیم‌شده روی سرور را بررسی کنید.'
    };
  }
  if (status === 404) {
    return {
      status: 404,
      code: 'MODEL_NOT_FOUND',
      message: `مدل تنظیم‌شده (${model}) در سرویس Gemini در دسترس نیست. لطفاً مقدار GEMINI_MODEL را در سرور بررسی کنید.`
    };
  }
  if (status === 429) {
    return {
      status: 429,
      code: 'RATE_LIMIT',
      message: 'تعداد درخواست‌ها به سرویس هوش مصنوعی بیش از حد مجاز شده است. لطفاً کمی بعد دوباره تلاش کنید.'
    };
  }
  if (status === 400) {
    const lower = detail.toLowerCase();
    if (lower.includes('api key') || lower.includes('api_key')) {
      return {
        status: 401,
        code: 'AUTH_ERROR',
        message: 'کلید API تنظیم‌شده روی سرور نامعتبر است. لطفاً GEMINI_API_KEY را در سرور بررسی کنید.'
      };
    }
    return {
      status: 400,
      code: 'BAD_REQUEST',
      message: 'درخواست ارسالی به سرویس هوش مصنوعی نامعتبر بود.'
    };
  }
  return {
    status: status >= 500 ? 502 : status || 502,
    code: 'UPSTREAM_ERROR',
    message: 'سرویس هوش مصنوعی در حال حاضر پاسخگو نیست. لطفاً لحظاتی دیگر دوباره تلاش کنید.'
  };
}

function extractTextFromGeminiPayload(payload) {
  const candidates = payload && Array.isArray(payload.candidates) ? payload.candidates : [];
  if (candidates.length === 0) return '';
  const parts = candidates[0]?.content?.parts;
  if (!Array.isArray(parts)) return '';
  let text = '';
  for (const part of parts) {
    if (part && typeof part.text === 'string' && !part.thought) {
      text += part.text;
    }
  }
  return text;
}

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

router.get('/health', (req, res) => {
  const { apiKey, model } = getConfig();
  res.json({
    ok: !isPlaceholderKey(apiKey),
    configured: !isPlaceholderKey(apiKey),
    model
  });
});

router.post('/chat', async (req, res) => {
  const { apiKey, model } = getConfig();

  if (isPlaceholderKey(apiKey)) {
    return res.status(500).json({
      error: 'SERVER_CONFIG_ERROR',
      message: 'پیکربندی سرور کامل نیست: متغیر GEMINI_API_KEY روی سرور تنظیم نشده است.'
    });
  }

  const body = req.body && typeof req.body === 'object' ? req.body : {};
  const message = typeof body.message === 'string' ? body.message.trim() : '';

  if (!message) {
    return res.status(400).json({
      error: 'INVALID_MESSAGE',
      message: 'پیام کاربر نمی‌تواند خالی باشد.'
    });
  }

  if (message.length > MAX_MESSAGE_LENGTH) {
    return res.status(400).json({
      error: 'MESSAGE_TOO_LONG',
      message: 'متن پیام بیش از حد طولانی است.'
    });
  }

  const wantStream = body.stream !== false;
  const systemText = buildSystemInstruction(body.catalogContext, body.lastRecommendations);
  const contents = buildGeminiContents(body.history, message);

  const geminiPayload = {
    systemInstruction: {
      parts: [{ text: systemText }]
    },
    contents,
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 2048
    }
  };

  const action = wantStream ? 'streamGenerateContent?alt=sse' : 'generateContent';
  const url = `${GEMINI_API_BASE}/${encodeURIComponent(model)}:${action}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  req.on('close', () => {
    if (!res.writableEnded) controller.abort();
  });

  try {
    const upstream = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey
      },
      body: JSON.stringify(geminiPayload),
      signal: controller.signal
    });

    if (!upstream.ok) {
      const errBody = await upstream.text().catch(() => '');
      console.error(`[AI Route] Gemini HTTP ${upstream.status} (model=${model})`);
      const mapped = mapUpstreamError(upstream.status, errBody, model);
      return res.status(mapped.status).json({
        error: mapped.code,
        message: mapped.message
      });
    }

    if (!wantStream) {
      const json = await upstream.json();
      const reply = extractTextFromGeminiPayload(json).trim();
      if (!reply) {
        return res.status(502).json({
          error: 'EMPTY_RESPONSE',
          message: 'پاسخی از هوش مصنوعی دریافت نشد. لطفاً دوباره تلاش کنید.'
        });
      }
      return res.json({ reply, model });
    }

    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    if (typeof res.flushHeaders === 'function') res.flushHeaders();

    if (!upstream.body) {
      res.write(`data: ${JSON.stringify({ error: 'EMPTY_RESPONSE', message: 'پاسخی از هوش مصنوعی دریافت نشد.' })}\n\n`);
      return res.end();
    }

    const reader = upstream.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let sseBuffer = '';
    let totalChars = 0;

    const handleEventData = (rawData) => {
      if (!rawData || rawData === '[DONE]') return;
      try {
        const parsed = JSON.parse(rawData);
        const delta = extractTextFromGeminiPayload(parsed);
        if (delta) {
          totalChars += delta.length;
          res.write(`data: ${JSON.stringify({ delta })}\n\n`);
        }
      } catch (_) {}
    };

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      sseBuffer += decoder.decode(value, { stream: true });
      sseBuffer = parseSseBuffer(sseBuffer, handleEventData, false);
    }

    sseBuffer += decoder.decode();
    if (sseBuffer.trim()) {
      parseSseBuffer(sseBuffer, handleEventData, true);
    }

    if (totalChars === 0) {
      res.write(
        `data: ${JSON.stringify({
          error: 'EMPTY_RESPONSE',
          message: 'پاسخی از هوش مصنوعی دریافت نشد. لطفاً سوال خود را دوباره بپرسید.'
        })}\n\n`
      );
    } else {
      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    }
    return res.end();
  } catch (err) {
    const isAbort = err && err.name === 'AbortError';
    console.error('[AI Route] Request failed:', err && err.message ? err.message : err);

    if (res.headersSent) {
      if (!res.writableEnded) {
        res.write(
          `data: ${JSON.stringify({
            error: isAbort ? 'TIMEOUT' : 'CONNECTION_ERROR',
            message: isAbort
              ? 'زمان انتظار برای پاسخ هوش مصنوعی به پایان رسید. لطفاً دوباره تلاش کنید.'
              : 'ارتباط با سرویس هوش مصنوعی قطع شد.'
          })}\n\n`
        );
        res.end();
      }
      return;
    }

    return res.status(isAbort ? 504 : 502).json({
      error: isAbort ? 'TIMEOUT' : 'CONNECTION_ERROR',
      message: isAbort
        ? 'زمان انتظار برای پاسخ هوش مصنوعی به پایان رسید. لطفاً دوباره تلاش کنید.'
        : 'خطا در برقراری ارتباط با سرویس هوش مصنوعی. لطفاً اتصال اینترنت سرور را بررسی کنید.'
    });
  } finally {
    clearTimeout(timeoutId);
  }
});

module.exports = router;