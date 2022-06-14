import type { File } from '../entities/common.entity';
import type { User } from '../entities/user.entity';
import type { BaseRepository } from './common.interface';

export type CreateUserDto = Omit<User, 'nickname' | 'avatar'> & {
	nickname?: string;
	password: string;
	password_confirmation: string;
	photo?: File | undefined;
};

export type UpdateUserDto = Partial<CreateUserDto>;

export type UserTable = Pick<User, 'nickname'> &
	Omit<CreateUserDto, 'nickname' | 'password_confirmation' | 'photo'> & {
		id: string;
		email_verified_at?: string | null;
		photo?: string | null;
		created_at: string;
		updated_at: string;
	};

export type UserTableInput = Omit<
	UserTable,
	'id' | 'created_at' | 'updated_at'
> &
	Partial<Pick<UserTable, 'updated_at'>>;

export type UserRepository = BaseRepository<UserTableInput, UserTable> & {
	findOneByEmail: (email: string) => Promise<UserTable | null>;
};
