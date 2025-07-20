import { UserEntity } from '../entities/user.entity';
import { IUserRepository } from '../interfaces/user-repository.interface';
import { mockedRequest } from './__mocks__/request.mock';
import { mockUserRepository } from './__mocks__/user-repository.mock';
import { mockedUser } from './__mocks__/user.mock';
import { CreateUserUseCase } from './create-user.use-case';

describe(CreateUserUseCase.name, () => {
	beforeEach(() => {
		mockUserRepository.create = jest.fn((data: UserEntity) => {
			return Promise.resolve<UserEntity>({
				...mockedUser,
				...data,
			});
		});
	});

	test('should create an user', async () => {
		const useCase = new CreateUserUseCase(
			mockUserRepository,
			mockedRequest,
			mockedUser
		);
		const data = await useCase.execute();

		expect<IUserRepository['create']>(
			mockUserRepository.create
		).toHaveBeenCalledTimes(1);
		expect<UserEntity>(data).toStrictEqual<UserEntity>({
			...mockedUser,
			created_at: data.created_at,
			updated_at: data.updated_at,
		});
	});
});
