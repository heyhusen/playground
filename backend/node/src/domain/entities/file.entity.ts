import type { Readable } from 'stream';

export interface FileEntity {
	name: string;
	size: number;
	type: string;
	extension: string;
	content: Readable;
}
