/* eslint-disable @typescript-eslint/unbound-method */
import { Router } from 'express';
import { idParamSchema } from '../../../schemas/common.schema';
import {
	compatUpdateUserSchema,
	createUserSchema,
	findAllUserSchema,
	updateUserSchema,
} from '../../../schemas/user.schema';
import { UserHandler } from '../handlers/user.handler';
import { uniqueUserEmail } from '../middlewares/unique-user-email';
import { validate } from '../middlewares/validator';

const userRouter = Router();

const handler = new UserHandler();

userRouter.get(
	'/',
	[validate(findAllUserSchema)],
	handler.readAll.bind(handler)
);

userRouter.post(
	'/',
	validate(createUserSchema),
	uniqueUserEmail(),
	handler.create.bind(handler)
);

userRouter.get('/:id', validate(idParamSchema), handler.read.bind(handler));

userRouter.patch(
	'/:id',
	validate(idParamSchema),
	validate(updateUserSchema),
	uniqueUserEmail(),
	handler.update.bind(handler)
);

userRouter.put(
	'/',
	[validate(compatUpdateUserSchema)],
	uniqueUserEmail(),
	handler.addionalUpdate.bind(handler)
);

userRouter.delete(
	'/:id',
	validate(idParamSchema),
	handler.delete.bind(handler)
);

export { userRouter };
