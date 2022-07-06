import type { AuthResponse } from '../src/adapters/interfaces/auth.interface';
import type {
	BearerTokenError,
	JsonApi,
	JsonApiError,
} from '../src/adapters/interfaces/http.interface';
import { user } from './fixtures/user.fixture';
import { logIn, request } from './setup';
import { close } from './teardown';

let accessToken: string;
let refreshToken: string;

beforeAll(async () => {
	const { accessToken: access, refreshToken: refresh } = await logIn();

	accessToken = access;
	refreshToken = refresh;
});

afterAll(async () => {
	await close();
});

describe('POST /auth/login', () => {
	test('should return error when username and password is undefined', async () => {
		const response = await request
			.post('/auth/login')
			.set('Accept', 'application/json');

		expect(response.status).toEqual<number>(400);
		expect(response.body).toEqual<JsonApiError>({
			jsonapi: {
				version: '1.0',
			},
			links: {
				self: '/auth/login',
			},
			errors: [
				{
					status: 400,
					title: 'Bad Request',
					detail: 'The username is required.',
				},
				{
					status: 400,
					title: 'Bad Request',
					detail: 'The password is required.',
				},
			],
		});
	});

	test('should return error when username and password is undefined', async () => {
		const response = await request
			.post('/auth/login')
			.set('Accept', 'application/json')
			.send({ username: undefined, password: undefined });

		expect(response.status).toEqual<number>(400);
		expect(response.body).toEqual<JsonApiError>({
			jsonapi: {
				version: '1.0',
			},
			links: {
				self: '/auth/login',
			},
			errors: [
				{
					status: 400,
					title: 'Bad Request',
					detail: 'The username is required.',
				},
				{
					status: 400,
					title: 'Bad Request',
					detail: 'The password is required.',
				},
			],
		});
	});

	test('should return error when username and password is empty', async () => {
		const response = await request
			.post('/auth/login')
			.set('Accept', 'application/json')
			.send({ username: '', password: '' });

		expect(response.status).toEqual<number>(400);
		expect(response.body).toEqual<JsonApiError>({
			jsonapi: {
				version: '1.0',
			},
			links: {
				self: '/auth/login',
			},
			errors: [
				{
					status: 400,
					title: 'Bad Request',
					detail: 'The username is required.',
				},
				{
					status: 400,
					title: 'Bad Request',
					detail: 'The password is required.',
				},
			],
		});
	});

	test('should return error when user is not found', async () => {
		const response = await request
			.post('/auth/login')
			.set('Accept', 'application/json')
			.send({ username: 'johndoe@example.co', password: user.password });

		expect(response.status).toEqual<number>(401);
		expect(response.body).toEqual<JsonApiError>({
			jsonapi: {
				version: '1.0',
			},
			links: {
				self: '/auth/login',
			},
			errors: [
				{
					status: 401,
					title: 'Unauthorized',
					detail: 'These credentials do not match our records.',
				},
			],
		});
	});

	test('should return error when password is invalid', async () => {
		const response = await request
			.post('/auth/login')
			.set('Accept', 'application/json')
			.send({ username: user.email, password: 'abogobog' });

		expect(response.status).toEqual<number>(401);
		expect(response.body).toEqual<JsonApiError>({
			jsonapi: {
				version: '1.0',
			},
			links: {
				self: '/auth/login',
			},
			errors: [
				{
					status: 401,
					title: 'Unauthorized',
					detail: 'These credentials do not match our records.',
				},
			],
		});
	});

	test('should return error when user is not found and password is invalid', async () => {
		const response = await request
			.post('/auth/login')
			.set('Accept', 'application/json')
			.send({ username: 'johndoe@example.co', password: 'abogobog' });

		expect(response.status).toEqual<number>(401);
		expect(response.body).toEqual<JsonApiError>({
			jsonapi: {
				version: '1.0',
			},
			links: {
				self: '/auth/login',
			},
			errors: [
				{
					status: 401,
					title: 'Unauthorized',
					detail: 'These credentials do not match our records.',
				},
			],
		});
	});

	test('should return tokens when login is valid', async () => {
		const response = await request
			.post('/auth/login')
			.set('Accept', 'application/json')
			.send({ username: user.email, password: user.password });

		expect(response.status).toEqual<number>(200);
		expect(response.body).toEqual(
			expect.objectContaining<Pick<AuthResponse, 'token_type'>>({
				token_type: 'Bearer',
			})
		);
		expect(response.body).toHaveProperty<AuthResponse['access_token']>(
			'access_token'
		);
		expect(response.body).toHaveProperty<AuthResponse['refresh_token']>(
			'refresh_token'
		);
		expect(response.body).toHaveProperty<AuthResponse['expires_in']>(
			'expires_in'
		);
	});
});

