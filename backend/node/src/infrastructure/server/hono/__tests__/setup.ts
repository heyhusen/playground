import { createAdaptorServer } from '@hono/node-server';
import supertest, { Response } from 'supertest';
import { app } from '../app';

const server = createAdaptorServer({ fetch: app.fetch, port: 0 });

export const request = supertest(server);

export interface SupertestResponse<Body> extends Omit<Response, 'body'> {
	body: Body;
}
