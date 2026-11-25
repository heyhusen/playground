import { BaseEntity } from '../../entities/base.entity.js';
import { IBasePaginatedResponse } from './base-response.interface.js';

export interface IBaseReadRepository<Entity extends BaseEntity> {
	read: (entityId: string) => Promise<Entity>;

	readAll: (
		page: number,
		limit: number,
		options: any
	) => Promise<IBasePaginatedResponse<Entity>>;
}

export interface IBaseRepository<
	Entity extends BaseEntity,
> extends IBaseReadRepository<Entity> {
	create: (data: Entity) => Promise<Entity>;

	/**
	 * Increments the version by one on every update. When `expectedVersion` is
	 * supplied the update is guarded by it and a stale value throws a conflict
	 * error; when omitted the update is unconditional (no version check).
	 *
	 * Returns `undefined` when the entity does not exist.
	 */
	update: (
		entityId: string,
		expectedVersion: number | undefined,
		data: Partial<Entity>
	) => Promise<Entity>;

	delete: (entityId: string) => Promise<Entity>;
}
