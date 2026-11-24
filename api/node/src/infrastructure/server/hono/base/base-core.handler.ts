import type { Context } from 'hono';
import {
	Linker,
	nullish,
	Paginator,
	Serializer,
	SerializerOptions,
	SingleOrArray,
} from 'ts-japi';
import { BaseEntity } from '../../../../domain/entities/base.entity.js';

export abstract class BaseCoreHandler<Entity extends BaseEntity> {
	constructor(
		protected readonly serializer: Serializer<Entity>,
		protected readonly linker: Linker<[Entity]>
	) {}

	protected async response(
		_context: Context,
		status: number,
		data: nullish | SingleOrArray<Entity>,
		paginator?: Paginator<Entity>
	): Promise<Response> {
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

		return new Response(JSON.stringify(result), {
			status,
			headers: { 'Content-Type': 'application/vnd.api+json' },
		});
	}
}
