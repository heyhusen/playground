/* eslint-disable class-methods-use-this */
import { StatusCodes } from 'http-status-codes';
import { BaseSingleController } from '../../../base/base-single.controller';
import type { ICoreResponse } from '../../../interfaces/response.interface';
import { IHomeController } from '../interfaces/home-controller.interface';

export class HomeController
	extends BaseSingleController<ICoreResponse<string>>
	implements IHomeController
{
	execute(): ICoreResponse<string> {
		return {
			status: StatusCodes.OK,
			data: `Hello world!`,
		};
	}
}
