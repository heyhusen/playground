import type { IBaseReadRepository } from '../../../../base/interfaces/base-repository.interface';
import type { UserEntity } from '../../commands/entities/user.entity';

export interface IUserReadRepository extends IBaseReadRepository<UserEntity> {
	findOneByEmail: (email: string, id?: string) => Promise<UserEntity | null>;
}
