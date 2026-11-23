import { Request, Response } from 'express';

export interface IBaseSingleHandler<Result> {
	execute: (request: Request, response: Response) => Result;
}
