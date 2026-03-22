import { NextResponse } from 'next/server';

export async function GET() {
    const results: Record<string, any> = {};

    // 1. Check env vars
    results.env = {
        MONGODB_URI: !!process.env.MONGODB_URI,
        JWT_SECRET: !!process.env.JWT_SECRET,
        UPSTASH_REDIS_REST_URL: !!process.env.UPSTASH_REDIS_REST_URL,
        UPSTASH_REDIS_REST_TOKEN: !!process.env.UPSTASH_REDIS_REST_TOKEN,
    };

    // 2. Test MongoDB
    try {
        const { connectDB } = await import('@/lib/mongodb');
        await connectDB();
        results.mongodb = 'ok';
    } catch (e: any) {
        results.mongodb = { error: e.message };
    }

    // 3. Test Redis
    try {
        const { redis } = await import('@/lib/rateLimit/redis');
        await redis.ping();
        results.redis = 'ok';
    } catch (e: any) {
        results.redis = { error: e.message };
    }

    // 4. Test JWT
    try {
        const { createAccessToken } = await import('@/lib/auth/jwt');
        const token = createAccessToken({ userId: 'test', email: 'test@test.com', role: 'admin' });
        results.jwt = token ? 'ok' : 'failed';
    } catch (e: any) {
        results.jwt = { error: e.message };
    }

    return NextResponse.json(results);
}
