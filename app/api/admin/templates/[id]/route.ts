import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Template from '@/lib/models/Template';
import { uploadImage, deleteImage } from '@/lib/cloudinary';
import { authenticate, authorizeRole } from '@/lib/auth/middleware';
import { broadcast } from '@/lib/sse/templateBroadcaster';

type Params = { params: Promise<{ id: string }> };

// ── GET /api/admin/templates/[id] ─────────────────────────────────────────────
export async function GET(req: NextRequest, { params }: Params) {
  const user = await authenticate(req);
  if (!user || !authorizeRole(user, ['admin'])) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }
  const { id } = await params;
  try {
    await connectDB();
    const template = await Template.findById(id).lean();
    if (!template) return NextResponse.json({ error: 'Template not found.' }, { status: 404 });
    return NextResponse.json({ template });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch template.' }, { status: 500 });
  }
}

// ── PATCH /api/admin/templates/[id] ──────────────────────────────────────────
export async function PATCH(req: NextRequest, { params }: Params) {
  const user = await authenticate(req);
  if (!user || !authorizeRole(user, ['admin'])) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }
  const { id } = await params;
  try {
    await connectDB();
    const body = await req.json();
    const { title, description, price, category, imageData, status } = body;

    const existing = await Template.findById(id);
    if (!existing) return NextResponse.json({ error: 'Template not found.' }, { status: 404 });

    // Validation
    if (title !== undefined && !title.trim())
      return NextResponse.json({ error: 'Title cannot be empty.' }, { status: 400 });
    if (price !== undefined && (isNaN(Number(price)) || Number(price) < 0))
      return NextResponse.json({ error: 'Price must be a non-negative number.' }, { status: 400 });

    // If a new image was provided, replace it
    if (imageData) {
      await deleteImage(existing.imagePublicId);
      const { url, publicId } = await uploadImage(imageData, 'templates');
      existing.imageUrl      = url;
      existing.imagePublicId = publicId;
    }

    if (title       !== undefined) existing.title       = title.trim();
    if (description !== undefined) existing.description = description.trim();
    if (price       !== undefined) existing.price       = Number(price);
    if (category    !== undefined) existing.category    = category.trim();
    if (status      !== undefined) existing.status      = status;

    await existing.save();
    broadcast('template:updated', existing);
    return NextResponse.json({ template: existing });
  } catch (err: any) {
    console.error('[Templates PATCH]', err);
    return NextResponse.json({ error: err?.message ?? 'Failed to update template.' }, { status: 500 });
  }
}

// ── DELETE /api/admin/templates/[id] ─────────────────────────────────────────
export async function DELETE(req: NextRequest, { params }: Params) {
  const user = await authenticate(req);
  if (!user || !authorizeRole(user, ['admin'])) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }
  const { id } = await params;
  try {
    await connectDB();
    const template = await Template.findById(id);
    if (!template) return NextResponse.json({ error: 'Template not found.' }, { status: 404 });

    await deleteImage(template.imagePublicId);
    await template.deleteOne();

    broadcast('template:deleted', { id });
    return NextResponse.json({ message: 'Template deleted.' });
  } catch (err: any) {
    console.error('[Templates DELETE]', err);
    return NextResponse.json({ error: err?.message ?? 'Failed to delete template.' }, { status: 500 });
  }
}
