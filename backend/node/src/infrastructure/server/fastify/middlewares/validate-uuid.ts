import type { FastifyRequest } from 'fastify';
import type { IHttpRequestParams } from '../../../../presentation/interfaces/http.interface';
import type { IRequestIdParams } from '../../../../presentation/interfaces/request.interface';
import { UuidValidatorController } from '../../../../presentation/modules/common/commands/controllers/uuid-validator.controller';

export function validateUuid() {
	return (request: FastifyRequest<{ Params: IRequestIdParams }>) => {
		const req: IHttpRequestParams<IRequestIdParams> = {
			headers: request.headers,
			params: request.params,
		};

		const controller = new UuidValidatorController(req);
		controller.execute();
	};
}
