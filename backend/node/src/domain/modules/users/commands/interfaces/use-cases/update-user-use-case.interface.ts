import { IBaseUseCase } from '../../../../../base/interfaces/base-use-case.interface';
import type { UserEntity } from '../../entities/user.entity';

export type IUpdateUserUseCase = IBaseUseCase<UserEntity>;
