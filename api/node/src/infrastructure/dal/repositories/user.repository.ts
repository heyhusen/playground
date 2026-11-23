import { ExtractTablesWithRelations } from 'drizzle-orm';
import { NodePgQueryResultHKT } from 'drizzle-orm/node-postgres';
import { PgTransaction } from 'drizzle-orm/pg-core';
import { UserEntity } from '../../../domain/modules/users/commands/entities/user.entity';
import { IUserRepository } from '../../../domain/modules/users/commands/interfaces/user-repository.interface';
import { BaseRepository } from '../../base/base.repository';
import * as schema from '../schemas';

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
