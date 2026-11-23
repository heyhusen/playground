import type { FastifyReply, FastifyRequest } from 'fastify';
import { Dictionary } from 'ts-japi';
import {
	IJsonApiData,
	RequestParamId,
} from '../../../../../presentation/interfaces/http.interface';

export interface IBaseHandler {
	create: <DTO extends Dictionary<any>>(
		request: FastifyRequest<{ Body: IJsonApiData<DTO> }>,
		reply: FastifyReply
	) => Promise<void>;

	update: <DTO extends Dictionary<any>>(
		request: FastifyRequest<{
			Params: RequestParamId;
			Body: IJsonApiData<DTO>;
		}>,
		reply: FastifyReply
	) => Promise<void>;

	delete: (
		request: FastifyRequest<{ Params: RequestParamId }>,
		reply: FastifyReply
	) => Promise<void>;
}
