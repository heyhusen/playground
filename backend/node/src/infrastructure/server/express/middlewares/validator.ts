import { NextFunction, Request, Response } from 'express';
import { AnyZodObject } from 'zod';

export function validate(schema: AnyZodObject) {
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
