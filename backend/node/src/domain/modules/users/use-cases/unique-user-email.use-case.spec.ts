import { faker } from '@faker-js/faker';
import { getMessage } from '../../../helpers/get-message.helper';
import { UserEntity } from '../entities/user.entity';
import { mockUserRepositoryRead } from './__mocks__/user-repository.mock';
import { user } from './__mocks__/user.mock';
import { UniqueUserEmailUseCase } from './unique-user-email.use-case';

describe(UniqueUserEmailUseCase.name, () => {
	beforeAll(() => {
		mockUserRepositoryRead.findOneByEmail = jest.fn((email) => {
			if (email === user.email) {
				return Promise.resolve<UserEntity>(user);
			}

			return Promise.resolve<null>(null);
		});
	});

	test('should throw error when email is already taken', async () => {
		const useCase = new UniqueUserEmailUseCase(
			mockUserRepositoryRead,
			user.email
		);

		await expect(useCase.execute()).rejects.toThrow(
			new Error(getMessage('email.unique'))
		);
	});

	test('should return true when user is not found', async () => {
		const useCase = new UniqueUserEmailUseCase(
			mockUserRepositoryRead,
			faker.internet.email()
		);

		const data = await useCase.execute();

		expect<boolean>(data).toStrictEqual<boolean>(true);
	});
});
