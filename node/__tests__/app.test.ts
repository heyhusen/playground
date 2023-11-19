import { afterAll, describe, expect, test } from 'vitest';
import type { JsonApiError } from '../src/adapters/interfaces/http.interface';
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
