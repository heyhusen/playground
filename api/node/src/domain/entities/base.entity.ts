export interface BaseEntity {
	id: string;
	version: number;
	cursor: number;

	created_at: number;
	created_at_timezone_name: string;
	created_at_timezone_offset: number;

	updated_at: number;
	updated_at_timezone_name: string;
	updated_at_timezone_offset: number;

	deleted_at?: number;
	deleted_at_timezone_name?: string;
	deleted_at_timezone_offset?: number;
}
