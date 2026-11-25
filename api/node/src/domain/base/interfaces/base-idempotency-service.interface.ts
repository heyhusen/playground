export interface IdempotencyCommand<Result> {
	/** Operation name, e.g. `create` or `update:<id>`. */
	scope: string;

	/** Value of the `Idempotency-Key` header; undefined means no idempotency. */
	key: string | undefined;

	/** Hash of the request payload, used to detect key reuse with new data. */
	fingerprint: string;

	execute: () => Promise<Result>;
}

export interface IIdempotencyService {
	/**
	 * Returns a cached result for a repeated key, rejects a key reused with a
	 * different payload or still in progress, and otherwise runs + caches the
	 * command.
	 */
	run<Result>(command: IdempotencyCommand<Result>): Promise<Result>;

	/**
	 * True when the key already has a completed result for the same payload.
	 * Lets earlier validation middleware skip checks that a replay makes stale.
	 */
	peek(
		scope: string,
		key: string | undefined,
		fingerprint: string
	): Promise<boolean>;
}
