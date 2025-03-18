import supertest, { Response } from 'supertest';
import { app } from '../app';

export const request = supertest(app);

export interface SupertestResponse<Body> extends Omit<Response, 'body'> {
	body: Body;
}
