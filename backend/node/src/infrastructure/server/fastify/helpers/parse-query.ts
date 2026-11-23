type QueryValue = string | QueryValue[] | { [key: string]: QueryValue };

/**
 * Matches Express' `extended` query parser so bracket notation such as
 * `page[number]=1&filter[first_name]=John` becomes a nested object.
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
