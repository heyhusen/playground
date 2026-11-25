import z from 'zod';
import { getMessage } from '../../domain/helpers/get-message.helper.js';

export const idParamSchema = z.object({
	params: z.object({
		id: z.uuid({
			version: 'v7',
			error: (issue) => {
				if (issue.input === undefined) {
					return getMessage('id.required');
				}

				return getMessage('id.format');
			},
		}),
	}),
});
