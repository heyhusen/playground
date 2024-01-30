import { StatusCodes } from 'http-status-codes';
import type { FileService } from '../../core/interfaces/file.interface';
import type {
	UserRepository,
	UserResult,
} from '../../core/interfaces/user.interface';
import { findAllUsers } from '../../core/use-cases/find-all-users.use-case';
import type { ResponseModel } from '../interfaces/common.interface';
import type { HttpRequest } from '../interfaces/http.interface';

export function findAllUsersController(
	userRepository: UserRepository,
	fileService: FileService
): (req: HttpRequest) => Promise<ResponseModel<UserResult[]>> {
	return async (_req: HttpRequest): Promise<ResponseModel<UserResult[]>> => {
		const data = await findAllUsers(userRepository, fileService);

		return {
			status: StatusCodes.OK,
			data,
		};
	};
}
