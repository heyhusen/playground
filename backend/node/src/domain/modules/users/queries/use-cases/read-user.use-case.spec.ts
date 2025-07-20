import { UserEntity } from '../../commands/entities/user.entity';
import { IUserRepository } from '../../commands/interfaces/user-repository.interface';
import { mockedUser } from '../../commands/use-cases/__mocks__/user.mock';
import { mockUserRepositoryRead } from './__mocks__/user-repository-read.mock';
import { ReadUserUseCase } from './read-user.use-case';

describe(ReadUserUseCase.name, () => {
	beforeEach(() => {
		mockUserRepositoryRead.read = jest.fn((_id) => {
			return Promise.resolve<UserEntity>(mockedUser);
		});
	});

	test('should return an user', async () => {
		const useCase = new ReadUserUseCase(mockUserRepositoryRead, mockedUser.id);
		const data = await useCase.execute();

		expect<IUserRepository['read']>(
			mockUserRepositoryRead.read
		).toHaveBeenCalledTimes(1);
		expect<UserEntity>(data).toStrictEqual<UserEntity>(mockedUser);
	});
});
