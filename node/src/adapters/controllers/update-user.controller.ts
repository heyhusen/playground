import { BadRequestException } from '../../core/exceptions/bad-request.exception';
import type { FileService } from '../../core/interfaces/file.interface';
import type { HashService } from '../../core/interfaces/hash.interface';
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
	hashService: HashService,
	fileService: FileService
) {
	return async (
		req: HttpRequest<unknown, UserRequestParams, Omit<UpdateUserDto, 'photo'>>
	) => {
		if (!req.params) {
			throw new BadRequestException('An id parameter is expected.');
		}

		const { id } = req.params;

		const dto = { ...req.body, photo: req.file };

		const data = await updateUser(
			id,
			dto,
			userRepository,
			hashService,
			fileService
		);

		const result: ResponseModel<UserResponse> = {
			status: 200,
			data: { ...data, type: 'users' },
		};

		return result;
	};
}
