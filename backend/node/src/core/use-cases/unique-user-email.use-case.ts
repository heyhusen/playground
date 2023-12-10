import { BadRequestException } from '../exceptions/bad-request.exception';
import type { UserRepository } from '../interfaces/user.interface';

export async function uniqueUserEmail(
	email: string,
	userRepository: UserRepository
) {
	const isExists = await userRepository.findOneByEmail(email);

	if (isExists) {
		throw new BadRequestException('The email has already been taken.');
	}

	return true;
}
