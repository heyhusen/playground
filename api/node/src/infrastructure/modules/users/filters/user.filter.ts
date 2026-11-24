import { inArray, SQL } from 'drizzle-orm';
import { BaseFilter } from '../../../base/base.filter.js';
import { IUserFilterParams } from '../interfaces/user-filter-params.interface.js';

export class UserFilter extends BaseFilter<IUserFilterParams> {
	override execute(): SQL[] {
		if (this.params?.ids?.length) {
			this.queries.push(inArray(this.schema.id, this.params.ids));
		}

		if (this.params?.first_names?.length) {
			this.queries.push(
				inArray(this.schema.first_name, this.params.first_names)
			);
		}

		if (this.params?.last_names?.length) {
			this.queries.push(inArray(this.schema.last_name, this.params.last_names));
		}

		if (this.params?.nicknames?.length) {
			this.queries.push(inArray(this.schema.nicknames, this.params.nicknames));
		}

		if (this.params?.emails?.length) {
			this.queries.push(inArray(this.schema.email, this.params.emails));
		}

		return this.queries;
	}
}
