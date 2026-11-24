import type { FastifyReply, FastifyRequest } from 'fastify';
import { ICreateUserDTO } from '../../../../domain/modules/users/commands/interfaces/user-dto.interface.js';
import { IJsonApiData } from '../../../../presentation/interfaces/http.interface.js';
import { IBaseHandler } from '../base/interfaces/base-handler.interface.js';

export interface IUserHandler extends IBaseHandler {
	addionalUpdate: (
		request: FastifyRequest<{ Body: IJsonApiData<ICreateUserDTO> }>,
		reply: FastifyReply
	) => Promise<void>;
}
