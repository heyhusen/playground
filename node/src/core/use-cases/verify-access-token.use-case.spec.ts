import type { Payload, TokenService } from '../interfaces/token.interface';
import { verifyAccessToken } from './verify-access-token.use-case';

describe('verifyAccessToken', () => {
	let tokenService: TokenService;

	const token = 'token';

	const payload: Payload = { sub: 'userId', username: 'username' };

	beforeAll(() => {
		tokenService = {
			generateAccessToken: jest.fn(),
			verifyAccessToken: jest.fn().mockReturnValue(payload),
			generateRefreshToken: jest.fn(),
			verifyRefreshToken: jest.fn(),
		};
	});

	test('should return user object', () => {
		const data = verifyAccessToken(token, tokenService);

		expect(data).toEqual({ userId: payload.sub, username: payload.username });
	});
});
