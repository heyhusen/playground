import { beforeAll, describe, expect, test, vi } from 'vitest';
import { BadRequestException } from '../../core/exceptions/bad-request.exception';
import type {
	AuthResult,
	LogInDto,
} from '../../core/interfaces/auth.interface';
import type { HashService } from '../../core/interfaces/hash.interface';
import type { RedisService } from '../../core/interfaces/redis.interface';
import type { TokenService } from '../../core/interfaces/token.interface';
import type { UserRepository } from '../../core/interfaces/user.interface';
import { logInUser } from '../../core/use-cases/log-in-user.use-case';
import type { AuthResponse } from '../interfaces/auth.interface';
import type { ResponseModel } from '../interfaces/common.interface';
import type { HttpRequestBody } from '../interfaces/http.interface';
import { logInUserController } from './log-in-user.controller';

vi.mock('../../core/use-cases/log-in-user.use-case');

describe('logInUserController', () => {
	const userRepository: UserRepository = {
		create: vi.fn(),
		findAll: vi.fn(),
		findOne: vi.fn(),
		findOneByEmail: vi.fn(),
		update: vi.fn(),
		remove: vi.fn(),
		truncate: vi.fn(),
	};
	const hashService: HashService = {
		create: vi.fn(),
		verify: vi.fn(),
	};
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

	const dto: LogInDto = {
		username: 'johndoe@example.com',
		password: 'abogoboga',
	};

	let request: HttpRequestBody<LogInDto> = {};

	const controller = logInUserController(
		userRepository,
		hashService,
		tokenService,
		redisService,
		expiresIn
	);

	const mockedLogInUser = vi.mocked(logInUser, true);

	beforeAll(() => {
		mockedLogInUser.mockReturnValue(
			Promise.resolve<AuthResult>({
				accessToken: 'accessToken',
				refreshToken: 'refreshToken',
			})
		);
	});

	test('should throw error when request body is empty', async () => {
		await expect(controller(request)).rejects.toThrow(
			new BadRequestException('Request body is empty.')
		);
	});

	test('should return log in object', async () => {
		request = { ...request, body: dto };

		const data = await controller(request);

		expect(logInUser).toBeCalledTimes(1);
		expect(logInUser).toBeCalledWith(
			dto,
			userRepository,
			hashService,
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
