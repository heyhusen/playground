import { beforeEach, describe, expect, test, vi } from 'vitest';
import type {
	AuthResult,
	UserRefreshRequest,
} from '../../core/interfaces/auth.interface';
import type { RedisService } from '../../core/interfaces/redis.interface';
import type { TokenService } from '../../core/interfaces/token.interface';
import { updateToken } from '../../core/use-cases/update-token.use-case';
import type { AuthResponse } from '../interfaces/auth.interface';
import type { ResponseModel } from '../interfaces/common.interface';
import type { HttpRequestUser } from '../interfaces/http.interface';
import { updateTokenController } from './update-token.controller';

vi.mock('../../core/use-cases/update-token.use-case');

describe('updateTokenController', () => {
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
	const expiresIn = 3600;

	const userRequest: UserRefreshRequest = {
		userId: 'id',
		username: 'johndoe@example.com',
		tokenId: 'tokenId',
	};

	const request: HttpRequestUser<UserRefreshRequest> = {
		headers: {},
		params: {},
		body: {},
		user: userRequest,
		cookies: {},
	};

	const controller = updateTokenController(
		tokenService,
		redisService,
		expiresIn
	);

	const mockedUpdateToken = vi.mocked(updateToken, true);

	beforeEach(() => {
		mockedUpdateToken.mockReturnValue(
			Promise.resolve<AuthResult>({
				accessToken: 'accessToken',
				refreshToken: 'refreshToken',
			})
		);
	});

	test('should return log in object', async () => {
		const data = await controller(request);

		expect(updateToken).toBeCalledTimes(1);
		expect(updateToken).toBeCalledWith(
			userRequest,
			tokenService,
			redisService,
			expiresIn
		);
		expect(data).toEqual<ResponseModel<AuthResponse>>({
			status: 200,
			cookie: {
				name: 'refresh_token',
				value: 'refreshToken',
				maxAge: expiresIn,
			},
			data: {
				access_token: 'accessToken',
				token_type: 'Bearer',
				refresh_token: 'refreshToken',
				expires_in: expiresIn,
			},
		});
	});
});
