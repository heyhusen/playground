import { StatusCodes } from 'http-status-codes';
import type { IIdempotencyService } from '../../../../../domain/base/interfaces/base-idempotency-service.interface.js';
import { IBaseRequest } from '../../../../../domain/base/interfaces/base-request.interface.js';
import { getMessage } from '../../../../../domain/helpers/get-message.helper.js';
import { UserEntity } from '../../../../../domain/modules/users/commands/entities/user.entity.js';
import type {
	ICreateUserDTO,
	IUpdateUserDTO,
} from '../../../../../domain/modules/users/commands/interfaces/user-dto.interface.js';
import { CreateUserUseCase } from '../../../../../domain/modules/users/commands/use-cases/create-user.use-case.js';
import { DeleteUserUseCase } from '../../../../../domain/modules/users/commands/use-cases/delete-user.use-case.js';
import { UpdateUserUseCase } from '../../../../../domain/modules/users/commands/use-cases/update-user.use-case.js';
import {
	idempotencyFingerprint,
	idempotencyService,
} from '../../../../../infrastructure/services/idempotency.service.js';
import { BaseController } from '../../../../base/base.controller.js';
import { IBaseUnitOfWork } from '../../../../base/interfaces/base-unit-of-work.interface.js';
import { BadRequestException } from '../../../../exceptions/bad-request.exception.js';
import { NotFoundException } from '../../../../exceptions/not-found.exception.js';
import type {
	IHttpRequest,
	IHttpRequestParams,
	IJsonApiData,
	RequestParamId,
} from '../../../../interfaces/http.interface.js';
import type { IResponse } from '../../../../interfaces/response.interface.js';
import { IUserController } from '../interfaces/user-controller.interface.js';

export class UserController
	extends BaseController<ICreateUserDTO, IUpdateUserDTO, UserEntity>
	implements IUserController
{
	constructor(
		private readonly unitOfWork: IBaseUnitOfWork,
		private readonly idempotency: IIdempotencyService = idempotencyService
	) {
		super();
	}

	override async create(
		request: IHttpRequest<IBaseRequest, unknown, IJsonApiData<ICreateUserDTO>>
	): Promise<IResponse<UserEntity>> {
		return this.idempotency.run({
			scope: 'create',
			key: request.headers.idempotency_key,
			fingerprint: idempotencyFingerprint(request.body),
			execute: () =>
				this.unitOfWork.transaction<IResponse<UserEntity>>(async (trx) => {
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
				}),
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
		return this.idempotency.run({
			scope: `update:${request.params?.id ?? ''}`,
			key: request.headers.idempotency_key,
			fingerprint: idempotencyFingerprint(request.body),
			execute: () =>
				this.unitOfWork.transaction<IResponse<UserEntity>>(async (trx) => {
					if (!request.params) {
						throw new BadRequestException(getMessage('params.id.required'));
					}

					const { params, body } = request;
					// `version` is an optional concurrency token, not writable data.
					const { version, ...attributes } = { ...body?.data?.attributes };

					const repository = this.unitOfWork.getUserRepository(trx);
					const useCase = new UpdateUserUseCase(
						repository,
						request.headers,
						params.id,
						version,
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
				}),
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
