import { BadRequestException } from '../../core/exceptions/bad-request.exception';
import type { FileService } from '../../core/interfaces/file.interface';
import type { UserRepository } from '../../core/interfaces/user.interface';
import { removeUser } from '../../core/use-cases/remove-user.use-case';
import type { HttpRequestParams } from '../interfaces/http.interface';
import type { UserRequestParams } from '../interfaces/user.interface';
import { removeUserController } from './remove-user.controller';

jest.mock('../../core/use-cases/remove-user.use-case');

describe('removeUserController', () => {
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

	let request: HttpRequestParams<UserRequestParams> = {};

	const controller = removeUserController(userRepository, fileService);

	const mockedRemoveUser = jest.mocked(removeUser, true);

	beforeAll(() => {
		mockedRemoveUser.mockReturnValue(Promise.resolve());
	});

	test('should throw error when parameter is empty', async () => {
		await expect(controller(request)).rejects.toThrow(
			new BadRequestException('An id parameter is expected.')
		);
	});

	test('should remove an user', async () => {
		request = { ...request, params: { id: 'id' } };

		const data = await controller(request);

		expect(removeUser).toBeCalledTimes(1);
		expect(removeUser).toBeCalledWith('id', userRepository, fileService);
		expect(data).toEqual({ status: 200 });
	});
});
