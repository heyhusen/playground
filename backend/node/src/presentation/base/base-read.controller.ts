import { BaseEntity } from '../../domain/entities/base.entity';
import {
	IHttpRequest,
	IHttpRequestParams,
	IJsonApiPagination,
	RequestParamId,
} from '../interfaces/http.interface';
import { IBaseRequestHeader } from '../interfaces/request.interface';
import { IResponse } from '../interfaces/response.interface';
import { IBaseReadController } from './interfaces/base-read-controller.interface';

export abstract class BaseReadController<Entity extends BaseEntity>
	implements IBaseReadController<Entity>
{
	abstract readAll<Options>(
		request: IHttpRequest<IBaseRequestHeader, IJsonApiPagination>,
		options: Options
	): Promise<IResponse<Entity>>;

	abstract read(
		request: IHttpRequestParams<RequestParamId>
	): Promise<IResponse<Entity>>;
}
