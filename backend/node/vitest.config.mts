import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		globals: true,
		environment: 'node',
		setupFiles: ['dotenv/config'],
		include: ['src/**/*.spec.ts', '**/__tests__/**/*.test.ts'],
		clearMocks: true,
		// The server integration suites reset and seed the same database.
		fileParallelism: false,
		coverage: {
			enabled: true,
			provider: 'v8',
			reportsDirectory: 'coverage',
			reporter: ['text', 'html', 'lcov'],
			include: ['src/**/*.ts'],
			exclude: ['src/**/*.spec.ts', 'src/**/__tests__/**', 'src/**/*.mock.ts'],
		},
	},
});
