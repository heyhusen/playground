import { IBaseRepository } from 'src/domain/base/interfaces/base-repository.interface';
import { BaseEntity } from 'src/domain/entities/base.entity';
import { IBaseRequest } from '../interfaces/base-request.interface';
import { IBaseUseCase } from '../interfaces/base-use-case.interface';

export class BaseUpdateUseCase<
	RequestEntity extends IBaseRequest,
	Entity extends BaseEntity,
	Repository extends IBaseRepository<Entity>,
> implements IBaseUseCase<Entity>
{
	constructor(
		protected readonly repository: Repository,
		protected readonly request: RequestEntity,
		protected readonly entityId: string,
		protected readonly dto: Partial<Entity>
	) {}

	async execute(): Promise<Entity> {
		return this.repository.update(this.entityId, {
			...this.dto,
			updated_at: Number(new Date()),
			updated_at_timezone_name: this.request.timezone_name,
			updated_at_timezone_offset: this.request.timezone_offset,
		});
	}
}
