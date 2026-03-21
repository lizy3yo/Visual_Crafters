import mongoose, { Schema, Model } from 'mongoose';
import { IRefreshToken } from '@/types';

const RefreshTokenSchema = new Schema<IRefreshToken>({
    userId: {
        type: String,
        required: true,
        ref: 'User'
    },
    token: {
        type: String,
        required: true,
        unique: true,
    },
    expiresAt: {
        type: Date,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    isRevoked: {
        type: Boolean,
        default: false
    },
});

RefreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const RefreshToken: Model<IRefreshToken> =
    mongoose.models.RefreshToken ||
    mongoose.model<IRefreshToken>('RefreshToken', RefreshTokenSchema);

export default RefreshToken;