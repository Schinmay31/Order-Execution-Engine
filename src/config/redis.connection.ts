import Redis from 'ioredis';
import DOT_ENV from '../config-env';

  class initializeRedis {
    private opts: any = { maxRetriesPerRequest: 3, enableReadyCheck: true };
    async initializeRedisClient(): Promise<Redis> {
      const redisClient = new Redis(
        DOT_ENV.REDIS_URL || "redis://localhost:6379",
        this.opts
      );
      redisClient.on("connect", () => {
        console.log("Redis client connected successfully");
      });

      redisClient.on("error", (err) => {
        console.error("Redis error:", err);
      });

      return redisClient;
    }

    async redisPublisher(): Promise<Redis> {
      const redisPublisher = new Redis(
        DOT_ENV.REDIS_URL || "redis://localhost:6379",
        this.opts
      );

      redisPublisher.on("connect", () => {
        console.log("Redis publisher connected successfully");
      });

      redisPublisher.on("error", (err) => {
        console.error("Redis publisher error:", err);
      });

      return redisPublisher;
    }

    async redisSubscriber(): Promise<Redis> {
      const redisSubscriber = new Redis(
        DOT_ENV.REDIS_URL || "redis://localhost:6379",
        this.opts
      );
      redisSubscriber.on("connect", () => {
        console.log("Redis subscriber connected successfully");
      });

      redisSubscriber.on("error", (err) => {
        console.error("Redis subscriber error:", err);
      });
      return redisSubscriber;
    }
  }

  export const redisConnection = new initializeRedis();
