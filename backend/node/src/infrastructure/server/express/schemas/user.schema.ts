import type { AllowedSchema } from 'express-json-validator-middleware';

export const createUserSchema: AllowedSchema = {
	type: 'object',
	properties: {
		jsonapi: {
			type: 'object',
			properties: {
				version: {
					type: 'string',
					errorMessage: {
						type: 'The JSON:API version must be a string.',
					},
				},
			},
			required: ['version'],
			errorMessage: {
				required: {
					version: 'The JSON:API version is required.',
				},
			},
		},
		data: {
			type: 'object',
			properties: {
				id: {
					type: 'string',
					format: 'uuid',
					errorMessage: {
						format: 'The data.id property must be a UUID (version 4).',
					},
				},
				type: {
					type: 'string',
					pattern: 'users',
					errorMessage: {
						pattern: `The data.type property must be 'users'`,
					},
				},
				attributes: {
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
								minLength: 'The data.attributes.email property is required.',
								format:
									'The data.attributes.email property must be a valid email address.',
							},
						},
					},
					required: ['first_name', 'email'],
					errorMessage: {
						required: {
							first_name:
								'The data.attributes.first_name property is required.',
							email: 'The data.attributes.email property is required.',
						},
						properties: {
							first_name:
								'The data.attributes.first_name property is required.',
						},
					},
				},
			},
			required: ['type'],
			errorMessage: {
				required: {
					type: 'The data.type property is required.',
				},
			},
		},
		links: {
			type: 'object',
			properties: {
				self: {
					type: 'string',
					errorMessage: {
						type: 'The links.self property must be a string.',
					},
				},
			},
			required: ['self'],
			errorMessage: {
				required: {
					self: 'The links.self property is required.',
				},
			},
		},
	},
	required: ['data'],
	errorMessage: {
		required: {
			data: 'The data property is required.',
		},
	},
};

export const updateUserSchema: AllowedSchema = {
	type: 'object',
	properties: {
		jsonapi: {
			type: 'object',
			properties: {
				version: {
					type: 'string',
					errorMessage: {
						type: 'The JSON:API version must be a string.',
					},
				},
			},
			required: ['version'],
			errorMessage: {
				required: {
					version: 'The JSON:API version is required.',
				},
			},
		},
		data: {
			type: 'object',
			properties: {
				id: {
					type: 'string',
					format: 'uuid',
					errorMessage: {
						format: 'The data.id property must be a UUID (version 4).',
					},
				},
				type: {
					type: 'string',
					pattern: 'users',
					errorMessage: {
						pattern: `The data.type property must be 'users'`,
					},
				},
				attributes: {
					type: 'object',
					properties: {
						first_name: {
							type: 'string',
							minLength: 1,
							errorMessage: {
								type: 'The data.attributes.first_name must be a string.',
								minLength:
									'The data.attributes.first_name field must have a value.',
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
								type: 'The data.attributes.email must be a string.',
								format:
									'The data.attributes.email must be a valid email address.',
							},
						},
					},
				},
			},
			required: ['type'],
			errorMessage: {
				required: {
					type: 'The data.type property is required.',
				},
			},
		},
		links: {
			type: 'object',
			properties: {
				self: {
					type: 'string',
					errorMessage: {
						type: 'The links.self property must be a string.',
					},
				},
			},
			required: ['self'],
			errorMessage: {
				required: {
					self: 'The links.self property is required.',
				},
			},
		},
	},
	required: ['data'],
	dependencies: {},
	errorMessage: {
		required: {
			data: 'The data property is required.',
		},
		dependencies: {},
	},
};
