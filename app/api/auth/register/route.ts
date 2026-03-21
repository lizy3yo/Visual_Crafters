import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/lib/models/User';
import { hashPassword } from '@/lib/auth/password';
import RefreshToken from '@/lib/models/RefreshToken';
import { 
    createAccessToken,
    createRefreshToken,
    getTokenExpiry,
    getRefreshTokenExpiry
 } from '@/lib/auth/jwt';
import { UserRole, UserResponse } from '@/types';
import { error } from 'console';
import { rateLimit } from '@/lib/rateLimit/middleware';
import { sendEmail } from '@/lib/email/nodemailer';
import { getEmailVerificationTemplate } from '@/lib/email/templates/emailVerification';
import { generateSecureToken, getEmailVerificationExpiry } from '@/lib/auth/token';

// This API route handles user registration. It validates the input, checks for existing users, hashes the password, creates a new user in the database, and returns a JWT token along with the user information (excluding the password).
export async function POST  (request: NextRequest) {
    try{

        const rateLimitResult = await rateLimit(request, 'auth:register');
        if (!rateLimitResult.allowed) {
            return rateLimitResult.response!;
        }
        
        // Connect to the database before performing any operations
        await connectDB();

        // Parse the request body to extract email, password, name, and role
        const body = await request.json();
        const { firstName, lastName, email, password, year_level, block, role, agreement } = body;
        const userRole: UserRole = role || 'student';

        // Validate the required fields
        if (!firstName || !lastName || !email || !password) {
            return NextResponse.json(
                { error: 'First name, last name, email, and password are required.' },
                { status: 400 }
            );
        }

        // Additional validation for student-specific fields
        if (userRole === 'student') {
            if (!year_level || !block || agreement !== true) {
                return NextResponse.json(
                    { error: 'Year level, block, and agreement are required for students.' },
                    { status: 400 }
                );
            }
        }
            
        // Check if a user with the provided email already exists
        const existingUser = await User.findOne({email: email.toLowerCase()});
        if (existingUser) {
            return NextResponse.json(
                {error: 'User already exists.'},
                {status: 400}
            );
        }
        
        // Validate password strength
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(password)) {
            return NextResponse.json(
                { error: 'Password must be at least 8 characters long and include uppercase letters, lowercase letters, numbers, and special characters.' },
                { status: 400 }
            );
        }

        // Additional email validation for students
        if(userRole === 'student') {
        const emailRegex = /^[0-9]{9}@gordoncollege\.edu\.ph$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: 'Email must be a valid Gordon College address (e.g., 1929183@gordoncollege.edu.ph).' },
                { status: 400 }
            );
        }
      }

        // Hash the password before storing it in the database
        const hashedPassword = await hashPassword(password);

        const verificationToken = generateSecureToken();
        const verificationExpiry = getEmailVerificationExpiry();

        // Create a new user document in the database
        const userData: any = {
            email: email.toLowerCase(),
            password: hashedPassword,
            firstName,
            lastName,
            role: userRole,
            emailVerified: false,
            emailVerificationToken: {
                token: verificationToken,
                expiresAt: verificationExpiry
            }
        };

        
        // If the user role is 'student', include additional fields specific to students
        if (userRole === 'student') {
            userData.year_level = year_level;
            userData.block = block;
            userData.agreement = agreement;
        }

        // Save the new user to the database
        const newUser = await User.create(userData);     

        // Generate the email verification link and send the verification email to the user
        const appUrl = process.env.APP_URL || 'http://localhost:3000';
        const verificationLink = `${appUrl}/verify-email?token=${verificationToken}`;

        // Create the email verification template
        const { html, text } = getEmailVerificationTemplate(
        newUser.firstName,
        verificationLink,
        24 // 24 hours
        );

        // Send email (don't block registration if email fails)
        sendEmail(
        newUser.email,
        'Verify Your Email - CHTM Cooks',
        html,
        text
        ).catch(error => {
        console.error('Failed to send verification email:', error);
        });

        // Create a JWT token with user information
        const accessToken = createAccessToken({
            userId: newUser._id.toString(),
            email: newUser.email,
            role: newUser.role
        });

        // Create a refresh token and store it in the database
        const refreshTokenString = createRefreshToken();

        // Store the refresh token in the database with an association to the user and an expiration date
        await RefreshToken.create({
            userId: newUser._id.toString(),
            token: refreshTokenString,
            expiresAt: getRefreshTokenExpiry(),
            isRevoked: false,
        });

        // Get the token expiry time to include in the response
        const expiry = getTokenExpiry();
        
        // Prepare the user response object, excluding sensitive information like the password
        const userResponse: UserResponse = {
            id: newUser._id.toString(),
            email: newUser.email,
            firstName: newUser.firstName,
            lastName: newUser.lastName,
            role: newUser.role
        };

        // Return a success response with the user information and JWT token
        return NextResponse.json(
            {
                message: 'User created successfully.',
                user: userResponse,
                accessToken,
                refreshToken: refreshTokenString,
                expiresIn: expiry
            },
            {status: 201}
        );

    // Catch and handle any errors that occur during the registration process
    } catch (error:any) {
        console.error('Error in registration:', error);
        return NextResponse.json(
            {error: 'An error occurred during registration.'},
            {status: 500}
        );
    }
}