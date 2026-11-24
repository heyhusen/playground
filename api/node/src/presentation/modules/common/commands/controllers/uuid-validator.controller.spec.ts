import { getMessage } from '../../../../../domain/helpers/get-message.helper.js';
import { mockedRequest as headers } from '../../../../../domain/modules/users/commands/use-cases/__mocks__/request.mock.js';
import { mockedUser } from '../../../../../domain/modules/users/commands/use-cases/__mocks__/user.mock.js';
import { BadRequestException } from '../../../../exceptions/bad-request.exception.js';
import type { IHttpRequestParams } from '../../../../interfaces/http.interface.js';
import type { IRequestIdParams } from '../../../../interfaces/request.interface.js';
import { UuidValidatorController } from './uuid-validator.controller.js';

describe(UuidValidatorController.name, () => {
	let request: IHttpRequestParams<IRequestIdParams> = {
		headers,
	};

	test('should throw error when request params is empty', () => {
		const controller = new UuidValidatorController(request);

		expect(() => {
			controller.execute();
		}).toThrow(new BadRequestException(getMessage('params.id.required')));
	});

	test('should throw error when id is invalid uuid', () => {
		request = {
			...request,
			params: {
				id: 'id',
			},
		};

		const controller = new UuidValidatorController(request);

		expect(() => {
			controller.execute();
		}).toThrow(new BadRequestException(getMessage('id.format')));
	});

	test('should return true when id is valid uuid', () => {
		request = {
			...request,
			params: {
				id: mockedUser.id,
			},
		};

		const controller = new UuidValidatorController(request);
		const data = controller.execute();

		expect<boolean>(data).toStrictEqual<boolean>(true);
	});
});
