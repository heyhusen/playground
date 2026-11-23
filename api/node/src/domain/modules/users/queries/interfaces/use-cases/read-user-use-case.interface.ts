import { IBaseUseCase } from '../../../../../base/interfaces/base-use-case.interface';
import { UserReadEntity } from '../../entities/user-read.entity';

export type IReadUserUseCase = IBaseUseCase<UserReadEntity>;
