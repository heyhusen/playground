import type { File } from '../entities/common.entity';
import { NotFoundException } from '../exceptions/not-found.exception';
import type { FileService } from '../interfaces/file.interface';
import type { HashService } from '../interfaces/hash.interface';
import type {
	UpdateUserDto,
	UserRepository,
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
			create: jest.fn(),
			findAll: jest.fn(),
			findOne: jest.fn(),
			findOneByEmail: jest.fn(),
			update: jest.fn((id: string, data: Partial<UserTableInput>) => {
				if (id !== user.id) {
					return Promise.resolve(null);
				}

				return Promise.resolve({ ...user, ...data });
			}),
			remove: jest.fn(),
		};

		hashService = {
			create: jest.fn().mockReturnValue(Promise.resolve('hashedPassword')),
			verify: jest.fn(),
		};

		fileService = {
			upload: jest.fn((file?: File | undefined, originalName = '') => {
				let filename = originalName;

				if (file) {
					filename = `${file.name}.${file.extension}`;
				}

				return Promise.resolve(filename);
			}),
			getUrl: jest.fn().mockReturnValue(Promise.resolve('avatar.png')),
			remove: jest.fn(),
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
		expect(data).toEqual({ ...result, ...dto, avatar: null });
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
		expect(data).toEqual({ ...result, ...dto, avatar: null });
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
		expect(data).toEqual({ ...result, ...dto, avatar: null });
	});

	test("should only update user's password", async () => {
		dto = { password: 'new-password' };

		await updateUser('id', dto, userRepository, hashService, fileService);

		expect(hashService.create).toBeCalledTimes(1);
	});

	test("should only upload new user's avatar", async () => {
		dto = {};

		fileService.upload = jest
			.fn()
			.mockReturnValue(Promise.resolve('new-photo.png'));

		const data = await updateUser(
			'id',
			dto,
			userRepository,
			hashService,
			fileService
		);

		const { password, ...result } = user;

		expect(hashService.create).toBeCalledTimes(0);
		expect(data).toEqual({
			...result,
			...dto,
			photo: 'new-photo.png',
			avatar: 'avatar.png',
		});
	});

	test("should only update existing user's avatar", async () => {
		dto = {};
		user = { ...user, photo: 'old-photo.png' };

		fileService.upload = jest
			.fn()
			.mockReturnValue(Promise.resolve('new-photo.png'));

		const data = await updateUser(
			'id',
			dto,
			userRepository,
			hashService,
			fileService
		);

		const { password, ...result } = user;

		expect(hashService.create).toBeCalledTimes(0);
		expect(data).toEqual({
			...result,
			...dto,
			photo: 'new-photo.png',
			avatar: 'avatar.png',
		});
	});
});
