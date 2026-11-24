import { vi } from 'vitest';
import { IUserRepository } from '../../interfaces/user-repository.interface.js';

export const mockUserRepository: IUserRepository = {
	create: vi.fn(),
	readAll: vi.fn(),
	read: vi.fn(),
	update: vi.fn(),
	delete: vi.fn(),
};
