import type { FastifyReply, FastifyRequest } from 'fastify';
import { IBaseSingleHandler } from './interfaces/base-single-handles.interface';

export abstract class BaseSingleHandler<
	Result,
> implements IBaseSingleHandler<Result> {
	abstract execute(request: FastifyRequest, reply: FastifyReply): Result;
}
