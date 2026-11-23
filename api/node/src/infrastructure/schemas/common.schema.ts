import z from 'zod';
import { getMessage } from '../../domain/helpers/get-message.helper';

export const idParamSchema = z.object({
	params: z.object({
		id: z
			.string({
				error: () => {
					return getMessage('id.required');
				},
			})
			.uuid(getMessage('id.format')),
	}),
});
