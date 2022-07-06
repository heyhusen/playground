import { HttpException } from './http.exception';

export class BearerTokenException extends HttpException {
	constructor(status: number, name: string, message: string) {
		super(status, message, name);
	}
}
