import { IBaseRequest } from '../../../../base/interfaces/base-request.interface.js';
import { BaseCreateUseCase } from '../../../../base/use-cases/base-create.use-case.js';
import { UserEntity } from '../entities/user.entity.js';
import { ICreateUserUseCase } from '../interfaces/use-cases/create-user-use-case.interface.js';
import { IUserRepository } from '../interfaces/user-repository.interface.js';

/**
 * Create an user.
 *
 * If there is an error, a basic exception will be thrown.
 */
export class CreateUserUseCase
	extends BaseCreateUseCase<IBaseRequest, UserEntity, IUserRepository>
	implements ICreateUserUseCase {}
