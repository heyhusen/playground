import type { FastifyInstance } from 'fastify';
import { readFileSync } from 'fs';
import { HomeHandler } from '../handlers/home.handler.js';

export function appRouter(app: FastifyInstance) {
	const handler = new HomeHandler();
	const openapi = readFileSync('../../openapi.yaml', 'utf8');

	app.get('/', handler.execute.bind(handler));

	app.get('/docs', async (_request, reply) => {
		return reply.type('text/html').send(`<!doctype html>
<html lang="en">
	<head>
		<meta charset="utf-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1" />
		<title>API Documentation</title>
		<link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
	</head>
	<body>
		<div id="swagger-ui"></div>
		<script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
		<script>
			window.onload = () => {
				SwaggerUIBundle({ url: '/docs/openapi.yaml', dom_id: '#swagger-ui' });
			};
		</script>
	</body>
</html>`);
	});

	app.get('/docs/openapi.yaml', async (_request, reply) => {
		return reply.type('application/yaml').send(openapi);
	});
}
