export interface IBaseCacheService {
	set: (key: string, data: string, ttl?: number) => Promise<void>;
	get: (key: string) => Promise<string | null>;
	del: (key: string) => Promise<void>;
}
