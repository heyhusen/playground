import { mockUserRepository } from '../../../../../../domain/modules/users/commands/use-cases/__mocks__/user-repository.mock';
import { mockUserRepositoryRead } from '../../../../../../domain/modules/users/queries/use-cases/__mocks__/user-repository-read.mock';
import { IBaseUnitOfWork } from '../../../../../base/interfaces/base-unit-of-work.interface';

export const mockUnitOfWork: IBaseUnitOfWork = {
	transaction: jest.fn(),
	getUserRepository: jest.fn().mockReturnValue(mockUserRepository),
	getUserReadRepository: jest.fn().mockReturnValue(mockUserRepositoryRead),
};
