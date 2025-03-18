import { BaseReadAllUseCase } from '../../../base/use-cases/base-read-all.use-case';
import type { UserEntity } from '../entities/user.entity';
import type { IReadAllUserUseCase } from '../interfaces/use-cases/read-all-user-use-case.inrterface';
import type { IUserReadRepository } from '../interfaces/user-repository.interface';

/**
 * List all users.
 */
export class ReadAllUserUseCase<Options>
	extends BaseReadAllUseCase<UserEntity, IUserReadRepository, Options>
	implements IReadAllUserUseCase {}
