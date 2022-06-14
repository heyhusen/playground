import type { FileService } from '../../core/interfaces/file.interface';
import type {
	UserRepository,
	UserTable,
} from '../../core/interfaces/user.interface';
import { findAllUsers } from '../../core/use-cases/find-all-users.use-case';
import type { HttpRequest } from '../interfaces/http.interface';
import { findAllUsersController } from './find-all-users.controller';

jest.mock('../../core/use-cases/find-all-users.use-case');

describe('findAllUsersController', () => {
	const userRepository: UserRepository = {
		create: jest.fn(),
		findAll: jest.fn(),
		findOne: jest.fn(),
		findOneByEmail: jest.fn(),
		update: jest.fn(),
		remove: jest.fn(),
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
		name: 'John Doe',
		nickname: null,
		email: 'johndoe@example.com',
		email_verified_at: null,
		password: 'abogoboga',
		created_at: '2022-06-11 01:55:13',
		updated_at: '2022-06-11 01:55:13',
	};

	const mockedFindAllUsers = jest.mocked(findAllUsers, true);

	beforeEach(() => {
		mockedFindAllUsers.mockImplementation(() => {
			const { password, ...result } = user;

			return Promise.resolve([
				{ ...result, avatar: user.photo ? 'avatar.png' : null },
			]);
		});
	});

	test('should return empty array', async () => {
		mockedFindAllUsers.mockReturnValue(Promise.resolve([]));

		const data = await controller(request);

		expect(data.status).toEqual(200);
		expect(data.data).toEqual([]);
	});

	test('should return all users', async () => {
		const data = await controller(request);
		const { password, ...result } = user;

		expect(data.status).toEqual(200);
		expect(data.data).toEqual(
			expect.arrayContaining([{ ...result, avatar: null, type: 'users' }])
		);
	});

	test('should return all users with avatar', async () => {
		user = { ...user, photo: 'photo.png' };

		const data = await controller(request);
		const { password, ...result } = user;

		expect(data.status).toEqual(200);
		expect(data.data).toEqual(
			expect.arrayContaining([
				{ ...result, avatar: 'avatar.png', type: 'users' },
			])
		);
	});
});
