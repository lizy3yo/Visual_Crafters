import { NextRequest, NextResponse } from 'next/server';
import { authenticate, authorizeRole } from '@/lib/auth/middleware';

// This API route is designed for instructors. It first authenticates the user making the request and then checks if they have the 'instructor' role. If the user is authorized, it returns a welcome message along with the user's information. If authentication or authorization fails, it returns an appropriate error message.
export async function GET (request: NextRequest) {
    try {
    
    // Authenticate the user making the request
    const user = await authenticate(request);

    // Authorize the user to ensure they have the 'instructor' role
    if (!authorizeRole(user, ['instructor'])) {
        return NextResponse.json(
            {error: 'Access denied. instructors only.'},
            {status: 403}
        );
    }

    // If authentication and authorization are successful, return a welcome message
    return NextResponse.json({
        message: 'Welcome, instructor!',
        user: {
            id: user!.userId,
            email: user!.email,
            role: user!.role
        }
        });
    
    // Catch and handle any errors that occur during the process
    } catch (error:any) {
        return NextResponse.json(
            {error: 'An error occurred.'},
            {status: 500}
        );
    }
}