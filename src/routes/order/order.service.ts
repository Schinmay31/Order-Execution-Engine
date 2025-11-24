import Redis from "ioredis";
import { orderUpdateRouter } from "../../pubsub/orderUpdateRouter";
import { OrderQueue } from "../../queues/order.queue";
import orderRepo from "./order.repository";
import { OrderStatus } from "./order.constants";
import { WebSocket } from "@fastify/websocket";
import { logInfo,logSuccess} from "../../utils/logger";

class orderService {
  static async createOrder(
    orderPayload: {
      tokenIn: string;
      tokenOut: string;
      amount: number;
      orderType: string;
    },
    socket: WebSocket,
    publisher: Redis,
    redisClient: Redis
  ) {
    //  Create order in Postgres
    const order = await orderRepo.createOrder(orderPayload);
    const orderId = order.id;

    logInfo(`Order created`, orderId);

    // cache order details in Redis for quick access
    await redisClient.hmset(`order:${orderId}`, {
      tokenIn: orderPayload.tokenIn,
      tokenOut: orderPayload.tokenOut,
      amount: orderPayload.amount.toString(),
      orderType: orderPayload.orderType || null,
      status: "pending",
    });

    logInfo(`Order cached in Redis`, orderId);

    //  Register this socket
    orderUpdateRouter.register(orderId, socket);

    //  Add job to queue
    await OrderQueue.add("execute_order", { orderId });

    logInfo(`Order added to queue`, orderId);

    //  publish initial order update
    publisher.publish(
      "order_updates",
      JSON.stringify({
        orderId: orderId,
        status: OrderStatus.PENDING,
      })
    );

    return order;
  }

  static async createLogs(orderId: string) {}
}

export default orderService;
