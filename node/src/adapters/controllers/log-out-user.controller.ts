import { UnauthorizedException } from '../../core/exceptions/unauthorized.exception';
import type { UserRefreshRequest } from '../../core/interfaces/auth.interface';
import type { RedisService } from '../../core/interfaces/redis.interface';
import { logOutUser } from '../../core/use-cases/log-out-user.use-case';
import type { ResponseModel } from '../interfaces/common.interface';
import type { HttpRequestUser } from '../interfaces/http.interface';

export function logOutUserController(redisService: RedisService) {
	return async (req: HttpRequestUser<UserRefreshRequest>) => {
		if (!req.user) {
			throw new UnauthorizedException('User request is unauthorized.');
		}

		const { tokenId } = req.user;

		await logOutUser(tokenId, redisService);

		const result: ResponseModel = { status: 200 };

		return result;
	};
}
