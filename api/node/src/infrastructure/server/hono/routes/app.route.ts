import { Hono } from 'hono';
import { readFileSync } from 'fs';
import { HomeHandler } from '../handlers/home.handler';

const appRouter = new Hono();

const handler = new HomeHandler();
const openapi = readFileSync('../../openapi.yaml', 'utf8');

appRouter.get('/', handler.execute.bind(handler));

appRouter.get('/docs', (context) => {
	return context.html(`<!doctype html>
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

appRouter.get('/docs/openapi.yaml', (context) => {
	return context.body(openapi, 200, {
		'Content-Type': 'application/yaml',
	});
});

export { appRouter };
