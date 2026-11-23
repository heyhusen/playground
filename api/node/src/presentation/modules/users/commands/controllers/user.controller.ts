import { StatusCodes } from 'http-status-codes';
import { IBaseRequest } from '../../../../../domain/base/interfaces/base-request.interface';
import { getMessage } from '../../../../../domain/helpers/get-message.helper';
import { UserEntity } from '../../../../../domain/modules/users/commands/entities/user.entity';
import type {
	ICreateUserDTO,
	IUpdateUserDTO,
} from '../../../../../domain/modules/users/commands/interfaces/user-dto.interface';
import { CreateUserUseCase } from '../../../../../domain/modules/users/commands/use-cases/create-user.use-case';
import { DeleteUserUseCase } from '../../../../../domain/modules/users/commands/use-cases/delete-user.use-case';
import { UpdateUserUseCase } from '../../../../../domain/modules/users/commands/use-cases/update-user.use-case';
import { BaseController } from '../../../../base/base.controller';
import { IBaseUnitOfWork } from '../../../../base/interfaces/base-unit-of-work.interface';
import { BadRequestException } from '../../../../exceptions/bad-request.exception';
import { NotFoundException } from '../../../../exceptions/not-found.exception';
import type {
	IHttpRequest,
	IHttpRequestParams,
	IJsonApiData,
	RequestParamId,
} from '../../../../interfaces/http.interface';
import type { IResponse } from '../../../../interfaces/response.interface';
import { IUserController } from '../interfaces/user-controller.interface';

export class UserController
	extends BaseController<ICreateUserDTO, IUpdateUserDTO, UserEntity>
	implements IUserController
{
	constructor(private readonly unitOfWork: IBaseUnitOfWork) {
		super();
	}

	override async create(
		request: IHttpRequest<IBaseRequest, unknown, IJsonApiData<ICreateUserDTO>>
	): Promise<IResponse<UserEntity>> {
		return this.unitOfWork.transaction<IResponse<UserEntity>>(async (trx) => {
			if (!request.body) {
				throw new BadRequestException(getMessage('body.required'));
			}

			const {
				data: { attributes, id },
			} = request.body;

			const repository = this.unitOfWork.getUserRepository(trx);
			const useCase = new CreateUserUseCase(repository, request.headers, {
				...attributes,
				id,
			});
			const data = await useCase.execute();

			return {
				status: StatusCodes.CREATED,
				data,
			};
		});
	}

	override async update(
		request: IHttpRequest<
			IBaseRequest,
			RequestParamId,
			IJsonApiData<IUpdateUserDTO>,
			Record<string, unknown>,
			Record<string, unknown>
		>
	): Promise<IResponse<UserEntity>> {
		return this.unitOfWork.transaction<IResponse<UserEntity>>(async (trx) => {
			if (!request.params) {
				throw new BadRequestException(getMessage('params.id.required'));
			}

			const { params, body } = request;
			const dto = { ...body };
			const attributes = { ...dto.data?.attributes };

			const repository = this.unitOfWork.getUserRepository(trx);
			const useCase = new UpdateUserUseCase(
				repository,
				request.headers,
				params.id,
				attributes
			);
			const data = await useCase.execute();

			if (!data) {
				throw new NotFoundException(getMessage('user.exist'));
			}

			return {
				status: StatusCodes.OK,
				data,
			};
		});
	}

	override async delete(
		request: IHttpRequestParams<RequestParamId>
	): Promise<IResponse<UserEntity>> {
		return this.unitOfWork.transaction<IResponse<UserEntity>>(async (trx) => {
			if (!request.params) {
				throw new BadRequestException(getMessage('params.id.required'));
			}

			const repository = this.unitOfWork.getUserRepository(trx);
			const useCase = new DeleteUserUseCase(repository, request.params.id);
			await useCase.execute();

			return {
				status: StatusCodes.NO_CONTENT,
			};
		});
	}
}
