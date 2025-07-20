import type { IBaseRepository } from '../../../../base/interfaces/base-repository.interface';
import { IUserReadRepository } from '../../queries/interfaces/user-repository-read.interface';
import type { UserEntity } from '../entities/user.entity';

export interface IUserRepository
	extends IBaseRepository<UserEntity>,
		Omit<IUserReadRepository, 'findOneByEmail'> {}
