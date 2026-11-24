import { UserEntity } from '../../../../../domain/modules/users/commands/entities/user.entity.js';
import {
	ICreateUserDTO,
	IUpdateUserDTO,
} from '../../../../../domain/modules/users/commands/interfaces/user-dto.interface.js';
import { IBaseController } from '../../../../base/interfaces/base-controller.interface.js';

export type IUserController = IBaseController<
	ICreateUserDTO,
	IUpdateUserDTO,
	UserEntity
>;
