import type { NextFunction, Request, Response } from 'express';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import { ZodError } from 'zod';
import { HttpException } from '../../../../presentation/exceptions/http.exception';
import { NotFoundException } from '../../../../presentation/exceptions/not-found.exception';
import type {
	IHttpError,
	IJsonApiError,
} from '../../../../presentation/interfaces/http.interface';
import { Logger } from '../../../ports/logger';

export function notFoundHandler() {
	return (_request: Request, _response: Response, next: NextFunction) => {
		next(new NotFoundException(ReasonPhrases.NOT_FOUND));
	};
}

export function globalErrorHandler() {
	const logger = new Logger();

	return (
		error: IHttpError,
		_request: Request,
		response: Response,
		_next: NextFunction
	) => {
		const httpError: { status: number; response: IJsonApiError } = {
			status: StatusCodes.INTERNAL_SERVER_ERROR,
			response: {
				jsonapi: {
					version: '1.1',
				},
				errors: [
					{
						status: StatusCodes.INTERNAL_SERVER_ERROR.toString(),
						title: 'Error',
						detail: ReasonPhrases.INTERNAL_SERVER_ERROR,
					},
				],
			},
		};

		if (error instanceof HttpException) {
			const { name, message, status } = error;

			httpError.status = status;
			httpError.response.errors = [
				{
					status: status?.toString(),
					title: name,
					detail: message,
				},
			];
		}

		if (error instanceof ZodError) {
			httpError.status = StatusCodes.UNPROCESSABLE_ENTITY;
			httpError.response.errors = error.issues.map<
				IJsonApiError['errors'][number]
			>((item) => {
				return {
					status: StatusCodes.UNPROCESSABLE_ENTITY.toString(),
					title: ReasonPhrases.UNPROCESSABLE_ENTITY,
					detail: item.message,
				};
			});
		}

		logger.error(error.message, error);

		response.status(httpError.status).json(httpError.response);
	};
}
