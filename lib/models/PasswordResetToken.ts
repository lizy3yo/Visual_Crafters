import mongoose, { Schema, Model } from 'mongoose';
import { IPasswordResetToken } from '@/types';

const PasswordResetTokenSchema = new Schema<IPasswordResetToken>({
  userId: {
    type: String,
    required: true,
    index: true, // For faster lookups
  },
  token: {
    type: String,
    required: true,
    unique: true,
    index: true, // For faster lookups
  },
  expiresAt: {
    type: Date,
    required: true,
    index: true, // TTL index for auto-deletion
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  used: {
    type: Boolean,
    default: false,
  },
});

// Automatically delete expired tokens after 1 day
PasswordResetTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 86400 });

const PasswordResetToken: Model<IPasswordResetToken> =
  mongoose.models.PasswordResetToken ||
  mongoose.model<IPasswordResetToken>('PasswordResetToken', PasswordResetTokenSchema);

export default PasswordResetToken;