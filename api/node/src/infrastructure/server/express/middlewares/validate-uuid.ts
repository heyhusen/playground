import type { NextFunction, Request, Response } from 'express';
import type { IHttpRequestParams } from '../../../../presentation/interfaces/http.interface';
import type { IRequestIdParams } from '../../../../presentation/interfaces/request.interface';
import { UuidValidatorController } from '../../../../presentation/modules/common/commands/controllers/uuid-validator.controller';

export function validateUuid() {
	return (
		request: Request<IRequestIdParams>,
		_response: Response,
		next: NextFunction
	) => {
		const req: IHttpRequestParams<IRequestIdParams> = {
			headers: request.headers,
			params: request.params,
		};

		const controller = new UuidValidatorController(req);
		controller.execute();

		next();
	};
}
