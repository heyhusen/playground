import { Request, Response } from 'express';
import { DataDocument } from 'ts-japi';
import { BaseEntity } from '../../../../../domain/entities/base.entity';
import {
	IJsonApiPagination,
	RequestParamId,
} from '../../../../../presentation/interfaces/http.interface';

export interface IBaseReadHandler<Entity extends BaseEntity> {
	read: (
		request: Request<RequestParamId>,
		response: Response<Partial<DataDocument<Entity>>>
	) => Promise<void>;

	readAll: <FilterEntity>(
		request: Request<
			unknown,
			unknown,
			unknown,
			IJsonApiPagination<FilterEntity>
		>,
		response: Response<Partial<DataDocument<Entity[]>>>
	) => Promise<void>;
}
