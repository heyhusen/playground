import { createSigner, createVerifier } from 'fast-jwt';
import { BadRequestException } from '../../core/exceptions/bad-request.exception';
import type {
	TokenService,
	Payload,
	RefreshPayload,
} from '../../core/interfaces/token.interface';
import { authConfig } from '../config/auth';

export const tokenService: TokenService = {
	generateAccessToken: (payload: Payload) => {
		const sign = createSigner(authConfig.access);
		const token = sign(payload);

		return token;
	},

	verifyAccessToken: (token: string) => {
		try {
			const { key, algorithm, iss, aud } = authConfig.access;
			const verify = createVerifier({
				key,
				algorithms: [algorithm],
				allowedIss: iss,
				allowedAud: aud,
				ignoreExpiration: false,
			});
			const payload = verify(token) as Payload;

			return payload;
		} catch (err) {
			const { message } = err as { message: string };

			throw new BadRequestException(message);
		}
	},

	generateRefreshToken: (tokenId: string, payload: Payload) => {
		const sign = createSigner({ ...authConfig.refresh, jti: tokenId });
		const token = sign(payload);

		return token;
	},

	verifyRefreshToken: (token: string) => {
		try {
			const { key, algorithm, iss, aud } = authConfig.refresh;
			const verify = createVerifier({
				key,
				algorithms: [algorithm],
				allowedIss: iss,
				allowedAud: aud,
				ignoreExpiration: false,
			});
			const payload = verify(token) as RefreshPayload;

			return payload;
		} catch (err) {
			const { message } = err as { message: string };

			throw new BadRequestException(message);
		}
	},
};
