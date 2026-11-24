import { IUserRepository } from '../../../domain/modules/users/commands/interfaces/user-repository.interface.js';
import { IUserReadRepository } from '../../../domain/modules/users/queries/interfaces/user-repository-read.interface.js';

export interface IBaseUnitOfWork {
	transaction: <Result>(
		callback: (trx: any) => Promise<Result>
	) => Promise<Result>;

	getUserRepository: (trx: any) => IUserRepository;

	getUserReadRepository: () => IUserReadRepository;
}
