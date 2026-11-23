import { vi } from 'vitest';
import { IUserReadRepository } from '../../interfaces/user-repository-read.interface';

export const mockUserRepositoryRead: IUserReadRepository = {
	readAll: vi.fn(),
	read: vi.fn(),
	findOneByEmail: vi.fn(),
};
