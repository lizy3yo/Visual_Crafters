import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/lib/models/User';
import PasswordResetToken from '@/lib/models/PasswordResetToken';
import RefreshToken from '@/lib/models/RefreshToken';
import { hashPassword } from '@/lib/auth/password';
import { isTokenExpired } from '@/lib/auth/token';

// This API route handles password reset requests. It validates the reset token, checks if it's expired or already used, hashes the new password, updates the user's password, marks the token as used, and revokes all refresh tokens to log the user out of all devices.
export async function POST(request: NextRequest) {
  try {
    // Connect to the database before performing any operations
    await connectDB();

    // Parse the request body to extract the reset token and new password
    const body = await request.json();
    const { token, newPassword } = body;

    // Validate input
    if (!token || !newPassword) {
      return NextResponse.json(
        { error: 'Token and new password are required' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Find reset token
    const resetToken = await PasswordResetToken.findOne({ token });

    if (!resetToken) {
      return NextResponse.json(
        { error: 'Invalid reset token' },
        { status: 400 }
      );
    }

    // Check if already used
    if (resetToken.used) {
      return NextResponse.json(
        { error: 'This reset link has already been used' },
        { status: 400 }
      );
    }

    // Check if expired
    if (isTokenExpired(resetToken.expiresAt)) {
      return NextResponse.json(
        { error: 'This reset link has expired' },
        { status: 400 }
      );
    }

    // Find user
    const user = await User.findById(resetToken.userId);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update user password
    user.password = hashedPassword;
    user.updatedAt = new Date();
    await user.save();

    // Mark token as used (one-time use)
    resetToken.used = true;
    await resetToken.save();

    // Revoke all refresh tokens (logout from all devices)
    await RefreshToken.updateMany(
      { userId: user._id.toString() },
      { $set: { isRevoked: true } }
    );

    // Log the successful password reset for debugging purposes
    console.log(`Password reset successful for user: ${user.email}`);

    // Return success response
    return NextResponse.json({
      message: 'Password reset successful. Please login with your new password.',
    });

    // Catch and handle any errors that occur during the process
  } catch (error: any) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}