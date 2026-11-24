import { BaseEntity } from '../../../domain/entities/base.entity.js';
import {
	IHttpRequest,
	IHttpRequestParams,
	IJsonApiPagination,
	RequestParamId,
} from '../../interfaces/http.interface.js';
import { IBaseRequestHeader } from '../../interfaces/request.interface.js';
import { IResponse } from '../../interfaces/response.interface.js';

export interface IBaseReadController<Entity extends BaseEntity> {
	readAll: <Options>(
		request: IHttpRequest<IBaseRequestHeader, IJsonApiPagination<Entity>>,
		options: Options
	) => Promise<IResponse<Entity>>;

	read: (
		request: IHttpRequestParams<RequestParamId>
	) => Promise<IResponse<Entity>>;
}
