import { IBaseRequest } from '../../../../domain/base/interfaces/base-request.interface';
import { getMessage } from '../../../../domain/helpers/get-message.helper';
import { UserEntity } from '../../../../domain/modules/users/entities/user.entity';
import { IUpdateUserDTO } from '../../../../domain/modules/users/interfaces/user-dto.interface';
import { UniqueUserEmailUseCase } from '../../../../domain/modules/users/use-cases/unique-user-email.use-case';
import { BaseSingleController } from '../../../base/base-single.controller';
import { IBaseUnitOfWork } from '../../../base/interfaces/base-unit-of-work.interface';
import { BadRequestException } from '../../../exceptions/bad-request.exception';
import { IHttpRequest } from '../../../interfaces/http.interface';
import { IUniqueUserEmailController } from '../interfaces/unique-user-email-controller.interface';

export class UniqueUserEmailController
	extends BaseSingleController<Promise<boolean>>
	implements IUniqueUserEmailController
{
	constructor(
		private readonly unitOfWork: IBaseUnitOfWork,
		private readonly request: IHttpRequest<
			IBaseRequest,
			Pick<UserEntity, 'id'>,
			Pick<IUpdateUserDTO, 'email'>
		>
	) {
		super();
	}

	override async execute(): Promise<boolean> {
		try {
			const repository = this.unitOfWork.getUserReadRepository();
			const useCase = new UniqueUserEmailUseCase(
				repository,
				String(this.request.body?.email),
				this.request.params?.id
			);
			const result = await useCase.execute();

			return result;
		} catch (error) {
			if (
				error instanceof Error &&
				error.message === getMessage('email.unique')
			) {
				throw new BadRequestException(error.message);
			}

			throw error;
		}
	}
}
