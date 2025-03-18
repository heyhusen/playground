import { appConfig } from '../../config/app';
import { Logger } from '../../ports/logger';
import { app } from './app';

app.listen(appConfig.port, () => {
	const logger = new Logger();

	logger.info(`Server up and running at http://localhost:${appConfig.port}`);
});
