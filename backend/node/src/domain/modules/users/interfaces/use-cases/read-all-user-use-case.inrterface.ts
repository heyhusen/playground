import { IBasePaginatedUseCase } from 'src/domain/base/interfaces/base-use-case.interface';
import type { UserEntity } from '../../entities/user.entity';

export type IReadAllUserUseCase = IBasePaginatedUseCase<UserEntity>;
