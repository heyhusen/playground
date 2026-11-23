/* eslint-disable @typescript-eslint/no-var-requires */
const { NodeSDK } = require('@opentelemetry/sdk-node');
const { HttpInstrumentation } = require('@opentelemetry/instrumentation-http');
const { resourceFromAttributes } = require('@opentelemetry/resources');
const {
	ATTR_SERVICE_NAME,
	ATTR_SERVICE_VERSION,
} = require('@opentelemetry/semantic-conventions');
const { PeriodicExportingMetricReader } = require('@opentelemetry/sdk-metrics');
const {
	OTLPTraceExporter,
} = require('@opentelemetry/exporter-trace-otlp-grpc');
const {
	OTLPMetricExporter,
} = require('@opentelemetry/exporter-metrics-otlp-grpc');
const { PinoInstrumentation } = require('@opentelemetry/instrumentation-pino');
const { KnexInstrumentation } = require('@opentelemetry/instrumentation-knex');
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
		new KnexInstrumentation({
			maxQueryLength: 100,
		}),
		new PgInstrumentation(),
		new PinoInstrumentation(),
	],
});

sdk.start();
