import type { NextFunction, Request, Response } from 'express';
import { ValidationError } from 'express-json-validator-middleware';
import type {
	BearerTokenError,
	JsonApiError,
	JsonApiErrorObject,
} from '../../../adapters/interfaces/http.interface';
import { BearerTokenException } from '../../../core/exceptions/bearer-token.exception';
import { NotFoundException } from '../../../core/exceptions/not-found.exception';
import type { HttpError } from '../../../core/interfaces/http.interface';

export function notFoundHandler() {
	return (_req: Request, _res: Response, next: NextFunction) => {
		next(new NotFoundException('Resource not found.'));
	};
}

export function errorHandler() {
	return (err: HttpError, req: Request, res: Response, _next: NextFunction) => {
		const { name, message } = err;
		let { status } = err;

		let response: JsonApiError | BearerTokenError = {
			jsonapi: { version: '1.0' },
			links: { self: req.path },
			errors: [{ status, title: name, detail: message }],
		};

		if (err instanceof ValidationError) {
			if (err.validationErrors.body) {
				response = {
					...response,
					errors: err.validationErrors.body.map<JsonApiErrorObject>((item) => {
						return {
							status: 400,
							title: 'Bad Request',
							detail: item.message as string,
						};
					}),
				};
			}

			status = 400;
		} else if (err instanceof BearerTokenException) {
			response = { error: name, error_description: message };
		}

		res.status(status || 500).json(response);
	};
}
