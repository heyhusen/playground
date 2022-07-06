import type { UserRefreshRequest } from 'src/core/interfaces/auth.interface';
import { BadRequestException } from '../../core/exceptions/bad-request.exception';
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
): (req: HttpRequestCookie<RefreshTokenCookie>) => Promise<UserRefreshRequest> {
	return async (
		req: HttpRequestCookie<RefreshTokenCookie>
	): Promise<UserRefreshRequest> => {
		if (!req.cookies || !req.cookies.refresh_token) {
			throw new BadRequestException('The token is missing or malformed.');
		}

		const token = req.cookies.refresh_token;

		const data = await verifyRefreshToken(token, tokenService, redisService);

		return data;
	};
}
