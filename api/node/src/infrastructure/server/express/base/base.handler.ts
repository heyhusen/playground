import { Request, Response } from 'express';
import { DataDocument, Dictionary, Linker, Serializer } from 'ts-japi';
import { BaseEntity } from '../../../../domain/entities/base.entity.js';
import {
	IJsonApiData,
	RequestParamId,
} from '../../../../presentation/interfaces/http.interface.js';
import { BaseCoreHandler } from './base-core.handler.js';
import { IBaseHandler } from './interfaces/base-handler.interface.js';

export abstract class BaseHandler<Entity extends BaseEntity>
	extends BaseCoreHandler<Entity>
	implements IBaseHandler<Entity>
{
	constructor(
		protected override readonly serializer: Serializer<Entity>,
		protected override readonly linker: Linker<[Entity]>
	) {
		super(serializer, linker);
	}

	abstract create<DTO extends Dictionary<any>>(
		request: Request<unknown, unknown, IJsonApiData<DTO>>,
		response: Response<Partial<DataDocument<Entity>>>
	): Promise<void>;

	abstract update<DTO extends Dictionary<any>>(
		request: Request<RequestParamId, unknown, IJsonApiData<DTO>>,
		response: Response<Partial<DataDocument<Entity>>>
	): Promise<void>;

	abstract delete(
		request: Request<RequestParamId>,
		response: Response
	): Promise<void>;
}
