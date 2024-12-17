import { Routes } from '@/constants/routes';
import { Response } from 'express';

export const appendAccessTokenCookie = (res: Response, token: string) => {
	res.cookie(process.env.ACCESS_TOKEN_COOKIE_NAME as string, token, {
		httpOnly: true,
		secure: false,
		sameSite: 'strict',
		maxAge: Number(process.env.ACCESS_TOKEN_MAX_AGE) * 1000,
	});
};