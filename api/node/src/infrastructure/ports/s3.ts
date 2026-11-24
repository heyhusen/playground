import { S3Client } from '@aws-sdk/client-s3';
import { s3Config } from '../config/s3.js';

export const s3 = new S3Client(s3Config);
