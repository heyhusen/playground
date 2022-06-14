import { randomUUID } from 'crypto';
import { UnauthorizedException } from '../exceptions/unauthorized.exception';
import type { LogInDto } from '../interfaces/auth.interface';
import type { HashService } from '../interfaces/hash.interface';
import type { RedisService } from '../interfaces/redis.interface';
import type {
	RefreshTokenRecord,
	TokenService,
} from '../interfaces/token.interface';
import type { UserRepository } from '../interfaces/user.interface';

/**
 * Log in an user, then create access and refresh token.
 *
 * If the user is not found in the database or if the password is invalid, an
 * exception will be thrown.
 *
 * @param {LogInDto}       dto            A validated data transfer object
 * @param {UserRepository} userRepository A repository of user
 * @param {HashService}    hashService    A service for manage hash
 * @param {TokenService}   tokenService   A service for manage token
 * @param {RedisService}   redisService   A service for manage data on redis
 * @param {number}         expiresIn      A number for refresh token expiration
 */
export async function logInUser(
	dto: LogInDto,
	userRepository: UserRepository,
	hashService: HashService,
	tokenService: TokenService,
	redisService: RedisService,
	expiresIn: number
) {
	const { username, password } = dto;

	const record = await userRepository.findOneByEmail(username);

	if (!record || !(await hashService.verify(record.password, password))) {
		throw new UnauthorizedException(
			'These credentials do not match our records.'
		);
	}

	// Create access token
	const accessToken = tokenService.generateAccessToken({
		sub: record.id,
		username,
	});

	// Create refresh token
	const tokenId = randomUUID();
	const data: RefreshTokenRecord = { userId: record.id, isRevoked: false };

	await redisService.set(tokenId, JSON.stringify(data), expiresIn);

	const refreshToken = tokenService.generateRefreshToken(tokenId, {
		sub: record.id,
		username,
	});

	return {
		accessToken,
		refreshToken,
	};
}
