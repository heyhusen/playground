import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import { HttpException } from './http.exception.js';

export class ConflictException extends HttpException {
	constructor(message: string) {
		super(StatusCodes.CONFLICT, message, ReasonPhrases.CONFLICT);
	}
}
