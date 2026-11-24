/* eslint-disable @typescript-eslint/unbound-method */
import type { FastifyInstance } from 'fastify';
import {
	ICreateUserDTO,
	IUpdateUserDTO,
} from '../../../../domain/modules/users/commands/interfaces/user-dto.interface.js';
import {
	IJsonApiData,
	IJsonApiPagination,
	RequestParamId,
} from '../../../../presentation/interfaces/http.interface.js';
import { idParamSchema } from '../../../schemas/common.schema.js';
import {
	compatUpdateUserSchema,
	createUserSchema,
	findAllUserSchema,
	updateUserSchema,
} from '../../../schemas/user.schema.js';
import { IUserFilterParams } from '../../../modules/users/interfaces/user-filter-params.interface.js';
import { UserReadHandler } from '../handlers/user-read.handler.js';
import { UserHandler } from '../handlers/user.handler.js';
import { uniqueUserEmail } from '../middlewares/unique-user-email.js';
import { validate } from '../middlewares/validator.js';

export function userRouter(app: FastifyInstance) {
	const handler = new UserHandler();
	const readHandler = new UserReadHandler();

	app.get<{ Querystring: IJsonApiPagination<IUserFilterParams> }>(
		'/',
		{ preHandler: [validate(findAllUserSchema)] },
		readHandler.readAll.bind(readHandler)
	);

	app.post<{
		Params: RequestParamId;
		Body: IJsonApiData<Partial<ICreateUserDTO>>;
	}>(
		'/',
		{
			preHandler: [validate(createUserSchema), uniqueUserEmail()],
		},
		handler.create.bind(handler)
	);

	app.get<{ Params: RequestParamId }>(
		'/:id',
		{ preHandler: [validate(idParamSchema)] },
		readHandler.read.bind(readHandler)
	);

	app.patch<{ Params: RequestParamId; Body: IJsonApiData<IUpdateUserDTO> }>(
		'/:id',
		{
			preHandler: [
				validate(idParamSchema),
				validate(updateUserSchema),
				uniqueUserEmail(),
			],
		},
		handler.update.bind(handler)
	);

	app.put<{ Params: RequestParamId; Body: IJsonApiData<ICreateUserDTO> }>(
		'/',
		{
			preHandler: [validate(compatUpdateUserSchema), uniqueUserEmail()],
		},
		handler.addionalUpdate.bind(handler)
	);

	app.delete<{ Params: RequestParamId }>(
		'/:id',
		{ preHandler: [validate(idParamSchema)] },
		handler.delete.bind(handler)
	);
}
