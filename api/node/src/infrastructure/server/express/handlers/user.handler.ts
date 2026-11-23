import type { Request, Response } from 'express';
import { DataDocument, Linker, Serializer } from 'ts-japi';
import { UserEntity } from '../../../../domain/modules/users/commands/entities/user.entity';
import {
	ICreateUserDTO,
	IUpdateUserDTO,
} from '../../../../domain/modules/users/commands/interfaces/user-dto.interface';
import type {
	IJsonApiData,
	RequestParamId,
} from '../../../../presentation/interfaces/http.interface';
import { UserController } from '../../../../presentation/modules/users/commands/controllers/user.controller';
import { appConfig } from '../../../config/app';
import { UnitOfWork } from '../../../dal/unit-of-work';
import { BaseHandler } from '../base/base.handler';
import { IUserHandler } from '../interfaces/user-handler.interface';

export class UserHandler
	extends BaseHandler<UserEntity>
	implements IUserHandler
{
	private readonly unitOfWork = new UnitOfWork();

	private readonly controller = new UserController(this.unitOfWork);

	constructor() {
		const path = `${appConfig.url}/users`;
		const serializer = new Serializer<UserEntity>('users', {
			version: '1.1',
		});
		const linker = new Linker<[UserEntity]>((user) => {
			return `${path}/${user.id}`;
		});

		super(serializer, linker);
	}

	override async create(
		request: Request<unknown, unknown, IJsonApiData<Partial<ICreateUserDTO>>>,
		response: Response<Partial<DataDocument<UserEntity>>>
	): Promise<void> {
		const { status, data } = await this.controller.create({
			headers: request.headers,
			body: request.body as IJsonApiData<ICreateUserDTO>,
		});

		return this.response(response, status, data);
	}

	override async update(
		request: Request<RequestParamId, unknown, IJsonApiData<IUpdateUserDTO>>,
		response: Response<Partial<DataDocument<UserEntity>>>
	): Promise<void> {
		const { status, data } = await this.controller.update({
			headers: request.headers,
			params: request.params,
			body: request.body,
		});

		return this.response(response, status, data);
	}

	override async delete(
		request: Request<RequestParamId>,
		response: Response
	): Promise<void> {
		const { status } = await this.controller.delete({
			headers: request.headers,
			params: request.params,
		});

		return this.response(response, status, null);
	}

	async addionalUpdate(
		request: Request<unknown, unknown, IJsonApiData<ICreateUserDTO>>,
		response: Response<Partial<DataDocument<UserEntity>>>
	): Promise<void> {
		const { status, data } = await this.controller.update({
			headers: request.headers,
			body: request.body,
			params: {
				id: request.body.data.id,
			},
		});

		return this.response(response, status, data);
	}
}
