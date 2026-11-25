import { vi } from 'vitest';
import { faker } from '@faker-js/faker';
import { UserEntity } from '../entities/user.entity.js';
import { mockedRequest } from './__mocks__/request.mock.js';
import { mockUserRepository } from './__mocks__/user-repository.mock.js';
import { mockedUser } from './__mocks__/user.mock.js';
import { UpdateUserUseCase } from './update-user.use-case.js';

describe(UpdateUserUseCase.name, () => {
	beforeEach(() => {
		mockUserRepository.update = vi.fn((_id, expectedVersion, data) => {
			return Promise.resolve<UserEntity>({
				...mockedUser,
				...data,
				version: expectedVersion + 1,
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
			mockedRequest,
			mockedUser.id,
			mockedUser.version,
			dto
		);
		const data = await useCase.execute();

		expect<UserEntity>(data).toStrictEqual<UserEntity>({
			...mockedUser,
			...dto,
			version: mockedUser.version + 1,
			updated_at: data.updated_at,
		});
	});

	test("should only update user's nickname", async () => {
		const dto = {
			nickname: faker.person.firstName(),
		};

		const useCase = new UpdateUserUseCase(
			mockUserRepository,
			mockedRequest,
			mockedUser.id,
			mockedUser.version,
			dto
		);
		const data = await useCase.execute();

		expect<UserEntity>(data).toStrictEqual<UserEntity>({
			...mockedUser,
			...dto,
			version: mockedUser.version + 1,
			updated_at: data.updated_at,
		});
	});

	test("should only update user's email", async () => {
		const dto = {
			email: faker.internet.email(),
		};

		const useCase = new UpdateUserUseCase(
			mockUserRepository,
			mockedRequest,
			mockedUser.id,
			mockedUser.version,
			dto
		);
		const data = await useCase.execute();

		expect<UserEntity>(data).toStrictEqual<UserEntity>({
			...mockedUser,
			...dto,
			version: mockedUser.version + 1,
			updated_at: data.updated_at,
		});
	});

	test('should forward the expected version as a concurrency token', async () => {
		const dto = { first_name: faker.person.firstName() };

		const useCase = new UpdateUserUseCase(
			mockUserRepository,
			mockedRequest,
			mockedUser.id,
			mockedUser.version,
			dto
		);
		await useCase.execute();

		expect(mockUserRepository.update).toHaveBeenCalledWith(
			mockedUser.id,
			mockedUser.version,
			expect.not.objectContaining({ version: expect.anything() })
		);
	});
});
