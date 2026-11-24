import { vi } from 'vitest';
import { mockUserRepository } from '../../../../../../domain/modules/users/commands/use-cases/__mocks__/user-repository.mock.js';
import { mockUserRepositoryRead } from '../../../../../../domain/modules/users/queries/use-cases/__mocks__/user-repository-read.mock.js';
import { IBaseUnitOfWork } from '../../../../../base/interfaces/base-unit-of-work.interface.js';

export const mockUnitOfWork: IBaseUnitOfWork = {
	transaction: vi.fn(),
	getUserRepository: vi.fn().mockReturnValue(mockUserRepository),
	getUserReadRepository: vi.fn().mockReturnValue(mockUserRepositoryRead),
};
