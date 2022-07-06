import { UnauthorizedException } from '../exceptions/unauthorized.exception';
import type { UserRefreshRequest } from '../interfaces/auth.interface';
import type { RedisService } from '../interfaces/redis.interface';
import type {
	RefreshPayload,
	RefreshTokenRecord,
	TokenService,
} from '../interfaces/token.interface';
import { verifyRefreshToken } from './verify-refresh-token.use-case';

describe('verifyRefreshToken', () => {
	let tokenService: TokenService;
	let redisService: RedisService;

	let payload: RefreshPayload = {
		sub: 'userId',
		jti: 'tokenId',
		username: 'username',
	};

	let tokenRecord: RefreshTokenRecord = {
		userId: payload.sub,
		isRevoked: false,
	};

	beforeEach(() => {
		tokenService = {
			generateAccessToken: jest.fn(),
			verifyAccessToken: jest.fn(),
			generateRefreshToken: jest.fn(),
			verifyRefreshToken: jest.fn().mockReturnValue(payload),
		};

		redisService = {
			set: jest.fn(),
			get: jest.fn((key: string) => {
				if (key !== payload.jti) {
					return Promise.resolve(null);
				}

				return Promise.resolve(JSON.stringify(tokenRecord));
			}),
			del: jest.fn(),
		};
	});

	test('should throw error when token not found in redis', async () => {
		payload = { ...payload, jti: 'invalid-id' };

		await expect(
			verifyRefreshToken('token', tokenService, redisService)
		).rejects.toThrow(new UnauthorizedException('The token has been expired.'));
	});

	test('should throw error when token is revoked', async () => {
		tokenRecord = { ...tokenRecord, isRevoked: true };

		await expect(
			verifyRefreshToken('token', tokenService, redisService)
		).rejects.toThrow(new UnauthorizedException('The token has been revoked.'));
	});

	test('should return user object', async () => {
		tokenRecord = { ...tokenRecord, isRevoked: false };

		const data = await verifyRefreshToken('token', tokenService, redisService);

		expect(data).toEqual<UserRefreshRequest>({
			userId: payload.sub,
			tokenId: payload.jti,
			username: payload.username,
		});
	});
});
