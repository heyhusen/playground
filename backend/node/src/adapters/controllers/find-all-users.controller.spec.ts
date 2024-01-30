import { StatusCodes } from 'http-status-codes';
import { mockedFindAllUsers } from '../../../__tests__/mocks/user.mock';
import type { FileService } from '../../core/interfaces/file.interface';
import type {
	UserRepository,
	UserResult,
	UserTable,
} from '../../core/interfaces/user.interface';
import type { HttpRequest } from '../interfaces/http.interface';
import { findAllUsersController } from './find-all-users.controller';

describe('findAllUsersController', () => {
	const userRepository: UserRepository = {
		create: jest.fn(),
		findAll: jest.fn(),
		findOne: jest.fn(),
		findOneByEmail: jest.fn(),
		update: jest.fn(),
		remove: jest.fn(),
		truncate: jest.fn(),
	};
	const fileService: FileService = {
		upload: jest.fn(),
		getUrl: jest.fn(),
		remove: jest.fn(),
	};

	const controller = findAllUsersController(userRepository, fileService);

	const request: HttpRequest = {
		headers: {},
		params: {},
		body: {},
		user: {},
		cookies: {},
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

	beforeEach(() => {
		mockedFindAllUsers.mockImplementation(() => {
			return Promise.resolve<UserResult[]>([
				{
					...user,
					avatar: user.photo ? 'avatar.png' : null,
				},
			]);
		});
	});

	test('should return empty array', async () => {
		mockedFindAllUsers.mockReturnValue(Promise.resolve([]));

		const data = await controller(request);

		expect(data.status).toEqual(StatusCodes.OK);
		expect(data.data).toEqual([]);
	});

	test('should return all users', async () => {
		const data = await controller(request);
		expect(data.status).toEqual(StatusCodes.OK);
		expect(data.data).toEqual(
			expect.arrayContaining([
				{
					...user,
					avatar: null,
				},
			])
		);
	});

	test('should return all users with avatar', async () => {
		user = {
			...user,
			photo: 'photo.png',
		};

		const data = await controller(request);

		expect(data.status).toEqual(StatusCodes.OK);
		expect(data.data).toEqual(
			expect.arrayContaining([
				{
					...user,
					avatar: 'avatar.png',
				},
			])
		);
	});
});
