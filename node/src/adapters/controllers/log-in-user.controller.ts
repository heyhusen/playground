import { BadRequestException } from '../../core/exceptions/bad-request.exception';
import type { LogInDto } from '../../core/interfaces/auth.interface';
import type { HashService } from '../../core/interfaces/hash.interface';
import type { RedisService } from '../../core/interfaces/redis.interface';
import type { TokenService } from '../../core/interfaces/token.interface';
import type { UserRepository } from '../../core/interfaces/user.interface';
import { logInUser } from '../../core/use-cases/log-in-user.use-case';
import type { AuthResponse } from '../interfaces/auth.interface';
import type { ResponseModel } from '../interfaces/common.interface';
import type { HttpRequestBody } from '../interfaces/http.interface';

export function logInUserController(
	userRepository: UserRepository,
	hashService: HashService,
	tokenService: TokenService,
	redisService: RedisService,
	expiresIn: number
): (req: HttpRequestBody<LogInDto>) => Promise<ResponseModel<AuthResponse>> {
	return async (
		req: HttpRequestBody<LogInDto>
	): Promise<ResponseModel<AuthResponse>> => {
		if (!req.body) {
			throw new BadRequestException('Request body is empty.');
		}

		const { username, password } = req.body;

		const data = await logInUser(
			{ username, password },
			userRepository,
			hashService,
			tokenService,
			redisService,
			expiresIn
		);

		return {
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
	};
}
