import { faker } from '@faker-js/faker';
import { UserEntity } from '../entities/user.entity';
import { request } from './__mocks__/request.mock';
import { mockUserRepository } from './__mocks__/user-repository.mock';
import { user } from './__mocks__/user.mock';
import { UpdateUserUseCase } from './update-user.use-case';

describe(UpdateUserUseCase.name, () => {
	beforeEach(() => {
		mockUserRepository.update = jest.fn((_id, data) => {
			return Promise.resolve<UserEntity>({
				...user,
				...data,
			});
		});
	});

	test("should only update user's name", async () => {
		const dto = {
			first_name: faker.person.firstName(),
			last_name: faker.person.lastName(),
		};

		const useCase = new UpdateUserUseCase(
			mockUserRepository,
			request,
			user.id,
			dto
		);
		const data = await useCase.execute();

		expect<UserEntity>(data).toStrictEqual<UserEntity>({
			...user,
			...dto,
			updated_at: data.updated_at,
		});
	});

	test("should only update user's nickname", async () => {
		const dto = {
			nickname: faker.person.firstName(),
		};

		const useCase = new UpdateUserUseCase(
			mockUserRepository,
			request,
			user.id,
			dto
		);
		const data = await useCase.execute();

		expect<UserEntity>(data).toStrictEqual<UserEntity>({
			...user,
			...dto,
			updated_at: data.updated_at,
		});
	});

	test("should only update user's email", async () => {
		const dto = {
			email: faker.internet.email(),
		};

		const useCase = new UpdateUserUseCase(
			mockUserRepository,
			request,
			user.id,
			dto
		);
		const data = await useCase.execute();

		expect<UserEntity>(data).toStrictEqual<UserEntity>({
			...user,
			...dto,
			updated_at: data.updated_at,
		});
	});
});
