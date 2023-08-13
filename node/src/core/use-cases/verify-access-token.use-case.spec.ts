import { beforeAll, describe, expect, test, vi } from 'vitest';
import type { UserRequest } from '../interfaces/auth.interface';
import type { Payload, TokenService } from '../interfaces/token.interface';
import { verifyAccessToken } from './verify-access-token.use-case';

describe('verifyAccessToken', () => {
	let tokenService: TokenService;

	const token = 'token';

	const payload: Payload = { sub: 'userId', username: 'username' };

	beforeAll(() => {
		tokenService = {
			generateAccessToken: vi.fn(),
			verifyAccessToken: vi.fn().mockReturnValue(payload),
			generateRefreshToken: vi.fn(),
			verifyRefreshToken: vi.fn(),
		};
	});

	test('should return user object', () => {
		const data = verifyAccessToken(token, tokenService);

		expect(data).toEqual<UserRequest>({
			userId: payload.sub,
			username: payload.username,
		});
	});
});
