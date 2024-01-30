import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import { setup, testUser, user } from './fixtures/user.fixture';
import { request } from './setup';
import { close } from './teardown';

beforeEach(async () => {
	await setup();
});

afterAll(async () => {
	await close();
});

describe('POST /users', () => {
	test('should return error when request body empty', async () => {
		const response = await request
			.post('/users')
			.set('Accept', 'application/vnd.api+json');

		expect(response.status).toEqual(StatusCodes.BAD_REQUEST);
		expect(response.body).toEqual({
			jsonapi: {
				version: '1.1',
			},
			links: {
				self: '/users',
			},
			errors: [
				{
					status: StatusCodes.BAD_REQUEST,
					title: ReasonPhrases.BAD_REQUEST,
					detail: 'The data property is required.',
				},
			],
		});
	});

	test('should return error when email is invalid', async () => {
		const response = await request
			.post('/users')
			.set('Accept', 'application/vnd.api+json')
			.send({
				data: {
					type: 'users',
					attributes: {
						first_name: user.first_name,
						last_name: user.last_name,
						email: 'johndoe',
					},
				},
			});

		expect(response.status).toEqual(StatusCodes.BAD_REQUEST);
		expect(response.body).toEqual({
			jsonapi: {
				version: '1.1',
			},
			links: {
				self: '/users',
			},
			errors: [
				{
					status: StatusCodes.BAD_REQUEST,
					title: 'Bad Request',
					detail:
						'The data.attributes.email property must be a valid email address.',
				},
			],
		});
	});

	test('should return error when email is already taken', async () => {
		const response = await request
			.post('/users')
			.set('Accept', 'application/vnd.api+json')
			.send({
				data: {
					type: 'users',
					attributes: {
						first_name: user.first_name,
						last_name: user.last_name,
						email: user.email,
					},
				},
			});

		expect(response.status).toEqual(StatusCodes.BAD_REQUEST);
		expect(response.body).toEqual({
			jsonapi: {
				version: '1.1',
			},
			links: {
				self: '/users',
			},
			errors: [
				{
					status: StatusCodes.BAD_REQUEST,
					title: 'Bad Request',
					detail: 'The email has already been taken.',
				},
			],
		});
	});

	test('should create an user', async () => {
		const response = await request
			.post('/users')
			.set('Accept', 'application/vnd.api+json')
			.send({
				data: {
					type: 'users',
					attributes: {
						first_name: testUser.first_name,
						last_name: testUser.last_name,
						email: testUser.email,
					},
				},
			});

		expect(response.status).toEqual(StatusCodes.CREATED);
		expect(response.body).toHaveProperty('jsonapi.version', '1.1');
		expect(response.body).toHaveProperty('data.id');
		expect(response.body).toHaveProperty('data.type', 'users');
		expect(response.body).toHaveProperty(
			'data.attributes.first_name',
			testUser.first_name
		);
		expect(response.body).toHaveProperty(
			'data.attributes.last_name',
			testUser.last_name
		);
		expect(response.body).toHaveProperty('data.attributes.nickname');
		expect(response.body).toHaveProperty(
			'data.attributes.email',
			testUser.email
		);
		expect(response.body).toHaveProperty('data.attributes.photo', null);
		expect(response.body).toHaveProperty('data.attributes.avatar', null);
		expect(response.body).toHaveProperty('data.attributes.created_at');
		expect(response.body).toHaveProperty('data.attributes.updated_at');
	});
});

describe('GET /users', () => {
	test('should return users', async () => {
		const response = await request
			.get('/users')
			.set('Accept', 'application/vnd.api+json');

		expect(response.status).toEqual(StatusCodes.OK);
		expect(response.body).toHaveProperty('jsonapi.version', '1.1');
		expect(response.body).toHaveProperty('data[0].type', 'users');
		expect(response.body).toHaveProperty(
			'data[0].attributes.first_name',
			user.first_name
		);
		expect(response.body).toHaveProperty(
			'data[0].attributes.last_name',
			user.last_name
		);
		expect(response.body).toHaveProperty('data[0].attributes.nickname');
		expect(response.body).toHaveProperty(
			'data[0].attributes.email',
			user.email
		);
		expect(response.body).toHaveProperty('data[0].attributes.photo', null);
		expect(response.body).toHaveProperty('data[0].attributes.avatar', null);
		expect(response.body).toHaveProperty('data[0].attributes.created_at');
		expect(response.body).toHaveProperty('data[0].attributes.updated_at');
	});
});

