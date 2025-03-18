import z from 'zod';
import { getMessage } from '../../domain/helpers/get-message.helper';

export const findAllUserSchema = z.object({
	query: z.object({
		page: z.object(
			{
				number: z
					.string({
						required_error: getMessage('page.number.required'),
						invalid_type_error: getMessage('page.number.type'),
					})
					.transform((val, ctx) => {
						const parsed = parseInt(val, 10);
						if (Number.isNaN(parsed)) {
							ctx.addIssue({
								code: z.ZodIssueCode.custom,
								message: getMessage('page.number.type'),
							});

							return z.never;
						}

						return parsed;
					}),
				size: z
					.string({
						required_error: getMessage('page.size.required'),
						invalid_type_error: getMessage('page.size.type'),
					})
					.transform((val, ctx) => {
						const parsed = parseInt(val, 10);
						if (Number.isNaN(parsed)) {
							ctx.addIssue({
								code: z.ZodIssueCode.custom,
								message: getMessage('page.size.type'),
							});

							return z.never;
						}

						return parsed;
					}),
			},
			{
				required_error: getMessage('page.required'),
				invalid_type_error: getMessage('page.type'),
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
						required_error: getMessage('jsonapi.version.required'),
						invalid_type_error: getMessage('jsonapi.version.type'),
					}),
				})
				.optional(),
			data: z.object(
				{
					id: z.string().uuid(getMessage('data.id.format')).optional(),
					type: z
						.string({
							required_error: getMessage('data.type.required'),
						})
						.includes('users', {
							message: getMessage('data.type.pattern'),
						}),
					attributes: z.object({
						first_name: z.string({
							required_error: getMessage('data.attributes.first_name.required'),
						}),
						last_name: z.string().optional(),
						email: z
							.string({
								required_error: getMessage('data.attributes.email.required'),
							})
							.min(1, getMessage('data.attributes.email.minLength'))
							.email(getMessage('data.attributes.email.format')),
					}),
				},
				{
					required_error: getMessage('data.required'),
				}
			),
			links: z
				.object({
					self: z.string({
						required_error: getMessage('links.self.required'),
						invalid_type_error: getMessage('links.self.type'),
					}),
				})
				.optional(),
		},
		{
			required_error: getMessage('body.required'),
		}
	),
});

export const updateUserSchema = z.object({
	body: z
		.object({
			jsonapi: z
				.object({
					version: z.string({
						required_error: getMessage('jsonapi.version.required'),
						invalid_type_error: getMessage('jsonapi.version.type'),
					}),
				})
				.optional(),
			data: z.object(
				{
					id: z.string().uuid(getMessage('data.id.format')).optional(),
					type: z
						.string({
							required_error: getMessage('data.type.required'),
						})
						.includes('users', {
							message: getMessage('data.type.pattern'),
						}),
					attributes: z
						.object({
							first_name: z
								.string({
									invalid_type_error: getMessage(
										'data.attributes.first_name.type'
									),
								})
								.min(1, getMessage('data.attributes.first_name.minLength'))
								.optional(),
							last_name: z.string().optional(),
							nick_name: z.string().optional(),
							email: z
								.string({
									invalid_type_error: getMessage('data.attributes.email.type'),
								})
								.min(1, getMessage('data.attributes.email.minLength'))
								.email(getMessage('data.attributes.email.format'))
								.optional(),
						})
						.optional(),
				},
				{
					required_error: getMessage('data.required'),
				}
			),
			links: z
				.object({
					self: z.string({
						required_error: getMessage('links.self.required'),
						invalid_type_error: getMessage('links.self.type'),
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
						required_error: getMessage('jsonapi.version.required'),
						invalid_type_error: getMessage('jsonapi.version.type'),
					}),
				})
				.optional(),
			data: z.object(
				{
					id: z
						.string({ required_error: getMessage('data.id.required') })
						.uuid(getMessage('data.id.format')),
					type: z
						.string({
							required_error: getMessage('data.type.required'),
						})
						.includes('users', {
							message: getMessage('data.type.pattern'),
						}),
					attributes: z
						.object({
							first_name: z
								.string({
									invalid_type_error: getMessage(
										'data.attributes.first_name.type'
									),
								})
								.min(1, getMessage('data.attributes.first_name.minLength'))
								.optional(),
							last_name: z.string().optional(),
							nick_name: z.string().optional(),
							email: z
								.string({
									invalid_type_error: getMessage('data.attributes.email.type'),
								})
								.min(1, getMessage('data.attributes.email.minLength'))
								.email(getMessage('data.attributes.email.format'))
								.optional(),
						})
						.optional(),
				},
				{
					required_error: getMessage('data.required'),
				}
			),
			links: z
				.object({
					self: z.string({
						required_error: getMessage('links.self.required'),
						invalid_type_error: getMessage('links.self.type'),
					}),
				})
				.optional(),
		},
		{
			required_error: getMessage('body.required'),
		}
	),
});
