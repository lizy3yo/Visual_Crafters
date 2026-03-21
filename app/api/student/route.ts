import { NextRequest, NextResponse } from 'next/server';
import { authenticate, authorizeRole } from '@/lib/auth/middleware';
import { rateLimit } from '@/lib/rateLimit/middleware';


export async function GET (request: NextRequest) {
    try {
    
    // Authenticate the user making the request
    const user = await authenticate(request);

    const rateLimitResult = await rateLimit(request, 'api:read', user);
    if (!rateLimitResult.allowed) {
        return rateLimitResult.response!;
    }

    // Authorize the user to ensure they have the 'student' role
    if (!authorizeRole(user, ['student'])) {
        return NextResponse.json(
            {error: 'Unauthorized'},
            {status: 401}
        );
    }

    // If authentication and authorization are successful, return a welcome message
    return NextResponse.json({
        message: 'Welcome, student!',
        user: {
            id: user!.userId,
            email: user!.email,
            role: user!.role
        }
    });

    // Catch and handle any errors that occur during the process
    } catch (error:any) {
        console.error('Error in student route:', error);
        return NextResponse.json(
            {error: 'An error occurred.'},
            {status: 500}
        );
    }
}