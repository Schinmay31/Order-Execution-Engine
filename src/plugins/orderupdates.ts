import { FastifyInstance } from "fastify";
import { orderUpdateRouter } from '../pubsub/orderUpdateRouter';

export async function orderUpdatesPlugin(fastify: FastifyInstance) {
  const subscriberRedis = fastify.redisSubscriber;

  await subscriberRedis.subscribe("order_updates");

  subscriberRedis.on("message", (channel, message) => {
    if (channel !== "order_updates") return;

    const data = JSON.parse(message);
    const { orderId, status, payload } = data;

    orderUpdateRouter.sendUpdate(orderId, { status, payload });
  });
}