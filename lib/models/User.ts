import mongoose, { Schema, Model } from "mongoose";
import { IUser } from "@/types";

const UserSchema = new Schema<IUser>({
    email: {
        type: String,
        required: [true, 'Email is required.'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/\S+@\S+\.\S+/, 'Please use a valid email address.']
    },
    password: {
        type: String,
        required: [true, 'Password is required.'],
    },
    firstName: {
        type: String,
        required: [true, 'First name is required.'],
    },
    lastName: {
        type: String,
        required: [true, 'Last name is required.'],
    },
    profilePictureUrl: {
        type: String,
    },
    role: {
        type: String,
        enum: ['admin', 'student'],
        default: 'student',
        required: [true, 'Role is required.']
    },

    // Additional fields for students
    year_level: {
        type: Number,
        required: function(this: any) {return this.role === 'student';},
    },
    block: {
        type: String,
        required: function(this: any) {return this.role === 'student';},
    },
    agreement: {
        type: Boolean,
        required: function(this: any) {return this.role === 'student';},
    },

    // Fields for email verification
    emailVerified: {
        type: Boolean,
        default: false,
    },
    emailVerificationToken: {
        token: { type: String },
        expiresAt: { type: Date }
    },

    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;