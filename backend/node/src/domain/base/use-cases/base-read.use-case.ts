import { BaseEntity } from '../../entities/base.entity';
import { IBaseReadRepository } from '../interfaces/base-repository.interface';
import { IBaseUseCase } from '../interfaces/base-use-case.interface';

export class BaseReadUseCase<
	Entity extends BaseEntity,
	Repository extends IBaseReadRepository<Entity>,
> implements IBaseUseCase<Entity>
{
	constructor(
		protected readonly repository: Repository,
		protected readonly entityId: string
	) {}

	async execute(): Promise<Entity> {
		return this.repository.read(this.entityId);
	}
}
