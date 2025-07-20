import { BaseEntity } from '../../entities/base.entity';
import { IBasePaginatedResponse } from './base-response.interface';

export interface IBaseReadRepository<Entity extends BaseEntity> {
	read: (entityId: string) => Promise<Entity>;

	readAll: (
		page: number,
		limit: number,
		options: any
	) => Promise<IBasePaginatedResponse<Entity>>;
}

export interface IBaseRepository<Entity extends BaseEntity>
	extends IBaseReadRepository<Entity> {
	create: (data: Entity) => Promise<Entity>;

	update: (entityId: string, data: Partial<Entity>) => Promise<Entity>;

	delete: (entityId: string) => Promise<Entity>;
}
