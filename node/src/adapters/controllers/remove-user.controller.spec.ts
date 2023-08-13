import { beforeAll, describe, expect, test, vi } from 'vitest';
import { BadRequestException } from '../../core/exceptions/bad-request.exception';
import type { FileService } from '../../core/interfaces/file.interface';
import type { UserRepository } from '../../core/interfaces/user.interface';
import { removeUser } from '../../core/use-cases/remove-user.use-case';
import type { ResponseModel } from '../interfaces/common.interface';
import type { HttpRequestParams } from '../interfaces/http.interface';
import type { UserRequestParams } from '../interfaces/user.interface';
import { removeUserController } from './remove-user.controller';

vi.mock('../../core/use-cases/remove-user.use-case');

describe('removeUserController', () => {
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

	let request: HttpRequestParams<UserRequestParams> = {};

	const controller = removeUserController(userRepository, fileService);

	const mockedRemoveUser = vi.mocked(removeUser, true);

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
		expect(data).toEqual<ResponseModel>({ status: 204 });
	});
});
