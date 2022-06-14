import cookieParser from 'cookie-parser';
import { Router } from 'express';
import expressAsyncHandler from 'express-async-handler';
import { logIn, logout, profile, updateToken } from '../handlers/auth.handler';
import { accessToken, refreshToken } from '../middlewares/auth';

const authRouter = Router();

authRouter.post('/login', expressAsyncHandler(logIn));

authRouter.get('/profile', accessToken(), expressAsyncHandler(profile));

authRouter.get(
	'/refresh',
	cookieParser(),
	refreshToken(),
	expressAsyncHandler(updateToken)
);

authRouter.post(
	'/logout',
	cookieParser(),
	refreshToken(),
	expressAsyncHandler(logout)
);

export { authRouter };
