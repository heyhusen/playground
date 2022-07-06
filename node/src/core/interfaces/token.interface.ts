import type { LogInDto, UserRequest } from './auth.interface';

export interface Payload extends Pick<LogInDto, 'username'> {
	sub: string;
}

export interface RefreshPayload extends Payload {
	jti: string;
}

export interface TokenService {
	generateAccessToken: (payload: Payload) => string;
	verifyAccessToken: (token: string) => Payload;
	generateRefreshToken: (tokenId: string, payload: Payload) => string;
	verifyRefreshToken: (token: string) => RefreshPayload;
}

export interface RefreshTokenRecord extends Pick<UserRequest, 'userId'> {
	isRevoked: boolean;
}
