import { BadRequestException } from '../exceptions/bad-request.exception';
import type { UserRepository } from '../interfaces/user.interface';

export async function uniqueUserEmail(
	userRepository: UserRepository,
	email: string,
	userId?: string
) {
	const isExists = await userRepository.findOneByEmail(email, userId);

	if (isExists) {
		throw new BadRequestException('The email has already been taken.');
	}

	return true;
}
