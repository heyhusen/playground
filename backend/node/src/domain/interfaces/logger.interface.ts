export interface ILogger {
	info: (message: string, arg?: unknown) => void;
	http: (message: string, arg?: unknown) => void;
	warn: (message: string, arg?: unknown) => void;
	error: (message: string, error: unknown, arg?: unknown) => void;
	debug: (message: string, arg?: unknown) => void;
}
