import type { NextFunction, Request, Response } from 'express';
import type { HttpError } from 'http-errors';
import createHttpError from 'http-errors';
import { AuthException } from '../../../core/exceptions/auth.exception';

export function notFoundHandler() {
	return (_req: Request, _res: Response, next: NextFunction) => {
		next(createHttpError(404, 'Resource not found.'));
	};
}

export function errorHandler() {
	return (
		err: HttpError,
		_req: Request,
		res: Response,
		_next: NextFunction
	) => {
		const { status, name, message } = err;

		let response: object = {
			errors: [{ status, title: name, detail: message }],
		};

		if (err instanceof AuthException) {
			response = { error: name, error_description: message };
		}

		res.status(status || 500).json(response);
	};
}
