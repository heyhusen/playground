import type { Context } from 'hono';
import type { IBaseRequestHeader } from '../../../../presentation/interfaces/request.interface.js';
import { parseQuery } from './parse-query.js';

export async function getBody(context: Context): Promise<unknown> {
	if (!['POST', 'PUT', 'PATCH'].includes(context.req.method)) {
		return undefined;
	}

	try {
		const body: unknown = await context.req.json();

		return body;
	} catch {
		return undefined;
	}
}

export function getHeaders(context: Context): IBaseRequestHeader {
	return context.req.raw.headers as unknown as IBaseRequestHeader;
}

export function getParams<Params>(context: Context): Params {
	return context.req.param() as Params;
}

export function getQuery<Query>(context: Context): Query {
	return parseQuery(new URL(context.req.url).search) as Query;
}
