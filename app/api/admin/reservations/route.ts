import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Reservation from '@/lib/models/Reservation';
import { authenticate, authorizeRole } from '@/lib/auth/middleware';
import { broadcast } from '@/lib/sse/reservationBroadcaster';
import { redis, isUpstash } from '@/lib/rateLimit/redis';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VALID_STATUSES = ['Scheduled', 'Serving', 'Done', 'Cancelled'] as const;

function withCache(res: NextResponse, seconds = 15) {
  res.headers.set('Cache-Control', `private, max-age=${seconds}, stale-while-revalidate=30`);
  return res;
}

// ── GET /api/admin/reservations ───────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const user = await authenticate(req);
  if (!user || !authorizeRole(user, ['admin']))
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date'); // YYYY-MM-DD, optional

    const cacheKey = date ? `reservations:date:${date}` : 'reservations:all';

    // Try Redis cache first
    try {
      const cached = await redis.get?.(cacheKey) ?? null;
      if (cached) {
        const parsed = typeof cached === 'string' ? JSON.parse(cached) : cached;
        const res = NextResponse.json(parsed);
        return withCache(res, 15);
      }
    } catch (e) {
      // ignore cache errors
      console.error('[Reservations GET] Redis read error', e);
    }

    const query = date ? { date } : {};
    const reservations = await Reservation.find(query)
      .sort({ date: 1, timeSlot: 1 })
      .lean();

    // Also return distinct dates that have reservations (for calendar dots)
    const dates = await Reservation.distinct('date');

    const payload = { reservations, dates };

    // Populate cache (short TTL)
    try {
      if (isUpstash()) {
        await (redis as any).set(cacheKey, JSON.stringify(payload), { ex: 15 });
      } else {
        await (redis as any).set(cacheKey, JSON.stringify(payload), 'EX', 15);
      }
    } catch (e) {
      console.error('[Reservations GET] Redis write error', e);
    }

    const res = NextResponse.json(payload);
    return withCache(res, 15);
  } catch (err: any) {
    console.error('[Reservations GET]', err);
    return NextResponse.json({ error: 'Failed to fetch reservations.' }, { status: 500 });
  }
}

// ── POST /api/admin/reservations ──────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const user = await authenticate(req);
  if (!user || !authorizeRole(user, ['admin']))
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

  try {
    await connectDB();
    const { clientName, contact, email, service, date, timeSlot, notes } = await req.json();

    if (!clientName?.trim() || clientName.trim().length > 100)
      return NextResponse.json({ error: 'Client name is required.' }, { status: 400 });
    if (!contact?.trim())
      return NextResponse.json({ error: 'Contact number is required.' }, { status: 400 });
    if (!email?.trim() || !EMAIL_RE.test(email.trim()))
      return NextResponse.json({ error: 'A valid email is required.' }, { status: 400 });
    if (!service?.trim())
      return NextResponse.json({ error: 'Service is required.' }, { status: 400 });
    if (!date?.trim())
      return NextResponse.json({ error: 'Date is required.' }, { status: 400 });
    if (!timeSlot?.trim())
      return NextResponse.json({ error: 'Time slot is required.' }, { status: 400 });

    const doc = await Reservation.create({
      clientName: clientName.trim(),
      contact:    contact.trim(),
      email:      email.trim().toLowerCase(),
      service:    service.trim(),
      date:       date.trim(),
      timeSlot:   timeSlot.trim(),
      notes:      notes?.trim() ?? '',
    });
    // Invalidate relevant cache keys
    try {
      const keyAll = 'reservations:all';
      const keyDate = `reservations:date:${doc.date}`;
      await redis.del?.(keyAll);
      await redis.del?.(keyDate);
    } catch (e) { console.error('[Reservations POST] Redis del error', e); }

    broadcast('reservation:created', doc);
    return NextResponse.json({ reservation: doc }, { status: 201 });
  } catch (err: any) {
    console.error('[Reservations POST]', err);
    return NextResponse.json({ error: err?.message ?? 'Failed to create reservation.' }, { status: 500 });
  }
}

// ── PATCH /api/admin/reservations ─────────────────────────────────────────────
export async function PATCH(req: NextRequest) {
  const user = await authenticate(req);
  if (!user || !authorizeRole(user, ['admin']))
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

  try {
    await connectDB();
    const { id, status } = await req.json();

    if (!id || !VALID_STATUSES.includes(status))
      return NextResponse.json({ error: 'Invalid id or status.' }, { status: 400 });

    const doc = await Reservation.findByIdAndUpdate(id, { status }, { new: true }).lean();
    if (!doc) return NextResponse.json({ error: 'Reservation not found.' }, { status: 404 });
    try {
      const keyAll = 'reservations:all';
      const keyDate = `reservations:date:${doc.date}`;
      await redis.del?.(keyAll);
      await redis.del?.(keyDate);
    } catch (e) { console.error('[Reservations PATCH] Redis del error', e); }

    broadcast('reservation:updated', doc);
    return NextResponse.json({ reservation: doc });
  } catch (err: any) {
    console.error('[Reservations PATCH]', err);
    return NextResponse.json({ error: 'Failed to update reservation.' }, { status: 500 });
  }
}

// ── DELETE /api/admin/reservations ────────────────────────────────────────────
export async function DELETE(req: NextRequest) {
  const user = await authenticate(req);
  if (!user || !authorizeRole(user, ['admin']))
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID is required.' }, { status: 400 });

    const doc = await Reservation.findByIdAndDelete(id).lean();
    if (!doc) return NextResponse.json({ error: 'Reservation not found.' }, { status: 404 });
    try {
      const keyAll = 'reservations:all';
      const keyDate = `reservations:date:${doc.date}`;
      await redis.del?.(keyAll);
      await redis.del?.(keyDate);
    } catch (e) { console.error('[Reservations DELETE] Redis del error', e); }

    broadcast('reservation:deleted', { id });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[Reservations DELETE]', err);
    return NextResponse.json({ error: 'Failed to delete reservation.' }, { status: 500 });
  }
}
