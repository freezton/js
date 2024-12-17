import { AccessTokenRepo } from "@/repository/accessTokenRepo";
import { generateAccessToken } from "@/utils/generateAccessToken";
import { appendAccessTokenCookie } from "@/utils/appendAccessTokenCookie";
import { UserResponse } from "@/dto/user/response";
import { UserRepo } from '@/repository/userRepo';
import { NextFunction, Request, Response } from "express";
import { HttpStatus } from "http-status-ts";
import jwt from "jsonwebtoken";

export const authenticateToken = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<any> => {
	
	const refreshToken =
		req.cookies[process.env.REFRESH_TOKEN_COOKIE_NAME as string];
	let accessToken =
		req.cookies[process.env.ACCESS_TOKEN_COOKIE_NAME as string];

	let userLogin: string = ''

	// VALIDATING ACCESS TOKEN
	let isValidAccessToken = true;
	if (accessToken) {
		const dbAccessToken = await AccessTokenRepo.findOne({
			token: { $eq: accessToken },
		});
		if (dbAccessToken) {
			try {
				const payload: any = jwt.verify(accessToken, process.env.TOKEN_SECRET as string);
				userLogin = payload.login;
			} catch {
				isValidAccessToken = false;
				res.clearCookie(process.env.ACCESS_TOKEN_COOKIE_NAME as string);
			}
		} else {
			isValidAccessToken = false;
			res.clearCookie(process.env.ACCESS_TOKEN_COOKIE_NAME as string);
		}
	}
	// REFRESHING ACCESS TOKEN IF REFRESH TOKEN IS PROVIDED
	if (!accessToken || !isValidAccessToken) {
		if (!refreshToken) {
			return res
			.status(401)
			.json({ message: "Unauthorized: No tokens provided" })
			.send();
		}
		try {
			jwt.verify(refreshToken, process.env.TOKEN_SECRET as string);
			const user: UserResponse = {
				login: (
					jwt.verify(
						refreshToken,
						process.env.TOKEN_SECRET as string
					) as UserResponse
				).login,
			};
			userLogin = user.login;
			const { token: newAccessToken } = await AccessTokenRepo.create({
				active: true,
				token: generateAccessToken(user),
			});
			appendAccessTokenCookie(res, newAccessToken);
			console.log('here')
			accessToken = newAccessToken;
		} catch (e: unknown) {
			return res
				.status(HttpStatus.UNAUTHORIZED)
				.json({ message: "Unauthorized: Invalid refresh token" })
				.send();
		}
	}

	if (!accessToken || !refreshToken) {
		return res
			.status(HttpStatus.UNAUTHORIZED)
			.json({ message: "No token provided" })
			.send();
	}

	// ADD USERID IN HEADER
	const currentUser = await UserRepo.findOne({
		login: { $eq: userLogin },
	});
	if (currentUser) {
		req.headers['userId'] = currentUser._id.valueOf() as string;
	} else {
		return res
		.status(HttpStatus.UNAUTHORIZED)
		.json({ message: "No such user" })
		.send();
	}
	return next();
};
