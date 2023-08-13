import { beforeEach, describe, expect, test, vi } from 'vitest';
import type { FileService } from '../../core/interfaces/file.interface';
import type {
	UserRepository,
	UserResult,
	UserTable,
} from '../../core/interfaces/user.interface';
import { findAllUsers } from '../../core/use-cases/find-all-users.use-case';
import type { HttpRequest } from '../interfaces/http.interface';
import type { UserResponse } from '../interfaces/user.interface';
import { findAllUsersController } from './find-all-users.controller';

vi.mock('../../core/use-cases/find-all-users.use-case');

describe('findAllUsersController', () => {
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

	const mockedFindAllUsers = vi.mocked(findAllUsers, true);

	beforeEach(() => {
		mockedFindAllUsers.mockImplementation(() => {
			const { password, ...result } = user;

			return Promise.resolve<UserResult[]>([
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
			expect.arrayContaining<UserResponse>([
				{ ...result, avatar: null, type: 'users' },
			])
		);
	});

	test('should return all users with avatar', async () => {
		user = { ...user, photo: 'photo.png' };

		const data = await controller(request);
		const { password, ...result } = user;

		expect(data.status).toEqual(200);
		expect(data.data).toEqual(
			expect.arrayContaining<UserResponse>([
				{ ...result, avatar: 'avatar.png', type: 'users' },
			])
		);
	});
});
