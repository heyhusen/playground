import { ExtractTablesWithRelations } from 'drizzle-orm';
import { NodePgQueryResultHKT } from 'drizzle-orm/node-postgres';
import { PgTransaction } from 'drizzle-orm/pg-core';
import { UserEntity } from '../../../domain/modules/users/commands/entities/user.entity.js';
import { IUserRepository } from '../../../domain/modules/users/commands/interfaces/user-repository.interface.js';
import { BaseRepository } from '../../base/base.repository.js';
import * as schema from '../schemas/index.js';

export class UserRepository
	extends BaseRepository<UserEntity>
	implements IUserRepository
{
	constructor(
		protected override readonly trx: PgTransaction<
			NodePgQueryResultHKT,
			typeof schema,
			ExtractTablesWithRelations<typeof schema>
		>
	) {
		super(trx, schema.users);
	}
}
