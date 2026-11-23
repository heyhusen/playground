import supertest, { Response } from 'supertest';
import { app } from '../app';

// Fastify finalizes its routes on `ready()`. Supertest uses the raw
// `app.server`, so it must be ready before the first request is issued.
export const ready = app.ready();

export const request = supertest(app.server);

export interface SupertestResponse<Body> extends Omit<Response, 'body'> {
	body: Body;
}
