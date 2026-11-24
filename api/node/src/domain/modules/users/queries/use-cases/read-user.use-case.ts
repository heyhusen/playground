import { BaseReadUseCase } from '../../../../base/use-cases/base-read.use-case.js';
import { UserEntity } from '../../commands/entities/user.entity.js';
import { IReadUserUseCase } from '../interfaces/use-cases/read-user-use-case.interface.js';
import { IUserReadRepository } from '../interfaces/user-repository-read.interface.js';

/**
 * Get one specific user.
 *
 * If the user is not found, a custom exception will be thrown.
 */
export class ReadUserUseCase
	extends BaseReadUseCase<UserEntity, IUserReadRepository>
	implements IReadUserUseCase {}
