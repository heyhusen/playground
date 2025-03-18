import { IBaseFileService } from '../../../../base/interfaces/base-file-service.interface';

export const mockFileService: IBaseFileService = {
	upload: jest.fn(),
	getUrl: jest.fn(),
	remove: jest.fn(),
};
