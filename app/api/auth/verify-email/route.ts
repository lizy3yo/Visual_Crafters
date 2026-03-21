import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/lib/models/User';
import { isTokenExpired } from '@/lib/auth/token';

// This API route handles email verification. It checks the provided token, verifies the user's email if the token is valid and not expired, and returns an appropriate response based on the outcome of the verification process.
export async function GET(request: NextRequest) {
  try {
    // Connect to the database before performing any operations
    await connectDB();

    // Extract the verification token from the query parameters
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    // Validate the presence of the token
    if (!token) {
      return NextResponse.json(
        { error: 'Verification token is required' },
        { status: 400 }
      );
    }

    // Find user with this verification token
    const user = await User.findOne({
      'emailVerificationToken.token': token,
    });

    // If no user is found, the token is invalid
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid verification token' },
        { status: 400 }
      );
    }

    // Check if already verified
    if (user.emailVerified) {
      return NextResponse.json({
        message: 'Email already verified',
        alreadyVerified: true,
      });
    }

    // Check if token expired
    if (user.emailVerificationToken && isTokenExpired(user.emailVerificationToken.expiresAt)) {
      return NextResponse.json(
        { error: 'Verification token has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    // Mark email as verified
    user.emailVerified = true;
    user.emailVerificationToken = null; // Remove token
    user.updatedAt = new Date();
    await user.save();

    // Log the successful email verification for debugging purposes
    console.log(`Email verified for user: ${user.email}`);

    // Return success response
    return NextResponse.json({
      message: 'Email verified successfully! You can now access all features.',
      user: {
        id: user._id.toString(),
        email: user.email,
        emailVerified: true,
      },
    });

    // Catch and handle any errors that occur during the process
  } catch (error: any) {
    console.error('Verify email error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}