import { UserEntity } from 'src/domain/modules/users/entities/user.entity';
import {
	ICreateUserDTO,
	IUpdateUserDTO,
} from 'src/domain/modules/users/interfaces/user-dto.interface';
import { IBaseController } from 'src/presentation/base/interfaces/base-controller.interface';

export type IUserController = IBaseController<
	ICreateUserDTO,
	IUpdateUserDTO,
	UserEntity
>;
