import type { UserRequest } from '../interfaces/auth.interface';
import type { TokenService } from '../interfaces/token.interface';

/**
 * Validate access token
 *
 * If token is invalid, a custom exception will be thrown. This exception
 * implement RFC6750.
 *
 * @param {string}       token       	 A validated access token
 * @param {TokenService} tokenService  A service for manage token
 * @return {UserRequest}               An user object
 */
export function verifyAccessToken(
	token: string,
	tokenService: TokenService
): UserRequest {
	const payload = tokenService.verifyAccessToken(token);

	return {
		userId: payload.sub,
		username: payload.username,
	};
}
