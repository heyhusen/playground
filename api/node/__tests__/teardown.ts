import { pool } from '../src/infrastructure/ports/database.js';
import { redis } from '../src/infrastructure/ports/redis.js';
import { s3 } from '../src/infrastructure/ports/s3.js';

export async function teardown() {
	await redis.quit();
	redis.disconnect();

	await pool.end();

	s3.destroy();
}
