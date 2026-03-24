import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Category from '@/lib/models/Category';
import { authenticate, authorizeRole } from '@/lib/auth/middleware';

type Params = { params: Promise<{ name: string }> };

// ── DELETE /api/admin/templates/categories/[name] ─────────────────────────────
export async function DELETE(req: NextRequest, { params }: Params) {
  const user = await authenticate(req);
  if (!user || !authorizeRole(user, ['admin'])) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }
  const { name } = await params;
  const decoded = decodeURIComponent(name);
  try {
    await connectDB();
    const category = await Category.findOne({ name: decoded });
    if (!category) {
      return NextResponse.json({ error: 'Category not found.' }, { status: 404 });
    }
    if (category.isDefault) {
      return NextResponse.json({ error: 'Default categories cannot be deleted.' }, { status: 403 });
    }
    await category.deleteOne();
    return NextResponse.json({ message: 'Category deleted.' });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Failed to delete category.' }, { status: 500 });
  }
}
