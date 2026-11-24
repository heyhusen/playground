import type { FastifyReply, FastifyRequest } from 'fastify';
import { Linker, Serializer } from 'ts-japi';
import { UserEntity } from '../../../../domain/modules/users/commands/entities/user.entity.js';
import {
	ICreateUserDTO,
	IUpdateUserDTO,
} from '../../../../domain/modules/users/commands/interfaces/user-dto.interface.js';
import type {
	IJsonApiData,
	RequestParamId,
} from '../../../../presentation/interfaces/http.interface.js';
import { UserController } from '../../../../presentation/modules/users/commands/controllers/user.controller.js';
import { appConfig } from '../../../config/app.js';
import { UnitOfWork } from '../../../dal/unit-of-work.js';
import { BaseHandler } from '../base/base.handler.js';
import { IUserHandler } from '../interfaces/user-handler.interface.js';

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
		request: FastifyRequest<{
			Body: IJsonApiData<Partial<ICreateUserDTO>>;
		}>,
		reply: FastifyReply
	): Promise<void> {
		const { status, data } = await this.controller.create({
			headers: request.headers,
			body: request.body as IJsonApiData<ICreateUserDTO>,
		});

		return this.response(reply, status, data);
	}

	override async update(
		request: FastifyRequest<{
			Params: RequestParamId;
			Body: IJsonApiData<IUpdateUserDTO>;
		}>,
		reply: FastifyReply
	): Promise<void> {
		const { status, data } = await this.controller.update({
			headers: request.headers,
			params: request.params,
			body: request.body,
		});

		return this.response(reply, status, data);
	}

	override async delete(
		request: FastifyRequest<{ Params: RequestParamId }>,
		reply: FastifyReply
	): Promise<void> {
		const { status } = await this.controller.delete({
			headers: request.headers,
			params: request.params,
		});

		return this.response(reply, status, null);
	}

	async addionalUpdate(
		request: FastifyRequest<{ Body: IJsonApiData<ICreateUserDTO> }>,
		reply: FastifyReply
	): Promise<void> {
		const { status, data } = await this.controller.update({
			headers: request.headers,
			body: request.body,
			params: {
				id: request.body.data.id,
			},
		});

		return this.response(reply, status, data);
	}
}
