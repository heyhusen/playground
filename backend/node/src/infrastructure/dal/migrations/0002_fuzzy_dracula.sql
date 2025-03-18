ALTER TABLE "users" ADD COLUMN "version" bigint DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "cursor" bigserial NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "delete_at" bigint;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "delete_at_timezone_name" varchar(20);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "delete_at_timezone_offset" integer;