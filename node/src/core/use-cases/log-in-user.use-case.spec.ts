import { UnauthorizedException } from '../exceptions/unauthorized.exception';
import type { LogInDto } from '../interfaces/auth.interface';
import type { HashService } from '../interfaces/hash.interface';
import type { RedisService } from '../interfaces/redis.interface';
import type { TokenService } from '../interfaces/token.interface';
import type { UserRepository, UserTable } from '../interfaces/user.interface';
import { logInUser } from './log-in-user.use-case';

describe('logInUser', () => {
	let userRepository: UserRepository;
	let hashService: HashService;
	let tokenService: TokenService;
	let redisService: RedisService;

	const expiresIn = 3600;

	const user: UserTable = {
		id: 'id',
		name: 'John Doe',
		nickname: null,
		email: 'johndoe@example.com',
		email_verified_at: null,
		password: 'abogoboga',
		created_at: '2022-06-11 01:55:13',
		updated_at: '2022-06-11 01:55:13',
	};

	const dto: LogInDto = {
		username: user.email,
		password: user.password,
	};

	beforeAll(() => {
		userRepository = {
			create: jest.fn(),
			findAll: jest.fn(),
			findOne: jest.fn(),
			findOneByEmail: jest.fn((email: string) => {
				if (email !== user.email) {
					return Promise.resolve(null);
				}

				return Promise.resolve(user);
			}),
			update: jest.fn(),
			remove: jest.fn(),
		};

		hashService = {
			create: jest.fn(),
			verify: jest.fn((hash: string, plain: string) => {
				if (hash !== plain) {
					return Promise.resolve(false);
				}

				return Promise.resolve(true);
			}),
		};

		tokenService = {
			generateAccessToken: jest.fn().mockReturnValue('accessToken'),
			verifyAccessToken: jest.fn(),
			generateRefreshToken: jest.fn().mockReturnValue('refreshToken'),
			verifyRefreshToken: jest.fn(),
		};

		redisService = {
			set: jest.fn(),
			get: jest.fn(),
			del: jest.fn(),
		};
	});

	test('should throw error when user not found', async () => {
		await expect(
			logInUser(
				{ ...dto, username: 'johndoe@example.co' },
				userRepository,
				hashService,
				tokenService,
				redisService,
				expiresIn
			)
		).rejects.toThrow(
			new UnauthorizedException('These credentials do not match our records.')
		);
	});

	test('should throw error when password is invalid', async () => {
		await expect(
			logInUser(
				{ ...dto, password: 'abogobog' },
				userRepository,
				hashService,
				tokenService,
				redisService,
				expiresIn
			)
		).rejects.toThrow(
			new UnauthorizedException('These credentials do not match our records.')
		);
	});

	test('should throw error when user not found and password is invalid', async () => {
		await expect(
			logInUser(
				{ username: 'johndoe@example.co', password: 'abogobog' },
				userRepository,
				hashService,
				tokenService,
				redisService,
				expiresIn
			)
		).rejects.toThrow(
			new UnauthorizedException('These credentials do not match our records.')
		);
	});

	test('should return token when log in is valid', async () => {
		const data = await logInUser(
			dto,
			userRepository,
			hashService,
			tokenService,
			redisService,
			expiresIn
		);

		expect(userRepository.findOneByEmail).toBeCalledTimes(1);
		expect(hashService.verify).toBeCalledTimes(1);
		expect(tokenService.generateAccessToken).toBeCalledTimes(1);
		expect(tokenService.generateRefreshToken).toBeCalledTimes(1);
		expect(data).toEqual({
			accessToken: 'accessToken',
			refreshToken: 'refreshToken',
		});
	});
});
