import type { FastifyInstance } from 'fastify';
import { appRouter } from './app.route';
import { userRouter } from './user.route';

export async function router(app: FastifyInstance) {
	await app.register(appRouter);

	await app.register(userRouter, { prefix: '/users' });
}
