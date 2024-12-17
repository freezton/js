import { UserResponse } from '@/dto/user/response';
import jwt from 'jsonwebtoken';

export const generateRefreshToken = (user: UserResponse): string => {
	return jwt.sign(user, process.env.TOKEN_SECRET as string, { expiresIn: process.env.REFRESH_TOKEN_EXPIRATION });   
};