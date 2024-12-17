import { MODELS } from '@/constants/models';
import { Token } from '@/entity/token';
import mongoose, { Model, Schema } from 'mongoose';

type AccessTokenModel = Model<Token>;

const AccessTokenSchema = new Schema<Token, AccessTokenModel>({
    active: { type: Boolean, required: true },
    token: {
        type: String,
        required: true,
        index: {
            unique: true,
        },
    },
});

export const AccessTokenRepo = mongoose.model(MODELS.ACCESS_TOKEN, AccessTokenSchema);