describe('GET /auth/profile', () => {
	test('should return unauthorized error if authorization header missing', async () => {
		const response = await request
			.get('/auth/profile')
			.set('Accept', 'application/vnd.api+json');

		expect(response.status).toEqual<number>(400);
		expect(response.body).toEqual<BearerTokenError>({
			error: 'invalid_request',
			error_description:
				'The request is missing a required authorization header.',
		});
	});

	test('should return unauthorized error if token missing', async () => {
		const response = await request
			.get('/auth/profile')
			.set('Accept', 'application/vnd.api+json')
			.auth('', { type: 'bearer' });

		expect(response.status).toEqual<number>(401);
		expect(response.body).toEqual<BearerTokenError>({
			error: 'invalid_token',
			error_description: 'The token is malformed.',
		});
	});

	test('should return authenticated user', async () => {
		const response = await request
			.get('/auth/profile')
			.set('Accept', 'application/vnd.api+json')
			.auth(accessToken, { type: 'bearer' });

		expect(response.status).toEqual<number>(200);
		expect(response.body).toEqual(
			expect.objectContaining<JsonApi>({
				jsonapi: {
					version: '1.0',
				},
				links: {
					self: '/auth/profile',
				},
			})
		);
		expect(response.body).toHaveProperty<string>('data.type', 'users');
		expect(response.body).toHaveProperty<string>(
			'data.attributes.name',
			user.name
		);
		expect(response.body).toHaveProperty<null>('data.attributes.nickname');
		expect(response.body).toHaveProperty<string>(
			'data.attributes.email',
			user.email
		);
		expect(response.body).toHaveProperty<null>('data.attributes.photo', null);
		expect(response.body).toHaveProperty<null>('data.attributes.avatar', null);
		expect(response.body).toHaveProperty<string>('data.attributes.created_at');
		expect(response.body).toHaveProperty<string>('data.attributes.updated_at');
	});
});

describe('GET /auth/refresh', () => {
	test('should return unauthorized error if token missing', async () => {
		const response = await request
			.get('/auth/refresh')
			.set('Accept', 'application/vnd.api+json');

		expect(response.status).toEqual<number>(400);
		expect(response.body).toEqual<JsonApiError>({
			jsonapi: {
				version: '1.0',
			},
			links: {
				self: '/auth/refresh',
			},
			errors: [
				{
					status: 400,
					title: 'Bad Request',
					detail: 'The token is missing or malformed.',
				},
			],
		});
	});

	test('should return unauthorized error if token empty', async () => {
		const response = await request
			.get('/auth/refresh')
			.set('Accept', 'application/vnd.api+json')
			.set('Cookie', ['refresh_token=']);

		expect(response.status).toEqual<number>(400);
		expect(response.body).toEqual<JsonApiError>({
			jsonapi: {
				version: '1.0',
			},
			links: {
				self: '/auth/refresh',
			},
			errors: [
				{
					status: 400,
					title: 'Bad Request',
					detail: 'The token is missing or malformed.',
				},
			],
		});
	});

	test('should return unauthorized error if token is invalid', async () => {
		const response = await request
			.get('/auth/refresh')
			.set('Accept', 'application/vnd.api+json')
			.set('Cookie', ['refresh_token=token']);

		expect(response.status).toEqual<number>(400);
		expect(response.body).toEqual<JsonApiError>({
			jsonapi: {
				version: '1.0',
			},
			links: {
				self: '/auth/refresh',
			},
			errors: [
				{
					status: 400,
					title: 'Bad Request',
					detail: 'The token is malformed.',
				},
			],
		});
	});

	test('should return new tokens', async () => {
		const response = await request
			.get('/auth/refresh')
			.set('Accept', 'application/vnd.api+json')
			.set('Cookie', [`refresh_token=${refreshToken}`]);

		expect(response.status).toEqual<number>(200);
		expect(response.body).toEqual(
			expect.objectContaining<Pick<AuthResponse, 'token_type'>>({
				token_type: 'Bearer',
			})
		);
		expect(response.body).toHaveProperty('access_token');
		expect(response.body).toHaveProperty('refresh_token');
		expect(response.body).toHaveProperty('expires_in');
	});

	test('should return unauthorized error if token is expired', async () => {
		const response = await request
			.get('/auth/refresh')
			.set('Accept', 'application/vnd.api+json')
			.set('Cookie', [`refresh_token=${refreshToken}`]);

		expect(response.status).toEqual<number>(401);
		expect(response.body).toEqual<JsonApiError>({
			jsonapi: {
				version: '1.0',
			},
			links: {
				self: '/auth/refresh',
			},
			errors: [
				{
					status: 401,
					title: 'Unauthorized',
					detail: 'The token has been expired.',
				},
			],
		});
	});
});

