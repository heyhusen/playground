import { Router } from 'express';
import { readFileSync } from 'fs';
import { JsonObject, serve, setup } from 'swagger-ui-express';
import { parse } from 'yaml';
import { home } from '../handlers/app.handler';
import { accessToken } from '../middlewares/auth';

const appRouter = Router();

const openapi = readFileSync('../openapi.yaml', 'utf8');
const swaggerDoc = parse(openapi) as JsonObject;

appRouter.get('/', accessToken(), home);

appRouter.use('/doc', serve);
appRouter.get('/doc', setup(swaggerDoc));

export { appRouter };
