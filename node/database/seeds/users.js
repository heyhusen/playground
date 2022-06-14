// eslint-disable-next-line @typescript-eslint/no-var-requires
const { hash } = require('argon2');

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function seed(knex) {
	await knex('users').del();

	await knex('users').insert({
		name: 'John Doe',
		nickname: 'John',
		email: 'johndoe@example.com',
		email_verified_at: knex.fn.now(),
		password: await hash('abogoboga'),
	});
};
