import type { IBasePaginatedResponse } from '../../../../base/interfaces/base-response.interface';
import type { UserEntity } from '../../commands/entities/user.entity';
import { IUserRepository } from '../../commands/interfaces/user-repository.interface';
import { mockedUser } from '../../commands/use-cases/__mocks__/user.mock';
import { mockUserRepositoryRead } from './__mocks__/user-repository-read.mock';
import { ReadAllUserUseCase } from './read-all-user.use-case';

describe(ReadAllUserUseCase.name, () => {
	const result: IBasePaginatedResponse<UserEntity> = {
		data: [],
		meta: {
			limit: 10,
			page: 1,
			total: 1,
		},
	};

	beforeEach(() => {
		mockUserRepositoryRead.readAll = jest.fn().mockReturnValue(
			Promise.resolve<IBasePaginatedResponse<UserEntity>>({
				...result,
				data: [mockedUser],
			})
		);
	});

	test('should return empty array', async () => {
		mockUserRepositoryRead.readAll = jest
			.fn()
			.mockReturnValue(
				Promise.resolve<IBasePaginatedResponse<UserEntity>>(result)
			);

		const useCase = new ReadAllUserUseCase(mockUserRepositoryRead, 1, 10, null);
		const { data, meta } = await useCase.execute();

		expect<IUserRepository['readAll']>(
			mockUserRepositoryRead.readAll
		).toHaveBeenCalledTimes(1);
		expect<UserEntity[]>(data).toStrictEqual(expect.arrayContaining([]));
		expect<IBasePaginatedResponse<UserEntity>['meta']>(meta).toStrictEqual<
			IBasePaginatedResponse<UserEntity>['meta']
		>(result.meta);
		expect<number>(meta.page).toStrictEqual<number>(result.meta.page);
		expect<number>(meta.limit).toStrictEqual<number>(result.meta.limit);
		expect<number>(meta.total).toStrictEqual<number>(result.meta.total);
	});

	test('should return all users', async () => {
		const useCase = new ReadAllUserUseCase(mockUserRepositoryRead, 1, 10, null);
		const { data, meta } = await useCase.execute();

		expect<IUserRepository['readAll']>(
			mockUserRepositoryRead.readAll
		).toHaveBeenCalledTimes(1);
		expect<UserEntity[]>(data).toStrictEqual(
			expect.arrayContaining([mockedUser])
		);
		expect<IBasePaginatedResponse<UserEntity>['meta']>(meta).toStrictEqual<
			IBasePaginatedResponse<UserEntity>['meta']
		>(result.meta);
		expect<number>(meta.page).toStrictEqual<number>(result.meta.page);
		expect<number>(meta.limit).toStrictEqual<number>(result.meta.limit);
		expect<number>(meta.total).toStrictEqual<number>(result.meta.total);
	});

	test('should return all users with avatar', async () => {
		const useCase = new ReadAllUserUseCase(mockUserRepositoryRead, 1, 10, null);
		const { data, meta } = await useCase.execute();

		expect<IUserRepository['readAll']>(
			mockUserRepositoryRead.readAll
		).toHaveBeenCalledTimes(1);
		expect<UserEntity[]>(data).toStrictEqual(
			expect.arrayContaining([mockedUser])
		);
		expect<IBasePaginatedResponse<UserEntity>['meta']>(meta).toStrictEqual<
			IBasePaginatedResponse<UserEntity>['meta']
		>(result.meta);
		expect<number>(meta.page).toStrictEqual<number>(result.meta.page);
		expect<number>(meta.limit).toStrictEqual<number>(result.meta.limit);
		expect<number>(meta.total).toStrictEqual<number>(result.meta.total);
	});
});
