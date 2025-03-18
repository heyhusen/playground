import type {
	IBaseErrorObject,
	IHttpError,
} from '../interfaces/http.interface';

export class HttpException extends Error implements IHttpError {
	readonly status: number;

	readonly statusCode: number;

	readonly error?: IBaseErrorObject | Record<string, unknown>;

	constructor(status: number, message: string, name?: string) {
		super(message);
		this.status = status;
		this.statusCode = status;
		this.name = name || 'HTTP Error';
	}
}
