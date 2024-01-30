import { StatusCodes } from 'http-status-codes';
import { request } from './setup';
import { close } from './teardown';

afterAll(async () => {
	await close();
});

describe('GET /', () => {
	test('should return hello world', async () => {
		const response = await request
			.get('/')
			.set('Accept', 'application/vnd.api+json');

		expect(response.status).toEqual(StatusCodes.OK);
		expect(response.body).toEqual('Hello world!');
	});
});

describe('GET /404', () => {
	test('should return not found error', async () => {
		const response = await request
			.get('/404')
			.set('Accept', 'application/vnd.api+json');

		expect(response.status).toEqual(StatusCodes.NOT_FOUND);
		expect(response.body).toEqual({
			jsonapi: {
				version: '1.1',
			},
			links: {
				self: '/404',
			},
			errors: [
				{
					status: StatusCodes.NOT_FOUND,
					title: 'Not Found',
					detail: 'Resource not found.',
				},
			],
		});
	});
});
