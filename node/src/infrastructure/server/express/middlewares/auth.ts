import type { NextFunction, Request, Response } from 'express';
import expressAsyncHandler from 'express-async-handler';
import { verifyAccessTokenController } from '../../../../adapters/controllers/verify-access-token.controller';
import { verifyRefreshTokenController } from '../../../../adapters/controllers/verify-refresh-token.controller';
import type {
	BearerTokenHeader,
	HttpRequest,
	HttpRequestCookie,
	RefreshTokenCookie,
} from '../../../../adapters/interfaces/http.interface';
import { redisService } from '../../../services/redis.service';
import { tokenService } from '../../../services/token.service';

const verifyAccessToken = verifyAccessTokenController(tokenService);
const verifyRefreshToken = verifyRefreshTokenController(
	tokenService,
	redisService
);

export function accessToken() {
	return (req: Request, _res: Response, next: NextFunction) => {
		const httpRequest: HttpRequest<BearerTokenHeader> = {
			headers: {
				authorization: req.headers.authorization,
			},
		};

		const user = verifyAccessToken(httpRequest);

		req.user = user;

		next();
	};
}

export function refreshToken() {
	return expressAsyncHandler(
		async (req: Request, _res: Response, next: NextFunction) => {
			const httpRequest: HttpRequestCookie<RefreshTokenCookie> = {
				cookies: {
					refresh_token: (req.cookies as RefreshTokenCookie).refresh_token,
				},
			};

			const user = await verifyRefreshToken(httpRequest);

			req.user = user;

			next();
		}
	);
}
