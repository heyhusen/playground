import { StatusCodes } from 'http-status-codes';
import { IBaseRequest } from '../../../../../domain/base/interfaces/base-request.interface.js';
import { getMessage } from '../../../../../domain/helpers/get-message.helper.js';
import { IUpdateUserDTO } from '../../../../../domain/modules/users/commands/interfaces/user-dto.interface.js';
import { UniqueUserEmailUseCase } from '../../../../../domain/modules/users/commands/use-cases/unique-user-email.use-case.js';
import { UserReadEntity } from '../../../../../domain/modules/users/queries/entities/user-read.entity.js';
import { ReadAllUserUseCase } from '../../../../../domain/modules/users/queries/use-cases/read-all-user.use-case.js';
import { ReadUserUseCase } from '../../../../../domain/modules/users/queries/use-cases/read-user.use-case.js';
import { BaseReadController } from '../../../../base/base-read.controller.js';
import { IBaseUnitOfWork } from '../../../../base/interfaces/base-unit-of-work.interface.js';
import { BadRequestException } from '../../../../exceptions/bad-request.exception.js';
import { NotFoundException } from '../../../../exceptions/not-found.exception.js';
import {
	IHttpRequest,
	IHttpRequestParams,
	IJsonApiPagination,
	RequestParamId,
} from '../../../../interfaces/http.interface.js';
import { IResponse } from '../../../../interfaces/response.interface.js';
import { IUserReadController } from '../interfaces/user-read-controller.interface.js';

export class UserReadController
	extends BaseReadController<UserReadEntity>
	implements IUserReadController
{
	constructor(private readonly unitOfWork: IBaseUnitOfWork) {
		super();
	}

	override async readAll<FilterEntity, Options>(
		request: IHttpRequest<IBaseRequest, IJsonApiPagination<FilterEntity>>,
		options: Options
	): Promise<IResponse<UserReadEntity>> {
		const useCase = new ReadAllUserUseCase<Options>(
			this.unitOfWork.getUserReadRepository(),
			Number(request.params?.page.number),
			Number(request.params?.page.size),
			options
		);
		const { data, meta } = await useCase.execute();

		return {
			status: StatusCodes.OK,
			data,
			meta,
		};
	}

	override async read(
		request: IHttpRequestParams<RequestParamId>
	): Promise<IResponse<UserReadEntity>> {
		if (!request.params) {
			throw new BadRequestException(getMessage('params.id.required'));
		}

		const useCase = new ReadUserUseCase(
			this.unitOfWork.getUserReadRepository(),
			request.params.id
		);
		const data = await useCase.execute();

		if (!data) {
			throw new NotFoundException(getMessage('user.exist'));
		}

		return {
			status: StatusCodes.OK,
			data,
		};
	}

	async uniqueEmail(
		request: IHttpRequest<
			IBaseRequest,
			Pick<UserReadEntity, 'id'>,
			Pick<IUpdateUserDTO, 'email'>
		>
	): Promise<boolean> {
		if (!request.body) {
			return true;
		}

		const { email } = request.body;

		if (!email) {
			return true;
		}

		const useCase = new UniqueUserEmailUseCase(
			this.unitOfWork.getUserReadRepository(),
			email,
			request.params?.id
		);

		return useCase.execute();
	}
}
