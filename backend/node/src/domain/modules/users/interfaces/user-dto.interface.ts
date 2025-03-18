import { UserEntity } from '../entities/user.entity';

export type ICreateUserDTO = UserEntity;

export type IUpdateUserDTO = Partial<ICreateUserDTO>;
