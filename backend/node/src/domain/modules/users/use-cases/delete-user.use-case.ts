import { BaseDeleteUseCase } from '../../../base/use-cases/base-delete.use-case';
import { UserEntity } from '../entities/user.entity';
import { IDeleteUserUseCase } from '../interfaces/use-cases/delete-user-use-case.interface';
import type { IUserRepository } from '../interfaces/user-repository.interface';

/**
 * Delete an user.
 *
 * If the user is not found, a custom exception will be thrown.
 */
export class DeleteUserUseCase
	extends BaseDeleteUseCase<UserEntity, IUserRepository>
	implements IDeleteUserUseCase {}
