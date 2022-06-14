import { AuthException } from '../../core/exceptions/auth.exception';
import type { TokenService } from '../../core/interfaces/token.interface';
import { verifyAccessToken } from '../../core/use-cases/verify-access-token.use-case';
import type {
	BearerTokenHeader,
	HttpRequest,
} from '../interfaces/http.interface';

export function verifyAccessTokenController(tokenService: TokenService) {
	return (req: HttpRequest<BearerTokenHeader>) => {
		if (!req.headers || !req.headers.authorization) {
			throw new AuthException(
				400,
				'invalid_request',
				'The request is missing a required authorization header.'
			);
		}

		const bearer = req.headers.authorization.split(' ');
		const token = bearer[1];

		if (!token) {
			throw new AuthException(401, 'invalid_token', 'The token is malformed.');
		}

		const data = verifyAccessToken(token, tokenService);

		return data;
	};
}
