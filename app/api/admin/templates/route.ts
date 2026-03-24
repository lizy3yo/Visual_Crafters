import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Template from '@/lib/models/Template';
import { uploadImage } from '@/lib/cloudinary';
import { authenticate, authorizeRole } from '@/lib/auth/middleware';
import { broadcast } from '@/lib/sse/templateBroadcaster';

// ── Cache headers helper ──────────────────────────────────────────────────────
function withCache(res: NextResponse, seconds = 30) {
  res.headers.set('Cache-Control', `private, max-age=${seconds}, stale-while-revalidate=60`);
  return res;
}

// ── GET /api/admin/templates ──────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const user = await authenticate(req);
  if (!user || !authorizeRole(user, ['admin'])) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const query = category && category !== 'all' ? { category } : {};

    const templates = await Template.find(query).sort({ createdAt: -1 }).lean();
    const res = NextResponse.json({ templates });
    return withCache(res, 30);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch templates.' }, { status: 500 });
  }
}

// ── POST /api/admin/templates ─────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const user = await authenticate(req);
  if (!user || !authorizeRole(user, ['admin'])) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  try {
    await connectDB();
    const body = await req.json();
    const { title, description, price, category, imageData, status } = body;

    // Validation
    if (!title?.trim())       return NextResponse.json({ error: 'Title is required.' },       { status: 400 });
    if (!description?.trim()) return NextResponse.json({ error: 'Description is required.' }, { status: 400 });
    if (price === undefined || price === null || isNaN(Number(price)) || Number(price) < 0)
      return NextResponse.json({ error: 'A valid price is required.' }, { status: 400 });
    if (!category?.trim())    return NextResponse.json({ error: 'Category is required.' },    { status: 400 });
    if (!imageData)           return NextResponse.json({ error: 'Image is required.' },       { status: 400 });

    // Upload to Cloudinary
    const { url, publicId } = await uploadImage(imageData, 'templates');

    const template = await Template.create({
      title:         title.trim(),
      description:   description.trim(),
      price:         Number(price),
      category:      category.trim(),
      imageUrl:      url,
      imagePublicId: publicId,
      status:        status ?? 'published',
    });

    broadcast('template:created', template);
    return NextResponse.json({ template }, { status: 201 });
  } catch (err: any) {
    console.error('[Templates POST]', err);
    return NextResponse.json({ error: err?.message ?? 'Failed to create template.' }, { status: 500 });
  }
}
