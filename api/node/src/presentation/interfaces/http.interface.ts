import type {
	DataDocument,
	Dictionary,
	ErrorDocument,
	JapiError,
} from 'ts-japi';
import { BaseEntity } from '../../domain/entities/base.entity.js';
import type { FileEntity } from '../../domain/entities/file.entity.js';
import { IBaseRequestHeader } from './request.interface.js';

export interface IHttpRequest<
	Header extends IBaseRequestHeader,
	Params = Record<string, unknown>,
	Body = Record<string, unknown>,
	Cookie = Record<string, unknown>,
	User = Record<string, unknown>,
> {
	headers: Header;
	params?: Params;
	body?: Body;
	file?: FileEntity;
	user?: User;
	cookies?: Cookie;
}

export type IHttpRequestParams<T = Record<string, unknown>> = IHttpRequest<
	IBaseRequestHeader,
	T
>;

export type IHttpRequestBody<T = Record<string, unknown>> = IHttpRequest<
	IBaseRequestHeader,
	unknown,
	T
>;

export type IHttpRequestCookie<T = Record<string, unknown>> = IHttpRequest<
	IBaseRequestHeader,
	unknown,
	unknown,
	T
>;

// Under NodeNext, a default import of this CJS module resolves to the module
// namespace; the inline import type reaches the class itself.
type Resource<T> = import('ts-japi/lib/models/resource.model.js').default<T>;

export interface IJsonApiData<Entity extends Dictionary<any>> extends Omit<
	DataDocument<Entity>,
	'data'
> {
	data: Omit<Resource<Entity>, 'attributes' | 'getKey'> & {
		attributes: Entity;
	};
}

export interface IJsonApiError extends Omit<ErrorDocument, 'errors'> {
	errors: Omit<JapiError, 'stack'>[];
}

export interface IJsonApiPagination<FilterEntity = any> {
	page: {
		number: number;
		size: number;
	};
	filter: Partial<FilterEntity>;
}

export type RequestParamId = Pick<BaseEntity, 'id'>;

export interface IBaseErrorObject {
	message: string;
}

export interface IHttpError extends Error {
	status: number;
	statusCode: number;
	error?: IBaseErrorObject | Record<string, unknown>;
}
