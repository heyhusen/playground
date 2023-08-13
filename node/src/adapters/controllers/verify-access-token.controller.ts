import { BearerTokenException } from '../../core/exceptions/bearer-token.exception';
import type { UserRequest } from '../../core/interfaces/auth.interface';
import type { TokenService } from '../../core/interfaces/token.interface';
import { verifyAccessToken } from '../../core/use-cases/verify-access-token.use-case';
import type {
	BearerTokenHeader,
	HttpRequest,
} from '../interfaces/http.interface';

export function verifyAccessTokenController(
	tokenService: TokenService
): (req: HttpRequest<BearerTokenHeader>) => UserRequest {
	return (req: HttpRequest<BearerTokenHeader>): UserRequest => {
		if (!req.headers || !req.headers.authorization) {
			throw new BearerTokenException(
				400,
				'invalid_request',
				'The request is missing a required authorization header.'
			);
		}

		const bearer = req.headers.authorization.split(' ');
		const token = bearer[1];

		if (!token) {
			throw new BearerTokenException(
				401,
				'invalid_token',
				'The token is malformed.'
			);
		}

		const data = verifyAccessToken(token, tokenService);

		return data;
	};
}
