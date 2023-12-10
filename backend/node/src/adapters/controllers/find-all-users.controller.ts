import type { FileService } from '../../core/interfaces/file.interface';
import type { UserRepository } from '../../core/interfaces/user.interface';
import { findAllUsers } from '../../core/use-cases/find-all-users.use-case';
import type { ResponseModel } from '../interfaces/common.interface';
import type { HttpRequest } from '../interfaces/http.interface';
import type { UserResponse } from '../interfaces/user.interface';

export function findAllUsersController(
	userRepository: UserRepository,
	fileService: FileService
): (req: HttpRequest) => Promise<ResponseModel<UserResponse[]>> {
	return async (_req: HttpRequest): Promise<ResponseModel<UserResponse[]>> => {
		const data = await findAllUsers(userRepository, fileService);

		return {
			status: 200,
			data:
				data.length > 0 ? data.map((obj) => ({ ...obj, type: 'users' })) : [],
		};
	};
}
