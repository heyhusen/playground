import { IBaseRequest } from '../../../../base/interfaces/base-request.interface.js';
import { BaseUpdateUseCase } from '../../../../base/use-cases/base-update.use-case.js';
import { UserEntity } from '../entities/user.entity.js';
import { IUpdateUserUseCase } from '../interfaces/use-cases/update-user-use-case.interface.js';
import { IUserRepository } from '../interfaces/user-repository.interface.js';

/**
 * Update an user.
 *
 * If the user is not found, a custom exception will be thrown.
 */
export class UpdateUserUseCase
	extends BaseUpdateUseCase<IBaseRequest, UserEntity, IUserRepository>
	implements IUpdateUserUseCase {}
