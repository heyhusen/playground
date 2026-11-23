import { BaseReadAllUseCase } from '../../../../base/use-cases/base-read-all.use-case';
import { UserEntity } from '../../commands/entities/user.entity';
import { IReadAllUserUseCase } from '../interfaces/use-cases/read-all-user-use-case.inrterface';
import { IUserReadRepository } from '../interfaces/user-repository-read.interface';

/**
 * List all users.
 */
export class ReadAllUserUseCase<Options>
	extends BaseReadAllUseCase<UserEntity, IUserReadRepository, Options>
	implements IReadAllUserUseCase {}
