type QueryValue = string | QueryValue[] | { [key: string]: QueryValue };

/**
 * Hono exposes raw search params; this parser restores the `extended` style
 * used by the other servers: `page[number]=1` -> `{ page: { number: '1' } }`.
 */
export function parseQuery(querystring: string): Record<string, QueryValue> {
	const query: Record<string, QueryValue> = {};

	Array.from(new URLSearchParams(querystring)).forEach(([key, value]) => {
		const segments = key.match(/[^[\]]+/g);

		if (segments) {
			let target = query;

			segments.forEach((segment, index) => {
				if (index === segments.length - 1) {
					const current = target[segment];

					if (current === undefined) {
						target[segment] = value;
					} else if (Array.isArray(current)) {
						current.push(value);
					} else {
						target[segment] = [current, value];
					}

					return;
				}

				const next = target[segment];

				if (typeof next !== 'object' || next === null || Array.isArray(next)) {
					target[segment] = {};
				}

				target = target[segment] as Record<string, QueryValue>;
			});
		}
	});

	return query;
}
