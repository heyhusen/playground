import { Request, Response } from 'express';
import { BaseEntity } from 'src/domain/entities/base.entity';
import {
	IJsonApiData,
	IJsonApiPagination,
	RequestParamId,
} from 'src/presentation/interfaces/http.interface';
import { DataDocument, Dictionary } from 'ts-japi';

export interface IBaseHandler<Entity extends BaseEntity> {
	create: <DTO extends Dictionary<any>>(
		request: Request<unknown, unknown, IJsonApiData<DTO>>,
		response: Response<Partial<DataDocument<Entity>>>
	) => Promise<void>;

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

	update: <DTO extends Dictionary<any>>(
		request: Request<RequestParamId, unknown, IJsonApiData<DTO>>,
		response: Response<Partial<DataDocument<Entity>>>
	) => Promise<void>;

	delete: (
		request: Request<RequestParamId>,
		response: Response
	) => Promise<void>;
}
