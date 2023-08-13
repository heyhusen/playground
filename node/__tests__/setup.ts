import supertest from 'supertest';
import type { AuthResponse } from '../src/adapters/interfaces/auth.interface';
import type { AuthResult } from '../src/core/interfaces/auth.interface';
import { app } from '../src/infrastructure/server/express/app';
import { user, setup as userSetup } from './fixtures/user.fixture';

export async function setup() {
	await userSetup();
}

export const request = supertest(app);

export async function logIn(): Promise<AuthResult> {
	const data = await request
		.post('/auth/login')
		.set('Accept', 'application/json')
		.send({ username: user.email, password: user.password });

	const { access_token: accessToken, refresh_token: refreshToken } =
		data.body as AuthResponse;

	return { accessToken, refreshToken };
}
