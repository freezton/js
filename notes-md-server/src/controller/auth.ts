import { Request, Response } from "express";
import { HttpStatus } from "http-status-ts";
import { UserRequest } from "@/dto/user/request";
import AuthService from "@/service/auth";
import { InvalidTokenError } from "@/error/invalidTokenError";
import { appendAccessTokenCookie } from "@/utils/appendAccessTokenCookie";
import { appendRefreshTokenCookie } from "@/utils/appendRefreshTokenCookie";
import { AuthError } from "@/error/authError";
import auth from '@/service/auth';

class AuthController {
	async signUp(req: Request, res: Response) {
		console.log("controller");
		try {
			const userLogs: UserRequest = req.body;
			await AuthService.signUp(userLogs);
			res.status(HttpStatus.CREATED).send();
		} catch (e: unknown) {
			res
				.status(
					e instanceof AuthError
						? HttpStatus.UNAUTHORIZED
						: HttpStatus.BAD_REQUEST
				)
				.json((e as Error).message)
				.send();
		}
	}

	async signIn(req: Request, res: Response) {
		try {
			const userLogs: UserRequest = req.body;
			const [refreshToken, accessToken, user] = await AuthService.signIn(
				userLogs
			);
			appendAccessTokenCookie(res, accessToken);
			appendRefreshTokenCookie(res, refreshToken);
			res.status(HttpStatus.CREATED).json(user).send();
		} catch (e: unknown) {
			res
				.status(
					e instanceof AuthError
						? HttpStatus.UNAUTHORIZED
						: HttpStatus.BAD_REQUEST
				)
				.json((e as Error).message)
				.send();
		}
	}

	async refreshAccessToken(req: Request, res: Response) {
		const refreshToken =
			req.cookies[process.env.REFRESH_TOKEN_COOKIE_NAME as string];
		const accessToken =
			req.cookies[process.env.ACCESS_TOKEN_COOKIE_NAME as string];
		try {
			const newAccessToken = await AuthService.refreshAccessToken(refreshToken, accessToken);
			res.clearCookie(process.env.ACCESS_TOKEN_COOKIE_NAME as string)
			appendAccessTokenCookie(res, newAccessToken);
			res
				.status(HttpStatus.OK)
				.send();
			} catch (e: unknown) {
				res
				.status(HttpStatus.UNAUTHORIZED)
				.clearCookie(process.env.REFRESH_TOKEN_COOKIE_NAME as string)
				.clearCookie(process.env.ACCESS_TOKEN_COOKIE_NAME as string)
				.json((e as Error).message)
				.send();
		}
	}

	async revokeToken(req: Request, res: Response) {
		const refreshToken =
			req.cookies[process.env.REFRESH_TOKEN_COOKIE_NAME as string];
		const accessToken =
			req.cookies[process.env.ACCESS_TOKEN_COOKIE_NAME as string];
		await AuthService.signOut(refreshToken, accessToken);
		try {
			res
				.status(HttpStatus.OK)
				.clearCookie(process.env.REFRESH_TOKEN_COOKIE_NAME as string)
				.clearCookie(process.env.ACCESS_TOKEN_COOKIE_NAME as string)
				.json()
				.send();
		} catch (e: unknown) {
			res
				.status(HttpStatus.BAD_REQUEST)
				.json((e as Error).message)
				.send();
		}
	}
}

export default new AuthController();
