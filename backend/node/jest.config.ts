import type { InitialOptionsTsJest } from 'ts-jest';

const config: InitialOptionsTsJest = {
	clearMocks: true,
	collectCoverage: true,
	coverageDirectory: 'coverage',
	coverageProvider: 'v8',
	// globalTeardown: './__tests__/teardown.ts',
	preset: 'ts-jest',
	testMatch: ['**/src/**/*.spec.ts', '**/__tests__/**/*.test.ts'],
};

// eslint-disable-next-line import/no-default-export
export default config;
