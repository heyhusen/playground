import { BaseEntity } from '../../entities/base.entity.js';

export interface IBasePaginatedResponse<Entity extends BaseEntity> {
	data: Entity[];

	meta: {
		page: number;
		limit: number;
		total: number;
	};
}
