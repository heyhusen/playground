CREATE TABLE "users" (
	"id" uuid PRIMARY KEY NOT NULL,
	"created_at" bigint NOT NULL,
	"updated_at" bigint NOT NULL,
	"created_at_timezone_name" varchar(20) NOT NULL,
	"created_at_timezone_offset" integer NOT NULL,
	"updated_at_timezone_name" varchar(20) NOT NULL,
	"updated_at_timezone_offset" integer NOT NULL,
	"first_name" varchar(256) NOT NULL,
	"last_name" varchar(256),
	"nickname" varchar(256),
	"email" varchar(256) NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
