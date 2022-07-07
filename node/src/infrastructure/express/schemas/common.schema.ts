import type { AllowedSchema } from 'express-json-validator-middleware';

export const idParamSchema: AllowedSchema = {
	type: 'object',
	properties: {
		id: {
			type: 'string',
			format: 'uuid',
		},
	},
	required: ['id'],
	errorMessage: {
		properties: {
			id: 'Validation failed (uuid v4 is expected).',
		},
	},
};
