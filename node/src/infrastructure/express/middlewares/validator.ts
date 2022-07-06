import ajvErrors from 'ajv-errors';
import { Validator } from 'express-json-validator-middleware';
import addFormats from 'ajv-formats';

const validator = new Validator({ allErrors: true, $data: true });

const { ajv } = validator;

addFormats(ajv, ['email']);

ajvErrors(ajv);

export { validator };
