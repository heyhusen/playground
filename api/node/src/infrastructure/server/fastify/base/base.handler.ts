import type { FastifyReply, FastifyRequest } from 'fastify';
import { Dictionary, Linker, Serializer } from 'ts-japi';
import { BaseEntity } from '../../../../domain/entities/base.entity.js';
import {
	IJsonApiData,
	RequestParamId,
} from '../../../../presentation/interfaces/http.interface.js';
import { BaseCoreHandler } from './base-core.handler.js';
import { IBaseHandler } from './interfaces/base-handler.interface.js';

export abstract class BaseHandler<Entity extends BaseEntity>
	extends BaseCoreHandler<Entity>
	implements IBaseHandler
{
	constructor(
		protected override readonly serializer: Serializer<Entity>,
		protected override readonly linker: Linker<[Entity]>
	) {
		super(serializer, linker);
	}

	abstract create<DTO extends Dictionary<any>>(
		request: FastifyRequest<{ Body: IJsonApiData<DTO> }>,
		reply: FastifyReply
	): Promise<void>;

	abstract update<DTO extends Dictionary<any>>(
		request: FastifyRequest<{
			Params: RequestParamId;
			Body: IJsonApiData<DTO>;
		}>,
		reply: FastifyReply
	): Promise<void>;

	abstract delete(
		request: FastifyRequest<{ Params: RequestParamId }>,
		reply: FastifyReply
	): Promise<void>;
}
