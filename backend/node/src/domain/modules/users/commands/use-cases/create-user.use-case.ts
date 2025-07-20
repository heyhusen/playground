import { IBaseRequest } from '../../../../base/interfaces/base-request.interface';
import { BaseCreateUseCase } from '../../../../base/use-cases/base-create.use-case';
import { UserEntity } from '../entities/user.entity';
import { ICreateUserUseCase } from '../interfaces/use-cases/create-user-use-case.interface';
import { IUserRepository } from '../interfaces/user-repository.interface';

/**
 * Create an user.
 *
 * If there is an error, a basic exception will be thrown.
 */
export class CreateUserUseCase
	extends BaseCreateUseCase<IBaseRequest, UserEntity, IUserRepository>
	implements ICreateUserUseCase {}
