import { BaseReadUseCase } from '../../../../base/use-cases/base-read.use-case';
import { UserEntity } from '../../commands/entities/user.entity';
import { IReadUserUseCase } from '../interfaces/use-cases/read-user-use-case.interface';
import { IUserReadRepository } from '../interfaces/user-repository-read.interface';

/**
 * Get one specific user.
 *
 * If the user is not found, a custom exception will be thrown.
 */
export class ReadUserUseCase
	extends BaseReadUseCase<UserEntity, IUserReadRepository>
	implements IReadUserUseCase {}
