import { IBaseUseCase } from '../../../../../base/interfaces/base-use-case.interface.js';
import type { UserEntity } from '../../entities/user.entity.js';

export type IUpdateUserUseCase = IBaseUseCase<UserEntity>;
