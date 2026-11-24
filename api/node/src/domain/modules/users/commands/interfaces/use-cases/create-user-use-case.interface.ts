import { IBaseUseCase } from '../../../../../base/interfaces/base-use-case.interface.js';
import { UserEntity } from '../../entities/user.entity.js';

export type ICreateUserUseCase = IBaseUseCase<UserEntity>;
