import z from 'zod';
import { getMessage } from '../../domain/helpers/get-message.helper';

export const findAllUserSchema = z.object({
	query: z.object({
		page: z.object(
			{
				number: z
					.string({
						error: (issue) => {
							if (issue.input === undefined) {
								return getMessage('page.number.required');
							}

							return getMessage('page.number.type');
						},
					})
					.transform((val, ctx) => {
						const parsed = parseInt(val, 10);
						if (Number.isNaN(parsed)) {
							ctx.addIssue({
								code: 'custom',
								message: getMessage('page.number.type'),
							});

							return z.never;
						}

						return parsed;
					}),
				size: z
					.string({
						error: (issue) => {
							if (issue.input === undefined) {
								return getMessage('page.size.required');
							}

							return getMessage('page.size.type');
						},
					})
					.transform((val, ctx) => {
						const parsed = parseInt(val, 10);
						if (Number.isNaN(parsed)) {
							ctx.addIssue({
								code: 'custom',
								message: getMessage('page.size.type'),
							});

							return z.never;
						}

						return parsed;
					}),
			},
			{
				error: (issue) => {
					if (issue.input === undefined) {
						return getMessage('page.required');
					}

					return getMessage('page.type');
				},
			}
		),
	}),
});

export const createUserSchema = z.object({
	body: z.object(
		{
			jsonapi: z
				.object({
					version: z.string({
						error: (issue) => {
							if (issue.input === undefined) {
								return getMessage('jsonapi.version.required');
							}

							return getMessage('jsonapi.version.type');
						},
					}),
				})
				.optional(),
			data: z.object(
				{
					id: z.uuid(getMessage('data.id.format')).optional(),
					type: z.string(getMessage('data.type.required')).includes('users', {
						message: getMessage('data.type.pattern'),
					}),
					attributes: z.object({
						first_name: z.string(
							getMessage('data.attributes.first_name.required')
						),
						last_name: z.string().optional(),
						email: z
							.email({
								error: (issue) => {
									if (issue.input === undefined) {
										return getMessage('data.attributes.email.format');
									}

									return getMessage('data.attributes.email.format');
								},
							})
							.min(1, getMessage('data.attributes.email.minLength')),
					}),
				},
				getMessage('data.required')
			),
			links: z
				.object({
					self: z.string({
						error: (issue) => {
							if (issue.input === undefined) {
								return getMessage('links.self.required');
							}

							return getMessage('links.self.type');
						},
					}),
				})
				.optional(),
		},
		getMessage('body.required')
	),
});

export const updateUserSchema = z.object({
	body: z
		.object({
			jsonapi: z
				.object({
					version: z.string({
						error: (issue) => {
							if (issue.input === undefined) {
								return getMessage('jsonapi.version.required');
							}

							return getMessage('jsonapi.version.type');
						},
					}),
				})
				.optional(),
			data: z.object(
				{
					id: z.string().uuid(getMessage('data.id.format')).optional(),
					type: z.string(getMessage('data.type.required')).includes('users', {
						message: getMessage('data.type.pattern'),
					}),
					attributes: z
						.object({
							first_name: z
								.string(getMessage('data.attributes.first_name.type'))
								.min(1, getMessage('data.attributes.first_name.minLength'))
								.optional(),
							last_name: z.string().optional(),
							nick_name: z.string().optional(),
							email: z
								.email({
									error: (issue) => {
										if (issue.input === undefined) {
											return getMessage('data.attributes.email.type');
										}

										return getMessage('data.attributes.email.format');
									},
								})
								.min(1, getMessage('data.attributes.email.minLength'))
								.optional(),
						})
						.optional(),
				},
				{
					error: getMessage('data.required'),
				}
			),
			links: z
				.object({
					self: z.string({
						error: (issue) => {
							if (issue.input === undefined) {
								return getMessage('links.self.required');
							}

							return getMessage('links.self.type');
						},
					}),
				})
				.optional(),
		})
		.optional(),
});

export const compatUpdateUserSchema = z.object({
	body: z.object(
		{
			jsonapi: z
				.object({
					version: z.string({
						error: (issue) => {
							if (issue.input === undefined) {
								return getMessage('jsonapi.version.required');
							}

							return getMessage('jsonapi.version.type');
						},
					}),
				})
				.optional(),
			data: z.object(
				{
					id: z.uuid({
						error: (issue) => {
							if (issue.input === undefined) {
								return getMessage('data.id.required');
							}

							return getMessage('data.id.format');
						},
					}),
					type: z.string(getMessage('data.type.required')).includes('users', {
						message: getMessage('data.type.pattern'),
					}),
					attributes: z
						.object({
							first_name: z
								.string(getMessage('data.attributes.first_name.type'))
								.min(1, getMessage('data.attributes.first_name.minLength'))
								.optional(),
							last_name: z.string().optional(),
							nick_name: z.string().optional(),
							email: z
								.email({
									error: (issue) => {
										if (typeof issue.input !== 'string') {
											return getMessage('data.attributes.email.type');
										}

										return getMessage('data.attributes.email.format');
									},
								})
								.min(1, getMessage('data.attributes.email.minLength'))
								.optional(),
						})
						.optional(),
				},
				getMessage('data.required')
			),
			links: z
				.object({
					self: z.string({
						error: (issue) => {
							if (issue.input === undefined) {
								return getMessage('links.self.required');
							}

							return getMessage('links.self.type');
						},
					}),
				})
				.optional(),
		},
		getMessage('body.required')
	),
});
