import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/lib/models/User';
import PasswordResetToken from '@/lib/models/PasswordResetToken';
import { sendEmail } from '@/lib/email/nodemailer';
import { getPasswordResetEmailTemplate } from '@/lib/email/templates/passwordReset';
import { generateSecureToken, getPasswordResetExpiry } from '@/lib/auth/token';
import { rateLimit } from '@/lib/rateLimit/middleware';


export async function POST(request: NextRequest) {
    try {
        // Rate limit to prevent abuse of the password reset endpoint
        const rateLimitResult = await rateLimit(request, 'auth:password-reset');

        // If rate limiting fails, return the response
        if (!rateLimitResult.allowed) {
            return rateLimitResult.response!;
        }

        // Connect to the database
        await connectDB();

        // Parse the request body to get the email
        const body = await request.json();
        const { email } = body;

        // Validate the email
        if (!email) {
            return NextResponse.json(
                { error: 'Email is required.' },
                { status: 400 }
            );
        }

        // Regular expression to validate email format
       const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
       if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: 'Please provide a valid email address.' },
                { status: 400 }
            );
       }


       // Find the user by email (case-insensitive)
       const user = await User.findOne({ email: email.toLowerCase() });

       // If user is not found, return a generic success message to prevent email enumeration
       if (!user) {
        await new Promise(resolve => setTimeout(resolve, 300));

        return NextResponse.json(
            { message: 'If an account with that email exists, a password reset link has been sent.' },
            { status: 200 }
        );
       }

       // Generate a secure token and calculate the expiry time
       const token = generateSecureToken();
       const expiresAt = getPasswordResetExpiry();

       // Invalidate any existing unused tokens for this user
       await PasswordResetToken.updateMany(
        { userId: user._id.toString(), used: false },
        { $set: { used: true } }
       );

       // Create a new password reset token in the database
       await PasswordResetToken.create({
        userId: user._id.toString(),
        token,
        expiresAt,
        used: false
       });

       // Construct the password reset link
       const appUrl = process.env.APP_URL || 'http://localhost:3000';
       const resetLink = `${appUrl}/reset-password?token=${token}`;

       const {html, text} = getPasswordResetEmailTemplate(
        user.firstName,
        resetLink,
        30
       );

       // Send the password reset email (don't block the response if email fails)
       const emailResult = await sendEmail(
        user.email,
        'CHTM Cooks - Password Reset Request',
        html,
        text
       );

       // Log any email sending errors for debugging purposes
       if (!emailResult.success) {
        console.error('Error sending password reset email:', emailResult.error);
       }

       // Return a generic success message to prevent email enumeration
       return NextResponse.json(
        { message: 'If an account with that email exists, a password reset link has been sent.' },
        { status: 200 }
       );

       // Catch and handle any errors that occur during the process
    } catch (error:any) {
        console.error('Error in password reset request:', error);
        return NextResponse.json(
            { error: 'An error occurred while processing your request.' },
            { status: 500 }
        );
    }
}