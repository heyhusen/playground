import type { UserTable } from '../../core/interfaces/user.interface';
import type { User } from '../../core/entities/user.entity';

export type UserRequestParams = Pick<UserTable, 'id'>;

export type UserResponse = Omit<UserTable, 'password'> &
	Pick<User, 'avatar'> & {
		type: 'users';
	};
