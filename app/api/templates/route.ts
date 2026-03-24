import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Template from '@/lib/models/Template';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const search   = searchParams.get('search');

    const query: Record<string, unknown> = { status: 'published' };
    if (category && category !== 'all') query.category = category;
    if (search) query.$text = { $search: search };

    const templates = await Template.find(query).sort({ createdAt: -1 }).lean();
    const res = NextResponse.json({ templates });
    res.headers.set('Cache-Control', 'public, max-age=30, stale-while-revalidate=60');
    return res;
  } catch {
    return NextResponse.json({ error: 'Failed to fetch templates.' }, { status: 500 });
  }
}
