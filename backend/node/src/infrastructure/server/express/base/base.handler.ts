import { Request, Response } from 'express';
import { BaseEntity } from 'src/domain/entities/base.entity';
import {
	IJsonApiData,
	IJsonApiPagination,
	RequestParamId,
} from 'src/presentation/interfaces/http.interface';
import {
	DataDocument,
	Dictionary,
	Linker,
	nullish,
	Paginator,
	Serializer,
	SerializerOptions,
	SingleOrArray,
} from 'ts-japi';
import { IBaseHandler } from './interfaces/base-handler.interface';

export abstract class BaseHandler<Entity extends BaseEntity>
	implements IBaseHandler<Entity>
{
	constructor(
		protected readonly path: string,
		protected readonly serializer: Serializer<Entity>,
		protected readonly linker: Linker<[Entity]>
	) {}

	abstract create<DTO extends Dictionary<any>>(
		request: Request<unknown, unknown, IJsonApiData<DTO>>,
		response: Response<Partial<DataDocument<Entity>>>
	): Promise<void>;

	abstract read(
		request: Request<RequestParamId>,
		response: Response<Partial<DataDocument<Entity>>, Record<string, any>>
	): Promise<void>;

	abstract readAll<FilterEntity>(
		request: Request<
			unknown,
			unknown,
			unknown,
			IJsonApiPagination<FilterEntity>
		>,
		response: Response<Partial<DataDocument<Entity[]>>, Record<string, any>>
	): Promise<void>;

	abstract update<DTO extends Dictionary<any>>(
		request: Request<RequestParamId, unknown, IJsonApiData<DTO>>,
		response: Response<Partial<DataDocument<Entity>>>
	): Promise<void>;

	abstract delete(
		request: Request<RequestParamId>,
		response: Response
	): Promise<void>;

	protected async createResponse(
		response: Response,
		status: number,
		data: nullish | SingleOrArray<Entity>,
		paginator?: Paginator<Entity>
	) {
		const options: Partial<SerializerOptions<Entity>> = {
			linkers: {
				resource: this.linker,
			},
		};

		if (paginator) {
			options.linkers = {
				...options.linkers,
				paginator,
			};
		}

		const result = await this.serializer.serialize(data, options);

		response
			.contentType('application/vnd.api+json')
			.status(status)
			.json(result);
	}
}
