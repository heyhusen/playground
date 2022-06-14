import type { CreateUserDto } from './user.interface';

export type LogInDto = Pick<CreateUserDto, 'password'> & { username: string };

export type UserRequest = Pick<LogInDto, 'username'> & {
	userId: string;
};

export type UserRefreshRequest = UserRequest & { tokenId: string };
