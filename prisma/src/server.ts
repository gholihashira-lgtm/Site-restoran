/* ============================================================================
 * Loghme Backend — Single-File Express Server
 * Handles: Auth (OTP+JWT), Vendors, Products, Cart, Orders, Wallet, Coupons,
 *          Addresses, Notifications, Stories, and Live Courier Tracking (WS)
 * ========================================================================== */

import express, { Request, Response, NextFunction } from 'express';
import { createServer } from 'http';
import { Server as SocketServer, Socket } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { PrismaClient, Prisma } from '@prisma/client';
import Redis from 'ioredis';
import { nanoid } from 'nanoid';
import { z } from 'zod';

const PORT = parseInt(process.env.PORT || '3000', 10);
const JWT_SECRET = process.env.JWT_ACCESS_SECRET || 'loghme_dev_secret_change_me';
const JWT_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN || '15m';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'loghme_dev_refresh_secret';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '30d';
const OTP_TTL = parseInt(process.env.OTP_TTL_SECONDS || '120', 10);
const OTP_MAX_ATTEMPTS = parseInt(process.env.OTP_MAX_ATTEMPTS || '5', 10);
const OTP_RESEND_COOLDOWN = parseInt(process.env.OTP_RESEND_COOLDOWN || '60', 10);
const CORS_ORIGINS = (process.env.CORS_ORIGINS || 'http://localhost:5500,http://127.0.0.1:5500').split(',');

const prisma = new PrismaClient({ log: ['warn', 'error'] });
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
});

const FA_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
function toPersianDigits(n: number | string): string {
    return String(n).replace(/\d/g, (x) => FA_DIGITS[parseInt(x, 10)]);
}

function genTrackingCode(): string {
    return String(Math.floor(1000000 + Math.random() * 9000000));
}

function jsonSafe(obj: any): any {
    if (obj === null || obj === undefined) return obj;
    if (typeof obj === 'bigint') return Number(obj);
    if (Array.isArray(obj)) return obj.map(jsonSafe);
    if (typeof obj === 'object') {
        const out: any = {};
        for (const k of Object.keys(obj)) out[k] = jsonSafe(obj[k]);
        return out;
    }
    return obj;
}

function ok(res: Response, data: any, status = 200) {
    res.status(status).json({ success: true, data: jsonSafe(data) });
}

function fail(res: Response, message: string, status = 400, code?: string) {
    res.status(status).json({ success: false, error: { message, code: code || 'ERROR' } });
}

interface JwtPayload {
    sub: string;
    role: string;
    jti?: string;
}

