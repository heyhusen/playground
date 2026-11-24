import type { Context } from 'hono';
import { IBaseHandler } from '../base/interfaces/base-handler.interface.js';

export interface IUserHandler extends IBaseHandler {
	addionalUpdate: (context: Context) => Promise<Response>;
}
