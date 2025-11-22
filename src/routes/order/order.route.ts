import { FastifyInstance } from "fastify";

export default async function orderRoutes(fastify: FastifyInstance) {
  fastify.post("/execute", async (request, reply) => {
    fastify.redisClient.publish("order_updates", "Order executed");
    return { message: "execute OK" };
  });

}