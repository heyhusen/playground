import { NotFoundException } from '../exceptions/not-found.exception';
import type { FileService } from '../interfaces/file.interface';
import type { UserRepository } from '../interfaces/user.interface';

/**
 * Get one specific user.
 *
 * If the user is not found, a custom exception will be thrown.
 *
 * @param {string}         id             Validated id parameter
 * @param {UserRepository} userRepository A repository of user
 * @param {FileService}    fileService    A service for file
 */
export async function findOneUser(
	id: string,
	userRepository: UserRepository,
	fileService: FileService
) {
	const record = await userRepository.findOne(id);

	if (!record) {
		throw new NotFoundException('The user is not found.');
	}

	const { password, ...data } = record;

	return {
		...data,
		avatar: record.photo ? await fileService.getUrl(record.photo) : null,
	};
}
