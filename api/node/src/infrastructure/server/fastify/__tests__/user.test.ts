import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import { DataDocument } from 'ts-japi';
import { setup, testUser, user } from '../../../../../__tests__/setup.js';
import { teardown } from '../../../../../__tests__/teardown.js';
import { getMessage } from '../../../../domain/helpers/get-message.helper.js';
import { UserEntity } from '../../../../domain/modules/users/commands/entities/user.entity.js';
import {
	IJsonApiError,
	IJsonApiPagination,
} from '../../../../presentation/interfaces/http.interface.js';
import { SupertestResponse, ready, request } from './setup.js';

/** Updates are version-guarded, so fetch the current version before each write. */
async function currentVersion(): Promise<number> {
	const response: SupertestResponse<DataDocument<UserEntity>> = await request
		.get(`/users/${user.id}`)
		.set('Accept', 'application/vnd.api+json');

	const data = response.body.data as unknown as { attributes: UserEntity };

	return data.attributes.version;
}

beforeAll(async () => {
	await ready;
	await setup();
});

afterAll(async () => {
	await teardown();
});

describe('POST /users', () => {
	test('should return error when request body empty', async () => {
		const response: SupertestResponse<IJsonApiError> = await request
			.post('/users')
			.set('Accept', 'application/vnd.api+json');

		expect<number>(response.status).toStrictEqual<StatusCodes>(
			StatusCodes.UNPROCESSABLE_ENTITY
		);
		expect<IJsonApiError>(response.body).toStrictEqual<IJsonApiError>({
			jsonapi: {
				version: '1.1',
			},
			errors: [
				{
					status: StatusCodes.UNPROCESSABLE_ENTITY.toString(),
					title: ReasonPhrases.UNPROCESSABLE_ENTITY,
					detail: getMessage('body.required'),
				},
			],
		});
	});

	test('should return error when request body empty object', async () => {
		const response: SupertestResponse<IJsonApiError> = await request
			.post('/users')
			.set('Accept', 'application/vnd.api+json')
			.send({});

		expect<number>(response.status).toStrictEqual<StatusCodes>(
			StatusCodes.UNPROCESSABLE_ENTITY
		);
		expect<IJsonApiError>(response.body).toStrictEqual<IJsonApiError>({
			jsonapi: {
				version: '1.1',
			},
			errors: [
				{
					status: StatusCodes.UNPROCESSABLE_ENTITY.toString(),
					title: ReasonPhrases.UNPROCESSABLE_ENTITY,
					detail: getMessage('data.required'),
				},
			],
		});
	});

	test('should return error when email is invalid', async () => {
		const response: SupertestResponse<IJsonApiError> = await request
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

		expect<number>(response.status).toStrictEqual<StatusCodes>(
			StatusCodes.UNPROCESSABLE_ENTITY
		);
		expect<IJsonApiError>(response.body).toStrictEqual<IJsonApiError>({
			jsonapi: {
				version: '1.1',
			},
			errors: [
				{
					status: StatusCodes.UNPROCESSABLE_ENTITY.toString(),
					title: ReasonPhrases.UNPROCESSABLE_ENTITY,
					detail: getMessage('data.attributes.email.format'),
				},
			],
		});
	});

	test('should return error when email is already taken', async () => {
		const response: SupertestResponse<IJsonApiError> = await request
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

		expect<number>(response.status).toStrictEqual<StatusCodes>(
			StatusCodes.BAD_REQUEST
		);
		expect<IJsonApiError>(response.body).toStrictEqual<IJsonApiError>({
			jsonapi: {
				version: '1.1',
			},
			errors: [
				{
					status: StatusCodes.BAD_REQUEST.toString(),
					title: ReasonPhrases.BAD_REQUEST,
					detail: getMessage('email.unique'),
				},
			],
		});
	});

	test('should create an user', async () => {
		const response: SupertestResponse<DataDocument<UserEntity>> = await request
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

		expect<number>(response.status).toStrictEqual<StatusCodes>(
			StatusCodes.CREATED
		);
		expect<DataDocument<UserEntity>>(response.body).toHaveProperty(
			'jsonapi.version',
			'1.1'
		);
		expect<DataDocument<UserEntity>>(response.body).toHaveProperty<string>(
			'data.id'
		);
		expect<DataDocument<UserEntity>>(response.body).toHaveProperty<string>(
			'data.type',
			'users'
		);
		expect<DataDocument<UserEntity>>(response.body).toHaveProperty<string>(
			'data.attributes.first_name',
			testUser.first_name
		);
		expect<DataDocument<UserEntity>>(response.body).toHaveProperty<string>(
			'data.attributes.last_name',
			String(testUser.last_name)
		);
		expect<DataDocument<UserEntity>>(response.body).toHaveProperty<string>(
			'data.attributes.nickname'
		);
		expect<DataDocument<UserEntity>>(response.body).toHaveProperty<string>(
			'data.attributes.email',
			testUser.email
		);
		expect<DataDocument<UserEntity>>(response.body).toHaveProperty<string>(
			'data.attributes.created_at'
		);
		expect<DataDocument<UserEntity>>(response.body).toHaveProperty<string>(
			'data.attributes.updated_at'
		);
	});
});

