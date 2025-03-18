import pino from 'pino';
import { ILogger } from '../../domain/interfaces/logger.interface';

function getLevel(): pino.LevelWithSilentOrString {
	if (process.env.NODE_ENV === 'testing') {
		return 'silent';
	}

	if (process.env.NODE_ENV === 'production') {
		return 'info';
	}

	return 'debug';
}

export class Logger implements ILogger {
	private readonly logger = pino({
		transport: {
			target: 'pino-pretty',
			options: {
				colorize: true,
			},
		},
		level: getLevel(),
	});

	info(message: string, arg?: unknown): void {
		this.logger.info(message, arg);
	}

	http(message: string, arg?: unknown): void {
		this.logger.trace(message, arg);
	}

	warn(message: string, arg?: unknown): void {
		this.logger.warn(message, arg);
	}

	error(message: string, error: unknown, arg?: unknown): void {
		this.logger.error(error, message, arg);
	}

	debug(message: string, arg?: unknown): void {
		this.logger.debug(message, arg);
	}
}
