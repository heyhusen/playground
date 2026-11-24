import { BaseDeleteUseCase } from '../../../../base/use-cases/base-delete.use-case.js';
import { UserEntity } from '../entities/user.entity.js';
import { IDeleteUserUseCase } from '../interfaces/use-cases/delete-user-use-case.interface.js';
import { IUserRepository } from '../interfaces/user-repository.interface.js';

/**
 * Delete an user.
 *
 * If the user is not found, a custom exception will be thrown.
 */
export class DeleteUserUseCase
	extends BaseDeleteUseCase<UserEntity, IUserRepository>
	implements IDeleteUserUseCase {}
