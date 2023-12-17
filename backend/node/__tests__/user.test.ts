import { afterAll, beforeEach, describe, expect, test } from 'vitest';
import type {
	JsonApi,
	JsonApiError,
} from '../src/adapters/interfaces/http.interface';
import { setup, testUser, user } from './fixtures/user.fixture';
import { request } from './setup';
import { close } from './teardown';

beforeEach(async () => {
	await setup();
});

afterAll(async () => {
	await close();
});

describe('POST /user', () => {
	test('should return error when request body empty', async () => {
		const response = await request
			.post('/user')
			.set('Accept', 'application/vnd.api+json');

		expect(response.status).toEqual<number>(400);
		expect(response.body).toEqual<JsonApiError>({
			jsonapi: {
				version: '1.0',
			},
			links: {
				self: '/user',
			},
			errors: [
				{
					status: 400,
					title: 'Bad Request',
					detail: 'The first name is required.',
				},
				{
					status: 400,
					title: 'Bad Request',
					detail: 'The email is required.',
				},
			],
		});
	});

	test('should return error when email is invalid', async () => {
		const response = await request
			.post('/user')
			.set('Accept', 'application/vnd.api+json')
			.send({
				first_name: user.first_name,
				last_name: user.last_name,
				email: 'johndoe',
			});

		expect(response.status).toEqual<number>(400);
		expect(response.body).toEqual<JsonApiError>({
			jsonapi: {
				version: '1.0',
			},
			links: {
				self: '/user',
			},
			errors: [
				{
					status: 400,
					title: 'Bad Request',
					detail: 'The email must be a valid email address.',
				},
			],
		});
	});

	test('should return error when email is already taken', async () => {
		const response = await request
			.post('/user')
			.set('Accept', 'application/vnd.api+json')
			.send({
				first_name: user.first_name,
				last_name: user.last_name,
				email: user.email,
			});

		expect(response.status).toEqual<number>(400);
		expect(response.body).toEqual<JsonApiError>({
			jsonapi: {
				version: '1.0',
			},
			links: {
				self: '/user',
			},
			errors: [
				{
					status: 400,
					title: 'Bad Request',
					detail: 'The email has already been taken.',
				},
			],
		});
	});

	test('should create an user', async () => {
		const response = await request
			.post('/user')
			.set('Accept', 'application/vnd.api+json')
			.send({
				first_name: testUser.first_name,
				last_name: testUser.last_name,
				email: testUser.email,
			});

		expect(response.status).toEqual<number>(201);
		expect(response.body).toEqual(
			expect.objectContaining<JsonApi>({
				jsonapi: {
					version: '1.0',
				},
				links: {
					self: '/user',
				},
			})
		);
		expect(response.body).toHaveProperty<string>('data.id');
		expect(response.body).toHaveProperty<string>('data.type', 'users');
		expect(response.body).toHaveProperty<string>(
			'data.attributes.first_name',
			testUser.first_name
		);
		expect(response.body).toHaveProperty<string | null>(
			'data.attributes.last_name',
			testUser.last_name
		);
		expect(response.body).toHaveProperty<null>('data.attributes.nickname');
		expect(response.body).toHaveProperty<string>(
			'data.attributes.email',
			testUser.email
		);
		expect(response.body).toHaveProperty<null>('data.attributes.photo', null);
		expect(response.body).toHaveProperty<null>('data.attributes.avatar', null);
		expect(response.body).toHaveProperty<string>('data.attributes.created_at');
		expect(response.body).toHaveProperty<string>('data.attributes.updated_at');
	});
});

describe('GET /user', () => {
	test('should return users', async () => {
		const response = await request
			.get('/user')
			.set('Accept', 'application/vnd.api+json');

		expect(response.status).toEqual<number>(200);
		expect(response.body).toEqual(
			expect.objectContaining<JsonApi>({
				jsonapi: {
					version: '1.0',
				},
				links: {
					self: '/user',
				},
			})
		);
		expect(response.body).toHaveProperty<string>(['data', 0, 'type'], 'users');
		expect(response.body).toHaveProperty<string>(
			['data', 0, 'attributes', 'first_name'],
			user.first_name
		);
		expect(response.body).toHaveProperty<string | null>(
			['data', 0, 'attributes', 'last_name'],
			user.last_name
		);
		expect(response.body).toHaveProperty<null>([
			'data',
			0,
			'attributes',
			'nickname',
		]);
		expect(response.body).toHaveProperty<string>(
			['data', 0, 'attributes', 'email'],
			user.email
		);
		expect(response.body).toHaveProperty<null>(
			['data', 0, 'attributes', 'photo'],
			null
		);
		expect(response.body).toHaveProperty<null>(
			['data', 0, 'attributes', 'avatar'],
			null
		);
		expect(response.body).toHaveProperty<string>([
			'data',
			0,
			'attributes',
			'created_at',
		]);
		expect(response.body).toHaveProperty<string>([
			'data',
			0,
			'attributes',
			'updated_at',
		]);
	});
});

