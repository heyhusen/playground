import { AuthException } from '../../core/exceptions/auth.exception';
import type { RedisService } from '../../core/interfaces/redis.interface';
import type { TokenService } from '../../core/interfaces/token.interface';
import { verifyRefreshToken } from '../../core/use-cases/verify-refresh-token.use-case';
import type {
	HttpRequestCookie,
	RefreshTokenCookie,
} from '../interfaces/http.interface';

export function verifyRefreshTokenController(
	tokenService: TokenService,
	redisService: RedisService
) {
	return async (req: HttpRequestCookie<RefreshTokenCookie>) => {
		if (!req.cookies || !req.cookies.refresh_token) {
			throw new AuthException(
				400,
				'invalid_request',
				'The token is missing or malformed.'
			);
		}

		const token = req.cookies.refresh_token;

		const data = await verifyRefreshToken(token, tokenService, redisService);

		return data;
	};
}
