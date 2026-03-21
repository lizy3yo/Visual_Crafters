import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/lib/models/User';
import RefreshToken from '@/lib/models/RefreshToken';
import { createAccessToken, getTokenExpiry } from '@/lib/auth/jwt';

// This API route handles token refresh requests. It validates the provided refresh token, checks if it is valid and not expired, and if so, generates a new access token for the user. If the refresh token is invalid, expired, or revoked, it returns an appropriate error message.
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

        // Check if the provided refresh token exists in the database
        const storedToken = await RefreshToken.findOne({
            token: refreshToken,
        });

        // If the refresh token is not found in the database, return an error response
        if (!storedToken) {
            return NextResponse.json(
                { error: 'Invalid refresh token.' },
                { status: 401 }
            );
        }  

        // Check if the refresh token has expired by comparing its expiry date with the current date
        if (storedToken.expiresAt < new Date()) {

            await RefreshToken.deleteOne({ _id: storedToken._id });
            return NextResponse.json(
                { error: 'Refresh token has expired.' },
                { status: 401 }
            );
        }

        // Check if the refresh token has been revoked (e.g., due to logout or security reasons)
        if (storedToken.isRevoked) {
            return NextResponse.json(
                { error: 'Refresh token has been revoked.' },
                { status: 401 }
            );
        }
       
        // If the refresh token is valid, generate a new access token for the user associated with the refresh token
        const user = await User.findById(storedToken.userId);
            if (!user) {
                return NextResponse.json(
                    { error: 'User not found.' },
                    { status: 404 }
                );
            }
        
        // Create a new access token with the user's information (excluding sensitive data like password)
        const newAccessToken = createAccessToken({
            userId: user._id.toString(),
            email: user.email,
            role: user.role
        });

        // Return the new access token along with its expiry time in the response
        return NextResponse.json({
            message: 'Access token refreshed successfully.',
            accessToken: newAccessToken,
            expiresIn: getTokenExpiry().accessTokenExpiresIn,
        });

        // Catch and handle any errors that occur during the token refresh process
    } catch (error: any) {
        console.error('Error in token refresh:', error);
        return NextResponse.json(
            { error: 'An error occurred while refreshing the token.' },
            { status: 500 }
        );
    }
}