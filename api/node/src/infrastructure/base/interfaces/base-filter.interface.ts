import { SQL } from 'drizzle-orm';

export interface IBaseFilter {
	execute: () => SQL[];
}