function signAccess(userId: string, role: string): string {
    return jwt.sign({ sub: userId, role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions);
}

function signRefresh(userId: string, family: string): string {
    return jwt.sign({ sub: userId, jti: family }, JWT_REFRESH_SECRET, { expiresIn: JWT_REFRESH_EXPIRES_IN } as jwt.SignOptions);
}

declare global {
    namespace Express {
        interface Request {
            user?: { id: string; role: string };
        }
    }
}

function authRequired(req: Request, res: Response, next: NextFunction) {
    const h = req.headers.authorization;
    if (!h || !h.startsWith('Bearer ')) return fail(res, 'توکن احراز هویت ارسال نشده.', 401, 'NO_TOKEN');
    const token = h.slice(7);
    try {
        const payload = jwt.verify(token, JWT_SECRET) as JwtPayload;
        req.user = { id: payload.sub, role: payload.role };
        next();
    } catch {
        return fail(res, 'توکن منقضی یا نامعتبر است.', 401, 'INVALID_TOKEN');
    }
}

async function sendOtp(phone: string): Promise<{ ok: boolean; message: string; code?: string }> {
    const cooldownKey = `otp:cooldown:${phone}`;
    const existing = await redis.get(cooldownKey);
    if (existing) {
        const ttl = await redis.ttl(cooldownKey);
        return { ok: false, message: `لطفاً ${ttl} ثانیه صبر کنید.` };
    }

    const code = String(Math.floor(100000 + Math.random() * 900000));
    const codeHash = await bcrypt.hash(code, 8);
    await redis.setex(`otp:code:${phone}`, OTP_TTL, codeHash);
    await redis.setex(`otp:attempts:${phone}`, OTP_TTL, '0');
    await redis.setex(cooldownKey, OTP_RESEND_COOLDOWN, '1');

    console.log(`[OTP] ${phone} → ${code}`);
    return { ok: true, message: 'کد تایید ارسال شد.', code: process.env.NODE_ENV === 'production' ? undefined : code };
}

async function verifyOtp(phone: string, code: string): Promise<{ ok: boolean; message: string; userId?: string; isNew?: boolean }> {
    const codeHash = await redis.get(`otp:code:${phone}`);
    if (!codeHash) return { ok: false, message: 'کد منقضی شده. دوباره درخواست کنید.' };

    const attempts = parseInt((await redis.get(`otp:attempts:${phone}`)) || '0', 10);
    if (attempts >= OTP_MAX_ATTEMPTS) {
        await redis.del(`otp:code:${phone}`);
        return { ok: false, message: 'تعداد تلاش‌های ناموفق بیش از حد مجاز.' };
    }

    const valid = await bcrypt.compare(code, codeHash);
    if (!valid) {
        await redis.incr(`otp:attempts:${phone}`);
        return { ok: false, message: 'کد وارد شده اشتباه است.' };
    }

    await redis.del(`otp:code:${phone}`);
    await redis.del(`otp:attempts:${phone}`);
    await redis.del(`otp:cooldown:${phone}`);

    let user = await prisma.user.findUnique({ where: { phone } });
    let isNew = false;
    if (!user) {
        isNew = true;
        user = await prisma.user.create({
            data: {
                phone,
                fullName: 'کاربر جدید',
                isPhoneVerified: true,
                role: 'CUSTOMER',
                wallet: { create: { balance: BigInt(0) } },
                membership: { create: { tier: 'FREE', proAutoRenew: false } },
            },
        });
    } else {
        await prisma.user.update({ where: { id: user.id }, data: { isPhoneVerified: true, lastLoginAt: new Date() } });
    }

    return { ok: true, message: 'ورود موفق', userId: user.id, isNew };
}

const app = express();
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(compression());
app.use(cors({ origin: CORS_ORIGINS, credentials: true }));
app.use(express.json({ limit: '2mb' }));

const phoneSchema = z.string().regex(/^09\d{9}$/, 'شماره موبایل نامعتبر است.');

app.post('/api/auth/otp/send', async (req, res) => {
    const parsed = z.object({ phone: phoneSchema }).safeParse(req.body);
    if (!parsed.success) return fail(res, parsed.error.errors[0].message);
    const result = await sendOtp(parsed.data.phone);
    if (!result.ok) return fail(res, result.message);
    ok(res, { message: result.message, devCode: result.code });
});

app.post('/api/auth/otp/verify', async (req, res) => {
    const parsed = z.object({ phone: phoneSchema, code: z.string().length(6) }).safeParse(req.body);
    if (!parsed.success) return fail(res, parsed.error.errors[0].message);

    const result = await verifyOtp(parsed.data.phone, parsed.data.code);
    if (!result.ok || !result.userId) return fail(res, result.message);

    const user = await prisma.user.findUnique({
        where: { id: result.userId },
        include: { wallet: true, membership: true },
    });
    if (!user) return fail(res, 'کاربر پیدا نشد.', 404);

    const accessToken = signAccess(user.id, user.role);
    const family = nanoid(32);
    const refreshToken = signRefresh(user.id, family);

    await prisma.userSession.create({
        data: {
            userId: user.id,
            refreshToken,
            userAgent: req.headers['user-agent'] || null,
            ipAddress: req.ip || null,
            expiresAt: new Date(Date.now() + 30 * 24 * 3600 * 1000),
        },
    });

    ok(res, {
        isNew: result.isNew,
        accessToken,
        refreshToken,
        user: {
            id: user.id,
            phone: user.phone,
            fullName: user.fullName,
            email: user.email,
            role: user.role,
            walletBalance: Number(user.wallet?.balance || 0),
            membershipTier: user.membership?.tier || 'FREE',
        },
    });
});

app.post('/api/auth/refresh', async (req, res) => {
    const { refreshToken } = req.body || {};
    if (!refreshToken) return fail(res, 'refreshToken ارسال نشده.', 401);

    try {
        const payload = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as JwtPayload;
        const session = await prisma.userSession.findUnique({ where: { refreshToken } });
        if (!session || session.isRevoked || session.expiresAt < new Date()) {
            return fail(res, 'نشست منقضی شده.', 401, 'SESSION_EXPIRED');
        }
        const user = await prisma.user.findUnique({ where: { id: payload.sub } });
        if (!user) return fail(res, 'کاربر پیدا نشد.', 404);

        const accessToken = signAccess(user.id, user.role);
        ok(res, { accessToken });
    } catch {
        return fail(res, 'refreshToken نامعتبر.', 401);
    }
});

app.post('/api/auth/logout', authRequired, async (req, res) => {
    const { refreshToken } = req.body || {};
    if (refreshToken) {
        await prisma.userSession.updateMany({ where: { refreshToken }, data: { isRevoked: true, revokedAt: new Date() } });
    }
    ok(res, { message: 'خروج انجام شد.' });
});

app.get('/api/auth/me', authRequired, async (req, res) => {
    const user = await prisma.user.findUnique({
        where: { id: req.user!.id },
        include: { wallet: true, membership: true },
    });
    if (!user) return fail(res, 'کاربر پیدا نشد.', 404);
    ok(res, {
        id: user.id,
        phone: user.phone,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        birthDay: user.birthDay,
        birthMonth: user.birthMonth,
        birthYear: user.birthYear,
        walletBalance: Number(user.wallet?.balance || 0),
        membershipTier: user.membership?.tier || 'FREE',
        membershipExpiresAt: user.membership?.expiresAt,
    });
});

app.get('/api/vendors', async (req, res) => {
    const { featured, status } = req.query;
    const vendors = await prisma.vendor.findMany({
        where: {
            status: (status as any) || 'ACTIVE',
            ...(featured === 'true' ? { isFeatured: true } : {}),
        },
        orderBy: [{ isFeatured: 'desc' }, { rating: 'desc' }],
    });
    ok(res, vendors);
});

app.get('/api/vendors/:id', async (req, res) => {
    const vendor = await prisma.vendor.findUnique({
        where: { id: req.params.id },
        include: { categories: { orderBy: { sortOrder: 'asc' } }, workingHours: true },
    });
    if (!vendor) return fail(res, 'فروشگاه پیدا نشد.', 404);
    ok(res, vendor);
});

app.get('/api/vendors/:id/products', async (req, res) => {
    const { categoryId, sort, search, limit = '8', offset = '0' } = req.query;
    const where: any = { vendorId: req.params.id, isActive: true };
    if (categoryId && categoryId !== 'all') where.categoryId = categoryId;
    if (search) {
        where.OR = [
            { title: { contains: String(search), mode: 'insensitive' } },
            { description: { contains: String(search), mode: 'insensitive' } },
        ];
    }
    const orderBy: any =
        sort === 'price-asc' ? { price: 'asc' } :
        sort === 'price-desc' ? { price: 'desc' } :
        sort === 'rating' ? { rating: 'desc' } :
        sort === 'discount' ? { discountPct: 'desc' } :
        { createdAt: 'desc' };

    const [items, total] = await Promise.all([
        prisma.product.findMany({
            where, orderBy,
            take: Math.min(parseInt(String(limit), 10) || 8, 100),
            skip: parseInt(String(offset), 10) || 0,
            include: { threeDMeta: true, addons: true },
        }),
        prisma.product.count({ where }),
    ]);
    ok(res, { items, total, hasMore: (parseInt(String(offset), 10) || 0) + items.length < total });
});

app.get('/api/products', async (req, res) => {
    const { search, limit = '20', offset = '0' } = req.query;
    const where: any = { isActive: true };
    if (search) where.title = { contains: String(search), mode: 'insensitive' };
    const items = await prisma.product.findMany({
        where,
        take: Math.min(parseInt(String(limit), 10) || 20, 100),
        skip: parseInt(String(offset), 10) || 0,
        include: { threeDMeta: true, addons: true, vendor: { select: { id: true, name: true, logoUrl: true } } },
    });
    ok(res, items);
});

app.get('/api/products/:id', async (req, res) => {
    const product = await prisma.product.findUnique({
        where: { id: parseInt(req.params.id, 10) },
        include: { threeDMeta: true, addons: true, vendor: { select: { id: true, name: true, logoUrl: true, deliveryFee: true } } },
    });
    if (!product) return fail(res, 'محصول پیدا نشد.', 404);
    ok(res, product);
});

app.get('/api/addresses', authRequired, async (req, res) => {
    const items = await prisma.address.findMany({
        where: { userId: req.user!.id, isActive: true },
        orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
    ok(res, items);
});

app.post('/api/addresses', authRequired, async (req, res) => {
    const schema = z.object({
        province: z.string(), city: z.string(), text: z.string(),
        pelak: z.string().optional(), unit: z.string().optional(),
        postalCode: z.string().optional(), receiverName: z.string(),
        receiverPhone: z.string(), tag: z.enum(['HOME', 'WORK', 'OTHER']).default('HOME'),
        latitude: z.number().optional(), longitude: z.number().optional(),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return fail(res, parsed.error.errors[0].message);

    const count = await prisma.address.count({ where: { userId: req.user!.id } });
    const addr = await prisma.address.create({
        data: { ...parsed.data, userId: req.user!.id, isDefault: count === 0, icon: parsed.data.tag === 'HOME' ? 'home' : parsed.data.tag === 'WORK' ? 'briefcase' : 'map-pin' },
    });
    ok(res, addr, 201);
});

app.patch('/api/addresses/:id', authRequired, async (req, res) => {
    const existing = await prisma.address.findFirst({ where: { id: req.params.id, userId: req.user!.id } });
    if (!existing) return fail(res, 'آدرس پیدا نشد.', 404);
    const updated = await prisma.address.update({ where: { id: req.params.id }, data: req.body });
    ok(res, updated);
});

app.delete('/api/addresses/:id', authRequired, async (req, res) => {
    const existing = await prisma.address.findFirst({ where: { id: req.params.id, userId: req.user!.id } });
    if (!existing) return fail(res, 'آدرس پیدا نشد.', 404);
    await prisma.address.update({ where: { id: req.params.id }, data: { isActive: false } });
    ok(res, { message: 'آدرس حذف شد.' });
});

app.post('/api/addresses/:id/default', authRequired, async (req, res) => {
    await prisma.$transaction([
        prisma.address.updateMany({ where: { userId: req.user!.id }, data: { isDefault: false } }),
        prisma.address.update({ where: { id: req.params.id }, data: { isDefault: true } }),
    ]);
    ok(res, { message: 'آدرس پیش‌فرض تغییر یافت.' });
});

async function getOrCreateCart(userId: string) {
    let cart = await prisma.cart.findUnique({ where: { userId }, include: { items: { include: { product: true } } } });
    if (!cart) {
        cart = await prisma.cart.create({ data: { userId }, include: { items: { include: { product: true } } } });
    }
    return cart;
}

app.get('/api/cart', authRequired, async (req, res) => {
    const cart = await getOrCreateCart(req.user!.id);
    ok(res, cart);
});

app.post('/api/cart/items', authRequired, async (req, res) => {
    const schema = z.object({
        productId: z.number().int(),
        quantity: z.number().int().positive().default(1),
        addons: z.array(z.object({ id: z.string(), title: z.string(), price: z.number() })).default([]),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return fail(res, parsed.error.errors[0].message);

    const product = await prisma.product.findUnique({ where: { id: parsed.data.productId } });
    if (!product) return fail(res, 'محصول پیدا نشد.', 404);
    if (product.stockLeft < parsed.data.quantity) return fail(res, 'موجودی کافی نیست.', 400, 'OUT_OF_STOCK');

    const cart = await getOrCreateCart(req.user!.id);

    if (cart.vendorId && cart.vendorId !== product.vendorId) {
        await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
        await prisma.cart.update({ where: { id: cart.id }, data: { vendorId: product.vendorId } });
    } else if (!cart.vendorId) {
        await prisma.cart.update({ where: { id: cart.id }, data: { vendorId: product.vendorId } });
    }

    const existing = await prisma.cartItem.findFirst({ where: { cartId: cart.id, productId: product.id } });
    if (existing) {
        await prisma.cartItem.update({
            where: { id: existing.id },
            data: { quantity: existing.quantity + parsed.data.quantity, addonsJson: parsed.data.addons as any },
        });
    } else {
        await prisma.cartItem.create({
            data: {
                cartId: cart.id,
                productId: product.id,
                quantity: parsed.data.quantity,
                unitPrice: product.price,
                addonsJson: parsed.data.addons as any,
            },
        });
    }
    const updated = await getOrCreateCart(req.user!.id);
    ok(res, updated);
});

app.patch('/api/cart/items/:productId', authRequired, async (req, res) => {
    const { quantity } = req.body || {};
    const cart = await getOrCreateCart(req.user!.id);
    const item = await prisma.cartItem.findFirst({
        where: { cartId: cart.id, productId: parseInt(req.params.productId, 10) },
    });
    if (!item) return fail(res, 'آیتم در سبد نیست.', 404);

    if (quantity <= 0) {
        await prisma.cartItem.delete({ where: { id: item.id } });
    } else {
        await prisma.cartItem.update({ where: { id: item.id }, data: { quantity } });
    }
    const updated = await getOrCreateCart(req.user!.id);
    ok(res, updated);
});

app.delete('/api/cart', authRequired, async (req, res) => {
    const cart = await prisma.cart.findUnique({ where: { userId: req.user!.id } });
    if (cart) {
        await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
        await prisma.cart.update({ where: { id: cart.id }, data: { vendorId: null } });
    }
    ok(res, { message: 'سبد خالی شد.' });
});

app.post('/api/coupons/validate', authRequired, async (req, res) => {
    const { code, subtotal } = req.body || {};
    const coupon = await prisma.coupon.findUnique({ where: { code: String(code).toUpperCase() } });
    if (!coupon || !coupon.isActive) return fail(res, 'کد تخفیف نامعتبر است.', 404);
    if (coupon.expiresAt < new Date()) return fail(res, 'کد تخفیف منقضی شده.', 400);
    if (subtotal < Number(coupon.minOrderValue)) return fail(res, `حداقل مبلغ سفارش برای این کد ${toPersianDigits(Number(coupon.minOrderValue))} تومان است.`, 400);

    let discount = coupon.type === 'PERCENT'
        ? Math.round(subtotal * Number(coupon.value) / 100)
        : Number(coupon.value);
    if (coupon.maxDiscount && discount > Number(coupon.maxDiscount)) discount = Number(coupon.maxDiscount);

    ok(res, { code: coupon.code, type: coupon.type, discount, title: coupon.title });
});

app.post('/api/orders', authRequired, async (req, res) => {
    const schema = z.object({
        addressId: z.string().uuid(),
        deliveryMode: z.enum(['COURIER', 'PICKUP']).default('COURIER'),
        paymentMethod: z.enum(['WALLET', 'CARD', 'CASH_ON_DELIVERY']).default('WALLET'),
        couponCode: z.string().optional(),
        note: z.string().optional(),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return fail(res, parsed.error.errors[0].message);

    const cart = await prisma.cart.findUnique({
        where: { userId: req.user!.id },
        include: { items: { include: { product: true } } },
    });
    if (!cart || cart.items.length === 0) return fail(res, 'سبد خرید خالی است.', 400);

    const vendor = await prisma.vendor.findUnique({ where: { id: cart.vendorId! } });
    if (!vendor) return fail(res, 'فروشگاه پیدا نشد.', 404);

    const address = await prisma.address.findFirst({ where: { id: parsed.data.addressId, userId: req.user!.id } });
    if (!address) return fail(res, 'آدرس تحویل پیدا نشد.', 404);

    let subtotal = 0;
    for (const item of cart.items) subtotal += Number(item.unitPrice) * item.quantity;

    let discount = 0;
    let appliedCouponCode: string | undefined;
    if (parsed.data.couponCode) {
        const coupon = await prisma.coupon.findUnique({ where: { code: parsed.data.couponCode.toUpperCase() } });
        if (coupon && coupon.isActive && coupon.expiresAt > new Date() && subtotal >= Number(coupon.minOrderValue)) {
            discount = coupon.type === 'PERCENT'
                ? Math.round(subtotal * Number(coupon.value) / 100)
                : Number(coupon.value);
            if (coupon.maxDiscount && discount > Number(coupon.maxDiscount)) discount = Number(coupon.maxDiscount);
            appliedCouponCode = coupon.code;
        }
    }

    const deliveryFee = parsed.data.deliveryMode === 'PICKUP' ? 0 : Number(vendor.deliveryFee);
    const grandTotal = Math.max(0, subtotal - discount + deliveryFee);
    const trackingCode = genTrackingCode();

    const order = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        const created = await tx.order.create({
            data: {
                trackingCode,
                userId: req.user!.id,
                vendorId: vendor.id,
                addressId: address.id,
                addressSnapshot: {
                    province: address.province, city: address.city, text: address.text,
                    pelak: address.pelak, unit: address.unit, postalCode: address.postalCode,
                    receiverName: address.receiverName, receiverPhone: address.receiverPhone,
                    latitude: address.latitude, longitude: address.longitude,
                } as any,
                status: parsed.data.paymentMethod === 'CASH_ON_DELIVERY' ? 'CONFIRMED' : 'PENDING_PAYMENT',
                deliveryMode: parsed.data.deliveryMode,
                paymentMethod: parsed.data.paymentMethod,
                itemsSubtotal: BigInt(subtotal),
                deliveryFee: BigInt(deliveryFee),
                discountAmount: BigInt(discount),
                couponCode: appliedCouponCode,
                grandTotal: BigInt(grandTotal),
                etaMinutes: vendor.deliveryTimeMin + 10,
                note: parsed.data.note,
            },
        });

        for (const item of cart.items) {
            await tx.orderItem.create({
                data: {
                    orderId: created.id,
                    productId: item.productId,
                    titleSnapshot: item.product.title,
                    priceSnapshot: item.unitPrice,
                    quantity: item.quantity,
                    addonsJson: item.addonsJson as any,
                    lineTotal: BigInt(Number(item.unitPrice) * item.quantity),
                },
            });
            await tx.product.update({
                where: { id: item.productId },
                data: { stockLeft: { decrement: item.quantity } },
            });
        }

        await tx.orderStatusHistory.create({
            data: { orderId: created.id, status: created.status, note: 'سفارش ایجاد شد.' },
        });

        await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
        await tx.cart.update({ where: { id: cart.id }, data: { vendorId: null, couponCode: null } });

        return created;
    });

    if (parsed.data.paymentMethod === 'WALLET') {
        try {
            await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
                const wallet = await tx.wallet.findUnique({ where: { userId: req.user!.id } });
                if (!wallet || Number(wallet.balance) < grandTotal) throw new Error('موجودی کیف پول کافی نیست.');
                const newBalance = Number(wallet.balance) - grandTotal;
                await tx.wallet.update({ where: { id: wallet.id }, data: { balance: BigInt(newBalance), version: { increment: 1 } } });
                await tx.walletTransaction.create({
                    data: {
                        walletId: wallet.id, orderId: order.id, type: 'ORDER_PAYMENT',
                        amount: BigInt(-grandTotal), balanceAfter: BigInt(newBalance),
                        description: `پرداخت سفارش #${trackingCode}`,
                    },
                });
                await tx.order.update({ where: { id: order.id }, data: { status: 'CONFIRMED', confirmedAt: new Date() } });
            });
        } catch (err: any) {
            await prisma.order.update({ where: { id: order.id }, data: { status: 'CANCELLED', cancellationReason: err.message } });
            return fail(res, err.message || 'پرداخت ناموفق بود.', 400);
        }
    }

    const final = await prisma.order.findUnique({
        where: { id: order.id },
        include: { items: true, vendor: true, address: true },
    });
    ok(res, final, 201);
});

app.get('/api/orders', authRequired, async (req, res) => {
    const orders = await prisma.order.findMany({
        where: { userId: req.user!.id },
        include: { items: true, vendor: { select: { id: true, name: true, logoUrl: true } } },
        orderBy: { createdAt: 'desc' },
        take: 50,
    });
    ok(res, orders);
});

app.get('/api/orders/:id', authRequired, async (req, res) => {
    const order = await prisma.order.findFirst({
        where: { id: req.params.id, userId: req.user!.id },
        include: { items: true, vendor: true, address: true, statusHistory: { orderBy: { createdAt: 'asc' } }, courierAssign: { include: { courier: { include: { user: { select: { fullName: true } } } } } } },
    });
    if (!order) return fail(res, 'سفارش پیدا نشد.', 404);
    ok(res, order);
});

app.post('/api/orders/:id/cancel', authRequired, async (req, res) => {
    const order = await prisma.order.findFirst({ where: { id: req.params.id, userId: req.user!.id } });
    if (!order) return fail(res, 'سفارش پیدا نشد.', 404);
    if (!['PENDING_PAYMENT', 'CONFIRMED', 'PREPARING'].includes(order.status)) {
        return fail(res, 'این سفارش در وضعیت قابل لغو نیست.', 400);
    }
    await prisma.$transaction([
        prisma.order.update({ where: { id: order.id }, data: { status: 'CANCELLED', cancelledAt: new Date(), cancellationReason: req.body?.reason || 'لغو توسط کاربر' } }),
        prisma.orderStatusHistory.create({ data: { orderId: order.id, status: 'CANCELLED', note: req.body?.reason || 'لغو توسط کاربر' } }),
    ]);
    ok(res, { message: 'سفارش لغو شد.' });
});

app.post('/api/orders/:id/rating', authRequired, async (req, res) => {
    const schema = z.object({
        foodRating: z.number().int().min(1).max(5),
        courierRating: z.number().int().min(1).max(5).optional(),
        comment: z.string().optional(),
        tags: z.array(z.string()).default([]),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return fail(res, parsed.error.errors[0].message);

    const order = await prisma.order.findFirst({ where: { id: req.params.id, userId: req.user!.id } });
    if (!order) return fail(res, 'سفارش پیدا نشد.', 404);

    const rating = await prisma.orderRating.upsert({
        where: { orderId: order.id },
        create: { orderId: order.id, userId: req.user!.id, ...parsed.data, tags: parsed.data.tags },
        update: parsed.data,
    });
    ok(res, rating, 201);
});

app.get('/api/wallet', authRequired, async (req, res) => {
    const wallet = await prisma.wallet.findUnique({
        where: { userId: req.user!.id },
        include: { transactions: { orderBy: { createdAt: 'desc' }, take: 50 } },
    });
    ok(res, wallet);
});

app.post('/api/wallet/topup', authRequired, async (req, res) => {
    const { amount } = req.body || {};
    const amt = parseInt(String(amount), 10);
    if (!amt || amt < 10000) return fail(res, 'حداقل مبلغ شارژ ۱۰,۰۰۰ تومان است.', 400);

    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        const wallet = await tx.wallet.upsert({
            where: { userId: req.user!.id },
            create: { userId: req.user!.id, balance: BigInt(0) },
            update: {},
        });
        const newBalance = Number(wallet.balance) + amt;
        await tx.wallet.update({ where: { id: wallet.id }, data: { balance: BigInt(newBalance), version: { increment: 1 } } });
        const txRec = await tx.walletTransaction.create({
            data: {
                walletId: wallet.id, type: 'TOPUP', amount: BigInt(amt),
                balanceAfter: BigInt(newBalance), description: 'شارژ آنلاین کیف پول',
            },
        });
        return { wallet: { ...wallet, balance: BigInt(newBalance) }, transaction: txRec };
    });
    ok(res, result, 201);
});

app.get('/api/notifications', authRequired, async (req, res) => {
    const items = await prisma.notification.findMany({
        where: { userId: req.user!.id },
        orderBy: { createdAt: 'desc' },
        take: 50,
    });
    ok(res, items);
});

app.patch('/api/notifications/:id/read', authRequired, async (req, res) => {
    await prisma.notification.updateMany({
        where: { id: req.params.id, userId: req.user!.id },
        data: { isRead: true, readAt: new Date() },
    });
    ok(res, { message: 'خوانده شد.' });
});

app.post('/api/notifications/read-all', authRequired, async (req, res) => {
    await prisma.notification.updateMany({
        where: { userId: req.user!.id, isRead: false },
        data: { isRead: true, readAt: new Date() },
    });
    ok(res, { message: 'همه خوانده شد.' });
});

app.get('/api/stories', async (_req, res) => {
    const items = await prisma.story.findMany({
        where: { isActive: true },
        include: { slides: { orderBy: { sortOrder: 'asc' } } },
        orderBy: { sortOrder: 'asc' },
    });
    ok(res, items);
});

app.get('/api/service-categories', async (_req, res) => {
    const items = await prisma.serviceCategory.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
    });
    ok(res, items);
});

app.get('/api/promo-banners', async (_req, res) => {
    const items = await prisma.promoBanner.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
    });
    ok(res, items);
});

app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
});

