import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import RefreshToken from '@/lib/models/RefreshToken';

// This API route handles user logout. It validates the provided refresh token and marks it as revoked in the database, effectively logging the user out. If the refresh token is invalid or an error occurs during the process, it returns an appropriate error message.
export async function POST(request: NextRequest) {
    try {

        // Connect to the database before performing any operations
        await connectDB();

        // Parse the request body to extract the refresh token
        const body = await request.json();
        const { refreshToken } = body;

        // Validate that the refresh token is provided in the request
        if (!refreshToken) {
            return NextResponse.json(
                { error: 'Refresh token is required.' },
                { status: 400 }
            );
        }

        // Mark the provided refresh token as revoked in the database to log the user out
        const result = await RefreshToken.updateOne(
            { token: refreshToken },
            { $set: { isRevoked: true } }
        );

        // If no documents were modified, it means the refresh token was not found or already revoked, so return an error response
        if (result.modifiedCount === 0) {
            return NextResponse.json(
                { error: 'Invalid refresh token.' },
                { status: 400 }
            );
        }

        // Return a success message in the response
        return NextResponse.json({
            message: 'Logged out successfully.'
        });
        
   // Catch and handle any errors that occur during the logout process 
   } catch (error: any) {
        console.error('Error in logout:', error);
        return NextResponse.json(
            { error: 'An error occurred during logout.' },
            { status: 500 }
        );
   }
}