import { MODELS } from '@/constants/models';
import { User } from '@/entity/user';
import mongoose, { Model, Schema } from 'mongoose';

type UserModel = Model<User>;

const UserSchema = new Schema<User, UserModel>({
    id: { type: String, index: true },
    login: {
        type: String,
        required: true,
        index: {
            unique: true,
        },
    },
    password: { type: String, required: true },
});

export const UserRepo = mongoose.model(MODELS.USER, UserSchema);