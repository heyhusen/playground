import { BadRequestException } from '../../core/exceptions/bad-request.exception';
import type { FileService } from '../../core/interfaces/file.interface';
import type { UserRepository } from '../../core/interfaces/user.interface';
import { findOneUser } from '../../core/use-cases/find-one-user.use-case';
import type { ResponseModel } from '../interfaces/common.interface';
import type { HttpRequestParams } from '../interfaces/http.interface';
import type {
	UserRequestParams,
	UserResponse,
} from '../interfaces/user.interface';

export function findOneUserController(
	userRepository: UserRepository,
	fileService: FileService
) {
	return async (req: HttpRequestParams<UserRequestParams>) => {
		if (!req.params) {
			throw new BadRequestException('An id parameter is expexted.');
		}

		const { id } = req.params;

		const data = await findOneUser(id, userRepository, fileService);

		const result: ResponseModel<UserResponse> = {
			status: 200,
			data: { ...data, type: 'users' },
		};

		return result;
	};
}
