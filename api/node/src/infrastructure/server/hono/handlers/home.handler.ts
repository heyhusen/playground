/* eslint-disable class-methods-use-this */
import type { Context } from 'hono';
import { HomeController } from '../../../../presentation/modules/home/commands/controllers/home.controller.js';
import { IBaseSingleHandler } from '../base/interfaces/base-single-handles.interface.js';

export class HomeHandler implements IBaseSingleHandler<Response> {
	execute(_context: Context): Response {
		const controller = new HomeController();
		const { status, data } = controller.execute();

		return new Response(JSON.stringify(data), {
			status,
			headers: { 'Content-Type': 'application/json' },
		});
	}
}
