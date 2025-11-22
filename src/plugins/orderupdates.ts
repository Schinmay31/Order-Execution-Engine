import { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import { orderUpdateRouter } from "../pubsub/orderUpdateRouter";

async function orderUpdatesPlugin(fastify: FastifyInstance) {
  const subscriberRedis = fastify.redisSubscriber;

  if (!subscriberRedis) {
    fastify.log.error("Redis Subscriber decorator missing");
    return;
  }

  await subscriberRedis.subscribe("order_updates");

  subscriberRedis.on("message", (channel, message) => {
    const data = JSON.parse(message);
    const { orderId, status, payload } = data;

    orderUpdateRouter.sendUpdate(orderId, { orderId, status, payload });
  });

  subscriberRedis.on("error", (err: any) => {
    fastify.log.error("Redis subscriber error:", err);
  });
}

export default fp(orderUpdatesPlugin);
