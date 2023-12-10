import supertest from 'supertest';
import { app } from '../src/infrastructure/server/express/app';
import { setup as userSetup } from './fixtures/user.fixture';

export async function setup() {
	await userSetup();
}

export const request = supertest(app);
