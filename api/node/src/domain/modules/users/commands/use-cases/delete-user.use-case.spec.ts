import { vi } from 'vitest';
import { UserEntity } from '../entities/user.entity.js';
import { IUserRepository } from '../interfaces/user-repository.interface.js';
import { mockUserRepository } from './__mocks__/user-repository.mock.js';
import { mockedUser } from './__mocks__/user.mock.js';
import { DeleteUserUseCase } from './delete-user.use-case.js';

describe(DeleteUserUseCase.name, () => {
	beforeEach(() => {
		mockUserRepository.delete = vi.fn((_id) => {
			return Promise.resolve<UserEntity>(mockedUser);
		});
	});

	test('should delete user with no avatar', async () => {
		const useCase = new DeleteUserUseCase(mockUserRepository, mockedUser.id);
		await useCase.execute();

		expect<IUserRepository['delete']>(
			mockUserRepository.delete
		).toHaveBeenCalledTimes(1);
	});

	test('should delete user with an avatar', async () => {
		const useCase = new DeleteUserUseCase(mockUserRepository, mockedUser.id);
		await useCase.execute();

		expect<IUserRepository['delete']>(
			mockUserRepository.delete
		).toHaveBeenCalledTimes(1);
	});
});
