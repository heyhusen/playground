import { Redis } from 'ioredis';
import { redisConfig } from '../config/redis.js';

export const redis = new Redis(redisConfig);
