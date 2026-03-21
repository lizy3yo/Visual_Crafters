import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import PasswordResetToken from '@/lib/models/PasswordResetToken';
import { isTokenExpired } from '@/lib/auth/token';

// This API route verifies the validity of a password reset token. It checks if the token exists, whether it has already been used, and if it has expired. Based on these checks, it returns an appropriate response indicating whether the token is valid or not.
export async function GET(request: NextRequest) {
  try {
    // Connect to the database before performing any operations
    await connectDB();

    // Extract the token from the query parameters
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    // Validate the presence of the token
    if (!token) {
      return NextResponse.json(
        { error: 'Token is required', valid: false },
        { status: 400 }
      );
    }

    // Find token in database
    const resetToken = await PasswordResetToken.findOne({ token });

    // Check if token exists
    if (!resetToken) {
      return NextResponse.json(
        { error: 'Invalid reset token', valid: false },
        { status: 400 }
      );
    }

    // Check if already used
    if (resetToken.used) {
      return NextResponse.json(
        { error: 'This reset link has already been used', valid: false },
        { status: 400 }
      );
    }

    // Check if expired
    if (isTokenExpired(resetToken.expiresAt)) {
      return NextResponse.json(
        { error: 'This reset link has expired', valid: false },
        { status: 400 }
      );
    }

    // Token is valid
    return NextResponse.json({
      message: 'Token is valid',
      valid: true,
      expiresAt: resetToken.expiresAt,
    });

    // Catch and handle any errors that occur during the process
  } catch (error: any) {
    console.error('Verify reset token error:', error);
    return NextResponse.json(
      { error: 'Internal server error', valid: false },
      { status: 500 }
    );
  }
}