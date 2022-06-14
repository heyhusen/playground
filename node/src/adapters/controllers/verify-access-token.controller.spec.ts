import { AuthException } from '../../core/exceptions/auth.exception';
import type { TokenService } from '../../core/interfaces/token.interface';
import { verifyAccessToken } from '../../core/use-cases/verify-access-token.use-case';
import type {
	BearerTokenHeader,
	HttpRequest,
} from '../interfaces/http.interface';
import { verifyAccessTokenController } from './verify-access-token.controller';

jest.mock('../../core/use-cases/verify-access-token.use-case');

describe('verifyAccessTokenController', () => {
	const tokenService: TokenService = {
		generateAccessToken: jest.fn(),
		verifyAccessToken: jest.fn(),
		generateRefreshToken: jest.fn(),
		verifyRefreshToken: jest.fn(),
	};

	let request: HttpRequest<BearerTokenHeader> = {};

	const mockedVerifyAccessToken = jest.mocked(verifyAccessToken, true);

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
			new AuthException(
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
			new AuthException(
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
			new AuthException(401, 'invalid_token', 'The token is malformed.')
		);
	});

	test('should return user object when token is valid', () => {
		request = { ...request, headers: { authorization: 'Bearer: valid_token' } };

		const data = controller(request);

		expect(verifyAccessToken).toBeCalledTimes(1);
		expect(verifyAccessToken).toBeCalledWith('valid_token', tokenService);

		expect(data).toEqual({
			userId: 'id',
			username: 'johndoe@example.com',
		});
	});
});
