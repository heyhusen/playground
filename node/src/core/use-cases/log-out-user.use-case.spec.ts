import { BearerTokenException } from '../exceptions/bearer-token.exception';
import type { RedisService } from '../interfaces/redis.interface';
import { logOutUser } from './log-out-user.use-case';

describe('logOutUser', () => {
	let redisService: RedisService;

	const jti = 'valid-jti';

	beforeAll(() => {
		redisService = {
			set: jest.fn(),
			get: jest.fn((key: string) => {
				if (key !== jti) {
					return Promise.resolve(null);
				}

				return Promise.resolve(
					JSON.stringify({ userId: 'userId', isRevoked: false })
				);
			}),
			del: jest.fn(),
		};
	});

	test('should throw error when refresh token is expired', async () => {
		await expect(logOutUser('invalid-jti', redisService)).rejects.toThrow(
			new BearerTokenException(401, 'invalid_token', 'The token is expired.')
		);
	});

	test('should revoke refresh token', async () => {
		await logOutUser(jti, redisService);

		expect(redisService.get).toBeCalledTimes(1);
		expect(redisService.set).toBeCalledTimes(1);
	});
});
