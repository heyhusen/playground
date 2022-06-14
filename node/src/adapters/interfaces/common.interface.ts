import type { HttpRequest } from './http.interface';

export interface RequestIdParams {
	id: string;
}

export type Controller = (
	req: HttpRequest
) => ResponseModel<unknown> | Promise<ResponseModel<unknown>>;

export interface ResponseModel<Model = null> {
	status: number;
	cookie?: {
		name: string;
		value: string;
		maxAge: number;
	};
	data?: Model;
}
