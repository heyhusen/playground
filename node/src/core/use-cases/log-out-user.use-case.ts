import { AuthException } from '../exceptions/auth.exception';
import type { RefreshTokenRecord } from '../interfaces/token.interface';
import type { RedisService } from '../interfaces/redis.interface';

/**
 * Log out the user
 *
 * @param {string}       jti          An identifier for token
 * @param {RedisService} redisService A service for manage data on redis
 */
export async function logOutUser(jti: string, redisService: RedisService) {
	const token = await redisService.get(jti);

	if (!token) {
		throw new AuthException(401, 'invalid_token', 'The token is expired.');
	}

	const parsedToken = JSON.parse(token) as RefreshTokenRecord;

	const data: RefreshTokenRecord = { ...parsedToken, isRevoked: true };

	await redisService.set(jti, JSON.stringify(data));
}
