/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/unbound-method */
import { Router } from 'express';
import { readFileSync } from 'fs';
import { JsonObject, serve, setup } from 'swagger-ui-express';
import { parse } from 'yaml';
import { HomeHandler } from '../handlers/home.handler';

const appRouter = Router();

const handler = new HomeHandler();
const openapi = readFileSync('../../openapi.yaml', 'utf8');
const swaggerDoc = <JsonObject>parse(openapi);

appRouter.get('/', handler.execute);

appRouter.use('/docs', serve);
appRouter.get('/docs', setup(swaggerDoc));

export { appRouter };
