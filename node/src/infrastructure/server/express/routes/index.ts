import { Router } from 'express';
import { appRouter } from './app.route';
import { userRouter } from './user.route';

const router = Router();

router.use('/', appRouter);

router.use('/user', userRouter);

export { router };
