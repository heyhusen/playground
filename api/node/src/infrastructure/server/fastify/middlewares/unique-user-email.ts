import type { FastifyRequest } from 'fastify';
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

export function uniqueUserEmail() {
	return async (
		request: FastifyRequest<{
			Params: Pick<UserEntity, 'id'>;
			Body: IJsonApiData<Pick<IUpdateUserDTO, 'email' | 'id'>>;
		}>
	) => {
		const unitOfWork = new UnitOfWork();
		const scope = request.params?.id
			? `update:${request.params.id}`
			: request.body.data?.id
				? `update:${request.body.data.id}`
				: 'create';
		if (
			await idempotencyService.peek(
				scope,
				(request.headers as IBaseRequest).idempotency_key,
				idempotencyFingerprint(request.body)
			)
		) {
			return;
		}

		if (!request.params?.id && request.body.data?.id) {
			Object.assign(request.params, {
				id: request.body.data.id,
			});
		}

		const controller = new UniqueUserEmailController(unitOfWork, {
			headers: request.headers,
			body: request.body.data.attributes,
			params: request.params,
		});

		await controller.execute();
	};
}
