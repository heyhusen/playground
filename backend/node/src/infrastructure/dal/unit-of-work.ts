import { ExtractTablesWithRelations } from 'drizzle-orm';
import {
	NodePgDatabase,
	NodePgQueryResultHKT,
} from 'drizzle-orm/node-postgres';
import { PgTransaction } from 'drizzle-orm/pg-core';
import {
	IUserReadRepository,
	IUserRepository,
} from 'src/domain/modules/users/interfaces/user-repository.interface';
import { IBaseUnitOfWork } from 'src/presentation/base/interfaces/base-unit-of-work.interface';
import { BaseUnitOfWork } from '../base/base.unit-of-work';
import { db } from '../ports/database';
import { UserReadRepository } from './repositories/user-read.repository';
import { UserRepository } from './repositories/user.repository';
import * as schema from './schemas';

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
