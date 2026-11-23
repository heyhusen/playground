import { faker } from '@faker-js/faker';
import { getMessage } from '../../../../helpers/get-message.helper';
import { validateUuid } from './validate-uuid.use-case';

describe(validateUuid.name, () => {
	test('should throw error if uuid is invalid', () => {
		expect(() => {
			validateUuid('invalid-uuid');
		}).toThrow(new Error(getMessage('id.format')));
	});

	test('should return true if uuid is valid', () => {
		expect<ReturnType<typeof validateUuid>>(
			validateUuid(faker.string.uuid())
		).toStrictEqual<boolean>(true);
	});
});
