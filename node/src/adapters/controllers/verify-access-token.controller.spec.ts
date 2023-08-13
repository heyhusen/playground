import { beforeAll, describe, expect, test, vi } from 'vitest';
import { BearerTokenException } from '../../core/exceptions/bearer-token.exception';
import type { UserRequest } from '../../core/interfaces/auth.interface';
import type { TokenService } from '../../core/interfaces/token.interface';
import { verifyAccessToken } from '../../core/use-cases/verify-access-token.use-case';
import type {
	BearerTokenHeader,
	HttpRequest,
} from '../interfaces/http.interface';
import { verifyAccessTokenController } from './verify-access-token.controller';

vi.mock('../../core/use-cases/verify-access-token.use-case');

describe('verifyAccessTokenController', () => {
	const tokenService: TokenService = {
		generateAccessToken: vi.fn(),
		verifyAccessToken: vi.fn(),
		generateRefreshToken: vi.fn(),
		verifyRefreshToken: vi.fn(),
	};

	let request: HttpRequest<BearerTokenHeader> = {};

	const mockedVerifyAccessToken = vi.mocked(verifyAccessToken, true);

	const controller = verifyAccessTokenController(tokenService);

	beforeAll(() => {
		mockedVerifyAccessToken.mockReturnValue({
			userId: 'id',
			username: 'johndoe@example.com',
		});
	});

	test('should throw error when authorization header is undefined', () => {
		expect(() => {
			controller(request);
		}).toThrow(
			new BearerTokenException(
				400,
				'invalid_request',
				'The request is missing a required authorization header.'
			)
		);
	});

	test('should throw error when authorization header is empty', () => {
		request = { ...request, headers: { authorization: '' } };

		expect(() => {
			controller(request);
		}).toThrow(
			new BearerTokenException(
				400,
				'invalid_request',
				'The request is missing a required authorization header.'
			)
		);
	});

	test('should throw error when token is invalid', () => {
		request = { ...request, headers: { authorization: 'invalid_token' } };

		expect(() => {
			controller(request);
		}).toThrow(
			new BearerTokenException(401, 'invalid_token', 'The token is malformed.')
		);
	});

	test('should return user object when token is valid', () => {
		request = { ...request, headers: { authorization: 'Bearer: valid_token' } };

		const data = controller(request);

		expect(verifyAccessToken).toBeCalledTimes(1);
		expect(verifyAccessToken).toBeCalledWith('valid_token', tokenService);

		expect(data).toEqual<UserRequest>({
			userId: 'id',
			username: 'johndoe@example.com',
		});
	});
});
