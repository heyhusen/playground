import type { ErrorObject } from 'ajv';
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

function createErrorArray(arr: ErrorObject[]): JsonApiErrorObject[] {
	return arr
		.filter((item) => item.keyword !== 'if')
		.map<JsonApiErrorObject>((item) => {
			return {
				status: 400,
				title: 'Bad Request',
				detail: item.message as string,
			};
		});
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
			if (err.validationErrors.params) {
				response = {
					...response,
					errors: createErrorArray(err.validationErrors.params),
				};
			} else if (err.validationErrors.query) {
				response = {
					...response,
					errors: createErrorArray(err.validationErrors.query),
				};
			} else if (err.validationErrors.body) {
				response = {
					...response,
					errors: createErrorArray(err.validationErrors.body),
				};
			}

			status = 400;
		} else if (err instanceof BearerTokenException) {
			response = { error: name, error_description: message };
		}

		res.status(status || 500).json(response);
	};
}
