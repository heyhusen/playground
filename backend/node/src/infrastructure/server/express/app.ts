import express, { json, urlencoded } from 'express';
import { defaultRequest } from './middlewares/default-request';
import { globalErrorHandler, notFoundHandler } from './middlewares/error';
import { router } from './routes';

const app = express();
app.set('query parser', 'extended');

// URL encode
app.use(
	urlencoded({
		extended: true,
	})
);

// JSON parser
app.use(
	json({
		type: ['application/vnd.api+json', 'application/json'],
	})
);

app.use(defaultRequest());

// Routes
app.use('/', router);

// 404 error handler
app.use(notFoundHandler());

// Error handler
app.use(globalErrorHandler());

export { app };
