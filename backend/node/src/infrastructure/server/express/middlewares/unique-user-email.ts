import type { NextFunction, Request, Response } from 'express';
import { UserEntity } from '../../../../domain/modules/users/entities/user.entity';
import type { IUpdateUserDTO } from '../../../../domain/modules/users/interfaces/user-dto.interface';
import type { IJsonApiData } from '../../../../presentation/interfaces/http.interface';
import { UniqueUserEmailController } from '../../../../presentation/modules/common/controllers/unique-user-email.controller';
import { UnitOfWork } from '../../../dal/unit-of-work';

export function uniqueUserEmail() {
	return async (
		request: Request<
			Pick<UserEntity, 'id'>,
			unknown,
			IJsonApiData<Pick<IUpdateUserDTO, 'email' | 'id'>>
		>,
		_response: Response,
		next: NextFunction
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

		next();
	};
}
