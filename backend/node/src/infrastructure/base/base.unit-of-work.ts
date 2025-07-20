import { IUserRepository } from '../../domain/modules/users/commands/interfaces/user-repository.interface';
import { IUserReadRepository } from '../../domain/modules/users/queries/interfaces/user-repository-read.interface';
import { IBaseUnitOfWork } from '../../presentation/base/interfaces/base-unit-of-work.interface';

export abstract class BaseUnitOfWork implements IBaseUnitOfWork {
	abstract transaction<Result>(
		callback: (trx: any) => Promise<Result>
	): Promise<Result>;

	abstract getUserRepository(trx: any): IUserRepository;

	abstract getUserReadRepository(): IUserReadRepository;
}
