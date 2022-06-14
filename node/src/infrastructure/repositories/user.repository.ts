import type {
	UserRepository,
	UserTable,
	UserTableInput,
} from '../../core/interfaces/user.interface';
import { db } from '../ports/database';

export const userRepository: UserRepository = {
	create: async (input: UserTableInput) => {
		const record = await db<UserTable>('users')
			.insert(input)
			.returning([
				'id',
				'name',
				'nickname',
				'email',
				'password',
				'photo',
				'created_at',
				'updated_at',
			])
			.first();

		if (!record) {
			return null;
		}

		const result: UserTable = record;

		return result;
	},

	findAll: async () => {
		const records = await db<UserTable>('users').select(
			'id',
			'name',
			'nickname',
			'email',
			'password',
			'photo',
			'created_at',
			'updated_at'
		);

		const result: UserTable[] = records;

		return result;
	},

	findOne: async (id: string) => {
		const record = await db<UserTable>('users')
			.where('id', '=', id)
			.first(
				'id',
				'name',
				'nickname',
				'email',
				'password',
				'photo',
				'created_at',
				'updated_at'
			);

		if (!record) {
			return null;
		}

		const result: UserTable = record;

		return result;
	},

	findOneByEmail: async (email: string) => {
		const record = await db<UserTable>('users')
			.where('email', '=', email)
			.first(
				'id',
				'name',
				'nickname',
				'email',
				'password',
				'photo',
				'created_at',
				'updated_at'
			);

		if (!record) {
			return null;
		}

		const result: UserTable = record;

		return result;
	},

	update: async (id: string, input: Partial<UserTableInput>) => {
		const record = await db<UserTable>('users')
			.where('id', '=', id)
			.update({ ...input, updated_at: db.fn.now() })
			.returning([
				'id',
				'name',
				'nickname',
				'email',
				'password',
				'photo',
				'created_at',
				'updated_at',
			])
			.first();

		if (!record) {
			return null;
		}

		const result: UserTable = record;

		return result;
	},

	remove: async (id: string) => {
		const record = await db<UserTable>('users')
			.where('id', '=', id)
			.delete()
			.returning([
				'id',
				'name',
				'nickname',
				'email',
				'password',
				'photo',
				'created_at',
				'updated_at',
			])
			.first();

		if (!record) {
			return null;
		}

		const result: UserTable = record;

		return result;
	},
};
