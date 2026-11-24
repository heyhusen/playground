import type { IBaseReadRepository } from '../../../../base/interfaces/base-repository.interface.js';
import type { UserEntity } from '../../commands/entities/user.entity.js';

export interface IUserReadRepository extends IBaseReadRepository<UserEntity> {
	findOneByEmail: (email: string, id?: string) => Promise<UserEntity | null>;
}
