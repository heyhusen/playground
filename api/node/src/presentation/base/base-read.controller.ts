import { BaseEntity } from '../../domain/entities/base.entity.js';
import {
	IHttpRequest,
	IHttpRequestParams,
	IJsonApiPagination,
	RequestParamId,
} from '../interfaces/http.interface.js';
import { IBaseRequestHeader } from '../interfaces/request.interface.js';
import { IResponse } from '../interfaces/response.interface.js';
import { IBaseReadController } from './interfaces/base-read-controller.interface.js';

export abstract class BaseReadController<
	Entity extends BaseEntity,
> implements IBaseReadController<Entity> {
	abstract readAll<Options>(
		request: IHttpRequest<IBaseRequestHeader, IJsonApiPagination>,
		options: Options
	): Promise<IResponse<Entity>>;

	abstract read(
		request: IHttpRequestParams<RequestParamId>
	): Promise<IResponse<Entity>>;
}
