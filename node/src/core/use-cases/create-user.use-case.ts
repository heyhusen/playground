import type { FileService } from '../interfaces/file.interface';
import type { HashService } from '../interfaces/hash.interface';
import type {
	CreateUserDto,
	UserRepository,
} from '../interfaces/user.interface';

/**
 * Create an user.
 *
 * If there is an error, a basic exception will be thrown.
 *
 * @param {CreateUserDto}  dto            Validated data transfer object
 * @param {UserRepository} userRepository A repository of user
 * @param {HashService}    hashService    A service for manage hash
 * @param {FileService}    fileService    A service for manage file
 */
export async function createUser(
	dto: CreateUserDto,
	userRepository: UserRepository,
	hashService: HashService,
	fileService: FileService
) {
	const { name, email, password, photo: file } = dto;

	const photo = await fileService.upload(file);

	const record = await userRepository.create({
		name,
		email,
		password: await hashService.create(password),
		photo,
	});

	if (!record) {
		throw Error('Something went wrong.');
	}

	const { password: ignorePassword, ...data } = record;

	return {
		...data,
		avatar: data.photo ? await fileService.getUrl(data.photo) : null,
	};
}
