import cookieParser from 'cookie-parser';
import { Router } from 'express';
import expressAsyncHandler from 'express-async-handler';
import { logIn, logout, profile, updateToken } from '../handlers/auth.handler';
import { accessToken, refreshToken } from '../middlewares/auth';
import { validator } from '../middlewares/validator';

const authRouter = Router();

authRouter.post(
	'/login',
	[
		validator.validate({
			body: {
				type: 'object',
				properties: {
					username: {
						type: 'string',
						minLength: 1,
					},
					password: {
						type: 'string',
						minLength: 1,
					},
				},
				required: ['username', 'password'],
				errorMessage: {
					required: {
						username: 'The username is required.',
						password: 'The password is required.',
					},
					properties: {
						username: 'The username is required.',
						password: 'The password is required.',
					},
				},
			},
		}),
	],
	expressAsyncHandler(logIn)
);

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
