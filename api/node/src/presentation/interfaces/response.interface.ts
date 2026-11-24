import type { IBasePaginatedResponse } from '../../domain/base/interfaces/base-response.interface.js';
import type { BaseEntity } from '../../domain/entities/base.entity.js';

export interface ICoreResponse<Data> {
	status: number;
	data?: Data | Data[];
}

export interface IResponse<
	Entity extends BaseEntity,
> extends ICoreResponse<Entity> {
	status: number;
	data?: Entity | Entity[];
	meta?: IBasePaginatedResponse<Entity>['meta'];
	cookie?: {
		name: string;
		value: string;
		maxAge: number;
	};
}