describe('GET /users/{id}', () => {
	test('should return error when parameter is invalid', async () => {
		const response = await request
			.get('/users/invalid-id')
			.set('Accept', 'application/vnd.api+json');

		expect(response.status).toEqual(StatusCodes.BAD_REQUEST);
		expect(response.body).toEqual({
			jsonapi: {
				version: '1.1',
			},
			links: {
				self: '/users/invalid-id',
			},
			errors: [
				{
					status: StatusCodes.BAD_REQUEST,
					title: 'Bad Request',
					detail: 'Validation failed (uuid v4 is expected).',
				},
			],
		});
	});

	test('should return error when user is not found', async () => {
		const response = await request
			.get('/users/60677a98-a65e-4abc-831c-45dd76e8f990')
			.set('Accept', 'application/vnd.api+json');

		expect(response.status).toEqual(StatusCodes.NOT_FOUND);
		expect(response.body).toEqual({
			jsonapi: {
				version: '1.1',
			},
			links: {
				self: '/users/60677a98-a65e-4abc-831c-45dd76e8f990',
			},
			errors: [
				{
					status: StatusCodes.NOT_FOUND,
					title: 'Not Found',
					detail: 'The user is not found.',
				},
			],
		});
	});

	test('should return an user', async () => {
		const response = await request
			.get(`/users/${user.id}`)
			.set('Accept', 'application/vnd.api+json');

		expect(response.status).toEqual(StatusCodes.OK);
		expect(response.body).toHaveProperty('jsonapi.version', '1.1');
		expect(response.body).toHaveProperty('data.id', user.id);
		expect(response.body).toHaveProperty('data.type', 'users');
		expect(response.body).toHaveProperty(
			'data.attributes.first_name',
			user.first_name
		);
		expect(response.body).toHaveProperty(
			'data.attributes.last_name',
			user.last_name
		);
		expect(response.body).toHaveProperty('data.attributes.nickname');
		expect(response.body).toHaveProperty('data.attributes.email', user.email);
		expect(response.body).toHaveProperty('data.attributes.photo', null);
		expect(response.body).toHaveProperty('data.attributes.avatar', null);
		expect(response.body).toHaveProperty('data.attributes.created_at');
		expect(response.body).toHaveProperty('data.attributes.updated_at');
	});
});

