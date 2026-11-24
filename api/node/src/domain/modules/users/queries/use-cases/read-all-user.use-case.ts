import { BaseReadAllUseCase } from '../../../../base/use-cases/base-read-all.use-case.js';
import { UserEntity } from '../../commands/entities/user.entity.js';
import { IReadAllUserUseCase } from '../interfaces/use-cases/read-all-user-use-case.inrterface.js';
import { IUserReadRepository } from '../interfaces/user-repository-read.interface.js';

/**
 * List all users.
 */
export class ReadAllUserUseCase<Options>
	extends BaseReadAllUseCase<UserEntity, IUserReadRepository, Options>
	implements IReadAllUserUseCase {}
