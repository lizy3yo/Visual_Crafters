import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { authenticate, authorizeRole } from '@/lib/auth/middleware';
import { redis, isUpstash } from '@/lib/rateLimit/redis';
import ClientRequest from '@/lib/models/ClientRequest';
import Template from '@/lib/models/Template';
import Transaction from '@/lib/models/Transaction';
import User from '@/lib/models/User';

// ── Constants ─────────────────────────────────────────────────────────────────
const CACHE_KEY = 'dashboard:stats';
const CACHE_TTL = 30; // seconds

// ── Helpers ───────────────────────────────────────────────────────────────────
function withCache(res: NextResponse, seconds = CACHE_TTL) {
  res.headers.set('Cache-Control', `private, max-age=${seconds}, stale-while-revalidate=60`);
  return res;
}

async function redisGet(key: string): Promise<unknown | null> {
  try { return (await (redis as any).get(key)) ?? null; } catch { return null; }
}

async function redisSet(key: string, value: string) {
  try {
    if (isUpstash()) {
      await (redis as any).set(key, value, { ex: CACHE_TTL });
    } else {
      await (redis as any).set(key, value, 'EX', CACHE_TTL);
    }
  } catch (e) { console.error('[Dashboard GET] Redis write error', e); }
}

// ── GET /api/admin/dashboard ──────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const user = await authenticate(req);
  if (!user || !authorizeRole(user, ['admin']))
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

  // ── Server-side Redis cache ────────────────────────────────────────────────
  const cached = await redisGet(CACHE_KEY);
  if (cached) {
    const parsed = typeof cached === 'string' ? JSON.parse(cached) : cached;
    return withCache(NextResponse.json(parsed));
  }

  try {
    await connectDB();

    const now        = new Date();
    const year       = now.getFullYear();
    const month      = now.getMonth(); // 0-indexed
    const thisMonth  = `${year}-${String(month + 1).padStart(2, '0')}`;
    const lastMonthD = new Date(year, month - 1, 1);
    const lastMonth  = `${lastMonthD.getFullYear()}-${String(lastMonthD.getMonth() + 1).padStart(2, '0')}`;

    // ── Parallel queries ───────────────────────────────────────────────────────
    const [
      totalClients,
      activeProjects,
      totalTemplates,
      allTransactions,
      recentRequests,
    ] = await Promise.all([
      // Total distinct clients (users with role 'student') OR total unique client names in requests
      User.countDocuments({ role: 'student' }),
      // Active projects = client requests that are Pending or In Progress
      ClientRequest.countDocuments({ status: { $in: ['Pending', 'In Progress'] } }),
      // Total published templates
      Template.countDocuments({ status: 'published' }),
      // All transactions for revenue + chart
      Transaction.find({}).select('amount date').lean(),
      // Last 5 client requests for the panel
      ClientRequest.find({})
        .sort({ createdAt: -1 })
        .limit(5)
        .select('fullName service status createdAt')
        .lean(),
    ]);

    // ── Revenue calculations ──────────────────────────────────────────────────
    const totalRevenue   = allTransactions.reduce((s, t) => s + t.amount, 0);
    const thisMonthRev   = allTransactions
      .filter(t => (t.date as string).startsWith(thisMonth))
      .reduce((s, t) => s + t.amount, 0);
    const lastMonthRev   = allTransactions
      .filter(t => (t.date as string).startsWith(lastMonth))
      .reduce((s, t) => s + t.amount, 0);

    const revenueChange = lastMonthRev > 0
      ? Math.round(((thisMonthRev - lastMonthRev) / lastMonthRev) * 100)
      : thisMonthRev > 0 ? 100 : 0;

    // ── Monthly income chart — current year, all 12 months ───────────────────
    const monthlyMap: Record<string, number> = {};
    for (let m = 1; m <= 12; m++) {
      const key = `${year}-${String(m).padStart(2, '0')}`;
      monthlyMap[key] = 0;
    }
    allTransactions.forEach(t => {
      const key = (t.date as string).slice(0, 7); // YYYY-MM
      if (key in monthlyMap) monthlyMap[key] += t.amount;
    });

    const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                          'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const incomeChart = Object.entries(monthlyMap).map(([key, value], i) => ({
      month: MONTH_LABELS[i],
      value,
    }));

    // ── Stat card change badges ───────────────────────────────────────────────
    const payload = {
      stats: {
        totalClients,
        activeProjects,
        totalTemplates,
        totalRevenue,
        revenueChange,
      },
      incomeChart,
      recentRequests,
      year,
    };

    await redisSet(CACHE_KEY, JSON.stringify(payload));
    return withCache(NextResponse.json(payload));
  } catch (err: any) {
    console.error('[Dashboard GET]', err);
    return NextResponse.json({ error: 'Failed to load dashboard.' }, { status: 500 });
  }
}
