import { FastifyInstance, FastifyPluginAsync } from "fastify";
import orderRepo from "./order.repository";
import { orderUpdateRouter } from "../../pubsub/orderUpdateRouter";
import { OrderQueue } from "../../queues/order.queue";
import orderService from "./order.service";

const orderRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  // WebSocket route
  fastify.get("/execute", { websocket: true }, (socket, req) => {
    console.log(
      "New websocket connection to /execute",
      req.ip || req.headers["x-forwarded-for"] || req.socket.remoteAddress
    );

    // Send initial connection confirmation
    socket.send(
      JSON.stringify({
        status: "connected",
        timestamp: new Date().toISOString(),
      })
    );

    socket.on("message", async (raw: any) => {
      try {
        const orderPayload = JSON.parse(raw.toString());
        await orderService.createOrder(
          orderPayload,
          socket,
          fastify.redisPublisher,
          fastify.redisClient
        );
      } catch (err) {
        console.error("Error processing websocket message:", err);
        socket.send(
          JSON.stringify({
            error: "processing_error",
            message: err instanceof Error ? err.message : "Unknown error",
          })
        );
      }
    });

    socket.on("error", (error: any) => {
      console.error("WebSocket error:", error);
    });

    socket.on("close", (code: any, reason: any) => {
      console.log(
        `Websocket connection closed for /execute - Code: ${code}, Reason: ${reason}`
      );
      // Cleanup logic here
    });
  });
};

export default orderRoutes;
