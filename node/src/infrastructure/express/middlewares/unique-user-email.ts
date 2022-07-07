import type { NextFunction, Request, Response } from 'express';
import expressAsyncHandler from 'express-async-handler';
import { uniqueUserEmailController } from '../../../adapters/controllers/unique-user-email.controller';
import type { HttpRequestBody } from '../../../adapters/interfaces/http.interface';
import type { UpdateUserDto } from '../../../core/interfaces/user.interface';
import { userRepository } from '../../repositories/user.repository';

export function uniqueUserEmail() {
	return expressAsyncHandler(
		async (
			req: Request<unknown, unknown, Pick<UpdateUserDto, 'email'>>,
			_res: Response,
			next: NextFunction
		) => {
			const httpRequest: HttpRequestBody<Pick<UpdateUserDto, 'email'>> = {
				body: req.body,
			};

			const controller = uniqueUserEmailController(userRepository);

			await controller(httpRequest);

			next();
		}
	);
}