describe('POST /auth/logout', () => {
	test('should return unauthorized error if token missing', async () => {
		const response = await request
			.post('/auth/logout')
			.set('Accept', 'application/vnd.api+json');

		expect(response.status).toEqual<number>(400);
		expect(response.body).toEqual<JsonApiError>({
			jsonapi: {
				version: '1.0',
			},
			links: {
				self: '/auth/logout',
			},
			errors: [
				{
					status: 400,
					title: 'Bad Request',
					detail: 'The token is missing or malformed.',
				},
			],
		});
	});

	test('should return unauthorized error if token empty', async () => {
		const response = await request
			.post('/auth/logout')
			.set('Accept', 'application/vnd.api+json')
			.set('Cookie', ['refresh_token=']);

		expect(response.status).toEqual<number>(400);
		expect(response.body).toEqual<JsonApiError>({
			jsonapi: {
				version: '1.0',
			},
			links: {
				self: '/auth/logout',
			},
			errors: [
				{
					status: 400,
					title: 'Bad Request',
					detail: 'The token is missing or malformed.',
				},
			],
		});
	});

	test('should return unauthorized error if token is invalid', async () => {
		const response = await request
			.post('/auth/logout')
			.set('Accept', 'application/vnd.api+json')
			.set('Cookie', ['refresh_token=token']);

		expect(response.status).toEqual<number>(400);
		expect(response.body).toEqual<JsonApiError>({
			jsonapi: {
				version: '1.0',
			},
			links: {
				self: '/auth/logout',
			},
			errors: [
				{
					status: 400,
					title: 'Bad Request',
					detail: 'The token is malformed.',
				},
			],
		});
	});

	test('should log out user', async () => {
		const { refreshToken: refresh } = await logIn();
		refreshToken = refresh;

		const response = await request
			.post('/auth/logout')
			.set('Accept', 'application/vnd.api+json')
			.set('Cookie', [`refresh_token=${refreshToken}`]);

		expect(response.status).toEqual<number>(204);
		expect(response.body).toEqual({});
	});

	test('should return error when user is logged out', async () => {
		const { refreshToken: refresh } = await logIn();
		refreshToken = refresh;

		await request
			.post('/auth/logout')
			.set('Accept', 'application/vnd.api+json')
			.set('Cookie', [`refresh_token=${refreshToken}`]);

		const response = await request
			.post('/auth/logout')
			.set('Accept', 'application/vnd.api+json')
			.set('Cookie', [`refresh_token=${refreshToken}`]);

		expect(response.status).toEqual<number>(401);
		expect(response.body).toEqual<JsonApiError>({
			jsonapi: {
				version: '1.0',
			},
			links: {
				self: '/auth/logout',
			},
			errors: [
				{
					status: 401,
					title: 'Unauthorized',
					detail: 'The token has been revoked.',
				},
			],
		});
	});
});
