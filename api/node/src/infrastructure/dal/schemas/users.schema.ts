import { pgTable, varchar } from 'drizzle-orm/pg-core';
import { baseSchema } from './base.schema';

export const users = pgTable('users', {
	...baseSchema,
	first_name: varchar({ length: 256 }).notNull(),
	last_name: varchar({ length: 256 }),
	nickname: varchar({ length: 256 }),
	email: varchar({ length: 256 }).unique().notNull(),
});
