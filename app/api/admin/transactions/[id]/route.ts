import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Transaction from '@/lib/models/Transaction';
import { authenticate, authorizeRole } from '@/lib/auth/middleware';
import { broadcast } from '@/lib/sse/transactionBroadcaster';
import { redis, isUpstash } from '@/lib/rateLimit/redis';

const CACHE_KEY_ALL = 'transactions:all';
const CACHE_KEYS    = [CACHE_KEY_ALL, `${CACHE_KEY_ALL}:day`, `${CACHE_KEY_ALL}:week`, `${CACHE_KEY_ALL}:month`];

async function redisDel(...keys: string[]) {
  try {
    for (const k of keys) await (redis as any).del(k);
  } catch (e) {
    console.error('[Transactions[id]] Redis del error', e);
  }
}

const VALID_PAYMENTS = ['QR', 'Cash'] as const;
type PaymentMethod = (typeof VALID_PAYMENTS)[number];

// ── PATCH /api/admin/transactions/[id] ────────────────────────────────────────
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await authenticate(req);
  if (!user || !authorizeRole(user, ['admin']))
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

  const { id } = await params;
  if (!id) return NextResponse.json({ error: 'ID is required.' }, { status: 400 });

  try {
    await connectDB();
    const body = await req.json();
    const { client, service, template, payment, amount, date, notes } = body;

    // Partial validation – only validate fields that are present
    const updates: Record<string, unknown> = {};

    if (client !== undefined) {
      if (!client?.trim()) return NextResponse.json({ error: 'Client name is required.' }, { status: 400 });
      updates.client = client.trim();
    }
    if (service !== undefined) {
      if (!service?.trim()) return NextResponse.json({ error: 'Service is required.' }, { status: 400 });
      updates.service = service.trim();
    }
    if (template !== undefined) updates.template = template?.trim() ?? '';
    if (payment !== undefined) {
      if (!VALID_PAYMENTS.includes(payment as PaymentMethod))
        return NextResponse.json({ error: 'Payment method must be QR or Cash.' }, { status: 400 });
      updates.payment = payment;
    }
    if (amount !== undefined) {
      if (isNaN(Number(amount)) || Number(amount) < 0)
        return NextResponse.json({ error: 'Amount must be a non-negative number.' }, { status: 400 });
      updates.amount = Number(amount);
    }
    if (date !== undefined) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date))
        return NextResponse.json({ error: 'Date must be in YYYY-MM-DD format.' }, { status: 400 });
      updates.date = date.trim();
    }
    if (notes !== undefined) updates.notes = notes?.trim() ?? '';

    const doc = await Transaction.findByIdAndUpdate(id, updates, { new: true }).lean();
    if (!doc) return NextResponse.json({ error: 'Transaction not found.' }, { status: 404 });

    await redisDel(...CACHE_KEYS);
    broadcast('transaction:updated', doc);
    return NextResponse.json({ transaction: doc });
  } catch (err: any) {
    console.error('[Transactions PATCH]', err);
    return NextResponse.json({ error: 'Failed to update transaction.' }, { status: 500 });
  }
}

// ── DELETE /api/admin/transactions/[id] ───────────────────────────────────────
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await authenticate(req);
  if (!user || !authorizeRole(user, ['admin']))
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

  const { id } = await params;
  if (!id) return NextResponse.json({ error: 'ID is required.' }, { status: 400 });

  try {
    await connectDB();
    const doc = await Transaction.findByIdAndDelete(id).lean();
    if (!doc) return NextResponse.json({ error: 'Transaction not found.' }, { status: 404 });

    await redisDel(...CACHE_KEYS);
    broadcast('transaction:deleted', { id });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[Transactions DELETE]', err);
    return NextResponse.json({ error: 'Failed to delete transaction.' }, { status: 500 });
  }
}
