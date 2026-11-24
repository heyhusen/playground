import type { FastifyInstance } from 'fastify';
import { appRouter } from './app.route.js';
import { userRouter } from './user.route.js';

export async function router(app: FastifyInstance) {
	await app.register(appRouter);

	await app.register(userRouter, { prefix: '/users' });
}
