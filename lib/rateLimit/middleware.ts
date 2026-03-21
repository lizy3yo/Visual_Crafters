import { NextRequest, NextResponse } from 'next/server';
import {checkRateLimit } from './slidingWindow';
import { getRateLimitConfig } from './config';
import { JWTPayload } from '@/types';
import { get } from 'http';

/**
 * Rate limit middleware for API routes
 * 
 * Usage:
 * const rateLimitResult = await rateLimit(request, 'auth:login', user);
 * if (!rateLimitResult.allowed) {
 *   return NextResponse.json(...)
 * }
 */

export async function rateLimit(
    request: NextRequest,
    rule: string,
    user?: JWTPayload | null
): Promise<{
    allowed: boolean;
    response?: NextResponse;
}> {

    const config = getRateLimitConfig(rule);

    let identifier: string;

    if (user?.userId) {
        identifier = `user:${user.userId}`;
    } else {
        const ip = getClientIp(request);
        identifier = `ip:${ip}`;
    }
    
    const result = await checkRateLimit(identifier, rule, config);

    if (!result.allowed) {

        return {
            allowed: false,
            response: NextResponse.json(
                {
                    error: config.message || 'Too many requests, please try again later.',
                    limit: result.limit,
                    remaining: result.remaining,
                    resetTime: result.resetTime,
                    retryAfter: result.retryAfter,
                },
                {
                    status: 429,
                    headers: {
                        'X-RateLimit-Limit': result.limit.toString(),
                        'X-RateLimit-Remaining': result.remaining.toString(),
                        'X-RateLimit-Reset': result.resetTime.getTime().toString(),
                        'Retry-After': result.retryAfter ?.toString() || '0',
                    },
                }
        ),
        };
}

    return { 
        allowed: true
     };
}

function getClientIp(request: NextRequest): string {
    
    const forwardedFor = request.headers.get('x-forwarded-for');
    if (forwardedFor) {
        return forwardedFor.split(',')[0].trim();
    }

    const realIp = request.headers.get('x-real-ip');
    if (realIp) {
        return realIp;
    }

    return 'unknown';
}


export function addRateLimitHeaders(
    response: NextResponse,
    limit: number,
    remaining: number,
    resetTime: Date
): NextResponse {
    response.headers.set('X-RateLimit-Limit', limit.toString());
    response.headers.set('X-RateLimit-Remaining', remaining.toString());
    response.headers.set('X-RateLimit-Reset', resetTime.getTime().toString());
    return response;
}