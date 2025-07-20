import { faker } from '@faker-js/faker';
import { StatusCodes } from 'http-status-codes';
import { IBaseRequest } from '../../../../../domain/base/interfaces/base-request.interface';
import { UserEntity } from '../../../../../domain/modules/users/commands/entities/user.entity';
import {
	ICreateUserDTO,
	IUpdateUserDTO,
} from '../../../../../domain/modules/users/commands/interfaces/user-dto.interface';
import { mockedRequest } from '../../../../../domain/modules/users/commands/use-cases/__mocks__/request.mock';
import {
	mockedDto,
	mockedUser,
} from '../../../../../domain/modules/users/commands/use-cases/__mocks__/user.mock';
import {
	IHttpRequest,
	IHttpRequestBody,
	IHttpRequestParams,
	IJsonApiData,
	RequestParamId,
} from '../../../../interfaces/http.interface';
import { IResponse } from '../../../../interfaces/response.interface';
import { mockUnitOfWork } from './__mocks__/unit-of-work.mock';
import { UserController } from './user.controller';

describe(UserController.name, () => {
	describe(UserController.prototype.create.name, () => {
		const request: IHttpRequestBody<IJsonApiData<ICreateUserDTO>> = {
			headers: mockedRequest,
		};

		test('should create an user', async () => {
			mockUnitOfWork.transaction = jest.fn().mockReturnValue({
				status: StatusCodes.CREATED,
				data: mockedUser,
			});

			const controller = new UserController(mockUnitOfWork);
			const data = await controller.create({
				...request,
				body: {
					data: {
						attributes: mockedDto,
						id: mockedDto.id,
						type: 'users',
					},
				},
			});

			expect<IResponse<UserEntity>>(data).toStrictEqual({
				status: StatusCodes.CREATED,
				data: mockedUser,
			});
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
			headers: mockedRequest,
		};

		test('should not update user', async () => {
			mockUnitOfWork.transaction = jest.fn().mockReturnValue({
				status: StatusCodes.OK,
				data: mockedUser,
			});

			const controller = new UserController(mockUnitOfWork);
			const data = await controller.update({
				...request,
				params: {
					id: mockedUser.id,
				},
			});

			expect<IResponse<UserEntity>>(data).toStrictEqual<IResponse<UserEntity>>({
				status: StatusCodes.OK,
				data: mockedUser,
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
					...mockedUser,
					...body,
				},
			});
			const controller = new UserController(mockUnitOfWork);
			const data = await controller.update({
				...request,
				body: {
					data: {
						attributes: body,
						id: mockedDto.id,
						type: 'users',
					},
				},
				params: {
					id: mockedUser.id,
				},
			});

			expect<IResponse<UserEntity>>(data).toStrictEqual<IResponse<UserEntity>>({
				status: StatusCodes.OK,
				data: {
					...mockedUser,
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
					...mockedUser,
					...body,
				},
			});

			const controller = new UserController(mockUnitOfWork);
			const data = await controller.update({
				...request,
				body: {
					data: {
						attributes: body,
						id: mockedDto.id,
						type: 'users',
					},
				},
				params: {
					id: mockedUser.id,
				},
			});

			expect<IResponse<UserEntity>>(data).toStrictEqual<IResponse<UserEntity>>({
				status: StatusCodes.OK,
				data: {
					...mockedUser,
					...body,
				},
			});
		});
	});

	describe(UserController.prototype.delete.name, () => {
		const request: IHttpRequestParams<RequestParamId> = {
			headers: mockedRequest,
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
					id: mockedUser.id,
				},
			});

			expect<IResponse<UserEntity>>(data).toStrictEqual({
				status: StatusCodes.NO_CONTENT,
			});
		});
	});
});
