import { BadRequestException } from '../../core/exceptions/bad-request.exception';
import type { FileService } from '../../core/interfaces/file.interface';
import type {
	UpdateUserDto,
	UserRepository,
} from '../../core/interfaces/user.interface';
import { updateUser } from '../../core/use-cases/update-user.use-case';
import type { ResponseModel } from '../interfaces/common.interface';
import type { HttpRequest } from '../interfaces/http.interface';
import type {
	UserRequestParams,
	UserResponse,
} from '../interfaces/user.interface';

export function updateUserController(
	userRepository: UserRepository,
	fileService: FileService
): (
	req: HttpRequest<unknown, UserRequestParams, Omit<UpdateUserDto, 'photo'>>
) => Promise<ResponseModel<UserResponse>> {
	return async (
		req: HttpRequest<unknown, UserRequestParams, Omit<UpdateUserDto, 'photo'>>
	): Promise<ResponseModel<UserResponse>> => {
		if (!req.params) {
			throw new BadRequestException('An id parameter is expected.');
		}

		const { id } = req.params;

		const dto = { ...req.body };

		const data = await updateUser(id, dto, userRepository, fileService);

		return {
			status: 200,
			data: { ...data, type: 'users' },
		};
	};
}
