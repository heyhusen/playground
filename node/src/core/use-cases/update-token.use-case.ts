import { randomUUID } from 'crypto';
import type {
	AuthResult,
	UserRefreshRequest,
} from '../interfaces/auth.interface';
import type { RedisService } from '../interfaces/redis.interface';
import type {
	RefreshTokenRecord,
	TokenService,
} from '../interfaces/token.interface';

/**
 * Update access and refresh token
 *
 * @param {UserRefreshRequest} 		user         An authenticated user object
 * @param {TokenService}       		tokenService A service for manage token
 * @param {RedisService}       		redisService A service for manage data on redis
 * @param {number}             		expiresIn    A number indicating how long the access token will live
 * @return {Promise<AuthResult>}              An updated tokens
 */
export async function updateToken(
	user: UserRefreshRequest,
	tokenService: TokenService,
	redisService: RedisService,
	expiresIn: number
): Promise<AuthResult> {
	const { userId, tokenId: oldTokenId, username } = user;

	// Create access token
	const accessToken = tokenService.generateAccessToken({
		sub: userId,
		username,
	});

	// Create refresh token
	const tokenId = randomUUID();
	const data: RefreshTokenRecord = { userId, isRevoked: false };

	await redisService.del(oldTokenId);

	await redisService.set(tokenId, JSON.stringify(data), expiresIn);

	const refreshToken = tokenService.generateRefreshToken(tokenId, {
		sub: userId,
		username,
	});

	return {
		accessToken,
		refreshToken,
	};
}
