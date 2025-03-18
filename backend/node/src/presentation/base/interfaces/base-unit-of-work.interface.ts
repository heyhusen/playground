import {
	IUserReadRepository,
	IUserRepository,
} from 'src/domain/modules/users/interfaces/user-repository.interface';

export interface IBaseUnitOfWork {
	transaction: <Result>(
		callback: (trx: any) => Promise<Result>
	) => Promise<Result>;

	getUserRepository: (trx: any) => IUserRepository;

	getUserReadRepository: () => IUserReadRepository;
}
