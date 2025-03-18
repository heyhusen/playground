/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable import/no-default-export */
const { defineConfig } = require('drizzle-kit');

export default defineConfig({
	dialect: 'postgresql',
	schema: './src/infrastructure/dal/schemas/*',
	out: './src/infrastructure/dal/migrations',

	dbCredentials: {
		host: process.env.DB_HOST || 'postgres',
		port: process.env.DB_PORT
			? parseInt(String(process.env.DB_PORT), 10)
			: 5432,
		user: process.env.DB_USERNAME || 'postgres',
		password: process.env.DB_PASSWORD || 'postgres',
		database: process.env.DB_DATABASE || 'postgres',
		ssl: false,
	},

	migrations: {
		schema: 'public',
	},
});
