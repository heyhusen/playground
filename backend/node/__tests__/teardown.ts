import { pool } from '../src/infrastructure/ports/database';
import { redis } from '../src/infrastructure/ports/redis';
import { s3 } from '../src/infrastructure/ports/s3';

export async function teardown() {
	await redis.quit();
	redis.disconnect();

	await pool.end();

	s3.destroy();
}
