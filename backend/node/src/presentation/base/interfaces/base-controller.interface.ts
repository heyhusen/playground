import { Dictionary } from 'ts-japi';
import { BaseEntity } from '../../../domain/entities/base.entity';
import {
	IHttpRequest,
	IHttpRequestBody,
	IHttpRequestParams,
	IJsonApiData,
	RequestParamId,
} from '../../interfaces/http.interface';
import { IBaseRequestHeader } from '../../interfaces/request.interface';
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
}
