import type {
	UserRefreshRequest,
	UserRequest,
} from '../../core/interfaces/auth.interface';
import type { File } from '../../core/entities/common.entity';

export interface HttpRequest<
	Header = Record<string, unknown>,
	Params = Record<string, unknown>,
	Body = Record<string, unknown>,
	Cookie = Record<string, unknown>,
	User = UserRequest | UserRefreshRequest | Record<string, unknown>
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

export type HttpRequestUser<T = UserRequest | UserRefreshRequest> = HttpRequest<
	unknown,
	unknown,
	unknown,
	unknown,
	T
>;

export interface BearerTokenHeader {
	authorization: string | undefined;
}

export interface RefreshTokenCookie {
	refresh_token: string | undefined;
}