describe('GET /users', () => {
	test('should return error when query parameter is empty', async () => {
		const response: SupertestResponse<IJsonApiError> = await request
			.get('/users')
			.set('Accept', 'application/vnd.api+json');

		expect<number>(response.status).toStrictEqual<StatusCodes>(
			StatusCodes.UNPROCESSABLE_ENTITY
		);
		expect<IJsonApiError>(response.body).toStrictEqual<IJsonApiError>({
			jsonapi: {
				version: '1.1',
			},
			errors: [
				{
					status: StatusCodes.UNPROCESSABLE_ENTITY.toString(),
					title: ReasonPhrases.UNPROCESSABLE_ENTITY,
					detail: getMessage('page.required'),
				},
			],
		});
	});

	test('should return error when page query parameter is empty', async () => {
		const response: SupertestResponse<IJsonApiError> = await request
			.get('/users')
			.query({
				page: null,
			})
			.set('Accept', 'application/vnd.api+json');

		expect<number>(response.status).toStrictEqual<StatusCodes>(
			StatusCodes.UNPROCESSABLE_ENTITY
		);
		expect<IJsonApiError>(response.body).toStrictEqual<IJsonApiError>({
			jsonapi: {
				version: '1.1',
			},
			errors: [
				{
					status: StatusCodes.UNPROCESSABLE_ENTITY.toString(),
					title: ReasonPhrases.UNPROCESSABLE_ENTITY,
					detail: getMessage('page.type'),
				},
			],
		});
	});

	test('should return error when page number query parameter is mising', async () => {
		const response: SupertestResponse<IJsonApiError> = await request
			.get('/users')
			.query({
				page: {
					size: 10,
				},
			})
			.set('Accept', 'application/vnd.api+json');

		expect<number>(response.status).toStrictEqual<StatusCodes>(
			StatusCodes.UNPROCESSABLE_ENTITY
		);
		expect<IJsonApiError>(response.body).toStrictEqual<IJsonApiError>({
			jsonapi: {
				version: '1.1',
			},
			errors: [
				{
					status: StatusCodes.UNPROCESSABLE_ENTITY.toString(),
					title: ReasonPhrases.UNPROCESSABLE_ENTITY,
					detail: getMessage('page.number.required'),
				},
			],
		});
	});

	test('should return error when page size query parameter is mising', async () => {
		const response: SupertestResponse<IJsonApiError> = await request
			.get('/users')
			.query({
				page: {
					number: 10,
				},
			})
			.set('Accept', 'application/vnd.api+json');

		expect<number>(response.status).toStrictEqual<StatusCodes>(
			StatusCodes.UNPROCESSABLE_ENTITY
		);
		expect<IJsonApiError>(response.body).toStrictEqual<IJsonApiError>({
			jsonapi: {
				version: '1.1',
			},
			errors: [
				{
					status: StatusCodes.UNPROCESSABLE_ENTITY.toString(),
					title: ReasonPhrases.UNPROCESSABLE_ENTITY,
					detail: getMessage('page.size.required'),
				},
			],
		});
	});

	test('should return error when page size & number query parameter is wrong type', async () => {
		const response: SupertestResponse<IJsonApiError> = await request
			.get('/users')
			.query({
				page: {
					number: null,
					size: null,
				},
			})
			.set('Accept', 'application/vnd.api+json');

		expect<number>(response.status).toStrictEqual<StatusCodes>(
			StatusCodes.UNPROCESSABLE_ENTITY
		);
		expect<IJsonApiError>(response.body).toStrictEqual<IJsonApiError>({
			jsonapi: {
				version: '1.1',
			},
			errors: [
				{
					status: StatusCodes.UNPROCESSABLE_ENTITY.toString(),
					title: ReasonPhrases.UNPROCESSABLE_ENTITY,
					detail: getMessage('page.number.type'),
				},
				{
					status: StatusCodes.UNPROCESSABLE_ENTITY.toString(),
					title: ReasonPhrases.UNPROCESSABLE_ENTITY,
					detail: getMessage('page.size.type'),
				},
			],
		});
	});

	test('should return users', async () => {
		const params: IJsonApiPagination = {
			page: {
				number: 1,
				size: 10,
			},
			filter: {},
		};

		const response: SupertestResponse<DataDocument<UserEntity[]>> =
			await request
				.get('/users')
				.query(params)
				.set('Accept', 'application/vnd.api+json');

		expect<number>(response.status).toStrictEqual<StatusCodes>(StatusCodes.OK);
		expect<DataDocument<UserEntity[]>>(response.body).toHaveProperty<string>(
			'jsonapi.version',
			'1.1'
		);
		expect<DataDocument<UserEntity[]>>(response.body).toHaveProperty<string>(
			'data[0].type',
			'users'
		);
		expect<DataDocument<UserEntity[]>>(response.body).toHaveProperty<string>(
			'data[0].attributes.first_name',
			user.first_name
		);
		expect<DataDocument<UserEntity[]>>(response.body).toHaveProperty<string>(
			'data[0].attributes.last_name',
			String(user.last_name)
		);
		expect<DataDocument<UserEntity[]>>(response.body).toHaveProperty<string>(
			'data[0].attributes.nickname'
		);
		expect<DataDocument<UserEntity[]>>(response.body).toHaveProperty<string>(
			'data[0].attributes.email',
			user.email
		);
		expect<DataDocument<UserEntity[]>>(response.body).toHaveProperty<string>(
			'data[0].attributes.created_at'
		);
		expect<DataDocument<UserEntity[]>>(response.body).toHaveProperty<string>(
			'data[0].attributes.updated_at'
		);
	});
});

describe('GET /users/{id}', () => {
	test('should return error when parameter is invalid', async () => {
		const response: SupertestResponse<IJsonApiError> = await request
			.get('/users/invalid-id')
			.set('Accept', 'application/vnd.api+json');

		expect<number>(response.status).toStrictEqual<StatusCodes>(
			StatusCodes.UNPROCESSABLE_ENTITY
		);
		expect<IJsonApiError>(response.body).toStrictEqual<IJsonApiError>({
			jsonapi: {
				version: '1.1',
			},
			errors: [
				{
					status: StatusCodes.UNPROCESSABLE_ENTITY.toString(),
					title: ReasonPhrases.UNPROCESSABLE_ENTITY,
					detail: getMessage('id.format'),
				},
			],
		});
	});

	test('should return error when user is not found', async () => {
		const response: SupertestResponse<IJsonApiError> = await request
			.get('/users/60677a98-a65e-7abc-831c-45dd76e8f990')
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
					detail: getMessage('user.exist'),
				},
			],
		});
	});

	test('should return an user', async () => {
		const response: SupertestResponse<DataDocument<UserEntity>> = await request
			.get(`/users/${user.id}`)
			.set('Accept', 'application/vnd.api+json');

		expect<number>(response.status).toStrictEqual<StatusCodes>(StatusCodes.OK);
		expect<DataDocument<UserEntity>>(response.body).toHaveProperty<string>(
			'jsonapi.version',
			'1.1'
		);
		expect<DataDocument<UserEntity>>(response.body).toHaveProperty<string>(
			'data.id',
			user.id
		);
		expect<DataDocument<UserEntity>>(response.body).toHaveProperty<string>(
			'data.type',
			'users'
		);
		expect<DataDocument<UserEntity>>(response.body).toHaveProperty<string>(
			'data.attributes.first_name',
			user.first_name
		);
		expect<DataDocument<UserEntity>>(response.body).toHaveProperty<string>(
			'data.attributes.last_name',
			String(user.last_name)
		);
		expect<DataDocument<UserEntity>>(response.body).toHaveProperty<string>(
			'data.attributes.nickname'
		);
		expect<DataDocument<UserEntity>>(response.body).toHaveProperty<string>(
			'data.attributes.email',
			user.email
		);
		expect<DataDocument<UserEntity>>(response.body).toHaveProperty<string>(
			'data.attributes.created_at'
		);
		expect<DataDocument<UserEntity>>(response.body).toHaveProperty<string>(
			'data.attributes.updated_at'
		);
	});
});

