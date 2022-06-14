import { NotFoundException } from '../exceptions/not-found.exception';
import type { FileService } from '../interfaces/file.interface';
import type { UserRepository, UserTable } from '../interfaces/user.interface';
import { removeUser } from './remove-user.use-case';

describe('removeUser', () => {
	let userRepository: UserRepository;
	let fileService: FileService;

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

	beforeEach(() => {
		userRepository = {
			create: jest.fn(),
			findAll: jest.fn(),
			findOne: jest.fn(),
			findOneByEmail: jest.fn(),
			update: jest.fn(),
			remove: jest.fn((id: string) => {
				if (id !== user.id) {
					return Promise.resolve(null);
				}

				return Promise.resolve(user);
			}),
		};

		fileService = {
			upload: jest.fn(),
			getUrl: jest.fn(),
			remove: jest.fn(),
		};
	});

	test('should throw error when user not found', async () => {
		await expect(
			removeUser('invalid-id', userRepository, fileService)
		).rejects.toThrow(new NotFoundException('The user is not found.'));
	});

	test('should delete user with no avatar', async () => {
		await removeUser('id', userRepository, fileService);

		expect(userRepository.remove).toBeCalledTimes(1);
		expect(fileService.remove).toBeCalledTimes(0);
	});

	test('should delete user with an avatar', async () => {
		userRepository.remove = jest
			.fn()
			.mockReturnValue(Promise.resolve({ ...user, photo: 'photo.png' }));

		await removeUser('id', userRepository, fileService);

		expect(userRepository.remove).toBeCalledTimes(1);
		expect(fileService.remove).toBeCalledTimes(1);
	});
});
