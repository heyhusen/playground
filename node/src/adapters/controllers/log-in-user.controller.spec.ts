import { BadRequestException } from '../../core/exceptions/bad-request.exception';
import type {
	LogInDto,
	AuthResult,
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

jest.mock('../../core/use-cases/log-in-user.use-case');

describe('logInUserController', () => {
	const userRepository: UserRepository = {
		create: jest.fn(),
		findAll: jest.fn(),
		findOne: jest.fn(),
		findOneByEmail: jest.fn(),
		update: jest.fn(),
		remove: jest.fn(),
		truncate: jest.fn(),
	};
	const hashService: HashService = {
		create: jest.fn(),
		verify: jest.fn(),
	};
	const tokenService: TokenService = {
		generateAccessToken: jest.fn(),
		verifyAccessToken: jest.fn(),
		generateRefreshToken: jest.fn(),
		verifyRefreshToken: jest.fn(),
	};
	const redisService: RedisService = {
		set: jest.fn(),
		get: jest.fn(),
		del: jest.fn(),
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

	const mockedLogInUser = jest.mocked(logInUser, true);

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
