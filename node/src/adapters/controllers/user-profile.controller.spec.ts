import { beforeAll, describe, expect, test, vi } from 'vitest';
import { UnauthorizedException } from '../../core/exceptions/unauthorized.exception';
import type { UserRequest } from '../../core/interfaces/auth.interface';
import type { FileService } from '../../core/interfaces/file.interface';
import type {
	UserRepository,
	UserResult,
	UserTable,
} from '../../core/interfaces/user.interface';
import { findOneUser } from '../../core/use-cases/find-one-user.use-case';
import type { ResponseModel } from '../interfaces/common.interface';
import type { HttpRequestUser } from '../interfaces/http.interface';
import type { UserResponse } from '../interfaces/user.interface';
import { userProfileController } from './user-profile.controller';

vi.mock('../../core/use-cases/find-one-user.use-case');

describe('userProfileController', () => {
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

	const mockedFindOneUser = vi.mocked(findOneUser, true);

	const controller = userProfileController(userRepository, fileService);

	beforeAll(() => {
		mockedFindOneUser.mockImplementation(() => {
			const { password, ...result } = user;

			return Promise.resolve<UserResult>({
				...result,
				photo: null,
				avatar: null,
			});
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

		expect(data).toEqual<ResponseModel<UserResponse>>({
			status: 200,
			data: { ...result, photo: null, avatar: null, type: 'users' },
		});
	});
});
