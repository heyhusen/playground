import { faker } from '@faker-js/faker';
import { StatusCodes } from 'http-status-codes';
import { IBaseRequest } from '../../../../domain/base/interfaces/base-request.interface';
import { IBasePaginatedResponse } from '../../../../domain/base/interfaces/base-response.interface';
import { getMessage } from '../../../../domain/helpers/get-message.helper';
import { UserEntity } from '../../../../domain/modules/users/entities/user.entity';
import {
	ICreateUserDTO,
	IUpdateUserDTO,
} from '../../../../domain/modules/users/interfaces/user-dto.interface';
import { IUserReadRepository } from '../../../../domain/modules/users/interfaces/user-repository.interface';
import { request as headers } from '../../../../domain/modules/users/use-cases/__mocks__/request.mock';
import {
	dto,
	user,
} from '../../../../domain/modules/users/use-cases/__mocks__/user.mock';
import { ReadAllUserUseCase } from '../../../../domain/modules/users/use-cases/read-all-user.use-case';
import { ReadUserUseCase } from '../../../../domain/modules/users/use-cases/read-user.use-case';
import { UniqueUserEmailUseCase } from '../../../../domain/modules/users/use-cases/unique-user-email.use-case';
import { BadRequestException } from '../../../exceptions/bad-request.exception';
import {
	IHttpRequest,
	IHttpRequestBody,
	IHttpRequestParams,
	IJsonApiData,
	IJsonApiPagination,
	RequestParamId,
} from '../../../interfaces/http.interface';
import { IResponse } from '../../../interfaces/response.interface';
import { mockUnitOfWork } from './__mocks__/unit-of-work.mock';
import { UserController } from './user.controller';

jest.mock('../../../../domain/modules/users/use-cases/read-user.use-case');
const mockedReadUserUseCase = jest.mocked(ReadUserUseCase);

jest.mock('../../../../domain/modules/users/use-cases/read-all-user.use-case');
const mockedReadAllUserUseCase = jest.mocked(ReadAllUserUseCase);

jest.mock(
	'../../../../domain/modules/users/use-cases/unique-user-email.use-case'
);
const mockedUniqueUserUseCase = jest.mocked(UniqueUserEmailUseCase);

