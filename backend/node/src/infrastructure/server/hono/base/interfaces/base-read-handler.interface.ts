import type { Context } from 'hono';

export interface IBaseReadHandler {
	read: (context: Context) => Promise<Response>;

	readAll: (context: Context) => Promise<Response>;
}
