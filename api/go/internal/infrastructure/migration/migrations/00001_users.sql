-- +goose Up
CREATE TABLE users (
    id uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
    version bigint NOT NULL DEFAULT 1,
    cursor bigserial NOT NULL,
    first_name varchar(256) NOT NULL,
    last_name varchar(256),
    nickname varchar(256),
    email varchar(256) NOT NULL UNIQUE,
    created_at bigint NOT NULL,
    updated_at bigint NOT NULL,
    created_at_timezone_name varchar(20) NOT NULL,
    created_at_timezone_offset integer NOT NULL,
    updated_at_timezone_name varchar(20) NOT NULL,
    updated_at_timezone_offset integer NOT NULL,
    delete_at bigint,
    delete_at_timezone_name varchar(20),
    delete_at_timezone_offset integer
);

-- +goose Down
DROP TABLE users;
