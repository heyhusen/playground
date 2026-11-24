import type { Context } from 'hono';
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
import { getBody, getHeaders, getParams } from '../helpers/request.js';
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

	override async create(context: Context): Promise<Response> {
		const { status, data } = await this.controller.create({
			headers: getHeaders(context),
			body: (await getBody(context)) as IJsonApiData<ICreateUserDTO>,
		});

		return this.response(context, status, data);
	}

	override async update(context: Context): Promise<Response> {
		const { status, data } = await this.controller.update({
			headers: getHeaders(context),
			params: getParams<RequestParamId>(context),
			body: (await getBody(context)) as IJsonApiData<IUpdateUserDTO>,
		});

		return this.response(context, status, data);
	}

	override async delete(context: Context): Promise<Response> {
		const { status } = await this.controller.delete({
			headers: getHeaders(context),
			params: getParams<RequestParamId>(context),
		});

		return this.response(context, status, null);
	}

	async addionalUpdate(context: Context): Promise<Response> {
		const body = (await getBody(context)) as IJsonApiData<ICreateUserDTO>;
		const { status, data } = await this.controller.update({
			headers: getHeaders(context),
			body,
			params: {
				id: body.data.id,
			},
		});

		return this.response(context, status, data);
	}
}
