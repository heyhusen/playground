/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable import/no-extraneous-dependencies */
import { faker } from '@faker-js/faker';
import { reset, seed } from 'drizzle-seed';
import { db } from '../ports/database';
import * as schema from './schemas';

async function main() {
	await reset(db, schema);

	await seed(db, { users: schema.users }).refine((f) => ({
		users: {
			count: 1,
			columns: {
				id: f.default({ defaultValue: faker.string.uuid() }),
				version: f.default({ defaultValue: 1 }),
				cursor: f.default({ defaultValue: undefined }),
				first_name: f.default({ defaultValue: 'John' }),
				last_name: f.default({ defaultValue: 'Doe' }),
				nickname: f.default({ defaultValue: 'John' }),
				email: f.default({ defaultValue: 'johndoe@example.com' }),
				created_at: f.default({ defaultValue: Number(new Date()) }),
				created_at_timezone_name: f.default({ defaultValue: 'Asia/Jakarta' }),
				created_at_timezone_offset: f.default({ defaultValue: 7 }),
				updated_at: f.default({ defaultValue: Number(new Date()) }),
				updated_at_timezone_name: f.default({ defaultValue: 'Asia/Jakarta' }),
				updated_at_timezone_offset: f.default({ defaultValue: 7 }),
				delete_at: f.default({ defaultValue: null }),
				delete_at_timezone_name: f.default({ defaultValue: null }),
				delete_at_timezone_offset: f.default({ defaultValue: null }),
			},
		},
	}));

	await seed(db, { users: schema.users }).refine((f) => ({
		users: {
			count: 50,
			columns: {
				id: f.uuid(),
				version: f.default({ defaultValue: 1 }),
				cursor: f.default({ defaultValue: undefined }),
				first_name: f.firstName(),
				last_name: f.lastName(),
				nickname: f.firstName(),
				email: f.email(),
				created_at: f.default({ defaultValue: Number(new Date()) }),
				created_at_timezone_name: f.default({ defaultValue: 'Asia/Jakarta' }),
				created_at_timezone_offset: f.default({ defaultValue: 7 }),
				updated_at: f.default({ defaultValue: Number(new Date()) }),
				updated_at_timezone_name: f.default({ defaultValue: 'Asia/Jakarta' }),
				updated_at_timezone_offset: f.default({ defaultValue: 7 }),
				delete_at: f.default({ defaultValue: null }),
				delete_at_timezone_name: f.default({ defaultValue: null }),
				delete_at_timezone_offset: f.default({ defaultValue: null }),
			},
		},
	}));
}

main();
