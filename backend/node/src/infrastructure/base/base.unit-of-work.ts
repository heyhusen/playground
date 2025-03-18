import {
	IUserReadRepository,
	IUserRepository,
} from 'src/domain/modules/users/interfaces/user-repository.interface';
import { IBaseUnitOfWork } from 'src/presentation/base/interfaces/base-unit-of-work.interface';

export abstract class BaseUnitOfWork implements IBaseUnitOfWork {
	abstract transaction<Result>(
		callback: (trx: any) => Promise<Result>
	): Promise<Result>;

	abstract getUserRepository(trx: any): IUserRepository;

	abstract getUserReadRepository(): IUserReadRepository;
}
