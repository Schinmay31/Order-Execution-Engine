import "fastify";
import Redis from "ioredis";

declare module "fastify" {
  interface FastifyInstance {
    redisClient: Redis;
    redisPublisher: Redis;
    redisSubscriber: Redis;
  }
}
