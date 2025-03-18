import {
	mockUserRepository,
	mockUserRepositoryRead,
} from '../../../../../domain/modules/users/use-cases/__mocks__/user-repository.mock';
import { IBaseUnitOfWork } from '../../../../base/interfaces/base-unit-of-work.interface';

export const mockUnitOfWork: IBaseUnitOfWork = {
	transaction: jest.fn(),
	getUserRepository: jest.fn().mockReturnValue(mockUserRepository),
	getUserReadRepository: jest.fn().mockReturnValue(mockUserRepositoryRead),
};
