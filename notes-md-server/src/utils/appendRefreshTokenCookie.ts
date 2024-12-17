import { Routes } from '@/constants/routes';
import { Response } from 'express';

export const appendRefreshTokenCookie = (res: Response, token: string) => {
	res.cookie(process.env.REFRESH_TOKEN_COOKIE_NAME as string, token, {
		httpOnly: true,
		secure: false,
		sameSite: 'strict',
		maxAge: Number(process.env.REFRESH_TOKEN_MAX_AGE) * 1000,
	});
};