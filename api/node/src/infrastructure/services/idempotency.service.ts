import { createHash } from 'node:crypto';
import type {
	IIdempotencyService,
	IdempotencyCommand,
} from '../../domain/base/interfaces/base-idempotency-service.interface.js';
import { getMessage } from '../../domain/helpers/get-message.helper.js';
import { ConflictException } from '../../presentation/exceptions/conflict.exception.js';
import { redis } from '../ports/redis.js';

const ttl = 60 * 60 * 24;

type PendingRecord = {
	state: 'in_progress';
	fingerprint: string;
};

type CompletedRecord<Result> = {
	state: 'completed';
	fingerprint: string;
	result: Result;
};

type StoredRecord<Result> = PendingRecord | CompletedRecord<Result>;

export function idempotencyFingerprint(payload: unknown): string {
	const canonical = JSON.stringify(payload ?? null);

	return createHash('sha256').update(canonical).digest('hex');
}

export const idempotencyService: IIdempotencyService = {
	async peek(
		scope: string,
		key: string | undefined,
		fingerprint: string
	): Promise<boolean> {
		if (!key) {
			return false;
		}

		const raw = await redis.get(`idempotency:${scope}:${key}`);
		if (!raw) {
			return false;
		}

		const record = JSON.parse(raw) as StoredRecord<unknown>;

		return record.state === 'completed' && record.fingerprint === fingerprint;
	},

	async run<Result>(command: IdempotencyCommand<Result>): Promise<Result> {
		if (!command.key) {
			return command.execute();
		}

		const storageKey = `idempotency:${command.scope}:${command.key}`;
		const pending: PendingRecord = {
			state: 'in_progress',
			fingerprint: command.fingerprint,
		};
		const acquired = await redis.set(
			storageKey,
			JSON.stringify(pending),
			'EX',
			ttl,
			'NX'
		);

		if (acquired !== 'OK') {
			const raw = await redis.get(storageKey);
			if (!raw) {
				return command.execute();
			}

			const existing = JSON.parse(raw) as StoredRecord<Result>;
			if (existing.fingerprint !== command.fingerprint) {
				throw new ConflictException(getMessage('idempotency.mismatch'));
			}

			if (existing.state === 'completed') {
				return existing.result;
			}

			throw new ConflictException(getMessage('idempotency.in_progress'));
		}

		try {
			const result = await command.execute();
			const completed: CompletedRecord<Result> = {
				state: 'completed',
				fingerprint: command.fingerprint,
				result,
			};

			await redis.set(storageKey, JSON.stringify(completed), 'EX', ttl);

			return result;
		} catch (error) {
			await redis.del(storageKey);

			throw error;
		}
	},
};
