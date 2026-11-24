import { Dictionary } from 'ts-japi';
import { BaseEntity } from '../../../domain/entities/base.entity.js';
import {
	IHttpRequest,
	IHttpRequestBody,
	IHttpRequestParams,
	IJsonApiData,
	RequestParamId,
} from '../../interfaces/http.interface.js';
import { IBaseRequestHeader } from '../../interfaces/request.interface.js';
import { IResponse } from '../../interfaces/response.interface.js';

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
}
