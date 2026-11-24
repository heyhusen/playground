import { serve } from '@hono/node-server';
import { appConfig } from '../../config/app.js';
import { Logger } from '../../ports/logger.js';
import { app } from './app.js';

serve(
	{
		fetch: app.fetch,
		hostname: appConfig.host,
		port: appConfig.port,
	},
	() => {
		const logger = new Logger();

		logger.info(`Server up and running at http://localhost:${appConfig.port}`);
	}
);
