import type { Context, Next } from 'hono';
import type { IBaseRequest } from '../../../../domain/base/interfaces/base-request.interface.js';
import { UserEntity } from '../../../../domain/modules/users/commands/entities/user.entity.js';
import type { IUpdateUserDTO } from '../../../../domain/modules/users/commands/interfaces/user-dto.interface.js';
import type { IJsonApiData } from '../../../../presentation/interfaces/http.interface.js';
import { UniqueUserEmailController } from '../../../../presentation/modules/common/commands/controllers/unique-user-email.controller.js';
import { UnitOfWork } from '../../../dal/unit-of-work.js';
import {
	idempotencyFingerprint,
	idempotencyService,
} from '../../../services/idempotency.service.js';
import { getBody, getHeaders, getParams } from '../helpers/request.js';

export function uniqueUserEmail() {
	return async (context: Context, next: Next) => {
		const unitOfWork = new UnitOfWork();
		const params = {
			...getParams<Pick<UserEntity, 'id'>>(context),
		};
		const body = (await getBody(context)) as IJsonApiData<
			Pick<IUpdateUserDTO, 'email' | 'id'>
		>;
		const scope = params.id
			? `update:${params.id}`
			: body.data?.id
				? `update:${body.data.id}`
				: 'create';
		if (
			await idempotencyService.peek(
				scope,
				(getHeaders(context) as IBaseRequest).idempotency_key,
				idempotencyFingerprint(body)
			)
		) {
			await next();

			return;
		}

		if (!params.id && body.data?.id) {
			Object.assign(params, {
				id: body.data.id,
			});
		}

		const controller = new UniqueUserEmailController(unitOfWork, {
			headers: getHeaders(context),
			body: body.data.attributes,
			params,
		});

		await controller.execute();

		await next();
	};
}