describe('GET /user/{id}', () => {
	test('should return error when parameter is invalid', async () => {
		const response = await request
			.get('/user/invalid-id')
			.set('Accept', 'application/vnd.api+json');

		expect(response.status).toEqual<number>(400);
		expect(response.body).toEqual<JsonApiError>({
			jsonapi: {
				version: '1.0',
			},
			links: {
				self: '/user/invalid-id',
			},
			errors: [
				{
					status: 400,
					title: 'Bad Request',
					detail: 'Validation failed (uuid v4 is expected).',
				},
			],
		});
	});

	test('should return error when user is not found', async () => {
		const response = await request
			.get('/user/60677a98-a65e-4abc-831c-45dd76e8f990')
			.set('Accept', 'application/vnd.api+json');

		expect(response.status).toEqual<number>(404);
		expect(response.body).toEqual<JsonApiError>({
			jsonapi: {
				version: '1.0',
			},
			links: {
				self: '/user/60677a98-a65e-4abc-831c-45dd76e8f990',
			},
			errors: [
				{
					status: 404,
					title: 'Not Found',
					detail: 'The user is not found.',
				},
			],
		});
	});

	test('should return an user', async () => {
		const response = await request
			.get(`/user/${user.id}`)
			.set('Accept', 'application/vnd.api+json');

		expect(response.status).toEqual<number>(200);
		expect(response.body).toEqual(
			expect.objectContaining<JsonApi>({
				jsonapi: {
					version: '1.0',
				},
				links: {
					self: `/user/${user.id}`,
				},
			})
		);
		expect(response.body).toHaveProperty<string>('data.id', user.id);
		expect(response.body).toHaveProperty<string>('data.type', 'users');
		expect(response.body).toHaveProperty<string>(
			'data.attributes.first_name',
			user.first_name
		);
		expect(response.body).toHaveProperty<string | null>(
			'data.attributes.last_name',
			user.last_name
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

describe('PATCH /user/{id}', () => {
	test('should return error when parameter is invalid', async () => {
		const response = await request
			.patch('/user/invalid-id')
			.set('Accept', 'application/vnd.api+json');

		expect(response.status).toEqual<number>(400);
		expect(response.body).toEqual<JsonApiError>({
			jsonapi: {
				version: '1.0',
			},
			links: {
				self: '/user/invalid-id',
			},
			errors: [
				{
					status: 400,
					title: 'Bad Request',
					detail: 'Validation failed (uuid v4 is expected).',
				},
			],
		});
	});

	test('should return error when user is not found', async () => {
		const response = await request
			.patch('/user/60677a98-a65e-4abc-831c-45dd76e8f990')
			.set('Accept', 'application/vnd.api+json');

		expect(response.status).toEqual<number>(404);
		expect(response.body).toEqual<JsonApiError>({
			jsonapi: {
				version: '1.0',
			},
			links: {
				self: '/user/60677a98-a65e-4abc-831c-45dd76e8f990',
			},
			errors: [
				{
					status: 404,
					title: 'Not Found',
					detail: 'The user is not found.',
				},
			],
		});
	});

	test('should return error when name is null', async () => {
		const response = await request
			.patch(`/user/${user.id}`)
			.set('Accept', 'application/vnd.api+json')
			.send({ first_name: null });

		expect(response.status).toEqual<number>(400);
		expect(response.body).toEqual<JsonApiError>({
			jsonapi: {
				version: '1.0',
			},
			links: {
				self: `/user/${user.id}`,
			},
			errors: [
				{
					status: 400,
					title: 'Bad Request',
					detail: 'The first name must be a string.',
				},
			],
		});
	});

	test('should return error when name is empty', async () => {
		const response = await request
			.patch(`/user/${user.id}`)
			.set('Accept', 'application/vnd.api+json')
			.send({ first_name: '' });

		expect(response.status).toEqual<number>(400);
		expect(response.body).toEqual<JsonApiError>({
			jsonapi: {
				version: '1.0',
			},
			links: {
				self: `/user/${user.id}`,
			},
			errors: [
				{
					status: 400,
					title: 'Bad Request',
					detail: 'The first name field must have a value.',
				},
			],
		});
	});

	test('should return error when name is invalid', async () => {
		const response = await request
			.patch(`/user/${user.id}`)
			.set('Accept', 'application/vnd.api+json')
			.send({
				first_name: 12345,
			});

		expect(response.status).toEqual<number>(400);
		expect(response.body).toEqual<JsonApiError>({
			jsonapi: {
				version: '1.0',
			},
			links: {
				self: `/user/${user.id}`,
			},
			errors: [
				{
					status: 400,
					title: 'Bad Request',
					detail: 'The first name must be a string.',
				},
			],
		});
	});

	test('should ok when username is null', async () => {
		const response = await request
			.patch(`/user/${user.id}`)
			.set('Accept', 'application/vnd.api+json')
			.send({ nickname: null });

		expect(response.status).toEqual<number>(200);
		expect(response.body).toEqual(
			expect.objectContaining<JsonApi>({
				jsonapi: {
					version: '1.0',
				},
				links: {
					self: `/user/${user.id}`,
				},
			})
		);
		expect(response.body).toHaveProperty<string>('data.id', user.id);
		expect(response.body).toHaveProperty<string>('data.type', 'users');
		expect(response.body).toHaveProperty<string>(
			'data.attributes.first_name',
			user.first_name
		);
		expect(response.body).toHaveProperty<string | null>(
			'data.attributes.last_name',
			user.last_name
		);
		expect(response.body).toHaveProperty<null>(
			'data.attributes.nickname',
			null
		);
		expect(response.body).toHaveProperty<string>(
			'data.attributes.email',
			user.email
		);
		expect(response.body).toHaveProperty<null>('data.attributes.photo', null);
		expect(response.body).toHaveProperty<null>('data.attributes.avatar', null);
		expect(response.body).toHaveProperty<string>('data.attributes.created_at');
		expect(response.body).toHaveProperty<string>('data.attributes.updated_at');
	});

	test('should ok when username is empty', async () => {
		const response = await request
			.patch(`/user/${user.id}`)
			.set('Accept', 'application/vnd.api+json')
			.send({ nickname: '' });

		expect(response.status).toEqual<number>(200);
		expect(response.body).toEqual(
			expect.objectContaining<JsonApi>({
				jsonapi: {
					version: '1.0',
				},
				links: {
					self: `/user/${user.id}`,
				},
			})
		);
		expect(response.body).toHaveProperty<string>('data.id', user.id);
		expect(response.body).toHaveProperty<string>('data.type', 'users');
		expect(response.body).toHaveProperty<string>(
			'data.attributes.first_name',
			user.first_name
		);
		expect(response.body).toHaveProperty<string | null>(
			'data.attributes.last_name',
			user.last_name
		);
		expect(response.body).toHaveProperty<null>(
			'data.attributes.nickname',
			null
		);
		expect(response.body).toHaveProperty<string>(
			'data.attributes.email',
			user.email
		);
		expect(response.body).toHaveProperty<null>('data.attributes.photo', null);
		expect(response.body).toHaveProperty<null>('data.attributes.avatar', null);
		expect(response.body).toHaveProperty<string>('data.attributes.created_at');
		expect(response.body).toHaveProperty<string>('data.attributes.updated_at');
	});

	test('should return error when email is null', async () => {
		const response = await request
			.patch(`/user/${user.id}`)
			.set('Accept', 'application/vnd.api+json')
			.send({ email: null });

		expect(response.status).toEqual<number>(400);
		expect(response.body).toEqual<JsonApiError>({
			jsonapi: {
				version: '1.0',
			},
			links: {
				self: `/user/${user.id}`,
			},
			errors: [
				{
					status: 400,
					title: 'Bad Request',
					detail: 'The email must be a string.',
				},
			],
		});
	});

	test('should return error when email is empty', async () => {
		const response = await request
			.patch(`/user/${user.id}`)
			.set('Accept', 'application/vnd.api+json')
			.send({ email: '' });

		expect(response.status).toEqual<number>(400);
		expect(response.body).toEqual<JsonApiError>({
			jsonapi: {
				version: '1.0',
			},
			links: {
				self: `/user/${user.id}`,
			},
			errors: [
				{
					status: 400,
					title: 'Bad Request',
					detail: 'The email must be a valid email address.',
				},
			],
		});
	});

	test('should return error when email is invalid', async () => {
		const response = await request
			.patch(`/user/${user.id}`)
			.set('Accept', 'application/vnd.api+json')
			.send({ email: 12345 });

		expect(response.status).toEqual<number>(400);
		expect(response.body).toEqual<JsonApiError>({
			jsonapi: {
				version: '1.0',
			},
			links: {
				self: `/user/${user.id}`,
			},
			errors: [
				{
					status: 400,
					title: 'Bad Request',
					detail: 'The email must be a string.',
				},
			],
		});
	});

	test('should return error when email is invalid', async () => {
		const response = await request
			.patch(`/user/${user.id}`)
			.set('Accept', 'application/vnd.api+json')
			.send({ email: 'johndoe' });

		expect(response.status).toEqual<number>(400);
		expect(response.body).toEqual<JsonApiError>({
			jsonapi: {
				version: '1.0',
			},
			links: {
				self: `/user/${user.id}`,
			},
			errors: [
				{
					status: 400,
					title: 'Bad Request',
					detail: 'The email must be a valid email address.',
				},
			],
		});
	});

	test('should not update an user', async () => {
		const response = await request
			.patch(`/user/${user.id}`)
			.set('Accept', 'application/vnd.api+json');

		expect(response.status).toEqual<number>(200);
		expect(response.body).toEqual(
			expect.objectContaining<JsonApi>({
				jsonapi: {
					version: '1.0',
				},
				links: {
					self: `/user/${user.id}`,
				},
			})
		);
		expect(response.body).toHaveProperty<string>('data.id', user.id);
		expect(response.body).toHaveProperty<string>('data.type', 'users');
		expect(response.body).toHaveProperty<string>(
			'data.attributes.first_name',
			user.first_name
		);
		expect(response.body).toHaveProperty<string | null>(
			'data.attributes.last_name',
			user.last_name
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
