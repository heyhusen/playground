import { UserEntity } from '../entities/user.entity.js';

export type ICreateUserDTO = UserEntity;

export type IUpdateUserDTO = Partial<ICreateUserDTO>;
