import { Hono } from 'hono';
import { appRouter } from './app.route.js';
import { userRouter } from './user.route.js';

const router = new Hono();

router.route('/', appRouter);

router.route('/users', userRouter);

export { router };
