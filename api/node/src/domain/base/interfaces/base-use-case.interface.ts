import { BaseEntity } from '../../entities/base.entity';
import { IBasePaginatedResponse } from './base-response.interface';

export interface IBaseCoreUseCase<Response> {
	execute: () => Response;
}

export type IBaseUseCase<Entity extends BaseEntity> = IBaseCoreUseCase<
	Promise<Entity>
>;

export type IBasePaginatedUseCase<Entity extends BaseEntity> = IBaseCoreUseCase<
	Promise<IBasePaginatedResponse<Entity>>
>;
