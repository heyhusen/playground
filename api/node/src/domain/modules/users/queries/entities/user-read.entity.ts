import { BaseEntity } from '../../../../entities/base.entity';

export interface BaseUserReadEntity {
	first_name: string;
	last_name?: string | null;
	nickname?: string | null;
	email: string;
}

export interface UserReadEntity extends BaseEntity, BaseUserReadEntity {}
