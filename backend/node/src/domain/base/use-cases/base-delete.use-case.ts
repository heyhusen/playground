import { BaseEntity } from '../../entities/base.entity';
import { IBaseRepository } from '../interfaces/base-repository.interface';
import { IBaseUseCase } from '../interfaces/base-use-case.interface';

export class BaseDeleteUseCase<
	Entity extends BaseEntity,
	Repository extends IBaseRepository<Entity>,
> implements IBaseUseCase<Entity>
{
	constructor(
		protected readonly repository: Repository,
		protected readonly entityId: string
	) {}

	async execute(): Promise<Entity> {
		return this.repository.delete(this.entityId);
	}
}
