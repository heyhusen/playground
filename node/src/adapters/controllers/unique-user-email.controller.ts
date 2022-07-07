import { uniqueUserEmail } from '../../core/use-cases/unique-user-email.use-case';
import type {
	UpdateUserDto,
	UserRepository,
} from '../../core/interfaces/user.interface';
import type { HttpRequestBody } from '../interfaces/http.interface';

export function uniqueUserEmailController(
	userRepository: UserRepository
): (req: HttpRequestBody<Pick<UpdateUserDto, 'email'>>) => Promise<boolean> {
	return async (
		req: HttpRequestBody<Pick<UpdateUserDto, 'email'>>
	): Promise<boolean> => {
		if (req.body) {
			const { email } = req.body;

			if (email) {
				const result = await uniqueUserEmail(email, userRepository);

				return result;
			}
		}

		return true;
	};
}
