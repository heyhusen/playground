import { UnauthorizedException } from '../../core/exceptions/unauthorized.exception';
import type { UserRequest } from '../../core/interfaces/auth.interface';
import type { FileService } from '../../core/interfaces/file.interface';
import type {
	UserRepository,
	UserTable,
} from '../../core/interfaces/user.interface';
import { findOneUser } from '../../core/use-cases/find-one-user.use-case';
import type { HttpRequestUser } from '../interfaces/http.interface';
import { userProfileController } from './user-profile.controller';

jest.mock('../../core/use-cases/find-one-user.use-case');

describe('userProfileController', () => {
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

	const userRequest: UserRequest = {
		userId: 'id',
		username: 'johndoe@example.com',
	};

	let request: HttpRequestUser<UserRequest> = {};

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

	const mockedFindOneUser = jest.mocked(findOneUser, true);

	const controller = userProfileController(userRepository, fileService);

	beforeAll(() => {
		mockedFindOneUser.mockImplementation(() => {
			const { password, ...result } = user;

			return Promise.resolve({ ...result, photo: null, avatar: null });
		});
	});

	test('should throw error when user request object is empty', async () => {
		await expect(controller(request)).rejects.toThrow(
			new UnauthorizedException('User request is unauthorized.')
		);
	});

	test('should return an user', async () => {
		request = { ...request, user: userRequest };

		const data = await controller(request);
		const { password, ...result } = user;

		expect(data).toEqual({
			status: 200,
			data: { ...result, photo: null, avatar: null, type: 'users' },
		});
	});
});
