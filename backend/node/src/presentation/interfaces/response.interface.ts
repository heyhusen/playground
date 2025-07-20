import type { IBasePaginatedResponse } from '../../domain/base/interfaces/base-response.interface';
import type { BaseEntity } from '../../domain/entities/base.entity';

export interface ICoreResponse<Data> {
	status: number;
	data?: Data | Data[];
}

export interface IResponse<Entity extends BaseEntity>
	extends ICoreResponse<Entity> {
	status: number;
	data?: Entity | Entity[];
	meta?: IBasePaginatedResponse<Entity>['meta'];
	cookie?: {
		name: string;
		value: string;
		maxAge: number;
	};
}
