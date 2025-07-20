import { UserEntity } from '../entities/user.entity';
import { IUserRepository } from '../interfaces/user-repository.interface';
import { mockUserRepository } from './__mocks__/user-repository.mock';
import { mockedUser } from './__mocks__/user.mock';
import { DeleteUserUseCase } from './delete-user.use-case';

describe(DeleteUserUseCase.name, () => {
	beforeEach(() => {
		mockUserRepository.delete = jest.fn((_id) => {
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
