import { Logger as ILogger } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { databaseConfig } from '../config/database';
import * as schema from '../dal/schemas';
import { Logger } from './logger';

export const pool = new Pool(databaseConfig);

class DrizzleLogger implements ILogger {
	private readonly logger = new Logger();

	logQuery(query: string, params: unknown[]): void {
		this.logger.debug(query, params);
	}
}

export const db = drizzle({
	client: pool,
	schema,
	logger: new DrizzleLogger(),
});