describe('PATCH /users/{id}', () => {
	test('should return error when parameter is invalid', async () => {
		const response: SupertestResponse<IJsonApiError> = await request
			.patch('/users/invalid-id')
			.set('Accept', 'application/vnd.api+json');

		expect<number>(response.status).toStrictEqual<StatusCodes>(
			StatusCodes.UNPROCESSABLE_ENTITY
		);
		expect<IJsonApiError>(response.body).toStrictEqual<IJsonApiError>({
			jsonapi: {
				version: '1.1',
			},
			errors: [
				{
					status: StatusCodes.UNPROCESSABLE_ENTITY.toString(),
					title: ReasonPhrases.UNPROCESSABLE_ENTITY,
					detail: getMessage('id.format'),
				},
			],
		});
	});

	test('should return error when user is not found', async () => {
		const response: SupertestResponse<IJsonApiError> = await request
			.patch('/users/60677a98-a65e-7abc-831c-45dd76e8f990')
			.set('Accept', 'application/vnd.api+json')
			.send({
				data: {
					type: 'users',
					attributes: {
						version: await currentVersion(),
					},
				},
			});

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
					detail: getMessage('user.exist'),
				},
			],
		});
	});

	test('should return error when name is null', async () => {
		const response: SupertestResponse<IJsonApiError> = await request
			.patch(`/users/${user.id}`)
			.set('Accept', 'application/vnd.api+json')
			.send({
				data: {
					type: 'users',
					attributes: {
						version: await currentVersion(),
						first_name: null,
					},
				},
			});

		expect<number>(response.status).toStrictEqual<StatusCodes>(
			StatusCodes.UNPROCESSABLE_ENTITY
		);
		expect<IJsonApiError>(response.body).toStrictEqual<IJsonApiError>({
			jsonapi: {
				version: '1.1',
			},
			errors: [
				{
					status: StatusCodes.UNPROCESSABLE_ENTITY.toString(),
					title: ReasonPhrases.UNPROCESSABLE_ENTITY,
					detail: getMessage('data.attributes.first_name.type'),
				},
			],
		});
	});

	test('should return error when name is empty', async () => {
		const response: SupertestResponse<IJsonApiError> = await request
			.patch(`/users/${user.id}`)
			.set('Accept', 'application/vnd.api+json')
			.send({
				data: {
					type: 'users',
					attributes: {
						version: await currentVersion(),
						first_name: '',
					},
				},
			});

		expect<number>(response.status).toStrictEqual<StatusCodes>(
			StatusCodes.UNPROCESSABLE_ENTITY
		);
		expect<IJsonApiError>(response.body).toStrictEqual<IJsonApiError>({
			jsonapi: {
				version: '1.1',
			},
			errors: [
				{
					status: StatusCodes.UNPROCESSABLE_ENTITY.toString(),
					title: ReasonPhrases.UNPROCESSABLE_ENTITY,
					detail: getMessage('data.attributes.first_name.minLength'),
				},
			],
		});
	});

	test('should return error when name is invalid', async () => {
		const response: SupertestResponse<IJsonApiError> = await request
			.patch(`/users/${user.id}`)
			.set('Accept', 'application/vnd.api+json')
			.send({
				data: {
					type: 'users',
					attributes: {
						version: await currentVersion(),
						first_name: 12345,
					},
				},
			});

		expect<number>(response.status).toStrictEqual<StatusCodes>(
			StatusCodes.UNPROCESSABLE_ENTITY
		);
		expect<IJsonApiError>(response.body).toStrictEqual<IJsonApiError>({
			jsonapi: {
				version: '1.1',
			},
			errors: [
				{
					status: StatusCodes.UNPROCESSABLE_ENTITY.toString(),
					title: ReasonPhrases.UNPROCESSABLE_ENTITY,
					detail: getMessage('data.attributes.first_name.type'),
				},
			],
		});
	});

	test('should ok when username is null', async () => {
		const response: SupertestResponse<DataDocument<UserEntity>> = await request
			.patch(`/users/${user.id}`)
			.set('Accept', 'application/vnd.api+json')
			.send({
				data: {
					type: 'users',
					attributes: {
						version: await currentVersion(),
						nickname: null,
					},
				},
			});

		expect<number>(response.status).toStrictEqual<StatusCodes>(StatusCodes.OK);
		expect<DataDocument<UserEntity>>(response.body).toHaveProperty<string>(
			'jsonapi.version',
			'1.1'
		);
		expect<DataDocument<UserEntity>>(response.body).toHaveProperty<string>(
			'data.id',
			user.id
		);
		expect<DataDocument<UserEntity>>(response.body).toHaveProperty<string>(
			'data.type',
			'users'
		);
		expect<DataDocument<UserEntity>>(response.body).toHaveProperty<string>(
			'data.attributes.first_name',
			user.first_name
		);
		expect<DataDocument<UserEntity>>(response.body).toHaveProperty<string>(
			'data.attributes.last_name',
			String(user.last_name)
		);
		expect<DataDocument<UserEntity>>(response.body).toHaveProperty<null>(
			'data.attributes.nickname',
			null
		);
		expect<DataDocument<UserEntity>>(response.body).toHaveProperty<string>(
			'data.attributes.email',
			user.email
		);
		expect<DataDocument<UserEntity>>(response.body).toHaveProperty<string>(
			'data.attributes.created_at'
		);
		expect<DataDocument<UserEntity>>(response.body).toHaveProperty<string>(
			'data.attributes.updated_at'
		);
	});

	test('should ok when username is empty', async () => {
		const response: SupertestResponse<DataDocument<UserEntity>> = await request
			.patch(`/users/${user.id}`)
			.set('Accept', 'application/vnd.api+json')
			.send({
				data: {
					type: 'users',
					attributes: {
						version: await currentVersion(),
						nickname: '',
					},
				},
			});

		expect<number>(response.status).toStrictEqual<StatusCodes>(StatusCodes.OK);
		expect<DataDocument<UserEntity>>(response.body).toHaveProperty<string>(
			'jsonapi.version',
			'1.1'
		);
		expect<DataDocument<UserEntity>>(response.body).toHaveProperty<string>(
			'data.id',
			user.id
		);
		expect<DataDocument<UserEntity>>(response.body).toHaveProperty<string>(
			'data.type',
			'users'
		);
		expect<DataDocument<UserEntity>>(response.body).toHaveProperty<string>(
			'data.attributes.first_name',
			user.first_name
		);
		expect<DataDocument<UserEntity>>(response.body).toHaveProperty<string>(
			'data.attributes.last_name',
			String(user.last_name)
		);
		expect<DataDocument<UserEntity>>(response.body).toHaveProperty(
			'data.attributes.nickname',
			''
		);
		expect<DataDocument<UserEntity>>(response.body).toHaveProperty<string>(
			'data.attributes.email',
			user.email
		);
		expect<DataDocument<UserEntity>>(response.body).toHaveProperty<string>(
			'data.attributes.created_at'
		);
		expect<DataDocument<UserEntity>>(response.body).toHaveProperty<string>(
			'data.attributes.updated_at'
		);
	});

	test('should return error when email is null', async () => {
		const response: SupertestResponse<IJsonApiError> = await request
			.patch(`/users/${user.id}`)
			.set('Accept', 'application/vnd.api+json')
			.send({
				data: {
					type: 'users',
					attributes: {
						version: await currentVersion(),
						email: null,
					},
				},
			});

		expect<number>(response.status).toStrictEqual<StatusCodes>(
			StatusCodes.UNPROCESSABLE_ENTITY
		);
		expect<IJsonApiError>(response.body).toStrictEqual<IJsonApiError>({
			jsonapi: {
				version: '1.1',
			},
			errors: [
				{
					status: StatusCodes.UNPROCESSABLE_ENTITY.toString(),
					title: ReasonPhrases.UNPROCESSABLE_ENTITY,
					detail: getMessage('data.attributes.email.format'),
				},
			],
		});
	});

	test('should return error when email is empty', async () => {
		const response: SupertestResponse<IJsonApiError> = await request
			.patch(`/users/${user.id}`)
			.set('Accept', 'application/vnd.api+json')
			.send({
				data: {
					type: 'users',
					attributes: {
						version: await currentVersion(),
						email: '',
					},
				},
			});

		expect<number>(response.status).toStrictEqual<StatusCodes>(
			StatusCodes.UNPROCESSABLE_ENTITY
		);
		expect<IJsonApiError>(response.body).toStrictEqual<IJsonApiError>({
			jsonapi: {
				version: '1.1',
			},
			errors: [
				{
					status: StatusCodes.UNPROCESSABLE_ENTITY.toString(),
					title: ReasonPhrases.UNPROCESSABLE_ENTITY,
					detail: getMessage('data.attributes.email.format'),
				},
				{
					status: StatusCodes.UNPROCESSABLE_ENTITY.toString(),
					title: ReasonPhrases.UNPROCESSABLE_ENTITY,
					detail: getMessage('data.attributes.email.required'),
				},
			],
		});
	});

	test('should return error when email is invalid', async () => {
		const response: SupertestResponse<IJsonApiError> = await request
			.patch(`/users/${user.id}`)
			.set('Accept', 'application/vnd.api+json')
			.send({
				data: {
					type: 'users',
					attributes: {
						version: await currentVersion(),
						email: 12345,
					},
				},
			});

		expect<number>(response.status).toStrictEqual<StatusCodes>(
			StatusCodes.UNPROCESSABLE_ENTITY
		);
		expect<IJsonApiError>(response.body).toStrictEqual<IJsonApiError>({
			jsonapi: {
				version: '1.1',
			},
			errors: [
				{
					status: StatusCodes.UNPROCESSABLE_ENTITY.toString(),
					title: ReasonPhrases.UNPROCESSABLE_ENTITY,
					detail: getMessage('data.attributes.email.format'),
				},
			],
		});
	});

	test('should return error when email is invalid', async () => {
		const response: SupertestResponse<IJsonApiError> = await request
			.patch(`/users/${user.id}`)
			.set('Accept', 'application/vnd.api+json')
			.send({
				data: {
					type: 'users',
					attributes: {
						version: await currentVersion(),
						email: 'johndoe',
					},
				},
			});

		expect<number>(response.status).toStrictEqual<StatusCodes>(
			StatusCodes.UNPROCESSABLE_ENTITY
		);
		expect<IJsonApiError>(response.body).toStrictEqual<IJsonApiError>({
			jsonapi: {
				version: '1.1',
			},
			errors: [
				{
					status: StatusCodes.UNPROCESSABLE_ENTITY.toString(),
					title: ReasonPhrases.UNPROCESSABLE_ENTITY,
					detail: getMessage('data.attributes.email.format'),
				},
			],
		});
	});

	test('should not update an user', async () => {
		const response: SupertestResponse<DataDocument<UserEntity>> = await request
			.patch(`/users/${user.id}`)
			.set('Accept', 'application/vnd.api+json')
			.send({
				data: {
					type: 'users',
					attributes: {
						version: await currentVersion(),
					},
				},
			});

		expect<number>(response.status).toStrictEqual<StatusCodes>(StatusCodes.OK);
		expect<DataDocument<UserEntity>>(response.body).toHaveProperty<string>(
			'jsonapi.version',
			'1.1'
		);
		expect<DataDocument<UserEntity>>(response.body).toHaveProperty<string>(
			'data.id',
			user.id
		);
		expect<DataDocument<UserEntity>>(response.body).toHaveProperty<string>(
			'data.type',
			'users'
		);
		expect<DataDocument<UserEntity>>(response.body).toHaveProperty<string>(
			'data.attributes.first_name',
			user.first_name
		);
		expect<DataDocument<UserEntity>>(response.body).toHaveProperty<string>(
			'data.attributes.last_name',
			String(user.last_name)
		);
		expect<DataDocument<UserEntity>>(response.body).toHaveProperty<string>(
			'data.attributes.nickname'
		);
		expect<DataDocument<UserEntity>>(response.body).toHaveProperty<string>(
			'data.attributes.email',
			user.email
		);
		expect<DataDocument<UserEntity>>(response.body).toHaveProperty<string>(
			'data.attributes.created_at'
		);
		expect<DataDocument<UserEntity>>(response.body).toHaveProperty<string>(
			'data.attributes.updated_at'
		);
	});
	test('should ignore a missing version and still increment it', async () => {
		const version = await currentVersion();

		const response: SupertestResponse<DataDocument<UserEntity>> = await request
			.patch(`/users/${user.id}`)
			.set('Accept', 'application/vnd.api+json')
			.send({
				data: {
					type: 'users',
					attributes: {
						nickname: 'no-version',
					},
				},
			});

		expect<number>(response.status).toStrictEqual<StatusCodes>(StatusCodes.OK);
		const data = response.body.data as unknown as { attributes: UserEntity };
		expect<number>(data.attributes.version).toStrictEqual(version + 1);
	});

	test('should return error when version is not a positive integer', async () => {
		const response: SupertestResponse<IJsonApiError> = await request
			.patch(`/users/${user.id}`)
			.set('Accept', 'application/vnd.api+json')
			.send({
				data: {
					type: 'users',
					attributes: {
						version: 0,
					},
				},
			});

		expect<number>(response.status).toStrictEqual<StatusCodes>(
			StatusCodes.UNPROCESSABLE_ENTITY
		);
		expect<IJsonApiError>(response.body).toStrictEqual<IJsonApiError>({
			jsonapi: {
				version: '1.1',
			},
			errors: [
				{
					status: StatusCodes.UNPROCESSABLE_ENTITY.toString(),
					title: ReasonPhrases.UNPROCESSABLE_ENTITY,
					detail: getMessage('data.attributes.version.type'),
				},
			],
		});
	});

	test('should return conflict when the version does not match', async () => {
		const staleVersion = (await currentVersion()) + 1;

		const response: SupertestResponse<IJsonApiError> = await request
			.patch(`/users/${user.id}`)
			.set('Accept', 'application/vnd.api+json')
			.send({
				data: {
					type: 'users',
					attributes: {
						version: staleVersion,
						nickname: 'stale',
					},
				},
			});

		expect<number>(response.status).toStrictEqual<StatusCodes>(
			StatusCodes.CONFLICT
		);
		expect<IJsonApiError>(response.body).toStrictEqual<IJsonApiError>({
			jsonapi: {
				version: '1.1',
			},
			errors: [
				{
					status: StatusCodes.CONFLICT.toString(),
					title: ReasonPhrases.CONFLICT,
					detail: getMessage('version.conflict'),
				},
			],
		});
	});

	test('should increment the version after an update', async () => {
		const version = await currentVersion();

		const response: SupertestResponse<DataDocument<UserEntity>> = await request
			.patch(`/users/${user.id}`)
			.set('Accept', 'application/vnd.api+json')
			.send({
				data: {
					type: 'users',
					attributes: {
						version,
						nickname: 'versioned',
					},
				},
			});

		expect<number>(response.status).toStrictEqual<StatusCodes>(StatusCodes.OK);
		const data = response.body.data as unknown as { attributes: UserEntity };
		expect<number>(data.attributes.version).toStrictEqual(version + 1);
		expect<number>(await currentVersion()).toStrictEqual(version + 1);
	});
});

