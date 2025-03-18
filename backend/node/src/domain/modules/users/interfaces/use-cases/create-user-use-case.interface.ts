import { IBaseUseCase } from 'src/domain/base/interfaces/base-use-case.interface';
import { UserEntity } from '../../entities/user.entity';

export type ICreateUserUseCase = IBaseUseCase<UserEntity>;
