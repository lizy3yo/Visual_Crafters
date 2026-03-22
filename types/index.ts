export type UserRole = 'admin' | 'student';

// This interface represents the structure of a user document in the database, including all relevant fields such as email, password, role, and timestamps for creation and updates
export interface IUser {
    _id: string;
    firstName: string;
    lastName: string;
    email: string
    password: string;
    role: UserRole;
    profilePictureUrl?: string;
    createdAt: Date;
    updatedAt: Date;

    // Additional fields for students
    year_level: number;
    block: string;
    agreement: boolean;

    // Fields for email verification
    emailVerified: boolean;
    emailVerificationToken?: IEmailVerificationToken | null;

}

// This interface represents the structure of a refresh token document in the database, which is used for managing user sessions and token revocation
export interface IRefreshToken {
    _id: string;
    userId: string;
    token: string;
    expiresAt: Date;
    createdAt: Date;
    isRevoked: boolean;
}

// This interface represents the payload of the JWT token, which includes user information that can be used for authentication and authorization
export interface JWTPayload {
    userId: string;
    email: string;
    role: UserRole; 
    type?: 'access' | 'refresh'; // Optional field to differentiate between access and refresh tokens
}

// This interface represents the structure of the response sent to the client after successful authentication, including user information and JWT tokens
export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
    accessTokenExpiresIn: string;
    refreshTokenExpiresIn: string;
}

// This interface is used for sending user data in responses, excluding sensitive information like password
export interface UserResponse {
    id:string;
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
}

// This interface represents the configuration for rate limiting, including the time window, maximum requests allowed, and optional settings for skipping certain types of requests
export interface RateLimitConfig {
    windowMs: number; 
    maxRequests: number;
    message?: string; 
    skipSuccessfulRequests?: boolean; 
    skipFailedRequests?: boolean; 
}

// This interface represents the result of a rate limit check, including whether the request is allowed, the limit and remaining requests, and the time until the limit resets
export interface RateLimitResult {
    allowed: boolean;
    limit: number;
    remaining: number;
    resetTime: Date;
    retryAfter?: number;
}

// This type represents a collection of rate limit rules, where each key is a unique identifier for the rule and the value is the corresponding configuration for that rule
export type RateLimitRules = {
    [key: string]: RateLimitConfig;
};

export interface IPasswordResetToken {
    _id: string;
    userId: string;
    token: string;
    expiresAt: Date;
    createdAt: Date;
    used: boolean;
}

export interface IEmailVerificationToken {
    token: string;
    expiresAt: Date;
}

export interface EmailResult {
    success: boolean;
    message?: string;
    error?: string;
}