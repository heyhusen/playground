import { UnauthorizedException } from '../exceptions/unauthorized.exception';
import type { UserRefreshRequest } from '../interfaces/auth.interface';
import type { RedisService } from '../interfaces/redis.interface';
import type {
	RefreshTokenRecord,
	TokenService,
} from '../interfaces/token.interface';

/**
 * Validate refresh token.
 *
 * If token is invalid, a custom exception will be thrown. This exception
 * implement RFC6750.
 *
 * @param {string}       								 token        A validated refresh token
 * @param {TokenService} 								 tokenService A service for manage token
 * @param {RedisService} 								 redisService A service for manage data on redis
 * @return {Promise<UserRefreshRequest>}              An user object
 */
export async function verifyRefreshToken(
	token: string,
	tokenService: TokenService,
	redisService: RedisService
): Promise<UserRefreshRequest> {
	const payload = tokenService.verifyRefreshToken(token);

	const fetchedToken = await redisService.get(payload.jti);

	if (!fetchedToken) {
		throw new UnauthorizedException('The token has been expired.');
	}

	const parsedToken = JSON.parse(fetchedToken) as RefreshTokenRecord;

	if (parsedToken.isRevoked) {
		throw new UnauthorizedException('The token has been revoked.');
	}

	return {
		userId: payload.sub,
		tokenId: payload.jti,
		username: payload.username,
	};
}
