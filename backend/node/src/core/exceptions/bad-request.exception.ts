import type { ErrorObject } from '../interfaces/http.interface';
import { HttpException } from './http.exception';

export class BadRequestException extends HttpException {
	declare readonly error?: ErrorObject | Record<string, unknown>;

	constructor(message: string, error?: ErrorObject) {
		super(400, message, 'Bad Request');

		if (error) {
			if (Object.keys(error).length > 0) {
				this.error = error;
			}
		}
	}
}
