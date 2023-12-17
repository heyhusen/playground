import { beforeEach, describe, expect, test, vi } from 'vitest';
import { NotFoundException } from '../exceptions/not-found.exception';
import type { FileService } from '../interfaces/file.interface';
import type {
	UserRepository,
	UserResult,
	UserTable,
} from '../interfaces/user.interface';
import { findOneUser } from './find-one-user.use-case';

describe('findOneUser', () => {
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
			findAll: vi.fn(),
			findOne: vi.fn((id: string) => {
				if (id !== user.id) {
					return Promise.resolve(null);
				}

				return Promise.resolve<UserTable>(user);
			}),
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

	test('should throw error when user not found', async () => {
		await expect(
			findOneUser('invalid-id', userRepository, fileService)
		).rejects.toThrow(new NotFoundException('The user is not found.'));
	});

	test('should return an user without avatar', async () => {
		const data = await findOneUser(user.id, userRepository, fileService);
		expect(userRepository.findOne).toBeCalledTimes(1);
		expect(fileService.getUrl).toBeCalledTimes(0);
		expect(data).toEqual<UserResult>({
			...user,
			avatar: null,
		});
	});

	test('should return an user with avatar', async () => {
		userRepository.findOne = vi.fn().mockReturnValue(
			Promise.resolve({
				...user,
				photo: 'photo.png',
			})
		);

		const data = await findOneUser(user.id, userRepository, fileService);
		expect(userRepository.findOne).toBeCalledTimes(1);
		expect(fileService.getUrl).toBeCalledTimes(1);
		expect(data).toEqual<UserResult>({
			...user,
			photo: 'photo.png',
			avatar: 'avatar.png',
		});
	});
});
