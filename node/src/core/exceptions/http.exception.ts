export class HttpException extends Error {
	readonly status: number;

	readonly statusCode: number;

	constructor(status: number, message: string, name?: string) {
		super(message);
		this.status = status;
		this.statusCode = status;
		this.name = name || 'HTTP Error';
	}
}
