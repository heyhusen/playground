/** @type {import('jest').Config} */
const config = {
	clearMocks: true,
	collectCoverage: true,
	coverageDirectory: 'coverage',
	coverageProvider: 'v8',
	setupFiles: ['dotenv/config'],
	// globalSetup: './__tests__/setup.ts',
	// globalTeardown: './__tests__/teardown.ts',
	// The Express and Fastify integration suites reset and seed the same
	// database, so they must not run in parallel workers.
	maxWorkers: 1,
	testMatch: ['**/src/**/*.spec.ts', '**/__tests__/**/*.test.ts'],
	transform: {
		'^.+\\.(t|j)sx?$': '@swc/jest',
	},
};

module.exports = config;
