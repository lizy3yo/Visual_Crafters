import { NextResponse } from 'next/server';
import { ResponseCookie } from 'next/dist/compiled/@edge-runtime/cookies';

const IS_PROD = process.env.NODE_ENV === 'production';

// Access token: 15 minutes
export const ACCESS_COOKIE  = 'access_token';
// Refresh token: 7 days
export const REFRESH_COOKIE = 'refresh_token';

const BASE: Partial<ResponseCookie> = {
  httpOnly: true,
  secure:   IS_PROD,
  sameSite: 'lax',
  path:     '/',
};

export function setAuthCookies(
  res: NextResponse,
  accessToken: string,
  refreshToken: string
) {
  res.cookies.set(ACCESS_COOKIE, accessToken, {
    ...BASE,
    maxAge: 15 * 60, // 15 minutes
  });
  res.cookies.set(REFRESH_COOKIE, refreshToken, {
    ...BASE,
    maxAge: 7 * 24 * 60 * 60, // 7 days
  });
}

export function clearAuthCookies(res: NextResponse) {
  res.cookies.set(ACCESS_COOKIE,  '', { ...BASE, maxAge: 0 });
  res.cookies.set(REFRESH_COOKIE, '', { ...BASE, maxAge: 0 });
}
