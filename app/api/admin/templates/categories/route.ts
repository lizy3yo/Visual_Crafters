import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Template from '@/lib/models/Template';
import { authenticate, authorizeRole } from '@/lib/auth/middleware';

// Returns all distinct categories currently in use + the default set
const DEFAULT_CATEGORIES = [
  'Logos',
  'Pubmats',
  'Infographics',
  'Posters',
  'Certificates',
  'Presentations',
];

export async function GET(req: NextRequest) {
  const user = await authenticate(req);
  if (!user || !authorizeRole(user, ['admin'])) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }
  try {
    await connectDB();
    const dbCategories: string[] = await Template.distinct('category');
    const merged = Array.from(new Set([...DEFAULT_CATEGORIES, ...dbCategories])).sort();
    const res = NextResponse.json({ categories: merged });
    res.headers.set('Cache-Control', 'private, max-age=60');
    return res;
  } catch {
    return NextResponse.json({ categories: DEFAULT_CATEGORIES });
  }
}
