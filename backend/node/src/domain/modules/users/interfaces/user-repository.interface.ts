import type {
	IBaseReadRepository,
	IBaseRepository,
} from '../../../base/interfaces/base-repository.interface';
import type { UserEntity } from '../entities/user.entity';

export interface IUserReadRepository extends IBaseReadRepository<UserEntity> {
	findOneByEmail: (email: string, id?: string) => Promise<UserEntity | null>;
}

export interface IUserRepository
	extends IBaseRepository<UserEntity>,
		Omit<IUserReadRepository, 'findOneByEmail'> {}
