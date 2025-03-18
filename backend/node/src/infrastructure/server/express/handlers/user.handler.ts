import { SQL } from 'drizzle-orm';
import type { Request, Response } from 'express';
import { DataDocument, Linker, Paginator, Serializer } from 'ts-japi';
import { UserEntity } from '../../../../domain/modules/users/entities/user.entity';
import {
	ICreateUserDTO,
	IUpdateUserDTO,
} from '../../../../domain/modules/users/interfaces/user-dto.interface';
import type {
	IJsonApiData,
	IJsonApiPagination,
	RequestParamId,
} from '../../../../presentation/interfaces/http.interface';
import { UserController } from '../../../../presentation/modules/users/controllers/user.controller';
import { appConfig } from '../../../config/app';
import { users } from '../../../dal/schemas';
import { UnitOfWork } from '../../../dal/unit-of-work';
import { UserFilter } from '../../../modules/users/filters/user.filter';
import { IUserFilterParams } from '../../../modules/users/interfaces/user-filter-params.interface';
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

		super(path, serializer, linker);
	}

	override async create(
		request: Request<unknown, unknown, IJsonApiData<Partial<ICreateUserDTO>>>,
		response: Response<Partial<DataDocument<UserEntity>>>
	): Promise<void> {
		const { status, data } = await this.controller.create({
			headers: request.headers,
			body: request.body as IJsonApiData<ICreateUserDTO>,
		});

		return this.createResponse(response, status, data);
	}

	override async read(
		request: Request<RequestParamId>,
		response: Response<Partial<DataDocument<UserEntity>>, Record<string, any>>
	): Promise<void> {
		const { status, data } = await this.controller.read({
			headers: request.headers,
			params: request.params,
		});

		return this.createResponse(response, status, data);
	}

	override async readAll(
		request: Request<
			unknown,
			unknown,
			unknown,
			IJsonApiPagination<IUserFilterParams>
		>,
		response: Response<Partial<DataDocument<UserEntity[]>>, Record<string, any>>
	): Promise<void> {
		const filterGenerator = new UserFilter(users, request.query.filter);
		const filter = filterGenerator.execute();

		const { status, data, meta } = await this.controller.readAll<
			IUserFilterParams,
			SQL[]
		>(
			{
				headers: request.headers,
				params: request.query,
			},
			filter
		);

		const paginator = new Paginator<UserEntity>((_user) => {
			const {
				page: { size: limit, number },
			} = request.query;
			const page = Number(number);
			const totalPages = Math.ceil(Number(meta?.total) / limit);
			const prevPage = page > 1 ? page - 1 : 0;
			const nextPage = page < totalPages ? page + 1 : 0;

			return {
				first: `${this.path}/?page[number]=1&page[size]=${request.query.page.size}`,
				last: `${this.path}/?page[number]=${totalPages}&page[size]=${request.query.page.size}`,
				prev: prevPage
					? `${this.path}/?page[number]=${prevPage}&page[size]=${request.query.page.size}`
					: null,
				next: nextPage
					? `${this.path}/?page[number]=${nextPage}&page[size]=${request.query.page.size}`
					: null,
			};
		});

		return this.createResponse(response, status, data, paginator);
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

		return this.createResponse(response, status, data);
	}

	override async delete(
		request: Request<RequestParamId>,
		response: Response
	): Promise<void> {
		const { status } = await this.controller.delete({
			headers: request.headers,
			params: request.params,
		});

		return this.createResponse(response, status, null);
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

		return this.createResponse(response, status, data);
	}
}