describe('PUT /users', () => {
	test('should return error when request body is empty', async () => {
		const response: SupertestResponse<IJsonApiError> = await request
			.put('/users')
			.set('Accept', 'application/vnd.api+json');

		expect<number>(response.status).toStrictEqual<StatusCodes>(
			StatusCodes.UNPROCESSABLE_ENTITY
		);
		expect<IJsonApiError>(response.body).toStrictEqual<IJsonApiError>({
			jsonapi: {
				version: '1.1',
			},
			errors: [
				{
					status: StatusCodes.UNPROCESSABLE_ENTITY.toString(),
					title: ReasonPhrases.UNPROCESSABLE_ENTITY,
					detail: getMessage('body.required'),
				},
			],
		});
	});

	test('should return error when request body is empty object', async () => {
		const response: SupertestResponse<IJsonApiError> = await request
			.put('/users')
			.set('Accept', 'application/vnd.api+json')
			.send({});

		expect<number>(response.status).toStrictEqual<StatusCodes>(
			StatusCodes.UNPROCESSABLE_ENTITY
		);
		expect<IJsonApiError>(response.body).toStrictEqual<IJsonApiError>({
			jsonapi: {
				version: '1.1',
			},
			errors: [
				{
					status: StatusCodes.UNPROCESSABLE_ENTITY.toString(),
					title: ReasonPhrases.UNPROCESSABLE_ENTITY,
					detail: getMessage('data.required'),
				},
			],
		});
	});

	test('should return error when data is empty object', async () => {
		const response: SupertestResponse<IJsonApiError> = await request
			.put('/users')
			.set('Accept', 'application/vnd.api+json')
			.send({
				data: {
					attributes: {
						version: await currentVersion(),
					},
				},
			});

		expect<number>(response.status).toStrictEqual<StatusCodes>(
			StatusCodes.UNPROCESSABLE_ENTITY
		);
		expect<IJsonApiError>(response.body).toStrictEqual<IJsonApiError>({
			jsonapi: {
				version: '1.1',
			},
			errors: [
				{
					status: StatusCodes.UNPROCESSABLE_ENTITY.toString(),
					title: ReasonPhrases.UNPROCESSABLE_ENTITY,
					detail: getMessage('data.id.required'),
				},
				{
					status: StatusCodes.UNPROCESSABLE_ENTITY.toString(),
					title: ReasonPhrases.UNPROCESSABLE_ENTITY,
					detail: getMessage('data.type.required'),
				},
			],
		});
	});

	test('should return error when data.type is invalid', async () => {
		const response: SupertestResponse<IJsonApiError> = await request
			.put('/users')
			.set('Accept', 'application/vnd.api+json')
			.send({
				data: {
					type: 'user',
					attributes: {
						version: await currentVersion(),
					},
				},
			});

		expect<number>(response.status).toStrictEqual<StatusCodes>(
			StatusCodes.UNPROCESSABLE_ENTITY
		);
		expect<IJsonApiError>(response.body).toStrictEqual<IJsonApiError>({
			jsonapi: {
				version: '1.1',
			},
			errors: [
				{
					status: StatusCodes.UNPROCESSABLE_ENTITY.toString(),
					title: ReasonPhrases.UNPROCESSABLE_ENTITY,
					detail: getMessage('data.id.required'),
				},
				{
					status: StatusCodes.UNPROCESSABLE_ENTITY.toString(),
					title: ReasonPhrases.UNPROCESSABLE_ENTITY,
					detail: getMessage('data.type.pattern'),
				},
			],
		});
	});

	test('should return error when data.attributes.id is missing', async () => {
		const response: SupertestResponse<IJsonApiError> = await request
			.put('/users')
			.set('Accept', 'application/vnd.api+json')
			.send({
				data: {
					type: 'users',
					attributes: {
						version: await currentVersion(),
					},
				},
			});

		expect<number>(response.status).toStrictEqual<StatusCodes>(
			StatusCodes.UNPROCESSABLE_ENTITY
		);
		expect<IJsonApiError>(response.body).toStrictEqual<IJsonApiError>({
			jsonapi: {
				version: '1.1',
			},
			errors: [
				{
					status: StatusCodes.UNPROCESSABLE_ENTITY.toString(),
					title: ReasonPhrases.UNPROCESSABLE_ENTITY,
					detail: getMessage('data.id.required'),
				},
			],
		});
	});

	test('should not update user', async () => {
		const response: SupertestResponse<DataDocument<UserEntity>> = await request
			.put('/users')
			.set('Accept', 'application/vnd.api+json')
			.send({
				data: {
					id: user.id,
					type: 'users',
					attributes: {
						version: await currentVersion(),
					},
				},
			});

		expect<number>(response.status).toStrictEqual<StatusCodes>(StatusCodes.OK);
		expect<DataDocument<UserEntity>>(response.body).toHaveProperty<string>(
			'jsonapi.version',
			'1.1'
		);
		expect<DataDocument<UserEntity>>(response.body).toHaveProperty<string>(
			'data.id',
			user.id
		);
		expect<DataDocument<UserEntity>>(response.body).toHaveProperty<string>(
			'data.type',
			'users'
		);
		expect<DataDocument<UserEntity>>(response.body).toHaveProperty<string>(
			'data.attributes.first_name',
			user.first_name
		);
		expect<DataDocument<UserEntity>>(response.body).toHaveProperty<string>(
			'data.attributes.last_name',
			String(user.last_name)
		);
		expect<DataDocument<UserEntity>>(response.body).toHaveProperty<string>(
			'data.attributes.nickname'
		);
		expect<DataDocument<UserEntity>>(response.body).toHaveProperty<string>(
			'data.attributes.email',
			user.email
		);
		expect<DataDocument<UserEntity>>(response.body).toHaveProperty<string>(
			'data.attributes.created_at'
		);
		expect<DataDocument<UserEntity>>(response.body).toHaveProperty<string>(
			'data.attributes.updated_at'
		);
	});

	test('should return error when name is null', async () => {
		const response: SupertestResponse<IJsonApiError> = await request
			.put(`/users`)
			.set('Accept', 'application/vnd.api+json')
			.send({
				data: {
					type: 'users',
					id: user.id,
					attributes: {
						version: await currentVersion(),
						first_name: null,
					},
				},
			});

		expect<number>(response.status).toStrictEqual<StatusCodes>(
			StatusCodes.UNPROCESSABLE_ENTITY
		);
		expect<IJsonApiError>(response.body).toStrictEqual<IJsonApiError>({
			jsonapi: {
				version: '1.1',
			},
			errors: [
				{
					status: StatusCodes.UNPROCESSABLE_ENTITY.toString(),
					title: ReasonPhrases.UNPROCESSABLE_ENTITY,
					detail: getMessage('data.attributes.first_name.type'),
				},
			],
		});
	});

	test('should return error when name is null', async () => {
		const response: SupertestResponse<IJsonApiError> = await request
			.put(`/users`)
			.set('Accept', 'application/vnd.api+json')
			.send({
				data: {
					id: user.id,
					type: 'users',
					attributes: {
						version: await currentVersion(),
						first_name: null,
					},
				},
			});

		expect<number>(response.status).toStrictEqual<StatusCodes>(
			StatusCodes.UNPROCESSABLE_ENTITY
		);
		expect<IJsonApiError>(response.body).toStrictEqual<IJsonApiError>({
			jsonapi: {
				version: '1.1',
			},
			errors: [
				{
					status: StatusCodes.UNPROCESSABLE_ENTITY.toString(),
					title: ReasonPhrases.UNPROCESSABLE_ENTITY,
					detail: getMessage('data.attributes.first_name.type'),
				},
			],
		});
	});

	test('should return error when name is empty', async () => {
		const response: SupertestResponse<IJsonApiError> = await request
			.put(`/users`)
			.set('Accept', 'application/vnd.api+json')
			.send({
				data: {
					id: user.id,
					type: 'users',
					attributes: {
						version: await currentVersion(),
						first_name: '',
					},
				},
			});

		expect<number>(response.status).toStrictEqual<StatusCodes>(
			StatusCodes.UNPROCESSABLE_ENTITY
		);
		expect<IJsonApiError>(response.body).toStrictEqual<IJsonApiError>({
			jsonapi: {
				version: '1.1',
			},
			errors: [
				{
					status: StatusCodes.UNPROCESSABLE_ENTITY.toString(),
					title: ReasonPhrases.UNPROCESSABLE_ENTITY,
					detail: getMessage('data.attributes.first_name.minLength'),
				},
			],
		});
	});

	test('should return error when name is invalid', async () => {
		const response: SupertestResponse<IJsonApiError> = await request
			.put(`/users`)
			.set('Accept', 'application/vnd.api+json')
			.send({
				data: {
					id: user.id,
					type: 'users',
					attributes: {
						version: await currentVersion(),
						first_name: 12345,
					},
				},
			});

		expect<number>(response.status).toStrictEqual<StatusCodes>(
			StatusCodes.UNPROCESSABLE_ENTITY
		);
		expect<IJsonApiError>(response.body).toStrictEqual<IJsonApiError>({
			jsonapi: {
				version: '1.1',
			},
			errors: [
				{
					status: StatusCodes.UNPROCESSABLE_ENTITY.toString(),
					title: ReasonPhrases.UNPROCESSABLE_ENTITY,
					detail: getMessage('data.attributes.first_name.type'),
				},
			],
		});
	});

	test('should ok when username is null', async () => {
		const response: SupertestResponse<DataDocument<UserEntity>> = await request
			.put(`/users`)
			.set('Accept', 'application/vnd.api+json')
			.send({
				data: {
					id: user.id,
					type: 'users',
					attributes: {
						version: await currentVersion(),
						nickname: null,
					},
				},
			});

		expect<number>(response.status).toStrictEqual<StatusCodes>(StatusCodes.OK);
		expect<DataDocument<UserEntity>>(response.body).toHaveProperty<string>(
			'jsonapi.version',
			'1.1'
		);
		expect<DataDocument<UserEntity>>(response.body).toHaveProperty<string>(
			'data.id',
			user.id
		);
		expect<DataDocument<UserEntity>>(response.body).toHaveProperty<string>(
			'data.type',
			'users'
		);
		expect<DataDocument<UserEntity>>(response.body).toHaveProperty<string>(
			'data.attributes.first_name',
			user.first_name
		);
		expect<DataDocument<UserEntity>>(response.body).toHaveProperty<string>(
			'data.attributes.last_name',
			String(user.last_name)
		);
		expect<DataDocument<UserEntity>>(response.body).toHaveProperty<null>(
			'data.attributes.nickname',
			null
		);
		expect<DataDocument<UserEntity>>(response.body).toHaveProperty<string>(
			'data.attributes.email',
			user.email
		);
		expect<DataDocument<UserEntity>>(response.body).toHaveProperty<string>(
			'data.attributes.created_at'
		);
		expect<DataDocument<UserEntity>>(response.body).toHaveProperty<string>(
			'data.attributes.updated_at'
		);
	});

	test('should ok when username is empty', async () => {
		const response: SupertestResponse<DataDocument<UserEntity>> = await request
			.put(`/users`)
			.set('Accept', 'application/vnd.api+json')
			.send({
				data: {
					id: user.id,
					type: 'users',
					attributes: {
						version: await currentVersion(),
						nickname: '',
					},
				},
			});

		expect<number>(response.status).toStrictEqual<StatusCodes>(StatusCodes.OK);
		expect<DataDocument<UserEntity>>(response.body).toHaveProperty<string>(
			'jsonapi.version',
			'1.1'
		);
		expect<DataDocument<UserEntity>>(response.body).toHaveProperty<string>(
			'data.id',
			user.id
		);
		expect<DataDocument<UserEntity>>(response.body).toHaveProperty<string>(
			'data.type',
			'users'
		);
		expect<DataDocument<UserEntity>>(response.body).toHaveProperty<string>(
			'data.attributes.first_name',
			user.first_name
		);
		expect<DataDocument<UserEntity>>(response.body).toHaveProperty<string>(
			'data.attributes.last_name',
			String(user.last_name)
		);
		expect<DataDocument<UserEntity>>(response.body).toHaveProperty(
			'data.attributes.nickname',
			''
		);
		expect<DataDocument<UserEntity>>(response.body).toHaveProperty<string>(
			'data.attributes.email',
			user.email
		);
		expect<DataDocument<UserEntity>>(response.body).toHaveProperty<string>(
			'data.attributes.created_at'
		);
		expect<DataDocument<UserEntity>>(response.body).toHaveProperty<string>(
			'data.attributes.updated_at'
		);
	});

	test('should return error when email is null', async () => {
		const response: SupertestResponse<IJsonApiError> = await request
			.put(`/users`)
			.set('Accept', 'application/vnd.api+json')
			.send({
				data: {
					id: user.id,
					type: 'users',
					attributes: {
						version: await currentVersion(),
						email: null,
					},
				},
			});

		expect<number>(response.status).toStrictEqual<StatusCodes>(
			StatusCodes.UNPROCESSABLE_ENTITY
		);
		expect<IJsonApiError>(response.body).toStrictEqual<IJsonApiError>({
			jsonapi: {
				version: '1.1',
			},
			errors: [
				{
					status: StatusCodes.UNPROCESSABLE_ENTITY.toString(),
					title: ReasonPhrases.UNPROCESSABLE_ENTITY,
					detail: getMessage('data.attributes.email.type'),
				},
			],
		});
	});

	test('should return error when email is empty', async () => {
		const response: SupertestResponse<IJsonApiError> = await request
			.put(`/users`)
			.set('Accept', 'application/vnd.api+json')
			.send({
				data: {
					id: user.id,
					type: 'users',
					attributes: {
						version: await currentVersion(),
						email: '',
					},
				},
			});

		expect<number>(response.status).toStrictEqual<StatusCodes>(
			StatusCodes.UNPROCESSABLE_ENTITY
		);
		expect<IJsonApiError>(response.body).toStrictEqual<IJsonApiError>({
			jsonapi: {
				version: '1.1',
			},
			errors: [
				{
					status: StatusCodes.UNPROCESSABLE_ENTITY.toString(),
					title: ReasonPhrases.UNPROCESSABLE_ENTITY,
					detail: getMessage('data.attributes.email.format'),
				},
				{
					status: StatusCodes.UNPROCESSABLE_ENTITY.toString(),
					title: ReasonPhrases.UNPROCESSABLE_ENTITY,
					detail: getMessage('data.attributes.email.required'),
				},
			],
		});
	});

	test('should return error when email is invalid', async () => {
		const response: SupertestResponse<IJsonApiError> = await request
			.put(`/users`)
			.set('Accept', 'application/vnd.api+json')
			.send({
				data: {
					id: user.id,
					type: 'users',
					attributes: {
						version: await currentVersion(),
						email: 12345,
					},
				},
			});

		expect<number>(response.status).toStrictEqual<StatusCodes>(
			StatusCodes.UNPROCESSABLE_ENTITY
		);
		expect<IJsonApiError>(response.body).toStrictEqual<IJsonApiError>({
			jsonapi: {
				version: '1.1',
			},
			errors: [
				{
					status: StatusCodes.UNPROCESSABLE_ENTITY.toString(),
					title: ReasonPhrases.UNPROCESSABLE_ENTITY,
					detail: getMessage('data.attributes.email.type'),
				},
			],
		});
	});

	test('should return error when email is invalid', async () => {
		const response: SupertestResponse<IJsonApiError> = await request
			.put(`/users`)
			.set('Accept', 'application/vnd.api+json')
			.send({
				data: {
					id: user.id,
					type: 'users',
					attributes: {
						version: await currentVersion(),
						email: 'johndoe',
					},
				},
			});

		expect<number>(response.status).toStrictEqual<StatusCodes>(
			StatusCodes.UNPROCESSABLE_ENTITY
		);
		expect<IJsonApiError>(response.body).toStrictEqual<IJsonApiError>({
			jsonapi: {
				version: '1.1',
			},
			errors: [
				{
					status: StatusCodes.UNPROCESSABLE_ENTITY.toString(),
					title: ReasonPhrases.UNPROCESSABLE_ENTITY,
					detail: getMessage('data.attributes.email.format'),
				},
			],
		});
	});
});

