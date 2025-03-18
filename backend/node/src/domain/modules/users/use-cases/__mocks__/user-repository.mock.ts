import {
	IUserReadRepository,
	IUserRepository,
} from '../../interfaces/user-repository.interface';

export const mockUserRepositoryRead: IUserReadRepository = {
	readAll: jest.fn(),
	read: jest.fn(),
	findOneByEmail: jest.fn(),
};

export const mockUserRepository: IUserRepository = {
	create: jest.fn(),
	readAll: jest.fn(),
	read: jest.fn(),
	update: jest.fn(),
	delete: jest.fn(),
};
