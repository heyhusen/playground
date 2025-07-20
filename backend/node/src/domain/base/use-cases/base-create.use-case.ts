import { BaseEntity } from '../../entities/base.entity';
import { IBaseRepository } from '../interfaces/base-repository.interface';
import { IBaseRequest } from '../interfaces/base-request.interface';
import { IBaseUseCase } from '../interfaces/base-use-case.interface';

export class BaseCreateUseCase<
	RequestEntity extends IBaseRequest,
	Entity extends BaseEntity,
	Repository extends IBaseRepository<Entity>,
> implements IBaseUseCase<Entity>
{
	constructor(
		protected readonly repository: Repository,
		protected readonly request: RequestEntity,
		protected readonly entity: Entity
	) {}

	async execute(): Promise<Entity> {
		return this.repository.create({
			...this.entity,
			created_at: Number(new Date()),
			created_at_timezone_name: this.request.timezone_name,
			created_at_timezone_offset: this.request.timezone_offset,
			updated_at: Number(new Date()),
			updated_at_timezone_name: this.request.timezone_name,
			updated_at_timezone_offset: this.request.timezone_offset,
		});
	}
}
