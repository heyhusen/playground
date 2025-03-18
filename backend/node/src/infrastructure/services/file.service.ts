import {
	DeleteObjectCommand,
	GetObjectCommand,
	PutObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import type { IBaseFileService } from '../../domain/base/interfaces/base-file-service.interface';
import type { FileEntity } from '../../domain/entities/file.entity';
import { s3 } from '../ports/s3';

export const fileService: IBaseFileService = {
	upload: async (file?: FileEntity, originalPath = null) => {
		let path = originalPath;

		if (file) {
			const { name, content } = file;

			await s3.send(
				new PutObjectCommand({
					Bucket: 'local',
					ACL: 'public-read',
					Key: name,
					Body: content,
				})
			);

			path = name;
		}

		return path;
	},

	getUrl: async (path: string) => {
		const url = await getSignedUrl(
			s3,
			new GetObjectCommand({ Bucket: 'local', Key: path })
		);

		if (!url) {
			return null;
		}

		return url;
	},

	remove: async (path: string) => {
		await s3.send(new DeleteObjectCommand({ Bucket: 'local', Key: path }));
	},
};
