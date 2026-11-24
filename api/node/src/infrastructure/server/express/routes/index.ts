import { Router } from 'express';
import { appRouter } from './app.route.js';
import { userRouter } from './user.route.js';

const router = Router();

router.use('/', appRouter);

router.use('/users', userRouter);

export { router };
