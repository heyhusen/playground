import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import { IBaseErrorObject } from '../interfaces/http.interface';
import { HttpException } from './http.exception';

export class BadRequestException extends HttpException {
	declare readonly error?: IBaseErrorObject | Record<string, unknown>;

	constructor(message: string, error?: IBaseErrorObject) {
		super(StatusCodes.BAD_REQUEST, message, ReasonPhrases.BAD_REQUEST);

		if (error && Object.keys(error).length) {
			this.error = error;
		}
	}
}
