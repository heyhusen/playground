import { vi } from 'vitest';
import { faker } from '@faker-js/faker';
import { StatusCodes } from 'http-status-codes';
import { IBaseRequest } from '../../../../../domain/base/interfaces/base-request.interface.js';
import { IBasePaginatedResponse } from '../../../../../domain/base/interfaces/base-response.interface.js';
import { getMessage } from '../../../../../domain/helpers/get-message.helper.js';
import { UserEntity } from '../../../../../domain/modules/users/commands/entities/user.entity.js';
import { IUpdateUserDTO } from '../../../../../domain/modules/users/commands/interfaces/user-dto.interface.js';
import { mockedRequest } from '../../../../../domain/modules/users/commands/use-cases/__mocks__/request.mock.js';
import {
	mockedDto,
	mockedUser,
} from '../../../../../domain/modules/users/commands/use-cases/__mocks__/user.mock.js';
import { UniqueUserEmailUseCase } from '../../../../../domain/modules/users/commands/use-cases/unique-user-email.use-case.js';
import { IUserReadRepository } from '../../../../../domain/modules/users/queries/interfaces/user-repository-read.interface.js';
import { ReadAllUserUseCase } from '../../../../../domain/modules/users/queries/use-cases/read-all-user.use-case.js';
import { ReadUserUseCase } from '../../../../../domain/modules/users/queries/use-cases/read-user.use-case.js';
import { BadRequestException } from '../../../../exceptions/bad-request.exception.js';
import {
	IHttpRequest,
	IHttpRequestParams,
	IJsonApiPagination,
	RequestParamId,
} from '../../../../interfaces/http.interface.js';
import { IResponse } from '../../../../interfaces/response.interface.js';
import { mockUnitOfWork } from '../../commands/controllers/__mocks__/unit-of-work.mock.js';
import { UserReadController } from './user-read.controller.js';

vi.mock(
	'../../../../../domain/modules/users/queries/use-cases/read-user.use-case'
);
const mockedReadUserUseCase = vi.mocked(ReadUserUseCase);

vi.mock(
	'../../../../../domain/modules/users/queries/use-cases/read-all-user.use-case'
);
const mockedReadAllUserUseCase = vi.mocked(ReadAllUserUseCase);

vi.mock(
	'../../../../../domain/modules/users/commands/use-cases/unique-user-email.use-case'
);
const mockedUniqueUserUseCase = vi.mocked(UniqueUserEmailUseCase);