app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error('[Server Error]', err);
    if (err?.code === 'P2002') return fail(res, 'این مقدار قبلاً ثبت شده.', 409, 'DUPLICATE');
    if (err?.code === 'P2025') return fail(res, 'رکورد پیدا نشد.', 404, 'NOT_FOUND');
    fail(res, err?.message || 'خطای داخلی سرور.', 500, 'INTERNAL');
});

const httpServer = createServer(app);
const io = new SocketServer(httpServer, {
    cors: { origin: CORS_ORIGINS, credentials: true },
    path: '/ws/tracking',
});

io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (!token) return next(new Error('NO_TOKEN'));
    try {
        const payload = jwt.verify(String(token), JWT_SECRET) as JwtPayload;
        (socket as any).userId = payload.sub;
        (socket as any).role = payload.role;
        next();
    } catch {
        next(new Error('INVALID_TOKEN'));
    }
});

io.on('connection', (socket: Socket) => {
    const userId = (socket as any).userId;
    console.log(`[WS] connected: user=${userId} role=${(socket as any).role}`);

    socket.on('order:subscribe', async ({ orderId }: { orderId: string }) => {
        const order = await prisma.order.findFirst({ where: { id: orderId, userId } });
        if (!order) return socket.emit('error', { message: 'سفارش پیدا نشد.' });
        socket.join(`order:${orderId}`);
        socket.emit('order:subscribed', { orderId, status: order.status });

        const assignment = await prisma.courierAssignment.findUnique({
            where: { orderId },
            include: { courier: true },
        });
        if (assignment?.courier?.currentLat && assignment.courier.currentLon) {
            socket.emit('courier:location', {
                orderId,
                lat: assignment.courier.currentLat,
                lon: assignment.courier.currentLon,
                at: assignment.courier.lastPingAt,
            });
        }
    });

    socket.on('order:unsubscribe', ({ orderId }: { orderId: string }) => {
        socket.leave(`order:${orderId}`);
    });

    socket.on('courier:update', async ({ lat, lon, heading, speedKmh }: any) => {
        if ((socket as any).role !== 'COURIER') return;
        const courier = await prisma.courier.findUnique({ where: { userId } });
        if (!courier) return;

        await prisma.courier.update({
            where: { id: courier.id },
            data: { currentLat: lat, currentLon: lon, lastPingAt: new Date() },
        });

        await prisma.courierLocationLog.create({
            data: { courierId: courier.id, userId, latitude: lat, longitude: lon, heading, speedKmh },
        });

        const activeAssignments = await prisma.courierAssignment.findMany({
            where: { courierId: courier.id, deliveredAt: null },
        });
        for (const a of activeAssignments) {
            io.to(`order:${a.orderId}`).emit('courier:location', {
                orderId: a.orderId, lat, lon, heading, speedKmh, at: new Date().toISOString(),
            });
        }
    });

    socket.on('disconnect', () => {
        console.log(`[WS] disconnected: user=${userId}`);
    });
});

export async function emitOrderStatus(orderId: string, status: string, message?: string) {
    io.to(`order:${orderId}`).emit('order:status', { orderId, status, message, at: new Date().toISOString() });
}

export async function pushNotification(userId: string, notif: { type: string; title: string; body: string; icon?: string; color?: string; action?: any }) {
    const created = await prisma.notification.create({
        data: {
            userId,
            type: notif.type as any,
            title: notif.title,
            body: notif.body,
            icon: notif.icon || 'bell',
            color: notif.color || 'gray',
            action: notif.action || undefined,
        },
    });
    io.to(`user:${userId}`).emit('notification:new', created);
    return created;
}

httpServer.listen(PORT, () => {
    console.log(`🍔 Loghme Backend running on http://localhost:${PORT}`);
    console.log(`📡 WebSocket on ws://localhost:${PORT}/ws/tracking`);
});

process.on('SIGINT', async () => {
    console.log('\n[Server] shutting down...');
    await prisma.$disconnect();
    redis.disconnect();
    httpServer.close(() => process.exit(0));
});