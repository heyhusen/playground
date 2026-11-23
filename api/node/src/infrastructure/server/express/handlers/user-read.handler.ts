import { SQL } from 'drizzle-orm';
import type { Request, Response } from 'express';
import { DataDocument, Linker, Paginator, Serializer } from 'ts-japi';
import { UserReadEntity } from '../../../../domain/modules/users/queries/entities/user-read.entity';
import {
	IJsonApiPagination,
	RequestParamId,
} from '../../../../presentation/interfaces/http.interface';
import { UserReadController } from '../../../../presentation/modules/users/queries/controllers/user-read.controller';
import { appConfig } from '../../../config/app';
import { users } from '../../../dal/schemas';
import { UnitOfWork } from '../../../dal/unit-of-work';
import { UserFilter } from '../../../modules/users/filters/user.filter';
import { IUserFilterParams } from '../../../modules/users/interfaces/user-filter-params.interface';
import { BaseReadHandler } from '../base/base-read.handler';
import { IUserReadHandler } from '../interfaces/user-read-handler.interface';

export class UserReadHandler
	extends BaseReadHandler<UserReadEntity>
	implements IUserReadHandler
{
	private readonly path = `${appConfig.url}/users`;

	private readonly unitOfWork = new UnitOfWork();

	private readonly controller = new UserReadController(this.unitOfWork);

	constructor() {
		const serializer = new Serializer<UserReadEntity>('users', {
			version: '1.1',
		});
		const linker = new Linker<[UserReadEntity]>((user) => {
			return `${this.path}/${user.id}`;
		});

		super(serializer, linker);
	}

	override async read(
		request: Request<RequestParamId>,
		response: Response<
			Partial<DataDocument<UserReadEntity>>,
			Record<string, any>
		>
	): Promise<void> {
		const { status, data } = await this.controller.read({
			headers: request.headers,
			params: request.params,
		});

		return this.response(response, status, data);
	}

	override async readAll(
		request: Request<
			unknown,
			unknown,
			unknown,
			IJsonApiPagination<IUserFilterParams>
		>,
		response: Response<
			Partial<DataDocument<UserReadEntity[]>>,
			Record<string, any>
		>
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

		const paginator = new Paginator<UserReadEntity>((_user) => {
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

		return this.response(response, status, data, paginator);
	}
}
