import nodemailer from 'nodemailer';
import { EmailResult } from '@/types';

/**
 * NODEMAILER CONFIGURATION
 * 
 * For development: Use a test service like Ethereal, Mailtrap, or Gmail
 * For production: Use a proper email service like SendGrid, AWS SES, or Postmark
 * 
 * Environment variables needed:
 * - EMAIL_HOST: SMTP server host (e.g., smtp.gmail.com)
 * - EMAIL_PORT: SMTP port (587 for TLS, 465 for SSL)
 * - EMAIL_USER: Your email username
 * - EMAIL_PASSWORD: Your email password or app password
 * - EMAIL_FROM: Sender email address
 */

// Create reusable transporter
const createTransporter = () => {
  // For Gmail example:
  // 1. Enable 2FA on your Google account
  // 2. Generate an "App Password" in Google Account settings
  // 3. Use the app password as EMAIL_PASSWORD
  
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: process.env.EMAIL_PORT === '465', // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
};

/**
 * Send email using Nodemailer
 * 
 * @param to - Recipient email address
 * @param subject - Email subject line
 * @param html - HTML content of the email
 * @param text - Plain text fallback content
 * @returns EmailResult with success status and message
 */
export async function sendEmail(
  to: string,
  subject: string,
  html: string,
  text: string
): Promise<EmailResult> {
  try {
    const transporter = createTransporter();

    // Verify transporter configuration
    await transporter.verify();

    // Send email
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"CHTM Cooks" <noreply@chtmcooks.com>',
      to,
      subject,
      html,
      text,
    });

    console.log('Email sent successfully:', info.messageId);

    return {
      success: true,
      message: `Email sent: ${info.messageId}`,
    };
  } catch (error: any) {
    console.error('Email sending failed:', error);

    return {
      success: false,
      error: error.message || 'Failed to send email',
    };
  }
}

/**
 * Test email configuration (useful for debugging)
 * Run this in a test route to verify your setup
 */
export async function testEmailConfiguration(): Promise<EmailResult> {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    
    return {
      success: true,
      message: 'Email configuration is valid',
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Email configuration is invalid',
    };
  }
}