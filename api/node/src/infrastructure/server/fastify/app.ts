import Fastify from 'fastify';
import { parseQuery } from './helpers/parse-query';
import { defaultRequest } from './middlewares/default-request';
import { globalErrorHandler, notFoundHandler } from './middlewares/error';
import { router } from './routes';

const app = Fastify({
	routerOptions: {
		querystringParser: parseQuery,
	},
});

// JSON:API payloads
app.addContentTypeParser(
	'application/vnd.api+json',
	{ parseAs: 'string' },
	(_request, body, done) => {
		try {
			done(null, JSON.parse(body.toString()));
		} catch (error) {
			done(error as Error);
		}
	}
);

app.addHook('onRequest', defaultRequest());

// Routes
// `register` resolves when the app is ready (on `listen`/`ready`); the returned
// thenable is intentionally not awaited here.
// eslint-disable-next-line @typescript-eslint/no-floating-promises
app.register(router);

// 404 error handler
app.setNotFoundHandler(notFoundHandler());

// Error handler
app.setErrorHandler(globalErrorHandler());

export { app };
