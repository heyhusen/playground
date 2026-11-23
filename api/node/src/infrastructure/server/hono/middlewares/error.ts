import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import { ZodError } from 'zod';
import { HttpException } from '../../../../presentation/exceptions/http.exception';
import { NotFoundException } from '../../../../presentation/exceptions/not-found.exception';
import type { IJsonApiError } from '../../../../presentation/interfaces/http.interface';
import { Logger } from '../../../ports/logger';

function buildHttpError(error: Error): {
	status: number;
	response: IJsonApiError;
} {
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

	return httpError;
}

function sendError(httpError: ReturnType<typeof buildHttpError>) {
	return new Response(JSON.stringify(httpError.response), {
		status: httpError.status,
		headers: { 'Content-Type': 'application/json' },
	});
}

export function notFoundHandler() {
	return () => {
		return sendError(
			buildHttpError(new NotFoundException(ReasonPhrases.NOT_FOUND))
		);
	};
}

export function globalErrorHandler() {
	const logger = new Logger();

	return (error: Error) => {
		logger.error(error.message, error);

		return sendError(buildHttpError(error));
	};
}
