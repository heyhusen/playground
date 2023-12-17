import { beforeEach, describe, expect, test, vi } from 'vitest';
import { BadRequestException } from '../../core/exceptions/bad-request.exception';
import type { FileService } from '../../core/interfaces/file.interface';
import type {
	UpdateUserDto,
	UserRepository,
	UserTable,
} from '../../core/interfaces/user.interface';
import { updateUser } from '../../core/use-cases/update-user.use-case';
import type { HttpRequest } from '../interfaces/http.interface';
import type { UserRequestParams } from '../interfaces/user.interface';
import { updateUserController } from './update-user.controller';

vi.mock('../../core/use-cases/update-user.use-case');

describe('updateUserController', () => {
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

	let dto: UpdateUserDto = {};

	let request: HttpRequest<
		unknown,
		UserRequestParams,
		Omit<UpdateUserDto, 'photo'>
	> = {
		body: dto,
	};

	let user: UserTable = {
		id: 'id',
		first_name: 'John',
		last_name: 'Doe',
		nickname: null,
		email: 'johndoe@example.com',
		created_at: '2022-06-11 01:55:13',
		updated_at: '2022-06-11 01:55:13',
	};

	const controller = updateUserController(userRepository, fileService);

	const mockedUpdateUser = vi.mocked(updateUser, true);

	beforeEach(() => {
		mockedUpdateUser.mockImplementation(() => {
			return Promise.resolve({
				...user,
				first_name: dto.first_name ?? user.first_name,
				last_name: dto.last_name ?? user.last_name,
				// nickname: dto.nickname ? dto.nickname : result.nickname,
				email: dto.email ? dto.email : user.email,
				avatar: user.photo ? 'avatar.png' : null,
			});
		});
	});

	test('should throw error when parameter is empty', async () => {
		await expect(controller(request)).rejects.toThrow(
			new BadRequestException('An id parameter is expected.')
		);
	});

	test('should not update user', async () => {
		request = { ...request, params: { id: 'id' } };

		const data = await controller(request);

		expect(data).toEqual({
			status: 200,
			data: {
				...user,
				avatar: null,
				type: 'users',
			},
		});
	});

	test("should only update user's name", async () => {
		dto = {
			first_name: 'John',
			last_name: 'Doe',
		};

		const data = await controller(request);

		expect(data).toEqual({
			status: 200,
			data: {
				...user,
				first_name: 'John',
				last_name: 'Doe',
				avatar: null,
				type: 'users',
			},
		});
	});

	test("should only update user's email", async () => {
		dto = { email: 'janedoe@example.com' };
		const data = await controller(request);

		expect(data).toEqual({
			status: 200,
			data: {
				...user,
				email: 'janedoe@example.com',
				avatar: null,
				type: 'users',
			},
		});
	});

	test("should only update user's avatar", async () => {
		dto = {};
		user = { ...user, photo: 'photo.png' };

		const data = await controller(request);

		expect(data).toEqual({
			status: 200,
			data: {
				...user,
				avatar: 'avatar.png',
				type: 'users',
			},
		});
	});
});
