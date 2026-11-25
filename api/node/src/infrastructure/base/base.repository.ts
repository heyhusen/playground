import { and, eq, ExtractTablesWithRelations, SQL, sql } from 'drizzle-orm';
import { NodePgQueryResultHKT } from 'drizzle-orm/node-postgres';
import { PgTableWithColumns, PgTransaction } from 'drizzle-orm/pg-core';
import type { IBaseRepository } from '../../domain/base/interfaces/base-repository.interface.js';
import type { IBasePaginatedResponse } from '../../domain/base/interfaces/base-response.interface.js';
import type { BaseEntity } from '../../domain/entities/base.entity.js';
import { getMessage } from '../../domain/helpers/get-message.helper.js';
import { ConflictException } from '../../presentation/exceptions/conflict.exception.js';

export class BaseRepository<
	Entity extends BaseEntity,
> implements IBaseRepository<Entity> {
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

	async update(
		id: string,
		expectedVersion: number | undefined,
		data: Partial<Entity>
	): Promise<Entity> {
		// The version check and the increment happen in the same atomic UPDATE.
		// Omitting the expected version skips the guard (last write wins) but
		// the version is still incremented for every successful write.
		const conditions = [eq(this.entitySchema.id, id)];
		if (expectedVersion !== undefined) {
			conditions.push(eq(this.entitySchema.version, expectedVersion));
		}

		const entities = await this.trx
			.update(this.entitySchema)
			.set({
				...data,
				version: sql`${this.entitySchema.version} + 1`,
			})
			.where(and(...conditions))
			.returning();

		if (entities.length) {
			return entities.at(0) as Entity;
		}

		// A guarded update matched nothing. Distinguish a stale version from a
		// missing entity so callers can reply with 409 instead of 404.
		if (expectedVersion !== undefined) {
			const existing = await this.trx
				.select({ id: this.entitySchema.id })
				.from(this.entitySchema)
				.where(eq(this.entitySchema.id, id))
				.limit(1);

			if (existing.length) {
				throw new ConflictException(getMessage('version.conflict'));
			}
		}

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
