import type {
	BearerTokenError,
	JsonApiError,
} from '../src/adapters/interfaces/http.interface';
import { logIn, request } from './setup';
import { close } from './teardown';

let accessToken: string;

beforeAll(async () => {
	const { accessToken: access } = await logIn();

	accessToken = access;
});

afterAll(async () => {
	await close();
});

describe('GET /', () => {
	test('should return unauthorized error if authorization header missing', async () => {
		const response = await request
			.get('/')
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
			.get('/')
			.set('Accept', 'application/vnd.api+json')
			.auth('', { type: 'bearer' });

		expect(response.status).toEqual<number>(401);
		expect(response.body).toEqual<BearerTokenError>({
			error: 'invalid_token',
			error_description: 'The token is malformed.',
		});
	});

	test('should return hello world', async () => {
		const response = await request
			.get('/')
			.set('Accept', 'application/vnd.api+json')
			.auth(accessToken, { type: 'bearer' });

		expect(response.status).toEqual<number>(200);
		expect(response.body).toEqual<string>('Hello world!');
	});
});

describe('GET /404', () => {
	test('should return not found error', async () => {
		const response = await request
			.get('/404')
			.set('Accept', 'application/vnd.api+json');

		expect(response.status).toEqual<number>(404);
		expect(response.body).toEqual<JsonApiError>({
			jsonapi: { version: '1.0' },
			links: {
				self: '/404',
			},
			errors: [
				{
					status: 404,
					title: 'Not Found',
					detail: 'Resource not found.',
				},
			],
		});
	});
});
