import type { Context } from 'hono';

export interface IBaseSingleHandler<Result> {
	execute: (context: Context) => Result;
}
