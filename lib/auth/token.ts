// crypto.randomBytes: Node.js built-in, cryptographically secure
// 32 bytes: Industry standard (GitHub, Google use similar)
// Hex encoding: URL-safe, easy to copy
// Short expiry: Security best practice (30 min for password reset)
// Longer expiry: Better UX for email verification (24 hours)


import crypto from 'crypto';

// Generates a secure random token for password resets or email verification
export function generateSecureToken(): string {
    return crypto.randomBytes(32).toString('hex');
}

// Calculates the expiration time for a password reset token (30 minutes from now)
export function getPasswordResetExpiry(): Date {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 30); // Token expires in 30 minutes
    return now;
}

// Calculates the expiration time for an email verification token (24 hours from now)
export function getEmailVerificationExpiry(): Date {
    const now = new Date();
    now.setHours(now.getHours() + 24); // Token expires in 24 hours
    return now;
}

// Checks if a given token has expired based on its expiration time
export function isTokenExpired(expiresAt: Date): boolean {
    return new Date() > new Date(expiresAt);
}