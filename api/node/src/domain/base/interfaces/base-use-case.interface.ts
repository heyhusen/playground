import { BaseEntity } from '../../entities/base.entity.js';
import { IBasePaginatedResponse } from './base-response.interface.js';

export interface IBaseCoreUseCase<Response> {
	execute: () => Response;
}

export type IBaseUseCase<Entity extends BaseEntity> = IBaseCoreUseCase<
	Promise<Entity>
>;

export type IBasePaginatedUseCase<Entity extends BaseEntity> = IBaseCoreUseCase<
	Promise<IBasePaginatedResponse<Entity>>
>;
