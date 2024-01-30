import type {
	CreateUserDto,
	UserRepository,
	UserResult,
	UserTable,
	UserTableInput,
} from '../interfaces/user.interface';
import { createUser } from './create-user.use-case';

describe('createUser', () => {
	let userRepository: UserRepository;

	const dto: CreateUserDto = {
		first_name: 'Doe',
		last_name: 'Doe',
		email: 'johndoe@example.com',
	};

	const user: UserTable = {
		id: 'id',
		first_name: dto.first_name,
		last_name: dto.last_name,
		nickname: null,
		email: dto.email,
		created_at: '2022-06-11 01:55:13',
		updated_at: '2022-06-11 01:55:13',
	};

	beforeEach(() => {
		userRepository = {
			create: jest.fn((data: UserTableInput) => {
				return Promise.resolve<UserTable>({
					...user,
					...data,
				});
			}),
			findAll: jest.fn(),
			findOne: jest.fn(),
			findOneByEmail: jest.fn(),
			update: jest.fn(),
			remove: jest.fn(),
			truncate: jest.fn(),
		};
	});

	test('should throw error when user is not saved', async () => {
		userRepository.create = jest.fn().mockReturnValue(Promise.resolve(null));

		await expect(createUser(dto, userRepository)).rejects.toThrow(
			new Error('Something went wrong.')
		);
	});

	test('should create an user', async () => {
		const data = await createUser(dto, userRepository);

		expect(userRepository.create).toBeCalledTimes(1);
		expect<UserResult>(data).toEqual({
			...user,
			avatar: null,
		});
	});
});
