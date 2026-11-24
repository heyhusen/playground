/* eslint-disable class-methods-use-this */
import type { Request, Response } from 'express';
import { HomeController } from '../../../../presentation/modules/home/commands/controllers/home.controller.js';
import { IBaseSingleHandler } from '../base/interfaces/base-single-handles.interface.js';

export class HomeHandler implements IBaseSingleHandler<void> {
	execute(_request: Request, response: Response): void {
		const controller = new HomeController();
		const { status, data } = controller.execute();

		response.status(status).json(data);
	}
}
