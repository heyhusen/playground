import { FileEntity } from '../../entities/file.entity';

export interface IBaseFileService {
	upload: (
		file?: FileEntity,
		originalName?: string | null
	) => Promise<string | null>;
	getUrl: (path: string) => Promise<string | null>;
	remove: (path: string) => Promise<void>;
}
