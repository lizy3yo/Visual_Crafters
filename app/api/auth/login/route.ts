import { NextRequest, NextResponse } from 'next/server';;
import { connectDB } from '@/lib/mongodb';
import User from '@/lib/models/User';
import RefreshToken from '@/lib/models/RefreshToken';
import { verifyPassword } from '@/lib/auth/password';
import { 
    createAccessToken,
    createRefreshToken,
    getTokenExpiry,
    getRefreshTokenExpiry
 } from '@/lib/auth/jwt';
import { UserResponse } from '@/types';
import { rateLimit } from '@/lib/rateLimit/middleware';
import { error } from 'console';
import { access } from 'fs';

// This API route handles user login. It validates the input, checks the user's credentials, and returns a JWT token along with the user information (excluding the password) upon successful authentication.
export async function POST(request: NextRequest) {
    try {

        // Apply rate limiting to the login route to prevent brute-force attacks
        const rateLimitResult = await rateLimit(request, 'auth:login');
        if (!rateLimitResult.allowed) {
            return rateLimitResult.response!;
        }

        // Connect to the database before performing any operations
        await connectDB();

        // Parse the request body to extract email and password
        const body = await request.json();
        const {email, password} = body;

        // Validate the required fields
        if (!email || !password) {
            return NextResponse.json(
                {error: 'Email and password are required.'},
                {status: 400}
            );
        }

        // Check if a user with the provided email exists
        const user = await User.findOne({email: email.toLowerCase()});
        if (!user) {
            return NextResponse.json(
                {error: 'Invalid email or password.'},
                {status: 401}
            );
        }

        // Verify the provided password against the stored hashed password
        const isPasswordValid = await verifyPassword(password, user.password);
        if (!isPasswordValid) {
            return NextResponse.json(
                {error: 'Invalid email or password.'},
                {status: 401}
            );
        }

        // Create a JWT token with user information
        const accessToken = createAccessToken({
            userId: user._id.toString(),
            email: user.email,
            role: user.role
        });

        // Create a refresh token and store it in the database
        const refreshTokenString = createRefreshToken();

        // Store the refresh token in the database with an association to the user and an expiration date
        await RefreshToken.create({
            userId: user._id.toString(),
            token: refreshTokenString,
            expiresAt: getRefreshTokenExpiry(),
            isRevoked: false,
        });

        // Get the token expiry time to include in the response
        const expiry = getTokenExpiry();
        
        // Prepare the user response object, excluding sensitive information like the password
        const userResponse: UserResponse = {
            id: user._id.toString(),
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role
        };

        // Return the user information and JWT token in the response
        return NextResponse.json({
            message: 'Login successful.',
            user: userResponse,
            accessToken,
            refreshToken: refreshTokenString,
            expiresIn: expiry,
        });        
    
    // Catch and handle any errors that occur during the login process
    } catch (error:any){
        console.error('Error during login:', error);
        return NextResponse.json(
            {error: 'An error occurred during login.'},
            {status: 500}
        );
    }
}