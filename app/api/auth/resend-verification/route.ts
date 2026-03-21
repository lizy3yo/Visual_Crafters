import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/lib/models/User';
import { authenticate } from '@/lib/auth/middleware';
import { sendEmail } from '@/lib/email/nodemailer';
import { getEmailVerificationTemplate } from '@/lib/email/templates/emailVerification';
import { generateSecureToken, getEmailVerificationExpiry } from '@/lib/auth/token';
import { rateLimit } from '@/lib/rateLimit/middleware';

// This API route allows authenticated users to resend the email verification link. It checks if the user is authenticated, rate limits the requests, generates a new verification token, updates the user's record, and sends a new verification email.
export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const currentUser = await authenticate(request);
    
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Rate limiting
    const rateLimitResult = await rateLimit(request, 'auth:password-reset', currentUser);
    if (!rateLimitResult.allowed) {
      return rateLimitResult.response!;
    }

    await connectDB();

    // Get user from database
    const user = await User.findById(currentUser.userId);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if already verified
    if (user.emailVerified) {
      return NextResponse.json(
        { error: 'Email is already verified' },
        { status: 400 }
      );
    }

    // Generate new token
    const verificationToken = generateSecureToken();
    const verificationExpiry = getEmailVerificationExpiry();

    // Update user with new token
    user.emailVerificationToken = {
      token: verificationToken,
      expiresAt: verificationExpiry,
    };
    user.updatedAt = new Date();
    await user.save();

    // Send verification email
    const appUrl = process.env.APP_URL || 'http://localhost:3000';
    const verificationLink = `${appUrl}/verify-email?token=${verificationToken}`;

    // Create the email verification template
    const { html, text } = getEmailVerificationTemplate(
      user.firstName,
      verificationLink,
      24
    );

    // Send email (don't block response if email fails)
    const emailResult = await sendEmail(
      user.email,
      'Verify Your Email - CHTM Cooks',
      html,
      text
    );

    // Log any email sending errors for debugging purposes
    if (!emailResult.success) {
      return NextResponse.json(
        { error: 'Failed to send verification email. Please try again.' },
        { status: 500 }
      );
    }

    // Return success response
    return NextResponse.json({
      message: 'Verification email sent. Please check your inbox.',
    });

    // Catch and handle any errors that occur during the process
  } catch (error: any) {
    console.error('Resend verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}