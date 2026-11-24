import { IBaseUseCase } from '../../../../../base/interfaces/base-use-case.interface.js';
import { UserReadEntity } from '../../entities/user-read.entity.js';

export type IReadUserUseCase = IBaseUseCase<UserReadEntity>;
