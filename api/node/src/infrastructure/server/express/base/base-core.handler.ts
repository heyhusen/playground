import { Response } from 'express';
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
