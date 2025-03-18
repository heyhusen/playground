import { faker } from '@faker-js/faker';
import { reset } from 'drizzle-seed';
import type {
	BaseUserEntity,
	UserEntity,
} from '../src/domain/modules/users/entities/user.entity';
import * as schema from '../src/infrastructure/dal/schemas';
import { UnitOfWork } from '../src/infrastructure/dal/unit-of-work';
import { db } from '../src/infrastructure/ports/database';

export const user: UserEntity = {
	id: faker.string.uuid(),
	version: 1,
	cursor: 1,
	first_name: faker.person.firstName(),
	last_name: faker.person.lastName(),
	email: faker.internet.email(),
	created_at: Number(new Date()),
	created_at_timezone_name: 'Asia/Jakarta',
	created_at_timezone_offset: 7,
	updated_at_timezone_name: 'Asia/Jakarta',
	updated_at_timezone_offset: 7,
	updated_at: Number(new Date()),
};

const { id, ...tempUser } = user;

export const testUser: BaseUserEntity = {
	...tempUser,
	first_name: faker.person.firstName(),
	last_name: faker.person.lastName(),
	email: faker.internet.email(),
};

export async function setup() {
	const uow = new UnitOfWork();

	await reset(db, schema);

	await uow.transaction(async (trx) => {
		const repository = uow.getUserRepository(trx);

		await repository.create(user);
	});
}
