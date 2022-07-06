import type { CreateUserDto } from './user.interface';

export interface LogInDto extends Pick<CreateUserDto, 'password'> {
	username: string;
}

export interface UserRequest extends Pick<LogInDto, 'username'> {
	userId: string;
}

export interface UserRefreshRequest extends UserRequest {
	tokenId: string;
}

export interface AuthResult {
	accessToken: string;
	refreshToken: string;
}
