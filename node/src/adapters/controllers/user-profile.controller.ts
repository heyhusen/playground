import { UnauthorizedException } from '../../core/exceptions/unauthorized.exception';
import type { UserRequest } from '../../core/interfaces/auth.interface';
import type { FileService } from '../../core/interfaces/file.interface';
import type { UserRepository } from '../../core/interfaces/user.interface';
import { findOneUser } from '../../core/use-cases/find-one-user.use-case';
import type { ResponseModel } from '../interfaces/common.interface';
import type { HttpRequestUser } from '../interfaces/http.interface';
import type { UserResponse } from '../interfaces/user.interface';

export function userProfileController(
	userRepository: UserRepository,
	fileService: FileService
) {
	return async (req: HttpRequestUser<UserRequest>) => {
		if (!req.user) {
			throw new UnauthorizedException('User request is unauthorized.');
		}

		const { userId } = req.user;

		const data = await findOneUser(userId, userRepository, fileService);

		const result: ResponseModel<UserResponse> = {
			status: 200,
			data: { ...data, type: 'users' },
		};

		return result;
	};
}
