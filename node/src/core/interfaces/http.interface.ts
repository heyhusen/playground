export interface HttpError extends Error {
	status: number;
	statusCode: number;
}
