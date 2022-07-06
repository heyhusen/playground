import type { UserTable } from '../../src/core/interfaces/user.interface';
import { userRepository } from '../../src/infrastructure/repositories/user.repository';
import { hashService } from '../../src/infrastructure/services/hash.service';

export const user: Omit<UserTable, 'created_at' | 'updated_at'> = {
	id: 'c9b1dbe1-6eb7-463e-bfa5-4733d195bad9',
	name: 'John Doe',
	email: 'johndoe@example.com',
	password: 'abogoboga',
};

const { id, ...tempUser } = user;

export const testUser: Omit<UserTable, 'id' | 'created_at' | 'updated_at'> = {
	...tempUser,
	name: 'Jane Doe',
	email: 'janedoe@example.com',
};

export async function setup() {
	await userRepository.truncate();

	await userRepository.create({
		...user,
		password: await hashService.create(user.password),
	});
}
