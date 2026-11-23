import { NextFunction, Request, Response } from 'express';
import { ZodObject } from 'zod';

export function validate(schema: ZodObject) {
	return async (
		request: Request<unknown, unknown, unknown>,
		_response: Response,
		next: NextFunction
	) => {
		await schema.parseAsync({
			body: request.body,
			query: request.query,
			params: request.params,
		});

		return next();
	};
}
