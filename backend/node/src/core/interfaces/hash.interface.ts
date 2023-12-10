export interface HashService {
	create: (plain: string) => Promise<string>;
	verify: (hash: string, plain: string) => Promise<boolean>;
}
