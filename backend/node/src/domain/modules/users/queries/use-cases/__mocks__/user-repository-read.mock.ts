import { IUserReadRepository } from '../../interfaces/user-repository-read.interface';

export const mockUserRepositoryRead: IUserReadRepository = {
	readAll: jest.fn(),
	read: jest.fn(),
	findOneByEmail: jest.fn(),
};
