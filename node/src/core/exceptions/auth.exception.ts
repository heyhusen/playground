import { HttpException } from './http.exception';

export class AuthException extends HttpException {
	constructor(status: number, name: string, message: string) {
		super(status, message, name);
	}
}
