import {NextRequest} from 'next/server';
import { verifyAccessToken } from './jwt';
import { JWTPayload, UserRole } from '@/types';

// This middleware function authenticates incoming requests by verifying the JWT token provided in the Authorization header. It returns the decoded payload if the token is valid, or null if it is invalid or missing.
export async function authenticate(
    request: NextRequest
): Promise<JWTPayload | null> {

    // Extract the Authorization header from the incoming request
    const authHeader = request.headers.get('Authorization');

    // Check if the Authorization header is present and starts with "Bearer "
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }

    // Extract the token from the Authorization header by removing the "Bearer " prefix
    const token = authHeader.substring(7); // Remove "Bearer " prefix

    // Verify the token and return the decoded payload if valid, or null if invalid
    const decoded = verifyAccessToken(token);
    return decoded;
}

// This function checks if the authenticated user has one of the allowed roles for accessing a specific resource. It returns true if the user's role is included in the allowedRoles array, or false if the user is not authenticated or does not have the required role.
export function authorizeRole(
    user: JWTPayload | null,
    allowedRoles: UserRole[]
): boolean {
    if (!user) {
        return false;
    }
    return allowedRoles.includes(user.role);
}