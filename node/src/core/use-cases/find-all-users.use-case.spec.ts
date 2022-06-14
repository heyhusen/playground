import type { FileService } from '../interfaces/file.interface';
import type { UserRepository, UserTable } from '../interfaces/user.interface';
import { findAllUsers } from './find-all-users.use-case';

describe('findAllUsers', () => {
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
			findAll: jest.fn().mockReturnValue(Promise.resolve([user])),
			findOne: jest.fn(),
			findOneByEmail: jest.fn(),
			update: jest.fn(),
			remove: jest.fn(),
		};

		fileService = {
			upload: jest.fn(),
			getUrl: jest.fn().mockReturnValue(Promise.resolve('avatar.png')),
			remove: jest.fn(),
		};
	});

	test('should return empty array', async () => {
		userRepository.findAll = jest.fn().mockReturnValue(Promise.resolve([]));

		const data = await findAllUsers(userRepository, fileService);

		expect(userRepository.findAll).toBeCalledTimes(1);
		expect(fileService.getUrl).toBeCalledTimes(0);
		expect(data).toEqual(expect.arrayContaining([]));
	});

	test('should return all users', async () => {
		const data = await findAllUsers(userRepository, fileService);
		const { password, ...result } = user;

		expect(userRepository.findAll).toBeCalledTimes(1);
		expect(fileService.getUrl).toBeCalledTimes(0);
		expect(data).toEqual(expect.arrayContaining([{ ...result, avatar: null }]));
	});

	test('should return all users with avatar', async () => {
		userRepository.findAll = jest
			.fn()
			.mockReturnValue(Promise.resolve([{ ...user, photo: 'photo.png' }]));

		const data = await findAllUsers(userRepository, fileService);
		const { password, ...result } = user;

		expect(userRepository.findAll).toBeCalledTimes(1);
		expect(fileService.getUrl).toBeCalledTimes(1);
		expect(data).toEqual(
			expect.arrayContaining([
				{ ...result, photo: 'photo.png', avatar: 'avatar.png' },
			])
		);
	});
});
