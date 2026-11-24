import { StatusCodes } from 'http-status-codes';
import { ICoreResponse } from '../../../../interfaces/response.interface.js';
import { HomeController } from './home.controller.js';

describe(HomeController.name, () => {
	test('should return hello world!', () => {
		const controller = new HomeController();
		const data = controller.execute();

		expect<ICoreResponse<string>>(data).toStrictEqual<ICoreResponse<string>>({
			status: StatusCodes.OK,
			data: 'Hello world!',
		});
	});
});
