import { IUserRepository } from '../../interfaces/user-repository.interface';

export const mockUserRepository: IUserRepository = {
	create: jest.fn(),
	readAll: jest.fn(),
	read: jest.fn(),
	update: jest.fn(),
	delete: jest.fn(),
};
