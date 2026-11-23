import type { FastifyReply, FastifyRequest } from 'fastify';
import { Linker, Serializer } from 'ts-japi';
import { BaseEntity } from '../../../../domain/entities/base.entity';
import {
	IJsonApiPagination,
	RequestParamId,
} from '../../../../presentation/interfaces/http.interface';
import { BaseCoreHandler } from './base-core.handler';
import { IBaseReadHandler } from './interfaces/base-read-handler.interface';

export abstract class BaseReadHandler<Entity extends BaseEntity>
	extends BaseCoreHandler<Entity>
	implements IBaseReadHandler
{
	constructor(
		protected override readonly serializer: Serializer<Entity>,
		protected override readonly linker: Linker<[Entity]>
	) {
		super(serializer, linker);
	}

	abstract read(
		request: FastifyRequest<{ Params: RequestParamId }>,
		reply: FastifyReply
	): Promise<void>;

	abstract readAll<FilterEntity>(
		request: FastifyRequest<{
			Querystring: IJsonApiPagination<FilterEntity>;
		}>,
		reply: FastifyReply
	): Promise<void>;
}
