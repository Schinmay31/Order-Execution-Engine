import { FastifyInstance, FastifyPluginAsync } from "fastify";
import orderService from "./order.service";
import { validateOrderPayload } from "./order.validator";
import { WebSocket } from "@fastify/websocket";

const orderRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  // WebSocket route
  fastify.get("/execute", { websocket: true }, (socket:WebSocket, req) => {
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
        let orderPayload;
        try {
          // Parse incoming message
          orderPayload = JSON.parse(raw.toString());
        } catch (e) {
          socket.send(JSON.stringify({ error: "Invalid JSON" }));
          return;
        }

        // Validate payload
        const error = validateOrderPayload(orderPayload);

        if (error) {
          socket.send(JSON.stringify({ status: "error", message: error }));
          return;
        }

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
