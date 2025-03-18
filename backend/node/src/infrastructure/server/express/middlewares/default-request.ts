import { NextFunction, Request, Response } from 'express';

export function defaultRequest() {
	return (request: Request, _response: Response, next: NextFunction) => {
		Object.assign(request.headers, {
			timezone_name: request.headers.timezone_name ?? 'Asia/Jakarta',
			timezone_offset: request.headers.timezone_offset ?? 7,
		});

		next();
	};
}
