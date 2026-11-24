import type { IBaseRepository } from '../../../../base/interfaces/base-repository.interface.js';
import { IUserReadRepository } from '../../queries/interfaces/user-repository-read.interface.js';
import type { UserEntity } from '../entities/user.entity.js';

export interface IUserRepository
	extends
		IBaseRepository<UserEntity>,
		Omit<IUserReadRepository, 'findOneByEmail'> {}
