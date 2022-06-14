import type { FileService } from '../interfaces/file.interface';
import type { UserRepository } from '../interfaces/user.interface';

/**
 * List all users.
 *
 * @param {UserRepository} userRepository A repository of user
 * @param {FileService}    fileService   A service for manage file
 */
export async function findAllUsers(
	userRepository: UserRepository,
	fileService: FileService
) {
	const records = await userRepository.findAll();

	const result = await Promise.all(
		records.map(async ({ password, ...obj }) => ({
			...obj,
			avatar: obj.photo ? await fileService.getUrl(obj.photo) : null,
		}))
	);

	if (records.length > 0) {
		return result;
	}

	return [];
}
