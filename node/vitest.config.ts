// eslint-disable-next-line import/no-extraneous-dependencies
import { defineConfig } from 'vitest/config';

const config = defineConfig({
	test: {
		clearMocks: true,
		include: ['**/src/**/*.spec.ts', '**/__tests__/**/*.test.ts'],
	},
});

// eslint-disable-next-line import/no-default-export
export default config;
