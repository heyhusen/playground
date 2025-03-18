import { IBaseReadRepository } from 'src/domain/base/interfaces/base-repository.interface';
import { BaseEntity } from 'src/domain/entities/base.entity';
import { IBaseUseCase } from '../interfaces/base-use-case.interface';

export class BaseReadUseCase<
	Entity extends BaseEntity,
	Repository extends IBaseReadRepository<Entity>
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
