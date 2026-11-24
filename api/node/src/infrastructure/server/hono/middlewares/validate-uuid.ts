import type { Context, Next } from 'hono';
import type { IHttpRequestParams } from '../../../../presentation/interfaces/http.interface.js';
import type { IRequestIdParams } from '../../../../presentation/interfaces/request.interface.js';
import { UuidValidatorController } from '../../../../presentation/modules/common/commands/controllers/uuid-validator.controller.js';
import { getHeaders, getParams } from '../helpers/request.js';

export function validateUuid() {
	return async (context: Context, next: Next) => {
		const req: IHttpRequestParams<IRequestIdParams> = {
			headers: getHeaders(context),
			params: getParams<IRequestIdParams>(context),
		};

		const controller = new UuidValidatorController(req);
		controller.execute();

		await next();
	};
}
