import { UnauthorizedException } from '../../core/exceptions/unauthorized.exception';
import type { UserRefreshRequest } from '../../core/interfaces/auth.interface';
import type { RedisService } from '../../core/interfaces/redis.interface';
import { logOutUser } from '../../core/use-cases/log-out-user.use-case';
import type { ResponseModel } from '../interfaces/common.interface';
import type { HttpRequestUser } from '../interfaces/http.interface';
import { logOutUserController } from './log-out-user.controller';

jest.mock('../../core/use-cases/log-out-user.use-case');

describe('logOutUserController', () => {
	const redisService: RedisService = {
		set: jest.fn(),
		get: jest.fn(),
		del: jest.fn(),
	};

	const userRequest: UserRefreshRequest = {
		userId: 'id',
		username: 'johndoe@example.com',
		tokenId: 'tokenId',
	};

	let request: HttpRequestUser<UserRefreshRequest> = {};

	const controller = logOutUserController(redisService);

	const mockedLogOutUser = jest.mocked(logOutUser, true);

	beforeAll(() => {
		mockedLogOutUser.mockReturnValue(Promise.resolve());
	});

	test('should throw error when user is logged in', async () => {
		await expect(controller(request)).rejects.toThrow(
			new UnauthorizedException('User request is unauthorized.')
		);
	});

	test('should log out user', async () => {
		request = { ...request, user: userRequest };

		const data = await controller(request);

		expect(data).toEqual<ResponseModel>({ status: 204 });
	});
});
