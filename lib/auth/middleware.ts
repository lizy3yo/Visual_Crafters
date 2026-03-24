import { NextRequest } from 'next/server';
import { verifyAccessToken } from './jwt';
import { ACCESS_COOKIE } from '@/lib/auth/cookies';
import { JWTPayload, UserRole } from '@/types';

/**
 * Authenticates a request by reading the access token from:
 * 1. HttpOnly cookie (primary — all standard requests)
 * 2. Authorization header (fallback — SSE uses query param handled separately)
 */
export async function authenticate(
  request: NextRequest
): Promise<JWTPayload | null> {
  // 1. Cookie-based (preferred)
  const cookieToken = request.cookies.get(ACCESS_COOKIE)?.value;
  if (cookieToken) {
    return verifyAccessToken(cookieToken);
  }

  // 2. Bearer header fallback (internal server-to-server or legacy)
  const authHeader = request.headers.get('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return verifyAccessToken(authHeader.substring(7));
  }

  return null;
}

export function authorizeRole(
  user: JWTPayload | null,
  allowedRoles: UserRole[]
): boolean {
  if (!user) return false;
  return allowedRoles.includes(user.role);
}
