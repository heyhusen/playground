import { createRequire } from 'node:module';

// The OpenTelemetry packages only expose a working CommonJS build; their ESM
// entrypoint fails to import named exports from @opentelemetry/api on Node.
const require = createRequire(import.meta.url);
const { NodeSDK } = require('@opentelemetry/sdk-node');
const { HttpInstrumentation } = require('@opentelemetry/instrumentation-http');
const { resourceFromAttributes } = require('@opentelemetry/resources');
const {
	ATTR_SERVICE_NAME,
	ATTR_SERVICE_VERSION,
} = require('@opentelemetry/semantic-conventions');
const {
	ExpressInstrumentation,
} = require('@opentelemetry/instrumentation-express');
const { PeriodicExportingMetricReader } = require('@opentelemetry/sdk-metrics');
const {
	OTLPTraceExporter,
} = require('@opentelemetry/exporter-trace-otlp-grpc');
const {
	OTLPMetricExporter,
} = require('@opentelemetry/exporter-metrics-otlp-grpc');
const { PinoInstrumentation } = require('@opentelemetry/instrumentation-pino');
const { PgInstrumentation } = require('@opentelemetry/instrumentation-pg');

const sdk = new NodeSDK({
	resource: resourceFromAttributes({
		[ATTR_SERVICE_NAME]: 'playground',
		[ATTR_SERVICE_VERSION]: '0.1.0',
	}),
	traceExporter: new OTLPTraceExporter(),
	metricReader: new PeriodicExportingMetricReader({
		exporter: new OTLPMetricExporter(),
	}),
	instrumentations: [
		new HttpInstrumentation(),
		new ExpressInstrumentation(),
		new PgInstrumentation(),
		new PinoInstrumentation(),
	],
});

sdk.start();
