import { Router } from 'express';
import { accessToken } from '../middlewares/auth';
import { appRouter } from './app.route';
import { authRouter } from './auth.route';
import { userRouter } from './user.route';

const router = Router();

router.use('/', appRouter);

router.use('/auth', authRouter);

router.use('/user', accessToken(), userRouter);

export { router };
