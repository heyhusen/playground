import { faker } from '@faker-js/faker';
import { BaseUserEntity, UserEntity } from '../../entities/user.entity';
import { ICreateUserDTO } from '../../interfaces/user-dto.interface';

export const mockedDto: ICreateUserDTO = {
	id: faker.string.uuid(),
	version: 1,
	cursor: 1,
	first_name: faker.person.firstName(),
	email: faker.internet.email(),
	created_at: Number(faker.date.recent()),
	created_at_timezone_name: 'Asia/Jakarta',
	created_at_timezone_offset: 7,
	updated_at: Number(faker.date.recent()),
	updated_at_timezone_name: 'Asia/Jakarta',
	updated_at_timezone_offset: 7,
};

export const mockedUser: UserEntity = {
	id: faker.string.uuid(),
	version: 1,
	cursor: 2,
	first_name: mockedDto.first_name,
	last_name: String(mockedDto.last_name),
	nickname: null,
	email: mockedDto.email,
	created_at: Number(faker.date.recent()),
	created_at_timezone_name: 'Asia/Jakarta',
	created_at_timezone_offset: 7,
	updated_at: Number(faker.date.recent()),
	updated_at_timezone_name: 'Asia/Jakarta',
	updated_at_timezone_offset: 7,
};

export const mockedTestUser: BaseUserEntity = {
	first_name: faker.person.firstName(),
	last_name: faker.person.lastName(),
	email: faker.internet.email(),
};
