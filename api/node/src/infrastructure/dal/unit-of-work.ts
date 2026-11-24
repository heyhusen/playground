import { ExtractTablesWithRelations } from 'drizzle-orm';
import {
	NodePgDatabase,
	NodePgQueryResultHKT,
} from 'drizzle-orm/node-postgres';
import { PgTransaction } from 'drizzle-orm/pg-core';
import { IUserRepository } from '../../domain/modules/users/commands/interfaces/user-repository.interface.js';
import { IUserReadRepository } from '../../domain/modules/users/queries/interfaces/user-repository-read.interface.js';
import { IBaseUnitOfWork } from '../../presentation/base/interfaces/base-unit-of-work.interface.js';
import { BaseUnitOfWork } from '../base/base.unit-of-work.js';
import { db } from '../ports/database.js';
import { UserReadRepository } from './repositories/user-read.repository.js';
import { UserRepository } from './repositories/user.repository.js';
import * as schema from './schemas/index.js';

export class UnitOfWork extends BaseUnitOfWork implements IBaseUnitOfWork {
	private readonly dbx: NodePgDatabase<typeof schema>;

	constructor() {
		super();

		this.dbx = db;
	}

	async transaction<Result = any>(
		callback: (
			trx: PgTransaction<
				NodePgQueryResultHKT,
				typeof schema,
				ExtractTablesWithRelations<typeof schema>
			>
		) => Promise<Result>
	) {
		return this.dbx.transaction<Result>(async (tx) => {
			return callback(tx);
		});
	}

	// eslint-disable-next-line class-methods-use-this
	getUserRepository(
		trx: PgTransaction<
			NodePgQueryResultHKT,
			typeof schema,
			ExtractTablesWithRelations<typeof schema>
		>
	): IUserRepository {
		const repository = new UserRepository(trx);

		return repository;
	}

	override getUserReadRepository(): IUserReadRepository {
		const repository = new UserReadRepository(this.dbx);

		return repository;
	}
}
