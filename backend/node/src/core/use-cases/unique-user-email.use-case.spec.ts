import { beforeAll, describe, expect, test, vi } from 'vitest';
import { BadRequestException } from '../exceptions/bad-request.exception';
import type { UserRepository, UserTable } from '../interfaces/user.interface';
import { uniqueUserEmail } from './unique-user-email.use-case';

describe('uniqueUserEmail', () => {
	let userRepository: UserRepository;

	const user: UserTable = {
		id: 'id',
		first_name: 'John',
		last_name: 'Doe',
		nickname: null,
		email: 'johndoe@example.com',
		created_at: '2022-06-11 01:55:13',
		updated_at: '2022-06-11 01:55:13',
	};

	beforeAll(() => {
		userRepository = {
			create: vi.fn(),
			findAll: vi.fn(),
			findOne: vi.fn(),
			findOneByEmail: vi.fn((email: string) => {
				if (email === user.email) {
					return Promise.resolve(user);
				}

				return Promise.resolve(null);
			}),
			update: vi.fn(),
			remove: vi.fn(),
			truncate: vi.fn(),
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
