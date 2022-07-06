import { BadRequestException } from '../../core/exceptions/bad-request.exception';
import type { HashService } from '../../core/interfaces/hash.interface';
import type {
	CreateUserDto,
	UserRepository,
} from '../../core/interfaces/user.interface';
import { createUser } from '../../core/use-cases/create-user.use-case';
import type { ResponseModel } from '../interfaces/common.interface';
import type { HttpRequestBody } from '../interfaces/http.interface';
import type { UserResponse } from '../interfaces/user.interface';

export function createUserController(
	userRepository: UserRepository,
	hashService: HashService
): (
	req: HttpRequestBody<Omit<CreateUserDto, 'photo'>>
) => Promise<ResponseModel<UserResponse>> {
	return async (
		req: HttpRequestBody<Omit<CreateUserDto, 'photo'>>
	): Promise<ResponseModel<UserResponse>> => {
		if (!req.body) {
			throw new BadRequestException('Request body is empty.');
		}

		const dto = { ...req.body, photo: req.file };

		const data = await createUser(dto, userRepository, hashService);

		return {
			status: 201,
			data: { ...data, type: 'users' },
		};
	};
}
