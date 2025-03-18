import { and, eq, SQL } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { UserEntity } from '../../../domain/modules/users/entities/user.entity';
import { IUserReadRepository } from '../../../domain/modules/users/interfaces/user-repository.interface';
import { BaseReadRepository } from '../../base/base-read.repository';
import * as schema from '../schemas';

export class UserReadRepository
	extends BaseReadRepository<UserEntity>
	implements IUserReadRepository
{
	constructor(protected override readonly db: NodePgDatabase<typeof schema>) {
		super(db, schema.users);
	}

	async findOneByEmail(email: string, id?: string): Promise<UserEntity | null> {
		const filters: SQL[] = [eq(schema.users.email, email)];

		if (id) {
			filters.push(eq(schema.users.id, id));
		}

		const entities = await this.db
			.select()
			.from(schema.users)
			.where(and(...filters))
			.limit(1);

		return entities.at(0) as UserEntity;
	}
}
