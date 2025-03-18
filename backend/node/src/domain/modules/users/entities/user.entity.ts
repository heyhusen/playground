import { BaseEntity } from '../../../entities/base.entity';

export interface BaseUserEntity {
	first_name: string;
	last_name?: string | null;
	nickname?: string | null;
	email: string;
}

export interface UserEntity extends BaseEntity, BaseUserEntity {}
