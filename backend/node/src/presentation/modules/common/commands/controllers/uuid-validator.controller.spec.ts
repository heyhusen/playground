import { getMessage } from '../../../../../domain/helpers/get-message.helper';
import { mockedRequest as headers } from '../../../../../domain/modules/users/commands/use-cases/__mocks__/request.mock';
import { mockedUser } from '../../../../../domain/modules/users/commands/use-cases/__mocks__/user.mock';
import { BadRequestException } from '../../../../exceptions/bad-request.exception';
import type { IHttpRequestParams } from '../../../../interfaces/http.interface';
import type { IRequestIdParams } from '../../../../interfaces/request.interface';
import { UuidValidatorController } from './uuid-validator.controller';

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
