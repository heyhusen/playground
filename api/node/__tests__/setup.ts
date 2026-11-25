import { faker } from '@faker-js/faker';
import { reset } from 'drizzle-seed';
import {
	BaseUserEntity,
	UserEntity,
} from '../src/domain/modules/users/commands/entities/user.entity.js';
import * as schema from '../src/infrastructure/dal/schemas/index.js';
import { UnitOfWork } from '../src/infrastructure/dal/unit-of-work.js';
import { db } from '../src/infrastructure/ports/database.js';
import { redis } from '../src/infrastructure/ports/redis.js';

export const user: UserEntity = {
	id: faker.string.uuid({ version: 7 }),
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

const { id: _id, ...tempUser } = user;

export const testUser: BaseUserEntity = {
	...tempUser,
	first_name: faker.person.firstName(),
	last_name: faker.person.lastName(),
	email: faker.internet.email(),
};

export async function setup() {
	const uow = new UnitOfWork();

	// Idempotency keys from a previous suite must never replay into this one.
	await redis.flushdb();
	await reset(db, schema);

	await uow.transaction(async (trx) => {
		const repository = uow.getUserRepository(trx);

		await repository.create(user);
	});
}
