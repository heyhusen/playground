import { hash, verify } from 'argon2';
import type { HashService } from '../../core/interfaces/hash.interface';

export const hashService: HashService = {
	create: async (plain: string) => {
		const hashed = await hash(plain);

		return hashed;
	},

	verify: async (hashed: string, plain: string) => {
		const isValid = await verify(hashed, plain);

		return isValid;
	},
};
