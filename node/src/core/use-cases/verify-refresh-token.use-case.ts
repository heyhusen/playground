import { AuthException } from '../exceptions/auth.exception';
import type {
	TokenService,
	RefreshTokenRecord,
} from '../interfaces/token.interface';
import type { RedisService } from '../interfaces/redis.interface';
import type { UserRefreshRequest } from '../interfaces/auth.interface';

/**
 * Validate refresh token.
 *
 * If token is invalid, a custom exception will be thrown. This exception
 * implement RFC6750.
 *
 * @param {string}       token        A validated refresh token
 * @param {TokenService} tokenService A service for manage token
 * @param {RedisService} redisService A service for manage data on redis
 */
export async function verifyRefreshToken(
	token: string,
	tokenService: TokenService,
	redisService: RedisService
) {
	const payload = tokenService.verifyRefreshToken(token);

	const fetchedToken = await redisService.get(payload.jti);

	if (!fetchedToken) {
		throw new AuthException(
			401,
			'invalid_token',
			'The token has been expired.'
		);
	}

	const parsedToken = JSON.parse(fetchedToken) as RefreshTokenRecord;

	if (parsedToken.isRevoked) {
		throw new AuthException(
			401,
			'invalid_token',
			'The token has been revoked.'
		);
	}

	const result: UserRefreshRequest = {
		userId: payload.sub,
		tokenId: payload.jti,
		username: payload.username,
	};

	return result;
}
