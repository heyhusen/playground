import type { FastifyReply } from 'fastify';
import {
	Linker,
	nullish,
	Paginator,
	Serializer,
	SerializerOptions,
	SingleOrArray,
} from 'ts-japi';
import { BaseEntity } from '../../../../domain/entities/base.entity';

export abstract class BaseCoreHandler<Entity extends BaseEntity> {
	constructor(
		protected readonly serializer: Serializer<Entity>,
		protected readonly linker: Linker<[Entity]>
	) {}

	protected async response(
		reply: FastifyReply,
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

		await reply.type('application/vnd.api+json').code(status).send(result);
	}
}
