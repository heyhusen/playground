import type { Request, Response } from 'express';
import { createReadStream } from 'fs';
import { extname } from 'path';
import { createUserController } from '../../../adapters/controllers/create-user.controller';
import { findAllUsersController } from '../../../adapters/controllers/find-all-users.controller';
import { findOneUserController } from '../../../adapters/controllers/find-one-user.controller';
import { removeUserController } from '../../../adapters/controllers/remove-user.controller';
import { updateUserController } from '../../../adapters/controllers/update-user.controller';
import type {
	HttpRequest,
	HttpRequestBody,
	JsonApiData,
} from '../../../adapters/interfaces/http.interface';
import type {
	CreateUser,
	UpdateUser,
	UserData,
	UserRequestParams,
	UserResponse,
} from '../../../adapters/interfaces/user.interface';
import { userRepository } from '../../repositories/user.repository';
import { fileService } from '../../services/file.service';
import { hashService } from '../../services/hash.service';

export async function create(
	req: Request<unknown, unknown, CreateUser>,
	res: Response<JsonApiData<UserData>>
) {
	let request: HttpRequestBody<CreateUser> = {
		body: req.body,
	};

	if (req.file) {
		const { filename, size, mimetype, path, originalname } = req.file;

		request = {
			...request,
			file: {
				name: filename,
				size,
				type: mimetype,
				extension: extname(originalname),
				content: createReadStream(path),
			},
		};
	}

	const controller = createUserController(userRepository, hashService);

	const { status, data } = await controller(request);

	const { id, type, ...attributes } = data as UserResponse;

	res.status(status).json({
		jsonapi: {
			version: '1.0',
		},
		links: {
			self: req.originalUrl,
		},
		data: {
			id,
			type,
			attributes,
		},
	});
}

export async function findAll(
	req: Request,
	res: Response<JsonApiData<UserData>>
) {
	const controller = findAllUsersController(userRepository, fileService);

	const { status, data } = await controller({});

	res.status(status).json({
		jsonapi: {
			version: '1.0',
		},
		links: {
			self: req.originalUrl,
		},
		data: (data as UserResponse[]).map(({ id, type, ...obj }) => {
			return {
				id,
				type,
				attributes: obj,
			};
		}),
	});
}

export async function findOne(
	req: Request<UserRequestParams>,
	res: Response<JsonApiData<UserData>>
) {
	const controller = findOneUserController(userRepository, fileService);

	const { status, data } = await controller({ params: req.params });

	const { id, type, ...attributes } = data as UserResponse;

	res.status(status).json({
		jsonapi: {
			version: '1.0',
		},
		links: {
			self: req.originalUrl,
		},
		data: {
			id,
			type,
			attributes,
		},
	});
}

export async function update(
	req: Request<UserRequestParams, unknown, UpdateUser>,
	res: Response<JsonApiData<UserData>>
) {
	let request: HttpRequest<unknown, UserRequestParams, UpdateUser> = {
		params: req.params,
		body: req.body,
	};

	if (req.file) {
		const { filename, size, mimetype, path, originalname } = req.file;

		request = {
			...request,
			file: {
				name: filename,
				size,
				type: mimetype,
				extension: extname(originalname),
				content: createReadStream(path),
			},
		};
	}

	const controller = updateUserController(
		userRepository,
		hashService,
		fileService
	);

	const { status, data } = await controller(request);

	const { id, type, ...attributes } = data as UserResponse;

	res.status(status).json({
		jsonapi: {
			version: '1.0',
		},
		links: {
			self: req.originalUrl,
		},
		data: {
			id,
			type,
			attributes,
		},
	});
}

export async function remove(req: Request<UserRequestParams>, res: Response) {
	const controller = removeUserController(userRepository, fileService);

	const { status } = await controller({ params: req.params });

	res.status(status).end();
}
