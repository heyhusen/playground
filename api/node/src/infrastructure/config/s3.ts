import type { S3ClientConfig } from '@aws-sdk/client-s3';

export const s3Config: S3ClientConfig = {
	endpoint: {
		protocol: 'http',
		hostname: process.env.S3_ENDPOINT || 'minio',
		port: parseInt(String(process.env.S3_PORT), 10) || 9000,
		path: '/',
	},
	region: process.env.S3_DEFAULT_REGION || 'ap-southeast-1',
	credentials: {
		accessKeyId: process.env.S3_ACCESS_KEY_ID || 'miniosudo',
		secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || 'miniosudo',
	},
	forcePathStyle: true,
};
