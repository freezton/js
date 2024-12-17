import { UserRequest } from "@/dto/user/request";
import { UserResponse } from "@/dto/user/response";
import { SignInResponse } from "@/dto/user/signInResponse";
import { AuthError } from "@/error/authError";
import { UserRepo } from "@/repository/userRepo";
import { AccessTokenRepo } from "@/repository/accessTokenRepo";
import { RefreshTokenRepo } from "@/repository/refreshTokenRepo";
import { InvalidTokenError } from "@/error/invalidTokenError";
import { generateRefreshToken } from "@/utils/generateRefreshToken";
import { generateAccessToken } from "@/utils/generateAccessToken";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const saltRounds = 10;

class AuthService {
	async signUp(user: Readonly<UserRequest>): Promise<void> {
		const currentUser = await UserRepo.findOne({
			login: { $eq: user.login },
		});

		if (currentUser) {
			throw new AuthError("This username already taken");
		}

		const hashedPassword = await bcrypt.hash(user.password, saltRounds);
		await UserRepo.create({
			...user,
			password: hashedPassword,
		});
	}

	async signIn({
		login,
		password,
	}: UserRequest): Promise<Readonly<[string, string, SignInResponse]>> {
		const currentUser = await UserRepo.findOne({
			login,
		});

		if (!currentUser) {
			throw new AuthError("User does not exist");
		}
		const passwordMatch = await bcrypt.compare(password, currentUser.password);
		if (!passwordMatch) {
			throw new Error("Incorrect password");
		}

		const userId = currentUser._id.valueOf() as string;
		const userResponse: SignInResponse = {
			login: currentUser.login,
			id: userId,
		};
		const refreshToken = await RefreshTokenRepo.create({
			active: true,
			token: generateRefreshToken(userResponse),
		});
		const accessToken = await AccessTokenRepo.create({
			active: true,
			token: generateAccessToken(userResponse),
		});

		return [refreshToken.token, accessToken.token, userResponse];
	}

	async validateAccessToken(accessToken: string): Promise<string> {
		const dbAccessToken = await AccessTokenRepo.findOne({
			token: { $eq: accessToken },
		});
		try {
			await jwt.verify(accessToken, process.env.TOKEN_SECRET as string);
			if (dbAccessToken?.active) {
				return accessToken;
			}
			throw new AuthError("Token is not active");
		} catch {
			if (dbAccessToken) {
				await AccessTokenRepo.findOneAndUpdate(
					{ token: { $eq: accessToken } },
					{ active: false }
				);
			}
			throw new AuthError("Token is not active");
		}
	}

	// async refreshAccessToken(refreshToken: string): Promise<string | null> {

	// 	// return accessToken;
	// 	return null;
	// }

	async refreshAccessToken(
		refreshToken: string,
		accessToken: string
	): Promise<string> {
		const dbRefreshToken = await RefreshTokenRepo.findOne({
			token: { $eq: refreshToken },
		});
		try {
			const user: UserResponse = (await jwt.verify(
				refreshToken,
				process.env.TOKEN_SECRET as string
			)) as UserResponse;

			if (dbRefreshToken?.active) {
				await AccessTokenRepo.findOneAndUpdate(
					{ token: { $eq: accessToken } },
					{ active: false }
				);
				const userResponse: UserResponse = { login: user.login };
				const { token: newAccessToken } = await AccessTokenRepo.create({
					active: true,
					token: generateAccessToken(userResponse),
				});
				return newAccessToken;
			}
			throw new InvalidTokenError("Invalid refresh token");
		} catch {
			await RefreshTokenRepo.findOneAndUpdate(
				{ token: { $eq: refreshToken } },
				{ active: false }
			);
			throw new InvalidTokenError("Invalid refresh token");
		}
	}

	async signOut(refreshToken: string, accessToken: string): Promise<void> {
		// await RefreshTokenRepo.findOneAndUpdate(
		// 	{ token: { $eq: refreshToken } },
		// 	{ active: false }
		// );
		await AccessTokenRepo.findOneAndUpdate(
			{ token: { $eq: accessToken } },
			{ active: false }
		);
	}
}

export default new AuthService();
