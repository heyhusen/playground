import type { IBaseCacheService } from '../../domain/base/interfaces/base-cache-service.interface';
import { redis } from '../ports/redis';

export const redisService: IBaseCacheService = {
	set: async (key: string, data: string, ttl?: number) => {
		if (ttl) {
			await redis.set(key, data, 'PX', ttl);
		} else {
			await redis.set(key, data, 'KEEPTTL');
		}
	},

	get: async (key: string) => {
		const result = await redis.get(key);

		if (!result) {
			return null;
		}

		return result;
	},

	del: async (key: string) => {
		await redis.del(key);
	},
};