describe(UserReadController.name, () => {
	describe(UserReadController.prototype.read.name, () => {
		const request: IHttpRequestParams<RequestParamId> = {
			headers: mockedRequest,
		};

		beforeEach(() => {
			mockedReadUserUseCase.mockImplementation(
				function (_repository, _id): any {
					return {
						execute: () => {
							return Promise.resolve<UserEntity>(mockedUser);
						},
					};
				}
			);
		});

		const controller = new UserReadController(mockUnitOfWork);

		test('should throw error when parameter is empty', async () => {
			await expect(controller.read(request)).rejects.toThrow(
				new BadRequestException(getMessage('params.id.required'))
			);
		});

		test('should return an user', async () => {
			const data = await controller.read({
				...request,
				params: {
					id: faker.string.uuid(),
				},
			});

			expect<IResponse<UserEntity>>(data).toStrictEqual<IResponse<UserEntity>>({
				status: StatusCodes.OK,
				data: mockedUser,
			});
		});
	});

	describe(UserReadController.prototype.readAll.name, () => {
		const request: IHttpRequest<IBaseRequest, IJsonApiPagination> = {
			headers: mockedRequest,
			params: {
				page: {
					size: 10,
					number: 1,
				},
				filter: {},
			},
			body: {},
			user: {},
			cookies: {},
		};
		const result: IBasePaginatedResponse<UserEntity> = {
			data: [],
			meta: {
				page: Number(request.params?.page.number),
				limit: Number(request.params?.page.size),
				total: 1,
			},
		};

		const controller = new UserReadController(mockUnitOfWork);

		beforeEach(() => {
			mockedReadAllUserUseCase.mockClear();
			mockedReadAllUserUseCase.mockImplementation(
				function (_repository, _page, _limit, _options): any {
					return {
						execute: () => {
							return Promise.resolve<IBasePaginatedResponse<UserEntity>>({
								...result,
								data: [mockedUser],
							});
						},
					};
				}
			);
		});

		test('should return empty array', async () => {
			mockedReadAllUserUseCase.mockImplementation(
				function (_repository, _page, _limit, _options): any {
					return {
						execute: vi
							.fn()
							.mockReturnValue(
								Promise.resolve<IBasePaginatedResponse<UserEntity>>(result)
							),
					};
				}
			);

			const { status, data, meta } = await controller.readAll(request, null);

			expect(status).toStrictEqual<StatusCodes>(StatusCodes.OK);
			expect(data).toStrictEqual([]);
			expect(meta).toStrictEqual<IBasePaginatedResponse<UserEntity>['meta']>(
				result.meta
			);
			expect(meta?.page).toStrictEqual<number>(result.meta.page);
			expect(meta?.limit).toStrictEqual<number>(result.meta.limit);
			expect(meta?.total).toStrictEqual<number>(result.meta.total);
		});

		test('should return all users', async () => {
			const { data, status, meta } = await controller.readAll(request, null);

			expect(status).toStrictEqual<StatusCodes>(StatusCodes.OK);
			expect(data).toStrictEqual(expect.arrayContaining([mockedUser]));
			expect(meta).toStrictEqual<IBasePaginatedResponse<UserEntity>['meta']>(
				result.meta
			);
			expect(meta?.page).toStrictEqual<number>(result.meta.page);
			expect(meta?.limit).toStrictEqual<number>(result.meta.limit);
			expect(meta?.total).toStrictEqual<number>(result.meta.total);
		});

		test('should return all users with avatar', async () => {
			mockedReadAllUserUseCase.mockImplementation(
				function (_repository, _page, _limit, _options): any {
					return {
						execute: vi.fn().mockReturnValue(
							Promise.resolve<IBasePaginatedResponse<UserEntity>>({
								...result,
								data: [mockedUser],
							})
						),
					};
				}
			);

			const { data, status, meta } = await controller.readAll(request, null);

			expect(status).toStrictEqual<StatusCodes>(StatusCodes.OK);
			expect(data).toStrictEqual(expect.arrayContaining([mockedUser]));
			expect(meta).toStrictEqual<IBasePaginatedResponse<UserEntity>['meta']>(
				result.meta
			);
			expect(meta?.page).toStrictEqual<number>(result.meta.page);
			expect(meta?.limit).toStrictEqual<number>(result.meta.limit);
			expect(meta?.total).toStrictEqual<number>(result.meta.total);
		});
	});

	describe(UserReadController.prototype.uniqueEmail.name, () => {
		const request: IHttpRequest<
			IBaseRequest,
			Pick<UserEntity, 'id'>,
			Pick<IUpdateUserDTO, 'email'>
		> = {
			headers: mockedRequest,
		};

		beforeEach(() => {
			mockedUniqueUserUseCase.mockImplementation(function (
				_repo: IUserReadRepository,
				email: string
			): any {
				return {
					execute: () => {
						if (email === mockedUser.email) {
							throw new Error(getMessage('email.unique'));
						}

						return Promise.resolve<boolean>(true);
					},
				};
			});
		});

		test('should only check when email is provided', async () => {
			const controller = new UserReadController(mockUnitOfWork);
			const data = await controller.uniqueEmail(request);

			expect<boolean>(data).toStrictEqual<boolean>(true);
		});

		test('should throw error when email is not unique', async () => {
			const controller = new UserReadController(mockUnitOfWork);

			await expect(
				controller.uniqueEmail({
					headers: mockedRequest,
					body: {
						email: mockedDto.email,
					},
				})
			).rejects.toThrow(new Error(getMessage('email.unique')));
		});

		test('should return true when email is unique', async () => {
			const controller = new UserReadController(mockUnitOfWork);

			const data = await controller.uniqueEmail({
				headers: mockedRequest,
				body: {
					email: faker.internet.email(),
				},
			});

			expect<boolean>(data).toStrictEqual<boolean>(true);
		});
	});
});
