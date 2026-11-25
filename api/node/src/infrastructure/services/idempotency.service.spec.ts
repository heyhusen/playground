import { beforeEach, describe, expect, test, vi } from 'vitest';
import { idempotencyService } from './idempotency.service.js';
import { redis } from '../ports/redis.js';

vi.mock('../ports/redis.js', () => ({
	redis: {
		get: vi.fn(),
		set: vi.fn(),
		del: vi.fn(),
	},
}));

describe('idempotencyService', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe.each([undefined, ''])('run with key %s', (key) => {
		test('executes directly without touching Redis', async () => {
			const execute = vi.fn().mockResolvedValue('done');

			const result = await idempotencyService.run({
				scope: 'create',
				key,
				fingerprint: 'fingerprint',
				execute,
			});

			expect(result).toStrictEqual('done');
			expect(execute).toHaveBeenCalledTimes(1);
			expect(redis.set).not.toHaveBeenCalled();
			expect(redis.get).not.toHaveBeenCalled();
			expect(redis.del).not.toHaveBeenCalled();
		});
	});

	describe.each([undefined, ''])('peek with key %s', (key) => {
		test('returns false without touching Redis', async () => {
			await expect(
				idempotencyService.peek('create', key, 'fingerprint')
			).resolves.toBe(false);
			expect(redis.get).not.toHaveBeenCalled();
		});
	});
});
