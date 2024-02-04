import type { File } from '../../core/entities/common.entity';

export interface HttpRequest<
	Header = Record<string, unknown>,
	Params = Record<string, unknown>,
	Body = Record<string, unknown>,
	Cookie = Record<string, unknown>,
	User = Record<string, unknown>
> {
	headers?: Header;
	params?: Params;
	body?: Body;
	file?: File;
	user?: User;
	cookies?: Cookie;
}

export type HttpRequestParams<T = Record<string, unknown>> = HttpRequest<
	unknown,
	T
>;

export type HttpRequestBody<T = Record<string, unknown>> = HttpRequest<
	unknown,
	unknown,
	T
>;

export type HttpRequestCookie<T = Record<string, unknown>> = HttpRequest<
	unknown,
	unknown,
	unknown,
	T
>;

export interface JsonApi {
	jsonapi: {
		version: string;
	};
	links: {
		self: string;
	};
}

export interface JsonApiDataObject<Attributes = Record<string, unknown>> {
	type: string;
	id: string;
	attributes: Attributes;
}

export interface JsonApiData<Attributes = Record<string, unknown>>
	extends JsonApi {
	data: JsonApiDataObject<Attributes>;
}

export interface JsonApiErrorObject {
	status: number;
	title: string;
	detail: string;
	source?: {
		pointer?: string;
		parameter?: string;
	};
}

export interface JsonApiError extends JsonApi {
	errors: JsonApiErrorObject[];
}

export interface JsonApiPagination {
	page: {
		number: number;
		size: number;
	};
}
