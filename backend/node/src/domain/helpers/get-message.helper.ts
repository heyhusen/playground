import { MessageDictionaryEntity } from '../entities/message-dictionary.entity';

const errorMessage: MessageDictionaryEntity = {
	'page.required': 'The page property is required.',
	'page.type': 'The page property must be an object.',
	'page.number.required': 'The page.number property is required.',
	'page.size.required': 'The page.size property is required.',
	'page.number.type': 'The page.number property must be an integer.',
	'page.size.type': 'The page.size property must be an integer.',
	'data.required': 'The data property is required.',
	'jsonapi.version.required': 'The jsonapi.version property is required.',
	'jsonapi.version.type': 'The jsonapi.version property must be a string.',
	'links.self.required': 'The links.self property is required.',
	'links.self.type': 'The links.self property must be a string.',
	'data.type.required': 'The data.type property is required.',
	'data.id.format': 'The data.id property must be a UUID (version 4).',
	'data.type.pattern': `The data.type property must be 'users'`,
	'data.attributes.first_name.required':
		'The data.attributes.first_name property is required.',
	'data.attributes.email.required':
		'The data.attributes.email property is required.',
	'data.attributes.email.minLength':
		'The data.attributes.email property is required.',
	'data.attributes.email.format':
		'The data.attributes.email property must be a valid email address.',
	'data.attributes.first_name.type':
		'The data.attributes.first_name must be a string.',
	'data.attributes.first_name.minLength':
		'The data.attributes.first_name field must have a value.',
	'data.attributes.email.type': 'The data.attributes.email must be a string.',
	'email.unique': 'The email has already been taken.',
	'id.required': 'Validation failed (uuid v4 is expected).',
	'id.format': 'Validation failed (uuid v4 is expected).',
	'user.exist': 'The user is not found.',
	'data.id.required': 'The data.attributes.id property is required.',
	'body.required': 'The request body is required.',
	'params.id.required': 'An id parameter is expected.',
	'error.something.when.wrong': 'Something went wrong.',
};

export function getMessage(key: keyof MessageDictionaryEntity): string {
	return errorMessage[key];
}
