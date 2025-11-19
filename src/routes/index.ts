import { FastifyInstance } from "fastify";
import orderRoutes from "./orders/routes/order.route";

export async function routes(fastify: FastifyInstance) {
  fastify.register(orderRoutes, { prefix: "/orders" });
}