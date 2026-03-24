import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/lib/models/User';
import RefreshToken from '@/lib/models/RefreshToken';
import { createAccessToken, getTokenExpiry } from '@/lib/auth/jwt';
import { setAuthCookies, clearAuthCookies, REFRESH_COOKIE } from '@/lib/auth/cookies';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Read refresh token from HttpOnly cookie
    const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;

    if (!refreshToken) {
      return NextResponse.json({ error: 'Refresh token is required.' }, { status: 400 });
    }

    const storedToken = await RefreshToken.findOne({ token: refreshToken });

    if (!storedToken) {
      return NextResponse.json({ error: 'Invalid refresh token.' }, { status: 401 });
    }

    if (storedToken.expiresAt < new Date()) {
      await RefreshToken.deleteOne({ _id: storedToken._id });
      const res = NextResponse.json({ error: 'Refresh token has expired.' }, { status: 401 });
      clearAuthCookies(res);
      return res;
    }

    if (storedToken.isRevoked) {
      const res = NextResponse.json({ error: 'Refresh token has been revoked.' }, { status: 401 });
      clearAuthCookies(res);
      return res;
    }

    const user = await User.findById(storedToken.userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    const newAccessToken = createAccessToken({
      userId: user._id.toString(),
      email:  user.email,
      role:   user.role,
    });

    const res = NextResponse.json({
      message:   'Access token refreshed successfully.',
      expiresIn: getTokenExpiry().accessTokenExpiresIn,
    });

    // Rotate access token cookie; keep same refresh token
    setAuthCookies(res, newAccessToken, refreshToken);
    return res;
  } catch (error: any) {
    console.error('[Refresh] Error:', error);
    return NextResponse.json({ error: 'An error occurred while refreshing the token.' }, { status: 500 });
  }
}
