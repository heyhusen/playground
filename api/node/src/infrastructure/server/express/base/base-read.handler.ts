import { Request, Response } from 'express';
import { DataDocument, Linker, Serializer } from 'ts-japi';
import { BaseEntity } from '../../../../domain/entities/base.entity';
import {
	IJsonApiPagination,
	RequestParamId,
} from '../../../../presentation/interfaces/http.interface';
import { BaseCoreHandler } from './base-core.handler';
import { IBaseReadHandler } from './interfaces/base-read-handler.interface';

export abstract class BaseReadHandler<Entity extends BaseEntity>
	extends BaseCoreHandler<Entity>
	implements IBaseReadHandler<Entity>
{
	constructor(
		protected override readonly serializer: Serializer<Entity>,
		protected override readonly linker: Linker<[Entity]>
	) {
		super(serializer, linker);
	}

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
}
