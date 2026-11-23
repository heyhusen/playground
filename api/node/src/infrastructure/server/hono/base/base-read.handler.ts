import type { Context } from 'hono';
import { Linker, Serializer } from 'ts-japi';
import { BaseEntity } from '../../../../domain/entities/base.entity';
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

	abstract read(context: Context): Promise<Response>;

	abstract readAll(context: Context): Promise<Response>;
}
