import type { Context } from 'hono';
import { Linker, Serializer } from 'ts-japi';
import { BaseEntity } from '../../../../domain/entities/base.entity';
import { BaseCoreHandler } from './base-core.handler';
import { IBaseHandler } from './interfaces/base-handler.interface';

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

	abstract create(context: Context): Promise<Response>;

	abstract update(context: Context): Promise<Response>;

	abstract delete(context: Context): Promise<Response>;
}
