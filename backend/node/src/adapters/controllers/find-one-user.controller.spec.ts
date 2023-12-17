import { beforeEach, describe, expect, test, vi } from 'vitest';
import { BadRequestException } from '../../core/exceptions/bad-request.exception';
import type { FileService } from '../../core/interfaces/file.interface';
import type {
	UserRepository,
	UserResult,
	UserTable,
} from '../../core/interfaces/user.interface';
import { findOneUser } from '../../core/use-cases/find-one-user.use-case';
import type { ResponseModel } from '../interfaces/common.interface';
import type { HttpRequestParams } from '../interfaces/http.interface';
import type {
	UserRequestParams,
	UserResponse,
} from '../interfaces/user.interface';
import { findOneUserController } from './find-one-user.controller';

vi.mock('../../core/use-cases/find-one-user.use-case');

describe('findOneUserController', () => {
	const userRepository: UserRepository = {
		create: vi.fn(),
		findAll: vi.fn(),
		findOne: vi.fn(),
		findOneByEmail: vi.fn(),
		update: vi.fn(),
		remove: vi.fn(),
		truncate: vi.fn(),
	};
	const fileService: FileService = {
		upload: vi.fn(),
		getUrl: vi.fn(),
		remove: vi.fn(),
	};

	const controller = findOneUserController(userRepository, fileService);

	let request: HttpRequestParams<UserRequestParams> = {};

	let user: UserTable = {
		id: 'id',
		first_name: 'John',
		last_name: 'Doe',
		nickname: null,
		email: 'johndoe@example.com',
		created_at: '2022-06-11 01:55:13',
		updated_at: '2022-06-11 01:55:13',
	};

	const mockedFindOneUser = vi.mocked(findOneUser, true);

	beforeEach(() => {
		mockedFindOneUser.mockImplementation(() => {
			return Promise.resolve<UserResult>({
				...user,
				avatar: user.photo ? 'avatar.png' : null,
			});
		});
	});

	test('should throw error when parameter is empty', async () => {
		await expect(controller(request)).rejects.toThrow(
			new BadRequestException('An id parameter is expexted.')
		);
	});

	test('should return an user', async () => {
		request = { ...request, params: { id: 'id' } };

		const data = await controller(request);

		expect(data).toEqual<ResponseModel<UserResponse>>({
			status: 200,
			data: {
				...user,
				avatar: null,
				type: 'users',
			},
		});
	});

	test('should return an user with avatar', async () => {
		user = { ...user, photo: 'photo.png' };

		const data = await controller(request);

		expect(data).toEqual<ResponseModel<UserResponse>>({
			status: 200,
			data: {
				...user,
				avatar: 'avatar.png',
				type: 'users',
			},
		});
	});
});
