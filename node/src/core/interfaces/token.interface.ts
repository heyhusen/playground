import type { LogInDto, UserRequest } from './auth.interface';

export type Payload = Pick<LogInDto, 'username'> & {
	sub: string;
};

export type RefreshPayload = Payload & { jti: string };

export interface TokenService {
	generateAccessToken: (payload: Payload) => string;
	verifyAccessToken: (token: string) => Payload;
	generateRefreshToken: (tokenId: string, payload: Payload) => string;
	verifyRefreshToken: (token: string) => RefreshPayload;
}

export type RefreshTokenRecord = Pick<UserRequest, 'userId'> & {
	isRevoked: boolean;
};
