import { and, eq, ExtractTablesWithRelations, SQL } from 'drizzle-orm';
import { NodePgQueryResultHKT } from 'drizzle-orm/node-postgres';
import { PgTableWithColumns, PgTransaction } from 'drizzle-orm/pg-core';
import type { IBaseRepository } from '../../domain/base/interfaces/base-repository.interface';
import type { IBasePaginatedResponse } from '../../domain/base/interfaces/base-response.interface';
import type { BaseEntity } from '../../domain/entities/base.entity';

export class BaseRepository<Entity extends BaseEntity>
	implements IBaseRepository<Entity>
{
	constructor(
		protected readonly trx: PgTransaction<
			NodePgQueryResultHKT,
			any,
			ExtractTablesWithRelations<any>
		>,
		protected readonly entitySchema: PgTableWithColumns<any>
	) {}

	async create(data: Entity): Promise<Entity> {
		const entities = await this.trx
			.insert(this.entitySchema)
			.values(data)
			.returning();

		return entities.at(0) as Entity;
	}

	async readAll(
		page: number,
		limit: number,
		options: SQL[] = []
	): Promise<IBasePaginatedResponse<Entity>> {
		const [entities, total] = await Promise.all([
			this.trx
				.select()
				.from(this.entitySchema)
				.where(and(...options))
				.limit(limit)
				.offset((page - 1) * limit),
			this.trx.$count(this.entitySchema, and(...options)),
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
		const entities = await this.trx
			.select()
			.from(this.entitySchema)
			.where(eq(this.entitySchema.id, id));

		return entities.at(0) as Entity;
	}

	async update(id: string, data: Partial<Entity>): Promise<Entity> {
		const entities = await this.trx
			.update(this.entitySchema)
			.set(data)
			.where(eq(this.entitySchema.id, id))
			.returning();

		return entities.at(0) as Entity;
	}

	async delete(id: string): Promise<Entity> {
		const entities = await this.trx
			.delete(this.entitySchema)
			.where(eq(this.entitySchema.id, id))
			.returning();

		return entities.at(0) as Entity;
	}
}
