import Redis from 'ioredis';
import DOT_ENV from '../config-env';

export const connectToRedis = (): Redis => {
    const redis = new Redis(DOT_ENV.REDIS_URL || 'redis://localhost:6379', {
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    });

    redis.on('connect', () => {
      console.log('Redis connected successfully');
    });

    redis.on('error', (err) => {
      console.error('Redis error:', err);
    });

    return redis;
  }