import type { Context, Next } from 'hono';
import { UserEntity } from '../../../../domain/modules/users/commands/entities/user.entity';
import type { IUpdateUserDTO } from '../../../../domain/modules/users/commands/interfaces/user-dto.interface';
import type { IJsonApiData } from '../../../../presentation/interfaces/http.interface';
import { UniqueUserEmailController } from '../../../../presentation/modules/common/commands/controllers/unique-user-email.controller';
import { UnitOfWork } from '../../../dal/unit-of-work';
import { getBody, getHeaders, getParams } from '../helpers/request';

export function uniqueUserEmail() {
	return async (context: Context, next: Next) => {
		const unitOfWork = new UnitOfWork();
		const params = {
			...getParams<Pick<UserEntity, 'id'>>(context),
		};
		const body = (await getBody(context)) as IJsonApiData<
			Pick<IUpdateUserDTO, 'email' | 'id'>
		>;

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
