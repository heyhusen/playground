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
} from '../../../adapters/interfaces/http.interface';
import type { UserRequestParams } from '../../../adapters/interfaces/user.interface';
import type {
	CreateUserDto,
	UpdateUserDto,
} from '../../../core/interfaces/user.interface';
import { userRepository } from '../../repositories/user.repository';
import { fileService } from '../../services/file.service';
import { hashService } from '../../services/hash.service';

export async function create(
	req: Request<unknown, unknown, Omit<CreateUserDto, 'photo'>>,
	res: Response
) {
	let request: HttpRequestBody<Omit<CreateUserDto, 'photo'>> = {
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

	const controller = createUserController(
		userRepository,
		hashService,
		fileService
	);

	const { status, data } = await controller(request);

	res.status(status).json(data);
}

export async function findAll(_req: Request, res: Response) {
	const controller = findAllUsersController(userRepository, fileService);

	const { status, data } = await controller({});

	res.status(status).json(data);
}

export async function findOne(req: Request<UserRequestParams>, res: Response) {
	const controller = findOneUserController(userRepository, fileService);

	const { status, data } = await controller({ params: req.params });

	res.status(status).json(data);
}

export async function update(
	req: Request<UserRequestParams, unknown, Omit<UpdateUserDto, 'photo'>>,
	res: Response
) {
	let request: HttpRequest<
		unknown,
		UserRequestParams,
		Omit<UpdateUserDto, 'photo'>
	> = {
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

	res.status(status).json(data);
}

export async function remove(req: Request<UserRequestParams>, res: Response) {
	const controller = removeUserController(userRepository, fileService);

	const { status } = await controller({ params: req.params });

	res.status(status).end();
}
