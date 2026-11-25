import type { FastifyReply, FastifyRequest } from 'fastify';

export function defaultRequest() {
	return (request: FastifyRequest, _reply: FastifyReply, done: () => void) => {
		Object.assign(request.headers, {
			timezone_name: request.headers.timezone_name ?? 'Asia/Jakarta',
			timezone_offset: request.headers.timezone_offset ?? 7,
			idempotency_key: request.headers['idempotency-key'],
		});

		done();
	};
}
