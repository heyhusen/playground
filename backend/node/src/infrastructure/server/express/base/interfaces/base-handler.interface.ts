import { Request, Response } from 'express';
import { DataDocument, Dictionary } from 'ts-japi';
import { BaseEntity } from '../../../../../domain/entities/base.entity';
import {
	IJsonApiData,
	RequestParamId,
} from '../../../../../presentation/interfaces/http.interface';

export interface IBaseHandler<Entity extends BaseEntity> {
	create: <DTO extends Dictionary<any>>(
		request: Request<unknown, unknown, IJsonApiData<DTO>>,
		response: Response<Partial<DataDocument<Entity>>>
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
