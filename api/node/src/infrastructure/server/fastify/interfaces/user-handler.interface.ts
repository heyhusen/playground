import type { FastifyReply, FastifyRequest } from 'fastify';
import { ICreateUserDTO } from '../../../../domain/modules/users/commands/interfaces/user-dto.interface';
import { IJsonApiData } from '../../../../presentation/interfaces/http.interface';
import { IBaseHandler } from '../base/interfaces/base-handler.interface';

export interface IUserHandler extends IBaseHandler {
	addionalUpdate: (
		request: FastifyRequest<{ Body: IJsonApiData<ICreateUserDTO> }>,
		reply: FastifyReply
	) => Promise<void>;
}
