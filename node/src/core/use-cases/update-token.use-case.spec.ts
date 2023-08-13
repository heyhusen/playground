import { beforeAll, describe, expect, test, vi } from 'vitest';
import type {
	AuthResult,
	UserRefreshRequest,
} from '../interfaces/auth.interface';
import type { RedisService } from '../interfaces/redis.interface';
import type { TokenService } from '../interfaces/token.interface';
import { updateToken } from './update-token.use-case';

describe('updateToken', () => {
	let tokenService: TokenService;
	let redisService: RedisService;

	const user: UserRefreshRequest = {
		username: 'username',
		userId: 'userId',
		tokenId: 'tokenId',
	};

	const expiresIn = 3600;

	beforeAll(() => {
		tokenService = {
			generateAccessToken: vi.fn().mockReturnValue('accessToken'),
			verifyAccessToken: vi.fn(),
			generateRefreshToken: vi.fn().mockReturnValue('refreshToken'),
			verifyRefreshToken: vi.fn(),
		};

		redisService = {
			set: vi.fn(),
			get: vi.fn(),
			del: vi.fn(),
		};
	});

	test('should return new access and refresh token', async () => {
		const data = await updateToken(user, tokenService, redisService, expiresIn);

		expect(tokenService.generateAccessToken).toBeCalledTimes(1);
		expect(redisService.del).toBeCalledTimes(1);
		expect(redisService.set).toBeCalledTimes(1);
		expect(tokenService.generateRefreshToken).toBeCalledTimes(1);
		expect(data).toEqual<AuthResult>({
			accessToken: 'accessToken',
			refreshToken: 'refreshToken',
		});
	});
});
