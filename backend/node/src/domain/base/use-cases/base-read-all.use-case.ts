import { BaseEntity } from '../../entities/base.entity';
import { IBaseReadRepository } from '../interfaces/base-repository.interface';
import { IBasePaginatedResponse } from '../interfaces/base-response.interface';
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