describe('PATCH /users/{id}', () => {
	test('should return error when parameter is invalid', async () => {
		const response = await request
			.patch('/users/invalid-id')
			.set('Accept', 'application/vnd.api+json');

		expect(response.status).toEqual(StatusCodes.BAD_REQUEST);
		expect(response.body).toEqual({
			jsonapi: {
				version: '1.1',
			},
			links: {
				self: '/users/invalid-id',
			},
			errors: [
				{
					status: StatusCodes.BAD_REQUEST,
					title: 'Bad Request',
					detail: 'Validation failed (uuid v4 is expected).',
				},
			],
		});
	});

	test('should return error when user is not found', async () => {
		const response = await request
			.patch('/users/60677a98-a65e-4abc-831c-45dd76e8f990')
			.set('Accept', 'application/vnd.api+json')
			.send({
				data: {
					type: 'users',
				},
			});

		expect(response.status).toEqual(StatusCodes.NOT_FOUND);
		expect(response.body).toEqual({
			jsonapi: {
				version: '1.1',
			},
			links: {
				self: '/users/60677a98-a65e-4abc-831c-45dd76e8f990',
			},
			errors: [
				{
					status: StatusCodes.NOT_FOUND,
					title: ReasonPhrases.NOT_FOUND,
					detail: 'The user is not found.',
				},
			],
		});
	});

	test('should return error when name is null', async () => {
		const response = await request
			.patch(`/users/${user.id}`)
			.set('Accept', 'application/vnd.api+json')
			.send({
				data: {
					type: 'users',
					attributes: {
						first_name: null,
					},
				},
			});

		expect(response.status).toEqual(StatusCodes.BAD_REQUEST);
		expect(response.body).toEqual({
			jsonapi: {
				version: '1.1',
			},
			links: {
				self: `/users/${user.id}`,
			},
			errors: [
				{
					status: StatusCodes.BAD_REQUEST,
					title: 'Bad Request',
					detail: 'The data.attributes.first_name must be a string.',
				},
			],
		});
	});

	test('should return error when name is empty', async () => {
		const response = await request
			.patch(`/users/${user.id}`)
			.set('Accept', 'application/vnd.api+json')
			.send({
				data: {
					type: 'users',
					attributes: {
						first_name: '',
					},
				},
			});

		expect(response.status).toEqual(StatusCodes.BAD_REQUEST);
		expect(response.body).toEqual({
			jsonapi: {
				version: '1.1',
			},
			links: {
				self: `/users/${user.id}`,
			},
			errors: [
				{
					status: StatusCodes.BAD_REQUEST,
					title: 'Bad Request',
					detail: 'The data.attributes.first_name field must have a value.',
				},
			],
		});
	});

	test('should return error when name is invalid', async () => {
		const response = await request
			.patch(`/users/${user.id}`)
			.set('Accept', 'application/vnd.api+json')
			.send({
				data: {
					type: 'users',
					attributes: {
						first_name: 12345,
					},
				},
			});

		expect(response.status).toEqual(StatusCodes.BAD_REQUEST);
		expect(response.body).toEqual({
			jsonapi: {
				version: '1.1',
			},
			links: {
				self: `/users/${user.id}`,
			},
			errors: [
				{
					status: StatusCodes.BAD_REQUEST,
					title: 'Bad Request',
					detail: 'The data.attributes.first_name must be a string.',
				},
			],
		});
	});

	test('should ok when username is null', async () => {
		const response = await request
			.patch(`/users/${user.id}`)
			.set('Accept', 'application/vnd.api+json')
			.send({
				data: {
					type: 'users',
					attributes: {
						nickname: null,
					},
				},
			});

		expect(response.status).toEqual(StatusCodes.OK);
		expect(response.body).toHaveProperty('jsonapi.version', '1.1');
		expect(response.body).toHaveProperty('data.id', user.id);
		expect(response.body).toHaveProperty('data.type', 'users');
		expect(response.body).toHaveProperty(
			'data.attributes.first_name',
			user.first_name
		);
		expect(response.body).toHaveProperty(
			'data.attributes.last_name',
			user.last_name
		);
		expect(response.body).toHaveProperty('data.attributes.nickname', null);
		expect(response.body).toHaveProperty('data.attributes.email', user.email);
		expect(response.body).toHaveProperty('data.attributes.photo', null);
		expect(response.body).toHaveProperty('data.attributes.avatar', null);
		expect(response.body).toHaveProperty('data.attributes.created_at');
		expect(response.body).toHaveProperty('data.attributes.updated_at');
	});

	test('should ok when username is empty', async () => {
		const response = await request
			.patch(`/users/${user.id}`)
			.set('Accept', 'application/vnd.api+json')
			.send({
				data: {
					type: 'users',
					attributes: {
						nickname: '',
					},
				},
			});

		expect(response.status).toEqual(StatusCodes.OK);
		expect(response.body).toHaveProperty('jsonapi.version', '1.1');
		expect(response.body).toHaveProperty('data.id', user.id);
		expect(response.body).toHaveProperty('data.type', 'users');
		expect(response.body).toHaveProperty(
			'data.attributes.first_name',
			user.first_name
		);
		expect(response.body).toHaveProperty(
			'data.attributes.last_name',
			user.last_name
		);
		expect(response.body).toHaveProperty('data.attributes.nickname', null);
		expect(response.body).toHaveProperty('data.attributes.email', user.email);
		expect(response.body).toHaveProperty('data.attributes.photo', null);
		expect(response.body).toHaveProperty('data.attributes.avatar', null);
		expect(response.body).toHaveProperty('data.attributes.created_at');
		expect(response.body).toHaveProperty('data.attributes.updated_at');
	});

	test('should return error when email is null', async () => {
		const response = await request
			.patch(`/users/${user.id}`)
			.set('Accept', 'application/vnd.api+json')
			.send({
				data: {
					type: 'users',
					attributes: {
						email: null,
					},
				},
			});

		expect(response.status).toEqual(StatusCodes.BAD_REQUEST);
		expect(response.body).toEqual({
			jsonapi: {
				version: '1.1',
			},
			links: {
				self: `/users/${user.id}`,
			},
			errors: [
				{
					status: StatusCodes.BAD_REQUEST,
					title: 'Bad Request',
					detail: 'The data.attributes.email must be a string.',
				},
			],
		});
	});

	test('should return error when email is empty', async () => {
		const response = await request
			.patch(`/users/${user.id}`)
			.set('Accept', 'application/vnd.api+json')
			.send({
				data: {
					type: 'users',
					attributes: {
						email: '',
					},
				},
			});

		expect(response.status).toEqual(StatusCodes.BAD_REQUEST);
		expect(response.body).toEqual({
			jsonapi: {
				version: '1.1',
			},
			links: {
				self: `/users/${user.id}`,
			},
			errors: [
				{
					status: StatusCodes.BAD_REQUEST,
					title: 'Bad Request',
					detail: 'The data.attributes.email must be a valid email address.',
				},
			],
		});
	});

	test('should return error when email is invalid', async () => {
		const response = await request
			.patch(`/users/${user.id}`)
			.set('Accept', 'application/vnd.api+json')
			.send({
				data: {
					type: 'users',
					attributes: {
						email: 12345,
					},
				},
			});

		expect(response.status).toEqual(StatusCodes.BAD_REQUEST);
		expect(response.body).toEqual({
			jsonapi: {
				version: '1.1',
			},
			links: {
				self: `/users/${user.id}`,
			},
			errors: [
				{
					status: StatusCodes.BAD_REQUEST,
					title: 'Bad Request',
					detail: 'The data.attributes.email must be a string.',
				},
			],
		});
	});

	test('should return error when email is invalid', async () => {
		const response = await request
			.patch(`/users/${user.id}`)
			.set('Accept', 'application/vnd.api+json')
			.send({
				data: {
					type: 'users',
					attributes: {
						email: 'johndoe',
					},
				},
			});

		expect(response.status).toEqual(StatusCodes.BAD_REQUEST);
		expect(response.body).toEqual({
			jsonapi: {
				version: '1.1',
			},
			links: {
				self: `/users/${user.id}`,
			},
			errors: [
				{
					status: StatusCodes.BAD_REQUEST,
					title: 'Bad Request',
					detail: 'The data.attributes.email must be a valid email address.',
				},
			],
		});
	});

	test('should not update an user', async () => {
		const response = await request
			.patch(`/users/${user.id}`)
			.set('Accept', 'application/vnd.api+json')
			.send({
				data: {
					type: 'users',
				},
			});

		expect(response.status).toEqual(StatusCodes.OK);
		expect(response.body).toHaveProperty('jsonapi.version', '1.1');
		expect(response.body).toHaveProperty('data.id', user.id);
		expect(response.body).toHaveProperty('data.type', 'users');
		expect(response.body).toHaveProperty(
			'data.attributes.first_name',
			user.first_name
		);
		expect(response.body).toHaveProperty(
			'data.attributes.last_name',
			user.last_name
		);
		expect(response.body).toHaveProperty('data.attributes.nickname');
		expect(response.body).toHaveProperty('data.attributes.email', user.email);
		expect(response.body).toHaveProperty('data.attributes.photo', null);
		expect(response.body).toHaveProperty('data.attributes.avatar', null);
		expect(response.body).toHaveProperty('data.attributes.created_at');
		expect(response.body).toHaveProperty('data.attributes.updated_at');
	});
});
