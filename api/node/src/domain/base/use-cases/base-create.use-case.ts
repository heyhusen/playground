import { BaseEntity } from '../../entities/base.entity.js';
import { IBaseRepository } from '../interfaces/base-repository.interface.js';
import { IBaseRequest } from '../interfaces/base-request.interface.js';
import { IBaseUseCase } from '../interfaces/base-use-case.interface.js';

export class BaseCreateUseCase<
	RequestEntity extends IBaseRequest,
	Entity extends BaseEntity,
	Repository extends IBaseRepository<Entity>,
> implements IBaseUseCase<Entity> {
	constructor(
		protected readonly repository: Repository,
		protected readonly request: RequestEntity,
		protected readonly entity: Entity
	) {}

	async execute(): Promise<Entity> {
		return this.repository.create({
			...this.entity,
			version: 1,
			created_at: Number(new Date()),
			created_at_timezone_name: this.request.timezone_name,
			created_at_timezone_offset: this.request.timezone_offset,
			updated_at: Number(new Date()),
			updated_at_timezone_name: this.request.timezone_name,
			updated_at_timezone_offset: this.request.timezone_offset,
		});
	}
}
