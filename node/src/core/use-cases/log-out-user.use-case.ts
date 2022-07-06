import { BearerTokenException } from '../exceptions/bearer-token.exception';
import type { RefreshTokenRecord } from '../interfaces/token.interface';
import type { RedisService } from '../interfaces/redis.interface';

/**
 * Log out the user
 *
 * @param {string}       	 jti          An identifier for token
 * @param {RedisService} 	 redisService A service for manage data on redis
 * @return {Promise<void>}              Successfully log out
 */
export async function logOutUser(
	jti: string,
	redisService: RedisService
): Promise<void> {
	const token = await redisService.get(jti);

	if (!token) {
		throw new BearerTokenException(
			401,
			'invalid_token',
			'The token is expired.'
		);
	}

	const parsedToken = JSON.parse(token) as RefreshTokenRecord;

	const data: RefreshTokenRecord = { ...parsedToken, isRevoked: true };

	await redisService.set(jti, JSON.stringify(data));
}
