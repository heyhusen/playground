import type { Context } from 'hono';

export interface IBaseHandler {
	create: (context: Context) => Promise<Response>;

	update: (context: Context) => Promise<Response>;

	delete: (context: Context) => Promise<Response>;
}
