import { BadRequestException } from '../../core/exceptions/bad-request.exception';
import type { HashService } from '../../core/interfaces/hash.interface';
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

jest.mock('../../core/use-cases/create-user.use-case');

describe('createUserController', () => {
	const userRepository: UserRepository = {
		create: jest.fn(),
		findAll: jest.fn(),
		findOne: jest.fn(),
		findOneByEmail: jest.fn(),
		update: jest.fn(),
		remove: jest.fn(),
		truncate: jest.fn(),
	};
	const hashService: HashService = {
		create: jest.fn(),
		verify: jest.fn(),
	};

	const dto: CreateUserDto = {
		name: 'John Doe',
		email: 'johndoe@example.com',
		password: 'abogoboga',
		password_confirmation: 'abogoboga',
	};

	const controller = createUserController(userRepository, hashService);

	let request: HttpRequestBody<CreateUserDto> = {};

	const user: UserTable = {
		id: 'id',
		name: dto.name,
		nickname: null,
		email: dto.email,
		email_verified_at: null,
		password: dto.password,
		created_at: '2022-06-11 01:55:13',
		updated_at: '2022-06-11 01:55:13',
	};

	const mockedCreateUser = jest.mocked(createUser, true);

	beforeEach(() => {
		mockedCreateUser.mockImplementation(() => {
			const { password, ...result } = user;

			return Promise.resolve<UserResult>({
				...result,
				name: dto.name,
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

		const { password, ...result } = user;

		expect(data).toEqual<ResponseModel<UserResponse>>({
			status: 201,
			data: { ...result, photo: null, avatar: null, type: 'users' },
		});
	});
});
