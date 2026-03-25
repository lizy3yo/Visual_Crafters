import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import ClientRequest from '@/lib/models/ClientRequest';
import { authenticate, authorizeRole } from '@/lib/auth/middleware';
import { broadcast } from '@/lib/sse/clientRequestBroadcaster';
import { redis, isUpstash } from '@/lib/rateLimit/redis';
import { uploadImage } from '@/lib/cloudinary';
import { rateLimit } from '@/lib/rateLimit/middleware';
import { sendEmail } from '@/lib/email/nodemailer';
import { getRequestConfirmationTemplate } from '@/lib/email/templates/requestConfirmation';
import { getRequestStatusUpdateTemplate } from '@/lib/email/templates/requestStatusUpdate';

// ── Validation helpers ────────────────────────────────────────────────────────
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ── POST /api/client-requests — public, submit a request ─────────────────────
export async function POST(req: NextRequest) {
  // Rate limit: 5 submissions per 10 minutes per IP
  const rl = await rateLimit(req, 'client-request:submit');
  if (!rl.allowed) return rl.response!;

  try {
    await connectDB();
    const body = await req.json();
    const { fullName, contact, email, service, deadline, description,
            templateId, templateTitle, templatePrice, fileData } = body;

    // ── Validation ────────────────────────────────────────────────────────────
    if (!fullName?.trim() || fullName.trim().length > 100)
      return NextResponse.json({ error: 'Full name is required (max 100 chars).' }, { status: 400 });
    if (!contact?.trim() || contact.trim().length > 30)
      return NextResponse.json({ error: 'Contact number is required.' }, { status: 400 });
    if (!email?.trim() || !EMAIL_RE.test(email.trim()))
      return NextResponse.json({ error: 'A valid email is required.' }, { status: 400 });
    if (!service?.trim())
      return NextResponse.json({ error: 'Service is required.' }, { status: 400 });
    if (!deadline?.trim())
      return NextResponse.json({ error: 'Preferred deadline is required.' }, { status: 400 });
    if (description && description.length > 2000)
      return NextResponse.json({ error: 'Description must be 2000 characters or fewer.' }, { status: 400 });

    // ── Optional file upload ──────────────────────────────────────────────────
    let fileUrl: string | undefined;
    let filePublicId: string | undefined;
    if (fileData) {
      const uploaded = await uploadImage(fileData, 'client_requests');
      fileUrl      = uploaded.url;
      filePublicId = uploaded.publicId;
    }

    const doc = await ClientRequest.create({
      fullName:      fullName.trim(),
      contact:       contact.trim(),
      email:         email.trim().toLowerCase(),
      service,
      deadline:      deadline.trim(),
      description:   description?.trim() ?? '',
      templateId:    templateId    ?? undefined,
      templateTitle: templateTitle ?? undefined,
      templatePrice: templatePrice ?? undefined,
      fileUrl,
      filePublicId,
    });

    broadcast('request:created', doc);

    // Auto-creation of reservations was removed: client requests remain separate

    // Send confirmation email (non-blocking — don't fail the request if email fails)
    const referenceNumber = String(doc._id).slice(-8).toUpperCase();
    const { html, text } = getRequestConfirmationTemplate({
      fullName:       doc.fullName,
      templateTitle:  doc.templateTitle ?? 'Custom Design',
      templatePrice:  doc.templatePrice ?? 0,
      category:       doc.service,
      deadline:       doc.deadline,
      description:    doc.description || undefined,
      referenceNumber,
    });

    sendEmail(
      doc.email,
      `Request Confirmed – ${doc.templateTitle ?? 'Design Request'} | Visual Crafters`,
      html,
      text
    ).catch(err => console.error('[ClientRequest email]', err));

    return NextResponse.json({ request: doc }, { status: 201 });
  } catch (err: any) {
    console.error('[ClientRequest POST]', err);
    return NextResponse.json({ error: err?.message ?? 'Failed to submit request.' }, { status: 500 });
  }
}

// ── GET /api/client-requests — admin only ─────────────────────────────────────
export async function GET(req: NextRequest) {
  const user = await authenticate(req);
  if (!user || !authorizeRole(user, ['admin']))
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const query  = status && status !== 'all' ? { status } : {};

    const cacheKey = status && status !== 'all' ? `client-requests:status:${status}` : 'client-requests:all';

    // Try Redis cache first
    try {
      const cached = await redis.get?.(cacheKey) ?? null;
      if (cached) {
        const parsed = typeof cached === 'string' ? JSON.parse(cached) : cached;
        const res = NextResponse.json({ requests: parsed });
        res.headers.set('Cache-Control', 'private, max-age=15, stale-while-revalidate=30');
        return res;
      }
    } catch (e) {
      console.error('[ClientRequest GET] Redis read error', e);
    }

    const requests = await ClientRequest.find(query).sort({ createdAt: -1 }).lean();

    // Populate cache (short TTL)
    try {
      if (isUpstash()) {
        await (redis as any).set(cacheKey, JSON.stringify(requests), { ex: 15 });
      } else {
        await (redis as any).set(cacheKey, JSON.stringify(requests), 'EX', 15);
      }
    } catch (e) {
      console.error('[ClientRequest GET] Redis write error', e);
    }

    const res = NextResponse.json({ requests });
    res.headers.set('Cache-Control', 'private, max-age=15, stale-while-revalidate=30');
    return res;
  } catch (err: any) {
    console.error('[ClientRequest GET]', err);
    return NextResponse.json({ error: 'Failed to fetch requests.' }, { status: 500 });
  }
}

// ── PATCH /api/client-requests — admin: update status ────────────────────────
export async function PATCH(req: NextRequest) {
  const user = await authenticate(req);
  if (!user || !authorizeRole(user, ['admin']))
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

  try {
    await connectDB();
    const { id, status } = await req.json();
    const VALID = ['Pending', 'In Progress', 'Completed', 'Cancelled'];
    if (!id || !VALID.includes(status))
      return NextResponse.json({ error: 'Invalid id or status.' }, { status: 400 });

    const doc = await ClientRequest.findByIdAndUpdate(id, { status }, { new: true }).lean();
    if (!doc) return NextResponse.json({ error: 'Request not found.' }, { status: 404 });

    broadcast('request:updated', doc);

    // Send status notification email (non-blocking)
    const notifyStatuses = ['In Progress', 'Completed', 'Cancelled'] as const;
    if (notifyStatuses.includes(status as any)) {
      const referenceNumber = String(doc._id).slice(-8).toUpperCase();
      const { html, text, subject } = getRequestStatusUpdateTemplate({
        fullName:       (doc as any).fullName,
        service:        (doc as any).service,
        templateTitle:  (doc as any).templateTitle,
        deadline:       (doc as any).deadline,
        referenceNumber,
        status: status as 'In Progress' | 'Completed' | 'Cancelled',
      });
      sendEmail((doc as any).email, subject, html, text)
        .catch(err => console.error('[StatusUpdate email]', err));
    }

    return NextResponse.json({ request: doc });
  } catch (err: any) {
    console.error('[ClientRequest PATCH]', err);
    return NextResponse.json({ error: 'Failed to update request.' }, { status: 500 });
  }
}
