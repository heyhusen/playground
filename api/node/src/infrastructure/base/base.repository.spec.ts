import { SQL } from 'drizzle-orm';
import { describe, expect, test, vi } from 'vitest';
import { ConflictException } from '../../presentation/exceptions/conflict.exception.js';
import { BaseRepository } from './base.repository.js';

const entitySchema = { id: 'id', version: 'version' };

function createRepository(updatedRows: unknown[], existingRows: unknown[]) {
	const returning = vi.fn().mockResolvedValue(updatedRows);
	const whereUpdate = vi.fn().mockReturnValue({ returning });
	const set = vi.fn().mockReturnValue({ where: whereUpdate });
	const update = vi.fn().mockReturnValue({ set });

	const limit = vi.fn().mockResolvedValue(existingRows);
	const whereSelect = vi.fn().mockReturnValue({ limit });
	const from = vi.fn().mockReturnValue({ where: whereSelect });
	const select = vi.fn().mockReturnValue({ from });

	const trx = { update, select };

	return {
		repository: new BaseRepository<any>(trx as never, entitySchema as never),
		update,
		set,
		whereUpdate,
		select,
	};
}

describe(BaseRepository.name, () => {
	describe(BaseRepository.prototype.update.name, () => {
		test('increments the version atomically with the data update', async () => {
			const updated = { id: 'id', version: 2, first_name: 'Jane' };
			const { repository, update, set, whereUpdate, select } = createRepository(
				[updated],
				[]
			);

			const result = await repository.update('id', 1, { first_name: 'Jane' });

			expect(result).toStrictEqual(updated);
			expect(update).toHaveBeenCalledTimes(1);
			expect(set).toHaveBeenCalledTimes(1);
			expect(set.mock.calls[0]?.[0]).toMatchObject({ first_name: 'Jane' });
			expect(set.mock.calls[0]?.[0]?.version).toBeInstanceOf(SQL);
			expect(whereUpdate).toHaveBeenCalledTimes(1);
			expect(select).not.toHaveBeenCalled();
		});

		test('skips the version guard when no expected version is supplied', async () => {
			const updated = { id: 'id', version: 2, first_name: 'Jane' };
			const { repository, whereUpdate, select } = createRepository(
				[updated],
				[]
			);

			const result = await repository.update('id', undefined, {
				first_name: 'Jane',
			});

			expect(result).toStrictEqual(updated);
			expect(whereUpdate).toHaveBeenCalledTimes(1);
			expect(select).not.toHaveBeenCalled();
		});

		test('throws a conflict when the row exists but the version is stale', async () => {
			const { repository } = createRepository([], [{ id: 'id' }]);

			await expect(
				repository.update('id', 1, { first_name: 'Jane' })
			).rejects.toThrow(ConflictException);
		});

		test('returns undefined when the row does not exist', async () => {
			const { repository } = createRepository([], []);

			await expect(
				repository.update('id', 1, { first_name: 'Jane' })
			).resolves.toBeUndefined();
		});
	});
});
