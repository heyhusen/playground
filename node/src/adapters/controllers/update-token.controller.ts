import type { UserRefreshRequest } from '../../core/interfaces/auth.interface';
import type { RedisService } from '../../core/interfaces/redis.interface';
import type { TokenService } from '../../core/interfaces/token.interface';
import { updateToken } from '../../core/use-cases/update-token.use-case';
import type { AuthResponse } from '../interfaces/auth.interface';
import type { ResponseModel } from '../interfaces/common.interface';
import type { HttpRequestUser } from '../interfaces/http.interface';

export function updateTokenController(
	tokenService: TokenService,
	redisService: RedisService,
	expiresIn: number
) {
	return async (req: HttpRequestUser<UserRefreshRequest>) => {
		const { ...user } = req.user;

		const data = await updateToken(user, tokenService, redisService, expiresIn);

		const result: ResponseModel<AuthResponse> = {
			status: 200,
			cookie: {
				name: 'refresh_token',
				value: data.refreshToken,
				maxAge: expiresIn,
			},
			data: {
				access_token: data.accessToken,
				token_type: 'Bearer',
				expires_in: expiresIn,
				refresh_token: data.refreshToken,
			},
		};

		return result;
	};
}
