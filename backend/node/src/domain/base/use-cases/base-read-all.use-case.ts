import { IBaseReadRepository } from 'src/domain/base/interfaces/base-repository.interface';
import { IBasePaginatedResponse } from 'src/domain/base/interfaces/base-response.interface';
import { BaseEntity } from 'src/domain/entities/base.entity';
import { IBasePaginatedUseCase } from '../interfaces/base-use-case.interface';

export class BaseReadAllUseCase<
	Entity extends BaseEntity,
	Repository extends IBaseReadRepository<Entity>,
	Options,
> implements IBasePaginatedUseCase<Entity>
{
	constructor(
		protected readonly repository: Repository,
		protected readonly page: number,
		protected readonly limit: number,
		protected readonly options: Options
	) {}

	async execute(): Promise<IBasePaginatedResponse<Entity>> {
		return this.repository.readAll(this.page, this.limit, this.options);
	}
}
