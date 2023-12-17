import type { AllowedSchema } from 'express-json-validator-middleware';

export const createUserSchema: AllowedSchema = {
	type: 'object',
	properties: {
		first_name: {
			type: 'string',
			minLength: 1,
		},
		last_name: {
			type: 'string',
			minLength: 1,
		},
		email: {
			type: 'string',
			minLength: 1,
			format: 'email',
			errorMessage: {
				minLength: 'The email is required.',
				format: 'The email must be a valid email address.',
			},
		},
	},
	required: ['first_name', 'email'],
	errorMessage: {
		required: {
			first_name: 'The first name is required.',
			email: 'The email is required.',
		},
		properties: {
			first_name: 'The first name is required.',
		},
	},
};

export const updateUserSchema: AllowedSchema = {
	type: 'object',
	properties: {
		first_name: {
			type: 'string',
			minLength: 1,
			errorMessage: {
				type: 'The first name must be a string.',
				minLength: 'The first name field must have a value.',
			},
		},
		last_name: {
			type: 'string',
			nullable: true,
		},
		nickname: {
			type: 'string',
			nullable: true,
		},
		email: {
			type: 'string',
			format: 'email',
			errorMessage: {
				type: 'The email must be a string.',
				format: 'The email must be a valid email address.',
			},
		},
	},
	dependencies: {},
	errorMessage: {
		dependencies: {},
	},
};
