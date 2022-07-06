import type { User } from '../entities/user.entity';
import type { BaseRepository } from './common.interface';

export interface CreateUserDto extends Omit<User, 'nickname' | 'avatar'> {
	nickname?: string;
	password: string;
	password_confirmation: string;
}

export type UpdateUserDto = Partial<CreateUserDto>;

export interface UserTable
	extends Pick<User, 'nickname'>,
		Omit<CreateUserDto, 'nickname' | 'password_confirmation'> {
	id: string;
	email_verified_at?: string | null;
	photo?: string | null;
	created_at: string;
	updated_at: string;
}

export type UserTableInput = Omit<
	UserTable,
	'id' | 'created_at' | 'updated_at'
> &
	Partial<Pick<UserTable, 'updated_at'>>;

export interface UserRepository
	extends BaseRepository<UserTableInput, UserTable> {
	findOneByEmail: (email: string) => Promise<UserTable | null>;
}

export type UserResult = Omit<UserTable, 'password'> & Pick<User, 'avatar'>;
