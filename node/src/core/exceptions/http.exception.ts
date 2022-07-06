import type { HttpError } from '../interfaces/http.interface';

export class HttpException extends Error implements HttpError {
	readonly status: number;

	readonly statusCode: number;

	constructor(status: number, message: string, name?: string) {
		super(message);
		this.status = status;
		this.statusCode = status;
		this.name = name || 'HTTP Error';
	}
}
