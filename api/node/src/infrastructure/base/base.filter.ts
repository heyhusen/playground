import { SQL } from 'drizzle-orm';
import { PgTableWithColumns } from 'drizzle-orm/pg-core';
import { IBaseFilter } from './interfaces/base-filter.interface';

export abstract class BaseFilter<FilterEntity> implements IBaseFilter {
	protected readonly queries: SQL[] = [];

	constructor(
		protected readonly schema: PgTableWithColumns<any>,
		protected readonly params: Partial<FilterEntity>
	) {}

	abstract execute(): SQL[];
}
