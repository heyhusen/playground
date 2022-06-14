import type { UserRequest } from '../interfaces/auth.interface';
import type { TokenService } from '../interfaces/token.interface';

/**
 * Validate access token
 *
 * If token is invalid, a custom exception will be thrown. This exception
 * implement RFC6750.
 *
 * @param {string}       token       	A validated access token
 * @param {TokenService} tokenService A service for manage token
 */
export function verifyAccessToken(token: string, tokenService: TokenService) {
	const payload = tokenService.verifyAccessToken(token);

	const result: UserRequest = {
		userId: payload.sub,
		username: payload.username,
	};

	return result;
}