describe(UserController.name, () => {
	describe(UserController.prototype.create.name, () => {
		const request: IHttpRequestBody<IJsonApiData<ICreateUserDTO>> = {
			headers,
		};

		test('should create an user', async () => {
			mockUnitOfWork.transaction = jest.fn().mockReturnValue({
				status: StatusCodes.CREATED,
				data: user,
			});

			const controller = new UserController(mockUnitOfWork);
			const data = await controller.create({
				...request,
				body: {
					data: {
						attributes: dto,
						id: dto.id,
						type: 'users',
					},
				},
			});

			expect<IResponse<UserEntity>>(data).toStrictEqual({
				status: StatusCodes.CREATED,
				data: user,
			});
		});
	});

	describe(UserController.prototype.read.name, () => {
		const request: IHttpRequestParams<RequestParamId> = {
			headers,
		};

		beforeEach(() => {
			mockedReadUserUseCase.mockImplementation((_repository, _id): any => {
				return {
					execute: () => {
						return Promise.resolve<UserEntity>(user);
					},
				};
			});
		});

		const controller = new UserController(mockUnitOfWork);

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
				data: user,
			});
		});
	});

	describe(UserController.prototype.readAll.name, () => {
		const request: IHttpRequest<IBaseRequest, IJsonApiPagination> = {
			headers,
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

		const controller = new UserController(mockUnitOfWork);

		beforeEach(() => {
			mockedReadAllUserUseCase.mockClear();
			mockedReadAllUserUseCase.mockImplementation(
				(_repository, _page, _limit, _options): any => {
					return {
						execute: () => {
							return Promise.resolve<IBasePaginatedResponse<UserEntity>>({
								...result,
								data: [user],
							});
						},
					};
				}
			);
		});

		test('should return empty array', async () => {
			mockedReadAllUserUseCase.mockImplementation(
				(_repository, _page, _limit, _options): any => {
					return {
						execute: jest
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
			expect(data).toStrictEqual(expect.arrayContaining([user]));
			expect(meta).toStrictEqual<IBasePaginatedResponse<UserEntity>['meta']>(
				result.meta
			);
			expect(meta?.page).toStrictEqual<number>(result.meta.page);
			expect(meta?.limit).toStrictEqual<number>(result.meta.limit);
			expect(meta?.total).toStrictEqual<number>(result.meta.total);
		});

		test('should return all users with avatar', async () => {
			mockedReadAllUserUseCase.mockImplementation(
				(_repository, _page, _limit, _options): any => {
					return {
						execute: jest.fn().mockReturnValue(
							Promise.resolve<IBasePaginatedResponse<UserEntity>>({
								...result,
								data: [user],
							})
						),
					};
				}
			);

			const { data, status, meta } = await controller.readAll(request, null);

			expect(status).toStrictEqual<StatusCodes>(StatusCodes.OK);
			expect(data).toStrictEqual(expect.arrayContaining([user]));
			expect(meta).toStrictEqual<IBasePaginatedResponse<UserEntity>['meta']>(
				result.meta
			);
			expect(meta?.page).toStrictEqual<number>(result.meta.page);
			expect(meta?.limit).toStrictEqual<number>(result.meta.limit);
			expect(meta?.total).toStrictEqual<number>(result.meta.total);
		});
	});

	describe(UserController.prototype.update.name, () => {
		const request: IHttpRequest<
			IBaseRequest,
			RequestParamId,
			IJsonApiData<IUpdateUserDTO>,
			Record<string, unknown>,
			Record<string, unknown>
		> = {
			headers,
		};

		test('should not update user', async () => {
			mockUnitOfWork.transaction = jest.fn().mockReturnValue({
				status: StatusCodes.OK,
				data: user,
			});

			const controller = new UserController(mockUnitOfWork);
			const data = await controller.update({
				...request,
				params: {
					id: user.id,
				},
			});

			expect<IResponse<UserEntity>>(data).toStrictEqual<IResponse<UserEntity>>({
				status: StatusCodes.OK,
				data: user,
			});
		});

		test("should only update user's name", async () => {
			const body = {
				first_name: faker.person.firstName(),
				last_name: faker.person.lastName(),
			};
			mockUnitOfWork.transaction = jest.fn().mockReturnValue({
				status: StatusCodes.OK,
				data: {
					...user,
					...body,
				},
			});
			const controller = new UserController(mockUnitOfWork);
			const data = await controller.update({
				...request,
				body: {
					data: {
						attributes: body,
						id: dto.id,
						type: 'users',
					},
				},
				params: {
					id: user.id,
				},
			});

			expect<IResponse<UserEntity>>(data).toStrictEqual<IResponse<UserEntity>>({
				status: StatusCodes.OK,
				data: {
					...user,
					...body,
				},
			});
		});

		test("should only update user's email", async () => {
			const body = {
				email: faker.internet.email(),
			};
			mockUnitOfWork.transaction = jest.fn().mockReturnValue({
				status: StatusCodes.OK,
				data: {
					...user,
					...body,
				},
			});

			const controller = new UserController(mockUnitOfWork);
			const data = await controller.update({
				...request,
				body: {
					data: {
						attributes: body,
						id: dto.id,
						type: 'users',
					},
				},
				params: {
					id: user.id,
				},
			});

			expect<IResponse<UserEntity>>(data).toStrictEqual<IResponse<UserEntity>>({
				status: StatusCodes.OK,
				data: {
					...user,
					...body,
				},
			});
		});
	});

	describe(UserController.prototype.delete.name, () => {
		const request: IHttpRequestParams<RequestParamId> = {
			headers,
		};

		beforeAll(() => {
			mockUnitOfWork.transaction = jest.fn().mockReturnValue(
				Promise.resolve({
					status: StatusCodes.NO_CONTENT,
				})
			);
		});

		test('should remove an user', async () => {
			const controller = new UserController(mockUnitOfWork);
			const data = await controller.delete({
				...request,
				params: {
					id: user.id,
				},
			});

			expect<IResponse<UserEntity>>(data).toStrictEqual({
				status: StatusCodes.NO_CONTENT,
			});
		});
	});

	describe(UserController.prototype.uniqueEmail.name, () => {
		const request: IHttpRequest<
			IBaseRequest,
			Pick<UserEntity, 'id'>,
			Pick<IUpdateUserDTO, 'email'>
		> = {
			headers,
		};

		beforeEach(() => {
			mockedUniqueUserUseCase.mockImplementation(
				(_repo: IUserReadRepository, email: string): any => {
					return {
						execute: () => {
							if (email === user.email) {
								throw new Error(getMessage('email.unique'));
							}

							return Promise.resolve<boolean>(true);
						},
					};
				}
			);
		});

		test('should only check when email is provided', async () => {
			const controller = new UserController(mockUnitOfWork);
			const data = await controller.uniqueEmail(request);

			expect<boolean>(data).toStrictEqual<boolean>(true);
		});

		test('should throw error when email is not unique', async () => {
			const controller = new UserController(mockUnitOfWork);

			await expect(
				controller.uniqueEmail({
					headers,
					body: {
						email: dto.email,
					},
				})
			).rejects.toThrow(new Error(getMessage('email.unique')));
		});

		test('should return true when email is unique', async () => {
			const controller = new UserController(mockUnitOfWork);

			const data = await controller.uniqueEmail({
				headers,
				body: {
					email: faker.internet.email(),
				},
			});

			expect<boolean>(data).toStrictEqual<boolean>(true);
		});
	});
});
