import type { FastifyReply, FastifyRequest } from 'fastify';

export interface IBaseSingleHandler<Result> {
	execute: (request: FastifyRequest, reply: FastifyReply) => Result;
}
