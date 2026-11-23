import type { Context, Next } from 'hono';
import { ZodObject } from 'zod';
import { getBody, getQuery } from '../helpers/request';

export function validate(schema: ZodObject) {
	return async (context: Context, next: Next) => {
		await schema.parseAsync({
			body: await getBody(context),
			query: getQuery(context),
			params: context.req.param(),
		});

		await next();
	};
}
