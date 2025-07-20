import { Dictionary } from 'ts-japi';
import { BaseEntity } from '../../domain/entities/base.entity';
import {
	IHttpRequest,
	IHttpRequestBody,
	IHttpRequestParams,
	IJsonApiData,
	RequestParamId,
} from '../interfaces/http.interface';
import { IBaseRequestHeader } from '../interfaces/request.interface';
import { IResponse } from '../interfaces/response.interface';
import { IBaseController } from './interfaces/base-controller.interface';

export abstract class BaseController<
	CreateDTO extends Dictionary<any>,
	UpdateDTO extends Dictionary<any>,
	Entity extends BaseEntity,
> implements IBaseController<CreateDTO, UpdateDTO, Entity>
{
	abstract create(
		request: IHttpRequestBody<IJsonApiData<CreateDTO>>
	): Promise<IResponse<Entity>>;

	abstract update(
		request: IHttpRequest<
			IBaseRequestHeader,
			RequestParamId,
			IJsonApiData<UpdateDTO>,
			Record<string, unknown>,
			Record<string, unknown>
		>
	): Promise<IResponse<Entity>>;

	abstract delete(
		request: IHttpRequestParams<RequestParamId>
	): Promise<IResponse<Entity>>;
}
