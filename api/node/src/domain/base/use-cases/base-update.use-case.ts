import { BaseEntity } from '../../entities/base.entity.js';
import { IBaseRepository } from '../interfaces/base-repository.interface.js';
import { IBaseRequest } from '../interfaces/base-request.interface.js';
import { IBaseUseCase } from '../interfaces/base-use-case.interface.js';

export class BaseUpdateUseCase<
	RequestEntity extends IBaseRequest,
	Entity extends BaseEntity,
	Repository extends IBaseRepository<Entity>,
> implements IBaseUseCase<Entity> {
	constructor(
		protected readonly repository: Repository,
		protected readonly request: RequestEntity,
		protected readonly entityId: string,
		protected readonly expectedVersion: number | undefined,
		protected readonly dto: Partial<Entity>
	) {}

	async execute(): Promise<Entity> {
		// The version is a concurrency token, not mutable data. The repository
		// increments it atomically after the guarded update succeeds.
		const data: Partial<Entity> = {
			...this.dto,
			updated_at: Number(new Date()),
			updated_at_timezone_name: this.request.timezone_name,
			updated_at_timezone_offset: this.request.timezone_offset,
		};
		delete data.version;

		return this.repository.update(this.entityId, this.expectedVersion, data);
	}
}
