import { FastifyInstance } from "fastify";

export default async function orderRoutes(fastify: FastifyInstance) {
  fastify.post("/execute", async (request, reply) => {
    return { message: "execute OK" };
  });

}