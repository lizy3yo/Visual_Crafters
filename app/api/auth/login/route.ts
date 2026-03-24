import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/lib/models/User';
import RefreshToken from '@/lib/models/RefreshToken';
import { verifyPassword } from '@/lib/auth/password';
import {
  createAccessToken,
  createRefreshToken,
  getTokenExpiry,
  getRefreshTokenExpiry,
} from '@/lib/auth/jwt';
import { setAuthCookies } from '@/lib/auth/cookies';
import { UserResponse } from '@/types';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    }

    const isPasswordValid = await verifyPassword(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    }

    const accessToken      = createAccessToken({ userId: user._id.toString(), email: user.email, role: user.role });
    const refreshTokenString = createRefreshToken();

    await RefreshToken.create({
      userId:    user._id.toString(),
      token:     refreshTokenString,
      expiresAt: getRefreshTokenExpiry(),
      isRevoked: false,
    });

    const userResponse: UserResponse = {
      id:        user._id.toString(),
      email:     user.email,
      firstName: user.firstName,
      lastName:  user.lastName,
      role:      user.role,
    };

    const res = NextResponse.json({
      message: 'Login successful.',
      user:    userResponse,
      expiresIn: getTokenExpiry(),
    });

    // Set HttpOnly cookies — tokens never exposed to JS
    setAuthCookies(res, accessToken, refreshTokenString);

    return res;
  } catch (error: any) {
    console.error('[Login] Unhandled error:', error);
    return NextResponse.json({ error: 'An error occurred during login.' }, { status: 500 });
  }
}
