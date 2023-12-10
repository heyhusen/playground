import type { FileService } from '../interfaces/file.interface';
import type { UserRepository, UserResult } from '../interfaces/user.interface';

/**
 * List all users.
 *
 * @param {UserRepository}  userRepository 				A repository of user
 * @param {FileService}     fileService    				A service for manage file
 * @return {Promise<UserResult[]>}                User entities
 */
export async function findAllUsers(
	userRepository: UserRepository,
	fileService: FileService
): Promise<UserResult[]> {
	const records = await userRepository.findAll();

	const result = await Promise.all(
		records.map(
			async ({ password, ...obj }) =>
				({
					...obj,
					avatar: obj.photo ? await fileService.getUrl(obj.photo) : null,
				} as UserResult)
		)
	);

	if (records.length > 0) {
		return result;
	}

	return [];
}
