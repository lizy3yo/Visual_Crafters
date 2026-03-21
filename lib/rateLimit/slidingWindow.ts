import { redis, isUpstash } from './redis';
import { RateLimitConfig, RateLimitResult } from '@/types';

/**
 * Sliding Window Rate Limiter using Redis (supports both Upstash and local ioredis)
 * 
 * Algorithm:
 * 1. Use Redis Sorted Set (ZSET) to store requests with timestamps as scores
 * 2. Remove old requests outside the window
 * 3. Count remaining requests
 * 4. Check against limit
 * 
 * Redis Key Pattern: "ratelimit:{identifier}:{rule}"
 * Example: "ratelimit:user:123:auth:login"
 */

export async function checkRateLimit(
    identifier: string,
    rule: string,
    config: RateLimitConfig
): Promise<RateLimitResult> {
    const key = `ratelimit:${identifier}:${rule}`;
    const now = Date.now();
    const windowStart = now - config.windowMs;
    const member = `${now}-${Math.random()}`;

    try {
        const pipeline = redis.pipeline();

        pipeline.zremrangebyscore(key, 0, windowStart); // Remove old requests
        pipeline.zcard(key); // Count remaining requests
        
        // Different zadd syntax for Upstash vs ioredis
        if (isUpstash()) {
            (pipeline as any).zadd(key, { score: now, member });
        } else {
            (pipeline as any).zadd(key, now, member);
        }
        
        pipeline.expire(key, Math.ceil(config.windowMs / 1000)); // Set expiry for the key

        const results = await pipeline.exec();

        // Extract count - different result format for Upstash vs ioredis
        let count: number;
        if (isUpstash()) {
            // Upstash returns values directly: [result1, result2, ...]
            count = (results as any[])[1] || 0;
        } else {
            // ioredis returns [error, value] tuples: [[err, val], [err, val], ...]
            count = (results as any[])[1]?.[1] || 0;
        }

        const remaining = Math.max(0, config.maxRequests - count - 1);
        const allowed = count < config.maxRequests;

        const resetTime = new Date(now + config.windowMs);
        const retryAfter = allowed ? 0 : Math.ceil(config.windowMs / 1000);

        return {
            allowed,
            limit: config.maxRequests,
            remaining,
            resetTime,
            retryAfter,
        };
        
    } catch (error) {
        console.error('Error checking rate limit:', error);

        return {
            allowed: true, // Fail open on error
            limit: config.maxRequests,
            remaining: config.maxRequests,
            resetTime: new Date(now + config.windowMs),
        }
    }
}

export async function resetRateLimit(
    identifier: string,
    rule: string
): Promise<void> {
    const key = `ratelimit:${identifier}:${rule}`;
    await redis.del(key);
}

export async function getRateLimitStatus(
    identifier: string,
    rule: string,
    config: RateLimitConfig
): Promise<RateLimitResult> {
    const key = `ratelimit:${identifier}:${rule}`;
    const now = Date.now();
    const windowStart = now - config.windowMs;

    try {
     await redis.zremrangebyscore (key, 0, windowStart);
   
     const count = await redis.zcard(key);

     const remaining = Math.max(0, config.maxRequests - count);
     const allowed = count < config.maxRequests;
     const resetTime = new Date(now + config.windowMs);
     const retryAfter = allowed ? 0 : Math.ceil(config.windowMs / 1000);

     return {
        allowed,
        limit: config.maxRequests,
        remaining, 
        resetTime,
        retryAfter,
     };
    }catch (error) {
        console.error('Error getting rate limit status:', error);
        return {
            allowed: true, // Fail open on error
            limit: config.maxRequests,
            remaining: config.maxRequests,
            resetTime: new Date(now + config.windowMs),
        };
    }
}
