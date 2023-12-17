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
		records.map(async (obj) => {
			let avatar: string | null = null;
			if (obj.photo) {
				avatar = await fileService.getUrl(obj.photo);
			}

			return {
				...obj,
				avatar,
			};
		})
	);

	if (!records.length) {
		return [];
	}

	return result;
}
