import { Redis as UpstashRedis } from '@upstash/redis';
import IORedis from 'ioredis';

// Unified interface for both Redis clients
type RedisClient = UpstashRedis | IORedis;

declare global {
    var _redis: RedisClient | undefined;
    var _redisType: 'upstash' | 'local' | undefined;
}

function getRedisClient(): RedisClient {
    if (global._redis) {
        return global._redis;
    }

    // Use Upstash if credentials are provided, otherwise use local Redis
    const useUpstash = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN;

    if (useUpstash) {
        const client = new UpstashRedis({
            url: process.env.UPSTASH_REDIS_REST_URL!,
            token: process.env.UPSTASH_REDIS_REST_TOKEN!,
        });
        global._redis = client;
        global._redisType = 'upstash';
        console.log('Upstash Redis client initialized');
        return client;
    }

    // Local Redis via ioredis
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    const client = new IORedis(redisUrl, {
        maxRetriesPerRequest: 3,
        retryStrategy(times) {
            const delay = Math.min(times * 50, 2000);
            return delay;
        },
        lazyConnect: true,
    });

    client.on('connect', () => console.log('Connected to local Redis'));
    client.on('error', (err) => console.error('Local Redis Error:', err));

    global._redis = client;
    global._redisType = 'local';
    console.log('Local Redis client initialized');
    return client;
}

export const redis = getRedisClient();
export const isUpstash = () => global._redisType === 'upstash';

export async function testRedisConnection(): Promise<boolean> {
    try {
        await redis.ping();
        return true;
    } catch (error) {
        console.error('Error testing Redis connection:', error);
        return false;
    }
}