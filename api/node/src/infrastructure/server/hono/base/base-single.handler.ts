import type { Context } from 'hono';
import { IBaseSingleHandler } from './interfaces/base-single-handles.interface.js';

export abstract class BaseSingleHandler<
	Result,
> implements IBaseSingleHandler<Result> {
	abstract execute(context: Context): Result;
}
