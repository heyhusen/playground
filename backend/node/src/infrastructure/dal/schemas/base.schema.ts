import { bigint, bigserial, integer, uuid, varchar } from 'drizzle-orm/pg-core';

export const baseSchema = {
	id: uuid().primaryKey().defaultRandom().notNull(),
	version: bigint({ mode: 'number' }).default(1).notNull(),
	cursor: bigserial({ mode: 'number' }).notNull(),
	created_at: bigint({ mode: 'number' }).notNull(),
	updated_at: bigint({ mode: 'number' }).notNull(),
	created_at_timezone_name: varchar({ length: 20 }).notNull(),
	created_at_timezone_offset: integer().notNull(),
	updated_at_timezone_name: varchar({ length: 20 }).notNull(),
	updated_at_timezone_offset: integer().notNull(),
	delete_at: bigint({ mode: 'number' }),
	delete_at_timezone_name: varchar({ length: 20 }),
	delete_at_timezone_offset: integer(),
};
