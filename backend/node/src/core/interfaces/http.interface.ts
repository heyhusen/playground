export interface ErrorObject {
	message: string;
}

export interface HttpError extends Error {
	status: number;
	statusCode: number;
	error?: ErrorObject | Record<string, unknown>;
}
