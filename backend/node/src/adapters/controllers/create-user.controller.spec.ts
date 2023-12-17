import { beforeEach, describe, expect, test, vi } from 'vitest';
import { BadRequestException } from '../../core/exceptions/bad-request.exception';
import type {
	CreateUserDto,
	UserRepository,
	UserResult,
	UserTable,
} from '../../core/interfaces/user.interface';
import { createUser } from '../../core/use-cases/create-user.use-case';
import type { ResponseModel } from '../interfaces/common.interface';
import type { HttpRequestBody } from '../interfaces/http.interface';
import type { UserResponse } from '../interfaces/user.interface';
import { createUserController } from './create-user.controller';

vi.mock('../../core/use-cases/create-user.use-case');

describe('createUserController', () => {
	const userRepository: UserRepository = {
		create: vi.fn(),
		findAll: vi.fn(),
		findOne: vi.fn(),
		findOneByEmail: vi.fn(),
		update: vi.fn(),
		remove: vi.fn(),
		truncate: vi.fn(),
	};

	const dto: CreateUserDto = {
		first_name: 'John',
		last_name: 'Doe',
		email: 'johndoe@example.com',
	};

	const controller = createUserController(userRepository);

	let request: HttpRequestBody<CreateUserDto> = {};

	const user: UserTable = {
		id: 'id',
		first_name: dto.first_name,
		last_name: dto.last_name,
		nickname: null,
		email: dto.email,
		created_at: '2022-06-11 01:55:13',
		updated_at: '2022-06-11 01:55:13',
	};

	const mockedCreateUser = vi.mocked(createUser, true);

	beforeEach(() => {
		mockedCreateUser.mockImplementation(() => {
			return Promise.resolve<UserResult>({
				...user,
				first_name: dto.first_name,
				last_name: dto.last_name,
				email: dto.email,
				photo: null,
				avatar: null,
			});
		});
	});

	test('should throw error when request body is empty', async () => {
		await expect(controller(request)).rejects.toThrow(
			new BadRequestException('Request body is empty.')
		);
	});

	test('should create an user', async () => {
		request = { ...request, body: dto };

		const data = await controller(request);

		expect(data).toEqual<ResponseModel<UserResponse>>({
			status: 201,
			data: {
				...user,
				photo: null,
				avatar: null,
				type: 'users',
			},
		});
	});
});
