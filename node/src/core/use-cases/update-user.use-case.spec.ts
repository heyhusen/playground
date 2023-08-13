import { beforeEach, describe, expect, test, vi } from 'vitest';
import { NotFoundException } from '../exceptions/not-found.exception';
import type { FileService } from '../interfaces/file.interface';
import type { HashService } from '../interfaces/hash.interface';
import type {
	UpdateUserDto,
	UserRepository,
	UserResult,
	UserTable,
	UserTableInput,
} from '../interfaces/user.interface';
import { updateUser } from './update-user.use-case';

describe('updateUser', () => {
	let userRepository: UserRepository;
	let hashService: HashService;
	let fileService: FileService;

	let user: UserTable = {
		id: 'id',
		name: 'John Doe',
		nickname: null,
		email: 'johndoe@example.com',
		email_verified_at: null,
		password: 'abogoboga',
		photo: '',
		created_at: '2022-06-11 01:55:13',
		updated_at: '2022-06-11 01:55:13',
	};

	let dto: UpdateUserDto = {};

	beforeEach(() => {
		userRepository = {
			create: vi.fn(),
			findAll: vi.fn(),
			findOne: vi.fn(),
			findOneByEmail: vi.fn(),
			update: vi.fn((id: string, data: Partial<UserTableInput>) => {
				if (id !== user.id) {
					return Promise.resolve<null>(null);
				}

				return Promise.resolve<UserTable>({ ...user, ...data });
			}),
			remove: vi.fn(),
			truncate: vi.fn(),
		};

		hashService = {
			create: vi.fn().mockReturnValue(Promise.resolve('hashedPassword')),
			verify: vi.fn(),
		};

		fileService = {
			upload: vi.fn(),
			getUrl: vi.fn().mockImplementation(() => {
				if (!user.photo) {
					return null;
				}

				return Promise.resolve('avatar.png');
			}),
			remove: vi.fn(),
		};
	});

	test('should throw error when user not found', async () => {
		await expect(
			updateUser('invalid-id', dto, userRepository, hashService, fileService)
		).rejects.toThrow(new NotFoundException('The user is not found.'));
	});

	test("should only update user's name", async () => {
		dto = { name: 'Jane Doe' };

		const data = await updateUser(
			'id',
			dto,
			userRepository,
			hashService,
			fileService
		);

		const { password, ...result } = user;

		expect(hashService.create).toBeCalledTimes(0);
		expect(data).toEqual<UserResult>({ ...result, ...dto, avatar: null });
	});

	test("should only update user's nickname", async () => {
		dto = { nickname: 'John' };

		const data = await updateUser(
			'id',
			dto,
			userRepository,
			hashService,
			fileService
		);

		const { password, ...result } = user;

		expect(hashService.create).toBeCalledTimes(0);
		expect(data).toEqual<UserResult>({ ...result, ...dto, avatar: null });
	});

	test("should only update user's email", async () => {
		dto = { email: 'janedoe@example.com' };

		const data = await updateUser(
			'id',
			dto,
			userRepository,
			hashService,
			fileService
		);

		const { password, ...result } = user;

		expect(hashService.create).toBeCalledTimes(0);
		expect(data).toEqual<UserResult>({ ...result, ...dto, avatar: null });
	});

	test("should only update user's password", async () => {
		dto = { password: 'new-password' };

		await updateUser('id', dto, userRepository, hashService, fileService);

		expect(hashService.create).toBeCalledTimes(1);
	});

	test("should only update existing user's avatar", async () => {
		dto = {};
		user = { ...user, photo: 'photo.png' };

		const data = await updateUser(
			'id',
			dto,
			userRepository,
			hashService,
			fileService
		);

		const { password, ...result } = user;

		expect(hashService.create).toBeCalledTimes(0);
		expect(data).toEqual<UserResult>({
			...result,
			photo: 'photo.png',
			avatar: 'avatar.png',
		});
	});
});
