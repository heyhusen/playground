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

const userRouter = Router();

userRouter.get('/', expressAsyncHandler(findAll));

userRouter.post('/', expressAsyncHandler(create));

userRouter.get('/:id', validateUuid(), expressAsyncHandler(findOne));

userRouter.patch('/:id', validateUuid(), expressAsyncHandler(update));

userRouter.delete('/:id', validateUuid(), expressAsyncHandler(remove));

export { userRouter };
