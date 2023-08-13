import { beforeAll, describe, expect, test, vi } from 'vitest';
import { UnauthorizedException } from '../exceptions/unauthorized.exception';
import type { AuthResult, LogInDto } from '../interfaces/auth.interface';
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
			create: vi.fn(),
			findAll: vi.fn(),
			findOne: vi.fn(),
			findOneByEmail: vi.fn((email: string) => {
				if (email !== user.email) {
					return Promise.resolve(null);
				}

				return Promise.resolve<UserTable>(user);
			}),
			update: vi.fn(),
			remove: vi.fn(),
			truncate: vi.fn(),
		};

		hashService = {
			create: vi.fn(),
			verify: vi.fn((hash: string, plain: string) => {
				if (hash !== plain) {
					return Promise.resolve(false);
				}

				return Promise.resolve(true);
			}),
		};

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

	test('should throw error when user not found', async () => {
		await expect(
			logInUser(
				{
					...dto,
					username: 'johndoe@example.co',
				},
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
				{
					...dto,
					password: 'abogobog',
				},
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
				{
					username: 'johndoe@example.co',
					password: 'abogobog',
				},
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
		expect(data).toEqual<AuthResult>({
			accessToken: 'accessToken',
			refreshToken: 'refreshToken',
		});
	});
});
