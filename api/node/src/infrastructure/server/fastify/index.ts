import { appConfig } from '../../config/app.js';
import { Logger } from '../../ports/logger.js';
import { app } from './app.js';

async function start() {
	await app.listen({ host: appConfig.host, port: appConfig.port });

	const logger = new Logger();

	logger.info(`Server up and running at http://localhost:${appConfig.port}`);
}

start().catch((error: unknown) => {
	process.stderr.write(`${String(error)}\n`);
	process.exitCode = 1;
});
