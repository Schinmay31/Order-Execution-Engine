import Redis from "ioredis";
import { orderUpdateRouter } from "../../pubsub/orderUpdateRouter";
import { OrderQueue } from "../../queues/order.queue";
import OrderModel from "./order.model";
import orderRepo from "./order.repository";

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

    // cache order details in Redis for quick access
    await redisClient.hmset(`order:${orderId}`, {
      tokenIn: orderPayload.tokenIn,
      tokenOut: orderPayload.tokenOut,
      amount: orderPayload.amount.toString(),
      orderType: orderPayload.orderType || null,
      status: "pending",
    });

    //  Register this socket
    orderUpdateRouter.register(orderId, socket);

    //  Add job to queue
    await OrderQueue.add("execute_order", { orderId });

    //  Send immediate response

    publisher.publish(
      "order_updates",
      JSON.stringify({
        orderId: orderId,
        status: "pending",
      })
    );

    return order;
  }
}

export default orderService;
