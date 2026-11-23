import { Request, Response } from 'express';
import { DataDocument } from 'ts-japi';
import { UserEntity } from '../../../../domain/modules/users/commands/entities/user.entity';
import { ICreateUserDTO } from '../../../../domain/modules/users/commands/interfaces/user-dto.interface';
import { IJsonApiData } from '../../../../presentation/interfaces/http.interface';
import { IBaseHandler } from '../base/interfaces/base-handler.interface';

export interface IUserHandler extends IBaseHandler<UserEntity> {
	addionalUpdate: (
		req: Request<unknown, unknown, IJsonApiData<ICreateUserDTO>>,
		res: Response<Partial<DataDocument<UserEntity>>>
	) => Promise<void>;
}
