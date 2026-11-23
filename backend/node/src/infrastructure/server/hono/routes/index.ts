import { Hono } from 'hono';
import { appRouter } from './app.route';
import { userRouter } from './user.route';

const router = new Hono();

router.route('/', appRouter);

router.route('/users', userRouter);

export { router };
