import type { FastifyReply, FastifyRequest } from 'fastify';
import {
	IJsonApiPagination,
	RequestParamId,
} from '../../../../../presentation/interfaces/http.interface';

export interface IBaseReadHandler {
	read: (
		request: FastifyRequest<{ Params: RequestParamId }>,
		reply: FastifyReply
	) => Promise<void>;

	readAll: <FilterEntity>(
		request: FastifyRequest<{
			Querystring: IJsonApiPagination<FilterEntity>;
		}>,
		reply: FastifyReply
	) => Promise<void>;
}
