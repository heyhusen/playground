import { IBaseRequest } from 'src/domain/base/interfaces/base-request.interface';
import { BaseUpdateUseCase } from '../../../base/use-cases/base-update.use-case';
import { UserEntity } from '../entities/user.entity';
import type { IUpdateUserUseCase } from '../interfaces/use-cases/update-user-use-case.interface';
import { IUserRepository } from '../interfaces/user-repository.interface';

/**
 * Update an user.
 *
 * If the user is not found, a custom exception will be thrown.
 */
export class UpdateUserUseCase
	extends BaseUpdateUseCase<IBaseRequest, UserEntity, IUserRepository>
	implements IUpdateUserUseCase {}
