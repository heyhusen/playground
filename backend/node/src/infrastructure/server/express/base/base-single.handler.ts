import { Request, Response } from 'express';
import { IBaseSingleHandler } from './interfaces/base-single-handles.interface';

export abstract class BaseSingleHandler<Result>
	implements IBaseSingleHandler<Result>
{
	abstract execute(request: Request, response: Response): Result;
}
