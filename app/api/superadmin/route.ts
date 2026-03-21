import { connection, NextRequest, NextResponse } from 'next/server';
import { authenticate, authorizeRole } from '@/lib/auth/middleware';
import { connectDB } from '@/lib/mongodb';
import User from '@/lib/models/User';

// This API route is designed for superadmins. It first authenticates the user making the request and then checks if they have the 'superadmin' role. If the user is authorized, it connects to the database, retrieves all users (excluding their passwords), and returns a welcome message along with the user's information and some system statistics. If authentication or authorization fails, it returns an appropriate error message.
export async function GET (request: NextRequest) {
    try {
        
        // Authenticate the user making the request
        const user = await authenticate(request);

        // Authorize the user to ensure they have the 'superadmin' role
        if (!authorizeRole(user, ['superadmin'])) {
            return NextResponse.json(
                {error: 'Access denied. Superadmins only.'},
                {status: 403}
            );
        }

        // Connect to the database before performing any operations
        await connectDB();

        // Retrieve all users from the database, excluding their passwords for security reasons
        const allUsers = await User.find({}, '-password'); // Exclude password field

        // Return a welcome message along with the user's information and some system statistics
        return NextResponse.json({
            message: 'Welcome, superadmin!',
            users: {
                id: user!.userId,
                email: user!.email,
                role: user!.role,
                users: allUsers
            },
            // Include some system statistics in the response
            data: {
                totalUsers: allUsers.length,
                users: allUsers,
                systemStats: {
                   students: allUsers.filter(u => u.role === 'student').length,
                   instructors: allUsers.filter(u => u.role === 'instructor').length,
                   custodians: allUsers.filter(u => u.role === 'custodian').length,
            },
            }
        });
        
    // Catch and handle any errors that occur during the process
    } catch (error:any) {
        return NextResponse.json(
            {error: 'An error occurred.'},
            {status: 500}
        );
    }
}