describe('Idempotency-Key', () => {
	test('should replay a create instead of creating a duplicate', async () => {
		const payload = {
			data: {
				type: 'users',
				attributes: {
					first_name: 'Idempotent',
					email: 'idempotent-create@example.com',
				},
			},
		};

		const first: SupertestResponse<DataDocument<UserEntity>> = await request
			.post('/users')
			.set('Accept', 'application/vnd.api+json')
			.set('Idempotency-Key', `create-idempotent-user-${user.id}`)
			.send(payload);
		const second: SupertestResponse<DataDocument<UserEntity>> = await request
			.post('/users')
			.set('Accept', 'application/vnd.api+json')
			.set('Idempotency-Key', `create-idempotent-user-${user.id}`)
			.send(payload);

		expect<number>(first.status).toStrictEqual<StatusCodes>(
			StatusCodes.CREATED
		);
		expect<number>(second.status).toStrictEqual<StatusCodes>(
			StatusCodes.CREATED
		);
		const firstData = first.body.data as unknown as { id: string };
		const secondData = second.body.data as unknown as { id: string };
		expect<string>(secondData.id).toStrictEqual(firstData.id);
	});

	test('should replay an update without a second version bump', async () => {
		const version = await currentVersion();
		const payload = {
			data: {
				type: 'users',
				attributes: {
					version,
					nickname: 'idempotent-update',
				},
			},
		};

		const first: SupertestResponse<DataDocument<UserEntity>> = await request
			.patch(`/users/${user.id}`)
			.set('Accept', 'application/vnd.api+json')
			.set('Idempotency-Key', `update-idempotent-user-${user.id}`)
			.send(payload);
		const second: SupertestResponse<DataDocument<UserEntity>> = await request
			.patch(`/users/${user.id}`)
			.set('Accept', 'application/vnd.api+json')
			.set('Idempotency-Key', `update-idempotent-user-${user.id}`)
			.send(payload);

		expect<number>(first.status).toStrictEqual<StatusCodes>(StatusCodes.OK);
		expect<number>(second.status).toStrictEqual<StatusCodes>(StatusCodes.OK);
		const secondData = second.body.data as unknown as {
			attributes: UserEntity;
		};
		expect<number>(secondData.attributes.version).toStrictEqual(version + 1);
		expect<string>(secondData.attributes.nickname ?? '').toStrictEqual(
			'idempotent-update'
		);
		expect<number>(await currentVersion()).toStrictEqual(version + 1);
	});

	test('should return conflict when a key is reused with a different payload', async () => {
		const first = await request
			.post('/users')
			.set('Accept', 'application/vnd.api+json')
			.set('Idempotency-Key', `create-key-mismatch-${user.id}`)
			.send({
				data: {
					type: 'users',
					attributes: {
						first_name: 'First',
						email: 'idempotent-mismatch@example.com',
					},
				},
			});
		expect<number>(first.status).toStrictEqual<StatusCodes>(
			StatusCodes.CREATED
		);

		const response: SupertestResponse<IJsonApiError> = await request
			.post('/users')
			.set('Accept', 'application/vnd.api+json')
			.set('Idempotency-Key', `create-key-mismatch-${user.id}`)
			.send({
				data: {
					type: 'users',
					attributes: {
						first_name: 'Different',
						email: 'idempotent-mismatch-other@example.com',
					},
				},
			});

		expect<number>(response.status).toStrictEqual<StatusCodes>(
			StatusCodes.CONFLICT
		);
		expect<IJsonApiError>(response.body).toStrictEqual<IJsonApiError>({
			jsonapi: {
				version: '1.1',
			},
			errors: [
				{
					status: StatusCodes.CONFLICT.toString(),
					title: ReasonPhrases.CONFLICT,
					detail: getMessage('idempotency.mismatch'),
				},
			],
		});
	});
});
