/* eslint-disable class-methods-use-this */
import type { FastifyReply, FastifyRequest } from 'fastify';
import { HomeController } from '../../../../presentation/modules/home/commands/controllers/home.controller.js';
import { IBaseSingleHandler } from '../base/interfaces/base-single-handles.interface.js';

export class HomeHandler implements IBaseSingleHandler<void> {
	async execute(_request: FastifyRequest, reply: FastifyReply): Promise<void> {
		const controller = new HomeController();
		const { status, data } = controller.execute();

		await reply
			.code(status)
			.type('application/json')
			.send(JSON.stringify(data));
	}
}
