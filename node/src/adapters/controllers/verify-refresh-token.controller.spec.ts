import { beforeAll, describe, expect, test, vi } from 'vitest';
import { BearerTokenException } from '../../core/exceptions/bearer-token.exception';
import type { UserRefreshRequest } from '../../core/interfaces/auth.interface';
import type { RedisService } from '../../core/interfaces/redis.interface';
import type { TokenService } from '../../core/interfaces/token.interface';
import { verifyRefreshToken } from '../../core/use-cases/verify-refresh-token.use-case';
import type {
	HttpRequestCookie,
	RefreshTokenCookie,
} from '../interfaces/http.interface';
import { verifyRefreshTokenController } from './verify-refresh-token.controller';

vi.mock('../../core/use-cases/verify-refresh-token.use-case');

describe('verifyRefreshTokenController', () => {
	const tokenService: TokenService = {
		generateAccessToken: vi.fn(),
		verifyAccessToken: vi.fn(),
		generateRefreshToken: vi.fn(),
		verifyRefreshToken: vi.fn(),
	};
	const redisService: RedisService = {
		set: vi.fn(),
		get: vi.fn(),
		del: vi.fn(),
	};

	let request: HttpRequestCookie<RefreshTokenCookie> = {
		headers: {},
		params: {},
		body: {},
		user: {},
		cookies: {
			refresh_token: undefined,
		},
	};

	const mockedVerifyRefreshToken = vi.mocked(verifyRefreshToken, true);

	const controller = verifyRefreshTokenController(tokenService, redisService);

	beforeAll(() => {
		mockedVerifyRefreshToken.mockReturnValue(
			Promise.resolve<UserRefreshRequest>({
				userId: 'id',
				username: 'johndoe@example.com',
				tokenId: 'tokenId',
			})
		);
	});

	test('should throw error when token is undefined', async () => {
		await expect(controller(request)).rejects.toThrow(
			new BearerTokenException(
				400,
				'invalid_request',
				'The token is missing or malformed.'
			)
		);
	});

	test('should throw error when token is empty', async () => {
		request = { ...request, cookies: { refresh_token: '' } };

		await expect(controller(request)).rejects.toThrow(
			new BearerTokenException(
				400,
				'invalid_request',
				'The token is missing or malformed.'
			)
		);
	});

	test('should return user object when token is valid', async () => {
		request = { ...request, cookies: { refresh_token: 'valid_token' } };

		const data = await controller(request);

		expect(verifyRefreshToken).toBeCalledTimes(1);
		expect(verifyRefreshToken).toBeCalledWith(
			'valid_token',
			tokenService,
			redisService
		);

		expect(data).toEqual<UserRefreshRequest>({
			userId: 'id',
			username: 'johndoe@example.com',
			tokenId: 'tokenId',
		});
	});
});
