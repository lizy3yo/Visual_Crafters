import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Transaction from '@/lib/models/Transaction';
import { authenticate, authorizeRole } from '@/lib/auth/middleware';
import { broadcast } from '@/lib/sse/transactionBroadcaster';
import { redis, isUpstash } from '@/lib/rateLimit/redis';

// ── Constants ─────────────────────────────────────────────────────────────────
const CACHE_KEY_ALL     = 'transactions:all';
const CACHE_TTL_SECONDS = 20;

const VALID_PAYMENTS = ['QR', 'Cash'] as const;
type PaymentMethod = (typeof VALID_PAYMENTS)[number];

// ── Helpers ───────────────────────────────────────────────────────────────────
function withCache(res: NextResponse, seconds = CACHE_TTL_SECONDS) {
  res.headers.set(
    'Cache-Control',
    `private, max-age=${seconds}, stale-while-revalidate=30`,
  );
  return res;
}

async function redisGet(key: string): Promise<unknown | null> {
  try {
    return (await (redis as any).get(key)) ?? null;
  } catch {
    return null;
  }
}

async function redisSet(key: string, value: string) {
  try {
    if (isUpstash()) {
      await (redis as any).set(key, value, { ex: CACHE_TTL_SECONDS });
    } else {
      await (redis as any).set(key, value, 'EX', CACHE_TTL_SECONDS);
    }
  } catch (e) {
    console.error('[Transactions] Redis write error', e);
  }
}

async function redisDel(...keys: string[]) {
  try {
    for (const k of keys) await (redis as any).del(k);
  } catch (e) {
    console.error('[Transactions] Redis del error', e);
  }
}

function validateBody(body: Record<string, unknown>): string | null {
  const { client, service, payment, amount, date } = body;
  if (!client || typeof client !== 'string' || !client.trim())
    return 'Client name is required.';
  if ((client as string).trim().length > 150)
    return 'Client name must be ≤ 150 characters.';
  if (!service || typeof service !== 'string' || !service.trim())
    return 'Service is required.';
  if (!VALID_PAYMENTS.includes(payment as PaymentMethod))
    return 'Payment method must be QR or Cash.';
  if (amount === undefined || amount === null || isNaN(Number(amount)) || Number(amount) < 0)
    return 'Amount must be a non-negative number.';
  if (!date || typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date))
    return 'Date must be in YYYY-MM-DD format.';
  return null;
}

// ── GET /api/admin/transactions ───────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const user = await authenticate(req);
  if (!user || !authorizeRole(user, ['admin']))
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const period = searchParams.get('period'); // 'day' | 'week' | 'month' | null
    const cacheKey = period ? `${CACHE_KEY_ALL}:${period}` : CACHE_KEY_ALL;

    // ── Server-side Redis cache ──────────────────────────────────────────────
    const cached = await redisGet(cacheKey);
    if (cached) {
      const parsed = typeof cached === 'string' ? JSON.parse(cached) : cached;
      return withCache(NextResponse.json(parsed));
    }

    // ── Build date filter ────────────────────────────────────────────────────
    const now   = new Date();
    let dateFilter: Record<string, unknown> = {};

    if (period === 'day') {
      const today = now.toISOString().slice(0, 10);
      dateFilter = { date: today };
    } else if (period === 'week') {
      const start = new Date(now);
      start.setDate(now.getDate() - 6);
      const dates: string[] = [];
      for (let d = new Date(start); d <= now; d.setDate(d.getDate() + 1))
        dates.push(d.toISOString().slice(0, 10));
      dateFilter = { date: { $in: dates } };
    } else if (period === 'month') {
      const yyyy = now.getFullYear();
      const mm   = String(now.getMonth() + 1).padStart(2, '0');
      dateFilter = { date: { $regex: `^${yyyy}-${mm}` } };
    }

    const transactions = await Transaction.find(dateFilter)
      .sort({ date: -1, createdAt: -1 })
      .lean();

    // ── Derived summaries (computed server-side once per request) ────────────
    const todayStr  = now.toISOString().slice(0, 10);
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - 6);
    const weekDates: string[] = [];
    for (let d = new Date(weekStart); d <= now; d.setDate(d.getDate() + 1))
      weekDates.push(d.toISOString().slice(0, 10));
    const yyyymm = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    // When no period filter is active we need all transactions for the summary
    const allForSummary = period
      ? await Transaction.find({}).lean()
      : (transactions as typeof transactions);

    const daily   = allForSummary.filter(t => t.date === todayStr).reduce((s, t) => s + t.amount, 0);
    const weekly  = allForSummary.filter(t => weekDates.includes(t.date)).reduce((s, t) => s + t.amount, 0);
    const monthly = allForSummary.filter(t => (t.date as string).startsWith(yyyymm)).reduce((s, t) => s + t.amount, 0);

    const payload = {
      transactions,
      summary: { daily, weekly, monthly },
    };

    await redisSet(cacheKey, JSON.stringify(payload));
    return withCache(NextResponse.json(payload));
  } catch (err: any) {
    console.error('[Transactions GET]', err);
    return NextResponse.json({ error: 'Failed to fetch transactions.' }, { status: 500 });
  }
}

// ── POST /api/admin/transactions ──────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const user = await authenticate(req);
  if (!user || !authorizeRole(user, ['admin']))
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

  try {
    await connectDB();
    const body = await req.json();
    const err  = validateBody(body);
    if (err) return NextResponse.json({ error: err }, { status: 400 });

    const { client, service, template, payment, amount, date, notes } = body;

    const doc = await Transaction.create({
      client:   client.trim(),
      service:  service.trim(),
      template: template?.trim() ?? '',
      payment,
      amount:   Number(amount),
      date:     date.trim(),
      notes:    notes?.trim() ?? '',
    });

    await redisDel(CACHE_KEY_ALL, `${CACHE_KEY_ALL}:day`, `${CACHE_KEY_ALL}:week`, `${CACHE_KEY_ALL}:month`);
    broadcast('transaction:created', doc);
    return NextResponse.json({ transaction: doc }, { status: 201 });
  } catch (err: any) {
    console.error('[Transactions POST]', err);
    return NextResponse.json({ error: err?.message ?? 'Failed to create transaction.' }, { status: 500 });
  }
}
