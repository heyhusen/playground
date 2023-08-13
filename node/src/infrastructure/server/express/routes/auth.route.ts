import cookieParser from 'cookie-parser';
import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { logIn, logout, profile, updateToken } from '../handlers/auth.handler';
import { accessToken, refreshToken } from '../middlewares/auth';
import { validate } from '../middlewares/validator';
import { logInSchema } from '../schemas/auth.schema';

const authRouter = Router();

authRouter.post('/login', [validate(logInSchema)], asyncHandler(logIn));

authRouter.get('/profile', accessToken(), asyncHandler(profile));

authRouter.get(
	'/refresh',
	cookieParser(),
	refreshToken(),
	asyncHandler(updateToken)
);

authRouter.post(
	'/logout',
	cookieParser(),
	refreshToken(),
	asyncHandler(logout)
);

export { authRouter };
