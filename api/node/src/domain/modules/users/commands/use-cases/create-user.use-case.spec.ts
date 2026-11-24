import { vi } from 'vitest';
import { UserEntity } from '../entities/user.entity.js';
import { IUserRepository } from '../interfaces/user-repository.interface.js';
import { mockedRequest } from './__mocks__/request.mock.js';
import { mockUserRepository } from './__mocks__/user-repository.mock.js';
import { mockedUser } from './__mocks__/user.mock.js';
import { CreateUserUseCase } from './create-user.use-case.js';

describe(CreateUserUseCase.name, () => {
	beforeEach(() => {
		mockUserRepository.create = vi.fn((data: UserEntity) => {
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
