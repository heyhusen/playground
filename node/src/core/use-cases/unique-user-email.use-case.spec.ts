import { BadRequestException } from '../exceptions/bad-request.exception';
import type { UserRepository, UserTable } from '../interfaces/user.interface';
import { uniqueUserEmail } from './unique-user-email.use-case';

describe('uniqueUserEmail', () => {
	let userRepository: UserRepository;

	const user: UserTable = {
		id: 'id',
		name: 'John Doe',
		nickname: null,
		email: 'johndoe@example.com',
		email_verified_at: null,
		password: 'abogoboga',
		created_at: '2022-06-11 01:55:13',
		updated_at: '2022-06-11 01:55:13',
	};

	beforeAll(() => {
		userRepository = {
			create: jest.fn(),
			findAll: jest.fn(),
			findOne: jest.fn(),
			findOneByEmail: jest.fn((email: string) => {
				if (email === user.email) {
					return Promise.resolve(user);
				}

				return Promise.resolve(null);
			}),
			update: jest.fn(),
			remove: jest.fn(),
			truncate: jest.fn(),
		};
	});

	test('should throw error when email is already taken', async () => {
		await expect(
			uniqueUserEmail('johndoe@example.com', userRepository)
		).rejects.toThrow(
			new BadRequestException('The email has already been taken.')
		);
	});

	test('should return true when user is not found', async () => {
		const data = await uniqueUserEmail('johndoe@example.co', userRepository);

		expect(data).toEqual(true);
	});
});
