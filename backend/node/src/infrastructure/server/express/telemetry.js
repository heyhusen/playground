/* eslint-disable @typescript-eslint/no-var-requires */
const { NodeSDK } = require('@opentelemetry/sdk-node');
const { HttpInstrumentation } = require('@opentelemetry/instrumentation-http');
const { Resource } = require('@opentelemetry/resources');
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
const { diag, DiagConsoleLogger, DiagLogLevel } = require('@opentelemetry/api');
const { PinoInstrumentation } = require('@opentelemetry/instrumentation-pino');
const { KnexInstrumentation } = require('@opentelemetry/instrumentation-knex');
const { PgInstrumentation } = require('@opentelemetry/instrumentation-pg');

// diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);

const sdk = new NodeSDK({
	resource: new Resource({
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
		new KnexInstrumentation({
			maxQueryLength: 100,
		}),
		new PgInstrumentation(),
		new PinoInstrumentation(),
	],
});

sdk.start();
