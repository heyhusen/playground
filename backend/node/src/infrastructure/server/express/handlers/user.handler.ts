import type { Request, Response } from 'express';
import { createReadStream } from 'fs';
import { extname } from 'path';
import { DataDocument, Linker, Serializer } from 'ts-japi';
import { createUserController } from '../../../../adapters/controllers/create-user.controller';
import { findAllUsersController } from '../../../../adapters/controllers/find-all-users.controller';
import { findOneUserController } from '../../../../adapters/controllers/find-one-user.controller';
import { removeUserController } from '../../../../adapters/controllers/remove-user.controller';
import { updateUserController } from '../../../../adapters/controllers/update-user.controller';
import type {
	HttpRequest,
	HttpRequestBody,
	JsonApiData,
} from '../../../../adapters/interfaces/http.interface';
import type {
	CreateUser,
	UpdateUser,
	UserData,
	UserRequestParams,
} from '../../../../adapters/interfaces/user.interface';
import { appConfig } from '../../../config/app';
import { userRepository } from '../../../repositories/user.repository';
import { fileService } from '../../../services/file.service';

const userSerializer = new Serializer<UserData | UserData[]>('users', {
	version: '1.1',
});
const userLinker = (type: 'multi' | 'single' = 'multi') => {
	const UserLinker = new Linker<[UserData | UserData[]]>((users) => {
		return type === 'multi' || Array.isArray(users)
			? `${appConfig.url}/users/`
			: `${appConfig.url}/users/${users.id}`;
	});

	return UserLinker;
};

export async function create(
	req: Request<unknown, unknown, JsonApiData<CreateUser>>,
	res: Response<Partial<DataDocument<UserData>>>
) {
	let request: HttpRequestBody<CreateUser> = {
		body: {
			...req.body.data.attributes,
			id: req.body.data.id,
		},
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

	const controller = createUserController(userRepository);
	const { status, data } = await controller(request);

	const result = await userSerializer.serialize(data, {
		linkers: {
			resource: userLinker('single'),
		},
	});

	res.status(status).contentType('application/vnd.api+json').json(result);
}

export async function findAll(
	_req: Request,
	res: Response<Partial<DataDocument<UserData[]>>>
) {
	const controller = findAllUsersController(userRepository, fileService);
	const { status, data } = await controller({});

	const result = await userSerializer.serialize(data, {
		linkers: {
			resource: userLinker('multi'),
		},
	});

	res.status(status).contentType('application/vnd.api+json').json(result);
}

export async function findOne(
	req: Request<UserRequestParams>,
	res: Response<Partial<DataDocument<UserData>>>
) {
	const controller = findOneUserController(userRepository, fileService);

	const { status, data } = await controller({
		params: req.params,
	});

	const result = await userSerializer.serialize(data, {
		linkers: {
			resource: userLinker('single'),
		},
	});

	res.status(status).contentType('application/vnd.api+json').json(result);
}

export async function update(
	req: Request<UserRequestParams, unknown, JsonApiData<UpdateUser>>,
	res: Response<Partial<DataDocument<UserData>>>
) {
	let request: HttpRequest<unknown, UserRequestParams, UpdateUser> = {
		params: req.params,
		body: {
			...req.body.data.attributes,
			id: req.body.data.id,
		},
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

	const controller = updateUserController(userRepository, fileService);

	const { status, data } = await controller(request);

	const result = await userSerializer.serialize(data, {
		linkers: {
			resource: userLinker('single'),
		},
	});

	res.status(status).contentType('application/vnd.api+json').json(result);
}

export async function remove(req: Request<UserRequestParams>, res: Response) {
	const controller = removeUserController(userRepository, fileService);

	const { status } = await controller({
		params: req.params,
	});

	res.status(status).contentType('application/vnd.api+json').end();
}
