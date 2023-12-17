import { beforeEach, describe, expect, test, vi } from 'vitest';
import type { FileService } from '../interfaces/file.interface';
import type {
	UserRepository,
	UserResult,
	UserTable,
} from '../interfaces/user.interface';
import { findAllUsers } from './find-all-users.use-case';

describe('findAllUsers', () => {
	let userRepository: UserRepository;
	let fileService: FileService;

	const user: UserTable = {
		id: 'id',
		first_name: 'John',
		last_name: 'Doe',
		nickname: null,
		email: 'johndoe@example.com',
		created_at: '2022-06-11 01:55:13',
		updated_at: '2022-06-11 01:55:13',
	};

	beforeEach(() => {
		userRepository = {
			create: vi.fn(),
			findAll: vi.fn().mockReturnValue(Promise.resolve<UserTable[]>([user])),
			findOne: vi.fn(),
			findOneByEmail: vi.fn(),
			update: vi.fn(),
			remove: vi.fn(),
			truncate: vi.fn(),
		};

		fileService = {
			upload: vi.fn(),
			getUrl: vi.fn().mockReturnValue(Promise.resolve('avatar.png')),
			remove: vi.fn(),
		};
	});

	test('should return empty array', async () => {
		userRepository.findAll = vi.fn().mockReturnValue(Promise.resolve([]));

		const data = await findAllUsers(userRepository, fileService);

		expect(userRepository.findAll).toBeCalledTimes(1);
		expect(fileService.getUrl).toBeCalledTimes(0);
		expect(data).toEqual(expect.arrayContaining([]));
	});

	test('should return all users', async () => {
		const data = await findAllUsers(userRepository, fileService);
		expect(userRepository.findAll).toBeCalledTimes(1);
		expect(fileService.getUrl).toBeCalledTimes(0);
		expect(data).toEqual(
			expect.arrayContaining<UserResult>([
				{
					...user,
					avatar: null,
				},
			])
		);
	});

	test('should return all users with avatar', async () => {
		userRepository.findAll = vi
			.fn()
			.mockReturnValue(Promise.resolve([{ ...user, photo: 'photo.png' }]));

		const data = await findAllUsers(userRepository, fileService);
		expect(userRepository.findAll).toBeCalledTimes(1);
		expect(fileService.getUrl).toBeCalledTimes(1);
		expect(data).toEqual(
			expect.arrayContaining<UserResult>([
				{
					...user,
					photo: 'photo.png',
					avatar: 'avatar.png',
				},
			])
		);
	});
});
