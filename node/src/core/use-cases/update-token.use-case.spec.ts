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
