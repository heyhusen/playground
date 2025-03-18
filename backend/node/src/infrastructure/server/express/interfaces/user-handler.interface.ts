import { Request, Response } from 'express';
import { UserEntity } from 'src/domain/modules/users/entities/user.entity';
import { ICreateUserDTO } from 'src/domain/modules/users/interfaces/user-dto.interface';
import { IJsonApiData } from 'src/presentation/interfaces/http.interface';
import { DataDocument } from 'ts-japi';
import { IBaseHandler } from '../base/interfaces/base-handler.interface';

export interface IUserHandler extends IBaseHandler<UserEntity> {
	addionalUpdate: (
		req: Request<unknown, unknown, IJsonApiData<ICreateUserDTO>>,
		res: Response<Partial<DataDocument<UserEntity>>>
	) => Promise<void>;
}
