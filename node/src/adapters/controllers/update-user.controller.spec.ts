import { Readable } from 'stream';
import type { File } from '../../core/entities/common.entity';
import { BadRequestException } from '../../core/exceptions/bad-request.exception';
import type { FileService } from '../../core/interfaces/file.interface';
import type { HashService } from '../../core/interfaces/hash.interface';
import type {
	UpdateUserDto,
	UserRepository,
	UserTable,
} from '../../core/interfaces/user.interface';
import { updateUser } from '../../core/use-cases/update-user.use-case';
import type { HttpRequest } from '../interfaces/http.interface';
import type { UserRequestParams } from '../interfaces/user.interface';
import { updateUserController } from './update-user.controller';

jest.mock('../../core/use-cases/update-user.use-case');

describe('updateUserController', () => {
	const userRepository: UserRepository = {
		create: jest.fn(),
		findAll: jest.fn(),
		findOne: jest.fn(),
		findOneByEmail: jest.fn(),
		update: jest.fn(),
		remove: jest.fn(),
	};
	const hashService: HashService = {
		create: jest.fn(),
		verify: jest.fn(),
	};
	const fileService: FileService = {
		upload: jest.fn(),
		getUrl: jest.fn(),
		remove: jest.fn(),
	};

	let dto: UpdateUserDto = {};

	const photo: File = {
		name: 'photo',
		extension: 'png',
		size: 24,
		type: 'image/png',
		content: Readable.from(['this is content']),
	};

	let request: HttpRequest<
		unknown,
		UserRequestParams,
		Omit<UpdateUserDto, 'photo'>
	> = {
		body: dto,
	};

	const user: UserTable = {
		id: 'id',
		name: 'John Doe',
		nickname: null,
		email: 'johndoe@example.com',
		email_verified_at: null,
		password: 'abogoboga',
		created_at: '2022-06-11 01:55:13',
		updated_at: '2022-06-11 01:55:13',
	};

	const controller = updateUserController(
		userRepository,
		hashService,
		fileService
	);

	const mockedUpdateUser = jest.mocked(updateUser, true);

	beforeEach(() => {
		mockedUpdateUser.mockImplementation(() => {
			const { password, ...result } = user;

			return Promise.resolve({
				...result,
				name: dto.name ? dto.name : result.name,
				// nickname: dto.nickname ? dto.nickname : result.nickname,
				email: dto.email ? dto.email : result.email,
				photo: dto.photo ? 'photo.png' : null,
				avatar: dto.photo ? 'avatar.png' : null,
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
		const { password, ...result } = user;

		expect(data).toEqual({
			status: 200,
			data: {
				...result,
				photo: null,
				avatar: null,
				type: 'users',
			},
		});
	});

	test("should only update user's name", async () => {
		dto = { name: 'Jane Doe' };

		const data = await controller(request);
		const { password, ...result } = user;

		expect(data).toEqual({
			status: 200,
			data: {
				...result,
				name: 'Jane Doe',
				photo: null,
				avatar: null,
				type: 'users',
			},
		});
	});

	test("should only update user's email", async () => {
		dto = { email: 'janedoe@example.com' };
		const data = await controller(request);
		const { password, ...result } = user;

		expect(data).toEqual({
			status: 200,
			data: {
				...result,
				email: 'janedoe@example.com',
				photo: null,
				avatar: null,
				type: 'users',
			},
		});
	});

	test("should only update user's avatar", async () => {
		dto = { photo };
		const data = await controller(request);
		const { password, ...result } = user;

		expect(data).toEqual({
			status: 200,
			data: {
				...result,
				photo: 'photo.png',
				avatar: 'avatar.png',
				type: 'users',
			},
		});
	});
});
