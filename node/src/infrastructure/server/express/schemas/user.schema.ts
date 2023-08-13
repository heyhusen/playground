import type { AllowedSchema } from 'express-json-validator-middleware';

export const createUserSchema: AllowedSchema = {
	type: 'object',
	properties: {
		name: {
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
		password: {
			type: 'string',
			minLength: 8,
			errorMessage: {
				minLength: 'The password must be at least 8 characters.',
			},
		},
		password_confirmation: {
			type: 'string',
			minLength: 8,
			const: {
				$data: '1/password',
			},
			errorMessage: {
				minLength: 'The password confirmation must be at least 8 characters.',
				const: 'The password confirmation does not match.',
			},
		},
	},
	required: ['name', 'email', 'password', 'password_confirmation'],
	errorMessage: {
		required: {
			name: 'The name is required.',
			email: 'The email is required.',
			password: 'The password is required.',
			password_confirmation: 'The password confirmation is required.',
		},
		properties: {
			name: 'The name is required.',
		},
	},
};

export const updateUserSchema: AllowedSchema = {
	type: 'object',
	properties: {
		name: {
			type: 'string',
			minLength: 1,
			errorMessage: {
				type: 'The name must be a string.',
				minLength: 'The name field must have a value.',
			},
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
		password: {
			type: 'string',
			minLength: 8,
			errorMessage: {
				type: 'The password must be a string.',
				minLength: 'The password must be at least 8 characters.',
			},
		},
		password_confirmation: {
			type: 'string',
			minLength: 8,
			const: {
				$data: '1/password',
			},
			errorMessage: {
				type: 'The password confirmation must be a string.',
				minLength: 'The password confirmation must be at least 8 characters.',
				const: 'The password confirmation does not match.',
			},
		},
	},
	dependencies: {
		password: ['password_confirmation'],
		password_confirmation: ['password'],
	},
	errorMessage: {
		dependencies: {
			password:
				'The password confirmation field is required when password is present.',
			password_confirmation:
				'The password field is required when password confirmation is present.',
		},
	},
};
