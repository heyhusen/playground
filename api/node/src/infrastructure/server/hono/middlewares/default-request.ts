import type { Context, Next } from 'hono';
import { getHeaders } from '../helpers/request.js';

export function defaultRequest() {
	return async (context: Context, next: Next) => {
		const headers = getHeaders(context);

		Object.assign(headers, {
			timezone_name: headers.timezone_name ?? 'Asia/Jakarta',
			timezone_offset: headers.timezone_offset ?? 7,
			idempotency_key:
				(headers as unknown as Headers).get('idempotency-key') ?? undefined,
		});

		await next();
	};
}
