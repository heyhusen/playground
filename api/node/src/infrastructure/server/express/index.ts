import { appConfig } from '../../config/app.js';
import { Logger } from '../../ports/logger.js';
import { app } from './app.js';

app.listen(appConfig.port, () => {
	const logger = new Logger();

	logger.info(`Server up and running at http://localhost:${appConfig.port}`);
});
