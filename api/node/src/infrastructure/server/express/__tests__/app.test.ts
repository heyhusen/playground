import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import { teardown } from '../../../../../__tests__/teardown';
import { IJsonApiError } from '../../../../presentation/interfaces/http.interface';
import { SupertestResponse, request } from './setup';

afterAll(async () => {
	await teardown();
});

describe('GET /', () => {
	test('should return hello world', async () => {
		const response: SupertestResponse<string> = await request
			.get('/')
			.set('Accept', 'application/vnd.api+json');

		expect<number>(response.status).toStrictEqual<StatusCodes>(StatusCodes.OK);
		expect<string>(response.body).toStrictEqual<string>('Hello world!');
	});
});

describe('GET /404', () => {
	test('should return not found error', async () => {
		const response: SupertestResponse<IJsonApiError> = await request
			.get('/404')
			.set('Accept', 'application/vnd.api+json');

		expect<number>(response.status).toStrictEqual<StatusCodes>(
			StatusCodes.NOT_FOUND
		);
		expect<IJsonApiError>(response.body).toStrictEqual<IJsonApiError>({
			jsonapi: {
				version: '1.1',
			},
			errors: [
				{
					status: StatusCodes.NOT_FOUND.toString(),
					title: ReasonPhrases.NOT_FOUND,
					detail: ReasonPhrases.NOT_FOUND,
				},
			],
		});
	});
});
