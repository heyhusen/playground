import { BaseEntity } from 'src/domain/entities/base.entity';
import { IBaseRequestHeader } from 'src/presentation/interfaces/request.interface';
import { Dictionary } from 'ts-japi';
import {
	IHttpRequest,
	IHttpRequestBody,
	IHttpRequestParams,
	IJsonApiData,
	IJsonApiPagination,
	RequestParamId,
} from '../../interfaces/http.interface';
import { IResponse } from '../../interfaces/response.interface';

export interface IBaseController<
	CreateDTO extends Dictionary<any>,
	UpdateDTO extends Dictionary<any>,
	Entity extends BaseEntity,
> {
	create: (
		request: IHttpRequestBody<IJsonApiData<CreateDTO>>
	) => Promise<IResponse<Entity>>;

	update: (
		request: IHttpRequest<
			IBaseRequestHeader,
			RequestParamId,
			IJsonApiData<UpdateDTO>
		>
	) => Promise<IResponse<Entity>>;

	delete: (
		request: IHttpRequestParams<RequestParamId>
	) => Promise<IResponse<Entity>>;

	readAll: <Options>(
		request: IHttpRequest<IBaseRequestHeader, IJsonApiPagination<Entity>>,
		options: Options
	) => Promise<IResponse<Entity>>;

	read: (
		request: IHttpRequestParams<RequestParamId>
	) => Promise<IResponse<Entity>>;
}
