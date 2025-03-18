import { UserEntity } from '../entities/user.entity';
import { IUserRepository } from '../interfaces/user-repository.interface';
import { mockUserRepositoryRead } from './__mocks__/user-repository.mock';
import { user } from './__mocks__/user.mock';
import { ReadUserUseCase } from './read-user.use-case';

describe(ReadUserUseCase.name, () => {
	beforeEach(() => {
		mockUserRepositoryRead.read = jest.fn((_id) => {
			return Promise.resolve<UserEntity>(user);
		});
	});

	test('should return an user', async () => {
		const useCase = new ReadUserUseCase(mockUserRepositoryRead, user.id);
		const data = await useCase.execute();

		expect<IUserRepository['read']>(
			mockUserRepositoryRead.read
		).toHaveBeenCalledTimes(1);
		expect<UserEntity>(data).toStrictEqual<UserEntity>(user);
	});
});
