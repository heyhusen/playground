import { Hono } from 'hono';
import { defaultRequest } from './middlewares/default-request.js';
import { globalErrorHandler, notFoundHandler } from './middlewares/error.js';
import { router } from './routes/index.js';

const app = new Hono();

app.use('*', defaultRequest());

// Routes
app.route('/', router);

// 404 error handler
app.notFound(notFoundHandler());

// Error handler
app.onError(globalErrorHandler());

export { app };
