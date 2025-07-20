import { BaseEntity } from '../../../domain/entities/base.entity';
import {
	IHttpRequest,
	IHttpRequestParams,
	IJsonApiPagination,
	RequestParamId,
} from '../../interfaces/http.interface';
import { IBaseRequestHeader } from '../../interfaces/request.interface';
import { IResponse } from '../../interfaces/response.interface';

export interface IBaseReadController<Entity extends BaseEntity> {
	readAll: <Options>(
		request: IHttpRequest<IBaseRequestHeader, IJsonApiPagination<Entity>>,
		options: Options
	) => Promise<IResponse<Entity>>;

	read: (
		request: IHttpRequestParams<RequestParamId>
	) => Promise<IResponse<Entity>>;
}
