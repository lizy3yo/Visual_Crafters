import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import RefreshToken from '@/lib/models/RefreshToken';
import { clearAuthCookies, REFRESH_COOKIE } from '@/lib/auth/cookies';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Read refresh token from HttpOnly cookie
    const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;

    if (refreshToken) {
      await RefreshToken.updateOne(
        { token: refreshToken },
        { $set: { isRevoked: true } }
      );
    }

    const res = NextResponse.json({ message: 'Logged out successfully.' });
    clearAuthCookies(res);
    return res;
  } catch (error: any) {
    console.error('[Logout] Error:', error);
    const res = NextResponse.json({ error: 'An error occurred during logout.' }, { status: 500 });
    clearAuthCookies(res); // Clear cookies even on error
    return res;
  }
}
