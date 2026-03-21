import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { JWTPayload } from '@/types';

// Load the JWT secret from environment variables
const JWT_SECRET = process.env.JWT_SECRET!;
const REFRESH_SECRET = process.env.REFRESH_SECRET || JWT_SECRET + '_refresh';

// Ensure that the JWT_SECRET is defined in environment variables
if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables");
}

const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';

// Function to create a JWT token with the given payload
export function createToken(payload: JWTPayload): string {
    const token = jwt.sign(
        payload,
        JWT_SECRET,
        {expiresIn: '1h'} // Token expires in 1 hour
    );
    return token;
}

// Function to verify a JWT token and return the decoded payload if valid, or null if invalid
export function verifyToken(token: string): JWTPayload | null {
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
        return decoded;
    } catch (error) {
        return null;
    }
}

// Function to create an access token with a specific payload, setting the token type to 'access' and using the defined expiry time
export function createAccessToken (payload: Omit<JWTPayload, 'type'>): string {
    const token = jwt.sign(
        { ...payload, type: 'access' },
        JWT_SECRET,
        { expiresIn: ACCESS_TOKEN_EXPIRY }
    );
    return token;
}

// Function to create a refresh token with a specific payload, setting the token type to 'refresh' and using the defined expiry time
export function createRefreshToken(): string {
    return crypto.randomBytes(64).toString('hex');
}

// Function to verify an access token, ensuring that the token is valid and of the correct type ('access'), returning the decoded payload if valid or null if invalid
export function verifyAccessToken (token: string): JWTPayload | null {
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
        
        if (decoded.type !== 'access') {
            return null;
        }

        return decoded;
    }catch (error){
        return null;
    }
}

// Function to verify a refresh token, ensuring that the token is valid and of the correct type ('refresh'), returning the decoded payload if valid or null if invalid
export function getTokenExpiry(){
    return {
        accessTokenExpiresIn: ACCESS_TOKEN_EXPIRY,
        refreshTokenExpiresIn: REFRESH_TOKEN_EXPIRY
    };
}

// Function to calculate the expiry date for a refresh token, setting it to 7 days from the current date
export function getRefreshTokenExpiry(): Date {
    const now = new Date();
    now.setDate(now.getDate() + 7); // Set expiry to 7 days from now
    return now;
}

