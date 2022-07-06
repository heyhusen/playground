import { Router } from 'express';
import expressAsyncHandler from 'express-async-handler';
import {
	create,
	findAll,
	findOne,
	remove,
	update,
} from '../handlers/user.handler';
import { validateUuid } from '../middlewares/validate-uuid';
import { validator } from '../middlewares/validator';

const userRouter = Router();

userRouter.get('/', expressAsyncHandler(findAll));

userRouter.post(
	'/',
	[
		validator.validate({
			body: {
				type: 'object',
				properties: {
					name: {
						type: 'string',
						minLength: 1,
					},
					email: {
						type: 'string',
						minLength: 1,
						format: 'email',
						errorMessage: {
							minLength: 'The email is required.',
							format: 'The email must be a valid email address.',
						},
					},
					password: {
						type: 'string',
						minLength: 8,
						errorMessage: {
							minLength: 'The password must be at least 8 characters.',
						},
					},
					password_confirmation: {
						type: 'string',
						minLength: 8,
						const: {
							$data: '1/password',
						},
						errorMessage: {
							minLength:
								'The password confirmation must be at least 8 characters.',
							const: 'The password confirmation does not match.',
						},
					},
				},
				required: ['name', 'email', 'password', 'password_confirmation'],
				errorMessage: {
					required: {
						name: 'The name is required.',
						email: 'The email is required.',
						password: 'The password is required.',
						password_confirmation: 'The password confirmation is required.',
					},
					properties: {
						name: 'The name is required.',
					},
				},
			},
		}),
	],
	expressAsyncHandler(create)
);

userRouter.get('/:id', validateUuid(), expressAsyncHandler(findOne));

userRouter.patch('/:id', validateUuid(), expressAsyncHandler(update));

userRouter.delete('/:id', validateUuid(), expressAsyncHandler(remove));

export { userRouter };
