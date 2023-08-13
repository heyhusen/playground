import type { HashService } from '../interfaces/hash.interface';
import type {
	CreateUserDto,
	UserRepository,
	UserResult,
} from '../interfaces/user.interface';

/**
 * Create an user.
 *
 * If there is an error, a basic exception will be thrown.
 *
 * @param {CreateUserDto}  			 dto            Validated data transfer object
 * @param {UserRepository} 			 userRepository A repository of user
 * @param {HashService}    			 hashService    A service for manage hash
 * @return {Promise<UserResult>}                An user entity
 */
export async function createUser(
	dto: CreateUserDto,
	userRepository: UserRepository,
	hashService: HashService
): Promise<UserResult> {
	const { name, email, password } = dto;

	const record = await userRepository.create({
		name,
		email,
		password: await hashService.create(password),
	});

	if (!record) {
		throw new Error('Something went wrong.');
	}

	const { password: ignorePassword, ...data } = record;

	return {
		...data,
		avatar: null,
	};
}
