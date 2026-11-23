import type { FastifyRequest } from 'fastify';
import { ZodObject } from 'zod';

export function validate(schema: ZodObject) {
	return async (request: FastifyRequest) => {
		await schema.parseAsync({
			body: request.body,
			query: request.query,
			params: request.params,
		});
	};
}
