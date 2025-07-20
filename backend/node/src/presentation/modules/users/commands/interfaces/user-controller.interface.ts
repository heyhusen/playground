import { UserEntity } from '../../../../../domain/modules/users/commands/entities/user.entity';
import {
	ICreateUserDTO,
	IUpdateUserDTO,
} from '../../../../../domain/modules/users/commands/interfaces/user-dto.interface';
import { IBaseController } from '../../../../base/interfaces/base-controller.interface';

export type IUserController = IBaseController<
	ICreateUserDTO,
	IUpdateUserDTO,
	UserEntity
>;
