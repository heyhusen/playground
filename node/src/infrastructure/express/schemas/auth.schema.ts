import type { AllowedSchema } from 'express-json-validator-middleware';

export const logInSchema: AllowedSchema = {
	type: 'object',
	properties: {
		username: {
			type: 'string',
			minLength: 1,
		},
		password: {
			type: 'string',
			minLength: 1,
		},
	},
	required: ['username', 'password'],
	errorMessage: {
		required: {
			username: 'The username is required.',
			password: 'The password is required.',
		},
		properties: {
			username: 'The username is required.',
			password: 'The password is required.',
		},
	},
};
