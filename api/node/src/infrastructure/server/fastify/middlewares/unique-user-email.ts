import type { FastifyRequest } from 'fastify';
import { UserEntity } from '../../../../domain/modules/users/commands/entities/user.entity.js';
import type { IUpdateUserDTO } from '../../../../domain/modules/users/commands/interfaces/user-dto.interface.js';
import type { IJsonApiData } from '../../../../presentation/interfaces/http.interface.js';
import { UniqueUserEmailController } from '../../../../presentation/modules/common/commands/controllers/unique-user-email.controller.js';
import { UnitOfWork } from '../../../dal/unit-of-work.js';

export function uniqueUserEmail() {
	return async (
		request: FastifyRequest<{
			Params: Pick<UserEntity, 'id'>;
			Body: IJsonApiData<Pick<IUpdateUserDTO, 'email' | 'id'>>;
		}>
	) => {
		const unitOfWork = new UnitOfWork();

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
