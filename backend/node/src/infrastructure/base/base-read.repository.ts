import { and, eq, SQL } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { PgTableWithColumns } from 'drizzle-orm/pg-core';
import type { IBasePaginatedResponse } from 'src/domain/base/interfaces/base-response.interface';
import type { IBaseReadRepository } from '../../domain/base/interfaces/base-repository.interface';
import type { BaseEntity } from '../../domain/entities/base.entity';

export class BaseReadRepository<Entity extends BaseEntity>
	implements IBaseReadRepository<Entity>
{
	constructor(
		protected readonly db: NodePgDatabase<any>,
		protected readonly entitySchema: PgTableWithColumns<any>
	) {}

	async readAll(
		page: number,
		limit: number,
		options: SQL[] = []
	): Promise<IBasePaginatedResponse<Entity>> {
		const [entities, total] = await Promise.all([
			this.db
				.select()
				.from(this.entitySchema)
				.where(and(...options))
				.limit(limit)
				.offset((page - 1) * limit),
			this.db.$count(this.entitySchema, and(...options)),
		]);

		return {
			data: entities,
			meta: {
				page,
				limit,
				total,
			},
		};
	}

	async read(id: string): Promise<Entity> {
		const entities = await this.db
			.select()
			.from(this.entitySchema)
			.where(eq(this.entitySchema.id, id));

		return entities.at(0) as Entity;
	}
}
