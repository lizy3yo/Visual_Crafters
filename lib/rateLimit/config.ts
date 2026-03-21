import { RateLimitRules } from '@/types';

export const RATE_LIMIT_RULES: RateLimitRules = {

    'auth:login': {
        windowMs: 15 * 60 * 1000, // 15 minutes
        maxRequests: 5, // limit each IP to 5 login attempts per windowMs
        message: 'Too many login attempts, please try again after 15 minutes.',
    },
    'auth:register': {
        windowMs: 60 * 60 * 1000, // 1 hour
        maxRequests: 10, // limit each IP to 10 registration attempts per windowMs
        message: 'Too many registration attempts, please try again after 1 hour.',
    },
    'auth:refresh': {
        windowMs: 60 * 60 * 1000, // 1 hour
        maxRequests: 10, // limit each IP to 10 token refresh attempts per windowMs
        message: 'Too many token refresh attempts, please try again after 1 hour.',
    },
    'auth:password-reset': {
        windowMs: 60 * 60 * 1000, // 1 hour
        maxRequests: 5, // limit each IP to 5 password reset attempts per windowMs
        message: 'Too many password reset attempts, please try again after 1 hour.',
    },
    'api-general': {
        windowMs: 60 * 60 * 1000, // 1 hour
        maxRequests: 1000, // limit each IP to 1000 requests per windowMs
        message: 'Too many requests, please try again after 1 hour.',
    },
    'api:read': {
        windowMs: 60 * 1000, // 1 minute
        maxRequests: 100, // limit each IP to 100 read requests per windowMs
        message: 'Too many read requests, please try again after 1 minute.',
    },
    'api:admin': {
        windowMs: 60 * 1000, // 1 minute
        maxRequests: 200,
        message: 'Too many admin requests, please try again after 1 minute.',
    },
};

export function getRateLimitConfig(ruleName: string) {
    return RATE_LIMIT_RULES[ruleName] || RATE_LIMIT_RULES['api-general'];
}