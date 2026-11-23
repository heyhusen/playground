import { IBasePaginatedUseCase } from '../../../../../base/interfaces/base-use-case.interface';
import { UserReadEntity } from '../../entities/user-read.entity';

export type IReadAllUserUseCase = IBasePaginatedUseCase<UserReadEntity>;
