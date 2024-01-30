import express, { json } from 'express';
import { errorHandler, notFoundHandler } from './middlewares/error';
import { errorLogger, httpLogger } from './middlewares/logger';
import { router } from './routes';

const app = express();

// JSON parser
app.use(
	json({
		type: ['application/vnd.api+json', 'application/json'],
	})
);

// Http logger
app.use(httpLogger());

// Routes
app.use('/', router);

// 404 error handler
app.use(notFoundHandler());

// Error logger
app.use(errorLogger());

// Error handler
app.use(errorHandler());

export { app };
